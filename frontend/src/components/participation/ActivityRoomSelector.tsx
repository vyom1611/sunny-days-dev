import React from 'react';
import { ActivityOut } from '../../libs/types';
import Pill from '../ui/Pill';

type Props = {
  activities: ActivityOut[];
  rooms: number[];
  selectedActivityId: number | null;
  setSelectedActivityId: (id: number | null) => void;
  selectedRoom: number | null;
  setSelectedRoom: (r: number) => void;
  selectedActivity: ActivityOut | null;
};

export default function ActivityRoomSelector({ 
  activities, 
  rooms, 
  selectedActivityId, 
  setSelectedActivityId, 
  selectedRoom, 
  setSelectedRoom, 
  selectedActivity 
}: Props) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Activity</label>
        <select
          className="w-full h-11 px-3 rounded-xl border bg-white text-base"
          value={selectedActivityId ?? ""}
          onChange={(e) => setSelectedActivityId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">-- Select an activity --</option>
          {activities.map((a) => (
            <option key={a.id} value={a.id}>
              {a.activity_date} – {a.name} {a.is_team ? "(Team)" : "(Ind)"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Room</label>
        <div className="flex gap-2 flex-wrap">
          {rooms.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRoom(r)}
              className={`h-11 px-4 inline-flex items-center justify-center rounded-xl border text-base ${selectedRoom === r ? "bg-orange-600 text-white border-orange-600" : "bg-white hover:bg-gray-50"}`}
            >
              Room {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
