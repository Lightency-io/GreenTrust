const mongoose = require("mongoose");
const dataSchema = require('./demandModel.js');


// Database Connection Strings
const hostname = '127.0.0.1';
const database1 = "GreenTrust";
const database2 = "EMSData";

// Placeholders for models
let GreenTrustModel = null;
let EMSDataModel = null;
let GreenTrustUserModel = null;

// Function to initialize the database connections and models
const initializeDatabases = async () => {
    try {

        const connectionEMSData = await mongoose.createConnection(`mongodb://${hostname}:27017/${database2}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`Connected to database: ${database2}`);
        EMSDataModel = connectionEMSData.model('Data', dataSchema, 'certificates');

    } catch (error) {
        console.error("Error initializing database:", error);
        throw new Error("Database initialization failed");
    }
};

// Function to get the EMSDataModel
const getEMSDataModel = () => {
    if (!EMSDataModel) {
        throw new Error('EMSDataModel is not initialized. Ensure the database connection is established.');
    }
    return EMSDataModel;
};


// Export both the initialization function and the model getter functions
module.exports = { initializeDatabases, getEMSDataModel };
