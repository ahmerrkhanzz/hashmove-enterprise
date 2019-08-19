import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DropDownService } from './services/dropdownservice/dropdown.service';
import { setDefaultCountryCode, HashStorage, Tea, decryptStringAES, encryptStringAES, AESModel, removeDuplicateCurrencies, compareValues, loading, getImagePath, ImageSource, ImageRequiredSize } from './constants/globalfunctions';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { CurrencyDetails, Rate } from './interfaces/currencyDetails';
import { DataService } from './services/commonservice/data.service';
import '../assets/scss/_loader.css';
import { VERSION } from '../environments/version'
import { AuthService, JWTObj } from './services/authservice/auth.service';
import { CurrencyControl } from './shared/currency/currency.injectable';
import { SetupService } from './shared/setup/setup.injectable';
import * as moment from 'moment'
import { FormControl } from '@angular/forms';
import { CustomerSettings } from './interfaces/customerSettings';
import { GuestService } from './shared/setup/jwt.injectable';
import { CookieService } from './services/cookies.injectable';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(NgScrollbar) scrollRef: NgScrollbar;
  static SCROLL_REF_MAIN: any
  public static version = VERSION;
  public currencyList = []
  public themeWrapper = document.querySelector('body');
  public customerSettings: CustomerSettings
  public header: boolean = false;

  constructor(
    private _toast: ToastrService,
    private _router: Router,
    private _dropDownService: DropDownService,
    private _dataService: DataService,
    private _authService: AuthService,
    private _currencyControl: CurrencyControl,
    private _setup: SetupService,
    private _cookieService: CookieService
    // private _guestLogin: GuestService
  ) { }

  ngOnInit() {
    this.getCustomerSettings(GuestService.GET_CUST_PROFILE_ID())
    let userData = JSON.parse(Tea.getItem('loginUser'));

    if (userData && userData.IsLogedOut || !userData) {
      document.getElementById('preloader2').classList.add('logout');
    }
    localStorage.removeItem('protectorUserlogIn')
    HashStorage.removeItem('tempSearchCriteria')
    // let result = browser();
    // let browserClass = document.querySelector('body');
    // if (result.name === "edge") {
    //   browserClass.classList.add('edge')
    // } else {
    //   browserClass.classList.remove('edge')
    // }

    this._dataService.reloadCurrencyConfig.subscribe((res) => {
      if (res) {
        this.setCurrencyConfig()
      }
    })

    this.setCurrencyConfig()

    this._router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe((event: NavigationEnd) => {
        if (this.scrollRef) {
          this.scrollRef.scrollYTo(0, 20);
        }
      });
    this.setCurrencyList()

  }

  ngAfterViewInit() {
    setTimeout(() => {
      AppComponent.SCROLL_REF_MAIN = this.scrollRef
    }, 0);
  }


  setCurrencyConfig() {
    this._dropDownService.getBrowserLocation().subscribe((res: any) => {
      setDefaultCountryCode(res.countryCode);
      localStorage.setItem('country', res.country);
      this._setup.setBaseCurrencyConfig()
    }, (error: HttpErrorResponse) => {
      localStorage.setItem("country", 'Pakistan');
      this._setup.setBaseCurrencyConfig()
    })
    this._dropDownService.getBaseCurrency().subscribe((res: any) => {
      this.setbaseCurrency(res)
    }, (err: HttpErrorResponse) => {
    })
  }

  setbaseCurrency(res) {
    if (res) {
      this._currencyControl.setBaseCurrencyID(parseInt(res.CurrencyID))
      this._currencyControl.setBaseCurrencyCode(res.CurrencyCode)
    } else {
    }
  }

  setCurrencyList() {
    this._dropDownService.getCurrency().subscribe((res: any) => {
      let currencyList = res;
      currencyList = removeDuplicateCurrencies(currencyList)
      currencyList.sort(compareValues('title', "asc"));
      this.currencyList = currencyList;
      HashStorage.setItem('currencyList', JSON.stringify(this.currencyList))
    })
  }

  getCustomerSettings(customer: string) {
    if (!(customer.length > 0)) {
      this._router.navigate(['not-found'])
      return
    }
    loading(true)
    this._dropDownService.getCustomerSettings(customer).subscribe((res: any) => {
      if (!res.returnObject) {
        this.customerSettings = {
          customerCode: 'hashmove',
          customerFooterColor: '#1a1c27',
          customerFooterTextColor: '#97a5b1',
          customerForeColorPrimary: '#fff',
          customerForeColorSecondary: '#000',
          customerID: 0,
          customerPortalTitle: 'Digital Logistisc Portal',
          customerPrimaryBGImage: '../assets/images/bg-img.jpg',
          customerPrimaryColor: '#0082d6',
          customerPrimaryGradientColor: '#fff',
          customerPrimaryLogo: '../assets/images/hm-symbol-w.svg',
          customerSecondarGradientColor: '#37b7f9',
          customerSecondaryBGImage: '../assets/images/bg-img.jpg',
          customerSecondaryColor: '#daecf9',
          customerSecondaryLogo: '../assets/images/hm-symbol.svg',
          customerType: 'COMPANY',
          cutomerBannerTabsOverlay: '#000',
          customerPrimaryLogoHeight: "",
          customerPrimaryLogoWidth: "80px",
          customerSecondaryLogoHeight: "",
          customerSecondaryLogoWidth: "",
          isAirCityRequired: true,
          isAirDoorRequired: true,
          isAirPortRequired: true,
          isBookShipmentRequired: true,
          isBookWarehouseRequired: true,
          isGroundCityRequired: true,
          isGroundDoorRequired: true,
          isGroundPortRequired: true,
          isPartnerWithUsRequired: true,
          isSeaCityRequired: true,
          isSeaDoorRequired: true,
          isSeaPortRequired: true,
          isTrackShipmentRequired: true,
          portalName: 'ENTERPRISE',
        }
      } else {
        let response = res.returnObject
        response.portalName = 'ENTERPRISE'
        this.customerSettings = response
      }
      HashStorage.setItem('customerSettings', JSON.stringify(this.customerSettings))
      this.globalOverride(this.customerSettings)
      loading(false)
    }, (err) => {
      loading(false)
    })
  }

  globalOverride(stylesheet) {
    if (stylesheet.customerPrimaryColor) {
      this.themeWrapper.style.setProperty('--customerPrimaryColor', stylesheet.customerPrimaryColor);
    }
    if (stylesheet.customerSecondaryColor) {
      this.themeWrapper.style.setProperty('--customerSecondaryColor', stylesheet.customerSecondaryColor);
    }
    if (stylesheet.customerForeColorPrimary) {
      this.themeWrapper.style.setProperty('--customerForeColorPrimary', stylesheet.customerForeColorPrimary);
    }
    if (stylesheet.customerForeColorSecondary) {
      this.themeWrapper.style.setProperty('--customerForeColorSecondary', stylesheet.customerForeColorSecondary);
    }
    if (stylesheet.customerFooterColor) {
      this.themeWrapper.style.setProperty('--customerFooterColor', stylesheet.customerFooterColor);
    }
    if (stylesheet.customerFooterTextColor) {
      this.themeWrapper.style.setProperty('--customerFooterTextColor', stylesheet.customerFooterTextColor);
    }
    if (stylesheet.customerPrimaryGradientColor) {
      this.themeWrapper.style.setProperty('--customerPrimaryGradientColor', stylesheet.customerPrimaryGradientColor);
    }
    if (stylesheet.customerSecondarGradientColor) {
      this.themeWrapper.style.setProperty('--customerSecondarGradientColor', stylesheet.customerSecondarGradientColor);
    }
    if (stylesheet.customerPrimaryLogoWidth) {
      this.themeWrapper.style.setProperty('--customerPrimaryLogoWidth', stylesheet.customerPrimaryLogoWidth);
    }
  }

  getUIImage($image: string) {
    return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
  }

  ngOnDestroy() { }

  async aesDebug() {
    const guestObject = {
      password: '123456',
      loginUserID: 'skashan@texpo.com',
      CountryCode: ' PK',
      LoginIpAddress: "0.0.0.0",
      LoginDate: moment(Date.now()).format(),
      LoginRemarks: "asdasdas asdasd 12312312 ^^*( 123123 @@@"
    }

    const currDateTime = moment(Date.now()).format().substring(0, 16)
    const toSend: AESModel = {
      d1: currDateTime,
      d2: JSON.stringify(guestObject),
      d3: ''
    }
    const encObject = encryptStringAES(toSend)
    this._authService.aesCheck(encObject).subscribe(async (resp: AESModel) => {
      const decrypted = await decryptStringAES(resp)
    }, (error: HttpErrorResponse) => {
    })

  }

  static clearStorage() {
    let currVersion = AppComponent.version.version;
    let oldVersion = HashStorage.getItem('version');
    if (!oldVersion || oldVersion !== currVersion) {
      localStorage.clear();
      HashStorage.setItem('version', AppComponent.version.version);
      try {
        CookieService.S_deleteCookie('providerList')
        CookieService.S_deleteCookie('paymentList')
        CookieService.S_deleteCookie('experienceResults')
        CookieService.S_deleteCookie('fromPriceRange')
        CookieService.S_deleteCookie('toPriceRange')
        CookieService.S_deleteCookie('isFiveChecked')
        CookieService.S_deleteCookie('isTenChecked')
        CookieService.S_deleteCookie('isTwentyChecked')
        CookieService.S_deleteCookie('isMoreChecked')
        CookieService.S_deleteCookie('ship-page')
      } catch (error) { }
    }
  }
}
