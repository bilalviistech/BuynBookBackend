const uploadImageToS3 = require("./S3Bucket");


async function UploadingToAws(req){

    console.log(req.files)

    const fileNames = []
    const uploadPromises = req.files.map(file => {
        const fileName = `${Date.now()}_${file.originalname}`; // Generate a unique file name
        fileNames.push(fileName)
        return uploadImageToS3(file.buffer, fileName, file.mimetype);
    });


    await Promise.all(uploadPromises);

    return fileNames
}


module.exports = UploadingToAws
