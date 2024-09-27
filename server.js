'use strict';

const express = require('express'); 
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const { User } = require('./models'); 

const app = express();
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

const PORT = process.env.PORT || 3000;


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 


app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


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

    const recipePromises = searchResponse.data.results.map(async (recipe) => {
      const recipeInfoResponse = await axios.get(`https://api.spoonacular.com/recipes/${recipe.id}/information`, {
        params: { apiKey: API_KEY },
      });
      return recipeInfoResponse.data;
    });

    const detailedRecipes = await Promise.all(recipePromises);
    res.json(detailedRecipes);
  } catch (error) {
    console.error('Error fetching recipes:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching recipes');
  }
});


app.get('/login', (req, res) => {
  res.render('login'); 
});


app.get('/signup', (req, res) => {
  res.render('signup'); 
});


app.post(
  '/signup',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('signup', { errors: errors.array() }); 
    }

    const { username, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.render('signup', { errors: [{ msg: 'User already exists' }] }); 
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashedPassword });

      res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
      console.error('Error registering user:', error.message);
      res.status(500).json({ message: 'Server error', error });
    }
  }
);


app.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').exists().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('login', { errors: errors.array() }); 
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.render('login', { errors: [{ msg: 'Invalid credentials' }] }); 
      }

      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.render('login', { errors: [{ msg: 'Invalid credentials' }] }); 
      }

     
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ message: 'Logged in successfully', token });
      
      
      
    } catch (error) {
      console.error('Error logging in:', error.message);
      res.status(500).json({ message: 'Server error', error });
    }
  }
);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});