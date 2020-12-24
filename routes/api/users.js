const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');


router.post('/', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please use a valid email').isEmail(),
  check('password', 'Please enter a password with 12 Alphanumric character, 1 Upper-case and Symbol')
    .matches(
      /^(?=.*[A-Z])(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])(?=.*[a-zA-Z]).{12,}$/
    ),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array()});
  }
  res.send('User route');
});

module.exports = router;
