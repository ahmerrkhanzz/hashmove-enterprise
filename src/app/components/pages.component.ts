import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { loading, HashStorage, getImagePath, ImageSource, ImageRequiredSize } from '../constants/globalfunctions';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CustomerSettings } from '../interfaces/customerSettings';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PagesComponent implements OnInit {
  public isCookeStored = true;

  public shippingObj: any;
  public containerObj: any;
  public homeFooter: boolean = false;
  public header: boolean = false;
  public customerSettings: CustomerSettings

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
    this.getCookie();
    try {
      this.customerSettings = JSON.parse(HashStorage.getItem("customerSettings"));
    } catch (error) {

    }

    this.homeFooter = (!this.router || !this.router.url || this.router.url == "/home" || this.router.url === "/home?mode=shipping" || this.router.url === "/home?mode=warehouse" || this.router.url === "/home?mode=air" || this.router.url === "/home?mode=truck") ? true : false;
    this.header = (this.router.url !== "/login") ? true : false;
    this.router.events
      .subscribe((event: NavigationEnd) => {
        this.homeFooter = (event.url === "/home" || event.url === "/home?mode=shipping" || event.url === "/home?mode=warehouse" || event.url === "/home?mode=air" || event.url === "/home?truck") ? true : false;
        this.header = (this.router.url !== "/login") ? true : false;
      });
  }

  getCookie() {
    setTimeout(function () {
      const cookieInner = document.querySelector(".cookie-law-info-bar");
      const cookieMain = document.querySelector("app-cookie-bar");
      if (localStorage.getItem('cookiesPopup')) {
        this.isCookeStored = false;
        cookieMain.classList.add("hidePopup");
        cookieInner.classList.add("hidePopup");
      } else {
        console.log('cookies not generat')
      }
    })
  }

  ngAfterViewInit() {
    loading(false);
  }

  getUIImage($image: string) {
    if (location.href.includes('login')) {
      return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original);
    } else {
      return ''
    }
  }


}
