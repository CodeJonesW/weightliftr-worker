const schema = `
CREATE TABLE IF NOT EXISTS Users (
    user_id varchar(500) PRIMARY KEY,
    email TEXT,
    user_password TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS Workout (
    workout_id varchar(500) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    workout_title TEXT
);

CREATE TABLE IF NOT EXISTS Exercise (
    exercise_id varchar(500) PRIMARY KEY,
    workout_id varchar(500),
    reps varchar(500),
    sets varchar(500),
    weight varchar(500),
    name varchar(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(workout_id) REFERENCES Workout(workout_id)
);

`;

export default schema;
