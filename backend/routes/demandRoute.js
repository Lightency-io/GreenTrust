const express = require('express')
const saveContracts = require('../controller/demandController.js');



const router = express.Router()

router.post('/saveCertificates', saveContracts.getDataRow)
router.get('/getDemand', saveContracts.getDemand)


module.exports = router;
