import { NgClass } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alertService/alert.service';
import { IAlert } from '../../../model/interfaces';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [NgClass],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent {
@Input() showAlert: boolean = false
@Input() alertMessage: string = ''
@Input() alertClass: string = ''

alertService=inject(AlertService)

constructor(){
  this.alertService.alert$.subscribe((alert:IAlert)=>{
    this.alertClass= alert.alertClass
    this.alertMessage=alert.alertMessage
    this.showAlert= alert.alertOn
  })
}

}
