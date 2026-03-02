# API Contracts

This document outlines the API contracts for the various microservices.

## Auth Service
- `POST /auth/login`
  - Body: `{ email, password }`
  - Returns: `{ token }`

## Patient Service
- `GET /patients/{id}`
  - Returns: `{ patientId, name, age, gender }`
- `POST /patients`
  - Body: `{ name, age, gender }`
  - Returns: `{ patientId }`

## Appointment Service
- `POST /appointments`
  - Body: `{ patientId, doctorId, date, time }`
  - Returns: `{ appointmentId }`

## WhatsApp Service
- `POST /whatsapp/webhook`
  - Handles incoming messages from WhatsApp API.

## SOAP Service
- `POST /soap/generate`
  - Body: `{ consultationText }`
  - Returns: `{ soapNote }`
