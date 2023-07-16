const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');



module.exports.convertToMp3 = (stream, bitRate, volume = 1) => {
    const passThroughStream = new PassThrough();
    ffmpeg(stream)
        .format('mp3')
        .audioBitrate(bitRate)
        .audioFilter(`volume=${volume}`)
        .audioChannels(2)
        .output(passThroughStream)
        // .on('error', (err)=>{
        //     return err;
        // })
        .run()
    return passThroughStream;

}
