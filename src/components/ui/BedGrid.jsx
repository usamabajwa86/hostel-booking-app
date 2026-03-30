import { useState } from 'react';

const statusColors = {
  vacant: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30',
  pending: 'bg-amber-400 shadow-amber-400/30',
  booked: 'bg-red-500 shadow-red-500/30',
};

const statusLabels = {
  vacant: 'Vacant',
  pending: 'Pending',
  booked: 'Booked',
};

function BedCircle({ bed, status, onClick, roomNumber }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isClickable = status === 'vacant' && onClick;

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        disabled={!isClickable}
        onClick={() => isClickable && onClick(bed, roomNumber)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`h-9 w-9 rounded-full border-2 border-white shadow-md text-xs font-bold text-white transition-all duration-200 ${
          statusColors[status]
        } ${isClickable ? 'cursor-pointer hover:scale-125 hover:shadow-lg active:scale-110' : 'cursor-default'}`}
        title={`${bed.id} - ${statusLabels[status]}`}
      >
        {bed.number || ''}
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs whitespace-nowrap z-10 pointer-events-none shadow-lg">
          <span className="font-semibold">{bed.id}</span>
          <span className="text-gray-400 mx-1">&mdash;</span>
          <span className={status === 'vacant' ? 'text-emerald-400' : status === 'pending' ? 'text-amber-400' : 'text-red-400'}>{statusLabels[status]}</span>
          {bed.occupant && (
            <span className="text-gray-400 block text-[10px] mt-0.5">{bed.occupant.userName}</span>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

export default function BedGrid({ rooms = [], onBedClick }) {
  if (!rooms.length) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">
        No rooms to display.
      </p>
    );
  }

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 mb-6 p-3 bg-gray-50 rounded-xl">
        {Object.entries(statusLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className={`inline-block h-4 w-4 rounded-full shadow-sm ${statusColors[key].split(' ')[0]}`}
            />
            <span className="text-xs font-medium text-gray-600">{label}</span>
          </div>
        ))}
        {onBedClick && (
          <span className="text-xs text-gray-400 ml-auto">Click a green bed to book</span>
        )}
      </div>

      {/* Room cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const roomNum = room.number || room.roomNumber || '';
          const beds = room.beds || [];
          const vacantCount = beds.filter(b => !b.status || b.status === 'vacant').length;
          const progCat = (room.programCategory || '').toLowerCase();
          const isPostgrad = progCat === 'postgraduate' || room.type === 'PG';
          const roomTypeLabel = room.type === 'Coupled' ? 'Coupled' : room.type === 'Warden' ? 'Warden' : room.type === 'Dormitory' ? 'Dormitory' : room.type || '';
          const progLabel = isPostgrad ? 'PG' : 'UG';
          const typeBadge = isPostgrad
              ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-200'
              : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';

          return (
            <div
              key={roomNum}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Room header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <h4 className="text-sm font-bold text-gray-900">
                  Room {roomNum}
                </h4>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeBadge}`}
                  >
                    {progLabel}
                  </span>
                  {roomTypeLabel && (
                    <span className="text-[10px] text-gray-500 font-medium">
                      {roomTypeLabel}
                    </span>
                  )}
                  {room.floor && (
                    <span className="text-[10px] text-gray-400 font-medium">
                      {room.floor}
                    </span>
                  )}
                  <span className={`text-[10px] font-semibold ${vacantCount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {vacantCount}/{beds.length}
                  </span>
                </div>
              </div>

              {/* Beds */}
              <div className="flex flex-wrap gap-2.5 p-4">
                {beds.map((bed) => {
                  const status = bed.status || 'vacant';
                  return (
                    <BedCircle
                      key={bed.id}
                      bed={bed}
                      status={status}
                      onClick={onBedClick}
                      roomNumber={roomNum}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
