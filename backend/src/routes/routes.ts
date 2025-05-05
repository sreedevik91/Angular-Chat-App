import { config } from "dotenv"
import express,{ NextFunction,Request,Response } from "express"
import cookieParser from 'cookie-parser'
import bodyParser from "body-parser"
import UserRepository from "../repository/userRepository"
import { UserServices } from "../services/userServices"
import { UserController } from "../controllers/userController"
import { PasswordService } from "../services/passwordService"
import { TokenService } from "../services/tokenService"
import { CookieService } from "../services/cookieService"
import { upload } from "../middlewares/multer"
import { ChatController } from "../controllers/chatController"
import { ChatServices } from "../services/chatServices"
import { ChatRepository } from "../repository/chatRepository"

config()

const userRepository= new UserRepository()
const passwordService=new PasswordService()
const tokenService=new TokenService()
const cookieService=new CookieService()
const userService= new UserServices(userRepository,passwordService,tokenService,cookieService)
const userController= new UserController(userService)

const chatRepository= new ChatRepository()
const chatService=new ChatServices(chatRepository)
const chatController= new ChatController(chatService)

const chatRoutes= express()
const router= express.Router()

chatRoutes.use(cookieParser())
chatRoutes.use(express.json())
chatRoutes.use(bodyParser.urlencoded({extended:true}))

router.post('/user/new',(req: Request, res: Response,next:NextFunction)=>userController.registerUser(req,res,next))
router.get('/user/logout',(req: Request, res: Response,next:NextFunction)=>userController.userLogout(req,res,next))
router.post('/user/login',(req: Request, res: Response,next:NextFunction)=>userController.loginUser(req,res,next))

router.get('/user/users',(req: Request, res: Response,next:NextFunction)=>userController.getUsers(req,res,next))
router.route('/user/:id')
.get((req: Request, res: Response,next:NextFunction)=>userController.getUser(req,res,next))
.patch(upload.single('img'),(req: Request, res: Response,next:NextFunction)=>userController.updateUser(req,res,next))

// router.get('/chat/:userId',(req:Request,res:Response,next:NextFunction)=>chatController.getChatsByUserId(req,res,next))
router.get('/chat/:roomId',(req:Request,res:Response,next:NextFunction)=>chatController.getChatsByRoomId(req,res,next))
router.post('/chat/upload',upload.single('img'),(req:Request,res:Response,next:NextFunction)=>chatController.uploadToCloudinary(req,res,next))
router.post('/chat/upload/audio',upload.single('audio'),(req:Request,res:Response,next:NextFunction)=>chatController.uploadAudioToCloudinary(req,res,next))


chatRoutes.use(router)

export default chatRoutes