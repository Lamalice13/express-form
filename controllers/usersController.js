const usersStorage = require("../storages/usersStorage");
const {
  body,
  validationResult,
  matchedData,
  query,
  oneOf,
} = require("express-validator");
const db = require("../db/queries");

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 10 characters.";

const validateUser = [
  body("firstName")
    .trim()
    .isAlpha()
    .withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`First name ${lengthErr}`),

  body("lastName")
    .trim()
    .isAlpha()
    .withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`Last name ${lengthErr}`),

  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .normalizeEmail(),

  body("age")
    .isISO8601()
    .withMessage(`Date should be in date format.`)
    .toDate()
    .custom((value) => {
      const today = new Date();
      const age = today.getFullYear() - value.getFullYear();
      if (age < 18) {
        throw new Error("Must be 18 years old");
      }
      return true;
    }),

  body("bio")
    .optional({ values: "falsy" })
    .isLength({ max: 200 })
    .withMessage(`Bio is max 200 characters.`),
];

exports.getUserId = (req, res, next, id) => {
  req.userId = req.params.id;
  next();
};

exports.usersListGet = async (req, res, next) => {
  try {
    const users = await db.getAllUsers();
    res.render("index", {
      title: "User list",
      users,
    });
  } catch (err) {
    next(err);
  }
};

exports.usersCreateGet = (req, res) => {
  res.render("createUser", {
    title: "Create user",
  });
};

exports.usersCreatePost = [
  validateUser,
  body("email").custom(async (value) => {
    const user = await db.findUserByEmail(value);
    if (user.length > 0) {
      throw new Error("Email already in use");
    }
  }),
  async (req, res, next) => {
    const errors = validationResult(req);
    const { firstName, lastName, email, age, bio } = matchedData(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("createUser", {
        title: "Create user",
        errors: errors.array(),
        users: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          age: req.body.age,
          bio: req.body.bio,
        },
      });
    }
    try {
      await db.insertUser(firstName, lastName, email, age, bio);
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  },
];

exports.usersUpdateGet = async (req, res, next) => {
  try {
    const user = await db.getUserById(req.userId);
    res.render("updateUser", {
      title: "Update user",
      user: user[0],
    });
  } catch (err) {
    next(err);
  }
};

exports.usersUpdatePost = [
  validateUser,
  body("email").custom(async (value, { req, res, next }) => {
    const user = await db.getUsersByEmail(value);

    if (user.length > 0 && user[0].id != req.userId) {
      throw new Error("Email already in use");
    }
  }),
  async (req, res, next) => {
    const errors = validationResult(req);
    const { firstName, lastName, email, age, bio } = matchedData(req);

    if (!errors.isEmpty()) {
      try {
        const user = await db.getUserById(req.userId);
        return res.status(400).render("updateUser", {
          title: "Update user",
          user: user[0],
          errors: errors.array(),
        });
      } catch (err) {
        next(err);
      }
    }

    try {
      await db.updateUser(req.userId, firstName, lastName, email, age, bio);
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  },
];

exports.usersDeletePost = async (req, res, next) => {
  try {
    await db.deleteUser(req.userId);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

exports.userSearchGet = [
  query("lastName")
    .optional({ checkFalsy: true })
    .trim()
    .isAlpha()
    .withMessage("Last name must contain only letters")
    .isLength({ min: 1, max: 10 })
    .withMessage("Last name must be 1-10 chars"),
  query("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),
  oneOf([query("lastName").notEmpty(), query("email").notEmpty()], {
    message: "At least one valid input must be filled.",
  }),
  async (req, res, next) => {
    const errors = validationResult(req);
    const data = matchedData(req);

    if (!errors.isEmpty()) {
      try {
        const users = await db.getAllUsers();
        return res.render("index", {
          title: "User list",
          searchErrors: errors.array(),
          users,
          userErr: { lastName: req.query.lastName, email: req.query.email },
        });
      } catch (err) {
        next(err);
      }
    }

    try {
      let users;
      if (data.lastName) {
        users = await db.getUsersByLastName(data.lastName);
      } else {
        users = await db.getUsersByEmail(data.email);
      }
      res.render("search", {
        title: "Details",
        users,
      });
    } catch (err) {
      next(err);
    }
  },
];
