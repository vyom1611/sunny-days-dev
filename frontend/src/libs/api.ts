import { ActivityOut, ParticipantDraft, Student, ParticipantState } from "./types";

const BASE_URL: string = (import.meta as any).env.VITE_API_BASE || "http://127.0.0.1:8001";

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${msg}`);
    }
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return res.json() as Promise<T>;
    // @ts-expect-error allow text return when T is any
    return res.text();
}

export default api;

// Convenience helpers
export async function apiActivities(): Promise<ActivityOut[]> {
  return api<ActivityOut[]>("/activities");
}

export async function apiYears(): Promise<string[]> {
  return api<string[]>("/years");
}

export async function apiStudents(room: number, on_date: string, school_year?: string): Promise<Student[]> {
  const qs = new URLSearchParams({ room: String(room), on_date });
  if (school_year) qs.set("school_year", school_year);
  return api<Student[]>(`/students?${qs.toString()}`);
}

export async function apiSaveParticipants(
  activityId: number,
  payload: { room: number; participants: ParticipantDraft[] }
): Promise<void> {
  await api(`/activities/${activityId}/participants`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiGetParticipants(activityId: number, room: number, school_year?: string): Promise<ParticipantState[]> {
  const qs = new URLSearchParams({ room: String(room) });
  if (school_year) qs.set("school_year", school_year);
  return api<ParticipantState[]>(`/activities/${activityId}/participants?${qs.toString()}`);
}

// Download generated PPT as Blob (multipart/form-data)
export async function downloadCertificatesPpt(activityId: number, form: FormData): Promise<Blob> {
  const res = await fetch(`${BASE_URL}/activities/${activityId}/certificates/ppt`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${msg}`);
  }
  return await res.blob();
}
