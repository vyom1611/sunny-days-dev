import React from "react";
import { ParticipantDraft, Student } from "../libs/types";

type Props = {
    students: Student[];
    rows: Record<number, ParticipantDraft>;
    setRow: (id: number, patch: Partial<ParticipantDraft>) => void;
    isTeam: boolean;
    onBulkParticipate: (v: boolean) => void;
    onClearPositions: () => void;
};

export default function StudentTable({
                                         students,
                                         rows,
                                         setRow,
                                         isTeam,
                                         onBulkParticipate,
                                         onClearPositions,
                                     }: Props) {
    return (
        <div className="border rounded-xl bg-white">
            <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-sm font-semibold bg-gray-100 rounded-t-xl">
                <div className="col-span-3">Student</div>
                <div className="col-span-1 text-center">1st</div>
                <div className="col-span-1 text-center">2nd</div>
                <div className="col-span-1 text-center">3rd</div>
                {isTeam && <div className="col-span-3">Team Name</div>}
                <div className={isTeam ? "col-span-3" : "col-span-5"}>Participation</div>
            </div>

            <div className="max-h-[28rem] overflow-y-auto divide-y">
                {students.map((s) => {
                    const r = rows[s.id] ?? ({ student_id: s.id, participated: false, position: null } as ParticipantDraft);
                    return (
                        <div key={s.id} className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 px-4 py-3">
                            <div className="md:col-span-3">
                                <div className="font-medium">{s.first_name} {s.last_name}</div>
                                <div className="text-xs text-gray-500">Age {s.age} • Room {s.room}</div>
                            </div>

                            {[1, 2, 3].map((p) => (
                                <div key={p} className="md:col-span-1 flex items-center justify-center">
                                    <input
                                        type="radio"
                                        name={`pos-${s.id}`}
                                        aria-label={`${p} place`}
                                        checked={r.position === p}
                                        onChange={() => setRow(s.id, { position: p as 1 | 2 | 3, participated: true })}
                                        className="h-4 w-4"
                                    />
                                </div>
                            ))}

                            {isTeam && (
                                <div className="md:col-span-3">
                                    <input
                                        className="w-full rounded-lg border px-3 py-2 bg-white"
                                        placeholder="Team name"
                                        value={r.team_name ?? ""}
                                        onChange={(e) => setRow(s.id, { team_name: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className={isTeam ? "md:col-span-3" : "md:col-span-5"}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={r.participated}
                                        onChange={(e) => setRow(s.id, { participated: e.target.checked })}
                                    />
                                    <button
                                        type="button"
                                        className="text-sm text-blue-600 hover:underline"
                                        onClick={() => setRow(s.id, { position: null })}
                                    >
                                        Clear pos
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {students.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No students.</div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3 p-3">
                <label className="inline-flex items-center gap-2">
                    <input type="checkbox" onChange={(e) => onBulkParticipate(e.target.checked)} />
                    <span className="text-sm">Mark all as participated</span>
                </label>
                <button
                    type="button"
                    className="text-sm px-3 py-1.5 rounded-lg border"
                    onClick={onClearPositions}
                >
                    Clear all positions
                </button>
            </div>
        </div>
    );
}
