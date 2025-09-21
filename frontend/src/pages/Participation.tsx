import React from 'react';
import Section from '../components/ui/Section';
import Pill from '../components/ui/Pill';
import { ActivityOut, RowState, StudentOut } from '../libs/types';
import ActivityRoomSelector from '../components/participation/ActivityRoomSelector';
import ParticipationGrid from '../components/participation/ParticipationGrid';

type Props = {
  years: string[];
  selectedYear: string | null;
  setSelectedYear: (y: string | null) => void;
  rooms: number[];
  activities: ActivityOut[];
  selectedRoom: number | null;
  setSelectedRoom: (r: number) => void;
  selectedActivityId: number | null;
  setSelectedActivityId: (id: number | null) => void;
  selectedActivity: ActivityOut | null;
  students: StudentOut[];
  grid: Map<number, RowState>;
  upsertRow: (studentId: number, patch: Partial<RowState>) => void;
  markAll: (participated: boolean) => void;
  saveParticipants: () => void | Promise<void>;
};

export default function Participation({ 
  years,
  selectedYear,
  setSelectedYear,
  rooms, 
  activities, 
  selectedRoom, 
  setSelectedRoom, 
  selectedActivityId, 
  setSelectedActivityId, 
  selectedActivity, 
  students, 
  grid, 
  upsertRow, 
  markAll, 
  saveParticipants 
}: Props) {
  return (
    <>
      <Section
        title="Pick year, activity & room"
        right={selectedActivity ? (
          <div className="flex items-center gap-2 text-sm">
            <Pill active>{selectedActivity.activity_date}</Pill>
            {selectedActivity.is_team ? <Pill active>Team</Pill> : <Pill>Individual</Pill>}
          </div>
        ) : null}
      >
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <select
              className="w-full h-11 px-3 rounded-xl border bg-white"
              value={selectedYear ?? ""}
              onChange={(e) => setSelectedYear(e.target.value || null)}
            >
              <option value="">-- Select year --</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <ActivityRoomSelector 
              activities={activities} 
              rooms={rooms} 
              selectedActivityId={selectedActivityId} 
              setSelectedActivityId={setSelectedActivityId} 
              selectedRoom={selectedRoom} 
              setSelectedRoom={setSelectedRoom} 
              selectedActivity={selectedActivity} 
            />
          </div>
        </div>
      </Section>

      {selectedRoom && selectedActivityId && (
        <Section
          title={`Students in room ${selectedRoom ?? "?"}`}
          right={
            <div className="flex items-center gap-2">
              <button onClick={() => markAll(true)} className="px-3 py-2 rounded-xl text-sm bg-green-600 text-white">Mark all participated</button>
              <button onClick={() => markAll(false)} className="px-3 py-2 rounded-xl text-sm bg-gray-200">Clear all</button>
              <button onClick={() => saveParticipants()} className="px-3 py-2 rounded-xl text-sm bg-orange-600 text-white">Save</button>
            </div>
          }
        >
          <ParticipationGrid 
            students={students} 
            grid={grid} 
            selectedActivity={selectedActivity} 
            upsertRow={upsertRow} 
          />
        </Section>
      )}
    </>
  );
}
