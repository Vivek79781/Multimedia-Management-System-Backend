DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Multimedia;

CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name TEXT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE Multimedia (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    public_id VARCHAR(255) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    author TEXT,
    description TEXT NOT NULL,
    type ENUM('image', 'video', 'audio', 'document') NOT NULL,
    link TEXT NOT NULL,
    public INTEGER NOT NULL DEFAULT 0,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);