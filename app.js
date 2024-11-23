const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Person = require('./models/Person');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose
  .connect('mongodb://localhost:27017/personDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Connection failed:', err));

// Routes
// GET /person: Display a table with the list of people
app.get('/person', async (req, res) => {
  try {
    const people = await Person.find();
    res.render('index', { people });
  } catch (err) {
    res.status(500).send('Error fetching people');
  }
});

// POST /person: Display a form to create a person
app.get('/person/new', (req, res) => {
  res.render('form', { person: null, action: '/person', method: 'POST' });
});

app.post('/person', async (req, res) => {
  try {
    const { name, age, gender, mobile } = req.body;
    await Person.create({ name, age, gender, mobile });
    res.redirect('/person');
  } catch (err) {
    res.status(500).send('Error creating person');
  }
});

// PUT /person/{id}: Display a form to edit a person
app.get('/person/:id/edit', async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) return res.status(404).send('Person not found');
    res.render('form', { person, action: `/person/${person.id}?_method=PUT`, method: 'POST' });
  } catch (err) {
    res.status(500).send('Error fetching person');
  }
});

app.post('/person/:id', async (req, res) => {
  try {
    const { name, age, gender, mobile } = req.body;
    await Person.findByIdAndUpdate(req.params.id, { name, age, gender, mobile });
    res.redirect('/person');
  } catch (err) {
    res.status(500).send('Error updating person');
  }
});

// DELETE /person/{id}: Display a page to delete a person
app.get('/person/:id/delete', async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) return res.status(404).send('Person not found');
    res.render('delete', { person });
  } catch (err) {
    res.status(500).send('Error fetching person');
  }
});

app.post('/person/:id/delete', async (req, res) => {
  try {
    await Person.findByIdAndDelete(req.params.id);
    res.redirect('/person');
  } catch (err) {
    res.status(500).send('Error deleting person');
  }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/person`);
});
