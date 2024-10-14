<p align="center">
  <img src="https://lightency.io/img/logo-name-dark.png" alt="lightency" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/npm-v7.20.0-red?logo=npm&style=for-the-badge" alt="npm" />
  <img src="https://img.shields.io/badge/Express.js-v4.17.1-black?logo=express&style=for-the-badge" alt="Express" />
  <img src="https://img.shields.io/badge/React-v17.0.2-blue?logo=react&style=for-the-badge" alt="React" />
  <img src="https://img.shields.io/badge/ZK%20Proof-Security-blue?style=for-the-badge" alt="ZK Proof" />
  <img src="https://img.shields.io/badge/Aptos-Blockchain-green?style=for-the-badge" alt="Aptos" />
</p>

---
## Key Partner
<p align="center">
  <img src="https://www.nexusenergia.com/wp-content/uploads/2022/02/nexus-logo-n.svg" alt="nexus" />
</p>

## Overview

Lightency's GreenTrust is pioneering a transformation in the green energy sector with its On-Chain Energy Certification Platform. Utilizing blockchain technology, this platform revolutionizes the traditional energy certification process by offering a more secure, transparent, and decentralized approach. Our solution addresses the limitations of current systems by ensuring that all energy certifications are tamper-proof, transparent, and readily accessible, enhancing trust in the green energy markets.

---

## Objectives

Our primary objective is to transition from traditional, manual certification processes to a fully automated, on-chain system on the Aptos blockchain. This transition aims to provide a more reliable, transparent, and immutable method of certifying renewable energy production and consumption.

---

## Key Features

## Key Roles and Features

1. **Demander Role**
    - Demanders, such as energy producers or consumers, can upload their Energy Management System (EMS) data directly into the platform.
   - Once the data is uploaded, demanders can initiate the process to request Guarantees of Origin (GDOs) for their renewable energy production or consumption.
    - The entire demand and certification process is fully managed on-chain, providing transparency and accountability.
2. **Issuer Role**
    - The Issuer’s role involves overseeing the requests for GDOs through a dashboard that displays the status of all demands.
    -The platform’s dashboard allows issuers to monitor and track the certification lifecycle, but the actual issuing of the certificates is fully automated.
    - Once the data is validated, the certificates are minted as Non-Fungible Tokens (NFTs) on the Aptos blockchain, providing tamper-proof digital proof of renewable energy certification.
    -  Zero-Knowledge Proof (ZK) technology is utilized to enable data verification without compromising sensitive or private information, enhancing both security and trust in the process.
3. **Auditor Role**
    - Auditors have the authority to review and verify the GDO requests. They can audit the EMS data submitted by demanders and validate or change the status of the request.
    - The auditor role is critical for maintaining the integrity of the process, ensuring that only verified renewable energy is certified.


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
