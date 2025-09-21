CREATE TABLE dbo.Activities (
    id                  INT             IDENTITY(1,1)   PRIMARY KEY,
    [year]              INT             NOT NULL,
    name                NVARCHAR(100)   NOT NULL,
    activity_date       DATE            NOT NULL,
    first_place_id      INT             NULL
        CONSTRAINT FK_Activities_FirstPlace  
        REFERENCES dbo.Students(id),
    second_place_id     INT             NULL
        CONSTRAINT FK_Activities_SecondPlace 
        REFERENCES dbo.Students(id),
    third_place_id      INT             NULL
        CONSTRAINT FK_Activities_ThirdPlace  
        REFERENCES dbo.Students(id)
);

-- 3) ACTIVITY_PARTICIPANTS junction table
CREATE TABLE dbo.ActivityParticipants (
    activity_id   INT NOT NULL
        CONSTRAINT FK_ActivityParticipants_Activity 
        REFERENCES dbo.Activities(id),
    student_id    INT NOT NULL
        CONSTRAINT FK_ActivityParticipants_Student  
        REFERENCES dbo.Students(id),
    CONSTRAINT PK_ActivityParticipants 
        PRIMARY KEY (activity_id, student_id)
);