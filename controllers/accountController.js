// Purpose: Account Controller for handling account-related actions
//  * ********************************** */
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const invModel = require("../models/inventory-model");
require("dotenv").config();

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/// Function to build the registration view
/// and render the registration page
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/// Function to register a new account
/// and render the login page upon success
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

/// Function to log in an account
/// and render the account management page upon success
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

/// Function to build the account management view
/// and render the account management page
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav();
  const account_id = res.locals.accountData.account_id;
  const favorites = await accountModel.getFavoritesByAccountId(account_id);
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    favorites,
  });
}

// Function to build the account update view
// and render the account update page
async function buildUpdateView(req, res, next) {
  let nav = await utilities.getNav();
  const accountId = parseInt(req.params.account_id);
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

// Function to update account information
// and render the account management page upon success
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
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


/// Function to update account password
/// and render the account management page upon success
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav();
  const { account_id, account_password } = req.body;
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

//* Function to log out the user
//* and clear the JWT cookie
async function logout(req, res, next) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
}

// Function to add a vehicle to favorites
async function addFavorite(req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id);
    const account_id = res.locals.accountData.account_id;

    const vehicle = await invModel.getInventoryById(inv_id);
    if (!vehicle) {
      req.flash("notice", "Vehicle not found.");
      return res.redirect(`/inv/detail/${inv_id}`);
    }

    const vehicleExists = await accountModel.getAccountById(account_id);
    if (!vehicleExists) {
      req.flash("notice", "User not found.");
      return res.redirect(`/inv/detail/${inv_id}`);
    }

    const alreadyFavorited = await accountModel.getFavoritesByAccountId(account_id);
    if (alreadyFavorited.some(fav => fav.inv_id === inv_id)) {
      req.flash("notice", "This vehicle is already in your favorites.");
      return res.redirect(`/inv/detail/${inv_id}`);
    }

    const result = await accountModel.addFavorite(account_id, inv_id);
    if (typeof result === 'string') {
      req.flash("notice", "Failed to add vehicle to favorites.");
    } else {
      req.flash("notice", "Vehicle added to favorites.");
    }
    res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    req.flash("notice", "Error adding vehicle to favorites: " + error.message);
    res.redirect(`/inv/detail/${req.body.inv_id}`);
  }
}

//* Function to remove a vehicle from favorites
//* and render the account management page upon success
async function removeFavorite(req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id);
    const account_id = res.locals.accountData.account_id;

    const vehicle = await invModel.getInventoryById(inv_id);
    if (!vehicle) {
      req.flash("notice", "Vehicle not found.");
      return res.redirect(`/inv/detail/${inv_id}`);
    }

    const result = await accountModel.removeFavorite(account_id, inv_id);
    if (result) {
      req.flash("notice", "Vehicle removed from favorites.");
    } else {
      req.flash("notice", "Failed to remove vehicle from favorites.");
    }
    res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    req.flash("notice", "Error removing vehicle from favorites: " + error.message);
    res.redirect(`/inv/detail/${req.body.inv_id}`);
  }
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
  logout,
  addFavorite,
  removeFavorite
};