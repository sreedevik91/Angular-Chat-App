import { CookieOptions, Response } from "express";
import { HttpStatusCodes, ICookie, IResponse } from "../interfaces/interfaces";

export class ResponseHandler {

    static successResponse(res: Response, statusCode: number = HttpStatusCodes.OK, responseData: IResponse, cookieData?: ICookie) {
        console.log('success response to frontend: ', responseData);

        if (cookieData) {
            const { refreshToken, accessToken, options } = cookieData
            res.cookie('refreshToken', refreshToken, options)
            res.cookie('accessToken', accessToken, options)
        }

        res.status(statusCode).json(responseData)
    }

    static errorResponse(res: Response, statusCode: number = HttpStatusCodes.INTERNAL_SERVER_ERROR, responseData: IResponse) {
       console.log('error response to frontend: ', responseData);
       
        res.status(statusCode).json(responseData)
    }

    static async logoutResponse(res: Response, token: string, expTime: number, statusCode: number = HttpStatusCodes.OK, responseData: IResponse) {

        const options: CookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // secure will become true when the app is running in production
        }
        res.clearCookie('accessToken', options)
        res.clearCookie('refreshToken', options)
        res.status(statusCode).json(responseData)

    }

}