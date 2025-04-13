const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const classificationValidate = require("../utilities/classification-validation");
const inventoryValidate = require("../utilities/inventory-validation");
const utilities = require("../utilities");

// NEW: Management View Route
router.get("/add-inventory", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory));
router.get("/", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildManagement));
router.get("/add-classification", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification));

// Route to build vehicle detail view
router.get("/detail/:inv_id", (req, res, next) => {
    console.log("Detail route hit for inv_id:", req.params.inv_id);
    next();
}, utilities.handleErrors(invController.buildByInventoryId)); // Changed from buildDetailView to buildByInventoryId

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to get inventory by classification as JSON for AJAX
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to build edit inventory view
router.get("/edit/:inv_id", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildEditInventoryView));

// Route to build delete confirmation view
router.get("/delete/:inv_id", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildDeleteConfirmView));

// Route to delete inventory item
router.post("/delete", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.deleteInventory));

// Route to update inventory item
router.post("/update/",
  utilities.checkLogin,
  utilities.checkAccountType,
  inventoryValidate.inventoryRules(),
  inventoryValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Route to build add vehicle view
router.post("/add-classification",
  utilities.checkLogin,
  utilities.checkAccountType,
  classificationValidate.classificationRules(),
  classificationValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Route to build add vehicle view
router.post("/add-inventory",
  utilities.checkLogin,
  utilities.checkAccountType,
  inventoryValidate.inventoryRules(),
  inventoryValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

module.exports = router;