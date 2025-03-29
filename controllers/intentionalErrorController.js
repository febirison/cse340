/**
 * This controller exists to create an exception for testing.
 */
const intentionalErrorController = {};

intentionalErrorController.causeError = async function(req, res, next) {
    console.log("Causing an intentional error...");
    // Intentionally cause an error
    throw new Error("This is an intentional error for testing purposes.");
};

module.exports = intentionalErrorController;
