const schema = `
CREATE TABLE IF NOT EXISTS Workout (
    workout_id INT PRIMARY KEY,
    workout_name varchar(500),
);
`;

export default schema;
