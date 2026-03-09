# AWS Deployment Inventory (Hackathon Snapshot)

This file captures the currently deployed AWS resources used by Swaraksha, fetched on 2026-03-09 using AWS CLI profile `pairadox` in region `ap-south-1`.

## Lambda Functions

- `Swaraksha-Search-Patients` (`nodejs20.x`, `index.handler`)
- `swarksha-pre-signup` (`python3.12`, `pre_signup.handler`)
- `Swaraksha-Get-Notes` (`nodejs20.x`, `index.handler`)
- `swaraksha-prescription-extraction` (`nodejs20.x`, `handler.handler`)
- `Swaraksha-Create-Prescription` (`nodejs20.x`, `index.handler`)
- `swarksha-post-confirmation` (`nodejs20.x`, `index.handler`)
- `Swaraksha-Create-Patient` (`nodejs20.x`, `index.handler`)
- `swaraksha-soap-service` (`nodejs18.x`, `index.handler`)
- `Swaraksha-Get-Patient` (`nodejs20.x`, `index.handler`)
- `swaraksha-ai-auth` (`nodejs18.x`, `handler.handler`)
- `Swaraksha-Get-Presigned-Url` (`nodejs20.x`, `index.handler`)
- `ApiAuthStack-BucketNotificationsHandler050a0587b75-rx1b2F9S4Jk8` (`python3.13`, `index.handler`)

## Cognito

### User Pools

- `swaraksha-user-pool`: `ap-south-1_ZOAs8JsXJ`
- `SwarakshaDoctorUserPool`: `ap-south-1_byWYZ74sf`

### App Clients

- For `ap-south-1_ZOAs8JsXJ`: `swaraksha-ai-client` (`61robehq4vog6tp16ssdkq8edg`)
- For `ap-south-1_byWYZ74sf`: `DoctorUserPoolClient3739C3EC-K6Irb0MpqSrB` (`9i71gb2d2jbuam78o7rteh69r`)

## ECS (Transcription Service)

- Cluster: `swaraksha-cluster`
- Service: `transcription-service`
- Launch type: `FARGATE`
- Desired/Running count: `1/1`
- Task definition: `transcription-service:1`
- Container image: `470855104870.dkr.ecr.ap-south-1.amazonaws.com/swaraksha/transcription-service:latest`
- Container port: `8080`

## API Gateway

- REST API: `Swaraksha Doctor API` (`i6a1l4o09d`)
- Stage: `prod`
- Base URL: `https://i6a1l4o09d.execute-api.ap-south-1.amazonaws.com/prod`

## Notes

- No AWS credentials or private keys were found in tracked repository files during regex-based scanning.
- Runtime-generated and local-only artifacts were cleaned from version control where possible (for example, archived build artifacts and local agent files).
