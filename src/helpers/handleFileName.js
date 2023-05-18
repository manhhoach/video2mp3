const SERVICE_NAME = "video2mp3.herokuapp.com";

const addServiceName = (fileName) => `${SERVICE_NAME}-${fileName}`

const handleFileName = (originName) => {
    let fileName = originName.slice(0, originName.lastIndexOf('.'));
    return `${addServiceName(fileName)}`
}

module.exports = {
    addServiceName, handleFileName
}