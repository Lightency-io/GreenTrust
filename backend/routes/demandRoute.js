const express = require('express')
const DemandController = require('../controller/demandController.js')

const router = express.Router()

router.post('/demand', DemandController.demand)


module.exports = router;
