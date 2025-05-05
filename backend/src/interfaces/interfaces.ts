import { CookieOptions, NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { DeleteResult, Document, FilterQuery, QueryOptions, UpdateQuery } from "mongoose";

export interface IUser extends Document {
    _id:string;
    name: string;
    username: string;
    password: string;
    email: string;
    img?: string;
    lastSeen:Date;
}

export interface IChat extends Document {
    _id: string;
    userId: string;
    receiverId: string;
    roomId: string;
    chats: IUserChat[];
}

export interface IUserChat {
    sender: string;
    receiver?: string;
    message: string;
    date: Date;
}


export interface IJwtPayload extends JwtPayload {
    id: string;
    name: string;
    email: string;
    img:string;
}


export interface ICookie {
    success?:boolean;
    payload: IJwtPayload;
    accessToken: string;
    refreshToken: string;
    options: CookieOptions;
}

export interface LoginData {
    name?: string;
    googleId?: string;
    email?: string;
    username?: string;
    password?: string
}

export interface IResponse<T=unknown> {
    success: boolean;
    message?: string;
    data?: T;
    emailVerified?: boolean;
    cookieData?: ICookie;
    emailNotVerified?: boolean;
    wrongCredentials?: boolean;
    blocked?: boolean;
    noUser?: boolean;
    accessToken?:string;
    refreshToken?:string
    options?:CookieOptions,
    payload?:IJwtPayload
}


export interface IUserController {
    registerUser(req: Request, res: Response, next: NextFunction): Promise<void>
    loginUser(req: Request, res: Response, next: NextFunction): Promise<void>
    getUser(req: Request, res: Response, next: NextFunction): Promise<void>
    updateUser(req: Request, res: Response, next: NextFunction): Promise<void>
    userLogout(req: Request, res: Response,next:NextFunction):Promise<void>
    getUsers(req: Request, res: Response,next:NextFunction):Promise<void>
}

export interface IUserService {
    registerUser(userData: IUser): Promise<IResponse>
    loginUser(req: Request,loginData: LoginData): Promise<IResponse>
    // getUsers(params: any): Promise<IResponse>
    // getNewToken(req: Request,refreshToken: string): Promise<IResponse>
    updateUser(userId: string, data: Partial<IUser>): Promise<IResponse>
    getUser(id: string): Promise<IResponse>
    userLogout(token:string):Promise<IResponse>
    getUsers(params:any):Promise<IResponse>
}

export interface IRepository<T> {
    getAll(query: FilterQuery<T>, options: QueryOptions): Promise<T[] | null>;
    getOneById(id: string): Promise<T | null>;
    create(data: Partial<T>): Promise<T | null>;
    update(id: string, data: UpdateQuery<T>): Promise<T | null>;
    // update(id: string, data: Partial<T>): Promise<T | null>;
    deleteOne(id: string): Promise<DeleteResult | null>;

}

export interface IUserRepository {
    getAll(query: FilterQuery<IUser>, options: QueryOptions): Promise<IUser[] | null>;
    getOneById(userId: string): Promise<IUser | null>;
    create(userData: Partial<IUser>): Promise<IUser | null>;
    update(userId: string, user: UpdateQuery<IUser>): Promise<IUser | null>;
    // update(userId: string, user: Partial<IUser>): Promise<IUser | null>;
    deleteOne(userId: string): Promise<DeleteResult | null>;
    getUserByUsername(userName:string):Promise<IUser | null>;
    getUserByEmail(userName:string):Promise<IUser | null>;
}

export interface IPasswordService {
    hashPassword(password: string): Promise<string | null>
    verifyPassword(inputPassword: string, userPassword: string): Promise<boolean | null>
}

export interface ICookieService {
    getCookieOptions(req:Request,user: IUser, accessToken: string, refreshToken: string): Promise<{ payload: IJwtPayload, accessToken: string, refreshToken: string, options: CookieOptions }>
}

export interface ITokenService {
    getAccessToken(payload: IUser): Promise<string | null>
    getRefreshToken(payload: IUser): Promise<string | null>
    verifyAccessToken(token: string): Promise<IJwtPayload | null>
    verifyRefreshToken(token: string): Promise<IJwtPayload | null>
}

export const USER_CONTROLLER_RESPONSES = {
    commonError: 'Something went wrong.',
    googleLoginError: 'No google user found',
    userNotFound: 'User not found !',
    loginSuccess:'Logged in successfully',
    emailNotVerified:'Email not verified',
    invalidCredentials:'Invalid username or password',
    accountBlocked:'Your account has been blocked. Contact admin for more details.',
    loggedOut: 'User logged out',
    refreshTokenMissing:'Refresh Token is missing',
    tokenRefresh:'Token refreshed',
    tokenRefreshError: 'Token could not refresh'
}

export const USER_SERVICE_RESPONSES = {
    commonError: 'Something went wrong.',
    invalidEmail: 'Invalid email. Enter your registered email',
    emailExists: 'Email registered already, try with another email or login with existing account',
    missingToken: 'Could not get credentials',
    sendEmailError: 'Could not send email to user, something went wrong',
    sendEmailSuccess: 'Email sent successfully',
    userNotFound: 'Sorry ! User not found, Please create your account.',
    sendOtpError:'Could not send Otp.Try again',
    resendOtpSuccess: 'Otp resent successfully',
    updatePasswordError: 'Could not update password. Please try again.',
    savePasswordError: 'Could not save password',
    resetPasswordSuccess: 'Password reset successfully',
    noUsername: 'Username is required',
    usernameNotAvailable: 'Username not available',
    userRegisterError: 'Could not register user',
    userRegisterSuccess: 'User registered successfully',
    googleLoginError: 'No google user found',
    missingCredentials:'Username and password required.',
    accountBlocked: 'Your account has been blocked. Contact admin for more details.',
    emailNotVerified: 'Your email is not verified',
    invalidCredentials: 'Invalid username or password',
    otpMissmatch: 'Otp did not match',
    otpMatched:'Otp matched',
    sendOtpSuccess: 'Otp Sent to email',
    dataFetchError: 'Could not fetch data',
    refreshTokenError: 'Could not refresh token',
    updateUserSuccess:'User updated successfuly',
    updateUserError: 'Could not updated user',
    updateStatusError:'Could not updated user status',
    updateStatusSuccess:'User status updated',
    noUserData: 'Could not get user details',
    usersCountError: 'Could not get users count',
    verifyUserError:'Could not verify user',
    verifyUserSuccess: 'User verified',
    googleUserUpdateError:'Could not update user, try login in using gmail account'
}

export enum HttpStatusCodes{
    OK=200,
    CREATED=201,
    BAD_REQUEST=400,
    UNAUTHORIZED=401,
    FORBIDDEN=403,
    NOT_FOUND=404,
    INTERNAL_SERVER_ERROR=500
}

export interface IChat extends Document {
    _id: string;
    userId: string;
    // roomId:string;
    receiverId:string;
    chats: IUserChat[];
  }

  
export interface IChatRepository{
    getAll(query: FilterQuery<IChat>, options: QueryOptions): Promise<IChat[] | null>;
    getOneById(chatId: string): Promise<IChat | null>;
    create(chatData: Partial<IChat>): Promise<IChat | null>;
    update(chatId: string, chat: UpdateQuery<IChat>): Promise<IChat | null>;
    // update(chatId: string, chat: Partial<IChat>): Promise<IChat | null>;
    deleteOne(chatId: string): Promise<DeleteResult | null>;

    getChatsByUserId(userId: string):Promise<IChat | null>
    getChatsByRoomId(roomId: string):Promise<IChat | null>
  }
  
  export interface IChatService{
    getChatsByUserId(userId: string):Promise<IResponse>
    saveChats(data: IChat):Promise<IResponse>
    uploadToCloudinary(img: string,name:string,type: "image" | "video" | "raw" | "auto" | undefined):Promise<IResponse>
    uploadAudioToCloudinary(audio: string,name:string):Promise<IResponse>
    getChatsByRoomId(roomId: string):Promise<IResponse>
}
  
  export interface IChatController{
    getChatsByUserId(req: Request, res: Response, next: NextFunction):Promise<void>
    uploadToCloudinary(req: Request, res: Response, next: NextFunction):Promise<void>
    uploadAudioToCloudinary(req: Request, res: Response, next: NextFunction):Promise<void>
    getChatsByRoomId(req: Request, res: Response, next: NextFunction):Promise<void>
}

  export const CHAT_SERVICE_RESPONSES = {
    commonError: 'Something went wrong.',
    getChatError:'Could not get booking, Something went wrong',
    saveChatError: 'Could not save chat, Something went wrong'
  }

  export interface IUserChat {
    sender:string;
    receiver?:string;
    message: string;
    date: Date;
  }

  export interface IRequestParams {
    name: string,
   
  }