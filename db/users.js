const client = require("./client");
const bcrypt = require('bcrypt');



const createUser = async ({ username, password }) => {
  try {
    const SALT_COUNT = 10;
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
    const { rows: [user] } = await client.query(`
      INSERT INTO users(username, password)
      VALUES ($1, $2)
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
    `, [username, hashedPassword]);
    delete user.password
    return user;
  } catch (err) {
    console.error(err)
  }
}

const getUser = async ({ username, password }) => {
  try {
    const user = await getUserByUsername(username);
    const hashedPassword = user.password;
    const passwordsMatch = await bcrypt.compare(password, hashedPassword);
    if (passwordsMatch) {
      delete user.password
      return user
    }
  } catch (err) {
    console.error(err)
  }
}

const getUserById = async (userId) => {
  try {
    const { rows: [user] } = await client.query(`
      SELECT id, username 
      FROM users
      WHERE id=${userId}
    `);
    if (!user) {
      return null
    }
    return user
  } catch (err) {
    console.error(err)
  }
}

const getUserByUsername = async (userName) => {
  try {
    const { rows: [user] } = await client.query(`
      SELECT *
      FROM users
      WHERE username=$1;
    `, [userName]);
    return user;
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
