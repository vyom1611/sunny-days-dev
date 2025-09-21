from sqlalchemy import (
    Boolean, Column, Date, ForeignKey, Integer, String, UniqueConstraint
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.types import JSON
from database import Base

# Enums saved as strings; parttime_days saved as JSON array of strings.

class Student(Base):
    __tablename__ = "students"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    school_name: Mapped[str] = mapped_column(String(100), nullable=False)
    grade: Mapped[str] = mapped_column(String(10), nullable=False)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    school_year: Mapped[str] = mapped_column(String(9), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    dob: Mapped[str] = mapped_column(Date, nullable=False)
    picture: Mapped[str | None] = mapped_column(String, nullable=True)  # path or URL
    room: Mapped[int] = mapped_column(Integer, nullable=False)
    program_name: Mapped[str] = mapped_column(String(40), nullable=False)
    parttime_days: Mapped[list[str]] = mapped_column(JSON, nullable=False)

    participants: Mapped[list["ActivityParticipant"]] = relationship(
        back_populates="student", cascade="all, delete-orphan"
    )


class Activity(Base):
    __tablename__ = "activities"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    activity_date: Mapped[str] = mapped_column(Date, nullable=False)
    is_team: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    # Only activities with this flag set to True should be shown/used in UI and related flows
    show_in_ui: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    participants: Mapped[list["ActivityParticipant"]] = relationship(
        back_populates="activity", cascade="all, delete-orphan"
    )


class ActivityParticipant(Base):
    __tablename__ = "activity_participants"
    activity_id: Mapped[int] = mapped_column(ForeignKey("activities.id"), primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), primary_key=True)
    position: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 1,2,3 or null
    team_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    activity: Mapped[Activity] = relationship(back_populates="participants")
    student: Mapped[Student] = relationship(back_populates="participants")

    __table_args__ = (
        UniqueConstraint("activity_id", "student_id", name="uix_activity_student"),
    )
