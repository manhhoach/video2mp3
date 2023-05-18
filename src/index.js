const express = require('express')
const app = express()

const PORT = process.env.PORT || 3000




const uploadMulter = require('./middlewares/upload')

const { convertToMp3 } = require('./helpers/ffmpeg')
const { handleFileName, addServiceName } = require('./helpers/handleFileName')
const { bufferToStream } = require('./helpers/bufferToStream')
const { streamToBuffer } = require('./helpers/streamToBuffer')

const promMid = require('express-prometheus-middleware');
const path = require('path')
const ytdl = require('ytdl-core');
const JSZip = require('jszip')
const { pipeline } = require('stream')
const { promisify } = require('util')
const contentDisposition = require('content-disposition');
const pipelineWithPromisify = promisify(pipeline)


app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(promMid());



app.get('/', function (req, res) {
    res.render('index')
})



app.post('/to-mp3-single', uploadMulter.single('file'), async function (req, res) {
    try {
        let audioInputStream = bufferToStream(req.file.buffer)
        let audioOutputStream = await convertToMp3(audioInputStream, req.body.bitrate, req.body.volume)

        let fileName = handleFileName(req.file.originalname)

        res.set('Content-Type', 'audio/mp3');
        res.setHeader('Content-disposition', `${contentDisposition(fileName)}.mp3`);

        audioOutputStream.pipe(res);

    } catch (err) {
        res.json({ message: err.message })
    }
})



app.post('/to-mp3-multiple', uploadMulter.array('files'), async function (req, res) {
    try {
        let zip = new JSZip();
        await Promise.all(
            req.files.map(async (file) => {
                let audioInputStream = bufferToStream(file.buffer)
                let audioOutputStream = await convertToMp3(audioInputStream, req.body.bitrate, req.body.volume)
                let fileName = handleFileName(file.originalname)
                let audioBuffer = streamToBuffer(audioOutputStream)
                zip.file(`${fileName}.mp3`, audioBuffer);
            })
        )
        let filesName = addServiceName('convertedFiles')
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename=${filesName}.zip`
        });
        await pipelineWithPromisify(zip.generateNodeStream({ type: 'nodebuffer' }), res)


    } catch (err) {
        res.json({ message: err.message })
    }
})



app.post('/download-mp3-from-youtube', async function (req, res) {
    try {
        let [audioYtbStream, videoInfo] = await Promise.all([
            ytdl(req.body.url, { filter: 'audioonly', quality: 'highestaudio', format: 'mp3' }),
            ytdl.getBasicInfo(req.body.url)
        ])

        let audioOutputStream = await convertToMp3(audioYtbStream, req.body.bitrate, req.body.volume)

        let fileName = addServiceName(videoInfo.videoDetails.title)
        res.setHeader('Content-disposition', `${contentDisposition(fileName)}.mp3`);
        res.setHeader('Content-type', 'audio/mp3');
        audioOutputStream.pipe(res);

    } catch (err) {
        res.json({ message: err.message })
    }
})








app.listen(PORT, function () {
    console.log(`App listening on http://localhost:${PORT}`);
})
//  const t0 = performance.now();
//  const t1 = performance.now();