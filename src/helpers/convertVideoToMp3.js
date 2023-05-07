const ffmpeg = require('fluent-ffmpeg')
const { Writable, Readable  } = require('stream');


module.exports.convertVideoToMp3 = (videoBuffer, bitRate) => {
    return new Promise((resolve, reject) => {
        const streamReadable = new Readable()
        const streamWritable = new Writable()
        const audioBuffer = []

        streamReadable.push(videoBuffer)
        streamReadable.push(null)

        ffmpeg()
        .input(streamReadable)
        .format('mp3')
        .audioBitrate(bitRate)
        .audioChannels(2)
        .on('end', () =>{
            const buffer = Buffer.concat(audioBuffer); // do chia nhỏ dữ liệu nên cần nối lại mỗi khi xong
            resolve(buffer);
        })
        .on('error',(err)=>{
            reject(err);
        })
        .pipe(streamWritable)

        streamWritable._write = (chunk, encoding, done) => {
            audioBuffer.push(chunk);
            done();
        };
    });
} 

