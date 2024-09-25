const express = require('express')
const mongoose = require('mongoose')

const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const { Schema, model } = mongoose

// Schema for the data structure you provided
const dataSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    CIF: {
      type: String,
      required: true,
    },
    RazonSocial: {
      type: String,
      required: true,
    },
    CodigoPlanta: {
      type: String,
      required: true,
    },
    CIL: {
      type: String,
      required: true,
    },
    Año: {
      type: String,
      required: true,
    },
    Mes: {
      type: String,
      required: true,
    },
    FechaInicio: {
      type: String,
      required: true,
    },
    FechaFin: {
      type: String,
      required: true,
    },
    GarantiaSolicitada: {
      type: Number,
      required: true,
    },
    TipoCesion: {
      type: String,
      required: true,
    },
    idContratoGDO: {
      type: String,
      required: true,
    },
    idDatosGestion: {
      type: String,
      required: true,
    },
    Potencia: {
      type: Number,
      required: true,
    },
    Tecnologia: {
      type: String,
      required: true,
    },
    sum: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true,
    }
  },
  {
    timestamps: true, 
  }
)

module.exports = model('Data', dataSchema)