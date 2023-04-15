const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { query } = require('../../utils/db');
const auth = require('../../middleware/auth');
const { fileUpload, cloudinary } = require('../../cloudinary')

// @route  POST api/multimedia/add
// @desc   Add multimedia
// @access Private

router.post('/add', auth, [
    check('title', 'Please add title').not().isEmpty(),
    check('description', 'Please add description').not().isEmpty(),
    check('type', 'Please add type').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    console.log("testing",req.body);
    const { title, description, type, public } = req.body;
    try {
        if (!req.files) {
            return res.status(400).json({ errors: [{ msg: 'Please upload a file' }] });
        }
        const file = req.files.file;
        console.log(file);
        if(file.size > 15*1024*1024){
            return res.status(400).json({ errors: [{ msg: 'Size Should be less than 15MB' }] });
        }
        const { link, public_id } = await fileUpload(file);
        console.log(link, public_id);
        const newPublic = (public === 'true')?1:0;
        // console.log('newPublic', newPublic)
        const response = await query(`INSERT INTO Multimedia (title, description, type, link, user_id, public_id, public) VALUES ('${title}', '${description}', '${type}', '${link}', '${req.user.id}', '${public_id}', '${newPublic}')`);
        const multimedia = {
            id: response.insertId,
            title,
            description,
            type,
            link,
            user_id: req.user.id,
            public_id,
            public: newPublic
        }
        return res.json(multimedia);
        // res.json({msg: "testing"});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  GET api/multimedia
// @desc   Get all multimedia
// @access Public

router.get('/', async (req, res) => {
    // console.log(req.query);
    try {
        if(req.query && req.query.id){
            const multimedia = await query(`SELECT * FROM Multimedia WHERE id = '${req.query.id} and public = 1'`);
            return res.json(multimedia);
        }
        const multimedia = await query(`SELECT * FROM Multimedia, Users WHERE Multimedia.user_id = Users.id and public = 1`);
        // Remove Password from response
        multimedia.forEach(m => {
            delete m.password;
        });
        return res.json(multimedia);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  GET api/multimedia/user
// @desc   Get all multimedia by user
// @access Public

router.get('/user/:id', async (req, res) => {
    try {
        const multimedia = await query(`SELECT * FROM Multimedia, Users WHERE Multimedia.user_id = Users.id and Multimedia.user_id = '${req.params.id}' and public = 1`);
        // Remove Password from response
        multimedia.forEach(m => {
            delete m.password;
        });
        return res.json(multimedia);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  DELETE api/multimedia/:id
// @desc   Delete multimedia
// @access Private

router.delete('/:id', auth, async (req, res) => {
    try {
        let multimedia = await query(`SELECT * FROM Multimedia WHERE id = '${req.params.id}'`);
        if (multimedia.length === 0) {
            return res.status(404).json({ msg: 'Multimedia not found' });
        }
        multimedia = multimedia[0];
        if (multimedia.user_id !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        await query(`DELETE FROM Multimedia WHERE id = '${req.params.id}'`);
        console.log(multimedia.public_id);
        if(multimedia.type === 'document')
            console.log(await cloudinary.uploader.destroy(multimedia.public_id,{ 
                resource_type: 'raw',
                invalidate: true,
            }));
        else if(multimedia.type === 'audio')
            console.log(await cloudinary.uploader.destroy(multimedia.public_id,{
                resource_type: 'video',
                invalidate: true,
            }));
        else 
            console.log(await cloudinary.uploader.destroy(multimedia.public_id,{
                resource_type: multimedia.type,
                invalidate: true,
            }));
        res.json({ msg: 'Multimedia removed' });
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route GET api/multimedia/me
// @desc Get current users multimedia
// @access Private

router.get('/me', auth, async (req, res) => {
    try {
        const multimedia = await query(`SELECT * FROM Multimedia WHERE user_id = '${req.user.id}'`);
        res.json(multimedia);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  PUT api/multimedia/:id
// @desc   Update multimedia
// @access Private

router.put('/:id', auth, [
    check('title', 'Please add title').not().isEmpty(),
    check('description', 'Please add description').not().isEmpty(),
    check('type', 'Please add type').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, description, type, public } = req.body;
    try {
        let multimedia = await query(`SELECT * FROM Multimedia WHERE id = '${req.params.id}'`);
        if (multimedia.length === 0) {
            return res.status(404).json({ msg: 'Multimedia not found' });
        }
        multimedia = multimedia[0];
        if (multimedia.user_id !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        const newPublic = (public === 'true')?1:0;
        const response = await query(`UPDATE Multimedia SET title = '${title}', description = '${description}', type = '${type}', public = '${newPublic}' WHERE id = '${req.params.id}'`);
        const updatedMultimedia = {
            id: req.params.id,
            title,
            description,
            type,
            link: multimedia.link,
            user_id: req.user.id,
            public_id: multimedia.public_id,
            public: newPublic
        }
        return res.json(updatedMultimedia);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;