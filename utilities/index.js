const invModel = require("../models/inventory-model")
const Util = {}

// Add the handleErrors function
Util.handleErrors = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  try {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
      list += "<li>"
      list +=
        '<a href="/inv/type/' +
        row.classification_id +
        '" title="See our inventory of ' +
        row.classification_name +
        ' vehicles">' +
        row.classification_name +
        "</a>"
      list += "</li>"
    })
    list += "</ul>"
    return list
  } catch (error) {
    console.error("Error in getNav:", error);
    return "<ul><li>Error loading navigation</li></ul>";
  }
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data, req, res, next){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_image 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
  }

/* **************************************
 * Build the vehicle detail view HTML
 * ************************************ */
Util.buildDetailView = async function(vehicle, req, res, next) {
  let detail = "";

  // Container for the entire detail view
  detail += '<div class="vehicle-detail-container">';

  // Main heading: "2019 Cadillac Escalade" (for example)
  // This is the large title at the top
  detail += `<h2 class="vehicle-title">${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>`;

  // Row container for image (left) and details (right)
  detail += '<div class="vehicle-detail-row">';

  // Left Column: Vehicle full-size image
  detail += '<div class="vehicle-image">';
  detail += `<img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" />`;
  detail += "</div>";

  // Right Column: Vehicle details
  detail += '<div class="vehicle-info">';
  // Subheading for details, e.g. "Cadillac Escalade Details"
  detail += `<h3>${vehicle.inv_make} ${vehicle.inv_model} Details</h3>`;

  // Price (formatted)
  detail += `<p><strong>Price:</strong> $${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</p>`;

  // Description
  detail += `<p><strong>Description:</strong> ${vehicle.inv_description}</p>`;

  // Color
  detail += `<p><strong>Color:</strong> ${vehicle.inv_color}</p>`;

  // Miles (formatted)
  detail += `<p><strong>Miles:</strong> ${new Intl.NumberFormat("en-US").format(vehicle.inv_miles)}</p>`;

  detail += "</div>"; // End .vehicle-info

  detail += "</div>"; // End .vehicle-detail-row
  detail += "</div>"; // End .vehicle-detail-container

  return detail;
};


/* ***************************
 *  Build Classification List
 * *************************** */
Util.buildClassificationList = async function (classification_id = null) {
  try {
    let data = await invModel.getClassifications();
    let classificationList = '<select name="classification_id" id="classificationList" required>';
    classificationList += "<option value=''>Choose a Classification</option>";
    if (data && data.rows && data.rows.length > 0) {
      data.rows.forEach((row) => {
        classificationList += '<option value="' + row.classification_id + '"';
        if (classification_id != null && row.classification_id == classification_id) {
          classificationList += " selected ";
        }
        classificationList += ">" + row.classification_name + "</option>";
      });
    } else {
      console.warn("[WARN] No classifications found in database");
      classificationList += "<option value=''>No classifications available</option>";
    }
    classificationList += "</select>";
    return classificationList;
  } catch (error) {
    console.error("Error building classification list:", error);
    return '<select name="classification_id" id="classificationList" required><option value="">Error loading classifications</option></select>';
  }
};


module.exports = Util;
