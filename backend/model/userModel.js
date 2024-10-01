const bodyParser = require('body-parser')
const express = require('express')
const mongoose = require('mongoose')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const { Schema, model } = mongoose

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['auditor', 'issuer', 'demander'],
      required: true,
    },
    // Auditor-specific fields
    companyName: {
      type: String,
      required: function () {
        return this.role === 'auditor'
      },
    },
    licence: {
      type: String,
      required: function () {
        return this.role === 'auditor'
      },
    },
    // Demander-specific field
    organization: {
      type: String,
      enum: ['Nexus', 'Steg', 'ENIT', 'CNMC', 'Auditor', 'element3'],
      default: 'Nexus',
    }
  },
  {
    timestamps: true, // Automatically handles createdAt and updatedAt fields
  }
)

module.exports = userSchema;
