# CivicFix AI

CivicFix AI is an AI-powered smart city complaint and maintenance management system.

Citizens can report city problems using photos, descriptions, and GPS location. City officers and admins can manage complaints, assign work, track SLA, and use AI support for classification, priority, duplicate detection, and reports.

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: Laravel REST API
- Database: MySQL
- AI/ML Service: Python FastAPI
- Queue: Laravel Database Queue first, Redis later if needed
- Storage: Local storage first, S3 later if needed

## Project Structure

```txt
civicfix-ai/
├── frontend/
├── backend/
├── ml-service/
├── database/
├── storage/
└── scripts/