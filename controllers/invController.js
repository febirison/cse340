const { request } = require("express");
const invModel = require("../models/inventory-model");
const accountModel = require("../models/account-model"); // Added to fetch favorites
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
/* ***************************
 *  Build vehicle detail view
 * *************************** */
invCont.buildByInventoryId = async function buildByInventoryId(req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    if (isNaN(inv_id)) {
      return next({ status: 400, message: "Invalid vehicle ID." });
    }

    const vehicle = await invModel.getInventoryById(inv_id);
    if (!vehicle) {
      return next({ status: 404, message: "Vehicle not found." });
    }

    let favorites = [];
    if (res.locals.loggedin) {
      if (!res.locals.accountData || !res.locals.accountData.account_id) {
        return next({ status: 500, message: "User data not available." });
      }
      const favoritesResult = await accountModel.getFavoritesByAccountId(res.locals.accountData.account_id);
      if (typeof favoritesResult === 'string') {
        console.error("Error fetching favorites:", favoritesResult);
        favorites = [];
      } else {
        favorites = favoritesResult;
      }
    }

    const detail = await utilities.buildDetailView(vehicle, req, res, next);
    let nav = await utilities.getNav(req, res, next);

    res.render("./inventory/detail", {
      title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model} Details`,
      nav,
      detail,
      inv_id: vehicle.inv_id,
      inv_year: vehicle.inv_year,
      inv_make: vehicle.inv_make,
      inv_model: vehicle.inv_model,
      inv_price: vehicle.inv_price,
      inv_miles: vehicle.inv_miles,
      inv_color: vehicle.inv_color,
      inv_description: vehicle.inv_description,
      inv_image: vehicle.inv_image,
      favorites,
    });
  } catch (error) {
    console.error("Error in buildByInventoryId:", error.stack);
    next({ status: 500, message: "Server error while loading vehicle details: " + error.message });
  }
}

// Add to invCont object to export the function
invCont.buildManagement = async function(req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
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
  const invData = req.body;
  const result = await invModel.insertInventoryItem(invData);
  if (result.rowCount === 1) {
    req.flash("notice", `${invData.inv_make} ${invData.inv_model} added successfully!`);
    res.redirect("/inv/");
  } else {
    res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav: await utilities.getNav(),
      classificationList: await utilities.buildClassificationList(invData.classification_id),
      errors: [{ msg: "Failed to add inventory item to database" }],
      ...invData
    });
  }
};

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
  const invData = req.body;
  const result = await invModel.insertInventoryItem(invData);

  if (result.rowCount === 1) {
    req.flash("notice", `${invData.inv_make} ${invData.inv_model} added successfully!`);
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Failed to add inventory item");
    res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav: await utilities.getNav(),
      classificationList: await utilities.buildClassificationList(invData.classification_id),
      errors: null,
      ...req.body
    });
  }
};

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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(classification_id);
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);
    
    if (!itemData) {
      return next(new Error("Inventory item not found"));
    }
    
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    });
  } catch (error) {
    console.error("[CRITICAL] Error in buildEditInventoryView:", error.stack);
    res.status(500).render("error", {
      title: "Server Error",
      message: "Failed to load edit inventory form: " + error.message,
      nav: await utilities.getNav()
    });
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body;
    const updateResult = await invModel.updateInventory(
      inv_id,  
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    );

    if (updateResult) {
      const itemName = updateResult.inv_make + " " + updateResult.inv_model;
      req.flash("notice", `The ${itemName} was successfully updated.`);
      res.redirect("/inv/");
    } else {
      const classificationSelect = await utilities.buildClassificationList(classification_id);
      const itemName = `${inv_make} ${inv_model}`;
      req.flash("notice", "Sorry, the update failed.");
      res.status(501).render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect,
        errors: null,
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      });
    }
  } catch (error) {
    console.error("[CRITICAL] Error in updateInventory:", error.stack);
    res.status(500).render("error", {
      title: "Server Error",
      message: "Failed to update inventory item: " + error.message,
      nav: await utilities.getNav()
    });
  }
};

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteConfirmView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);
    
    if (!itemData) {
      return next(new Error("Inventory item not found"));
    }
    
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price
    });
  } catch (error) {
    console.error("[CRITICAL] Error in buildDeleteConfirmView:", error.stack);
    res.status(500).render("error", {
      title: "Server Error",
      message: "Failed to load delete confirmation form: " + error.message,
      nav: await utilities.getNav()
    });
  }
};

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const { inv_id, inv_make, inv_model } = req.body;
    const deleteResult = await invModel.deleteInventoryItem(parseInt(inv_id));

    if (deleteResult.rowCount === 1) {
      const itemName = `${inv_make} ${inv_model}`;
      req.flash("notice", `The ${itemName} was successfully deleted.`);
      res.redirect("/inv/");
    } else {
      const itemName = `${inv_make} ${inv_model}`;
      req.flash("notice", "Sorry, the deletion failed.");
      res.status(501).render("inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        errors: null,
        inv_id,
        inv_make,
        inv_model,
        inv_year: req.body.inv_year,
        inv_price: req.body.inv_price
      });
    }
  } catch (error) {
    console.error("[CRITICAL] Error in deleteInventory:", error.stack);
    res.status(500).render("error", {
      title: "Server Error",
      message: "Failed to delete inventory item: " + error.message,
      nav: await utilities.getNav()
    });
  }
};



module.exports = invCont; // Export the controller functions for use in routes/inventoryRoute.js