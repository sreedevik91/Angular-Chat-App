import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary'
import { config } from 'dotenv'
import { resolve } from 'path'
import streamifier from 'streamifier'

config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// export default cloudinary

// export const getImgUrl = async (img: string, options?: UploadApiOptions) => {
//     try {
//         const uploadResult = await cloudinary.uploader.upload(img, options)
//         console.log('cloudinary img upload result: ', uploadResult);
//         // return { success: true, data: { imgUrl: uploadResult?.url, type: uploadResult.resource_type } }
//         return { success: true, data: { imgUrl: uploadResult?.secure_url, type: uploadResult.resource_type } }
//     } catch (error) {
//         console.log('cloudinary error: ', error);

//         return { success: false, message: 'Image not saved.' }
//     }
// }

export const getImgUrl = async (imgBuffer: Buffer<ArrayBufferLike> | undefined, options?: UploadApiOptions) => {
    try {
        // let options= { type: "authenticated", sign_url: true }
        let options = {
            type: 'authenticated',
            sign_url: true,
            expires_at: Math.floor(Date.now() / 1000) + 60 * 5, // expires in 5 mins
            secure: true
        }
        // const uploadResult = await cloudinary.uploader.upload(img, options)

        const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'uploads', type: 'authenticated' }, // signed & private upload
                (error, result) => {
                    if (error) return reject(error)
                    resolve(result as UploadApiResponse)
                }
            )

            if (imgBuffer) streamifier.createReadStream(imgBuffer).pipe(stream)
        })

        console.log('cloudinary img upload result: ', uploadResult);

        const publicId = uploadResult.public_id
        const resourceType = uploadResult.resource_type

        const signedUrl = cloudinary.url(publicId, options)

        // return { success: true, data: { imgUrl: uploadResult?.url, type: uploadResult.resource_type } }
        return { success: true, data: { imgUrl: signedUrl || uploadResult?.secure_url, type: uploadResult.resource_type } }

    } catch (error) {
        console.log('cloudinary error: ', error);

        return { success: false, message: 'Image not saved.' }
    }
}

export const getAudioUrl = async (audio: Buffer<ArrayBufferLike>, type = 'video') => {
    try {
        let options: UploadApiOptions = {
            type: 'authenticated',
            sign_url: true,
            expires_at: Math.floor(Date.now() / 1000) + 60 * 5, // expires in 5 mins
            secure: true,
            resource_type: 'video'
        }
        const uploadResult:UploadApiResponse = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'uploads', resource_type: 'video', type: 'authenticated' }, // signed & private upload
                (error, result) => {
                    if (error) {
                        console.log('cloudinary audio upload error: ', error);
                        
                        return reject(error)

                    }
                    resolve(result as UploadApiResponse)
                }
            )

            streamifier.createReadStream(audio).pipe(stream)
        })

        const publicId= uploadResult.public_id

        const signedUrl= cloudinary.url(publicId,options)

        console.log('cloudinary audio upload result: ', uploadResult);
        console.log('cloudinary audio signed url: ', signedUrl);
        // return { success: true, data: { imgUrl: uploadResult?.url, type: 'audio' } }
        return { success: true, data: { imgUrl: signedUrl || uploadResult?.secure_url, type: 'audio' } }

    } catch (error) {
        return { success: false, message: 'Image not saved.' }
    }
}

export const getImgVideoUrl = async (media: Buffer<ArrayBufferLike>, type: "image" | "video" | "raw" | "auto" | undefined) => {
    try {

        let options: UploadApiOptions = {
            type: 'authenticated',
            sign_url: true,
            expires_at: Math.floor(Date.now() / 1000) + 60 * 5, // expires in 5 mins
            secure: true,
            resource_type:type
        }

        // const uploadResult = await cloudinary.uploader.upload(media, options)
        const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'uploads', resource_type: type, type: 'authenticated' }, // signed & private upload
                (error, result) => {
                    if (error) return reject(error)
                    resolve(result as UploadApiResponse)
                }
            )

            if (media) streamifier.createReadStream(media).pipe(stream)
        })


        console.log('cloudinary audio/video upload result: ', uploadResult);

        const publicId = uploadResult.public_id

        const signedUrl = cloudinary.url(publicId, options)
        console.log('cloudinary audio/video signed url: ', signedUrl);

        // return { success: true, data: { imgUrl: uploadResult?.url, type: uploadResult.resource_type } }
        return { success: true, data: { imgUrl: signedUrl || uploadResult?.secure_url, type: uploadResult.resource_type } }


        // return { success: true, data: { imgUrl: uploadResult?.url, type: uploadResult.resource_type } }
        // return { success: true, data: { imgUrl: uploadResult?.secure_url, type: uploadResult.resource_type } }

    } catch (error) {
        return { success: false, message: 'Media file not saved.' }
    }
}

export const getFileType = async (mimetype: string) => {
    if (mimetype.startsWith('image/')) return 'image'
    if (mimetype.startsWith('video/')) return 'video'
    return 'raw'
}