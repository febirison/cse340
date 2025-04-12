const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

async function registerAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.');
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}

async function accountLogin(req, res, next) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error('Access Forbidden');
  }
}

async function buildManagement(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  });
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildUpdateView(req, res, next) {
  let nav = await utilities.getNav();
  const accountId = parseInt(req.params.account_id);
  // Verify the user can only access their own update page
  if (accountId !== res.locals.accountData.account_id) {
    req.flash("notice", "Unauthorized access.");
    return res.redirect("/account/");
  }
  res.render("account/update", {
    title: "Edit Account",
    nav,
    errors: null,
  });
}

/* ****************************************
*  Process account update
* *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  // Verify the user is updating their own account
  if (parseInt(account_id) !== res.locals.accountData.account_id) {
    req.flash("notice", "Unauthorized access.");
    return res.redirect("/account/");
  }
  const updateResult = await accountModel.updateAccountInfo(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  );
  if (updateResult) {
    // Update JWT with new data
    const updatedData = await accountModel.getAccountById(account_id);
    delete updatedData.account_password;
    const accessToken = jwt.sign(updatedData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });
    if (process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
    }
    req.flash("notice", "Account updated successfully.");
    res.redirect("/account/");
  } else {
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
      accountData: res.locals.accountData,
    });
  }
}

/* ****************************************
*  Process password update
* *************************************** */
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav();
  const { account_id, account_password } = req.body;
  // Verify the user is updating their own password
  if (parseInt(account_id) !== res.locals.accountData.account_id) {
    req.flash("notice", "Unauthorized access.");
    return res.redirect("/account/");
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the password update.");
    res.status(500).render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      accountData: res.locals.accountData,
      account_firstname: res.locals.accountData.account_firstname,
      account_lastname: res.locals.accountData.account_lastname,
      account_email: res.locals.accountData.account_email,
    });
    return;
  }
  const updateResult = await accountModel.updateAccountPassword(account_id, hashedPassword);
  if (updateResult) {
    req.flash("notice", "Password updated successfully.");
    res.redirect("/account/");
  } else {
    req.flash("notice", "Sorry, the password update failed.");
    res.status(501).render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      accountData: res.locals.accountData,
      account_firstname: res.locals.accountData.account_firstname,
      account_lastname: res.locals.accountData.account_lastname,
      account_email: res.locals.accountData.account_email,
    });
  }
}

/* ****************************************
*  Process logout
* *************************************** */
async function logout(req, res, next) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
}

module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  buildManagement,
  buildUpdateView,
  updateAccount,
  updatePassword,
  logout 
};