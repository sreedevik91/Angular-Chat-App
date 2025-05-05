import express from 'express'
import { config } from 'dotenv'
import chatRoutes from './src/routes/routes'
import connectDb from './src/config/db'
import cors from 'cors'
import { errorHandler } from './src/middlewares/errorHandler'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { handleSocketConnections } from './src/middlewares/chatSocket'

const app = express()

const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:4200", // Adjust to your Angular app's URL
        methods: ["GET", "POST"],
        // origin:'domain name in productiion',
        credentials: true
    },
    transports: ['websocket', 'polling']
})

handleSocketConnections(io)

config()
connectDb()

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
    exposedHeaders: ['Set-Cookie']
}))

app.use('/', chatRoutes)
app.use(errorHandler)
httpServer.listen(Number(process.env.PORT) || 5000, "0.0.0.0", () => {
    console.log('Server running on 5000');
})