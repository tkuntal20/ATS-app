# AI Resume Optimizer Setup Guide

## Overview

The ATS Resume Analyzer now includes a **REAL AI-powered Resume Optimization** feature that uses your local 9Router infrastructure to generate genuinely optimized resumes. This is NOT a demo or template system - it uses actual AI inference to analyze and improve resumes.

## Features

✅ **Real AI Generation** - Uses 9Router's local LLM infrastructure  
✅ **Intelligent Optimization** - Rewrites resumes for better ATS compatibility  
✅ **Keyword Enhancement** - Naturally incorporates missing keywords from job descriptions  
✅ **Professional Rewriting** - Improves bullet points with strong action verbs  
✅ **Score Prediction** - Predicts improved ATS scores  
✅ **Side-by-Side Comparison** - Visual before/after comparison  
✅ **Multiple Download Options** - Download optimized resume or full report  
✅ **Copy to Clipboard** - Easy copying of individual sections or entire resume  

## Architecture

### Backend Flow

1. **API Endpoint**: `POST /api/optimize`
2. **AI Service**: `src/ai/optimizer.ts`
3. **9Router Integration**: OpenAI-compatible API at `http://localhost:20128/v1`
4. **Model**: `free-coding` (with fallback options available)

### Frontend Flow

1. User uploads resume and enters job description
2. ATS analysis runs first (existing feature)
3. User clicks "Optimize with AI" button
4. Frontend sends resume text + JD + analysis results to backend
5. Backend calls 9Router AI service with optimization prompt
6. AI generates optimized content in structured JSON format
7. Frontend displays before/after comparison with download options

## Configuration

### Environment Variables

The `.env` file is already configured for 9Router:

```env
# 9Router Local AI Configuration
OPENAI_BASE_URL=http://localhost:20128/v1
OPENAI_API_KEY=sk-no-key-required
OPENAI_MODEL=free-coding
```

### Available Models

Primary model:
- `free-coding` (default)

Fallback models available in 9Router:
- `kr/claude-sonnet-4.5`
- `kr/claude-haiku-4.5`
- `kr/deepseek-3.2`
- `kr/qwen3-coder-next`
- `kr/glm-5`
- `kr/MiniMax-M2.5`

To change the model, update `OPENAI_MODEL` in `.env`:

```env
OPENAI_MODEL=kr/claude-sonnet-4.5
```

## How It Works

### AI Optimization Process

1. **Input Analysis**
   - Current resume text
   - Job description
   - ATS analysis results (score, matched/missing skills, strengths, weaknesses)

2. **AI Prompt Engineering**
   - System prompt defines optimization principles
   - User prompt provides context and specific requirements
   - Emphasizes truthfulness - never fabricates experience

3. **AI Generation**
   - AI analyzes resume against job description
   - Rewrites professional summary with relevant keywords
   - Enhances skills list with missing but relevant skills
   - Rewrites 5-7 experience bullets with strong action verbs
   - Identifies specific improvements made
   - Predicts new ATS score

4. **Response Processing**
   - Backend validates JSON structure
   - Ensures all required fields are present
   - Sanitizes and formats response
   - Returns to frontend

5. **Frontend Display**
   - Side-by-side comparison view
   - Score improvement visualization
   - Added keywords highlighting
   - Copy and download functionality

### AI Prompt Strategy

The system uses a carefully crafted prompt that:

- **Maintains Honesty**: Never fabricates experience or credentials
- **Improves Presentation**: Rewrites existing content more effectively
- **Adds Keywords**: Naturally incorporates relevant keywords from JD
- **Uses Action Verbs**: Replaces weak verbs with strong alternatives
- **Quantifies Achievements**: Adds metrics where reasonable
- **Improves Formatting**: Ensures ATS-friendly structure

## Testing the Feature

### Prerequisites

1. **9Router Running**: Ensure 9Router is running on `http://localhost:20128`
2. **Backend Running**: `npm run dev` (port 3000)
3. **Frontend Running**: `cd client && npm run dev` (port 5174)

### Test Steps

1. Open `http://localhost:5174` in your browser
2. Upload a resume file (PDF or TXT)
3. Paste a job description
4. Click "Analyze Resume" and wait for ATS analysis
5. Scroll down to "AI Resume Optimizer" section
6. Click "✨ Optimize with AI" button
7. Wait 10-30 seconds for AI generation
8. Review the before/after comparison
9. Test copy and download features

### Expected Behavior

**Success Case:**
- Loading spinner appears with "AI is Analyzing Your Resume..."
- After 10-30 seconds, optimized results appear
- Score improvement is displayed
- Before/after comparison shows differences
- All sections are copyable and downloadable

**Error Case:**
- If 9Router is not running, error message appears:
  - "AI service not available. Please ensure 9Router is running on http://localhost:20128"
- User can check 9Router status and try again

## Troubleshooting

### Error: "AI service not available"

**Cause**: 9Router is not running or not accessible

**Solution**:
1. Check if 9Router is running: `curl http://localhost:20128/v1/models`
2. Verify the port is correct (20128)
3. Restart 9Router if needed
4. Check firewall settings

### Error: "AI returned invalid response format"

**Cause**: AI model returned non-JSON or malformed JSON

**Solution**:
1. Try a different model (e.g., `kr/claude-sonnet-4.5`)
2. Check 9Router logs for errors
3. Verify model is loaded correctly in 9Router

### Error: "AI service request timed out"

**Cause**: Model is processing but taking too long

**Solution**:
1. Wait and try again (model may be loading)
2. Use a faster model like `kr/claude-haiku-4.5`
3. Increase timeout in `src/ai/optimizer.ts` if needed

### Error: "AI model not available"

**Cause**: Specified model not loaded in 9Router

**Solution**:
1. Check available models: `curl http://localhost:20128/v1/models`
2. Update `.env` with an available model
3. Restart backend server

## Customization

### Adjusting AI Behavior

Edit `src/ai/optimizer.ts` to customize:

**Temperature** (creativity level):
```typescript
temperature: 0.7,  // 0.0 = deterministic, 1.0 = creative
```

**Max Tokens** (response length):
```typescript
max_tokens: 4000,  // Increase for longer responses
```

**System Prompt** (AI instructions):
Modify the `systemPrompt` variable to change optimization strategy.

### Changing Output Format

The AI returns structured JSON. To add new fields:

1. Update `OptimizedResume` interface in `src/ai/optimizer.ts`
2. Update system prompt to request new fields
3. Update frontend component to display new fields

## Security Notes

- **Local Processing**: All AI processing happens locally via 9Router
- **No External Calls**: No data sent to external APIs
- **Privacy**: Resume data stays on your infrastructure
- **API Key**: The `sk-no-key-required` key is a placeholder for local use

## Performance

- **First Request**: May take 20-30 seconds (model loading)
- **Subsequent Requests**: 10-20 seconds (model cached)
- **Model Size Impact**: Larger models = better quality but slower
- **Recommended**: `free-coding` or `kr/claude-haiku-4.5` for speed

## Production Deployment

For production use:

1. **Scale 9Router**: Ensure adequate resources for concurrent requests
2. **Add Caching**: Cache common optimizations to reduce AI calls
3. **Rate Limiting**: Implement rate limits on `/api/optimize` endpoint
4. **Monitoring**: Add logging and monitoring for AI service health
5. **Fallback**: Consider fallback models if primary model fails
6. **Queue System**: For high traffic, implement job queue for AI requests

## API Reference

### POST /api/optimize

**Request Body:**
```json
{
  "resumeText": "string",
  "jobDescription": "string",
  "currentScore": 75,
  "matchedSkills": ["JavaScript", "React"],
  "missingSkills": ["TypeScript", "Node.js"],
  "strengths": ["Strong technical skills"],
  "weaknesses": ["Missing keywords"]
}
```

**Response:**
```json
{
  "success": true,
  "optimizedResume": {
    "professionalSummary": "string",
    "skills": ["array"],
    "experience": ["array"],
    "improvements": ["array"],
    "addedKeywords": ["array"],
    "predictedScore": 90,
    "improvementPercentage": 20
  }
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## Support

For issues or questions:

1. Check 9Router logs for AI service errors
2. Verify backend logs for API errors
3. Check browser console for frontend errors
4. Review this documentation for troubleshooting steps

## Future Enhancements

Potential improvements:

- [ ] Multiple optimization strategies (aggressive, conservative, balanced)
- [ ] Industry-specific optimization templates
- [ ] A/B testing of different optimizations
- [ ] Optimization history and versioning
- [ ] Batch optimization for multiple resumes
- [ ] Custom prompt templates
- [ ] Integration with resume builders
- [ ] Export to multiple formats (PDF, DOCX)

---

**Note**: This is a production-ready AI feature using real LLM inference. The quality of optimization depends on the AI model used and the quality of input data.