import { Injectable } from '@angular/core';
import { baseApi } from '../../../constants/base.url'
import { HttpClient } from '@angular/common/http';


@Injectable()
export class UspSectionService {

  constructor(private http: HttpClient) { }

  getUsps() {
    let url: string = "MstCodeVal/GetMstCodeValMultipleList/USP_SECTION";
    return this.http.get(baseApi + url);
  }

}
