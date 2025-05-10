import { Request, Response, NextFunction } from "express";
import { HttpStatusCodes, ICookie, IResponse, IUserController, IUserService, USER_CONTROLLER_RESPONSES } from "../interfaces/interfaces";
import { ResponseHandler } from "../middlewares/responseHandler";
import { AppError } from "../middlewares/appError";
import { getImgUrl } from "../middlewares/cloudinary";

export class UserController implements IUserController {

    constructor(private userService: IUserService) { }

    async registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {

        try {
            const newUserData = req.body
            console.log('user to register: ', newUserData);
            const isUser = await this.userService.registerUser(newUserData)
            console.log('response from register user: ', isUser);

            isUser?.success ? ResponseHandler.successResponse(res, HttpStatusCodes.CREATED, isUser) : next(new AppError(isUser))

        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from registerUser controller: ', error.message) : console.log('Unknown error from registerUser controller: ', error)
            next(new AppError({ success: false, message: USER_CONTROLLER_RESPONSES.commonError }))
        }

    }

    async loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const login = await this.userService.loginUser(req, req.body)
            if (login) {

                if (login.success && login.cookieData) {
                    const cookie: ICookie = login.cookieData
                    const { payload, refreshToken, accessToken, options } = cookie

                    ResponseHandler.successResponse(res, HttpStatusCodes.OK, { success: true, emailVerified: true, message: USER_CONTROLLER_RESPONSES.loginSuccess, data: payload }, cookie)
                    console.log('sending login response from  controller to frontend: login success emailVerified success fail');

                } else {
                    let status = HttpStatusCodes.BAD_REQUEST
                    let resData: IResponse = { success: false }
                    if (login.wrongCredentials) {
                        resData = { success: false, wrongCredentials: true, message: login.message ? login.message : USER_CONTROLLER_RESPONSES.invalidCredentials }

                    } else if (login.noUser) {
                        status = HttpStatusCodes.NOT_FOUND
                        resData = { success: false, message: login.message ? login.message : USER_CONTROLLER_RESPONSES.userNotFound }

                    }

                    next(new AppError(resData, status))

                }

            }

        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from userLogin controller: ', error.message) : console.log('Unknown error from userLogin controller: ', error)
            next(new AppError({ success: false, message: USER_CONTROLLER_RESPONSES.commonError }))
        }
    }

    async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params
            // console.log('id to get user', id);

            const userResponse = await this.userService.getUser(id)
            // console.log('get user response:', userResponse);

            userResponse?.success ? ResponseHandler.successResponse(res, HttpStatusCodes.OK, userResponse) : next(new AppError(userResponse))

        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from getUser controller: ', error.message) : console.log('Unknown error from getUser controller: ', error)
            next(new AppError({ success: false, message: USER_CONTROLLER_RESPONSES.commonError }))
        }
    }

    async getUsers (req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // const { name } = req.params
            // console.log('user name to get user', req.query);
           
            const usersResponse = await this.userService.getUsers(req.query)
            // console.log('get users response:', usersResponse);

            usersResponse?.success ? ResponseHandler.successResponse(res, HttpStatusCodes.OK, usersResponse) : next(new AppError(usersResponse))

        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from getUsers controller: ', error.message) : console.log('Unknown error from getUsers controller: ', error)
            next(new AppError({ success: false, message: USER_CONTROLLER_RESPONSES.commonError }))
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params
            const { updatedData } = req.body
            console.log('user details to update: ', id, updatedData);
            console.log('new service images to register: ', req.file);
            const file: Express.Multer.File | undefined = req.file
            let imgName = file ? file.filename : ''
            // let imgPath = file ? file.originalname : ''
            let imgPath = file ? file.path : ''
            // let cloudinaryImgData = await getImgUrl(imgPath, { public_id: imgName, type: "authenticated", sign_url: true })
            let cloudinaryImgData = await getImgUrl(req.file?.buffer)
            console.log('cloudinaryImgData:', cloudinaryImgData);
            
            let img = cloudinaryImgData.data?.imgUrl
            let data = { ...updatedData, img }
            console.log('user data to be updated: ',data);
            
            const newUserResponse = await this.userService.updateUser(id, data)

            newUserResponse?.success ? ResponseHandler.successResponse(res, HttpStatusCodes.OK, newUserResponse) : next(new AppError(newUserResponse))

        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from editUser controller: ', error.message) : console.log('Unknown error from editUser controller: ', error)
            next(new AppError({ success: false, message: USER_CONTROLLER_RESPONSES.commonError }))
        }
    }

    async userLogout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const token = req.cookies?.accessToken
            const userLogoutResponse = await this.userService.userLogout(token)
            console.log('user logout response from controller: ', userLogoutResponse);

            userLogoutResponse?.success ? ResponseHandler.successResponse(res, HttpStatusCodes.OK, userLogoutResponse) : next(new AppError(userLogoutResponse))

        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from userLogout controller: ', error.message) : console.log('Unknown error from userLogout controller: ', error)
            next(new AppError({ success: false, message: USER_CONTROLLER_RESPONSES.commonError }))
        }
    }

}