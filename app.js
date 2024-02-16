require('dotenv').config();

const express = require('express');
const mysql = require('mysql');
const path = require('path');

// Create an instance of Express Handlebars
const exphbs = require('express-handlebars').create({
  extname: '.hbs'
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

// Configure Handlebars
app.engine('.hbs', exphbs.engine);
app.set('view engine', '.hbs');

// Routes
// Add your routes here
app.get('/', (req, res) => {
    res.send('Hello, World!'); // Replace this with the appropriate response
});

app.get('/books', (req, res) => {
    const sql = `
        SELECT Books.*, Authors.author_name, Genres.genre_name
        FROM Books
        JOIN Authors ON Books.author_id = Authors.author_id
        JOIN Genres ON Books.genre_id = Genres.genre_id
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching books: ', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.render('index', { books: results });
    });
});

// Render the form to create a new book
app.get('/books/new', (req, res) => {
  res.render('new_book');
});

// Render the form to edit an existing book
app.get('/books/:id/edit', (req, res) => {
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
    res.render('edit_book', { book: results[0] });
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
