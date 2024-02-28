const express = require('express');
const app = express();
require("./database/connection");
app.use(express.json());
bodyParser = require('body-parser'),
jsonwebtoken = require("jsonwebtoken");
const userRoutes = require('./router/userRoute');

app.use(express.json());
app.use('/api/users', userRoutes); 

app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});

module.exports = app;
