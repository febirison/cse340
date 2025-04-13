// This file defines the routes for account management, including login, registration, and account updates.
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const validate = require('../utilities/account-validation');

// Route to deliver the login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Route to deliver the account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement));

// Route to deliver the account update view
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateView));

// Route to handle logout
router.get("/logout", utilities.handleErrors(accountController.logout));

// Process the registration data
router.post(
    "/register",
    validate.registationRules(), 
    validate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
);

// Process the login request
router.post(
    "/login",
    validate.loginRules(), 
    validate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
);

// Process the account update
router.post(
    "/update",
    utilities.checkLogin,
    validate.accountUpdateRules(), 
    validate.checkAccountUpdateData,
    utilities.handleErrors(accountController.updateAccount)
);

// Process the password update
router.post(
    "/update-password",
    utilities.checkLogin,
    validate.passwordUpdateRules(), 
    validate.checkPasswordUpdateData,
    utilities.handleErrors(accountController.updatePassword)
);

// Process adding a vehicle to favorites
router.post(
    "/add-favorite",
    utilities.checkLogin,
    validate.favoritesRules(), 
    validate.checkFavoritesData,
    utilities.handleErrors(accountController.addFavorite)
);

// Process removing a vehicle from favorites
router.post(
    "/remove-favorite",
    utilities.checkLogin,
    validate.favoritesRules(), 
    validate.checkFavoritesData,
    utilities.handleErrors(accountController.removeFavorite)
);

module.exports = router;