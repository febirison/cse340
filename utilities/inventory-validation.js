const { body, validationResult } = require("express-validator")
const validate = {}
const utilities = require("./index")

/* ***************************
 *  Inventory Validation Rules
 * *************************** */
validate.inventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Make is required"),
    
    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Model is required"),
    
    body("inv_year")
      .trim()
      .isNumeric()
      .withMessage("Valid 4-digit year required"),
    
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description required"),
    
    body("inv_price")
      .trim()
      .isNumeric()
      .withMessage("Valid price required"),
    
    body("inv_miles")
      .trim()
      .isNumeric()
      .withMessage("Valid mileage required"),
    
    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color required"),
    
    body("classification_id")
      .notEmpty()
      .withMessage("Classification required")
  ]
}

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

module.exports = validate