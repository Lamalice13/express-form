const { Pool } = require("pg");
require("dotenv").config();

// Connection information trough URI
module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
});
