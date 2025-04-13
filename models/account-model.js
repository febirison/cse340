const pool = require("../database/");

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
    } catch (error) {
      return error.message;
    }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
    try {
      const sql = "SELECT * FROM account WHERE account_email = $1";
      const email = await pool.query(sql, [account_email]);
      return email.rowCount;
    } catch (error) {
      return error.message;
    }
}

/* **********************
 *   Get account by email
 * ********************* */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_password, account_type FROM account WHERE account_email = $1',
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching email found");
  }
}

/* **********************
 *   Get account by ID
 * ********************* */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1',
      [account_id]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching account found");
  }
}

/* *****************************
 *   Update account information
 * *************************** */
async function updateAccountInfo(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = 
      "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating account:", error);
    return null;
  }
}

/* *****************************
 *   Update account password
 * *************************** */
async function updateAccountPassword(account_id, account_password) {
  try {
    const sql = 
      "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *";
    const result = await pool.query(sql, [account_password, account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating password:", error);
    return null;
  }
}

/* *****************************
 *   Add a vehicle to favorites
 * *************************** */
async function addFavorite(account_id, inv_id) {
  try {
    const sql = "INSERT INTO favorites (account_id, inv_id) VALUES ($1, $2) RETURNING *";
    const result = await pool.query(sql, [account_id, inv_id]);
    return result.rows[0];
  } catch (error) {
    return error.message;
  }
}

/* *****************************
 *   Remove a vehicle from favorites
 * *************************** */
async function removeFavorite(account_id, inv_id) {
  try {
    const sql = "DELETE FROM favorites WHERE account_id = $1 AND inv_id = $2 RETURNING *";
    const result = await pool.query(sql, [account_id, inv_id]);
    return result.rowCount > 0;
  } catch (error) {
    return error.message;
  }
}

/* *****************************
 *   Get favorites by account ID
 * *************************** */
async function getFavoritesByAccountId(account_id) {
  try {
    const sql = `
      SELECT inv.* 
      FROM favorites f 
      JOIN inventory inv ON f.inv_id = inv.inv_id 
      WHERE f.account_id = $1
    `;
    const result = await pool.query(sql, [account_id]);
    return result.rows;
  } catch (error) {
    return error.message;
  }
}

module.exports = { 
  registerAccount, 
  checkExistingEmail, 
  getAccountByEmail, 
  getAccountById, 
  updateAccountInfo, 
  updateAccountPassword,
  addFavorite,
  removeFavorite,
  getFavoritesByAccountId
};