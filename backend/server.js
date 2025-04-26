require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;

// Log environment setup
console.log('Current working directory:', process.cwd());
console.log('Environment file path:', path.resolve(process.cwd(), '.env'));
console.log('Environment variables:', {
  PORT: process.env.PORT,
  CONGRESS_API_KEY: process.env.CONGRESS_API_KEY ? 'Set' : 'Not set'
});

// Enable CORS for all routes
app.use(cors());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Proxy endpoint for Congress.gov API
app.get('/api/*', async (req, res) => {
  try {
    if (!process.env.CONGRESS_API_KEY) {
      throw new Error('Congress.gov API key not found in environment variables');
    }

    const apiUrl = `https://api.congress.gov/v3${req.path.replace('/api', '')}`;
    const queryParams = new URLSearchParams(req.query).toString();
    const fullUrl = `${apiUrl}${queryParams ? `?${queryParams}` : ''}`;

    console.log('Proxying request to:', fullUrl);

    const response = await fetch(fullUrl, {
      headers: {
        'X-API-Key': process.env.CONGRESS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    if (!response.ok) {
      console.error('Error response:', responseText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', responseText);
      throw new Error('Invalid JSON response from API');
    }

    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log('Congress.gov API Key:', process.env.CONGRESS_API_KEY ? 'Set' : 'Not set');
}); 