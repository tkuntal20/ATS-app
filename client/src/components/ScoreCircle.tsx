interface ScoreCircleProps {
  score: number;
}

export default function ScoreCircle({ score }: ScoreCircleProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90" width="160" height="160">
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="12"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke={getScoreColor(score)}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900">{score.toFixed(2)}</div>
          <div className="text-sm text-gray-500">out of 100</div>
        </div>
      </div>
    </div>
  );
}