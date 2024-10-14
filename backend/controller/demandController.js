//const Data = require('../model/demandModel.js'); 
const utils = require('../middleware/utils.js');
const { getGreenTrustModel, getEMSDataModel } = require('../db.js');
const sqlite3 = require('sqlite3').verbose();
const { checkUserAuthorization } = require('../middleware/authUtils.js')
const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');
const axios = require('axios');




const db = new sqlite3.Database(':memory:');
// const Data = GreenTrustModel
let files = {}
const saveContracts = async (contractsArray, userEmail) => {
  const GreenTrustModel = getGreenTrustModel();
  const Data = GreenTrustModel;

  try {
    // Format `FechaInicio` and `FechaFin` from timestamp to Date objects
    const formattedContracts = contractsArray.map(contract => ({
      ...contract,
      FechaInicio: new Date(parseInt(contract.FechaInicio.split('.')[0])).toISOString(),
      FechaFin: new Date(parseInt(contract.FechaFin.split('.')[0])).toISOString(),
      demanderOrganization: "Nexus",
      demanderEmail: userEmail,
      transferredToDemander: false
    }));

    const savedContracts = [];
    for (const contract of formattedContracts) {
      const existingContract = await Data.findOne({ id: contract.id });

      if (!existingContract) {
        //contract.CIF = bcrypt.hash(contract.CIF, 10);
        var encryptedContract = await encryptData(contract);
        console.log("encryptedContract")
        console.log(encryptedContract)
        const savedContract = await Data.create(encryptedContract);
        savedContracts.push(savedContract);
      } else {
        console.log(`Demand with ID ${contract.id} already exists. Skipping...`);
      }
    }

    return savedContracts;
  } catch (error) {
    console.error('Error saving contracts:', error);
    throw new Error('Error saving contracts');
  }
};



function encryptData(dataObj) {
  const encryptionKey =  "my-secret-key"
  const CIFEncrypted = CryptoJS.AES.encrypt(dataObj.CIF, encryptionKey).toString();
  const PotenciaEncrypted = CryptoJS.AES.encrypt(dataObj.Potencia.toString(), encryptionKey).toString();
  return {
    ...dataObj,
    CIF: CIFEncrypted,
    Potencia: PotenciaEncrypted
  };
};

function encryptPotencia(dataObj) {
  const encryptionKey =  "my-secret-key"
  const PotenciaEncrypted = CryptoJS.AES.encrypt(dataObj.Potencia.toString(), encryptionKey).toString();
  return {
    ...dataObj,
    Potencia: PotenciaEncrypted
  };
};

function decryptData(dataObj) {
  dataObj.CIF = CryptoJS.AES.decrypt(dataObj.CIF, 'my-secret-key').toString(CryptoJS.enc.Utf8);
  dataObj.Potencia = CryptoJS.AES.decrypt(dataObj.Potencia, 'my-secret-key').toString(CryptoJS.enc.Utf8);
  
  return dataObj; // The same dataObj with updated properties
}

const updateCertificate = async (req, res) => {
  const { id } = req.params;
  const updatedFields = req.body;
  const GreenTrustModel = getGreenTrustModel();

  try {
    const certificate = await GreenTrustModel.findOne({ id: id });

    if (!certificate) {
      return res.status(404).json({ message: `Certificate with ID ${id} not found.` });
    }

    // Ensure only authorized users (Issuer or Auditor) can update
    if (!checkUserAuthorization(req.user, certificate)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    updatedFields.status = 'in_progress';
    updatedFields.transferredToDemander = false;

    const result = await GreenTrustModel.findOneAndUpdate(
      { id: id },
      { $set: updatedFields },
      { new: true }
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating certificate:', error);
    res.status(500).json({ message: 'Internal Server Error' });
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




const fetchCertificateswithStatus = async (req, res) => {
  const { status } = req.params;
  const GreenTrustModel = getGreenTrustModel();
  const Data = GreenTrustModel;

  try {
    const certificates = await Data.find({ status: status });
    if (!certificates.length) {
      return res.status(202).json(certificates);
    }
    // Filter certificates that the user is authorized to view
    const authorizedCertificates = certificates.filter(cert =>
      checkUserAuthorization(req.user, cert)
    );

    if (authorizedCertificates.length === 0) {
      return res.status(403).json({ message: 'You are not authorized to view these certificates' });
    }


    res.status(200).json(authorizedCertificates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching certificates' });
  }
};

const fetchCertificatesCompanywithStatus = async (req, res) => {
  const { razonSocial, status } = req.params;
  const GreenTrustModel = getGreenTrustModel();
  const Data = GreenTrustModel;

  try {
    // Fetch certificates based on the company name (RazonSocial) and status
    const certificates = await Data.find({ RazonSocial: razonSocial, status: status });

    if (!certificates.length) {
      return res.status(202).json(certificates);
    }

    // Filter certificates to only show those the user is authorized to access
    const authorizedCertificates = certificates.filter(cert =>
      checkUserAuthorization(req.user, cert) // Check if the user is authorized to view the certificate
    );

    if (authorizedCertificates.length === 0) {
      return res.status(403).json({ message: 'You are not authorized to view these certificates' });
    }

    res.status(200).json(authorizedCertificates);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};



const fetchCertificatewithId = async (req, res) => {
  const { id } = req.params;
  const GreenTrustModel = getGreenTrustModel();
  const Data = GreenTrustModel;

  try {
    // Fetch the certificate based on the provided ID
    const certificates = await Data.find({ id: id });

    if (!certificates.length) {
      return res.status(202).json(certificates);
    }

    const certificate = certificates[0];

    // Check if the user is authorized to view the certificate
    const isAuthorized = checkUserAuthorization(req.user, certificate);
    if (!isAuthorized) {
      return res.status(403).json({ message: 'You are not authorized to view this certificate' });
    }
    if(req.user.role === 'demander' || req.user.role==='auditor'){
    const decryptCert = decryptData(certificate)
    res.status(200).json(decryptCert);
    }
    else(
      res.status(200).json(certificate)
    )
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};


  // Axios for making HTTP requests

// Function to verify if the certificate exists in the EMSDataModel
async function verifyCertificate(req, res) {
  const EMSDataModel = getEMSDataModel();
  try {
    // Extract the certificate data from the request body
    const certificateData = req.body;
    let certificateMatchExceptPotencia = false;

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
      FechaFin,
      demanderOrganization,
      demanderEmail,
      transferredToDemander,
      CIF,
      Potencia,           // excluded
      ...criteria     // spread the rest of the fields into `criteria`
    } = certificateData;

    // Search for a matching document in EMSDataModel (excluding Potencia)
    const matchingCertificate = await EMSDataModel.findOne(criteria);

    // Check if a matching certificate was found
    if (matchingCertificate) {
      certificateMatchExceptPotencia = true;

      // Call the proof generation endpoint on the proof server
      const generateProofResponse = await axios.post('http://localhost:3100/generate-proof', {
        certificateData: certificateData  // Send the full certificate data to generate the proof
      });

      // Check if the proof was generated successfully
      const { proof, publicSignals } = generateProofResponse.data;
      if (!proof || !publicSignals) {
        return res.status(500).json({
          message: 'Proof generation failed'
        });
      }

      // Now call the proof verification endpoint
      const verifyProofResponse = await axios.post('http://localhost:3100/verify-proof', {
        proof,
        publicSignals
      });

      const { verified, verificationKey, publicSignalsFinal, proofFinal  } = verifyProofResponse.data;
      if (verified && certificateMatchExceptPotencia && publicSignalsFinal[0]=="1") {
        return res.status(200).json({
          message: 'Certificate and Potencia are valid',
          verificationKey,  // Optionally return the verification key
          publicSignalsFinal,
          proofFinal
        });
      } else {
        return res.status(400).json({
          message: 'Invalid certificate or Potencia value'
        });
      }
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



///// ******* Admin Functions *******

// Function to fetch all certificates with status "in_progress"
const fetchCertificatesInProgress = async () => {
  const GreenTrustModel = getGreenTrustModel();
  console.log(GreenTrustModel)
  const Data = GreenTrustModel
  try {
    // Find all documents where the status is "in_progress"
    const certificates = await Data.find({ status: 'in_progress' });
    if (!certificates.length) {
      console.log("no certificates found");
      return [];

    }
    console.log(certificates)
    // Return the list of certificates
    return certificates;
  } catch (error) {
    throw new Error(error.message || 'Server error');
  }
};

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


// Function to update the status of a certificate in the database
const updateCertificateToTransferred = async (razonSocial, id) => {
  const GreenTrustModel = getGreenTrustModel();
  console.log(GreenTrustModel)
  const Data = GreenTrustModel
  try {
    const updatedCertificate = await Data.findOneAndUpdate(
      { RazonSocial: razonSocial, id },  // Match by both RazonSocial and id
      { transferredToDemander: true },  // Update the transferredToDemander field
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


module.exports = { getDataRow, saveContracts, getDemand, updateTokenOnChainId, fetchCertificatesInProgress, updateCertificateStatusInDB, verifyCertificate, fetchCertificateswithStatus, fetchCertificatesCompanywithStatus, fetchCertificatewithId, updateCertificateToTransferred, updateCertificate };