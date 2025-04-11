const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const classificationValidate = require("../utilities/classification-validation");
const inventoryValidate = require("../utilities/inventory-validation");
const utilities = require("../utilities");

// NEW: Management View Route
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
router.get("/", utilities.handleErrors(invController.buildManagement));
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

// In routes/inventoryRoute.js, before calling invController.buildDetailView:
router.get("/detail/:inv_id", (req, res, next) => {
    console.log("Detail route hit for inv_id:", req.params.inv_id);
    next();
}, utilities.handleErrors(invController.buildDetailView));

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to get inventory by classification as JSON for AJAX
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to build edit inventory view
router.get("/edit/:inv_id", utilities.handleErrors(invController.buildEditInventoryView));

// Route to build delete confirmation view
router.get("/delete/:inv_id", utilities.handleErrors(invController.buildDeleteConfirmView));

// Route to delete inventory item
router.post("/delete", utilities.handleErrors(invController.deleteInventory));

// Route to update inventory item
router.post("/update/",
  inventoryValidate.inventoryRules(),
  inventoryValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Route to build vehicle detail view
//router.get("/detail/:inv_id", invController.buildDetailView);

// Route to build add vehicle view
router.post("/add-classification",
  classificationValidate.classificationRules(),
  classificationValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Route to build add vehicle view
router.post("/add-inventory",
  inventoryValidate.inventoryRules(),
  inventoryValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

module.exports = router; // Export the router for use in server.js