interface SkillsListProps {
  skills: string[];
  type: 'matched' | 'missing';
}

export default function SkillsList({ skills, type }: SkillsListProps) {
  if (skills.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        {type === 'matched' ? 'No matched skills found' : 'No missing skills'}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {skills.map((skill, index) => (
        <div
          key={index}
          className={`flex items-center px-3 py-2 rounded-lg ${
            type === 'matched'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div
            className={`flex-shrink-0 w-2 h-2 rounded-full mr-3 ${
              type === 'matched' ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span
            className={`text-sm font-medium ${
              type === 'matched' ? 'text-green-900' : 'text-red-900'
            }`}
          >
            {skill}
          </span>
        </div>
      ))}
    </div>
  );
}