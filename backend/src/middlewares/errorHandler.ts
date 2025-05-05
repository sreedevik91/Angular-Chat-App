import { NextFunction, Request, Response } from "express"
import { AppError } from "../middlewares/appError"
import { ResponseHandler } from "../middlewares/responseHandler";
import { USER_CONTROLLER_RESPONSES, HttpStatusCodes } from "../interfaces/interfaces";

export const errorHandler = (error: AppError, req: Request, res: Response, next: NextFunction) => {

    console.log('Errors: ', error, error.stack);

    const responseData = error.responseData
    const status=error.statusCode

    // if (error instanceof AppError) {

    //     ResponseHandler.errorResponse(res, status || HttpStatusCodes.BAD_REQUEST, responseData)
    // }

    // ResponseHandler.errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, { success: false, message: CONTROLLER_RESPONSES.commonError })

    if (!res.headersSent) {
        if (error instanceof AppError) {
            ResponseHandler.errorResponse(res, status || HttpStatusCodes.BAD_REQUEST, responseData);
        } else {
            ResponseHandler.errorResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, { success: false, message: USER_CONTROLLER_RESPONSES.commonError });
        }
    } else {
        console.error('Headers already sent, skipping error response');
    }

}