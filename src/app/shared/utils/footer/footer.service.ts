import { Injectable } from '@angular/core';
import { baseApi } from '../../../constants/base.url'
import { HttpClient } from '@angular/common/http';


@Injectable()
export class FooterService {

  constructor(private _http: HttpClient) { }

  notifyMe(data) {
    return this._http.post(baseApi + 'notifyme/post', data)
  }

  getAssociations() {
    return this._http.get(baseApi + 'associationwith/GetDropDownDetail/0')
  }

  getSocialLinks() {
    return this._http.get(baseApi + 'MstCodeVal/GetMstCodeValMultipleList/CONN_WITH_US')
  }

}
