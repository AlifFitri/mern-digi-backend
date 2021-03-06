const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

router.get('/', auth, async (req, res) => { 
  try {
    const user = await User.findById(req.user.id).select('-password');

    if(user == null){
      return res.status(404).json({ msg: 'User Not Longer Exist'})
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/login',
[
  check('email', 'Please use a valid email').isEmail(),
  check('password', 'Password is required').exists(),
],
async (req, res) => {

  // check for validation error
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array()});
  }
  
  // destructure request body
  const {email, password} = req.body;
  
  try {

    // check if user already exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: [{msg: 'Invalid Credentials'}] });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ errors: [{msg: 'Invalid Credentials'}] });
    }

    const payload = {
      user: {
        id: user.id,
        name: user.name
      }
    }

    // sign in for JWT-Token
    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: 36000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      });


  } catch(err) {

    console.error(err.message);
    res.status(500).send('Server error');
    
  }
});

module.exports = router;