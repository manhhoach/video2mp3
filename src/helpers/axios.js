const axios = require('axios');

module.exports.downloadBufferVideo = (url)=>{
    return new Promise((resolve, reject)=>{
        axios({
            method: 'get',
            url: url,
            responseType: 'arraybuffer'
        })
        .then((response)=>{
           let videoBuffer = Buffer.from(response.data, 'binary')
           resolve(videoBuffer)
        })
        .catch((err)=>{reject(err)})
    })
}