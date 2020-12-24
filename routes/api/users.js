const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');


router.post('/', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please use a valid email').isEmail(),
  check('password', 'Please enter a password with 12 Alphanumric character, 1 Upper-case and Symbol')
    .matches(
      /^(?=.*[A-Z])(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])(?=.*[a-zA-Z]).{12,}$/
    ),
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array()});
  }
  
  const {name, email, password} = req.body;
  
  try {

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: [{msg: 'User already exists'}] });
    }

    user = new User({
      name,
      email,
      password
    });

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.send('User registered');


  } catch(err) {

    console.error(err.message);
    res.status(500).send('Server error');
    
  }
});

module.exports = router;
