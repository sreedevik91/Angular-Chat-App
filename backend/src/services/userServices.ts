import { Request } from "express";
import { ICookieService, IPasswordService, IRequestParams, IResponse, ITokenService, IUser, IUserRepository, IUserService, LoginData, USER_SERVICE_RESPONSES } from "../interfaces/interfaces";
import { FilterQuery, UpdateQuery } from "mongoose";

export class UserServices implements IUserService {

    constructor(
        private userRepository: IUserRepository,
        private passwordService: IPasswordService,
        private tokenService: ITokenService,
        private cookieService: ICookieService
    ) { }

    async registerUser(userData: IUser): Promise<IResponse> {

        try {

            if (!userData.username) {
                return { success: false, message: USER_SERVICE_RESPONSES.noUsername }
            }

            const isUserByUserName: IUser | null = await this.userRepository.getUserByUsername(userData.username)
            console.log('isUserByUserName: ', isUserByUserName);

            if (isUserByUserName) {
                return { success: false, message: USER_SERVICE_RESPONSES.usernameNotAvailable }
            }

            const isUserByUserEmail: IUser | null = await this.userRepository.getUserByEmail(userData.email)
            console.log('isUserByUserEmail: ', isUserByUserEmail);

            if (isUserByUserEmail) {
                return { success: false, message: USER_SERVICE_RESPONSES.emailExists }
            }

            const user = await this.userRepository.create(userData)

            if (user) {
                return { success: true, message: USER_SERVICE_RESPONSES.userRegisterSuccess, data: user }
            } else {
                return { success: false, message: USER_SERVICE_RESPONSES.userRegisterError }
            }

        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from register service: ', error.message) : console.log('Unknown error from register service: ', error)
            return { success: false, message: USER_SERVICE_RESPONSES.commonError }
        }



    }
    async loginUser(req: Request, loginData: LoginData): Promise<IResponse> {
        try {
            const { username, password } = loginData

            console.log('user loginData, username, password: ', username, password);

            if (!username || !password) {
                return { success: false, message: USER_SERVICE_RESPONSES.missingCredentials }
            }

            const user = await this.userRepository.getUserByUsername(username)
            console.log('user for login from db: ', user);

            if (!user) {
                console.log('sending login response from service to controller: user not found');
                return { success: false, noUser: true, message: USER_SERVICE_RESPONSES.userNotFound }
            }


            if (user.password && await this.passwordService.verifyPassword(password, user.password)) {
                const accessToken = await this.tokenService.getAccessToken(user)
                const refreshToken = await this.tokenService.getRefreshToken(user)

                if (!accessToken && !refreshToken) {
                    console.log('No token generated');
                }

                let cookieData = await this.cookieService.getCookieOptions(req, user, accessToken!, refreshToken!)

                return { cookieData, success: true }

            } else {
                console.log('sending login response from service to controller: emailVerified success fail');

                return { success: false, wrongCredentials: true, message: USER_SERVICE_RESPONSES.invalidCredentials }

            }
        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from login service: ', error.message) : console.log('Unknown error from login service: ', error)
            return { success: false, message: USER_SERVICE_RESPONSES.commonError }

        }
    }
    async getUsers(params: IRequestParams): Promise<IResponse> {
        try {

            const {name} = params
            let filterQ: FilterQuery<IUser> = {}

            if (name !== '' || name !== undefined) {
                filterQ.name = { $regex: `.*${name}.*`, $options: 'i' }
            }

            console.log('filter query to get all users: ', filterQ);

            const users = await this.userRepository.getAll(filterQ, {})

            return users ? { success: true, data: users } : { success: false, message: USER_SERVICE_RESPONSES.noUserData }

        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from getUser service: ', error.message) : console.log('Unknown error from getUser service: ', error)
            return { success: false, message: USER_SERVICE_RESPONSES.commonError }
        }
    }
    // async getNewToken(req: Request, refreshToken: string): Promise<IResponse> {

    //     try {
    //         let decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as IJwtPayload

    //         const { id, user, role, googleId, email, isActive, isEmailVerified, isUserVerified } = decoded
    //         const userData = await this.userRepository.getUserById(id)

    //         if (!userData) {
    //             return { success: false, message: USER_SERVICE_RESPONSES.userNotFound }
    //         }

    //         const accessToken = await this.tokenService.getAccessToken(userData)
    //         if (!accessToken) {
    //             return { success: false, message: USER_SERVICE_RESPONSES.refreshTokenError }
    //         }
    //         const cookieOptions = await this.cookieService.getCookieOptions(req,userData, accessToken!, refreshToken)
    //         return { success: true, accessToken, refreshToken, options: cookieOptions.options, payload: cookieOptions.payload }

    //     } catch (error: unknown) {
    //         error instanceof Error ? console.log('Error message from getNewToken service: ', error.message) : console.log('Unknown error from getNewToken service: ', error)
    //         return { success: false, message: USER_SERVICE_RESPONSES.commonError }
    //     }

    // }

    async updateUser(userId: string, data: Partial<IUser>): Promise<IResponse> {
        try {
            console.log('user datas to update: ', userId, data);

            const updatedUser = await this.userRepository.update(userId, { $set: data })
            console.log('updatedUser: ', updatedUser);

            if (updatedUser) {
                return { success: true, data: updatedUser, message: USER_SERVICE_RESPONSES.updateUserSuccess }
            } else {
                return { success: false, message: USER_SERVICE_RESPONSES.updateUserError }
            }
        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from updateUser service: ', error.message) : console.log('Unknown error from updateUser service: ', error)
            return { success: false, message: USER_SERVICE_RESPONSES.commonError }
        }
    }
    async getUser(id: string): Promise<IResponse> {
        try {
            const user = await this.userRepository.getOneById(id)

            return user ? { success: true, data: user } : { success: false, message: USER_SERVICE_RESPONSES.noUserData }

        } catch (error: unknown) {
            error instanceof Error ? console.log('Error message from getUser service: ', error.message) : console.log('Unknown error from getUser service: ', error)
            return { success: false, message: USER_SERVICE_RESPONSES.commonError }
        }
    }
    async userLogout(token: string): Promise<IResponse> {
        try {
            const decoded = await this.tokenService.verifyAccessToken(token)
            const expirationTime = decoded?.exp
            return { success: true, data: expirationTime }
        } catch (error) {
            return { success: false, message: USER_SERVICE_RESPONSES.commonError }

        }
    }

}