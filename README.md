# Fortune Teller Backend

A NestJS-based backend service for a fortune telling application that uses tarot cards and AI-powered interpretations.

## Features

- 🎴 Tarot card recognition and interpretation
- 🔮 AI-powered fortune telling
- 💾 Session management and persistence
- 🖼️ Image storage for tarot cards
- 🤖 Natural language processing for user questions
- 📱 RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Azure account with:
  - Azure OpenAI service
  - Cosmos DB
  - Blob Storage

## Environment Variables

Create a `.env` file in the root directory with:

```env
PORT=3000
AZURE_OPENAI_API_KEY=your_openai_key
AZURE_OPENAI_URL=your_openai_url
COSMOS_DB_CONNECTION_STRING=your_cosmos_connection_string
AZURE_STORAGE_CONNECTION_STRING=your_storage_connection_string
```

## Installation

```bash
# Install dependencies
npm install
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production build and run
npm run build
npm run start:prod
```

## API Endpoints

### Sessions
- POST /sessions - Create new fortune telling session
- GET /sessions?sessionId={id} - Get session details
- PATCH /sessions/cardsByFile - Add cards from image
- POST /sessions/cardByDescription - Add card by description
- PATCH /sessions/fortune - Generate fortune

## Architecture
- NestJS framework
- Azure OpenAI for card recognition/fortune telling
- Azure Cosmos DB for session storage
- Azure Blob Storage for images