const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(req, res, next) {
  try {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
  } catch (error) {
    console.error("Database Error in getClassifications:", error);
    throw error; // Propagate error instead of returning error message
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id, req, res, next) {
    try {
      const data = await pool.query(
        `SELECT * FROM public.inventory AS i 
        JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
        WHERE i.classification_id = $1`,
        [classification_id]
      )
      return data.rows
    } catch (error) {
      console.error("getclassificationsbyid error " + error)
    }
  }

/* ***************************
 *  Get a specific vehicle detail by inventory id
 * *************************** */
async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
       JOIN public.classification AS c
         ON i.classification_id = c.classification_id
       WHERE i.inv_id = $1`,
      [inv_id]
    );
    return data.rows[0]; // Returns undefined if no vehicle is found
  } catch (error) {
    console.error("getInventoryById error: " + error);
    throw new Error("Failed to fetch vehicle data: " + error.message);
  }
}

/* ***************************
 *  Insert New Inventory Item
 * *************************** */
async function insertInventoryItem(invData, req, res, next) {
  try {
    const sql = `INSERT INTO inventory (
      inv_make, inv_model, inv_year, inv_description, 
      inv_image, inv_thumbnail, inv_price, inv_miles, 
      inv_color, classification_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`
    
    return await pool.query(sql, [
      invData.inv_make,
      invData.inv_model,
      invData.inv_year,
      invData.inv_description,
      invData.inv_image,
      invData.inv_thumbnail,
      invData.inv_price,
      invData.inv_miles,
      invData.inv_color,
      invData.classification_id
    ])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    console.error("Delete Inventory Error: " + error)
    throw new Error("Delete Inventory Error")
  }
}

// Add to exports
module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  insertInventoryItem,
  updateInventory,
  deleteInventoryItem
} // Export the functions for use in routes/inventoryRoute.js