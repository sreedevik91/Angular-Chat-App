import { NextFunction, Request, Response } from "express"
import { AppError } from "../middlewares/appError";
// import chatServices from "../services/chatServices";
import { USER_CONTROLLER_RESPONSES, HttpStatusCodes, IChatController, IChatService } from "../interfaces/interfaces";
import { getFileType } from "../middlewares/cloudinary";
import { ResponseHandler } from "../middlewares/responseHandler";


export class ChatController implements IChatController {

    constructor(private chatServices: IChatService) {
        // inorder to make 'this' bound correctly to the class component and not result in undefined bind it with the methods manually
        // this.uploadToCloudinary = this.uploadToCloudinary.bind(this);
        // this.uploadAudioToCloudinary = this.uploadAudioToCloudinary.bind(this);
    }

    async getChatsByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params
            console.log('userId to get chats: ', userId);

            let chats = await this.chatServices.getChatsByUserId(userId)

            chats?.success ? ResponseHandler.successResponse(res, HttpStatusCodes.OK, chats) : ResponseHandler.errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR,chats)

        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from getChatsByUserId controller: ', error.message) : console.log('Unknown error from getChatsByUserId controller: ', error)
            next(new AppError({ success: false, message: USER_CONTROLLER_RESPONSES.commonError }))

        }

    }

    async getChatsByRoomId(req: Request, res: Response, next: NextFunction) {
        try {
            const { roomId } = req.params
            console.log('roomId to get chats: ', roomId);

            let chats = await this.chatServices.getChatsByRoomId(roomId)

            chats?.success ? ResponseHandler.successResponse(res, HttpStatusCodes.OK, chats) : ResponseHandler.errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR,chats)

        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from getChatsByRoomId controller: ', error.message) : console.log('Unknown error from getChatsByUserId controller: ', error)
            next(new AppError({ success: false, message: USER_CONTROLLER_RESPONSES.commonError }))

        }

    }

    async uploadToCloudinary(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('chat data from angular: ', req.body);

            console.log('chat image to register: ', req.file);
            const img = req.file?.path
            const name = req.file?.originalname
            const type = await getFileType(req.file?.mimetype!)

            let imgUrlData = await this.chatServices.uploadToCloudinary(img!, name!, type!)
            console.log('cloudinary imgUrl controller response: ', imgUrlData);

            imgUrlData?.success ? ResponseHandler.successResponse(res, HttpStatusCodes.OK, imgUrlData) : next(new AppError(imgUrlData))

        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from uploadToCloudinary controller: ', error.message) : console.log('Unknown error from uploadToCloudinary controller: ', error)
            next(new AppError({ success: false, message: USER_CONTROLLER_RESPONSES.commonError }))

        }
    }

    async uploadAudioToCloudinary(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('audio data from angular: ', req.file);
            const audio = req.file?.path
            const name = req.file?.originalname
            let audioUrlData = await this.chatServices.uploadAudioToCloudinary(audio!, name!)
            console.log('cloudinary audioUrl controller response: ', audioUrlData);

            audioUrlData?.success ? ResponseHandler.successResponse(res, HttpStatusCodes.OK, audioUrlData) : next(new AppError(audioUrlData))

        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from uploadAudioToCloudinary controller: ', error.message) : console.log('Unknown error from uploadAudioToCloudinary controller: ', error)
            next(new AppError({ success: false, message: USER_CONTROLLER_RESPONSES.commonError }))

        }
    }

}
