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

# GreenTrust

**Revolutionizing Renewable Energy Certification with Blockchain and Zero-Knowledge Proofs**

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
- [Contributing](#contributing)
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
- **Scalability**: Designed to handle increasing demand for renewable energy certificates.

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

## Installation

### Prerequisites

- **Node.js** (v18 or later)
- **npm** or **yarn**
- **Git**
- **Python** (3.10 or later)
- **snarkjs**

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

### Backend
```bash
cd backend
yarn
#or npm
```

### ZKP
```bash
cd ZKP
yarn
#or npm
