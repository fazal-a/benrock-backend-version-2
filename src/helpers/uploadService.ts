import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
import {Readable} from "stream";
import ffmpeg from "fluent-ffmpeg";
import {v4 as uuidv4} from 'uuid';
import * as fs from "fs";
import * as process from "node:process";


const backBlazeConfig = {
    endpoint: process.env.BACKBLAZE_ENDPOINT || 'endpoint',
    region: process.env.BACKBLAZE_REGION || 'region',
    credentials: {
        accessKeyId: process.env.BACKBLAZE_ACCESS_KEY_ID || 'keyId',
        secretAccessKey: process.env.BACKBLAZE_SECRET_ACCESS_KEY || 'key'
    }
}

const s3 = new S3Client(backBlazeConfig);

export const uploadImage = async (file: Express.Multer.File): Promise<string> => {
    const fileName = `${uuidv4()}-${file.originalname}`;
    const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.BACKBLAZE_BUCKET || 'bucket',
        Key: fileName,
        Body: file.buffer
    });
    await s3.send(putObjectCommand);
    return fileName;
};

export const uploadVideoWithThumbnail = async (file: Express.Multer.File): Promise<{
    video: string,
    thumbnail: string
}> => {
    const videoFileName = `${uuidv4()}-${file.originalname}`;
    const thumbnailFileName = `thumbnail-${uuidv4()}.png`;

    const videoStream = Readable.from([file.buffer]);

    const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.BACKBLAZE_BUCKET || 'bucket',
        Key: videoFileName,
        Body: videoStream
    })
    await s3.send(putObjectCommand);

    // Generate and upload thumbnail using ffmpeg
    ffmpeg(videoStream)
        .screenshots({
            count: 1,
            folder: '/tmp', // save the screenshot temporarily
            filename: thumbnailFileName,
        })
        .on('end', async () => {
            const thumbnailBuffer = fs.readFileSync(`/tmp/${thumbnailFileName}`);
            const putObjectCommand = new PutObjectCommand({
                Bucket: process.env.BACKBLAZE_BUCKET || 'bucket',
                Key: thumbnailFileName,
                Body: thumbnailBuffer
            })
            await s3.send(putObjectCommand);
            fs.unlinkSync(`/tmp/${thumbnailFileName}`); // remove the temporary file
        });

    return {video: videoFileName, thumbnail: thumbnailFileName};
};
