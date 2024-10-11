const express = require('express');
const snarkjs = require('snarkjs');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const { getEMSDataModel, initializeDatabases } = require('./db.js');
require('dotenv').config();


const app = express();
app.use(express.json());

// Endpoint to encrypt a value
app.post('/encrypt', (req, res) => {
    const { value } = req.body;
    const encryptionKey = process.env.ENCRYPTION_KEY;
    const encryptedValue = CryptoJS.AES.encrypt(value, encryptionKey).toString();
    res.json({ encryptedValue });
});

// Endpoint to generate the proof
app.post('/generate-proof', async (req, res) => {
    const { certificateData } = req.body;
    const encryptedValue = certificateData.Potencia
    const EMSDataModel = getEMSDataModel();
    try {
        // Extract the certificate data from the request body
  
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
            Potencia,  
            CIF,      // excluded
            ...criteria     // spread the rest of the fields into `criteria`
        } = certificateData;
  
        // Search for a matching document in EMSDataModel
        // console.log(criteria)
        const matchingCertificate = await EMSDataModel.findOne(criteria);
    
        const plaintextValue = matchingCertificate.Potencia
        // Prepare input.json

        const wasmPath = './equal_js/equal.wasm';  // Path to your compiled circuit.wasm
        // const zkeyPath = './circuit_final.zkey';  // Path to your proving key (zkey)
        const witnessCalculator = require('./equal_js/witness_calculator.js');
        const input = {
            a: parseInt(parseFloat(CryptoJS.AES.decrypt(encryptedValue, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8))*1000),
            b: parseInt(parseFloat(plaintextValue)*1000)
        };

        // console.log("Decrypted Value (a):", CryptoJS.AES.decrypt(encryptedValue, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8));
        // console.log("Plaintext Value (b):", parseFloat(plaintextValue));
        fs.writeFileSync('input.json', JSON.stringify(input));

        // Generate the witness
        const buffer = fs.readFileSync(wasmPath);
        const wc = await witnessCalculator(buffer);
        
        // Calculate witness
        const witness = await wc.calculateWitness(input, true);
        // console.log("Sum:", witness[1]); 

        await execPromise('node equal_js/generate_witness.js equal_js/equal.wasm input.json witness.wtns');


        await execPromise('snarkjs plonk setup equal.r1cs powersOfTau28_hez_final_19.ptau equal_final.zkey')

        await execPromise("snarkjs zkey export verificationkey equal_final.zkey verification_key.json")
        // Generate the proof with PLONK
        await execPromise('snarkjs plonk prove equal_final.zkey witness.wtns proof.json public.json');

        // Load the generated proof and public signals
        const proof = JSON.parse(fs.readFileSync('proof.json'));
        const publicSignals = JSON.parse(fs.readFileSync('public.json'));

        res.json({ proof, publicSignals });
    } catch (error) {
        console.error('Proof generation error:', error);
        res.status(500).json({ error: 'Proof generation failed' });
    }
});

// Endpoint to verify the proof
app.post('/verify-proof', async (req, res) => {
    const { proof, publicSignals } = req.body;
    const publicSignalsFinal = publicSignals;
    const proofFinal = proof;

    try {
        // Write proof and publicSignals to files
        fs.writeFileSync('proof.json', JSON.stringify(proof));
        fs.writeFileSync('public.json', JSON.stringify(publicSignals));

        // Verify proof using PLONK
        const { stdout } = await execPromise('snarkjs plonk verify verification_key.json public.json proof.json');
        const verified = stdout.includes("OK");

        const verificationKey = fs.readFileSync('verification_key.json', 'utf8');

        res.json({ verified, publicSignalsFinal, proofFinal, verificationKey });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});









  initializeDatabases()
  .then(() => {
      //addFieldToExistingDocs()
      const PORT = process.env.PORT || 3100;
      app.listen(PORT, () => {
          console.log(`Server running on port ${PORT}`);
      });
  })
  .catch((err) => {
      console.error("Failed to initialize databases: ", err);
  });