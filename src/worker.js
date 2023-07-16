const { parentPort, workerData } = require('worker_threads')
const ytdl = require('ytdl-core')
const { streamToBuffer } = require('./helpers/streamToBuffer')

const downloadMp3 = async (url) => {
    try {
        let [audioYtbStream, videoInfo] = await Promise.all([
            ytdl(url, { filter: 'audioonly', quality: 'highestaudio', format: 'mp3' }),
            ytdl.getBasicInfo(url)
        ])
        parentPort.postMessage(
            {
                audioYtbBuffer: await streamToBuffer(audioYtbStream),
                fileName: videoInfo.videoDetails.title
            }
        )
    }
    catch (err) {
        parentPort.postMessage(new Error('URL is incorrect'))
    }
}

(async () => {
    await downloadMp3(workerData)
})()


