import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io'
import { LoginService } from '../loginService/login.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { IChat } from '../../model/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  // // showCheckBox:boolean=false

  // showCheckBoxSubject= new BehaviorSubject<boolean>(false)

  // showCheckBox$=this.showCheckBoxSubject.asObservable()

  // checkbox=signal<boolean>(false)

  // constructor() { }

  // setValue(){
  // //  const currentvalue= this.showCheckBoxSubject.value
  // //  this.showCheckBoxSubject.next(!currentvalue)

  // const currentvalue=this.checkbox()
  // this.checkbox.set(!currentvalue)
  // }

  // getValue(){
  //   return this.checkbox()
  // }

  socket = inject(Socket)
  loginService = inject(LoginService)

  http = inject(HttpClient)
  baseUrl = environment.apiChatUrl
  userApiUrl = environment.apiUserUrl

  constructor() {
    this.socket.on('connect', () => {
      console.log('Socket connected to backend...');

    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected...');

    })

    this.socket.on('connect_error', (error: Error) => {
      console.log('Socket connection error : ', error);

    })

  }

  getAllUsers() {
    return this.http.get(`${this.userApiUrl}users`, { observe: 'response', withCredentials: true })
  }

  getChatsByUser(userId: string) {
    return this.http.get(`${this.baseUrl}${userId}`, { observe: 'response', withCredentials: true })
  }

  getChatsByRoom(roomId: string) {
    return this.http.get(`${this.baseUrl}${roomId}`, { observe: 'response', withCredentials: true })
  }

  getImgUrlFromCloudinary(data: any) {
    return this.http.post(`${this.baseUrl}upload`, data, { observe: 'response', withCredentials: true })
  }

  getAudioUrlFromCloudinary(data: any) {
    return this.http.post(`${this.baseUrl}upload/audio`, data, { observe: 'response', withCredentials: true })
  }

  startChat(userName: string, userId: string, receiverId: string) {
    this.socket.emit('startChat', { userName, userId, receiverId })
  }

  // activeUsers() {
  //   this.socket.emit('getActiveUsers')
  // }

  // joinRoom(userId: string) {
  //   this.socket.emit('joinChat', { userId })
  // }

  // adminSendMessage(userId: string, data: IChat) {
  //   console.log('chat data from admin component', data);
  //   this.socket.emit('adminSentMessage', { userId, data })
  // }

  sendStatusRequest(userId:string){
    this.socket.emit('getStatus', {userId})
  }

  sendMessage(data: IChat) {
    // console.log('chat data from user component', data);
    this.socket.emit('sendMessage', data)
  }

  typing(userName: string, userId: string) {
    this.socket.emit('typing', { userName, userId })
  }

  leaveRoom(userName: string, userId: string) {
    this.socket.emit('leaveChat', { userName, userId })
  }

  getMessage(): Observable<any> {
    return this.socket.fromEvent<any>('receivedMessage')
  }
  
  // getUserMessage(): Observable<any> {
  //   return this.socket.fromEvent<any>('receiveUserMessage')
  // }

  getStartChatNotificatrion(): Observable<any> {
    return this.socket.fromEvent<any>('startChatNotification')
  }

  // getJoiningNotificatrion(): Observable<any> {
  //   return this.socket.fromEvent<any>('joiningNotification')
  // }

  getTypingNotificatrion(): Observable<string> {
    return this.socket.fromEvent<string>('typingNotification')
  }

  getLeavingNotificatrion(): Observable<string> {
    return this.socket.fromEvent<string>('leavingNotification')
  }

  // getActiveUsers(): Observable<any> {
  //   return this.socket.fromEvent<any>('updatedActiveUsers')
  // }

  getRoomId(): Observable<any> {
    return this.socket.fromEvent<any>('roomId')
  }

  getStatusUpdate(){
    return this.socket.fromEvent('getStatus')
  }

  getAllUsersStatus():Observable<{userId:string,online:boolean,lastSeen:Date}[]>{
    return this.socket.fromEvent('initialStatuses')
  }

  getUserStatus():Observable<{userId:string,online:boolean,lastSeen:Date}>{
    return this.socket.fromEvent('userStatusUpdate')
  }

}
