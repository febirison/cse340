const { body, validationResult } = require("express-validator")
const validate = {}
const utilities = require("./index")

/* ***************************
 *  Inventory Validation Rules
 * *************************** */
validate.inventoryRules = () => {
  return [
    body("inv_make").trim().notEmpty().matches(/^[A-Za-z0-9 ]+$/)
      .withMessage("Make must contain letters, numbers, and spaces only").isLength({ min: 3 })
      .withMessage("Make must be at least 3 characters"),
    body("inv_model").trim().notEmpty().matches(/^[A-Za-z0-9 ]+$/)
      .withMessage("Model must contain letters, numbers, and spaces only").isLength({ min: 3 })
      .withMessage("Model must be at least 3 characters"),
    body("inv_year").trim().isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Year must be a 4-digit number between 1900 and next year"),
    body("inv_description").trim().notEmpty()
      .withMessage("Description is required"),
    body("inv_image").trim().matches(/^\/images\/vehicles\/.*\.(jpg|png)$/)
      .withMessage("Image path must be valid (e.g., /images/vehicles/car.jpg)"),
    body("inv_thumbnail").trim().matches(/^\/images\/vehicles\/.*\.(jpg|png)$/)
      .withMessage("Thumbnail path must be valid (e.g., /images/vehicles/car-tn.jpg)"),
    body("inv_price").trim().isFloat({ min: 0 })
      .withMessage("Price must be a positive number (e.g., 25000.99)"),
    body("inv_miles").trim().isInt({ min: 0 })
      .withMessage("Miles must be a whole number"),
    body("inv_color").trim().notEmpty().matches(/^[A-Za-z ]+$/)
      .withMessage("Color must contain letters and spaces only"),
    body("classification_id").notEmpty()
      .withMessage("Classification required")
  ]
};

/* ***************************
 *  Check Validation Results
 * *************************** */
validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav: await utilities.getNav(),
      classificationList: await utilities.buildClassificationList(req.body.classification_id),
      errors: errors.array(),
      ...req.body
    })
  }
  next()
}

/* ***************************
 *  Check Validation Results for Update
 * *************************** */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const { inv_id, inv_make, inv_model, classification_id } = req.body
    const itemName = `${inv_make} ${inv_model}`
    return res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav: await utilities.getNav(),
      classificationSelect: await utilities.buildClassificationList(classification_id),
      errors: errors.array(),
      inv_id,
      ...req.body
    })
  }
  next()
}

module.exports = validate; // Export the validation functions for use in routes/inventoryRoute.js
// Compare this snippet from controllers/invController.js: