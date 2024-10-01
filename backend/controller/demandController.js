//const Data = require('../model/demandModel.js'); 
const utils = require('../middleware/utils.js');
const { getGreenTrustModel, getEMSDataModel } = require('../db.js');
const sqlite3 = require('sqlite3').verbose();





const db = new sqlite3.Database(':memory:');
// const Data = GreenTrustModel
let files = {}
// Function to save contracts to MongoDB
const saveContracts = async (data) => {
  const GreenTrustModel = getGreenTrustModel();
console.log(GreenTrustModel)
const Data = GreenTrustModel
  try {
    const contractsArray = data; // Get the array of contracts from the request body
    
    // Format `FechaInicio` and `FechaFin` from timestamp to Date objects
    const formattedContracts = contractsArray.map(contract => ({
      ...contract,
      FechaInicio: new Date(parseInt(contract.FechaInicio.split('.')[0])), // Convert from timestamp to Date
      FechaFin: new Date(parseInt(contract.FechaFin.split('.')[0])), // Convert from timestamp to Date
    }));

    // Now we save the formatted contracts to MongoDB
    const savedData = await Data.insertMany(formattedContracts);

    return savedData;
  } catch (error) {
    console.error('Error saving contracts to MongoDB:', error);
  }
};

async function getDataRow(req, res, next) {
    const { keys, uuid } = req.body
    if (!keys) res.status(401).end()
            const file = files[uuid]
            if (!file) {
                next(new Error("File not found"))
            }
            const stmt_exp = db.prepare(`select *, SUM(GarantiaSolicitada) as sum from ${file.table_id} where id in (${keys.toString()}) group by CodigoPlanta`)
            const recs_exp = (await utils.get_p(stmt_exp))
            res.send(recs_exp)
            //TODO create a demand obj consume it from front
}

async function getDemand(req, res, next) {
  const GreenTrustModel = getGreenTrustModel();
  console.log(GreenTrustModel)
  const Data = GreenTrustModel
    try {
        const demand = await Data.find();
        res.status(200).json(demand);
    } catch (error) {
        console.error('Error getting demand:', error);
}
}


// Function to update tokenOnChainId for a specific document
const updateTokenOnChainId = async (razonSocial, id, tokenOnChainId) => {
  if (!tokenOnChainId) {
    throw new Error('tokenOnChainId is required');
  }
  const GreenTrustModel = getGreenTrustModel();
  console.log(GreenTrustModel)
  const Data = GreenTrustModel
  try {
    // Find the document by both RazonSocial and id
    const updatedData = await Data.findOneAndUpdate(
      { RazonSocial: razonSocial, id }, // Match the document by both RazonSocial and id
      { tokenOnChainId }, // Set the new tokenOnChainId
      { new: true } // Return the updated document
    );

    if (!updatedData) {
      throw new Error('Data not found');
    }

    // Return the updated document
    return updatedData;
  } catch (error) {
    throw new Error(error.message || 'Server error');
  }
};


// Function to fetch all certificates with status "in_progress"
const fetchCertificatesInProgress = async () => {
  const GreenTrustModel = getGreenTrustModel();
console.log(GreenTrustModel)
const Data = GreenTrustModel
  try {
    // Find all documents where the status is "in_progress"
    const certificates = await Data.find({ status: 'in_progress' });

    if (!certificates.length) {
      throw new Error('No certificates found with status "in_progress"');
    }
    console.log(certificates)
    // Return the list of certificates
    return certificates;
  } catch (error) {
    throw new Error(error.message || 'Server error');
  }
};

// Function to verify if the certificate exists in the EMSDataModel
async function verifyCertificate(req, res) {
  const EMSDataModel = getEMSDataModel();
  try {
      // Extract the certificate data from the request body
      const certificateData = req.body;

      // Destructure the certificateData to exclude tokenOnChainId and sum fields
      const {
          _id,
          status,
          __v,
          createdAt,
          updatedAt,
          tokenOnChainId, // excluded
          sum, 
          FechaInicio,
          FechaFin,           // excluded
          ...criteria     // spread the rest of the fields into `criteria`
      } = certificateData;

      // Search for a matching document in EMSDataModel
      console.log(criteria)
      const matchingCertificate = await EMSDataModel.findOne(criteria);


      // Check if a matching certificate was found
      if (matchingCertificate) {
          return res.status(200).json({
              message: 'Certificate is valid.',
              certificate: matchingCertificate
          });
      } else {
          return res.status(404).json({
              message: 'Certificate not found. Invalid certificate.'
          });
      }
  } catch (error) {
      console.error('Error verifying certificate:', error);
      return res.status(500).json({ error: 'An error occurred while verifying the certificate.' });
  }
}



// Function to update the status of a certificate in the database
const updateCertificateStatusInDB = async (razonSocial, id, status) => {
  const GreenTrustModel = getGreenTrustModel();
console.log(GreenTrustModel)
const Data = GreenTrustModel
  try {
    const updatedCertificate = await Data.findOneAndUpdate(
      { RazonSocial: razonSocial, id },  // Match by both RazonSocial and id
      { status },  // Update the status field
      { new: true } // Return the updated document
    );

    if (!updatedCertificate) {
      throw new Error('Certificate not found');
    }

    return updatedCertificate;
  } catch (error) {
    throw new Error(error.message || 'Server error');
  }
};


module.exports = {getDataRow,saveContracts,getDemand, updateTokenOnChainId, fetchCertificatesInProgress, updateCertificateStatusInDB, verifyCertificate};