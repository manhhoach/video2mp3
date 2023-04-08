module.exports.getFileName = (fileName) => {
    return fileName.slice(0, fileName.lastIndexOf('.'));
}
