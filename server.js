/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const utilities = require("./utilities");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute.js");
const session = require("express-session");
const pool = require('./database/');
const accountRoute = require("./routes/accountRoute");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser"); // Add cookie-parser



/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Add cookie-parser middleware
app.use(cookieParser());

// Set static folder
app.use(utilities.checkJWTToken)

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static);
app.use("/account", accountRoute);

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});

/* ***********************
 * Index Route
 *************************/
app.get("/", baseController.buildHome);

// Inventory routes
app.use("/inv", inventoryRoute);

// Intentional error route
app.get("/error", (req, res, next) => {
  // Create and pass an error to trigger the error middleware
  next(new Error("Intentional error triggered for testing purposes."));
});

// 404 catch-all comes AFTER all routes
app.use((req, res) => {
  res.status(404).render("error", { 
      title: "404", 
      message: "Sorry, we appear to have lost that page." 
  });
});

const intentionalErrorRoute = require("./routes/intentionalErrorRoute");
app.use("/intentional-error", intentionalErrorRoute);

// Error handling middleware for 500 errors
app.use(async (err, req, res, next) => {
  console.error(err.stack);
  //const utilities = require("./utilities");
  const nav = await utilities.getNav(); // Include nav if desired
  res.status(500).render("error", { 
      title: "Server Error", 
      message: "Oh no! There was a crash. Maybe try a different route?", 
      nav 
  });
});

// Initialize database tables
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS classification (
        classification_id SERIAL PRIMARY KEY,
        classification_name VARCHAR(50) NOT NULL
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        inv_id SERIAL PRIMARY KEY,
        inv_make VARCHAR(50) NOT NULL,
        inv_model VARCHAR(50) NOT NULL,
        inv_year INTEGER NOT NULL,
        inv_description TEXT,
        inv_image VARCHAR(255),
        inv_thumbnail VARCHAR(255),
        inv_price DECIMAL(10,2) NOT NULL,
        inv_miles INTEGER NOT NULL,
        inv_color VARCHAR(50),
        classification_id INTEGER,
        FOREIGN KEY (classification_id) REFERENCES classification(classification_id)
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        favorite_id SERIAL PRIMARY KEY,
        account_id INTEGER NOT NULL,
        inv_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES account(account_id),
        FOREIGN KEY (inv_id) REFERENCES inventory(inv_id),
        UNIQUE (account_id, inv_id)
      );
    `);
    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database tables:", error);
  }
}

initializeDatabase();