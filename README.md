# ATS Resume Analyzer & Optimizer

A comprehensive ATS (Applicant Tracking System) resume analysis and optimization platform with both CLI and Web UI interfaces. Analyze your resume against job descriptions, get actionable suggestions, and **optimize your resume using AI** to increase your chances of passing ATS filters.

---

## 🚀 Features

### Core Analysis Engine
- 📊 **ATS Score Calculation (0-100)** — Comprehensive scoring based on keyword match, skill alignment, experience, formatting, and readability
- 🎯 **Actionable Suggestions** — Get specific, prioritized recommendations to improve your resume
- 📄 **Multi-Format Support** — Analyze PDF (.pdf), Word Documents (.docx), and Plain Text (.txt) files
- 🔍 **Quick Scan** — Fast ATS check without needing a job description
- 📤 **GitHub Integration** — Push analysis results directly to GitHub repositories
- 🚀 **Full Pipeline** — Analyze and push to GitHub in one command

### AI Resume Optimizer (Web UI)
- 🤖 **AI-Powered Optimization** — Uses local LLM infrastructure (9Router) to intelligently rewrite your resume
- 🔧 **Three Optimization Modes**:
  - **🛡️ Conservative** — Minimal changes, preserves original wording (safe optimization)
  - **⚖️ Balanced** — Optimal ATS + readability (recommended default)
  - **🚀 Aggressive** — Maximum ATS optimization (rewrites heavily for keyword density)
- ✍️ **Professional Summary Generation** — AI crafts compelling, ATS-optimized professional summaries
- 🎯 **Smart Keyword Integration** — Automatically identifies and adds missing keywords from job descriptions
- 💪 **Bullet Point Rewriting** — Transforms weak bullet points into strong, impact-driven statements with action verbs
- 🔄 **Before & After Comparison** — Side-by-side view of original vs AI-optimized content
- 📊 **Advanced ATS Analysis** — Keyword density, readability score, action verb analysis, weak bullet detection

### PDF Export Engine
- 📄 **Recruiter-Ready Resume PDF** — Professional A4 layout with proper typography, headers, sections and formatting
- 📊 **ATS Report PDF** — Detailed analysis report with score comparison, metrics dashboard, matched/missing skills
- 🔄 **Comparison PDF** — Landscape-format before/after comparison showing original vs optimized content side-by-side
- 🎨 **Professional Styling** — Color-coded sections, gradient headers, proper spacing and page breaks
- ⬇️ **One-Click Download** — All PDFs generated client-side with loading indicators

### Text Export
- 💾 **Server Save** — Save optimized results to server for persistence
- 📥 **TXT Download** — Download optimized resume or full comparison report as plain text
- 📋 **Clipboard Copy** — One-click copy for individual sections or entire optimized resume
- 🏷️ **Section-Specific Copy** — Copy summary, skills, or experience independently

### Architecture
- 🖥️ **Monorepo Structure** — Server, client, and CLI in a single project
- ⚡ **Vite + React + TypeScript** — Modern, fast frontend tooling
- 🔌 **Express.js Backend** — RESTful API with file upload management
- 🧠 **9Router LLM Integration** — Local AI processing, no external API calls needed
- 🚦 **End-to-End Type Safety** — Shared types between frontend and backend

---

## 📋 Table of Contents

1. [Installation](#installation)
2. [CLI Usage](#cli-usage)
3. [Web UI Setup](#web-ui-setup)
4. [9Router AI Integration](#9router-ai-integration)
5. [PDF Export](#pdf-export)
6. [ATS Score Breakdown](#ats-score-breakdown)
7. [Project Structure](#project-structure)
8. [API Endpoints](#api-endpoints)
9. [Environment Variables](#environment-variables)
10. [Tips for Best Results](#tips-for-best-results)
11. [Troubleshooting](#troubleshooting)
12. [Contributing](#contributing)
13. [License](#license)

---

## 📦 Installation

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **9Router** (for AI optimization) — See [9Router Integration](#9router-ai-integration)

### Install CLI from npm
```bash
npm install -g ats-app
```

### Or build from source (Full Project)
```bash
# Clone the repository
git clone https://github.com/yourusername/ats-app.git
cd ats-app

# Install all dependencies (root + client + server)
npm install
cd client && npm install && cd ..

# Build the project
npm run build

# (Optional) Link CLI globally
npm link
```

---

## 🔧 CLI Usage

### 1. Analyze Resume Against Job Description
```bash
ats-app analyze --resume <resume-path> --jd <jd-path>
```
**Example:**
```bash
ats-app analyze --resume resume.pdf --jd job-description.txt
```
**Output:**
- ATS Score (0-100)
- Score breakdown by criteria
- Matched and missing skills
- Strengths and weaknesses
- Detailed suggestions prioritized by impact

### 2. Quick Scan (No Job Description Needed)
```bash
ats-app scan --resume <resume-path>
```
**Example:**
```bash
ats-app scan --resume resume.pdf
```
**Output:**
- Quick ATS score
- Resume statistics
- General ATS issues
- Formatting and readability assessment

### 3. Push Results to GitHub
```bash
ats-app push --resume <resume-path> --jd <jd-path> --owner <github-username> --repo <repo-name> [--token <token>] [--branch <branch-name>]
```
**Example:**
```bash
ats-app push --resume resume.pdf --jd job-description.txt --owner johndoe --repo ats-analysis --token github_pat_xxxxx
```
**Options:**
- `-r, --resume <path>` — Path to resume file (required)
- `-j, --jd <path>` — Path to job description file (required)
- `-o, --owner <owner>` — GitHub username or organization (required)
- `-rp, --repo <repo>` — GitHub repository name (required)
- `-t, --token <token>` — GitHub token (optional, uses `GITHUB_TOKEN` env var if not provided)
- `-b, --branch <branch>` — Branch name (default: main)

### 4. Full Pipeline (Analyze + Push)
```bash
ats-app full --resume <resume-path> --jd <jd-path> --owner <github-username> --repo <repo-name> [--token <token>] [--branch <branch-name>]
```
**Example:**
```bash
ats-app full --resume resume.pdf --jd job-description.txt --owner johndoe --repo ats-analysis
```

---

## 🌐 Web UI Setup

### Starting the Backend Server
```bash
# From project root
npm run dev
```
The server starts on **http://localhost:5000** with:
- Resume file upload & management (`POST /api/upload`)
- Resume file serving (`GET /api/resumes/:filename`)
- Optimized resume saving (`POST /api/resumes/save-optimized`)
- CORS enabled for cross-origin requests
- Multer-based file upload handling

### Starting the Frontend
```bash
# In a separate terminal
cd client
npm run dev
```
The React frontend starts on **http://localhost:5173** with:
- Vite HMR (Hot Module Replacement) for instant updates
- TypeScript type-checking
- Tailwind CSS for styling
- ESLint for code quality

### Web UI Workflow
1. **Upload Resume** — Drag-and-drop or select a PDF/TXT/DOCX file
2. **Enter Job Description** — Paste the job posting text
3. **Analyze** — Click "Analyze Resume" for ATS scoring
4. **Review Results** — See matched/missing skills, strengths, weaknesses, score breakdown
5. **Optimize** — Select optimization mode (Conservative/Balanced/Aggressive)
6. **AI Optimization** — Click "Optimize" to have AI rewrite your resume
7. **Compare** — View before/after side-by-side
8. **Export** — Download as PDF, TXT, copy to clipboard, or save to server

---

## 🧠 9Router AI Integration

### What is 9Router?
9Router is a local LLM routing infrastructure that provides access to various AI models without requiring paid API keys. The ATS Optimizer uses 9Router to intelligently rewrite and optimize resume content.

### Configuration
The optimizer connects to 9Router at **http://localhost:20128/v1/chat/completions** with:
- **Model**: `free-coding` (maps to `minimax/minimax-m2.7-20260318` or similar)
- **API Key**: Pre-configured key `sk-ff96cb9...`
- **Temperature**: `0.7` (balanced creativity)
- **Max Tokens**: `4000` (sufficient for full resume optimization)

### Setup Instructions
1. Ensure 9Router is running locally on port 20128
2. The optimizer will automatically detect and connect to it
3. No additional API configuration needed

### Optimization Pipeline
The AI optimization follows a sophisticated pipeline:

```
1. 📄 Resume Parsing → Structured sections (experience, education, skills, etc.)
2. 📊 Quality Analysis → Keyword density, readability, action verbs, weak bullets
3. 🧠 AI Processing → Send structured data + JD to 9Router for optimization
4. ✍️ Content Generation → AI rewrites summary, skills, bullets, adds keywords
5. ✅ Validation → Validates JSON schema, checks completeness, sanitizes entries
6. 📈 Scoring → Recalculates predicted ATS score with improvement percentage
```

### Validation & Safety
- **Schema Validation**: All AI responses are validated against a strict JSON schema
- **Entry Validation**: Each experience/education entry must have required fields
- **String Sanitization**: Removes empty strings, normalizes whitespace
- **Fallback Handling**: Preserves original content if AI returns invalid data for a section
- **Markdown Stripping**: Automatically removes markdown code blocks from AI responses

### Optimization Modes Detail

| Mode | Temperature | Rewriting Intensity | Key Behavior |
|------|------------|-------------------|--------------|
| 🛡️ Conservative | 0.5 | Low | Preserves 90%+ original wording, minor keyword additions |
| ⚖️ Balanced | 0.7 | Medium | Optimal mix of preservation and optimization (recommended) |
| 🚀 Aggressive | 0.9 | High | Heavy rewriting for maximum keyword density |

### Prompt Engineering
The optimizer uses carefully engineered prompts that include:
- Current resume sections with specific formatting instructions
- Job description keywords and context
- Matched and missing skills
- Original weaknesses and areas for improvement
- Mode-specific instructions for rewriting intensity
- Strict JSON output format requirements

---

## 📄 PDF Export

The PDF export service (`client/src/services/pdfExport.ts`) uses **jsPDF** to generate professional PDFs entirely client-side. No server-side PDF processing is needed.

### Export Types

#### 1. Resume PDF (`generateResumePDF`)
- **Format**: A4 Portrait
- **Purpose**: Recruiter-ready resume for job applications
- **Includes**:
  - Professional Summary
  - Skills (grid layout, 4 per row)
  - Experience entries with title, company, dates, location, and bullet points
  - Education with degree, field, institution, dates, GPA
  - Certifications with name and issuer
  - Projects with description and bullets
- **Styling**: Purple accent colors, section headers with underline, green bullet points, page footer with score and generation date
- **Auto Pagination**: Intelligent page breaks to prevent content overflow

#### 2. ATS Report PDF (`generateATSReportPDF`)
- **Format**: A4 Portrait
- **Purpose**: Detailed optimization report for analysis
- **Includes**:
  - Purple gradient header with report title and timestamp
  - Score comparison (Original → Optimized with improvement badge)
  - Analysis metrics grid (Keyword Density, Readability, Action Verbs, Weak Bullets)
  - Status indicators (Good ⚠️ Needs Work / ✗ Poor)
  - Matched skills with bullet-point format
  - Keywords added from job description (color-coded badges)
  - Improvements made as numbered list
- **Styling**: Color-coded metric boxes (green/amber/red), emoji section headers

#### 3. Comparison PDF (`generateComparisonPDF`)
- **Format**: A4 Landscape
- **Purpose**: Side-by-side original vs optimized comparison
- **Includes**:
  - Two-column layout (Original → AI Optimized)
  - Professional Summary comparison
  - Skills added section
  - Up to 5 rewritten bullets with before/after
  - Score progression header
  - Footer with generation metadata

### Download Helpers
- **`downloadBlob(blob, filename)`** — Triggers browser download with proper filename
- **`generateFilename(type, mode)`** — Generates timestamped filenames like `resume-balanced-1680000000000.pdf`

### Technical Details
- **Library**: `jspdf` (pure JavaScript PDF library)
- **Text Wrapping**: Custom word-wrap algorithm for proper text flow
- **Fonts**: Helvetica (bold/normal variants)
- **Colors**: Pre-defined color palette (primary purple, success green, warning amber, danger red)
- **Memory**: Blob URLs are properly revoked after download to prevent memory leaks

---

## 📊 ATS Score Breakdown

Your ATS score is calculated based on:

| Criteria | Weight | What It Measures |
|----------|--------|-----------------|
| **Keyword Match** | 40% | How many JD keywords appear in your resume |
| **Skill Alignment** | 25% | Required skills presence in your resume |
| **Experience Match** | 15% | Years of experience vs. requirements |
| **Formatting** | 10% | ATS-friendly formatting (no tables, columns, etc.) |
| **Readability** | 10% | Clear structure, action verbs, sections |

### Advanced Analysis Metrics (AI Output)

| Metric | Target Range | Description |
|--------|-------------|-------------|
| **Keyword Density** | 2%–5% | Percentage of JD keywords in total resume text |
| **Readability Score** | ≥ 60/100 | How easy the text is to read and scan |
| **Action Verb Score** | ≥ 70% | Percentage of bullet points starting with strong action verbs |
| **Weak Bullets** | 0 | Bullet points without metrics, action verbs, or specific impact |
| **Duplicate Keywords** | 0 | Overused keywords that may trigger ATS spam filters |
| **Section Completeness** | All ✓ | Whether each critical section (Summary, Skills, Experience, Education) is present |

---

## 📁 Project Structure

```
ATS-app/
├── client/                          # React Frontend (Vite + TypeScript)
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.tsx       # Drag-and-drop file upload component
│   │   │   ├── JobDescription.tsx   # JD text input area
│   │   │   ├── Results.tsx          # ATS analysis results display
│   │   │   ├── ResumeOptimizer.tsx  # AI optimization UI with mode selection & export
│   │   │   └── ScoreBreakdown.tsx   # Score visualization (radar/bar charts)
│   │   ├── services/
│   │   │   ├── api.ts               # API client for server communication
│   │   │   └── pdfExport.ts         # PDF generation service (jsPDF)
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript type definitions
│   │   ├── App.tsx                  # Main app component with routing
│   │   ├── main.tsx                 # React entry point
│   │   └── index.css                # Tailwind CSS imports & global styles
│   ├── index.html                   # Vite HTML entry point
│   ├── vite.config.ts               # Vite configuration with proxy
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   ├── tsconfig.json                # TypeScript configuration
│   ├── tsconfig.app.json            # App-specific TypeScript config
│   ├── tsconfig.node.json           # Node-specific TypeScript config
│   └── package.json                 # Client dependencies & scripts
│
├── server/                          # Express.js Backend
│   └── index.ts                     # Server: upload, resume serving, save endpoints
│
├── src/                             # CLI Application (TypeScript)
│   ├── cli.ts                       # CLI entry point with Commander commands
│   ├── commands/
│   │   ├── analyze.ts               # Analyze resume against JD
│   │   ├── scan.ts                  # Quick scan without JD
│   │   ├── push.ts                  # Push results to GitHub
│   │   └── full.ts                  # Full pipeline (analyze + push)
│   ├── github/
│   │   └── index.ts                 # GitHub API client for result push
│   ├── parsers/
│   │   ├── pdf.ts                   # PDF text extraction
│   │   ├── docx.ts                  # DOCX text extraction
│   │   └── text.ts                  # Plain text parsing
│   ├── scorers/ (singular)
│   │   └── index.ts                 # ATS scoring algorithm (0-100)
│   ├── suggestions/
│   │   └── index.ts                 # Suggestion generation from analysis
│   └── utils/
│       └── index.ts                 # Shared utilities
│
├── uploads/                         # Uploaded files storage
├── ai/ (not a top-level dir — part of optimizer)
├── src/ai/
│   └── optimizer.ts                 # AI optimization pipeline with 9Router
│
├── sample-jd.txt                    # Sample job description for testing
├── sample-resume.txt                # Sample resume for testing
├── package.json                     # Root: scripts, dependencies (tsx, zod, express)
├── tsconfig.json                    # Root TypeScript configuration
├── FRONTEND_IMPROVEMENTS.md         # Documentation of UI improvements
└── README.md                        # This file
```

---

## 🔌 API Endpoints

### Upload Resume
```http
POST /api/upload
Content-Type: multipart/form-data

Body: resume (file)
```
**Response:** `{ "message": "File uploaded", "filename": "unique-id-name.pdf" }`

### Get Resume File
```http
GET /api/resumes/:filename
```
**Response:** File stream with appropriate MIME type

### Save Optimized Resume
```http
POST /api/resumes/save-optimized
Content-Type: multipart/form-data

Body: {
  resume: (file),
  optimizedResume: (JSON string of OptimizedResume),
  originalFilename: "resume.pdf"
}
```
**Response:** `{ "message": "Optimized resume saved", "filename": "optimized-..." }`

---

## 🌍 Environment Variables

### GitHub Token
Set your GitHub token to avoid passing `--token` every time:

**Linux/Mac:**
```bash
export GITHUB_TOKEN=github_pat_xxxxx
```

**Windows (PowerShell):**
```powershell
$env:GITHUB_TOKEN = "github_pat_xxxxx"
```

Then use CLI commands without `--token`:
```bash
ats-app push --resume resume.pdf --jd job-description.txt --owner johndoe --repo ats-analysis
```

### 9Router API Configuration (in code)
The AI optimizer is pre-configured for local 9Router instance:
- **Base URL**: `http://localhost:20128/v1`
- **Model**: `free-coding`
- **Temperature**: Varies by mode (0.5–0.9)
- **Max Tokens**: 4000

---

## 💡 Tips for Best Results

### For ATS Analysis
1. **Use actual job description** — Copy-paste from the job posting for most accurate analysis
2. **Format your resume properly** — Use simple formatting without tables or columns
3. **Use action verbs** — Start bullet points with action verbs (achieved, created, developed, etc.)
4. **Include metrics** — Quantify your accomplishments (30% improvement, 1M+ users, etc.)
5. **Match keywords** — Use keywords from the JD when describing your experience
6. **Organize sections** — Clear sections: Summary, Skills, Experience, Education, Certifications
7. **Keep it readable** — Aim for 1-2 pages, clear hierarchy with bullet points

### For AI Optimization
1. **Start with "Balanced" mode** — It provides the best trade-off between preservation and ATS optimization
2. **Review AI changes** — Always review the before/after comparison to ensure accuracy
3. **Iterate if needed** — You can regenerate optimization with different modes
4. **Export as PDF** — Use the recruiter-ready PDF for actual job applications
5. **Use "Aggressive" for last resort** — Only if your resume is not getting any callbacks
6. **Keep job description descriptive** — Longer, more detailed JDs produce better optimizations
7. **Check keyword density** — Target 2-5%; too many keywords can trigger ATS spam filters

---

## 🔍 Troubleshooting

### "GitHub token not found"
**Solution:** Set your token with `--token` or `GITHUB_TOKEN` environment variable

### "Invalid GitHub token"
**Solution:** Check that your token is valid and has `repo` and `user` scopes

### "Invalid resume file"
**Solution:** Use supported formats (PDF, DOCX, TXT) and ensure file exists

### "File parsing error"
**Solution:** Check that file is not corrupted and is in supported format

### "9Router connection failed"
**Solution:**
- Ensure 9Router is running on port 20128
- Check terminal for any error logs
- Try restarting 9Router

### "PDF generation seems stuck"
**Solution:**
- PDF generation is client-side and fast (typically < 1 second)
- If button shows "Generating..." for over 5 seconds, check browser console for errors
- Ensure `jspdf` dependency is installed (`cd client && npm install`)

### "Optimization returned low-quality content"
**Solution:**
- Try a different optimization mode
- Ensure job description is detailed and relevant
- Check that resume text extraction was successful (review the analysis step)
- The AI model used by 9Router may vary; try again for potentially better results

### "Server file upload fails"
**Solution:**
- Ensure the `uploads/` directory exists
- Check that file size is under the limit (default 10MB)
- Verify the server is running on port 5000

### "Port already in use"
**Solution:**
```bash
# Kill processes on specific ports
npx kill-port 5000 5173 20128
```

---

## 👥 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

### Development Setup
```bash
git clone https://github.com/yourusername/ats-app.git
cd ats-app
npm install
cd client && npm install && cd ..
npm run dev  # Starts both server and (manually) client
```

### Code Style
- TypeScript strict mode enabled
- ESLint configuration in root and client
- Tailwind CSS for all styling (no inline styles)
- Components follow functional + hooks pattern
- Imports organized: React → Libraries → Components → Services → Types

---

## 📄 License

MIT License — see [LICENSE](LICENSE) file for details

---

## 📞 Support

For issues, questions, or feedback:
- 📧 **Email**: support@example.com
- 🐛 **GitHub Issues**: https://github.com/yourusername/ats-app/issues
- 💬 **Discussions**: https://github.com/yourusername/ats-app/discussions

### Quick Links
- [Frontend Improvements Log](FRONTEND_IMPROVEMENTS.md) — Detailed changelog of all UI/UX improvements

---

## ⚠️ Disclaimer

This tool provides an estimate of ATS compatibility. Results may vary depending on:
- The specific ATS system used by the employer
- Individual company requirements
- Role-specific factors
- Quality and specificity of the job description provided
- AI model availability and performance via 9Router

**Always customize your resume for each job application and have multiple people review it.** The AI optimizer is a tool to assist, not replace, your judgment. Review all AI-generated content before submitting applications.