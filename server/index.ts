import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { parseResume } from '../src/parsers/resumeParser.js';
import { parseJD } from '../src/parsers/jdParser.js';
import { calculateATSScore } from '../src/scoring/calculator.js';
import { generateSuggestions } from '../src/suggestions/generator.js';
import { optimizeResume } from '../src/ai/optimizer.js';

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.use(express.static(path.join(process.cwd(), 'client/dist')));

const storage = multer.diskStorage({

  destination: (_, __, cb) => {

    cb(null, 'uploads/');

  },

  filename: (_, file, cb) => {

    const uniqueName =
      `${Date.now()}-${file.originalname}`;

    cb(null, uniqueName);

  }

});

const upload = multer({
  storage
});

app.get('/', (_, res) => {

  res.json({
    status: 'ATS Resume Analyzer API Running'
  });

});

app.post(
  '/api/analyze',
  upload.single('resume'),
  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({
          error: 'Resume file is required'
        });

      }

      const jdText = req.body.jd;

      if (!jdText) {

        return res.status(400).json({
          error: 'Job description is required'
        });

      }

      const tempJDPath = path.join(
        'uploads',
        `jd-${Date.now()}.txt`
      );

      fs.writeFileSync(tempJDPath, jdText);

      const resume = await parseResume(req.file.path);

      const jd = await parseJD(tempJDPath);

      const scoring = calculateATSScore(
        resume,
        jd
      );

      const suggestions = generateSuggestions(
        resume,
        jd,
        scoring
      );

      fs.unlinkSync(tempJDPath);

      return res.json({
        success: true,
        score: scoring.score,
        breakdown: scoring.breakdown,
        matchedSkills: scoring.matchedSkills,
        missingSkills: scoring.missingSkills,
        strengths: scoring.strengths,
        weaknesses: scoring.weaknesses,
        suggestions
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        error: 'Internal server error'
      });

    }

  }
);

app.post('/api/resumes/save-optimized', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Original resume file is required'
      });
    }

    const optimizedResume = req.body.optimizedResume 
      ? JSON.parse(req.body.optimizedResume) 
      : null;

    if (!optimizedResume) {
      return res.status(400).json({
        error: 'Optimized resume data is required'
      });
    }

    // Create a folder for optimized resumes
    const optimizedFolder = path.join('uploads', 'optimized');
    if (!fs.existsSync(optimizedFolder)) {
      fs.mkdirSync(optimizedFolder, { recursive: true });
    }

    // Save optimized resume data as JSON
    const filename = `optimized-${Date.now()}.json`;
    const filepath = path.join(optimizedFolder, filename);
    
    fs.writeFileSync(filepath, JSON.stringify({
      originalFile: req.file.originalname,
      savedAt: new Date().toISOString(),
      optimizedResume,
      originalFilename: req.body.originalFilename || req.file.originalname
    }, null, 2));

    return res.json({
      success: true,
      message: 'Optimized resume saved successfully',
      filename,
      path: filepath
    });

  } catch (error) {
    console.error('Save optimized error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to save optimized resume'
    });
  }
});

app.get('/api/resumes/optimized', async (req, res) => {
  try {
    const optimizedFolder = path.join('uploads', 'optimized');
    if (!fs.existsSync(optimizedFolder)) {
      return res.json({
        success: true,
        resumes: []
      });
    }

    const files = fs.readdirSync(optimizedFolder).filter(f => f.endsWith('.json'));
    const resumes = files.map(file => {
      const content = fs.readFileSync(path.join(optimizedFolder, file), 'utf-8');
      const data = JSON.parse(content);
      return {
        filename: file,
        savedAt: data.savedAt,
        originalFile: data.originalFile,
        score: data.optimizedResume?.predictedScore
      };
    }).sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

    return res.json({
      success: true,
      resumes
    });

  } catch (error) {
    console.error('List optimized error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to list optimized resumes'
    });
  }
});

app.post('/api/optimize', async (req, res) => {
  try {
    const {
      resumeText,
      jobDescription,
      currentScore,
      matchedSkills,
      missingSkills,
      strengths,
      weaknesses,
      mode
    } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        error: 'Resume text and job description are required'
      });
    }

    // Use real AI optimization via 9Router
    const optimizedResume = await optimizeResume({
      resumeText,
      jobDescription,
      currentScore: currentScore || 0,
      matchedSkills: matchedSkills || [],
      missingSkills: missingSkills || [],
      strengths: strengths || [],
      weaknesses: weaknesses || [],
      mode: mode || 'balanced'
    });

    return res.json({
      success: true,
      optimizedResume
    });

  } catch (error) {
    console.error('Optimization error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to optimize resume'
    });
  }
});

app.get('*', (_, res) => {
  res.sendFile(path.join(process.cwd(), 'client/dist/index.html'));
});

app.listen(PORT, () => {

  console.log(
    `🚀 ATS API running on http://localhost:${PORT}`
  );

});
