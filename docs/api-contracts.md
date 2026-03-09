# API Contracts

All REST endpoints are served by **Swaraksha Doctor API** via Amazon API Gateway.

**Base URL:** `https://i6a1l4o09d.execute-api.ap-south-1.amazonaws.com/prod`

All endpoints require a valid **Cognito JWT** (Doctor pool) in the `Authorization` header, except where noted.

---

## Patients

### `GET /patients`
Search / list patients.

| Query param | Type | Description |
|---|---|---|
| `search` | string | Optional — name or phone number search term |

**Response `200`**
```json
[
  {
    "patientId": "uuid",
    "name": "string",
    "age": 30,
    "gender": "M | F | Other",
    "phone": "string"
  }
]
```

---

### `POST /patients`
Create a new patient.

**Request body**
```json
{
  "name": "string",
  "age": 30,
  "gender": "M | F | Other",
  "phone": "string"
}
```

**Response `201`**
```json
{ "patientId": "uuid" }
```

---

### `GET /patients/{patientId}`
Fetch a single patient's profile.

**Response `200`**
```json
{
  "patientId": "uuid",
  "name": "string",
  "age": 30,
  "gender": "M | F | Other",
  "phone": "string"
}
```

---

## SOAP Notes

### `POST /soap/generate`
Generate a SOAP note from a consultation transcript using **Amazon Bedrock (Claude 3)**.

**Request body**
```json
{
  "consultationText": "string",
  "patientId": "uuid",
  "language": "en | hi"
}
```

**Response `200`**
```json
{
  "soapNote": {
    "subjective": "string",
    "objective": "string",
    "assessment": "string",
    "plan": "string"
  }
}
```

---

## Notes (Consultation History)

### `GET /notes`
Retrieve saved consultation notes for the authenticated doctor.

| Query param | Type | Description |
|---|---|---|
| `patientId` | string | Filter notes by patient |

**Response `200`**
```json
[
  {
    "noteId": "uuid",
    "patientId": "uuid",
    "createdAt": "ISO8601",
    "soapNote": { "subjective": "...", "objective": "...", "assessment": "...", "plan": "..." },
    "transcript": "string"
  }
]
```

---

## Prescriptions

### `POST /prescriptions`
Create or save a prescription linked to a consultation.

**Request body**
```json
{
  "patientId": "uuid",
  "noteId": "uuid",
  "medications": [
    {
      "name": "string",
      "dosage": "string",
      "frequency": "string",
      "duration": "string"
    }
  ],
  "instructions": "string"
}
```

**Response `201`**
```json
{ "prescriptionId": "uuid" }
```

---

## Audio / Presigned Upload

### `POST /audio`
Request a presigned S3 URL for uploading a recorded audio file.

**Request body**
```json
{
  "patientId": "uuid",
  "contentType": "audio/webm | audio/wav"
}
```

**Response `200`**
```json
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "audioKey": "s3-object-key"
}
```

---

## Real-time Transcription (WebSocket)

The transcription service runs separately on **ECS Fargate** and is accessed via a WebSocket (not API Gateway).

**WebSocket URL:** Exposed via an Application Load Balancer on port 8080.  
Contact the deployment owner for the current ALB DNS name.

**Protocol**

```
1. onopen  → send { "sample_rate": 16000 }
2. receive → { "status": "ready" }
3. stream  → send { "audioData": "<base64 int16 PCM>" }  (repeated)
4. receive → { "transcript": "...", "isFinal": true|false, "language_code": "hi|en" }
5. onclose / stopListening — connection closed by client when done
```

The React hook `frontend/src/hooks/useRealtimeSTT.ts` implements this protocol and manages microphone capture.

---

## Authentication

Swaraksha uses two separate **Amazon Cognito** User Pools:

| Pool | Purpose | Pool ID | Client ID |
|---|---|---|---|
| `SwarakshaDoctorUserPool` | Doctor login | `ap-south-1_byWYZ74sf` | `9i71gb2d2jbuam78o7rteh69r` |
| `swaraksha-user-pool` | Patient login | `ap-south-1_ZOAs8JsXJ` | `61robehq4vog6tp16ssdkq8edg` |

Cognito triggers:
- `swarksha-pre-signup` — validates and enriches sign-up data before user creation
- `swarksha-post-confirmation` — runs post-confirmation setup (e.g. creates patient record)
