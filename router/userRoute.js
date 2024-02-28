const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
  
      // Validate password strength (e.g., minimum length)
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
  
      // Check if the user already exists
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }
  
      // Hash the password before storing it
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user with the hashed password
      const newUser = new User({ username, email, password: hashedPassword });
      await newUser.save();
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

 router.post('/login', async (req, res) => {
    try {
      const { username, email, password } = req.body;
  
      // Check if the user exists
      const user = await User.findOne({ $or: [{ username }, { email }] });
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
  
      // Check if the provided password is correct
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }
  
      // Generate a token
      const token = jwt.sign({ userId: user._id }, 'yourSecretKey', { expiresIn: '1h' });
  
      res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  router.post('/change-password', async (req, res) => {
    try {
      const { username, password, newPassword, token } = req.body;
  
      // Verify the token
      const decodedToken = jwt.verify(token, 'yourSecretKey');
  
      // Find the user by the decoded user ID
      const user = await User.findById(decodedToken.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Check if the provided password is correct
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }
  
      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password
      user.password = hashedNewPassword;
      await user.save();
  
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
module.exports = router;
