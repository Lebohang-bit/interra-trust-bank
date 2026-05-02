# 🏦 Interra Trust Bank System

![Security Grade](https://img.shields.io/badge/Security-A%2B-brightgreen)
![Firebase](https://img.shields.io/badge/Powered%20By-Firebase-blue)

## ✨ Overview

Interra Trust Bank System is a **fully secured international payment platform** designed for bank-grade operations. Customers can register, login, and make SWIFT international payments while employees verify and submit transactions.

## 🔐 Security First Approach

| Security Feature | Implementation |
|-----------------|----------------|
| 🔑 Password Security | Firebase Auth (bcrypt hashing + salting) |
| ✅ Input Whitelisting | Regex validation for ID, Account, SWIFT codes |
| 🛡️ Attack Protection | Rate limiting (3-5 attempts lockout) |
| 🔒 Data in Transit | Firebase Hosting (HTTPS/SSL) |
| 🚀 DevSecOps | GitHub Actions security pipeline |

## 👥 User Flows

### 🧑‍💼 Customer Flow:
1. Register → 2. Login → 3. Create Payment → 4. Pay Now

### 👩‍💼 Employee Flow:
1. Employee Login → 2. View Transactions → 3. Verify → 4. Submit to SWIFT

## 🛠️ Tech Stack

- **Frontend:** React.js + Bootstrap
- **Backend:** Firebase (Auth + Firestore)
- **Security:** Rate limiting, Input validation, CORS
- **CI/CD:** GitHub Actions (DevSecOps pipeline)

## 🚀 Quick Start

```bash
npm install
npm start
