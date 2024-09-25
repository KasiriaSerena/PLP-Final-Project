const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Serve static files from 'public' directory
app.use(express.static('public'));

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Recipe search endpoint
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  const API_KEY = process.env.SPOONACULAR_API_KEY;
  const BASE_URL = 'https://api.spoonacular.com/recipes/complexSearch';

  try {
    const searchResponse = await axios.get(BASE_URL, {
      params: {
        apiKey: API_KEY,
        query: q,
      },
    });

    // Fetch detailed information for each recipe
    const recipePromises = searchResponse.data.results.map(async (recipe) => {
      const recipeInfoResponse = await axios.get(`https://api.spoonacular.com/recipes/${recipe.id}/information`, {
        params: { apiKey: API_KEY }
      });
      return recipeInfoResponse.data;
    });

    const detailedRecipes = await Promise.all(recipePromises);
    res.json(detailedRecipes); // Send detailed recipes back to the client
  } catch (error) {
    console.error('Error fetching recipes:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching recipes');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});