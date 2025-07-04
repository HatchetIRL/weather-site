require('dotenv').config();
console.log("Loaded API_KEY:", process.env.API_KEY);

const express = require('express');
//const fetch = require('node-fetch');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
//const API_KEY = process.env.API_KEY;

//const API_KEY = '4ac3ad01f2d5af00d19ded180194ce33';  // hardcoded test

//const url = `https://api.openweathermap.org/data/2.5/weather?q=Galway,IE&appid=${API_KEY}&units=metric`;


app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Debug output
  console.log('Entered:', username, password);
  console.log('Expected:', process.env.USERNAME, process.env.PASSWORD);
  
  
  if (username === USERNAME && password === PASSWORD) {
    res.redirect('/weather');
  } else {
    res.send('Invalid login.');
  }
});

// Only serve static files AFTER login route
app.use(express.static(path.join(__dirname, 'public')));

app.get('/weather', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/standings.html'));
});



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
