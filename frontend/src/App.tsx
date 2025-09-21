import React, { useEffect, useMemo, useState } from "react";
import logo from "./assets/logo_afterschool_final.png";
import { ActivityOut, StudentOut, SaveParticipantsRow, SaveParticipantsRequest, SaveParticipantsResponse, RowState, ParticipantState } from "./libs/types";
import { api, apiGetParticipants, apiYears } from "./libs/api";
import Section from "./components/ui/Section";
import Pill from "./components/ui/Pill";
import TabButton from "./components/ui/TabButton";
import Certificates from "./pages/Certificates";
import ExportPanel from "./components/ExportPanel";
import Participation from "./pages/Participation";

// ========================= App =========================
export default function App(): JSX.Element {
    type TabId = "participants" | "certificates" | "students" | "activities" | "reports" | "data";

    const [tab, setTab] = useState<TabId>("certificates");
    const [rooms, setRooms] = useState<number[]>([]);
    const [years, setYears] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [activities, setActivities] = useState<ActivityOut[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
    const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
    const [students, setStudents] = useState<StudentOut[]>([]);
    const [grid, setGrid] = useState<Map<number, RowState>>(new Map());

    const selectedActivity = useMemo<ActivityOut | null>(
        () => activities.find((a) => a.id === Number(selectedActivityId)) ?? null,
        [activities, selectedActivityId]
    );

    // Load initial data (years and activities)
    useEffect(() => {
        (async () => {
            try {
                const yy = await apiYears();
                setYears(yy);
                if (!selectedYear && yy.length > 0) setSelectedYear(yy[0]);
            } catch (e) {
                console.warn("Failed to load years:", e);
            }
            try {
                const acts = await api<ActivityOut[]>("/activities");
                setActivities(acts);
            } catch (e) {
                console.warn("Failed to load activities:", e);
            }
        })();
    }, []);

    // Load rooms when selectedYear changes
    useEffect(() => {
        if (!selectedYear) { setRooms([]); return; }
        (async () => {
            try {
                const qs = new URLSearchParams({ school_year: selectedYear });
                const r = await api<number[]>(`/rooms?${qs.toString()}`);
                setRooms(r);
            } catch (e) {
                console.warn("Failed to load rooms:", e);
            }
        })();
    }, [selectedYear]);

    // Load students when room selected
    useEffect(() => {
        if (!selectedRoom) { setStudents([]); return; }
        const on_date = selectedActivity?.activity_date || undefined;
        (async () => {
            try {
                const qs = new URLSearchParams({ room: String(selectedRoom) });
                if (on_date) qs.set("on_date", on_date);
                if (selectedYear) qs.set("school_year", selectedYear);
                const ss = await api<StudentOut[]>(`/students?${qs.toString()}`);
                setStudents(ss);
                setGrid(new Map()); // reset grid when room changes
            } catch (e) {
                console.warn("Failed to load students:", e);
            }
        })();
    }, [selectedRoom, selectedActivity?.activity_date, selectedYear]);

    // When activity or room changes, load existing participation data
    useEffect(() => {
        if (selectedActivityId && selectedRoom) {
            refreshGrid(selectedActivityId, selectedRoom);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedActivityId, selectedRoom, selectedYear]);

    // grid helpers
    function upsertRow(studentId: number, patch: Partial<RowState>): void {
        setGrid((old) => {
            const next = new Map(old);
            const prev: RowState = next.get(studentId) || { participated: false, position: null, team_name: "" };
            next.set(studentId, { ...prev, ...patch });
            return next;
        });
    }

    function markAll(participated: boolean): void {
        const next = new Map<number, RowState>();
        students.forEach((s) => {
            const prev = grid.get(s.id) || { participated: false, position: null, team_name: "" };
            next.set(s.id, { ...prev, participated, position: participated ? prev.position : null });
        });
        setGrid(next);
    }

    async function refreshGrid(activityId: number, room: number): Promise<void> {
        try {
            const participants = await apiGetParticipants(activityId, room, selectedYear || undefined);
            const nextGrid = new Map<number, RowState>();
            for (const p of participants) {
                nextGrid.set(p.student_id, {
                    participated: true, // if they're in the table, they participated
                    position: p.position ?? null,
                    team_name: p.team_name ?? "",
                });
            }
            setGrid(nextGrid);
        } catch (e) {
            console.warn("Failed to refresh grid:", e);
            alert(`Failed to load participation data: ${e}`);
        }
    }

    // When year changes, keep current selections; data reloads elsewhere

    async function saveParticipants(): Promise<void> {
        if (!selectedActivity) { alert("Pick an activity first."); return; }
        if (!selectedRoom) { alert("Pick a room first."); return; }

        const participants: SaveParticipantsRow[] = students.map((s) => {
            const r = grid.get(s.id) || { participated: false, position: null, team_name: "" };
            const shouldSendTeam = !!selectedActivity.is_team && (!!r.participated || r.position != null);
            return {
                student_id: s.id,
                participated: !!r.participated,
                position: (r.position as 1 | 2 | 3 | null) ?? null,
                team_name: shouldSendTeam ? (r.team_name || "") : null,
            };
        });

        if (selectedActivity.is_team) {
            for (const row of participants) {
                const shouldStore = !!row.participated || row.position != null;
                if (shouldStore && (!row.team_name || !row.team_name.trim())) {
                    alert(`Team name required for student_id=${row.student_id}`);
                    return;
                }
            }
        }

        try {
            const res = await api<SaveParticipantsResponse>(`/activities/${selectedActivity.id}/participants`, {
                method: "POST",
                body: JSON.stringify({ room: selectedRoom, participants } as SaveParticipantsRequest),
            });
            alert(`Saved ✔  upserted=${res.upserted}  deleted=${res.deleted}`);
            await refreshGrid(selectedActivity.id, selectedRoom);
        } catch (e: any) {
            alert(`Save failed: ${e?.message ?? String(e)}`);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50">
            <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
                <header className="mb-6">
                    <div className="flex items-center gap-3 justify-center">
                        <img src={logo} alt="Sunny Days logo" className="h-14 w-14 md:h-16 md:w-16 object-contain" />
                        <h1 className="text-2xl md:text-3xl font-bold text-orange-700">Sunny Days Afterschool</h1>
                    </div>
                    <nav className="mt-3 mx-auto flex flex-wrap items-center gap-2 bg-white rounded-2xl p-1 shadow justify-center">
                        {([
                            { id: "participants", label: "Participation" },
                            { id: "certificates", label: "Certificates" },
                            { id: "students", label: "Students" },
                            { id: "activities", label: "Activities" },
                            { id: "reports", label: "Reports" },
                            { id: "data", label: "Import/Export" },
                        ] as { id: TabId; label: string }[]).map((t) => (
                            <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
                                {t.label}
                            </TabButton>
                        ))}
                        <div className="hidden md:block w-px h-6 bg-gray-200 mx-1" />
                        <div className="flex items-center gap-2 px-2 justify-center">
                            <label className="text-sm text-gray-600">Year</label>
                            <select
                                className="h-9 px-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                value={selectedYear ?? ""}
                                onChange={(e) => setSelectedYear(e.target.value || null)}
                            >
                                <option value="">All</option>
                                {years.map((y) => <option key={y} value={y}>{y}</option>)}
                            </select>
                            {tab === "activities" && (
                                <span className="text-xs px-2 py-1 rounded-md bg-orange-100 text-orange-700">Visible activities</span>
                            )}
                        </div>
                    </nav>
                </header>

                {tab === "participants" && (
                    <Participation
                        years={years}
                        selectedYear={selectedYear}
                        setSelectedYear={setSelectedYear}
                        rooms={rooms}
                        activities={activities}
                        students={students}
                        selectedRoom={selectedRoom}
                        setSelectedRoom={setSelectedRoom}
                        selectedActivityId={selectedActivityId}
                        setSelectedActivityId={setSelectedActivityId}
                        selectedActivity={selectedActivity}
                        grid={grid}
                        upsertRow={upsertRow}
                        markAll={markAll}
                        saveParticipants={saveParticipants}
                    />
                )}

                {tab === "certificates" && (
                    <Certificates
                        years={years}
                        selectedYear={selectedYear}
                        setSelectedYear={setSelectedYear}
                        rooms={rooms}
                        activities={activities}
                        students={students}
                        selectedRoom={selectedRoom}
                        setSelectedRoom={setSelectedRoom}
                        selectedActivityId={selectedActivityId}
                        setSelectedActivityId={setSelectedActivityId}
                    />
                )}

                {tab === "reports" && false && (
                    <Section title="Overview">
                        <p className="text-gray-600">Pick the Certificates tab to record an activity by room. This dashboard can be extended with charts later.</p>
                    </Section>
                )}

                {tab === "students" && (
                    <Section title="Students">
                        <p className="text-gray-600">This reads students by room from your backend. Bulk editing/upload could be added if endpoints are exposed.</p>
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">Room</label>
                            <div className="flex gap-2 flex-wrap">
                                {rooms.map((r) => (
                                    <button key={r} onClick={() => setSelectedRoom(r)} className={`px-3 py-2 rounded-xl border ${selectedRoom === r ? "bg-orange-600 text-white border-orange-600" : "bg-white hover:bg-gray-50"}`}>
                                        Room {r}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 overflow-auto">
                                <table className="min-w-full bg-white rounded-xl overflow-hidden">
                                    <thead className="bg-gray-100 text-sm">
                                    <tr>
                                        <th className="text-left px-3 py-2">ID</th>
                                        <th className="text-left px-3 py-2">Name</th>
                                        <th className="text-left px-3 py-2">Room</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {students.map((s) => (
                                        <tr key={s.id} className="border-t">
                                            <td className="px-3 py-2 text-gray-700">{s.id}</td>
                                            <td className="px-3 py-2">{s.first_name} {s.last_name}</td>
                                            <td className="px-3 py-2">{s.room}</td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr><td className="px-3 py-6 text-gray-500" colSpan={3}>Select a room to view students.</td></tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Section>
                )}

                {tab === "activities" && (
                    <Section title="Activities">
                        <div className="overflow-auto">
                            <table className="min-w-full bg-white rounded-xl overflow-hidden">
                                <thead className="bg-gray-100 text-sm">
                                <tr>
                                    <th className="text-left px-3 py-2">Date</th>
                                    <th className="text-left px-3 py-2">Name</th>
                                    <th className="text-left px-3 py-2">Team?</th>
                                </tr>
                                </thead>
                                <tbody>
                                {activities.map((a) => (
                                    <tr key={a.id} className="border-t">
                                        <td className="px-3 py-2 text-gray-700">{a.activity_date}</td>
                                        <td className="px-3 py-2">
                                            <div className="truncate"><span className="font-medium">{a.name}</span> <span className="text-xs text-gray-500">({a.year})</span></div>
                                        </td>
                                        <td className="px-3 py-2">{a.is_team ? <Pill active>Team</Pill> : <Pill>Individual</Pill>}</td>
                                    </tr>
                                ))}
                                {activities.length === 0 && (
                                    <tr><td className="px-3 py-6 text-gray-500" colSpan={3}>No activities found.</td></tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </Section>
                )}

                {tab === "reports" && (
                    <Section title="Reports">
                        <p className="text-gray-600">Room-wise participation summaries and charts can be added here.</p>
                    </Section>
                )}

                {tab === "data" && (
                    <Section title="Import / Export">
                        <p className="text-gray-600 mb-3">JSON export here dumps current UI selections (students in view + grid state). Source of truth remains your backend.</p>
                        <ExportPanel students={students} activities={activities} grid={grid} />
                    </Section>
                )}
            </div>
        </div>
    );
}
