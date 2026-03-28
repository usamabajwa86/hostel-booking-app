export default function StatsCard({ title, value, icon: Icon, color = 'emerald' }) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    red: { bg: 'bg-red-50', text: 'text-red-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
    slate: { bg: 'bg-slate-100', text: 'text-slate-600' },
  };

  const c = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className={`h-12 w-12 rounded-lg ${c.bg} flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${c.text}`} />
          </div>
        )}
      </div>
    </div>
  );
}
