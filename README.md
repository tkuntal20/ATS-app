# ATS Resume Analyzer

A powerful CLI tool to analyze your resume against job descriptions and calculate your ATS (Applicant Tracking System) score. Get actionable suggestions to improve your resume and increase your chances of passing ATS filters.

## Features

- 📊 **ATS Score Calculation (0-100)** - Comprehensive scoring based on keyword match, skill alignment, experience, formatting, and readability
- 🎯 **Actionable Suggestions** - Get specific, prioritized recommendations to improve your resume
- 📄 **Multi-Format Support** - Analyze PDF, DOCX, and TXT files
- 🔍 **Quick Scan** - Fast ATS check without needing a job description
- 📤 **GitHub Integration** - Push analysis results directly to GitHub
- 🚀 **Full Pipeline** - Analyze and push to GitHub in one command

## Installation

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Install from npm
```bash
npm install -g ats-app
```

### Or build from source
```bash
git clone https://github.com/yourusername/ats-app.git
cd ats-app
npm install
npm run build
npm link
```

## Usage

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
- `-r, --resume <path>` - Path to resume file (required)
- `-j, --jd <path>` - Path to job description file (required)
- `-o, --owner <owner>` - GitHub username or organization (required)
- `-rp, --repo <repo>` - GitHub repository name (required)
- `-t, --token <token>` - GitHub token (optional, uses GITHUB_TOKEN env var if not provided)
- `-b, --branch <branch>` - Branch name (default: main)

**GitHub Token:**
Get your token from GitHub: Settings → Developer settings → Personal access tokens → Tokens (classic)

Required scopes: `repo, user`

### 4. Full Pipeline (Analyze + Push)
```bash
ats-app full --resume <resume-path> --jd <jd-path> --owner <github-username> --repo <repo-name> [--token <token>] [--branch <branch-name>]
```

**Example:**
```bash
ats-app full --resume resume.pdf --jd job-description.txt --owner johndoe --repo ats-analysis
```

## ATS Score Breakdown

Your ATS score is calculated based on:

| Criteria | Weight | What It Measures |
|----------|--------|-----------------|
| **Keyword Match** | 40% | How many JD keywords appear in your resume |
| **Skill Alignment** | 25% | Required skills presence in your resume |
| **Experience Match** | 15% | Years of experience vs. requirements |
| **Formatting** | 10% | ATS-friendly formatting (no tables, columns, etc.) |
| **Readability** | 10% | Clear structure, action verbs, sections |

## Supported File Formats

- ✅ PDF (.pdf)
- ✅ Word Documents (.docx)
- ✅ Plain Text (.txt)

## Sample Usage

### Test with provided samples
```bash
# Analyze the sample resume against sample JD
ats-app analyze --resume sample-resume.txt --jd sample-jd.txt

# Quick scan of resume
ats-app scan --resume sample-resume.txt

# Full pipeline with GitHub
ats-app full --resume sample-resume.txt --jd sample-jd.txt --owner yourusername --repo ats-results
```

## Environment Variables

Set your GitHub token as an environment variable to avoid passing it every time:

**Linux/Mac:**
```bash
export GITHUB_TOKEN=github_pat_xxxxx
```

**Windows (PowerShell):**
```powershell
$env:GITHUB_TOKEN = "github_pat_xxxxx"
```

Then use commands without the `--token` flag:
```bash
ats-app push --resume resume.pdf --jd job-description.txt --owner johndoe --repo ats-analysis
```

## Tips for Best Results

1. **Use actual job description** - Copy-paste from the job posting for most accurate analysis
2. **Format your resume properly** - Use simple formatting without tables or columns
3. **Use action verbs** - Start bullet points with action verbs (achieved, created, developed, etc.)
4. **Include metrics** - Quantify your accomplishments (30% improvement, 1M+ users, etc.)
5. **Match keywords** - Use keywords from the JD when describing your experience
6. **Organize sections** - Clear sections: Summary, Skills, Experience, Education, Certifications
7. **Keep it readable** - Aim for 1-2 pages, clear hierarchy with bullet points

## GitHub Integration

When you push results to GitHub:
- A new repository is created (if it doesn't exist) with private visibility
- Analysis results are saved as JSON files in a `results/` directory
- Each analysis is timestamped: `ats-analysis-{timestamp}.json`
- View results directly on GitHub with a provided link

## Troubleshooting

### "GitHub token not found"
Solution: Set your token with `--token` or `GITHUB_TOKEN` environment variable

### "Invalid GitHub token"
Solution: Check that your token is valid and has `repo` and `user` scopes

### "Invalid resume file"
Solution: Use supported formats (PDF, DOCX, TXT) and ensure file exists

### "File parsing error"
Solution: Check that file is not corrupted and is in supported format

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feedback:
- 📧 Email: support@example.com
- 🐛 GitHub Issues: https://github.com/yourusername/ats-app/issues
- 💬 Discussions: https://github.com/yourusername/ats-app/discussions

## Disclaimer

This tool provides an estimate of ATS compatibility. Results may vary depending on:
- The specific ATS system used by the employer
- Individual company requirements
- Role-specific factors

Always customize your resume for each job application and have multiple people review it.
