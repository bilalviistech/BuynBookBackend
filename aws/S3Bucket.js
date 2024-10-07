const {S3Client, PutObjectCommand} = require("@aws-sdk/client-s3")
require('dotenv').config(); // Ensure environment variables are loaded

const s3Client = new S3Client({
    region: 'ap-south-1',
    credentials : {
        accessKeyId : process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY
    }
})


async function uploadImageToS3(fileBuffer, fileName, contentType) {
    try {
        // Define the parameters for the upload
        const uploadParams = {
            Bucket: process.env.BUCKET_NAME,  // Replace with your bucket name
            Key: fileName,                   // Path to the file in the bucket
            Body: fileBuffer,               // The file buffer to upload
            ContentType: contentType,      // Content type of the file
    
        };

        // Create the upload command
        const command = new PutObjectCommand(uploadParams);

        // Upload the image
        const data = await s3Client.send(command);
        // console.log('Image uploaded successfully:', data.Location);
        return data;  // You can return the data for further use

    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;  // Re-throw the error to be handled by the calling function
    }
}

module.exports = uploadImageToS3