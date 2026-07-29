# Health API

## Endpoint

GET /health

## Description

Checks whether the Emotion AI Service is running and available to process requests.

## Request

Method:
GET

Headers:
None

Body:
None

## Success Response

Status Code:
200 OK

Response

```json
{
  "service": "Emotion AI Service",
  "status": "running",
  "version": "1.0.0"
}
```

## Error Response

Status Code:
500 Internal Server Error

```json
{
  "detail": "Health check failed."
}
```