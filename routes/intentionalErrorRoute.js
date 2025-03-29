// Needed resources
const express = require("express");
const router = new express.Router();
const intentionalErrorController = require("../controllers/intentionalErrorController");
const utilities = require("../utilities");

// Middleware (optional) to pre-check errors; you can leave this commented if you want the controller to handle it
router.use("/", utilities.handleErrors(async (req, res, next) => {
    // Uncomment the next line to simulate a middleware error
    // throw new Error("Middleware intentionally throwing an exception");
    next();
}));

// Route to cause a 500 type error
router.get("/", utilities.handleErrors(intentionalErrorController.causeError));

module.exports = router;
