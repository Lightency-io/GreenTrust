# Lightency's GreenTrust Energy Certification

<p align="center">
  <img src="https://img.shields.io/badge/npm-v7.20.0-red?logo=npm&style=for-the-badge" alt="npm" />
  <img src="https://img.shields.io/badge/Express.js-v4.17.1-black?logo=express&style=for-the-badge" alt="Express" />
  <img src="https://img.shields.io/badge/React-v17.0.2-blue?logo=react&style=for-the-badge" alt="React" />
  <img src="https://img.shields.io/badge/Aptos-Blockchain-green?style=for-the-badge" alt="Aptos" />
</p>

---

## Overview

Lightency's project aims to enhance transparency and trust in the green energy sector through an On-Chain Energy Certification Platform. This platform revolutionizes the traditional energy certification process by using blockchain technology, offering a more efficient, secure, and decentralized approach to issuing and managing energy certifications. By integrating blockchain, we tackle the challenges of current systems, ensuring all energy certifications are transparent, tamper-proof, and easily accessible—ultimately fostering greater trust in green energy markets.

---

## Objectives

Our goal is to transition the traditional, off-chain certification processes to a fully automated, on-chain system powered by the Aptos blockchain. This initiative aims to create a more reliable, transparent, and tamper-proof method of certifying renewable energy production and consumption.

---

## Key Features

1. **On-Chain Certification Process**
    - The entire certification lifecycle will be conducted on the Aptos blockchain.
2. **Decentralized Data Verification**
    - Implement a decentralized approach for data verification.
3. **Minting of On-Chain Certificates**
    - Upon successful validation of the data, certifications will be minted as Non-Fungible Tokens (NFTs) on the Aptos blockchain. These NFTs will represent a digital proof of the certified renewable energy, which can be easily transferred, traded, or audited.
4. **Automated Data Filtering and Export**
    - Nexus Energía agents will upload Excel files containing energy generation data to our platform. Our solution is equipped with custom filters, multi-filters, and automated data processing capabilities. It will automatically sort and process the data, applying the relevant filters, and then export the necessary information into a properly formatted Excel sheet. This formatted sheet is then transferred to CNMC for validation. The entire process is fully automated, which significantly reduces the potential for human error and streamlines the overall workflow.

---

## Impact

This project addresses key challenges in the renewable energy sector, such as the inefficiency and lack of transparency in the certification process. By transitioning to an on-chain model, we aim to reduce costs, improve data integrity, and provide a more accessible and trustworthy certification system.

---

## Getting Started

To run the project locally, follow these steps:

### Required Instances
Make sure you have a running instance of MongoDB before starting the backend.

1. Clone the repository:
   ```bash
   git clone https://github.com/Lightency-io/GreenTrust.git

2. Install the root-level dependencies:

    ```bash
    npm install
    
3. Navigate to the backend directory and install the backend dependencies
    ```bash
    cd backend
    npm install
4. Navigate to the frontend directory and install the frontend dependencies:

    ```bash
    cd frontend
    npm install
5. Run the frontend:

    ```bash
    npm run dev
6. Run the backend:

    ```bash
    npm run start