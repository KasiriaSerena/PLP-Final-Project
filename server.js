'use strict';

const express = require('express'); 
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Ensure saltRounds is used

const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql', // or 'sqlite', 'postgres', etc.
});

// Define User model
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

// Sync database
sequelize.sync().then(() => {
  console.log('Database & tables created!');
});

const app = express();
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 

app.use(express.static('public'));

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Recipe search route using Spoonacular API
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

// Render login page
app.get('/login', (req, res) => {
  res.render('login', { errors: [], isSubmitted: false }); 
});

// Render signup page
app.get('/signup', (req, res) => {
  res.render('signup'); 
});

// Signup route
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
      // Check if the user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.render('signup', { errors: [{ msg: 'User already exists' }] });
      }

      // Hash the password with saltRounds
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create the new user
      const user = await User.create({ username, email, password: hashedPassword });

      res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
      console.error('Error registering user:', error.message);
      res.status(500).json({ message: 'Server error', error });
    }
  }
);

// Login route
app.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').exists().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const isSubmitted = true; // Flag indicating that form was submitted

    if (!errors.isEmpty()) {
      return res.render('login', { errors: errors.array(), isSubmitted });
    }

    const { email, password } = req.body;

    try {
      // Find the user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        console.log('Login failed: User not found for email:', email);
        return res.render('login', { errors: [{ msg: 'Invalid credentials' }], isSubmitted });
      }

      // Compare the entered password with the hashed password stored in the database
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        console.log('Login failed: Incorrect password for user:', email);
        return res.render('login', { errors: [{ msg: 'Invalid credentials' }], isSubmitted });
      }

      // Generate JWT token if login is successful
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log('User logged in successfully:', user.email);

      res.status(200).json({ message: 'Logged in successfully', token });
    } catch (error) {
      console.error('Error logging in:', error.message);
      res.status(500).json({ message: 'Server error', error });
    }
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});