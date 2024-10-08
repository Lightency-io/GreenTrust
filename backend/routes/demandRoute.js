const express = require('express')
const saveContracts = require('../controller/demandController.js');
const { verifyToken } = require('../middleware/authUtils');





const router = express.Router()

router.post('/saveCertificates', saveContracts.getDataRow)
router.get('/getDemand', saveContracts.getDemand)

// Route to update tokenOnChainId
router.put('/updateTokenOnChainId/:razonSocial/:id', async (req, res) => {
    const { razonSocial, id } = req.params;
    const { tokenOnChainId } = req.body;
  
    try {
      // Call the function from the controller
      const updatedData = await saveContracts.updateTokenOnChainId(razonSocial, id, tokenOnChainId);
      res.json({ message: 'tokenOnChainId updated successfully', updatedData });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


  // Route to fetch all certificates with status "in_progress"
router.get('/certificatesInProgress', async (req, res) => {
    try {
      const certificates = await saveContracts.fetchCertificatesInProgress();
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Route to fetch all certificates with status
router.get('/certificatesWithStatus/:status', verifyToken, saveContracts.fetchCertificateswithStatus);


router.get('/certificatesForCompanyWithStatus/:razonSocial/:status', verifyToken, saveContracts.fetchCertificatesCompanywithStatus);




router.get('/certificateWithId/:id', verifyToken, saveContracts.fetchCertificatewithId);



// Route to update certificate fields and set status to 'in_progress'
router.put('/certificate/update/:id', verifyToken, saveContracts.updateCertificate);




  // API route to update the certificate status in the database
router.put('/updateCertificateStatus/:razonSocial/:id', async (req, res) => {
    const { razonSocial, id } = req.params;
    const { status } = req.body;
  
    try {
      // Call the controller function to update the status in the database
      const updatedCertificate = await saveContracts.updateCertificateStatusInDB(razonSocial, id, status);
      
      res.json({ message: 'Certificate status updated successfully', updatedCertificate });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


  router.put('/updateCertificateToTransferred/:razonSocial/:id', async (req, res) => {
    const { razonSocial, id } = req.params;
  
    try {
      // Call the controller function to update the status in the database
      const updatedCertificate = await saveContracts.updateCertificateToTransferred(razonSocial, id);
      
      res.json({ message: 'Certificate updated to transferred successfully', updatedCertificate });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


router.post('/verifyCertificate', saveContracts.verifyCertificate);
module.exports = router;
