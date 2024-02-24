CREATE database bookshelf;

USE bookshelf;

CREATE TABLE Authors (
    author_id INT UNSIGNED PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    nationality VARCHAR(50)
)engine = innodb;

CREATE TABLE Genres (
    genre_id INT UNSIGNED PRIMARY KEY,
    genre_name VARCHAR(50) NOT NULL
)engine = innodb;

CREATE TABLE Books (
    book_id INT UNSIGNED PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    publication_date DATE,
    author_id INT UNSIGNED,
    genre_id INT UNSIGNED,
    FOREIGN KEY (author_id) REFERENCES Authors(author_id),
    FOREIGN KEY (genre_id) REFERENCES Genres(genre_id)
)engine = innodb;

INSERT INTO Authors (author_id, author_name, birth_date, nationality) VALUES
(1, 'J.K. Rowling', '1965-07-31', 'British'),
(2, 'George Orwell', '1903-06-25', 'British'),
(3, 'Jane Austen', '1775-12-16', 'British');

INSERT INTO Genres (genre_id, genre_name) VALUES
(1, 'Fantasy'),
(2, 'Dystopian'),
(3, 'Romance');

INSERT INTO Books (book_id, title, publication_date, author_id, genre_id) VALUES
(101, 'Harry Potter and the Sorcerer''s Stone', '1997-06-26', 1, 1),
(102, '1984', '1949-06-08', 2, 2),
(103, 'Pride and Prejudice', '1813-01-28', 3, 3),
(104, 'Harry Potter and the Chamber of Secrets', '1998-07-02', 1, 1);

-- Retrieve all books along with their authors and genres
SELECT Books.title, Authors.author_name, Genres.genre_name
FROM Books
JOIN Authors ON Books.author_id = Authors.author_id
JOIN Genres ON Books.genre_id = Genres.genre_id;

-- Retrieve book published after the year 1940 and belonging to the 'Fantasy' genre
SELECT Books.title, Authors.author_name, Genres.genre_name, Books.publication_date
FROM Books
JOIN Authors ON Books.author_id = Authors.author_id
JOIN Genres ON Books.genre_id = Genres.genre_id
WHERE Books.publication_date > '1940-06-26' AND Genres.genre_name = 'Fantasy';

ALTER TABLE Genres
ADD COLUMN description VARCHAR(255),
ADD COLUMN age_group VARCHAR(10);

UPDATE Genres
SET description = 'Fantasy can be further divided into High and Low. In High Fantasy the setting is at the forefront of the plot. Low Fantasy involves magic or the supernatural but is set in our familiar world.', age_group = '12-18'
WHERE genre_id = 1;

UPDATE Genres
SET description = 'Usually, but not always, considered a subgenre of Science Fiction, Dystopian novels have emerged as their own genre in recent years.', age_group = '9-12'
WHERE genre_id = 2;

UPDATE Genres
SET description = 'Love serves as the focal point of the plot in this book genre. While other plot elements may be present, the entire story develops the main character’s romantic relationship and usually ends happily.', age_group = '18-34'
WHERE genre_id = 3;









