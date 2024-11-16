const schema = `
CREATE TABLE IF NOT EXISTS Workout (
    workout_id varchar(500) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export default schema;
