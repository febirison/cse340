// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");

// In routes/inventoryRoute.js, before calling invController.buildDetailView:
router.get("/detail/:inv_id", (req, res, next) => {
    console.log("Detail route hit for inv_id:", req.params.inv_id);
    next();
  }, invController.buildDetailView);
  
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build vehicle detail view
router.get("/detail/:inv_id", invController.buildDetailView);


module.exports = router;