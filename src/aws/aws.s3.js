const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { AWS_CONFIG } = require('./../config/asw.s3')
const s3 = new S3Client(AWS_CONFIG)
const moment = require('moment-timezone')

const upload = (fileContent, fileName) => {
    return new Promise((resolve, reject) => {

        const expiredTime = moment().tz('Asia/Ho_Chi_Minh').add(1, 'minute').utc(true).toDate()

        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: fileName,
            Body: fileContent,
            Expires: expiredTime
            
        };
        s3.send(new PutObjectCommand(params))
            .then((data) => {
                if (data.$metadata.httpStatusCode === 200)
                    resolve(`https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${fileName}`)
            })
            .catch(err => {
                reject(err)
            })
    })




}

module.exports = upload