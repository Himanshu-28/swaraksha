---
description: Scaffold the clinic AI microservices backend and project structure
---

# Setup Clinic AI Microservices Project

1. Initialize a new Git repository with a monorepo structure:

   - `/services` for each Lambda microservice
   - `/shared` for shared logic
   - `/infrastructure` for SAM/Serverless infra
   - `/frontend` for UI dashboards

2. Create folders for each required microservice:

   - `services/auth-service`
   - `services/patient-service`
   - `services/appointment-service`
   - `services/whatsapp-service`
   - `services/transcription-service`
   - `services/soap-service`
   - `services/prescription-service`
   - `services/notification-service`

3. In each service folder, generate basic Lambda files:

   ```bash
   touch handler.js service.js repository.js types.js

4. Set up shared utilities and models:
   - `shared/utils/logger.js`
   - `shared/utils/responseBuilder.js`
   - `shared/models/Patient.js`
   - `shared/models/Appointment.js`
   - `shared/models/Consultation.js`
   - `shared/models/SOAP.js`
   - `shared/models/Prescription.js`

5. Create an infra template file:
   - `infrastructure/template.yaml`
Include Lambdas, API Gateway routes, SQS queues, and DynamoDB tables.

6. Initialize infrastructure config and environments:
```bash
cp infrastructure/env.example.json infrastructure/env.json
```

7. In the project root, create a comprehensive README.md with:
   - Project overview
   - Architecture diagram
   - How to run locally
   - Deployment steps

8. Create API contract documentation:
   - `docs/api-contracts.md`

9. Scaffold frontend projects:
   - `frontend/doctor-dashboard`
   - `frontend/patient-bot-admin`

10. Set up a basic test directory:
   - `tests/unit`
   - `tests/integration`

11. Push initial changes to GitHub with conventional commits.

12. After scaffolding, generate utilities such as:
   - `/generate models`
   - `/generate middlewares`
   - `/generate infra`

13. Validate that all folders and files are created and correctly configured.