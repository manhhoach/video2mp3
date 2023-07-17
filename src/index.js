const express = require('express')
const app = express()

const PORT = process.env.PORT || 3000




const uploadMulter = require('./middlewares/upload')

const { convertToMp3 } = require('./helpers/ffmpeg')
const { handleFileName, addServiceName } = require('./helpers/handleFileName')
const { bufferToStream } = require('./helpers/bufferToStream')
const { streamToBuffer } = require('./helpers/streamToBuffer')

const path = require('path')
const ytdl = require('ytdl-core')
const JSZip = require('jszip')
const { pipeline } = require('stream')
const { promisify } = require('util')
const contentDisposition = require('content-disposition')
const pipelineWithPromisify = promisify(pipeline)
const { Worker } = require('worker_threads')

app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())



app.get('/', function (req, res) {
    res.render('index')
})



app.post('/to-mp3-single', uploadMulter.single('file'), async function (req, res) {
    try {
        let audioInputStream = bufferToStream(req.file.buffer)
        let audioOutputStream = convertToMp3(audioInputStream, req.body.bitrate, req.body.volume)

        let fileName = handleFileName(req.file.originalname)

        res.set('Content-Type', 'audio/mp3')
        res.setHeader('Content-disposition', `${contentDisposition(fileName)}.mp3`)

        audioOutputStream.pipe(res)
    } catch (err) {
        return res.send(err.message ? `Error: ${err.message}` : 'Oops! We ran into some problems.')
    }
})



app.post('/to-mp3-multiple', uploadMulter.array('files'), async function (req, res) {
    try {
        let zip = new JSZip()
        req.files.map((file) => {
            let audioInputStream = bufferToStream(file.buffer)
            let audioOutputStream = convertToMp3(audioInputStream, req.body.bitrate, req.body.volume)
            let fileName = handleFileName(file.originalname)
            let audioBuffer = streamToBuffer(audioOutputStream)
            zip.file(`${fileName}.mp3`, audioBuffer)
        })

        let filesName = addServiceName('convertedFiles')
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename=${filesName}.zip`
        });
        await pipelineWithPromisify(zip.generateNodeStream({ type: 'nodebuffer' }), res)


    } catch (err) {
        return res.send(err.message ? `Error: ${err.message}` : 'Oops! We ran into some problems.')
    }
})



app.post('/download-mp3-from-youtube', async function (req, res) {
    try {
        let { url, bitrate, volume } = req.body
        let videoInfo = await ytdl.getBasicInfo(url)
        let fileName = addServiceName(videoInfo.videoDetails.title)
        let audioYtbStream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio', format: 'mp3' })
        res.setHeader('Content-type', 'audio/mp3')
        res.setHeader('Content-disposition', `${contentDisposition(fileName)}.mp3`)
        convertToMp3(audioYtbStream, bitrate, volume).pipe(res)
    } catch (err) {
        console.log('err in try catch', err);
        return res.send(err.message ? `Error: ${err.message}` : 'Oops! We ran into some problems.')
    }

})








app.listen(PORT, function () {
    console.log(`App listening on http://localhost:${PORT}`);
})
//  const t0 = performance.now();
//  const t1 = performance.now();