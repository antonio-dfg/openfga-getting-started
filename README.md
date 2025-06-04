# OpenFGA Authorization Project

A simple authorization system built with OpenFGA that demonstrates fine-grained access control for document sharing.

## Features

- **Document-based authorization** with owner, editor, and viewer roles
- **RESTful API** for checking permissions and managing relationships
- **Docker setup** for running OpenFGA locally
- **TypeScript implementation** with express.js
- **Hierarchical permissions** where owners can write/read, editors can write/read, viewers can only read

## Quick Start

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
OPENFGA_API_URL=http://localhost:8080
OPENFGA_STORE_ID=
OPENFGA_AUTHORIZATION_MODEL_ID=
PORT=3001
```

### 3. Start OpenFGA Server

```bash
npm run docker:up
```

This starts:
- PostgreSQL database on port 5432
- OpenFGA server on port 8080
- OpenFGA playground on port 3000

### 4. Setup Store and Authorization Model

Run the setup script to create the OpenFGA store and load the authorization model:

```bash
npm run setup
```

This script will:
1. Create a new store in OpenFGA
2. Upload the authorization model from `models/authorization-model.json`
3. Update your `.env` file with the store ID and model ID

### 5. Start the Application

```bash
npm run dev
```

The API server will start on http://localhost:3001

🎉 **New!** Visit http://localhost:3001 in your browser to access the **interactive testing UI**!

## Authorization Model

The project uses a simple document sharing model with these types:

- **user**: Represents a user in the system
- **organization**: Groups users with member/admin relationships  
- **document**: Files that can be shared with different permission levels

### Document Relations

- `owner`: Can read and write the document
- `editor`: Can read and write the document
- `viewer`: Can only read the document  
- `can_read`: Computed relation that includes viewers, editors, and owners
- `can_write`: Computed relation that includes editors and owners

## API Endpoints

### Check Authorization

```http
POST /api/check
Content-Type: application/json

{
  "user": "user:alice",
  "relation": "can_read", 
  "object": "document:doc1"
}
```

### Create Document Ownership

```http
POST /api/documents/:documentId/owner
Content-Type: application/json

{
  "userId": "alice"
}
```

### Share Document

```http
POST /api/documents/:documentId/share  
Content-Type: application/json

{
  "userId": "bob",
  "permission": "editor"  // or "viewer"
}
```

### Check Document Access

```http
GET /api/documents/:documentId/can-read/:userId
GET /api/documents/:documentId/can-write/:userId
```

### Setup Example Data

```http
POST /api/setup-example-data
```

Creates sample relationships for testing.

## Testing the System

### 🖥️ Web UI (Recommended)

Visit **http://localhost:3001** in your browser for an interactive testing interface that includes:

- **Authorization Checker**: Test any user/relation/object combination
- **Document Management**: Create ownership and share documents
- **Quick Tests**: Pre-configured test scenarios
- **System Status**: Real-time health monitoring
- **Results Panel**: Complete API call history

### 📡 API Examples (Command Line)

1. **Create example data:**
   ```bash
   curl -X POST http://localhost:3001/api/setup-example-data
   ```

2. **Check if Alice can read doc1:**
   ```bash
   curl -X GET http://localhost:3001/api/documents/doc1/can-read/alice
   ```

3. **Check if Charlie can write doc1:**
   ```bash
   curl -X GET http://localhost:3001/api/documents/doc1/can-write/charlie
   ```

4. **Share doc1 with Dave as editor:**
   ```bash
   curl -X POST http://localhost:3001/api/documents/doc1/share \
     -H "Content-Type: application/json" \
     -d '{"userId": "dave", "permission": "editor"}'
   ```

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript  
- `npm start` - Start production server
- `npm run docker:up` - Start OpenFGA with Docker
- `npm run docker:down` - Stop Docker containers
- `npm test` - Run tests

### Project Structure

```
src/
├── index.ts              # Application entry point
├── config.ts             # Environment configuration  
├── services/
│   └── authz.service.ts  # OpenFGA client wrapper
└── routes/
    └── index.ts          # API route definitions

models/
└── authorization-model.json  # OpenFGA authorization model

docker-compose.yml        # OpenFGA server setup
scripts/
└── setup.js              # Store and model setup script
```

## Understanding the Authorization Model

The authorization model defines these relationships:

### Direct Relationships
- Users can be `owner`, `editor`, or `viewer` of documents
- Users can be `member` or `admin` of organizations

### Computed Relationships  
- `can_read` includes anyone who is a `viewer`, `editor`, or `owner`
- `can_write` includes anyone who is an `editor` or `owner`

### Hierarchical Access
- Organizations can be set as `parent` of documents
- Users inherit document permissions through organization membership

## OpenFGA Resources

- [OpenFGA Documentation](https://openfga.dev/docs)
- [OpenFGA Playground](http://localhost:3000) (when running locally)
- [Authorization Model DSL](https://openfga.dev/docs/configuration-language)

## Troubleshooting

### Common Issues

1. **Connection refused to OpenFGA**: Make sure Docker containers are running with `npm run docker:up`

2. **Store ID or Model ID missing**: Run the setup script with `npm run setup`

3. **TypeScript errors**: Install dependencies with `npm install`

4. **Port conflicts**: Change the PORT in `.env` file

### Logs

- OpenFGA logs: `docker logs openfga`
- Application logs: Check terminal output when running `npm run dev`

## Next Steps

To extend this project, consider:

- Adding user authentication/sessions
- Implementing organization-based permissions
- Adding audit logging for authorization decisions
- Creating a web frontend for testing
- Adding more complex hierarchical relationships 