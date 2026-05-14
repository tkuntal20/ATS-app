import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { parseResume } from '../src/parsers/resumeParser.js';
import { parseJD } from '../src/parsers/jdParser.js';
import { calculateATSScore } from '../src/scoring/calculator.js';
import { generateSuggestions } from '../src/suggestions/generator.js';

const app = express();

const PORT = 3000;

app.use(cors());

app.use(express.json());

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

app.listen(PORT, () => {

  console.log(
    `🚀 ATS API running on http://localhost:${PORT}`
  );

});