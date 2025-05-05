
import { Server, Socket } from "socket.io";
import { IChat, IUserRepository } from "../interfaces/interfaces";
import UserRepository from "../repository/userRepository";
import { ChatRepository } from "../repository/chatRepository";
import { ChatServices } from "../services/chatServices";

const rooms: Record<string, string> = {}
const activeUsers: Set<string> = new Set()
let messages: IChat[] = []
let users: any = {}

let userIdLeavingChat=''

const userRepository: IUserRepository = new UserRepository()

const chatRepository = new ChatRepository()
const chatServices = new ChatServices(chatRepository)

export const handleSocketConnections = (io: Server) => {
    io.on('connection', async (socket: Socket) => {
        console.log('Socket connected...', socket.id);

          // Helper function to generate consistent room ID
          const generateRoomId = (user1: string, user2: string): string => {
            if (!user1 || !user2) {
                throw new Error('User IDs cannot be empty');
            }
            if (typeof user1 !== 'string' || typeof user2 !== 'string') {
                throw new Error('User IDs must be strings');
            }
            if (!/^[0-9a-f]{24}$/.test(user1) || !/^[0-9a-f]{24}$/.test(user2)) {
                throw new Error('Invalid MongoDB ObjectID format');
            }
            const roomId = [user1, user2].sort().join('_');
            console.log(`Generated roomId: ${roomId} for users ${user1}, ${user2}`);
            return roomId;
        };

        const usersList = await userRepository.getAll({}, {})
        if (usersList) {
            usersList.forEach(user => {
                users[user._id] = {}
                users[user._id].online = false
                users[user._id].socketId = socket.id
                users[user._id].lastSeen = user.lastSeen || new Date()
            });
        }

        // console.log('socket users when socket connected: ', users);

        socket.on('getStatus', async ({ userId }) => {
            const userLastSeenUpdate = await userRepository.update(userId, { $set: { lastSeen: new Date() } })
            // console.log(('last seen update of user during server start: '), userLastSeenUpdate);

            if (!users[userId]) users[userId] = {}

            users[userId].online = true
            users[userId].socketId = socket.id
            users[userId].lastSeen = new Date()
            const statusUpdatesOfAllUsers = Object.keys(users).map((user) => ({
                userId: user,
                online: users[user].online,
                lastSeen: users[user].lastSeen
            }))
            io.emit('initialStatuses', statusUpdatesOfAllUsers)
            // console.log('socket users: ', users);

        })


        socket.on('startChat', ({ userName, userId, receiverId }) => {
            const roomId = generateRoomId(userId,receiverId)
            // const roomId = userId
            // let key=[userId, receiverId].sort().join('/')
            // console.log(`key to create room: ${key}`);
            // rooms[key] = roomId
            // console.log(`roomId from stored rooms in chatSocket.ts: ${rooms[key]}`);

            rooms[userId] = roomId
            console.log(`roomId from stored rooms in chatSocket.ts: ${roomId}`);


            activeUsers.add(userId)
            socket.join(roomId)
            console.log(`${userName} joined room ${roomId}`);

              // Attempt to join receiver to the room if they are online
              if (users[receiverId] && users[receiverId].online && users[receiverId].socketId) {
                io.sockets.sockets.get(users[receiverId].socketId)?.join(roomId);
                console.log(`Receiver ${receiverId} joined room ${roomId}`);
            }

            
            if (!users[userId]) {
                users[userId] = { online: true, socketId: socket.id, lastSeen: new Date() };
            } else {
                users[userId].online = true;
                users[userId].socketId = socket.id;
            }


            // if (!users[userId]) users[userId] = {}

            // users[userId].online = true
            // users[userId].socketId = socket.id
            // users[userId].lastSeen = new Date()

            // Send the status of all users to the newly connected client
            const statusUpdatesOfAllUsers = Object.keys(users).map((user) => ({
                userId: user,
                online: users[user].online,
                lastSeen: users[user].lastSeen
            }))
            io.emit('initialStatuses', statusUpdatesOfAllUsers)

            io.emit('userStatusUpdate', {
                userId,
                online: users[userId].online,
                lastSeen: users[userId].lastSeen
            })
            
            socket.to(roomId).emit('startChatNotification', { roomId, message: `${userName} started the chat` })
            io.to(roomId).emit('roomId', {roomId})
            // console.log('socket users: ', users);

        })

        // socket.on('getActiveUsers', async () => {
        //     console.log(`updatedActiveUsers: `, Array.from(activeUsers));
        //     const usersArray:string[]=Array.from(activeUsers)
        //     const userDetailArray:{userId:string,userName:string}[]=[]
        //     for(let userId of usersArray){
        //         const userData= await userRepository.getOneById(userId)
        //        if (userData) userDetailArray.push({userId,userName:userData.name})
        //     }
        //     console.log('userDetailArray: ', userDetailArray);

        //     io.emit('updatedActiveUsers', userDetailArray)     
        // })

        // socket.on('joinChat', ({ userId }) => {
        //     const roomId=rooms[userId]
        //     socket.join(roomId)
        //     console.log(`Admin joined room ${roomId}`);
        //     socket.to(roomId).emit('joiningNotification', { roomId, message: `Admin joined the chat` })
        //     io.to(roomId).emit('receiveUserMessage', messages)
        // })

        socket.on('sendMessage', async (data) => {
            console.log('chat data to save: ', data);
            activeUsers.add(data.userId)
            // let key=[data.chats.sender,data.chats.receiver].sort().join('/')
            // let key= data.roomKey
            // const roomId = rooms[key] || rooms[data.roomId]
            const roomId = generateRoomId(data.userId, data.receiverId)
            console.log(' roomId from socket sendMessage event: ', roomId);
            data.roomId = roomId
            const saveChat = await chatServices.saveChats(data)
            console.log('saved chat: ', saveChat);
            messages.push(data)
            data.success = true
            // socket.emit('receivedMessage', data)
            io.to(roomId).emit('receivedMessage', data)
            // io.to(data.receiverId).emit('receivedMessage', data)

            if (users[data.sender]) {
                users[data.sender].lastSeen = new Date()
                io.emit('userStatusUpdate', {
                    userId: data.sender,
                    online: users[data.sender].online,
                    lastSeen: users[data.sender].lastSeen
                })
            } else {
                users[data.sender] = {}
                users[data.sender].online = true
                users[data.sender].socketId = socket.id
                users[data.sender].lastSeen = new Date()
            }

            // console.log('socket users after receiving message: ', users);

        })

        // socket.on('adminSentMessage', async ({userId,data}) => {
        //     console.log(data);
        //     const roomId=rooms[userId]
        //     console.log('admin roomId: ',roomId);
        //     data.roomId=roomId
        //     const saveChat = await chatServices.saveChats(data)
        //     console.log('saved chat: ', saveChat,socket.id);
        //     io.to(roomId).emit('receivedMessage', data)
        // })

        socket.on('typing', ({ userName, userId }) => {
            const roomId = rooms[userId]
            socket.to(roomId).emit('typingNotification', `${userName} is typing ...`)
        })

        socket.on('leaveChat', async ({ userName, userId }) => {
            userIdLeavingChat=userId
            console.log('User disconnected from leaveChat:', socket.id);
            const userLastSeenUpdate = await userRepository.update(userId, { $set: { lastSeen: new Date() } })
            // console.log(('last seen update of user during leaving chat: '), userLastSeenUpdate);

            const roomId = rooms[userId]
            activeUsers.delete(userId)
            delete rooms[userId]
            messages = []
            if (users[userId]) {
                users[userId].online = false,
                    users[userId].lastSeen = new Date(),
                    users[userId].socketId = null
            }
            io.emit('userStatusUpdate', {
                userId,
                online: false,
                lastSeen: users[userId].lastSeen
            })
            socket.to(roomId).emit('leavingNotification', `${userName} has left the chat ...`)
            io.emit('updatedActiveUsers', Array.from(activeUsers))
        })

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });

        socket.on('disconnect', async() => {
            console.log('User disconnected from disconnect:', socket.id, userIdLeavingChat);
            // const userLastSeenUpdate = await userRepository.update(userIdLeavingChat, { $set: { lastSeen: new Date() } })
            // console.log(('last seen update of user during leaving chat: '), userLastSeenUpdate);

        });

    })
}