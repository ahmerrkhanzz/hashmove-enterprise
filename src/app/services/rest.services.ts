import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs';
import { saveJwtToken, saveRefreshToken, getJwtToken, getRefreshToken } from "../constants/auth";

@Injectable()
export class APICaller {

    private header = {
        "Authorization": '',
        "Cache-Control": "cache",
        "content-type": "application/json",
    }


    constructor(private _http: HttpClient) { }


    ANG_HTTP(request: APIRequest) {

        const token = getJwtToken()
        if (token) {
            this.header.Authorization = 'Bearer ' + token
        } else {
            this.header.Authorization = ''
        }

        if (request.method.toLowerCase() === 'get') {

            return this._http.get(request.url, { headers: this.header })

        } else if (request.method.toLowerCase() === 'post') {

            return this._http.post(request.url, request.body, { headers: this.header })

        } else if (request.method.toLowerCase() === 'put') {

            return this._http.put(request.url, { headers: this.header })

        } else if (request.method.toLowerCase() === 'delete') {

            return this._http.delete(request.url, { headers: this.header })

        }
    }

}

export interface APIRequest {
    method: string,
    url: string,
    body?: any,
    headers?: any
}