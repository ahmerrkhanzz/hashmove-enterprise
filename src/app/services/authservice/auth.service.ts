import { Injectable } from '@angular/core';
import { baseApi } from '../../constants/base.url'
import { HttpClient } from '@angular/common/http';
import { Tea, HashStorage } from '../../constants/globalfunctions';
import { DataService } from '../commonservice/data.service';

@Injectable()
export class AuthService {

  constructor(
    private http: HttpClient,
    private _dataService: DataService
  ) { }

  userRegistration(data) {
    let url = "users/post"
    return this.http.post(baseApi + url, data);
  }
  userforgetpassword(data) {
    let url = "users/ForgotPassword"
    return this.http.post(baseApi + url, data);
  }
  userupdatepassword(data) {
    let url = "users/UpdatePassword"
    return this.http.put(baseApi + url, data);
  }
  userLogin(data) {
    let url = "users/ValidateUser"
    return this.http.post(baseApi + url, data);
  }
  userLogOut(data) {
    let url = "users/UserLogout"
    return this.http.post(baseApi + url, data);
  }


  /**
   *
   * CHECK IF USER HAS PREFERRED PROVIDERS
   * @param {NUMBER} id
   * @returns
   * @memberof AuthService
   */
  checkUserProviders(id) {
    let url = `ProviderCustomer/GetCustomerProviderList/${id}/company`
    return this.http.get(baseApi + url);
  }

  userDelete(deletingUserID, deleteByUserID) {
    let url = "users/DeleteAccountRequest/" + deletingUserID + '/' + deleteByUserID
    return this.http.delete(baseApi + url);
  }

  userProtected(data) {
    let url = "general/AuthLogin"
    return this.http.post(baseApi + url, data);
  }

  forgetEmailLockScreen(data) {
    let url = "general/AuthForget"
    return this.http.post(baseApi + url, data);
  }

  revalidateToken(body) {
    let url = "token/ResetJWT"
    return this.http.post(baseApi + url, body);
  }

  guestLoginService(body) {
    // const url = 'token/CreateGuestJWT'
    const url = 'token/GuestLogin'
    return this.http.post(baseApi + url, body);
  }


  checkCOR() {
    let url = "Currency/GetBaseCurrencyCode"
    return this.http.get(baseApi + url);
  }

  logoutAction() {


    let loginData = JSON.parse(Tea.getItem('loginUser'))
    loginData.IsLogedOut = true
    HashStorage.removeItem('loginUser')
    Tea.setItem('loginUser', JSON.stringify(loginData))

    const data = {
      PrimaryEmail: loginData.PrimaryEmail,
      UserLoginID: loginData.UserLoginID,
      LogoutDate: new Date().toLocaleString(),
      LogoutRemarks: ""
    }

    this.userLogOut(data).subscribe(res => {
    })
    this._dataService.reloadHeader.next(true)
  }

  aesCheck(data) {
    const url = 'token/CreateGuestJWT_O'
    return this.http.post(baseApi + url, data);
  }

}

export interface JWTObj {
  token: string
  refreshToken: string
}
