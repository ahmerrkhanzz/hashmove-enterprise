import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-cookie-bar",
  templateUrl: "./cookie-bar.component.html",
  styleUrls: ["./cookie-bar.component.scss"],
})
export class CookieBarComponent implements OnInit {
  // public isCacheStored = true;
  constructor() {}

  ngOnInit() {
    // this.getCookie();
  }

  setCookie() {
    setTimeout(() => {
      const cookieInner = document.querySelector(".cookie-law-info-bar");
      const cookieMain = document.querySelector("app-cookie-bar");

      localStorage.setItem('cookiesPopup', 'hidePopup');

      if (localStorage.getItem('cookiesPopup')) {
        cookieInner.classList.add("slideOutDown");
        setTimeout(function () {
          this.isCacheStored = false;
          cookieInner.classList.add("hidePopup");
          cookieMain.classList.add("hidePopup");
        }, 500);
      } else {
        // do something
      }
    }, 50);


  }
}
