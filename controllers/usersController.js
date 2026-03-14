const usersStorage = require("../storages/usersStorage");
const {
  body,
  validationResult,
  matchedData,
  query,
  oneOf,
} = require("express-validator");

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
    .optional({ values: "falsy" })
    .isInt({ min: 18, max: 120 })
    .toInt()
    .withMessage(`Age must be between 18 and 120 yo.`),

  body("bio")
    .optional({ values: "falsy" })
    .isLength({ max: 200 })
    .withMessage(`Bio is max 200 characters.`),
];

exports.getUserId = (req, res, next, id) => {
  req.userId = req.params.id;
  next();
};

exports.usersListGet = (req, res) => {
  res.render("index", {
    title: "User list",
    users: usersStorage.getUsers(),
  });
};

exports.usersCreateGet = (req, res) => {
  res.render("createUser", {
    title: "Create user",
  });
};

exports.usersCreatePost = [
  validateUser,
  (req, res) => {
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

    usersStorage.addUser({ firstName, lastName, email, age, bio });
    res.redirect("/");
  },
];

exports.usersUpdateGet = (req, res) => {
  const user = usersStorage.getUser(req.userId);

  res.render("updateUser", {
    title: "Update user",
    user,
  });
};

exports.usersUpdatePost = [
  validateUser,
  (req, res) => {
    const user = usersStorage.getUser(req.userId);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("updateUser", {
        title: "Update user",
        user: user,
        errors: errors.array(),
      });
    }

    const { firstName, lastName, email, age, bio } = matchedData(req);
    usersStorage.updateUser(req.userId, {
      firstName,
      lastName,
      email,
      age,
      bio,
    });
    res.redirect("/");
  },
];

exports.usersDeletePost = (req, res) => {
  usersStorage.deleteUser(req.userId);
  res.redirect("/");
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
  (req, res) => {
    const errors = validationResult(req);
    const data = matchedData(req);
    let user;

    if (!errors.isEmpty()) {
      res.render("createUser", {
        title: "Create User",
        searchErrors: errors.array(),
      });
      return;
    }

    if (data.lastName) {
      user = usersStorage.getUserIdByLastName(data.lastName);
    } else {
      user = usersStorage.getUserIdByEmail(data.email);
    }

    res.render("search", {
      title: "Details",
      user,
    });
  },
];
