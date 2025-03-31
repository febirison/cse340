/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute.js")
const session = require("express-session")
const pool = require('./database/')
const accountRoute = require("./routes/accountRoute")



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
}))


// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root


/* ***********************
 * Routes
 *************************/
app.use(static)
app.use("/account", accountRoute)


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})

/* ***********************
 * Index Route
 *************************/
app.get("/", baseController.buildHome)

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
  const utilities = require("./utilities");
  const nav = await utilities.getNav(); // Include nav if desired
  res.status(500).render("error", { 
      title: "Server Error", 
      message: "Oh no! There was a crash. Maybe try a different route?", 
      nav 
  });
});