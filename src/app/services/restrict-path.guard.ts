import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Tea } from '../constants/globalfunctions';
import { environment } from '../../environments/environment';

@Injectable()
export class RestrictPathGuard implements CanActivate {

  constructor(public _router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if(localStorage.length){
        let protectorUser = JSON.parse(Tea.getItem('protectorUserlogIn'));
        if(!protectorUser && (environment.staging || environment.alphaLive)){
          return true;
        }
        else if(environment.staging || environment.alphaLive) {
          if(protectorUser){
            this._router.navigate(['home']);
            return false;
          }
          else{
            return true;
          }
         }
         else{
           this._router.navigate(['home']);
           return false;
         }
        
       }
       else if(environment.staging || environment.alphaLive) {
         return true;
       }
       else{
        this._router.navigate(['home']);
         return false;
       }
  }
}
