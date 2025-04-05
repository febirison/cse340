const pool = require("../database/");

/* ***************************
 *  Insert New Classification
 * *************************** */
async function insertClassification(classification_name, req, res, next) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Check Existing Classification
 * *************************** */
async function checkExistingClassification(classification_name, req, res, next) {
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1"
    const classification = await pool.query(sql, [classification_name])
    return classification.rowCount
  } catch (error) {
    return error.message
  }
}

module.exports = { insertClassification, checkExistingClassification }