#! /opt/homebrew/bin/node
const { Client } = require("pg");
require("dotenv").config();

const SQL = `
INSERT INTO users(firstname, lastname, email, date_of_birth, bio) 
VALUES
    ('Odin', 'Hammer', 'odin.hammer@gmail.com', '11/15/1990', 'I"m free!'),
    ('Bryan', 'Born', 'bryanborn@hotmail.com', '01/04/1964', 'Keep it up, boy'),
    ('Daemon', 'Targaryen', 'daemonthebest@gmail.com', '02/07/1975', 'I"m the best ever');
`;

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();
