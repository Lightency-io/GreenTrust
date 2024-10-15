<div align="center">

# GreenTrust

**Revolutionizing Renewable Energy Certification with Blockchain and Zero-Knowledge Proofs**

<p align="center">
  <img src="https://img.shields.io/badge/npm-v7.20.0-red?logo=npm&style=for-the-badge" alt="npm" />
  <img src="https://img.shields.io/badge/Express.js-v4.17.1-black?logo=express&style=for-the-badge" alt="Express" />
  <img src="https://img.shields.io/badge/React-v17.0.2-blue?logo=react&style=for-the-badge" alt="React" />
  <img src="https://img.shields.io/badge/ZK%20Proof-Security-blue?style=for-the-badge" alt="ZK Proof" />
  <img src="https://img.shields.io/badge/Aptos-Blockchain-green?style=for-the-badge" alt="Aptos" />
</p>
</div>

---

<p align="center">
  <img src="https://lightency.io/img/logo-name-dark.png" alt="lightency" />
</p>

Lightency is a team of experts in deep technologies committed to making renewable energy accessible and combating climate change. We aim to utilize new technologies to drive a green transition with significant economic and social impact.

---
## Key Partner
<p align="center">
  <img src="https://www.nexusenergia.com/wp-content/uploads/2022/02/nexus-logo-n.svg" alt="nexus" />
</p>
Founded in 2000 and headquartered in Barcelona, Nexus Energía is a leading player in the energy sector, renowned for its commitment to renewable energy and sustainability. With over 20 years of experience, Nexus Energía supplies 100% certified renewable energy and manages the energy needs of both small and large businesses. They represent more than 16,700 renewable energy producers and manage over 14 TWh of energy annually.


---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [How It Works](#how-it-works)
- [Architecture Overview](#architecture-overview)
- [Installation](#installation)
- [Usage](#usage)
- [Challenges](#challenges)
- [Future Work](#future-work)
- [License](#license)
- [Contact](#contact)

---

## Introduction

**GreenTrust** is a blockchain-based platform developed by **Lightency** that streamlines and secures the issuance of Guarantees of Origin (GO) for renewable energy. By leveraging **evolvable NFTs** and **Zero-Knowledge Proofs (ZKPs)**, GreenTrust ensures transparency, data integrity, and client privacy throughout the GO lifecycle.

---

## Features

- **Evolvable NFTs**: Dynamic tokens representing GO certificates that update their status throughout the lifecycle.
- **Zero-Knowledge Proofs (ZKPs)**: Maintain client privacy while ensuring data integrity without exposing sensitive data.
- **Automated Issuance Process**: Daily cron jobs verify certificates against EMS data and handle the issuance process.
- **Manual Verification Option**: Issuers can manually verify and issue certificates without accessing private data.
- **Audit Mechanism**: Auditors can approve or reject certificates, ensuring compliance.
- **User Dashboards**: Customized interfaces for demanders, issuers, and auditors.

---

## How It Works

### 1. Demand Phase

- **Request**: Energy consumers or brokers request a GO.
- **NFT Creation**: An evolvable NFT is automatically generated with a status of `In Progress`.

### 2. Issuance Phase

- **Automated Verification**:
  - A cron job compares NFT data with EMS data using ZKPs.
  - If the data matches, the NFT status changes to `Issued` and is transferred to the demander.
  - If the data doesn't match, the NFT status changes to `Rejected`.
- **Manual Issuance**:
  - Issuers can verify certificates via the dashboard without accessing private data.
  - They receive verification keys and proofs to confirm the certificate's validity, as the ZKP circuit is made publicly available.
  - Issuers can initiate the issuance process of a certificate via their dashboard.

### 3. Audit Phase

- **Review**: An auditor reviews the certificate.
- **Status Update**:
  - Changes status to `Audited` if approved.
  - Changes status to `Rejected` if discrepancies are found.
- **Rejection Protocol**:
  - If rejected and unchanged for 30 days, the NFT is burned.
  - If updated, the NFT returns to `In Progress` for re-verification.

---

## Challenges

### Sponsored Transactions:

- **Issue**: Wallet limitations prevent the implementation of sponsored transactions.
- **Attempted Solution**: We developed a custom method that uses transaction simulation to estimate gas fees and ask the user to sign a transfer transaction to send us the amount of the gas fees and return it if transaction fails. This method was effective for single transactions but challenging for batch transactions.
- **Current Status**: Pending updates from wallet providers.

---

## Future Work

- **Implement Sponsored Transactions**: Enable demanders to sponsor gas fees seamlessly.
- **Improve User Interface**: Enhance user experience across all dashboards.
- **Integrate a Marketplace**: Create a platform for trading Guarantees of Origin.

### Business Expansion:

#### Onboard Nexus Energía:

- A leading energy company in Spain, supplying 100% certified renewable energy.
- Manages over 16,700 renewable energy producers and 14 TWh of energy annually.

#### Onboard STEG:

- Tunisian Company of Electricity and Gas.
- Aims to expand renewable energy certification in Tunisia.

#### Global Outreach:

- Explore opportunities with additional major energy players to promote renewable energy worldwide.

---

## Installation

### Prerequisites

- **Node.js** (v18 or later)
- **npm** or **yarn**
- **Git**
- **Python** (3.10 or later)
- **snarkjs**
- **MongoDB**

### Clone the Repository

```bash
git clone https://github.com/yourusername/greentrust.git
cd greentrust
```

### Install Dependencies

#### Frontend

```bash
cd frontend
yarn
#or npm
```

#### Backend
```bash
cd backend
yarn
#or npm
```

#### ZKP
```bash
cd ZKP
yarn
#or npm
```

#### Python
```bash
cd python_scripts
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Usage

#### Start the Frontend Server
```bash
cd frontend
yarn dev
#or npm dev
```

#### Start the Backend Server
```bash
cd backend
yarn start
#or npm start
```

#### Start the ZKP Server
```bash
cd ZKP
yarn start
#or npm start
```

#### Python Script
Run this script only once when testing to migrate dummy EMS data into the database, make sure to change the code in upgrade.py file with the corresponding dummy data file path. 
```bash
python upgrade.py
```

### Environment Variables

#### Frontend
Copy the `.env.example` file in the root directory of the frontend folder, rename it to `.env` and fill the environment variables as explained in the file.

#### Backend
Copy the `.env.example` file in the root directory of the backend folder, rename it to `.env` and fill the environment variables as explained in the file.

#### ZKP
Copy the `.env.example` file in the root directory of the frontend ZKP, rename it to `.env` and fill the environment variables as explained in the file.

---

## License
This project is licensed under the MIT License.

---

## Contact

For any questions or inquiries, please contact us:

- **Email**: [contact@lightency.com](mailto:contact@lightency.io)
- **Website**: [Lightency](https://lightency.io)
- **LinkedIn**: [Lightency on LinkedIn](https://www.linkedin.com/company/electrify-network/mycompany/)

