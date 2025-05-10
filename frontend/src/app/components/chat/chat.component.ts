import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { LoginService } from '../../services/loginService/login.service';
import { AlertService } from '../../services/alertService/alert.service';
import { HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpStatusCodes, IChat, ILoggedUser, IResponse, IUser, IUserChat } from '../../model/interfaces';
import { ChatService } from '../../services/chatService/chat.service';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, NgClass, DatePipe, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export default class ChatComponent implements OnInit, OnDestroy {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>

  loginService = inject(LoginService)
  alertService = inject(AlertService)
  chatService = inject(ChatService)

  // newMessage: string = '';
  currentUser: string = 'You';

  userName: string = ''
  userId: string = ''

  receiverId: string = ''

  notification: string[] = []
  messages = signal<IUserChat[]>([])
  userReceiverChats = signal<IUserChat[]>([])
  newChats: any[] = []
  typing: string = ''
  roomId: string = ''
  roomKey: string = ''
  oldChats: boolean = false
  isLeftChat: boolean = false
  isOnline: boolean = false

  userData = signal<IUser>({ email: '', _id: '', name: '', img: '', lastSeen: new Date(), online: false })
  receiverData = signal<IUser>({ email: '', _id: '', name: '', img: '', lastSeen: new Date(), online: false })
  usersList = signal<IUser[]>([])

  destroy$: Subject<void> = new Subject<void>()

  showEmojiPicker: boolean = false
  recording: boolean = false
  mediaRecorder!: MediaRecorder
  recordedChunks: any[] = []

  chatObj = {
    message: '',
    date: new Date(),
    sender: '',
    type: '',
    receiver: ''
  }
  searchValue: string = '';
  searchParams = new HttpParams()

  ngOnInit(): void {
    this.loginService.loggedUser$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (user) => {
        this.userName = user?.name as string
        this.userId = user?.id as string
      },
      error: (error) => {
        console.log('get logged user error:'), error;
      }
    })

    this.getMessage()

    this.searchParams = this.searchParams.set('name', this.searchValue)
    this.chatService.sendStatusRequest(this.userId)
    this.getUser(this.userId)
    this.getAllUsers()
    // this.getAllChats()
    this.getAllUsersStatusUpdate()
    this.getUserStatus()
  }

  getAllUsersStatusUpdate() {
    console.log('entered getAllUsersStatusUpdate ');

    this.chatService.getAllUsersStatus().pipe(takeUntil(this.destroy$)).subscribe((data) => {
      console.log('all users status update: ', data);

      // let usersList = this.usersList()
      // let updatedList: IUser[] = usersList.map(user => {
      //   let matchedUser = data.find(userStatus => userStatus.userId === user._id)
      //   return matchedUser ? { ...user, lastSeen: matchedUser.lastSeen, online: matchedUser.online } : user
      // })
      // this.usersList.set(updatedList)

      this.usersList.update(users =>
        users.map(user => {
          let userStatus = data.find(status => status.userId === user._id)
          if (userStatus) {
            // const lastSeenDate = new Date(userStatus.lastSeen);
            // const validLastSeen = !isNaN(lastSeenDate.getTime()) ? lastSeenDate : new Date();
            return { ...user, lastSeen: userStatus.lastSeen, online: userStatus.online }
          }
          return user
        })
      )
      console.log('updated user list: ', this.usersList());

    })
  }



  getUserStatus() {
    this.chatService.getUserStatus().pipe(takeUntil(this.destroy$)).subscribe((data) => {
      // console.log('user status update: ', data);

    })
  }

  formatLastSeen(lastSeen: Date, online: boolean) {
    // debugger
    // console.log('lastseen and online value from formatLastSeen:', lastSeen, online);

    if (online) return 'Online'

    // if(!lastSeen || isNaN(lastSeen.getTime())) return 'Last seen: unknown';

    let now = new Date()

    let diffMs = now.getTime() - new Date(lastSeen).getTime()
    let diffMnts = Math.floor(diffMs / (1000 * 60))
    let diffHrs = Math.floor(diffMnts / 60)
    let diffDays = Math.floor(diffHrs / 24)

    if (diffMnts < 60) {
      return `left ${diffMnts} mins ago`;
    } else if (diffHrs < 24) {
      return `left ${diffHrs} hours ago`;
    } else {
      return `left ${diffDays} days ago`;
    }

  }

  getUser(id: string) {
    this.loginService.getUser(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: HttpResponse<IResponse>) => {
        console.log('res form get user: ', res);
        this.userData.set(res.body?.data)
      },
      error: (err: HttpErrorResponse) => {
        console.log('error form get user: ', err);

      }
    })
  }

  getAllUsers() {
    console.log('get users search values: ', this.searchValue);

    this.loginService.getUsers(this.searchParams).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: HttpResponse<IResponse>) => {
        console.log('res form get users: ', res);
        console.log('sender id: ', this.userId);
        let chatUsers: IUser[] = (res.body?.data).filter((user: IUser) => user._id !== this.userId)
        console.log('chat users list: ', chatUsers);

        this.usersList.set(chatUsers)
        this.getAllUsersStatusUpdate()
      },
      error: (err: HttpErrorResponse) => {
        console.log('error form get user: ', err);

      }
    })
  }

  getAllChats() {
    this.chatService.getChatsByRoom(this.roomId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.status === HttpStatusCodes.OK) {
          console.log('user chats from db:', res.body.data);
          const chatData = res.body.data
          // this.messages.set([])
          this.userReceiverChats.set([])
          let array = []
          for (let chat of chatData.chats) {
            // if(chat.receiver===this.receiverId){
            // }
            array.push(chat)

          }
          // this.messages.set(array)
          this.userReceiverChats.set(array)
          console.log('all user messages array:', this.userReceiverChats());

        } else {
          console.log(res.body?.message);
          this.alertService.getAlert("alert alert-danger", res.body?.message ? res.body?.message : '')
        }

      },
      error: (error: any) => {
        console.log('error from getMessage:', error.message);
      }
    })
  }

  //////////////////////////////////////////////
  getMessage() { 
    debugger
    this.chatService.getMessage().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        console.log('sent message from server:', data);
        this.roomId = data.roomId
        // this.messages.update((messagesList) => [...messagesList, data.chats])
        // this.newChats.push(data)
        this.userReceiverChats.update(messages => [...messages,data.chats])
        console.log('user messages array:', this.userReceiverChats());
      },
      error: (error: any) => {
        console.log('error from getMessage:', error.message);
      }
    })
  }

////////////////////////////////////////////////

  // toggle() {
  //   // debugger
  //   this.chatService.setValue()
  //   console.log('checkbox value: ', this.chatService.checkbox());

  // }

  // getUserReceiverMessage(receiverId: string) {
  //   console.log('receiver Id: ', receiverId);
  //   // this.userReceiverChats.set(this.messages()) 
  //   //   console.log('chats with user and receiver before filter : ', this.userReceiverChats());

  //   // this.userReceiverChats.update(messages => messages.filter(message => message.receiver === receiverId || message.sender === receiverId))
  //   // console.log('chats with user and receiver after filter : ', this.userReceiverChats());

  //   // this.receiverData.update(data => {
  //   //   let userUpdate = this.usersList().find((user) => data._id === user._id)
  //   //   console.log('receiver date from updated list: ', userUpdate);

  //   //   return userUpdate ? { ...data, lastSeen: userUpdate.lastSeen, online: userUpdate.online } : data
  //   // }
  //   // )
  //   // console.log('receiver data after entering chat with receiver : ', this.receiverData());


  //   this.userReceiverChats.set(this.messages())
  //   this.userReceiverChats.update(messages => messages.filter(message =>
  //     (message.receiver === this.receiverId && message.sender === this.userId)
  //     ||
  //     (message.receiver === this.userId && message.sender === this.receiverId)

  //   ))
  //   console.log('user-receiver chats: ', this.userReceiverChats());
  //   // this.receiverData.update(data => { 
  //   //   const userUpdate = this.usersList()?.find(user => user._id === this.receiverId);
  //   //   if (!userUpdate) {
  //   //     console.warn(`User with ID ${this.receiverId} not found in usersList`);
  //   //     return data;
  //   //   }
  //   //   return {
  //   //     ...data,
  //   //     // _id: this.receiverId,
  //   //     lastSeen: userUpdate.lastSeen,
  //   //     online: userUpdate.online
  //   //   };
  //   // }); 

  // }

  startMessage(receiverId: string) {
    this.receiverId = receiverId
    // console.log('receiver Id: ', this.receiverId);
    // this.userReceiverChats.set(this.messages())
    // console.log('chats with user and receiver before filter : ', this.userReceiverChats());

    // this.userReceiverChats.update(messages=>messages.filter(message=>message.receiver===this.receiverId))
    // console.log('chats with user and receiver after filter : ', this.userReceiverChats());
    this.loginService.getUser(receiverId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: HttpResponse<IResponse>) => {
        // console.log('res form get receiver data: ', res);
        // this.receiverData.set(res.body?.data)
        let receiverData = (res.body?.data)
        const userUpdate = this.usersList()?.find(user => user._id === this.receiverId);
        if (!userUpdate) {
          console.warn(`User with ID ${this.receiverId} not found in usersList`);
          this.receiverData.set(receiverData)
        }
        this.receiverData.set({
          ...receiverData,
          _id: this.receiverId,
          lastSeen: userUpdate?.lastSeen,
          online: userUpdate?.online
        })
        console.log('res form get receiver data: ', res);
      },
      error: (err: HttpErrorResponse) => {
        console.log('error form get receiver data: ', err);

      }
    })


    this.chatService.startChat(this.userName, this.userId, receiverId)

    // this.getMessage()
    // this.getUserReceiverMessage(this.receiverId)

    this.chatService.getRoomId().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.roomId = data.roomId
      this.roomKey= data.roomKey
      console.log(' room id : ', this.roomId);
      this.getAllChats()
      // this.getMessage()
      // this.getUserReceiverMessage(this.receiverId)

    })

  }

  sendMessage() {
    // console.log('new chat message: ', this.chatObj);

    const chatData: IUserChat = {
      message: this.chatObj.message,
      date: new Date(),
      sender: this.userId,
      type: 'text',
      receiver: this.receiverId
    }

    // this.messages.update(chats => [...chats, chatData])
    // this.userReceiverChats.update(chats => [...chats, chatData])
    // this.getUserReceiverMessage(this.receiverId)

    this.chatObj.type = 'text'
    this.chatObj.sender = this.userId
    this.chatObj.receiver = this.receiverId

    console.log('new message to send to server: ', this.chatObj);
    this.chatService.sendMessage({ userId: this.userId, receiverId: this.receiverId,roomKey:this.roomKey, roomId: this.roomId, chats: this.chatObj })
    // this.chatService.getMessage().subscribe(receivedData => {
    //   console.log('chat data received at frontebd from server: ', receivedData);

    //   if (receivedData.sender === this.userId && receivedData.receiver === this.receiverId && receivedData.success) {
    //     this.getAllChats()

    //   }

    // })
    this.chatObj.message = ''
    this.typing = ''

  }

  addEmoji(event: Event) {
    // debugger
    let customEvent = event as CustomEvent<{ unicode: string }>
    console.log('emoji click event: ', customEvent, customEvent.detail.unicode);
    this.chatObj.message = `${this.chatObj.message}${customEvent.detail.unicode}`
    // this.fileInput.nativeElement.value = `${this.newMessage}${customEvent.detail.unicode}`
  }

  startedTyping() {
    this.chatService.typing(this.userName, this.userId)

  }


  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop()
    }
  }


  startRecording() {

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log('Your browser does not support audio recording.');
      return
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.mediaRecorder = new MediaRecorder(stream)
      this.recording = true
      this.recordedChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = () => {
        this.recording = false
        const audioBlob = new Blob(this.recordedChunks, { type: 'audio/ogg' })
        console.log('audioBlob: ', audioBlob);
        const formData = new FormData()
        formData.append('audio', audioBlob)
        // get cloudinary link from server and send mesage to socket 
        this.chatService.getAudioUrlFromCloudinary(formData).pipe(takeUntil(this.destroy$)).subscribe({
          next: (res: HttpResponse<IResponse>) => {
            if (res.status === HttpStatusCodes.OK) {
              console.log(res.body?.data);
              const chatData: IUserChat = {
                message: res.body?.data.imgUrl,
                date: new Date(),
                sender: this.userId,
                type: res.body?.data.type,
                receiver: this.receiverId
              }
              // this.messages.update(chats => [...chats, chatData])
              // this.userReceiverChats.update(chats => [...chats, chatData])
              // console.log('chats with user and receiver after audio uploaded : ', this.userReceiverChats());

              // this.getUserReceiverMessage(this.receiverId)
              console.log('chats with user and receiver after audio uploaded and filtered: ', this.userReceiverChats());

              // this.chatForm.get('chats.message')?.setValue(res.body?.data.imgUrl)
              // this.chatForm.get('chats.type')?.setValue(res.body?.data.type)
              this.chatService.sendMessage({ userId: this.userId, receiverId: this.receiverId,roomKey:this.roomKey,  roomId: this.roomId, chats: chatData })
              console.log('audio chat data', chatData);
            } else {
              console.log(res.body?.message);
              this.alertService.getAlert("alert alert-danger", res.body?.message ? res.body?.message : '')
            }

          },
          error: (err: HttpErrorResponse) => {
            console.log(err, err.error.message);
          }
        })
      }

      this.mediaRecorder.start()

    })

  }

  triggerFileInput() {
    this.fileInput.nativeElement.click()

  }

  handleFileUpload(event: Event) {
    const input = <HTMLInputElement>event.target
    if (input.files && input.files.length > 0) {
      console.log('File(s) selected:', input, input.files[0]);
      const formData = new FormData()
      const file = input.files[0]
      formData.append('img', file)

      this.chatService.getImgUrlFromCloudinary(formData).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: HttpResponse<IResponse>) => {
          if (res.status === HttpStatusCodes.OK) {
            console.log(res.body?.data);
            const chatData: IUserChat = {
              message: res.body?.data.imgUrl,
              date: new Date(),
              sender: this.userId,
              type: res.body?.data.type,
              receiver: this.receiverId
            }
            // this.messages.update(chats => [...chats, chatData])
            // console.log('chats with user and receiver after file uploaded : ', this.messages());

            // this.getUserReceiverMessage(this.receiverId)
            // this.userReceiverChats.update(chats => [...chats, chatData])
            console.log('chats with user and receiver after file uploaded and filtered: ', this.userReceiverChats());

            // this.chatForm.get('chats.message')?.setValue(res.body?.data.imgUrl)
            // this.chatForm.get('chats.type')?.setValue(res.body?.data.type)
            this.chatService.sendMessage({ userId: this.userId, receiverId: this.receiverId,roomKey:this.roomKey,  roomId: this.roomId, chats: chatData })
            console.log('file chat data', chatData);
            // this.chatForm.get('chats.message')?.setValue('')
          } else {
            console.log(res.body?.message);
            this.alertService.getAlert("alert alert-danger", res.body?.message ? res.body?.message : '')
          }

        },
        error: (err: HttpErrorResponse) => {
          console.log(err, err.error.message);
        }
      })
    }
  }

  toggleEmojiPicker() {
    // debugger
    this.showEmojiPicker = !this.showEmojiPicker
    console.log('showEmojiPicker value', this.showEmojiPicker);

  }

  search() {
    console.log('user name to search: ', this.searchValue);
    this.searchParams = this.searchParams.set('name', this.searchValue)
    this.getAllUsers()
  }

  ngOnDestroy(): void {
    console.log(('chat component destroyed'));
    this.chatService.leaveRoom(this.userName, this.userId)

    this.destroy$.next()
    this.destroy$.complete()
  }

}
