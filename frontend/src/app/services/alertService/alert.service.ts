import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IAlert } from '../../model/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private alertSubject: BehaviorSubject<IAlert> = new BehaviorSubject<IAlert>({ alertClass: '', alertMessage: '', alertOn: false })
  alert$ = this.alertSubject.asObservable()

  constructor() { }

  getAlert(alertClass:string,alertMessage:string){
    this.alertSubject.next({alertClass,alertMessage,alertOn:true})
  }

}
