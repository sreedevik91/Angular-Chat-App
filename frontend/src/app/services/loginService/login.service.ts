import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ILoggedUser, ILogin, IRegister } from '../../model/interfaces';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor() { }

  http = inject(HttpClient)

  baseUrl: string = environment.apiUserUrl

  private loggedUserDataSubject: BehaviorSubject<ILoggedUser | null> = new BehaviorSubject<ILoggedUser | null>(null)
  
  loggedUser$ = this.loggedUserDataSubject.asObservable()

  setLoggedUser(userData:ILoggedUser){
    console.log('logged user to set:', userData);
    
    this.loggedUserDataSubject.next(userData)
  }

  userLogin(loginData: ILogin) {
    return this.http.post(`${this.baseUrl}login`, loginData, { observe: 'response', withCredentials: true })
  }

  userRegister(registerData: IRegister) {
    return this.http.post(`${this.baseUrl}new`, registerData, { observe: 'response', withCredentials: true })
  }

  userUpdate(userId:string,updatedData:FormData){
    // debugger
    return this.http.patch(`${this.baseUrl}${userId}`, updatedData, { observe: 'response', withCredentials: true })
  }

  getUser(userId:string){
    return this.http.get(`${this.baseUrl}${userId}`, { observe: 'response', withCredentials: true })
  }

  getUsers(params:HttpParams){
    return this.http.get(`${this.baseUrl}users`, { observe: 'response',params, withCredentials: true })
  }

  userLogout(){
    return this.http.get(`${this.baseUrl}logout`, { observe: 'response', withCredentials: true }).pipe(
      tap(()=>{
        this.loggedUserDataSubject.next(null)
      })
    )
  }

}

