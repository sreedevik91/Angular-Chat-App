export interface ILogin{
    username:string;
    password:string
}

export interface IRegister{
    name:string;
    username:string;
    password:string;
    email:string;
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

export interface IResponse {
    success?: boolean;
    message?: string;
    data?: any;
    extra?: any;
    emailVerified?: boolean;
    wrongCredentials?: boolean;
    blocked?: boolean;
}

export interface ILoggedUser{
    id: string;
    name: string;
    email: string;
    img:string;
}

export interface IAlert {
    alertOn: boolean;
    alertClass: string;
    alertMessage: string;
}

export interface IUserChat {
    sender:string;
    receiver?:string;
    message: string;
    type:string;
    date: Date;
}

export interface IChat {
    userId: string;
    receiverId:string;
    roomId:string;
    roomKey: string;
    chats: IUserChat;
}


export interface IUser{
    _id: string;
    name: string;
    email: string;
    img:string;
    online:boolean;
    lastSeen:Date;
}