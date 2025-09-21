export type ActivityOut = {
    id: number;
    year: number;
    name: string;
    activity_date: string; // YYYY-MM-DD
    is_team: boolean;
    show_in_ui: boolean;
};

export type StudentOut = {
    id: number;
    first_name: string;
    last_name: string;
    room: number;
    // backend has more fields; we don't need them here
    school_name?: string;
    grade?: string;
    school_year?: string;
    age?: number;
    dob?: string;
    picture?: string | null;
    program_name?: string;
    parttime_days?: string[];
};

export type SaveParticipantsRow = {
    student_id: number;
    participated?: boolean;
    position?: 1 | 2 | 3 | null;
    team_name?: string | null;
};

export type SaveParticipantsRequest = {
    room: number;
    participants: SaveParticipantsRow[];
};

export type SaveParticipantsResponse = {
    upserted: number;
    deleted: number;
};

// Row state for the UI grid
export type RowState = {
    participated: boolean;
    position: 1 | 2 | 3 | null;
    team_name: string; // kept as empty string when unused
};

// ===== Compatibility aliases (for existing components/pages) =====
// Some components refer to Activity/Student/ParticipantDraft; alias them to current types.
export type Activity = ActivityOut;
export type Student = StudentOut & { age?: number };
export type ParticipantDraft = SaveParticipantsRow;
export type Room = number;

export type ParticipantState = {
    student_id: number;
    position: 1 | 2 | 3 | null;
    team_name: string | null;
};
