const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
require('dotenv').config({})
const path = require('path')

const upload = require('./aws/aws.s3')
const uploadMulter = require('./middlewares/upload')
const { convertVideoToMp3 } = require('./helpers/convert')
const { getFileName } = require('./helpers/getFileName')
const { removeVietnameseTones } = require('./helpers/removeVietnameseTones')


app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));
app.use(express.urlencoded({ extended: true }))
app.use(express.json())



app.get('/', function (req, res) {
    res.render('index')
})



app.post('/convert', uploadMulter.array('files'), async function (req, res) {

    try {
        //  const t0 = performance.now();
        //  const t1 = performance.now();
        let data = await Promise.all(
            req.files.map(async (file) => {
                let audioBuffer = await convertVideoToMp3(file.buffer)
                let fileName = getFileName(file.originalname)
                fileName = removeVietnameseTones(fileName)
                let url = await upload(audioBuffer, `${fileName}.mp3`);
                return {
                    url: url,
                    name: fileName
                }
            })
        )
        res.render('index2', { files: data })
    } catch (err) {
        res.json({ message: err.message })
    }
})






app.listen(PORT, function () {
    console.log(`App listening on http://localhost:${PORT}`);
})