const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const { query } = require('../../utils/db');
const { jwtSecret } = require('../../utils/config');
const auth = require('../../middleware/auth');

// @route   POST api/users
// @desc    Register a user
// @access  Public

router.post('/',
[
    check('name', 'Please add name').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], 
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;

    try {
        console.log('email', email)
        let user = await query(`SELECT * FROM Users WHERE email = '${email}'`);
        if (user.length > 0) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await query(`INSERT INTO Users (name, email, password) VALUES ('${name}', '${email}', '${hashedPassword}')`);
        console.log(user.insertId);
        const payload = {
            user: {
                id: user.insertId
            }
        }
        console.log(jwtSecret);
        jwt.sign(payload, jwtSecret, {
            expiresIn: 360000
        }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  POST api/users/login
// @desc   Get logged in user
// @access Public

router.post('/login',[
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let user = await query(`SELECT * FROM Users WHERE email = '${email}'`);
        if (user.length === 0) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }

        const isMatch = await bcrypt.compare(password, user[0].password);

        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }

        const payload = {
            user: {
                id: user[0].id
            }
        }

        jwt.sign(payload, jwtSecret, {
            expiresIn: 360000
        }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  GET api/user
// @desc   Get logged in user
// @access Private

router.get('/', auth, async (req, res) => {
    try {
        const user = await query(`SELECT * FROM Users WHERE id = ${req.user.id}`);
        res.json(user[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;