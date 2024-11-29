import express from 'express';
import mysql from 'mysql';
import bodyParser from 'body-parser';
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Default MySQL user
  password: '', // Default MySQL password
  database: 'goalgetter', // Your database name
});
//or: require('dotenv').config();



// Connect to the database
connection.connect(function (error) {
  if (error) {
    console.error('Error connecting to the database:', error.stack);
    return;
  }
  console.log('Connected to the database!');
});

// Route to handle task creation
app.post('/tasks', (req, res) => {
  const { task_name, category, due_date, due_time, priority } = req.body;
  const status = 'pas commencé'; // Default status (must match ENUM in the database)

  // Combine due_date and due_time into a single DateTime
  let dueDateTime = null;
  if (due_date && due_time) {
    dueDateTime = `${due_date} ${due_time}`; // Combines both into a single string
  } else if (due_date) {
    dueDateTime = `${due_date} 00:00:00`; // Default time if not provided
  }

  // Check if the due date is in the past
  if (dueDateTime) {
    const currentDate = new Date();
    const dueDate = new Date(dueDateTime);

    // Compare dates
    if (dueDate < currentDate) {
      return res.status(400).send(`
        <h1>Error</h1>
        <p style="color: red;">The due date cannot be in the past.</p>
        <a href="http://127.0.0.1:5500/index.html">Go back</a>
      `);
    }
  }

  // Insert the new task into the database
  const query = `INSERT INTO tasks (task_name, category, due_date, priority, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())`;
  const values = [task_name, category, dueDateTime, priority, status];

  // Execute your query with the values
  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error inserting task:", err);
      return res.status(500).send(`
        <h1>Error</h1>
        <p style="color: red;">Error inserting task. Please try again later.</p>
        <a href="/">Go back</a>
      `);
    } else {
      console.log("Task inserted successfully:", result);
      return res.send(`
        <h1>Success</h1>
        <p style="color: green;">Task inserted successfully!</p>
        <a href="http://127.0.0.1:5500/index.html">Go back</a>
      `);
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});