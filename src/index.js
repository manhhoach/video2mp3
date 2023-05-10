const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
require('dotenv').config({})
const path = require('path')
const SERVICE_NAME = "VIDEO2MP3"
const fs = require('fs')
const contentDisposition = require('content-disposition');
const morgan = require('morgan')


const uploadMulter = require('./middlewares/upload')
const { convertVideoToMp3, convertBitRate, convertResolution } = require('./helpers/ffmpeg')
const { getFileName } = require('./helpers/getFileName')
const { removeVietnameseTones } = require('./helpers/removeVietnameseTones')

const ytdl = require('ytdl-core');
const JSZip = require('jszip')
const { pipeline } = require('stream')
const { promisify } = require('util')
const pipelineWithPromisify = promisify(pipeline)


app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(morgan('combined', { stream: fs.createWriteStream('./access.log', { flags: 'a' }) }));



app.get('/', function (req, res) {
    res.render('index')
})


const addServiceName = (fileName) => `${fileName}-${SERVICE_NAME}`


app.post('/convert-video-to-mp3-single', uploadMulter.single('file'), async function (req, res) {
    try {
        //if (req.file) {
            let audioBuffer = await convertVideoToMp3(req.file.buffer, req.body.bitrate)
            let fileName = getFileName(req.file.originalname)
            fileName = removeVietnameseTones(fileName)
            fileName = addServiceName(fileName)
            res.set('Content-Type', 'audio/mp3');
            res.setHeader('Content-disposition', `${contentDisposition(fileName)}.mp3`);
            res.send(audioBuffer);
        //}


    } catch (err) {
        res.json({ message: err.message })
    }
})



app.post('/convert-video-to-mp3-multiple', uploadMulter.array('files'), async function (req, res) {
    try {
        //if (req.file) {
            let zip = new JSZip();
            await Promise.all(
                req.files.map(async (file) => {
                    let audioBuffer = await convertVideoToMp3(file.buffer, req.body.bitrate)
                    let fileName = getFileName(file.originalname)
                    fileName = removeVietnameseTones(fileName)
                    zip.file(`${fileName}.mp3`, audioBuffer);
                })
            )
            let fileName = addServiceName('convertedFiles')
            res.set({
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename=${fileName}.zip`
            });
            await pipelineWithPromisify(zip.generateNodeStream({ type: 'nodebuffer' }), res)

            // pipeline(zip.generateNodeStream({ type: 'nodebuffer' }), res, (err)=>{
            //     if(err)
            //         res.json({ message: err.message })
            // });
        //}

    } catch (err) {
        res.json({ message: err.message })
    }
})




app.post('/download-mp3-from-youtube', async function (req, res) {
    try {
        let [audioStream, videoInfo] = await Promise.all([
            ytdl(req.body.url, { filter: 'audioonly', quality: 'highestaudio', format: 'mp3' }),
            ytdl.getBasicInfo(req.body.url)
        ])
        if (req.body.bitrate == '320')
            audioStream = convertBitRate(audioStream, req.body.bitrate)

        let fileName = `${removeVietnameseTones(videoInfo.videoDetails.title)}`
        fileName = addServiceName(fileName)
        res.setHeader('Content-disposition', `${contentDisposition(fileName)}.mp3`);
        res.setHeader('Content-type', 'audio/mp3');
        audioStream.pipe(res);

    } catch (err) {
        res.json({ message: err.message })
    }
})



app.post('/download-video-from-youtube', async function (req, res) {
    try {
        let [videoStream, videoInfo] = await Promise.all([
            ytdl(req.body.url, { filter: 'videoandaudio', quality: "highest", format: 'mp4' }),
            ytdl.getBasicInfo(req.body.url)
        ])

        let fileName = `${removeVietnameseTones(videoInfo.videoDetails.title)}`
        fileName = addServiceName(fileName)
        res.setHeader('Content-disposition', `${contentDisposition(fileName)}.mp4`);
        res.setHeader('Content-type', 'video/mp4');
        videoStream.pipe(res);

    } catch (err) {
        res.json({ message: err.message })
    }
})




app.listen(PORT, function () {
    console.log(`App listening on http://localhost:${PORT}`);
})
//  const t0 = performance.now();
//  const t1 = performance.now();