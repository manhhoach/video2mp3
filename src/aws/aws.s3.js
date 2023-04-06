const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { AWS_CONFIG } = require('./../config/asw.s3')
const s3 = new S3Client(AWS_CONFIG)

module.exports = s3