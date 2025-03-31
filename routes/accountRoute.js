// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

// Route to deliver the login view
router.get("/login",utilities.handleErrors( accountController.buildLogin  )  )

// 🚀 New route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

module.exports = router