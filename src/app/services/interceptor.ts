import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { AuthService, JWTObj } from './authservice/auth.service';
import { GuestService } from '../shared/setup/jwt.injectable';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { flatMap } from 'rxjs/operators';
import 'rxjs/add/operator/do';
import { ToastrService } from 'ngx-toastr';
import { sessionExpMsg } from '../shared/constants';

@Injectable()
export class Interceptor implements HttpInterceptor {
    private refreshTokenInProgress = false;
    // Refresh Token Subject tracks the current token, or is null if no token is currently
    // available (e.g. refresh pending).
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
        null
    );
    constructor(
        public _auth: AuthService,
        public _jwtService: GuestService,
        public _router: Router,
        private _toastr: ToastrService
    ) { }

    intercept(mainRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        let request: HttpRequest<any>


        if (
            mainRequest.url.toLowerCase().includes('ip-api') ||
            mainRequest.url.toLowerCase().includes("resetjwt") ||
            mainRequest.url.toLowerCase().includes("guestjwt") ||
            mainRequest.url.toLowerCase().includes("stjwt_o") ||
            mainRequest.url.toLowerCase().includes("userlogout") ||
            mainRequest.url.toLowerCase().includes('validate')) {
            request = mainRequest.clone()
            if (mainRequest.url.toLowerCase().includes('refresh')) {
                request = this.addEncodeURLHeader(request)
            }
        } else {
            request = this.addAuthenticationToken(mainRequest)
        }


        return next.handle(request).catch(error => {

            const token: string = this._jwtService.getJwtToken()
            const refreshToken: string = this._jwtService.getRefreshToken()

            // We don't want to refresh token for some requests like login or refresh token itself
            // So we verify url and we throw an error if it's the case
            if (
                request.url.toLowerCase().includes("validate") ||
                request.url.toLowerCase().includes("resetjwt") ||
                request.url.toLowerCase().includes("guestjwt") ||
                !this._jwtService.getJwtToken()
            ) {
                if (request.url.toLowerCase().includes("resetjwt")) {
                    const { title, text } = sessionExpMsg
                    setTimeout(() => {
                        this._toastr.warning(text, title);
                    }, 0);
                    this._jwtService.sessionRefresh('').then((res)=>{
                      this._router.navigate(['login']);
                    })
                }
                return Observable.throw(error);
            }

            if (error.status !== 401) {
                return Observable.throw(error);
            }

            if (this.refreshTokenInProgress) {
                return this.refreshTokenSubject
                    .filter(result => result !== null)
                    .take(1)
                    .switchMap(() => next.handle(this.addAuthenticationToken(request)));
            } else {
                this.refreshTokenInProgress = true;
                this.refreshTokenSubject.next(null);
                const refreshObj: JWTObj = {
                    token,
                    refreshToken
                }
                return this._auth.revalidateToken(refreshObj).flatMap((tokenResp: any) => {
                    this._jwtService.removeTokens()
                    this.refreshTokenInProgress = false;
                    this._jwtService.saveJwtToken(tokenResp.token)
                    this._jwtService.saveRefreshToken(tokenResp.refreshToken)
                    this.refreshTokenSubject.next(tokenResp.token);
                    return next.handle(this.addAuthenticationToken(mainRequest));
                })
            }
        })
    }

    addAuthenticationToken(request) {
        // Get access token from Local Storage
        const accessToken = this._jwtService.getJwtToken();

        // If access token is null this means that user is not logged in
        // And we return the original request
        if (!accessToken) {
            return request;
        }

        // We clone the request, because the original request is immutable
        return request.clone({
            setHeaders: {
                Authorization: 'Bearer ' + this._jwtService.getJwtToken()
            }
        });
    }

    addEncodeURLHeader(request) {
        return request.clone({
            setHeaders: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    }
}
