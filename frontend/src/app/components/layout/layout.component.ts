import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, takeUntil, pipe } from 'rxjs';
import { LoginService } from '../../services/loginService/login.service';
import { Router, RouterOutlet } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ILoggedUser, IResponse } from '../../model/interfaces';
import { ChatService } from '../../services/chatService/chat.service';
import ChatComponent from "../chat/chat.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export default class LayoutComponent implements OnDestroy, OnInit {
  destroy$: Subject<void> = new Subject<void>()

  userName: string = ''
  userId: string = ''
  userImg: string = ''
  imgUrl: string | ArrayBuffer | null = ''

  isChecked: boolean = false

  showCheckbox=signal<boolean>(false)

  userData = signal<ILoggedUser>({ email: '', id: '', name: '', img: '' })

  loginService = inject(LoginService)
  chatService = inject(ChatService)
  router = inject(Router)

  constructor() {
    this.loginService.loggedUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        console.log('logged user: ', user);
        this.userId = user.id
        this.userName = user.name
        this.userImg = user.img
        console.log('user image: ', this.userImg);
        
      }
    })
    this.getUser(this.userId)
  }
  ngOnInit(): void {
    //     this.chatService.showCheckBox$.subscribe((value)=>{
    // this.isChecked=value
    //     })
    // let value = this.chatService.checkbox()
    // this.showCheckbox.set(value)
    // this.isChecked= this.chatService.checkbox()
    // console.log('is checked value: ', this.isChecked);
    // console.log('showCheckbox value: ', this.showCheckbox());
    
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

  editUser(updateData: FormData) {
    // debugger
    this.loginService.userUpdate(this.userId, updateData).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: HttpResponse<IResponse>) => {
        console.log('res form edit user: ', res);
        this.userData.set(res.body?.data)
      },
      error: (err: HttpErrorResponse) => {
        console.log('error form get user: ', err);

      }
    })
  }

  onImage(event: Event) {
    // debugger
    const input = <HTMLInputElement>event.target
    console.log('file input: ', input);

    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      console.log('file uploaded: ', file);

      let imageurl: string | ArrayBuffer | null = ''

      let reader = new FileReader
      reader.readAsDataURL(file)
      reader.onload = (event: Event) => {
        console.log('FileReader event: ', event);

        imageurl = (<FileReader>event.target).result

        // this.eventForm.get('img')?.setValue(file)
        this.imgUrl = imageurl
        this.userImg = imageurl as string

        let formData = new FormData()

        formData.append('img', file)
        console.log('FileReader event: ', event);
        console.log('edited user data: ', formData);
        formData.forEach((value, key) => {
          console.log(key, value);
        });

        this.editUser(formData)
      }
    }
  }

  logout() {
    this.loginService.userLogout().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: HttpResponse<IResponse>) => {
        this.chatService.leaveRoom(this.userName,this.userId)
        this.router.navigate(['login']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Logout failed:', error);
        this.router.navigate(['login']);
      }
    })
  }

  ngOnDestroy(): void {
    console.log(('layout component destroyed'));
    this.chatService.leaveRoom(this.userName, this.userId)
    this.destroy$.next()
    this.destroy$.complete()
  }
}
