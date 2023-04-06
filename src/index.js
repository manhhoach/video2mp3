const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
require('dotenv').config({})



const s3 = require('./aws/aws.s3')



app.get('/', function (req, res) {
    res.send('Welcome')
})





app.post('/upload', function (req, res) {

    console.log(s3);
    res.send('Welcome')
})






app.listen(PORT, function () {
    console.log(`App listening on http://localhost:${PORT}`);
})