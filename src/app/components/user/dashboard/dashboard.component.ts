import { Component, OnInit, ViewEncapsulation, OnDestroy, EventEmitter, Output, Input, SimpleChange, OnChanges, SimpleChanges } from '@angular/core';
import { UserService } from "../user-service";
import { ToastrService } from "ngx-toastr";
import * as moment from 'moment';
import { NgbModal, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap'
import { RegDialogComponent } from "../../../shared/dialogues/reg-dialog/reg-dialog.component";
import { DataService } from "../../../services/commonservice/data.service";
import { Router, ActivatedRoute } from "@angular/router";
import { BookingList } from "../../../interfaces/user-dashboard";
import { BookingDetails } from '../../../interfaces/bookingDetails';
import { Tea, HashStorage, lastElementsOfArr, compareValues, loading, removeDuplicateCurrencies, startElementsOfArr, encryptBookingID } from '../../../constants/globalfunctions';
import { baseExternalAssets } from "../../../constants/base.url";
import { PaginationInstance } from 'ngx-pagination';
import { CurrencyDetails, ExchangeRate, Rate } from '../../../interfaces/currencyDetails';
import { HttpErrorResponse } from '@angular/common/http';
import { DropDownService } from '../../../services/dropdownservice/dropdown.service';
import { SelectedCurrency } from '../../../shared/currency-dropdown/currency-dropdown.component';
import { JsonResponse } from '../../../interfaces/JsonResponse';
import { CurrencyControl } from '../../../shared/currency/currency.injectable';
import { currErrMsg } from '../../../shared/constants';
import { CodeValMst } from '../reports/resports.interface';
import { CustomerSettings } from '../../../interfaces/customerSettings';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  sub: any;
  public valuesObj: object = {
    totalbookings: 0,
    totalUsers: 0,
    isVerified: true
  }
  // @Input() userDataFromApi: any;
  @Output() messageEvent = new EventEmitter<object>();

  loading: boolean = false;
  userItem: any
  dashResponse: any
  resp: any;
  resp2: any;
  userName: string = ''
  welcomeStatus: string = ''
  usersCount: string = 'user'
  isLastLogin: boolean = false;
  SearchInput;

  // Pagination variables decleration start



  public maxSize: number = 7;
  public customerSettings: CustomerSettings;
  public directionLinks: boolean = true;
  public autoHide: boolean = false;
  public config: PaginationInstance = {
    id: 'advance',
    itemsPerPage: 100,
    currentPage: 1
  };

  public labels: any = {
    previousLabel: '',
    nextLabel: '',
  };
  //Pagination End

  public totalUsers: number;
  public isVerified: boolean = false;
  public dashboardData: any = [];
  public publishYear;

  bookingList: BookingList[]
  currentBookings: BookingList[]
  savedBookings: BookingList[]
  totalBookings: BookingList[];
  bookingDetails: BookingDetails

  userData = {
    isAdmin: true,
    isVerified: true,
    userEmail: '',
    ipAddress: '0.0.0.0',
    isCorporateUser: false
  }

  bookingSummary = {
    CurrentBookingCount: 0,
    SavedBookingCount: 0,
    TotalBookingCount: 0,
  }

  billingSummary = {
    BillingTillDate: 0,
    BillingCurrencyID: 101,
    BillingCurrencyCode: "AED",
  }

  walletSummary = {
    WalletBalance: 0,
    WalletCurrencyID: 0,
    WalletCurrencyCode: "AED",
  }

  loginLogs = {
    LastLoginDate: '',
    LastLoginCountryID: null,
    LastLoginCountryName: '',
    LastLoginIpAddress: '',
    CompanyUserCount: 0,
    loggedDays: 0
  }

  //Curency Dropdown objects and variables
  public sortedCountryName: string;
  public sortedCountryFlag: string;
  public sortedCurrencyID: number = this._currencyControl.getCurrencyID();
  public currencyList: CurrencyDetails[];
  public selectedBooking: string = 'Sea Bookings'
  public sameCurrency: boolean = false
  public currentSelectedCurrency: SelectedCurrency
  public isDashDataLoaded: boolean = false
  public hasDeleteRights: boolean = false;
  public bookingTypeList: Array<CodeValMst> = []

  constructor(
    private _http: UserService,
    private _toast: ToastrService,
    private _modalService: NgbModal,
    private _dataService: DataService,
    private _router: Router,
    private _activeRoute: ActivatedRoute,
    private _dropDownService: DropDownService,
    private _currencyControl: CurrencyControl
  ) { }

  ngOnInit() {
    let date = new Date();
    this.publishYear = date.getFullYear()
    this.isDashDataLoaded = false
    this.customerSettings = JSON.parse(HashStorage.getItem('customerSettings'))
    this._dropDownService.getMstCodeVal('MODE_OF_BOOKING').subscribe((res: any) => {
      this.bookingTypeList = res
    }, error => {
    })

    this._dataService.currentDashboardData.subscribe(data => {
      if (data !== null) {
        if (!this.isDashDataLoaded) {
          this.dashboardData = data;
          this.setUserData();
          this.isDashDataLoaded = true
          this.setCurrencyList()
        }
      }
    });
  }

  async setUserData() {
    loading(true);
    this.userItem = JSON.parse(Tea.getItem("loginUser"));
    if (!this.userItem.IsAdmin && this.userItem.IsCorporateUser && this.userItem.IsVerified) {
      this.hasDeleteRights = false;
    } else {
      this.hasDeleteRights = true;
    }
    if (this.dashboardData.BookingDetails) {

      this.bookingList = this.dashboardData.BookingDetails;


      this.bookingList.map(booking => {
        booking.ContainerLoadTypeList = this.getContainerLoadTypeList(booking.ContainerLoadType)
      })
      this.currentBookings = this.bookingList.filter(x => x.ShippingModeCode.toLowerCase() === 'sea');
      this.currentBookings = startElementsOfArr(this.currentBookings, 5)
      this.savedBookings = this.bookingList.filter(x => x.ShippingModeCode.toLowerCase() === 'warehouse');
      this.savedBookings = startElementsOfArr(this.savedBookings, 5)
      this.totalBookings = this.bookingList.filter(x => x.ShippingModeCode.toLowerCase() === 'air');
      this.totalBookings = startElementsOfArr(this.totalBookings, 5)

      // this.totalBookings.sort(compareValues('BookingID', "desc"));


      loading(false);

      this.walletSummary.WalletCurrencyCode = this.dashboardData.WalletCurrencyCode

      if (this.dashboardData.BillingCurrencyCode) {
        await this.selectedCurrency
        // this.billingSummary.BillingCurrencyCode = this.dashboardData.BillingCurrencyCode
        // this.billingSummary.BillingCurrencyID = this.dashboardData.BillingCurrencyID
        // this.billingSummary.BillingTillDate = this.dashboardData.BillingTillDate
      }

      if (this.dashboardData.LoginRank === 2) {
        this.loginLogs.LastLoginCountryID = this.dashboardData.LastLoginCountryID
        this.loginLogs.LastLoginCountryName = this.dashboardData.LastLoginCountryName
        this.loginLogs.LastLoginDate = this.dashboardData.LastLoginDate
        this.loginLogs.LastLoginIpAddress = this.dashboardData.LastLoginIpAddress

        this.welcomeStatus = "Welcome back!"
        this.isLastLogin = true

      } else {
        this.welcomeStatus = "Welcome !"
        this.isLastLogin = false
      }

      if (this.dashboardData.CompanyUserCount > 1) {
        this.usersCount = 'users'
      } else {
        this.usersCount = 'user'
      }

      if (this.billingSummary.BillingCurrencyCode.toLowerCase() === this._currencyControl.getBaseCurrencyCode().toLowerCase()) {
        this.sameCurrency = true
      } else {
        this.sameCurrency = false
      }

    } else {
      loading(false)
      this.bookingList = [];
      loading(false);
    }
    if (!this.userItem.IsVerified) {
      this.valuesObj = {
        isVerified: false
      }
      this.messageEvent.emit(this.valuesObj);
      loading(false);
    }
    this.userName = this.userItem.FirstName
    this.welcomeStatus = 'welcome';
    this.userData.isAdmin = this.userItem.IsAdmin;
    this.userData.isVerified = this.userItem.IsVerified;
    this.userData.userEmail = this.userItem.PrimaryEmail;
    this.userData.isCorporateUser = this.userItem.IsCorporateUser;

    if (this.dashboardData.LoginRank === 2) {
      this.loginLogs.LastLoginCountryID = this.dashboardData.LastLoginCountryID
      this.loginLogs.LastLoginCountryName = this.dashboardData.LastLoginCountryName
      this.loginLogs.LastLoginDate = this.dashboardData.LastLoginDate
      this.loginLogs.LastLoginIpAddress = this.dashboardData.LastLoginIpAddress

      this.welcomeStatus = "Welcome back!"
      this.isLastLogin = true

    } else {
      this.welcomeStatus = "Welcome !"
      this.isLastLogin = false
    }

    if (this.dashboardData.CompanyUserCount > 1) {
      this.usersCount = 'Users'
    } else {
      this.usersCount = 'User'
    }

  }

  getContainerLoadTypeList(containerLoadType: string) {
    let strCont:any = ''
    try {
      strCont = containerLoadType.split('|')
    } catch (error) {
      strCont = ''
    }
    return strCont
  }

  resendEmailRequest() {
    this._http.resendEmail(this.userItem.UserID).subscribe(res => {
      this.resp = res
      if (this.resp.returnId > 0) {
        this._toast.success(this.resp.returnText, this.resp.returnStatus);
      } else {
        this._toast.warning(this.resp.returnText, this.resp.returnStatus);
      }
    })
  }
  // onPageChange(number: any) {
  //   this.config.currentPage = number;
  // }
  tabChange() {
    this.config.currentPage = 1;
  }

  // getPageSize(): number {
  //   return this.mainSearchResult.length
  // }
  openRegister() {
    this._dataService.hideLogin.next(true)
    const modalRef = this._modalService.open(RegDialogComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    let obj = {
      UserID: this.dashboardData.UserID,
      CompanyName: this.dashboardData.CompanyName
    }

    modalRef.componentInstance.shareUserObject = obj;
    modalRef.result.then((result) => {
      if (result === 'success') {
        this.getDashboardData(obj.UserID);
      }
    });
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }

  //Tabs in home
  // shipTab
  // warehouseTab
  // trackShipTab
  // partnerTab

  newSearch() {
    this._dataService.tabCallFromDashboard = 'shipTab'
    this._dataService.isTabCallTrue = true
    this._router.navigate(['home']);
  }

  newWareHoue() {
    this._dataService.tabCallFromDashboard = 'warehouseTab'
    this._dataService.isTabCallTrue = true
    this._router.navigate(['home']);
  }

  // setCurrentBookings() {
  //   this.currentBookings = this.bookingList
  //     .filter(x => x.BookingTab.toLocaleLowerCase() === "Current".toLocaleLowerCase());
  // }

  // setSavedBookings() {
  //   this.savedBookings = this.bookingList
  //     .filter(x => x.BookingTab === 'Saved');
  // }

  // setTotalBookings() {
  //   this.totalBookings = this.bookingList.filter(x => x.BookingTab === 'Completed');
  // }

  private icons = {
    SEA: 'icons_cargo_ship_grey.svg',
    DOOR: 'Icons_Location.svg',
    LAND: 'icons_cargo_truck_grey.svg',
    AIR: 'icon_plane.svg',
    WAREHOUSE: 'Icons_Warehousing_Grey.svg'
  }

  getImageForRoute(type: string) {
    if (type.toUpperCase() === "SEA") {
      return this.icons.SEA;
    } else if (type.toUpperCase() === "LAND") {
      return this.icons.LAND;
    } else if (type.toUpperCase() === "AIR") {
      return this.icons.AIR;
    } else if (type.toUpperCase() === "WAREHOUSE") {
      return this.icons.WAREHOUSE;
    } else if (type.toUpperCase() === "DOOR") {
      return this.icons.DOOR;
    }
  }

  tonavigate(url) {
    this._router.navigate([url]);
  }

  viewBookingDetails(bookingId) {
    const safeBookingId = encryptBookingID(bookingId)
    this._router.navigate(['/user/booking-detail', safeBookingId]);
  }

  getUserImage(userImageName: string): string {
    let imagePath: string =
      // baseExternalAssets + "images/80x80/" + userImageName;
      baseExternalAssets + userImageName.replace('large', 'small');

    return imagePath;
  }
  getDashboardData(UserID) {
    this._http.getDashBoardData(UserID).subscribe(res => {
      this.resp = res
      this.dashboardData = JSON.parse(this.resp.returnText);
      this._dataService.setDashboardData(this.dashboardData);
      if (this.dashboardData.BookingDetails) {
        this.bookingList = this.dashboardData.BookingDetails;
      } else {
        this.bookingList = [];
      }
    })
  }


  setCurrencyList() {
    // this._dropDownService.getCurrency().subscribe((res: any) => {
    //   let currencyList = res;
    //   currencyList = removeDuplicateCurrencies(currencyList)
    //   currencyList.sort(compareValues('title', "asc"));
    //   this.currencyList = currencyList;
    //   this.selectedCurrency();
    // })
    this.currencyList = JSON.parse(HashStorage.getItem('currencyList'))
    this.selectedCurrency();
  }

  async selectedCurrency() {
    try {
      let loginUser = JSON.parse(Tea.getItem('loginUser'))
      let currencyId: number = loginUser.CurrencyID
      // let selectedCurrencyCountryId: number = loginUser.CurrencyOwnCountryID

      let seletedCurrency: CurrencyDetails

      // if (selectedCurrencyCountryId && selectedCurrencyCountryId > 0) {
      //   seletedCurrency = this.currencyList.find(obj =>
      //     (obj.id == currencyId && JSON.parse(obj.desc).CountryID === selectedCurrencyCountryId)
      //   );
      // } else {
      seletedCurrency = this.currencyList.find(obj => obj.id == currencyId)
      // }

      let currentCurrency: SelectedCurrency = {
        sortedCurrencyID: seletedCurrency.id,
        sortedCountryFlag: seletedCurrency.imageName.toLowerCase(),
        sortedCountryName: seletedCurrency.code,
        sortedCountryId: JSON.parse(seletedCurrency.desc).CountryID
      }


      if (this.billingSummary.BillingCurrencyID) {
        await this.setProviderRates(this.billingSummary.BillingCurrencyID, currentCurrency)
      } else {
        await this.setProviderRates(this._currencyControl.getBaseCurrencyID(), currentCurrency)
      }
    } catch (error) {
      console.warn('Could Not set Currency', error);
    }
  }

  currencyFilter($currency: SelectedCurrency) {
    // if (this.billingSummary.BillingCurrencyID) {
    //   this.setProviderRates(this._currencyControl.getBaseCurrencyID(), $currency)
    // } else {
    this.setProviderRates(this._currencyControl.getBaseCurrencyID(), $currency)
    // }
  }

  async setProviderRates(baseCurrencyID: number, currency: SelectedCurrency) {

    this.loading = true;



    try {

      const res: JsonResponse = await this._dropDownService.getExchangeRateList(baseCurrencyID).toPromise()
      let exchangeData: ExchangeRate = res.returnObject
      let exchnageRate: Rate = exchangeData.rates.filter(rate => rate.currencyID === currency.sortedCurrencyID)[0]
      const newBillPrice: number = this._currencyControl.getNewPrice(this.dashboardData.BillingTillDate, exchnageRate.rate)
      const newWalletPrice: number = this._currencyControl.getNewPrice(this.walletSummary.WalletBalance, exchnageRate.rate)
      this.currentSelectedCurrency = currency
      this.billingSummary.BillingCurrencyID = currency.sortedCurrencyID
      this.billingSummary.BillingTillDate = newBillPrice
      this.billingSummary.BillingCurrencyCode = currency.sortedCountryName
      this.walletSummary.WalletCurrencyID = currency.sortedCurrencyID
      this.walletSummary.WalletBalance = newWalletPrice
      this.walletSummary.WalletCurrencyCode = currency.sortedCountryName;
      this.loading = false;
      if (this.billingSummary.BillingCurrencyCode.toLowerCase() === this._currencyControl.getBaseCurrencyCode().toLowerCase()) {
        this.sameCurrency = true
      } else {
        this.sameCurrency = false
      }

      if (this.billingSummary.BillingCurrencyCode.toLowerCase() === this._currencyControl.getBaseCurrencyCode().toLowerCase()) {
        this.sameCurrency = true
      } else {
        this.sameCurrency = false
      }

    } catch (err) {
      this.loading = false;
      const { title, text } = currErrMsg
      this._toast.error(text, title)
    }
  }

  tabChangeEvent($event) {
    this._dataService.currentBookingTab.next($event.nextId)
  }

}
