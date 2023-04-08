const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
require('dotenv').config({})


const upload = require('./aws/aws.s3')
const uploadMulter = require('./middlewares/upload')
const { convertVideoToMp3 } = require('./helpers/convert')
const { getFileName } = require('./helpers/getFileName')


app.use(express.urlencoded({ extended: true }))
app.use(express.json())



app.get('/', function (req, res) {
    res.send('Welcome')
})



app.post('/upload', uploadMulter.single('file'), async function (req, res) {

    try {
        const t0 = performance.now();
        let audioBuffer = await convertVideoToMp3(req.file.buffer)
        let fileName = getFileName(req.file.originalname)
        let data = await upload(audioBuffer, `${fileName}.mp3`);
        const t1 = performance.now();
        res.json({ time: `${t1 - t0}ms`, data })
    } catch (err) {
        res.json({ message: err.message })
    }
})






app.listen(PORT, function () {
    console.log(`App listening on http://localhost:${PORT}`);
})