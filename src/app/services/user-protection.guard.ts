import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Tea, getLoggedUserData, cloneObject } from '../constants/globalfunctions';
import { UpdatePasswordComponent } from '../shared/dialogues/update-password/update-password.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from './commonservice/data.service';

@Injectable()
export class UserProtectionGuard implements CanActivate {
  static hasNavigated: boolean = false

  static setUserNavigated(action: boolean) {
    this.hasNavigated = action
  }

  constructor(
    public _router: Router,
    private modalService: NgbModal,
    private activatedRoute: ActivatedRoute,
    private _dataService: DataService
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (localStorage.length) {

      const userInfo = getLoggedUserData()

      var protectorUser = JSON.parse(Tea.getItem('protectorUserlogIn'));
      if (protectorUser) {
        return true;
      }
      else if (!protectorUser && (environment.staging) || environment.alphaLive || environment.betaLive) {
        if (location.search.indexOf('login') > -1 || location.search.indexOf('code') > -1) {
          return true;
        }
        else {
          if (location.href.includes('partner') || location.href.includes('admin')) {
            localStorage.setItem('partnerURL', location.href)
          }
          this._router.navigate(['lock-screen']);
          return false;
        }
      }
      else if ((!userInfo || userInfo.IsLogedOut === true) && !UserProtectionGuard.hasNavigated) {
        UserProtectionGuard.hasNavigated = true
        const myParam = getUrlParameter('code')
        this._dataService.setUpdatePassCode(myParam)
        this._router.navigate(['login']);
      }
      else if (location.href.includes('login')) {
        this._router.navigate(['home']);
        return false
      }
      else {
        return true;
      }

    }
    //  || environment.alphaLive || environment.betaLive
    else if (!protectorUser && (environment.staging) || environment.alphaLive || environment.betaLive) {
      if (location.search.indexOf('login') > -1 || location.search.indexOf('code') > -1) {
        return true;
      }
      else {
        if (location.href.includes('partner') || location.href.includes('admin')) {
          localStorage.setItem('partnerURL', location.href)
        }
        this._router.navigate(['lock-screen']);
        return false;
      }
    }
    else {
      return true;
    }
  }
}

export function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
