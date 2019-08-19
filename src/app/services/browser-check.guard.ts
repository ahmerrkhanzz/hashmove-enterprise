import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import browser from 'browser-detect';


@Injectable()
export class BrowserCheckGuard implements CanActivate, CanActivateChild  {
  
  constructor(public _router : Router) {}

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean>|Promise<boolean>|boolean {
    
    let result = browser();
    let windowsWidth = window.innerWidth; 
    let windowsHeight = window.innerHeight;
  if(result.name.toUpperCase() == "CHROME"){
    return true;
  }
  else{
      this._router.navigate(['browser-detection']);
      return false;
  }
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      let result = browser();
      let windowsWidth = window.innerWidth; 
      let windowsHeight = window.innerHeight;
    if(result.name.toUpperCase() == "CHROME"){
      return true;
    }
    else{
      this._router.navigate(['browser-detection']);
      return false;
    }
  }
}
