interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function JobDescriptionInput({
  value,
  onChange,
  disabled,
}: JobDescriptionInputProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Paste the job description here...&#10;&#10;Include required skills, qualifications, and responsibilities to get the most accurate analysis."
        className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {value.length} characters
        </p>
        {value.length > 0 && (
          <button
            onClick={() => onChange('')}
            disabled={disabled}
            className="text-xs text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}