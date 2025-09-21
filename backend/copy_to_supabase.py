import os
from typing import Iterable, Callable

from sqlalchemy import create_engine, select, text
from sqlalchemy.orm import sessionmaker, Session
from urllib.parse import quote_plus

from models import Base, Student, Activity, ActivityParticipant


def _require_env(var_name: str) -> str:
    value = os.environ.get(var_name)
    if not value or not value.strip():
        raise RuntimeError(f"Environment variable {var_name} is required")
    return value


def _create_mssql_engine_from_odbc(odbc_dsn: str):
    sqlalchemy_url = "mssql+pyodbc:///?odbc_connect=" + quote_plus(odbc_dsn)
    return create_engine(sqlalchemy_url, pool_pre_ping=True, fast_executemany=True)


def _create_postgres_engine(pg_url: str):
    return create_engine(pg_url, pool_pre_ping=True)


def _copy_rows(
    src_session: Session,
    dst_session: Session,
    select_stmt,
    row_to_instance: Callable[[object], object],
    batch_size: int = 1000,
) -> int:
    total_inserted = 0
    batch: list[object] = []
    for row in src_session.execute(select_stmt).scalars():
        instance = row_to_instance(row)
        batch.append(instance)
        if len(batch) >= batch_size:
            dst_session.add_all(batch)
            dst_session.commit()
            total_inserted += len(batch)
            batch.clear()
    if batch:
        dst_session.add_all(batch)
        dst_session.commit()
        total_inserted += len(batch)
    return total_inserted


def _reset_identity_sequence(session: Session, table_name: str, id_column: str = "id") -> None:
    session.execute(
        text(
            "SELECT setval(pg_get_serial_sequence(:t, :c), COALESCE((SELECT MAX("
            + id_column
            + ") FROM "
            + table_name
            + "), 0))"
        ),
        {"t": table_name, "c": id_column},
    )
    session.commit()


def main() -> None:
    mssql_odbc = _require_env("MSSQL_ODBC")
    pg_url = _require_env("PG_URL")

    print("Connecting to Azure SQL (source)...")
    src_engine = _create_mssql_engine_from_odbc(mssql_odbc)
    SrcSession = sessionmaker(bind=src_engine)

    print("Connecting to Supabase Postgres (target)...")
    dst_engine = _create_postgres_engine(pg_url)
    DstSession = sessionmaker(bind=dst_engine)

    # Create schema on the target according to SQLAlchemy models
    print("Creating schema on target (if not exists)...")
    Base.metadata.create_all(bind=dst_engine)

    with SrcSession() as s_src, DstSession() as s_dst:
        # Copy activities first
        print("Copying activities...")
        inserted_acts = _copy_rows(
            s_src,
            s_dst,
            select(Activity),
            lambda a: Activity(
                id=a.id,
                year=a.year,
                name=a.name,
                activity_date=a.activity_date,
                is_team=a.is_team,
                show_in_ui=a.show_in_ui,
            ),
        )
        print(f"Inserted activities: {inserted_acts}")

        # Copy students
        print("Copying students...")
        inserted_students = _copy_rows(
            s_src,
            s_dst,
            select(Student),
            lambda st: Student(
                id=st.id,
                school_name=st.school_name,
                grade=st.grade,
                first_name=st.first_name,
                last_name=st.last_name,
                school_year=st.school_year,
                age=st.age,
                dob=st.dob,
                picture=st.picture,
                room=st.room,
                program_name=st.program_name,
                parttime_days=st.parttime_days,
            ),
        )
        print(f"Inserted students: {inserted_students}")

        # Copy junction table
        print("Copying activity participants...")
        inserted_parts = _copy_rows(
            s_src,
            s_dst,
            select(ActivityParticipant),
            lambda ap: ActivityParticipant(
                activity_id=ap.activity_id,
                student_id=ap.student_id,
                position=ap.position,
                team_name=ap.team_name,
            ),
        )
        print(f"Inserted activity_participants: {inserted_parts}")

        # Reset sequences for tables with integer identities
        print("Resetting sequences...")
        _reset_identity_sequence(s_dst, "activities", "id")
        _reset_identity_sequence(s_dst, "students", "id")

    print("Done.")


if __name__ == "__main__":
    main()


