# ATS Resume Analyzer - Frontend

Modern React frontend for the ATS Resume Analyzer application.

## Features

- 🎯 Drag and drop resume upload (PDF/TXT)
- 📝 Job description text input
- 🔍 Real-time ATS score analysis
- 📊 Visual score display with animated progress circle
- ✅ Matched skills highlighting
- ❌ Missing skills identification
- 💪 Strengths analysis
- 💡 Improvement suggestions
- 🎨 Modern UI with Tailwind CSS
- 📱 Fully responsive design
- ⚡ Fast and smooth user experience

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Fetch API** - Backend communication

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend server running on `http://localhost:3000`

### Installation

```bash
cd client
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
client/
├── src/
│   ├── components/          # React components
│   │   ├── FileUpload.tsx   # Drag & drop file upload
│   │   ├── JobDescriptionInput.tsx
│   │   ├── ResultsDisplay.tsx
│   │   ├── ScoreCircle.tsx  # Animated score visualization
│   │   ├── SkillsList.tsx   # Skills display
│   │   └── SuggestionsList.tsx
│   ├── services/            # API services
│   │   └── api.ts           # Backend API calls
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML template
└── package.json
```

## API Integration

The frontend communicates with the backend API at `http://localhost:3000/api/analyze`

### Request Format

- **Method**: POST
- **Content-Type**: multipart/form-data
- **Fields**:
  - `resume`: File (PDF or TXT)
  - `jd`: String (Job description text)

### Response Format

```json
{
  "score": 85,
  "matchedSkills": ["JavaScript", "React", "TypeScript"],
  "missingSkills": ["Python", "AWS"],
  "strengths": ["Strong technical skills", "Good experience"],
  "suggestions": ["Add cloud certifications", "Include metrics"]
}
```

## Customization

### Colors

Edit `client/tailwind.config.js` to customize the color scheme:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

### API Endpoint

Edit `client/src/services/api.ts` to change the backend URL:

```ts
const API_BASE_URL = 'http://your-backend-url';
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT