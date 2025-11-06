# ST8

Service Territorial Bordeaux Maritime / Bastide N° 8

## Description

ST8 PRO is a web application for managing territorial service operations, including agent management, planning, and statistics.

## Features

- Agent management
- Monthly planning
- Bi-weekly planning
- Weekly planning
- Variable elements
- Annual statistics
- EasyDict integration
- MongoDB integration with file-based fallback

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (optional - the app will use file-based storage if MongoDB is unavailable)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/lamiedepain/ST8.git
cd ST8
```

2. Install dependencies:
```bash
cd server
npm install
```

3. Configure MongoDB (optional):
   - Set the `MONGO_URI` environment variable to your MongoDB connection string
   - If not set, the app will use file-based storage from `data/agents_source.json`

4. Start the server:
```bash
npm start
```

The server will run on port 3000 by default (or the port specified in the `PORT` environment variable).

## Deployment on Render

### Environment Variables

Set the following environment variable in your Render dashboard:

- `MONGO_URI`: Your MongoDB connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/database`)
- `PORT`: (Optional) The port number (Render will set this automatically)

### Build Command

```
cd server && npm install
```

### Start Command

```
cd server && npm start
```

### Important Notes

1. **MongoDB Connection**: The application includes automatic fallback to file-based storage if MongoDB is unavailable. This ensures the app continues to function even during connection issues.

2. **JavaScript Files**: All JavaScript files are now properly served with the correct `Content-Type: application/javascript` header, fixing the "Unexpected token '<'" errors.

3. **Health Check**: The app includes a `/health` endpoint for monitoring:
   ```
   GET /health
   ```

## Troubleshooting

### JavaScript Syntax Errors

If you see errors like `Uncaught SyntaxError: Unexpected token '<'`, ensure:
- The server is running and accessible
- JavaScript files are being served from the correct paths (`/js/*.js`)
- No CDN or proxy is intercepting requests

### MongoDB Connection Issues

The app will automatically fall back to file-based storage if MongoDB is unavailable. Check the server logs for connection status:
- `Connected to MongoDB` - Connection successful
- `MongoDB connection error` - Using file-based fallback

### File-Based Storage

When using file-based storage (MongoDB not available), data is stored in:
- `data/agents_source.json` - Main data file
- Backup files are created with timestamps (`.bak` extension)

## License

MIT