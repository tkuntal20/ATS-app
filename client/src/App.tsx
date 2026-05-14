import { useState } from 'react';

function App() {

  const [resume, setResume] = useState<File | null>(null);

  const [jd, setJD] = useState('');

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<{
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    suggestions: {
      suggestion: string;
    }[];
  } | null>(null);

  const handleAnalyze = async () => {

    if (!resume || !jd) {

      alert(
        'Please upload resume and paste job description'
      );

      return;

    }

    setLoading(true);

    try {

      const formData = new FormData();

      formData.append('resume', resume);

      formData.append('jd', jd);

      const response = await fetch(
        'http://localhost:3000/api/analyze',
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      setResult(data);

    } catch (error) {

      console.error(error);

      alert('Failed to analyze resume');

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="app-container">

      <div className="main-card">

        <h1 className="title">
          ATS Resume Analyzer
        </h1>

        <div className="upload-section">

          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => {

              if (e.target.files?.[0]) {

                setResume(e.target.files[0]);

              }

            }}
          />

          <textarea
            placeholder="Paste Job Description Here..."
            rows={12}
            value={jd}
            onChange={(e) => setJD(e.target.value)}
          />

          <button
            onClick={handleAnalyze}
            disabled={loading}
          >

            {loading
              ? 'Analyzing Resume...'
              : 'Analyze Resume'}

          </button>

        </div>

        {result && (

          <div className="results">

            <div className="score-card">

              <h2>ATS Score</h2>

              <div
  className="score-number"
  style={{
    color:
      result.score >= 75
        ? '#22c55e'
        : result.score >= 50
        ? '#facc15'
        : '#ef4444'
  }}
>
  {result.score.toFixed(1)}
</div>

            </div>

            <div className="grid">

              <div className="card">

                <h3>Matched Skills</h3>

                <ul>

                  {result.matchedSkills?.map(
                    (skill: string) => (
                      <li key={skill}>
                        {skill}
                      </li>
                    )
                  )}

                </ul>

              </div>

              <div className="card">

                <h3>Missing Skills</h3>

                <ul>

                  {result.missingSkills?.map(
                    (skill: string) => (
                      <li key={skill}>
                        {skill}
                      </li>
                    )
                  )}

                </ul>

              </div>

            </div>

            <div
              className="card"
              style={{
                marginTop: '20px'
              }}
            >

              <h3>Suggestions</h3>

              <ul>

                {result.suggestions?.map(
                  (
                    s: {
                      suggestion: string
                    },
                    idx: number
                  ) => (
                    <li key={idx}>
                      {s.suggestion}
                    </li>
                  )
                )}

              </ul>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}

export default App;