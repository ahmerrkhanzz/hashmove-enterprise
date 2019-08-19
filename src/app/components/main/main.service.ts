import { Injectable } from '@angular/core';
import { baseApi } from '../../constants/base.url'
import { HttpClient } from '@angular/common/http';

@Injectable()
export class MainService {

  constructor(private http: HttpClient) { }

  getProvidersCount() {
    let url: string = "provider/getprovidercount";
    return this.http.get(baseApi + url);
  }

}
