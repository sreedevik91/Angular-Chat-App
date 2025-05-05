import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import LoginComponent from '../components/login/login.component';
import { LoginService } from '../services/loginService/login.service';
import { catchError, map, take, throwError } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {

  const loginService = inject(LoginService)

  const router = inject(Router)

  return loginService.loggedUser$.pipe(
    take(1),
    map((user) => {
      if (user) {
        return true
      } else {
        console.log('No logged user');
        router.navigateByUrl('login')
        return false
      }
    }),
    catchError((error) => {
      console.log('Some error happened while getting logged user');
      router.navigateByUrl('login')
      return throwError(() => error)
    })
  )
};
