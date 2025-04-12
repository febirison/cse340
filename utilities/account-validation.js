const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")

/*  **********************************
*  Registration Data Validation Rules
* ********************************* */
validate.registationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the database
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please log in or use different email")
        }
      }),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
* Check data and return errors or continue to registration
* ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* ******************************
*  Login Validation Rules
* ***************************** */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required"),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password required")
  ]
}

/* ******************************
*  Check Login Data
* ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email
    })
    return
  }
  next()
}

/*  **********************************
*  Account Update Validation Rules
* ********************************* */
validate.accountUpdateRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const accountId = req.body.account_id;
        const existingAccount = await accountModel.getAccountByEmail(account_email);
        if (existingAccount && existingAccount.account_id != accountId) {
          throw new Error("Email already exists. Please use a different email.");
        }
      }),
  ]
}

/* ******************************
* Check account update data
* ***************************** */
validate.checkAccountUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update", {
      errors,
      title: "Edit Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      accountData: res.locals.accountData,
    })
    return
  }
  next()
}

/*  **********************************
*  Password Update Validation Rules
* ********************************* */
validate.passwordUpdateRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements: minimum 12 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 symbol."),
  ]
}

/* ******************************
* Check password update data
* ***************************** */
validate.checkPasswordUpdateData = async (req, res, next) => {
  const { account_password, account_id } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update", {
      errors,
      title: "Edit Account",
      nav,
      accountData: res.locals.accountData,
      account_firstname: res.locals.accountData.account_firstname,
      account_lastname: res.locals.accountData.account_lastname,
      account_email: res.locals.accountData.account_email,
    })
    return
  }
  next()
}

module.exports = validate