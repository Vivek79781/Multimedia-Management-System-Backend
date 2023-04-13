if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');

const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json({ extended: false }));
app.use(fileUpload({
    useTempFiles: true
}));

app.use('/api/users', require('./routes/api/users'));
app.use('/api/multimedia', require('./routes/api/multimedia'));

if(process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

app.listen(port, () => console.log(`Server started on port ${port}`));
