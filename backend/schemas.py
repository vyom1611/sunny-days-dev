from pydantic import BaseModel, Field
from typing import Literal, Optional, List
from datetime import date

Weekday = Literal["Mon", "Tue", "Wed", "Thu", "Fri"]
ProgramName = Literal[
    "fulltime_after",
    "fulltime_before",
    "fulltime_before_and_after",
    "parttime_3days_after",
    "parttime_2days_after",
    "holiday",
]

class StudentOut(BaseModel):
    id: int
    school_name: str
    grade: str
    first_name: str
    last_name: str
    school_year: str
    age: int
    dob: date
    picture: Optional[str] = None
    room: int
    program_name: ProgramName
    parttime_days: List[Weekday]

    class Config:
        from_attributes = True

class ActivityOut(BaseModel):
    id: int
    year: int
    name: str
    activity_date: date
    is_team: bool
    show_in_ui: bool

    class Config:
        from_attributes = True

class ParticipantDraft(BaseModel):
    student_id: int
    participated: bool
    position: Optional[Literal[1, 2, 3]] = None
    team_name: Optional[str] = None

class ParticipantState(BaseModel):
    student_id: int
    position: Optional[Literal[1, 2, 3]] = None
    team_name: Optional[str] = None

    class Config:
        from_attributes = True

class SaveParticipantsRequest(BaseModel):
    room: int
    participants: List[ParticipantDraft]

class SaveParticipantsResponse(BaseModel):
    upserted: int
    deleted: int
