import { Component, inject, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpStatusCodes, ILogin, IRegister, IResponse } from '../../model/interfaces';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../services/loginService/login.service';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { AlertService } from '../../services/alertService/alert.service';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { ChatService } from '../../services/chatService/chat.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, AlertComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export default class LoginComponent implements OnDestroy {

  showLoginForm: boolean = true

  destroy$: Subject<void> = new Subject<void>()

  loginService = inject(LoginService)
  router = inject(Router)
  alertService = inject(AlertService)
  chatService = inject(ChatService)

  userName: string = ''
  userId: string = ''

  loginObj: ILogin = {
    username: '',
    password: ''
  }

  registerObj: IRegister = {
    name: '',
    email: '',
    username: '',
    password: ''
  }

  login() {
    console.log('loginform values: ', this.loginObj);
    this.loginService.userLogin(this.loginObj).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: HttpResponse<IResponse>) => {
        console.log('login response: ', res);
        if (res.status === HttpStatusCodes.OK) {
          console.log(this.router);
          this.userId = res.body?.data.id
          this.router.navigateByUrl('chat')
          this.loginService.setLoggedUser(res.body?.data)
          this.loginObj = {
            username: '',
            password: ''
          }
        } else {
          console.log(res.body?.message);

          this.alertService.getAlert("alert-danger", res.body?.message ? res.body.message : "Login Failed")
          this.loginObj = {
            username: '',
            password: ''
          }
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log('login error: ', err);
        this.alertService.getAlert("alert-danger", err.error.message ? err.error.message : "Login Failed")
        this.loginObj = {
          username: '',
          password: ''
        }
      }
    })

  }

  cancel() {
    this.showLoginForm = true
    this.registerObj = {
      name: '',
      email: '',
      username: '',
      password: ''
    }
  }

  register() {
    console.log('loginform values: ', this.registerObj);
    this.loginService.userRegister(this.registerObj).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: HttpResponse<IResponse>) => {
        console.log('register response: ', res);
        if (res.status === HttpStatusCodes.CREATED) {
          this.alertService.getAlert("alert alert-success", "Successfully registered!")
          this.showLoginForm = true
        } else {
          this.alertService.getAlert("alert alert-danger", res.body?.message ? res.body.message : "Registration Failed!")
        }

      },
      error: (err: HttpErrorResponse) => {
        debugger
        console.log('register error: ', err);
        this.alertService.getAlert("alert alert-danger", err.error.message ? err.error.message : "Registration Failed!")
      }
    })
    this.registerObj = {
      name: '',
      email: '',
      username: '',
      password: ''
    }
  }

  ngOnDestroy(): void {
    console.log(('login component destroyed'));
    this.chatService.leaveRoom(this.userName, this.userId)
    this.destroy$.next()
    this.destroy$.complete()
  }

}
