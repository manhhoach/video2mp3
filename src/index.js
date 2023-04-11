const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
require('dotenv').config({})
const path = require('path')


const uploadMulter = require('./middlewares/upload')
const { convertVideoToMp3 } = require('./helpers/convert')
const { getFileName } = require('./helpers/getFileName')
const { removeVietnameseTones } = require('./helpers/removeVietnameseTones')

const JSZip = require('jszip')
const { pipeline } = require('stream')
const { promisify } = require('util')
const pipelineWithPromisify = promisify(pipeline)

app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())



app.get('/', function (req, res) {
    res.render('index')
})



app.post('/convert-single', uploadMulter.single('file'), async function (req, res) {
    console.log(req.body);
    try {
        let audioBuffer = await convertVideoToMp3(req.file.buffer, req.body.bitrate)
        let fileName = getFileName(req.file.originalname)
        fileName = removeVietnameseTones(fileName)
        res.set('Content-Type', 'audio/mp3');
        res.set('Content-Disposition', `attachment; filename="${fileName}.mp3"`);
        res.send(audioBuffer);

    } catch (err) {
        res.json({ message: err.message })
    }
})



app.post('/convert-multiple', uploadMulter.array('files'), async function (req, res) {
    try {
        let zip = new JSZip();
        await Promise.all(
            req.files.map(async (file) => {
                let audioBuffer = await convertVideoToMp3(file.buffer, req.body.bitrate)
                let fileName = getFileName(file.originalname)
                fileName = removeVietnameseTones(fileName)
                zip.file(`${fileName}.mp3`, audioBuffer);
            })
        )

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename=converted.zip`
        });
        await pipelineWithPromisify(zip.generateNodeStream({ type: 'nodebuffer' }), res)

        // pipeline(zip.generateNodeStream({ type: 'nodebuffer' }), res, (err)=>{
        //     if(err)
        //         res.json({ message: err.message })
        // });


    } catch (err) {
        res.json({ message: err.message })
    }
})



app.post('/convert-from-url', async function (req, res) {

    const fs = require('fs');
    const ytdl = require('ytdl-core');

    const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const outputFilePath = 'video.mp4';

    const downloadVideo = async (videoUrl, outputFilePath) => {
        const videoReadableStream = ytdl(videoUrl, { filter: 'videoandaudio' });
        const videoWritableStream = fs.createWriteStream(outputFilePath);

        videoReadableStream.pipe(videoWritableStream);

        return new Promise((resolve, reject) => {
            videoWritableStream.on('finish', () => {
                resolve();
            });

            videoWritableStream.on('error', (err) => {
                reject(err);
            });
        });
    };

    downloadVideo(videoUrl, outputFilePath)
        .then(() => {
            console.log('Video downloaded successfully!');
        })
        .catch((err) => {
            console.error('Error downloading video:', err);
        });
})




app.listen(PORT, function () {
    console.log(`App listening on http://localhost:${PORT}`);
})
//  const t0 = performance.now();
//  const t1 = performance.now();