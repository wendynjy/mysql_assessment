require('dotenv').config();

const express = require('express');
const mysql = require('mysql');
const path = require('path');
const hbs = require('hbs');
const wax = require('wax-on');
const handlebarHelpers = require('handlebars-helpers')({
  'handlebars': hbs.handlebars
});

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Set up Handlebars
app.set('view engine', 'hbs');

// Use Wax-On for additional Handlebars helpers
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');

// Routes
// Add your routes here
app.get('/', (req, res) => {
    res.send('Hello, World!'); // Replace this with the appropriate response
});

// Render the page to list books
app.get('/books', (req, res) => {
  // Check if there is a search query in the URL
  const searchQuery = req.query.search;

  // SQL query to fetch books
  let sql = `
      SELECT Books.*, Authors.author_name, Genres.genre_name
      FROM Books
      JOIN Authors ON Books.author_id = Authors.author_id
      JOIN Genres ON Books.genre_id = Genres.genre_id
  `;
  
  // If there is a search query, modify the SQL query to filter results
  if (searchQuery) {
      sql += `
          WHERE Books.title LIKE '%${searchQuery}%' OR
          Authors.author_name LIKE '%${searchQuery}%' OR
          Genres.genre_name LIKE '%${searchQuery}%'
      `;
  }

  connection.query(sql, (err, results) => {
      if (err) {
          console.error('Error fetching books: ', err);
          res.status(500).send('Internal Server Error');
          return;
      }
      res.render('index', { books: results, searchQuery: searchQuery });
  });
});

// Render the form to create a new book
app.get('/books/new', (req, res) => {
  // Fetch authors
  const sqlAuthors = `SELECT * FROM Authors`;
  connection.query(sqlAuthors, (errAuthors, authors) => {
    if (errAuthors) {
      console.error('Error fetching authors: ', errAuthors);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Fetch genres
    const sqlGenres = `SELECT * FROM Genres`;
    connection.query(sqlGenres, (errGenres, genres) => {
      if (errGenres) {
        console.error('Error fetching genres: ', errGenres);
        res.status(500).send('Internal Server Error');
        return;
      }

        // Render the edit form with book details, authors, and genres
        res.render('new_book', { authors: authors, genres: genres });
    });
  });
});

// Render the form to edit an existing book
app.get('/books/:id/edit', (req, res) => {
  const bookId = req.params.id;
  
  // Fetch authors
  const sqlAuthors = `SELECT * FROM Authors`;
  connection.query(sqlAuthors, (errAuthors, authors) => {
    if (errAuthors) {
      console.error('Error fetching authors: ', errAuthors);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Fetch genres
    const sqlGenres = `SELECT * FROM Genres`;
    connection.query(sqlGenres, (errGenres, genres) => {
      if (errGenres) {
        console.error('Error fetching genres: ', errGenres);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Fetch book details
      const sqlBook = `
        SELECT Books.*, Authors.author_name AS author_name, Genres.genre_name AS genre_name
        FROM Books
        JOIN Authors ON Books.author_id = Authors.author_id
        JOIN Genres ON Books.genre_id = Genres.genre_id
        WHERE Books.book_id = ?
      `;
      connection.query(sqlBook, [bookId], (errBook, book) => {
        if (errBook) {
          console.error('Error fetching book: ', errBook);
          res.status(500).send('Internal Server Error');
          return;
        }

        // Render the edit form with book details, authors, and genres
        res.render('edit_book', { book: book[0], authors: authors, genres: genres });
      });
    });
  });
});

// Render the confirmation page before deleting a book
app.get('/books/:id/delete', (req, res) => {
  const bookId = req.params.id;
  const sql = `
    SELECT Books.*, Authors.author_name, Genres.genre_name
    FROM Books
    JOIN Authors ON Books.author_id = Authors.author_id
    JOIN Genres ON Books.genre_id = Genres.genre_id
    WHERE Books.book_id = ?
  `;

  connection.query(sql, [bookId], (err, results) => {
    if (err) {
      console.error('Error fetching book: ', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    if (results.length === 0) {
      res.status(404).send('Book not found');
      return;
    }
    res.render('confirm_delete', { book: results[0] });
  });
});

// Update book
app.post('/books/:id/update', async function (req, res) {
  const bookId = req.params.id;
  const { title, author, genre } = req.body;
  // Ensure all required fields are present
  if (!title || !author || !genre) {
    res.status(400).send('All fields are required');
    return;
  }

  const query = `
    UPDATE Books
    SET title = ?, author_id = ?, genre_id = ?
    WHERE book_id = ?
  `;

  const values = [title, author, genre, bookId];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error('Error updating book: ', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.redirect('/books');
  });
});

// Delete book
app.post('/books/:id/delete', async function (req, res) {
  const bookId = req.params.id;
  const query = `
    DELETE FROM Books
    WHERE book_id = ?
  `;
  const values = [bookId];
  connection.query(query, values, (error, results) => {
    if (error) {
      console.error('Error deleting book: ', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.redirect('/books');
  });
});

// Add new book
app.post('/books/add', async function (req, res) {
  const { title, author, genre } = req.body;
  // Ensure all required fields are present
  if (!title || !author || !genre) {
    res.status(400).send('All fields are required');
    return;
  }

  const query = `
    INSERT INTO Books (title, author_id, genre_id)
    VALUES (?, ?, ?)
  `;

  const values = [title, author, genre];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error('Error adding new book: ', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.redirect('/books');
  });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
