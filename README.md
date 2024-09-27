# Recipe App - Savour Search

## Overview

The Savour Search Recipe App is a web application designed to assist users in finding and exploring a wide variety of recipes. This project is part of the PLP web module specialization and features a user authentication system, allowing users to register and log in securely. The app utilizes the Spoonacular API to offer detailed recipe information, including ingredients, instructions, and dietary restrictions.

## Features

- **User Authentication**: 
  - Users can register for a new account and log in to access personalized features.
  - Passwords are securely stored in a MySQL database.
  
- **Recipe Search Functionality**: 
  - Users can search for recipes based on specific ingredients or dish names.
  
- **Detailed Recipe Information**: 
  - Each recipe displays comprehensive details, including step-by-step instructions and a complete list of ingredients.
  
- **User-Friendly Interface**: 
  - The application features a clean, kitchen-themed design that enhances the user experience.

## Technologies Used

- **Frontend**: 
  - HTML, CSS, JavaScript
  
- **Backend**: 
  - Node.js, Express.js
  - MySQL for user data storage and authentication
  
- **API**: 
  - Spoonacular API for retrieving recipe data
  
- **Version Control**: 
  - Git and GitHub

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/KasiriaSerena/PLP-Final-Project.git
Navigate to the project directory:


cd PLP-Final-Project
Install the required packages:


npm install
Create a .env file in the root directory and add your Spoonacular API key and MySQL connection details:

env

SPOONACULAR_API_KEY=your_api_key_here
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

Usage
Start the server:


npm start
The server will run on http://localhost:3000.

Access the app:

Open your browser and navigate to http://localhost:3000 to access the app.
Users can register and log in to start using the recipe search functionality.
Search for Recipes:

Utilize the search bar to find recipes based on ingredients or dish names.
Click on any recipe to view detailed information.
Contributing
Contributions are welcome! If you would like to contribute to the project, please fork the repository and submit a pull request with your changes.

License
This project is licensed under the MIT License.

Acknowledgments
Spoonacular API for providing recipe data.
Bootstrap for styling.