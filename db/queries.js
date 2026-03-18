const pool = require("./pool");

async function getAllUsers() {
  const { rows } = await pool.query("SELECT * FROM users");
  return rows;
}

async function insertUser(firstName, lastName, email, age, bio) {
  await pool.query(
    "INSERT INTO users(firstname, lastname, email, date_of_birth, bio) VALUES($1, $2, $3, $4, $5)",
    [firstName, lastName, email, age, bio]
  );
}

async function updateUser(id, firstName, lastName, email, age, bio) {
  const fields = [];
  const values = [];
  let i = 1;

  if (firstName) {
    fields.push(`firstName=$${i++}`);
    values.push(firstName);
  }
  if (lastName) {
    fields.push(`lastName=$${i++}`);
    values.push(lastName);
  }
  if (email) {
    fields.push(`email=$${i++}`);
    values.push(email);
  }
  if (age != null) {
    fields.push(`date_of_birth=$${i++}`);
    values.push(age);
  }
  if (bio) {
    fields.push(`bio=$${i++}`);
    values.push(bio);
  }

  values.push(id);

  if (!fields.length) return;

  await pool.query(
    `UPDATE users SET ${fields.join(",")} WHERE id=$${i}`,
    values
  );
}

async function getUserById(id) {
  const { rows } = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
  return rows;
}

async function getUsersByEmail(email) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE email ILIKE $1",
    [email + "%"]
  );
  return rows;
}

async function getUsersByLastName(lastName) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE lastname ILIKE $1",
    [lastName + "%"]
  );
  return rows;
}

async function deleteUser(id) {
  await pool.query("DELETE FROM users WHERE id=$1", [id]);
}

async function findUserByEmail(email) {
  const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);
  return rows;
}

module.exports = {
  getAllUsers,
  insertUser,
  updateUser,
  getUserById,
  getUsersByEmail,
  getUsersByLastName,
  deleteUser,
  findUserByEmail,
};
