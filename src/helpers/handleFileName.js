const SERVICE_NAME = "VIDEO2MP3"

const addServiceName = (fileName) => `${SERVICE_NAME}-${fileName}`

const handleFileName = (originName) => {
    let fileName = originName.slice(0, originName.lastIndexOf('.'));
    return `${addServiceName(fileName)}`
}

module.exports = {
    addServiceName, handleFileName
}