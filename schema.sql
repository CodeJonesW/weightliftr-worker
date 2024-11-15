DROP TABLE IF EXISTS Auth;
DROP TABLE IF EXISTS Users;

CREATE TABLE IF NOT EXISTS Users (
    user_id varchar(500) PRIMARY KEY,
    email TEXT,
    user_password TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS Auth (
    auth_id INTEGER PRIMARY KEY,
    user_id INTEGER,
    login_attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
);
