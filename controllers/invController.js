const { request } = require("express");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

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

module.exports = invCont;