
module.exports.streamToBuffer = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => {
            chunks.push(chunk);
        });
        stream.on('end', () => {
            const buffer = Buffer.concat(chunks);
            resolve(buffer);
        });
        stream.on('error', (err) => {
            reject(err);
        });
    });
}