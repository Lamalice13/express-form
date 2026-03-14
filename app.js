const express = require("express");
const app = express();
const path = require("node:path");
const usersRouter = require("./routes/Users");

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if (err) {
    throw err;
  } else {
    console.log(`Server listening on PORT ${PORT}`);
  }
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use("/", usersRouter);
