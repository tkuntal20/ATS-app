interface SuggestionsListProps {
  suggestions: string[];
  type: 'strengths' | 'improvements';
}

export default function SuggestionsList({ suggestions, type }: SuggestionsListProps) {
  if (suggestions.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        {type === 'strengths' ? 'No strengths identified' : 'No improvements suggested'}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {suggestions.map((item, index) => (
        <li key={index} className="flex items-start">
          <span
            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
              type === 'strengths'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-purple-100 text-purple-600'
            }`}
          >
            {type === 'strengths' ? (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            )}
          </span>
          <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}