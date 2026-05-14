# ATS Resume Analyzer - Complete Setup Guide

This guide will help you set up and run both the frontend and backend of the ATS Resume Analyzer application.

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Git (optional)

## Quick Start

### 1. Install Dependencies

#### Backend Dependencies
```bash
npm install
```

#### Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 2. Start the Backend Server

In one terminal window:

```bash
npm start
```

The backend API will start on `http://localhost:3000`

### 3. Start the Frontend Development Server

In another terminal window:

```bash
cd client
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## Usage

1. **Upload Resume**: Drag and drop your resume (PDF or TXT format) or click to browse
2. **Enter Job Description**: Paste the complete job description in the text area
3. **Analyze**: Click the "Analyze Resume" button
4. **View Results**: See your ATS compatibility score, matched/missing skills, strengths, and improvement suggestions

## Project Structure

```
ATS-app/
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API integration
│   │   ├── types/           # TypeScript definitions
│   │   └── App.tsx          # Main app component
│   └── package.json
├── server/                  # Backend Express server
│   └── index.ts
├── src/                     # Core ATS logic
│   ├── parsers/             # Resume & JD parsers
│   ├── scoring/             # ATS scoring algorithm
│   └── suggestions/         # Suggestion generator
└── package.json
```

## API Endpoints

### POST /api/analyze

Analyzes a resume against a job description.

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `resume`: File (PDF or TXT)
  - `jd`: String (Job description)

**Response:**
```json
{
  "success": true,
  "score": 85,
  "matchedSkills": ["JavaScript", "React"],
  "missingSkills": ["Python"],
  "strengths": ["Strong technical background"],
  "suggestions": ["Add cloud experience"]
}
```

## Development

### Backend Development

The backend uses:
- Express.js for the API server
- Multer for file uploads
- Custom parsers for resume and JD analysis
- ATS scoring algorithm

To modify the backend:
1. Edit files in `server/` and `src/` directories
2. Restart the backend server to see changes

### Frontend Development

The frontend uses:
- React 19 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Hot Module Replacement (HMR) for instant updates

To modify the frontend:
1. Edit files in `client/src/` directory
2. Changes will appear instantly in the browser

## Building for Production

### Build Frontend

```bash
cd client
npm run build
```

The production build will be in `client/dist/`

### Serve Production Build

You can serve the production frontend with the backend:

1. Build the frontend (see above)
2. Configure the backend to serve static files from `client/dist/`
3. Start the backend server

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use:

**Backend:**
Edit `server/index.ts` and change the PORT variable

**Frontend:**
Edit `client/vite.config.ts` and add:
```ts
export default defineConfig({
  server: {
    port: 3001 // Your preferred port
  }
})
```

### CORS Issues

If you encounter CORS errors, ensure the backend has CORS enabled:
```ts
app.use(cors());
```

### File Upload Issues

Ensure the `uploads/` directory exists in the project root:
```bash
mkdir uploads
```

## Environment Variables

Create a `.env` file in the root directory (optional):

```env
PORT=3000
NODE_ENV=development
```

## Testing

### Test with Sample Files

Sample files are provided in the project:
- `sample-resume.txt` - Sample resume
- `sample-jd.txt` - Sample job description

Use these to test the application functionality.

## Features

✅ Drag and drop file upload
✅ Real-time ATS score calculation
✅ Skills matching analysis
✅ Visual score display
✅ Strengths identification
✅ Improvement suggestions
✅ Responsive design
✅ Modern UI/UX
✅ Loading states
✅ Error handling

## Support

For issues or questions:
1. Check the console for error messages
2. Verify both servers are running
3. Ensure file formats are supported (PDF/TXT)
4. Check network requests in browser DevTools

## License

MIT License - See LICENSE file for details