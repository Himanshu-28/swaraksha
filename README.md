# Swaraksha - AI Healthcare Documentation Assistant

> Multilingual voice-first digital assistant for small Indian clinics - automating clinical documentation with AWS AI services

**Swaraksha** (स्वरक्षा) - meaning "voice protection" in Sanskrit - safeguards patient care through intelligent voice documentation.

## Overview

An AI-powered system that transforms doctor-patient consultations into structured clinical documentation, generates prescriptions, and delivers patient-friendly summaries via WhatsApp—all in Hindi, English, or code-switched conversations.

## Key Features

- 🎤 **Real-time Transcription**: Converts Hindi/English consultations to text using Amazon Transcribe
- 📋 **SOAP Note Generation**: Automatically creates structured clinical notes with Amazon Bedrock
- 💊 **Smart Prescriptions**: Extracts medications and generates prescription drafts
- 📱 **WhatsApp Integration**: Sends diagnosis summaries and medication instructions in patient's language
- 🔒 **Privacy-First**: End-to-end encryption, consent management, and automatic data retention
- 🌐 **Multilingual**: Native support for Hindi, English, and code-switching scenarios
- ⚡ **Serverless**: Built on AWS Lambda, Aurora Serverless, and Step Functions for scalability

## Architecture

```
Consultation → Transcribe → Bedrock (SOAP) → Comprehend Medical → Translate → WhatsApp
                    ↓              ↓                  ↓               ↓
                  Aurora      Step Functions      S3 Storage      SNS/API
```

## Tech Stack

- **Compute**: AWS Lambda (Node.js 18.x)
- **Database**: Amazon Aurora Serverless v2 PostgreSQL
- **AI/ML**: Amazon Transcribe, Bedrock (Claude 3), Comprehend Medical, Translate
- **Orchestration**: AWS Step Functions
- **Messaging**: WhatsApp Business API via Amazon SNS
- **Auth**: Amazon Cognito
- **Infrastructure**: AWS CDK (TypeScript)

## Quick Start

```bash
# Install dependencies
npm install

# Deploy infrastructure
npm run cdk:deploy

# Run tests
npm test

# Enable demo mode
npm run demo
```

## Demo Mode

Includes synthetic patient data with realistic Hindi-English code-switching consultations for safe demonstration without real patient information.

## Use Case

Designed for small Indian clinics processing 40-60 patients/day, reducing documentation time from 5-10 minutes to under 90 seconds per consultation.

## Cost

Estimated $106-192/month for typical clinic usage (60 consultations/day).

## Compliance

- Data encryption at rest (AES-256) and in transit (TLS 1.3)
- Automatic audio deletion after 24 hours
- Role-based access control (Doctor, Receptionist, Administrator)
- Comprehensive audit logging

## License

MIT

## About Swaraksha

**Swaraksha** combines "Swara" (स्वर - voice) and "Raksha" (रक्षा - protection), embodying our mission to protect and preserve patient care through intelligent voice documentation. The system ensures accurate clinical records while respecting patient privacy and supporting India's linguistic diversity.

## Hackathon Submission

Built for [Hackathon Name] - demonstrating AI-powered healthcare automation for resource-constrained clinics in India.
