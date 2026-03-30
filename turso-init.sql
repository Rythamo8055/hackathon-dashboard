-- Run this in Turso Dashboard Shell

CREATE TABLE IF NOT EXISTS Contestant (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    teamName TEXT NOT NULL,
    project TEXT NOT NULL,
    teamNumber INTEGER UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Judge (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Organizer (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Rating (
    id TEXT PRIMARY KEY,
    contestantId TEXT NOT NULL,
    judgeId TEXT NOT NULL,
    round INTEGER NOT NULL,
    score INTEGER NOT NULL,
    reason TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contestantId) REFERENCES Contestant(id),
    FOREIGN KEY (judgeId) REFERENCES Judge(id),
    UNIQUE(contestantId, judgeId, round)
);

-- Insert default judges
INSERT OR IGNORE INTO Judge (id, username, password, name) VALUES 
    ('judge1', 'judge1', 'judge123', 'Judge One'),
    ('judge2', 'judge2', 'judge123', 'Judge Two'),
    ('judge3', 'judge3', 'judge123', 'Judge Three');

-- Insert default organizer
INSERT OR IGNORE INTO Organizer (id, username, password, name) VALUES 
    ('org1', 'admin', 'admin123', 'Admin');
