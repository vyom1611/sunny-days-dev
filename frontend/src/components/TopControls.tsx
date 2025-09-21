import React from "react";
import { ActivityOut } from "../libs/types";

type Props = {
    rooms: number[];
    activities: ActivityOut[];
    room: number | null;
    setRoom: (r: number | null) => void;
    activityId: number | null;
    setActivityId: (id: number | null) => void;
    activityDate: string;
    setActivityDate: (d: string) => void;
    isTeam: boolean;
    awardDate: string;
    setAwardDate: (d: string) => void;
};

export default function TopControls({
                                        rooms,
                                        activities,
                                        room,
                                        setRoom,
                                        activityId,
                                        setActivityId,
                                        activityDate,
                                        setActivityDate,
                                        isTeam,
                                        awardDate,
                                        setAwardDate,
                                    }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">Room No.</label>
                <select
                    value={room ?? ""}
                    onChange={(e) => setRoom(e.target.value ? Number(e.target.value) : null)}
                    className="w-full rounded-lg border px-3 py-2 bg-white"
                >
                    <option value="" disabled>Select</option>
                    {rooms.map((r) => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Activity</label>
                <select
                    value={activityId ?? ""}
                    onChange={(e) => setActivityId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full rounded-lg border px-3 py-2 bg-white"
                >
                    <option value="" disabled>Select</option>
                    {activities.map((a) => (
                        <option key={a.id} value={a.id}>{a.name} • {a.activity_date}</option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Category: {isTeam ? "Team" : "Individual"}</p>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Activity Date</label>
                <input
                    type="date"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 bg-white"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Award Date (for participation)</label>
                <input
                    type="date"
                    value={awardDate}
                    onChange={(e) => setAwardDate(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 bg-white"
                />
            </div>
        </div>
    );
}
