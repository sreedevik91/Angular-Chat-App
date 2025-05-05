
import { USER_CONTROLLER_RESPONSES, IResponse } from "../interfaces/interfaces"

export class AppError extends Error {

    responseData: IResponse
    isOperational: boolean
    statusCode?:number

    constructor(responseData: IResponse,statusCode?:number) {

        super(responseData.message || USER_CONTROLLER_RESPONSES.commonError)

        this.responseData = responseData
        this.isOperational = true
        this,statusCode=statusCode

        Error.captureStackTrace(this, this.constructor)
    }
}

