const { request } = require("express");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const classificationModel = require("../models/classification-model");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * *************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build vehicle detail view
 * *************************** */
invCont.buildDetailView = async function (req, res, next) {
  const inv_id = req.params.inv_id;
  // Retrieve the specific vehicle detail
  const vehicle = await invModel.getInventoryById(inv_id);
  
  // Check if the vehicle exists
  if (!vehicle) {
    // Optionally, you could render a 404 page or call next with an error
    return next(new Error("Vehicle not found"));
  }
  
  // Build the detail HTML using a custom utility function
  const detail = await utilities.buildDetailView(vehicle);
  let nav = await utilities.getNav();
  const title = `${vehicle.inv_make} ${vehicle.inv_model} Details`;
  
  // Render the detail view, passing the title, navigation, and detail HTML
  res.render("./inventory/detail", {
    title,
    nav,
    detail,
  });
};

// Add to invCont object to export the function
invCont.buildManagement = async function(req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
  });
};

// Add to invCont object to export the function
invCont.buildAddClassification = async function(req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    classification_name: ""
  });
};

invCont.addInventory = async function(req, res, next) {
  const invData = req.body
  const result = await invModel.insertInventoryItem(invData)
  if (result.rowCount === 1) {
    req.flash("notice", `${invData.inv_make} ${invData.inv_model} added successfully!`)
    res.redirect("/inv/")
  } else {
    res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav: await utilities.getNav(),
      classificationList: await utilities.buildClassificationList(invData.classification_id),
      errors: [{ msg: "Failed to add inventory item to database" }],
      ...invData
    })
  }
}


invCont.buildAddInventory = async function(req, res, next) {
  try {
    console.log("[DEBUG] Starting buildAddInventory");
    let nav = await utilities.getNav();
    console.log("[DEBUG] Navigation loaded");
    let classificationList = await utilities.buildClassificationList();
    console.log("[DEBUG] Classification list built");
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null
    });
    console.log("[DEBUG] Rendered add-inventory view");
  } catch (error) {
    console.error("[CRITICAL] Error in buildAddInventory:", error.stack);
    res.status(500).render("error", {
      title: "Server Error",
      message: "Failed to load inventory form: " + error.message
    });
  }
};

//* ***************************
// *  Add Inventory Item  
invCont.addInventory = async function(req, res, next) {
  const invData = req.body
  const result = await invModel.insertInventoryItem(invData)

  if (result.rowCount === 1) {
    req.flash("notice", `${invData.inv_make} ${invData.inv_model} added successfully!`)
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Failed to add inventory item")
    res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav: await utilities.getNav(),
      classificationList: await utilities.buildClassificationList(invData.classification_id),
      errors: null,
      ...invData
    })
  }
}

invCont.addClassification = async function(req, res, next) {
  const { classification_name } = req.body;
  const result = await classificationModel.insertClassification(classification_name);
  if (result.rowCount === 1) {
    req.flash("notice", `${classification_name} added successfully!`);
    res.redirect("/inv/");
  } else {
    res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav: await utilities.getNav(),
      errors: [{ msg: "Failed to add classification to database" }],
      classification_name
    });
  }
};

module.exports = invCont;
