const { body, validationResult } = require("express-validator")
const classificationModel = require("../models/classification-model")
const utilities = require("./index")

const validate = {}

/* ***************************
 *  Classification Rules
 * *************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .isAlphanumeric()
      .withMessage("No spaces or special characters allowed")
      .custom(async (classification_name) => {
        const exists = await classificationModel.checkExistingClassification(classification_name)
        if (exists) {
          throw new Error("Classification already exists")
        }
      })
  ]
}

/* ***************************
 *  Check Validation Results
 * *************************** */
validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav: await utilities.getNav(),
      errors: errors.array(),
      classification_name: req.body.classification_name
    })
  }
  next()
}

module.exports = validate