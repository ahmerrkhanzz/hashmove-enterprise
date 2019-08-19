import { Injectable } from '@angular/core';

@Injectable()
export class CookieService {

  constructor() { }

  public getCookie(name: string): string | null {
    let ca: Array<string> = document.cookie.split(';');
    let caLen: number = ca.length;
    let cookieName = `${name}=`;
    let c: string;

    for (let i: number = 0; i < caLen; i += 1) {
      c = ca[i].replace(/^\s+/g, '');
      if (c.indexOf(cookieName) == 0) {
        return c.substring(cookieName.length, c.length);
      }
    }
    return null;
  }

  public deleteCookie(name) {
    this.setCookie(name, "", -1);
  }

  public setCookie(name: string, value: string, expireDays: number, path: string = "") {
    let d: Date = new Date();
    d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
    let expires: string = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + "; " + expires + (path.length > 0 ? "; path=" + path : "");
  }

  public deleteCookies() {
    try {
      this.deleteCookie('providerList')
      this.deleteCookie('paymentList')
      this.deleteCookie('experienceResults')
      this.deleteCookie('fromPriceRange')
      this.deleteCookie('toPriceRange')
      this.deleteCookie('isFiveChecked')
      this.deleteCookie('isTenChecked')
      this.deleteCookie('isTwentyChecked')
      this.deleteCookie('isMoreChecked')
      this.deleteCookie('ship-page')
    } catch (error) {

    }
    // var res = document.cookie;
    // var multiple = res.split(";");
    // for (var i = 0; i < multiple.length; i++) {
    // var key = multiple[i].split("=");
    // document.cookie = key[0] + " =; expires = Thu, 01 Jan 1970 00:00:00 UTC";
    // }
    var cookies = document.cookie.split("; ");
    for (var c = 0; c < cookies.length; c++) {
      var d = window.location.hostname.split(".");
      while (d.length > 0) {
        var cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';
        var p = location.pathname.split('/');
        document.cookie = cookieBase + '/';
        while (p.length > 0) {
          document.cookie = cookieBase + p.join('/');
          p.pop();
        };
        d.shift();
      }
    }
  }

  static S_deleteCookie(name: string) {
    const value = "";
    const expireDays = -1;
    const path = ""
    let d: Date = new Date();
    d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
    let expires: string = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + "; " + expires + (path.length > 0 ? "; path=" + path : "");
  }

}
