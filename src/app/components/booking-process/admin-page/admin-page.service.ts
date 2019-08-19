import { Injectable } from '@angular/core';
import { baseApi } from '../../../constants/base.url'
import { HttpClient } from '@angular/common/http';


@Injectable()
export class AdminService {

  constructor(private _http: HttpClient) { }

  getPolygons() {
    let url = "groundLocation/GetAll"
    return this._http.get(baseApi + url)
  }

  setPolygons(data) {
    let url = "groundLocation/Post"
    return this._http.post(baseApi + url, data)
  }

}
