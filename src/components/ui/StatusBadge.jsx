const statusConfig = {
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    ring: 'ring-amber-600/20',
  },
  approved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-600/20',
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    ring: 'ring-red-600/20',
  },
  vacated: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    ring: 'ring-gray-500/20',
  },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.bg} ${config.text} ${config.ring}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
