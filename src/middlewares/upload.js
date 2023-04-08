const multer = require('multer');

const storage = multer.memoryStorage()

const uploadMulter = multer({ storage: storage })

module.exports = uploadMulter