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

const API_KEY = '4ac3ad01f2d5af00d19ded180194ce33';  // hardcoded test

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

app.get('/weather', async (req, res) => {
  try {
    //const API_KEY = 'your_actual_key_here';  // still hardcoded for now
    const url = `https://api.openweathermap.org/data/2.5/weather?q=Galway,IE&appid=${API_KEY}&units=metric`;

    console.log("Requesting:", url);

    const response = await fetch(url);
    console.log("Raw response status:", response.status);

    const data = await response.json();
    console.log("Parsed response:", data);

    if (response.status !== 200) {
      return res.send(`<p>Weather API error: ${data.message || 'Unknown error'}</p>`);
    }

    res.send(`
      <h2>Weather in Galway</h2>
      <p>${data.weather[0].description}</p>
      <p>Temperature: ${data.main.temp}°C</p>
      <a href="/">Back</a>
    `);
  } catch (error) {
    console.error("Exception during fetch:", error);
    res.send("Error fetching weather.");
  }
});



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
