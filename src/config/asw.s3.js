
module.exports = {
    AWS_CONFIG: {
        region: process.env.REGION,
        credentials: {
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
        }
    }
}