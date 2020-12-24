const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');


router.post('/', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please use a valid email').isEmail(),
  check('password', 'Please enter a password with 12 Alphanumric character, 1 Upper-case and Symbol')
    .matches(
      /^(?=.*[A-Z])(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])(?=.*[a-zA-Z]).{12,}$/
    ),
],
async (req, res) => {

  // check for validation error
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array()});
  }
  
  // destructure request body
  const {name, email, password} = req.body;
  
  try {

    // check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: [{msg: 'User already exists'}] });
    }

    user = new User({
      name,
      email,
      password
    });

    // encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // save user data
    await user.save();

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
