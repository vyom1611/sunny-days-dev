import React from 'react';
import { StudentOut, RowState, ActivityOut } from '../../libs/types';

type Props = {
  students: StudentOut[];
  grid: Map<number, RowState>;
  selectedActivity: ActivityOut | null;
  upsertRow: (studentId: number, patch: Partial<RowState>) => void;
};

export default function ParticipationGrid({ students, grid, selectedActivity, upsertRow }: Props) {
  if (students.length === 0) {
    return (
      <div className="px-3 py-6 text-gray-500">
        Select a room to load students.
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="min-w-full bg-white rounded-xl overflow-hidden">
        <thead className="bg-gray-100 text-sm">
          <tr>
            <th className="text-left px-3 py-2">Participated</th>
            <th className="text-left px-3 py-2">Name</th>
            <th className="text-left px-3 py-2">Position</th>
            {selectedActivity?.is_team && <th className="text-left px-3 py-2">Team Name</th>}
          </tr>
        </thead>
        <tbody>
          {students.map((s) => {
            const r = grid.get(s.id) || { participated: false, position: null, team_name: "" };
            return (
              <tr key={s.id} className="border-t">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    className="h-6 w-6 accent-orange-600 cursor-pointer align-middle focus:ring-2 focus:ring-orange-400 rounded"
                    aria-label={`Participated: ${s.first_name} ${s.last_name}`}
                    checked={!!r.participated}
                    onChange={(e) => upsertRow(s.id, { participated: e.target.checked, position: e.target.checked ? (grid.get(s.id)?.position ?? null) : null })}
                  />
                </td>
                <td className="px-3 py-2">{s.first_name} {s.last_name}</td>
                <td className="px-3 py-2">
                  <select
                    className="h-10 rounded-lg border px-3 bg-white text-base"
                    value={r.position ?? ""}
                    onChange={(e) => upsertRow(s.id, { position: e.target.value ? Number(e.target.value) as 1 | 2 | 3 : null, participated: true })}
                  >
                    <option value="">-</option>
                    <option value={1}>1st</option>
                    <option value={2}>2nd</option>
                    <option value={3}>3rd</option>
                  </select>
                </td>
                {selectedActivity?.is_team && (
                  <td className="px-3 py-2">
                    <input
                      className="h-10 rounded-lg border px-3 bg-white text-base"
                      placeholder="Team name"
                      value={r.team_name}
                      onChange={(e) => upsertRow(s.id, { team_name: e.target.value })}
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
