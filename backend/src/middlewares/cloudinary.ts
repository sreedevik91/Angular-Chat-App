import {v2 as cloudinary, UploadApiOptions} from 'cloudinary'
import { config } from 'dotenv'

config()

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

// export default cloudinary

export const getImgUrl = async (img: string, options?: UploadApiOptions) => {
    try {
        const uploadResult = await cloudinary.uploader.upload(img, options)
        console.log('cloudinary img upload result: ', uploadResult);
        // return { success: true, data: { imgUrl: uploadResult?.url, type: uploadResult.resource_type } }
        return { success: true, data: { imgUrl: uploadResult?.secure_url, type: uploadResult.resource_type } }
    } catch (error) {
        console.log('cloudinary error: ', error);
        
        return { success: false, message: 'Image not saved.' }
    }
}

export const getAudioUrl = async (audio: string, options?: UploadApiOptions) => {
    try {
        const uploadResult = await cloudinary.uploader.upload(audio, options)
        console.log('cloudinary audio upload result: ', uploadResult);
        // return { success: true, data: { imgUrl: uploadResult?.url, type: 'audio' } }
        return { success: true, data: { imgUrl: uploadResult?.secure_url, type: 'audio' } }

    } catch (error) {
        return { success: false, message: 'Image not saved.' }
    }
}

export const getImgVideoUrl = async (media: string, options?: UploadApiOptions) => {
    try {
        const uploadResult = await cloudinary.uploader.upload(media, options)
        console.log('cloudinary audio upload result: ', uploadResult);
        // return { success: true, data: { imgUrl: uploadResult?.url, type: uploadResult.resource_type } }
        return { success: true, data: { imgUrl: uploadResult?.secure_url, type: uploadResult.resource_type } }

    } catch (error) {
        return { success: false, message: 'Media file not saved.' }
    }
}

export const getFileType = async (mimetype: string) => {
    if (mimetype.startsWith('image/')) return 'image'
    if (mimetype.startsWith('video/')) return 'video'
    return 'raw'
}