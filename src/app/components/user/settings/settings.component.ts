import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { trigger, style, animate, transition } from '@angular/animations';
import { HttpErrorResponse } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";

import { Tea, loading, removeDuplicateCurrencies, HashStorage } from "../../../constants/globalfunctions";
import { DropDownService } from "../../../services/dropdownservice/dropdown.service";
import { DataService } from "../../../services/commonservice/data.service";
import { UserService } from "../user-service";
import {
  UserSettingsProfile, UserNotification, UserDealNotification, ServiceType, ShippingFrequency
} from "../../../interfaces/user-dashboard";
import { Observable } from "rxjs";
import { UserDocument } from "../../../interfaces/document.interface";
import { LoginUser } from "../../../interfaces/user.interface";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ transform: 'translateY(-10%)', opacity: 0 }),
          animate('300ms', style({ transform: 'translateY(0)', opacity: 1 }))
        ]),
        transition(':leave', [
          style({ transform: 'translateY(0)', opacity: 1 }),
          animate('300ms', style({ transform: 'translateY(-10%)', opacity: 0 }))
        ])
      ]
    )
  ],
})

export class SettingsComponent implements OnInit {


  public userProfile: UserSettingsProfile;
  private resp: any;

  //Notifications
  public notificationDealsDistinctList: UserDealNotification[];
  // public notificationDealsList: UserDealNotification[];
  public notificationDealsList: UserDealNotification[];
  public notificationModalList: UserDealNotification[];
  public notificationDistinctList: UserNotification[];
  public notificationList: UserNotification[];


  public routeSelectedImage;
  public routeSelect;

  public addRouteType: string = "Shipping";
  public serviceTypeList: ServiceType[];
  public addRouteTypeID: number = -1;
  //Notification End

  public loggedInUser: LoginUser;

  //Tab Config
  public activeTabId = "settings-profile";
  private tabIdList = {
    settings_profile: "settings-profile",
    settings_notification: "settings-notification",
    settings_documents: "settings-documents"
  };


  public shippingFreg: ShippingFrequency[];
  public companyTypeList = [];
  public companySizeList = [];
  public departmentList = [];
  public currencyList = []
  public countryList = [];
  public regionList = []
  public cityList = [];



  constructor(
    private _userService: UserService,
    private _toastr: ToastrService,
    private dropdownservice: DropDownService,
    private _dataService: DataService,
  ) { }

  ngOnInit() {
    this.loggedInUser = JSON.parse(Tea.getItem('loginUser'))
    this._dataService.updateUserDocsData.subscribe((res: Array<UserDocument>) => {
      if (res && res.length > 0) {
        this.userProfile.UserDocumentSetttings = res
      }
    })
    this.loadEssentials()
    this.currencyList = JSON.parse(HashStorage.getItem('currencyList'))
  }

  async loadEssentials() {
    loading(true);
    Observable.forkJoin([
      this.dropdownservice.getCountry(),
      this.dropdownservice.getCity(),
      this.dropdownservice.getRegions(),
      // this.dropdownservice.getCurrency(),
      this.dropdownservice.getDepartments(),
      this.dropdownservice.getCompanyType(),
      this.dropdownservice.getCompanySize(),
      this.dropdownservice.getShippingFreq()
    ]).subscribe(res => {
      //Country List

      let List: any = res[0];
      List.map(obj => {
        obj.desc = JSON.parse(obj.desc);
      });
      this.countryList = List;
      // this.flag(this.city, "city");
      //City List
      let cityList: any = res[1];
      this.cityList = cityList;
      //Region List
      let regionList: any = res[2];
      this.regionList = this.sortOrderByName(regionList);
      //Currenncy list
      // let currencyList: any = res[3];
      // currencyList = removeDuplicateCurrencies(currencyList)
      // this.currencyList = currencyList;
      //Department List
      let departmentList: any = res[3];
      this.departmentList = this.sortOrderByName(departmentList);
      //CompanyType List
      let companyTypeList: any = res[4];
      this.companyTypeList = this.sortOrderByName(companyTypeList);
      //CompanySize List
      let companySizeList: any = res[5];
      this.companySizeList = companySizeList;
      //Shipping Frequency
      let shippingFreg: any = res[6];
      this.shippingFreg = shippingFreg;
      loading(false)
      this.getUserDataFromService()
    });
  }


  getUserDataFromService() {
    loading(true)
    let UserData = JSON.parse(Tea.getItem("loginUser"));
    this._userService.getUserProfile(UserData.UserID).subscribe(res => {
      loading(false)
      this.resp = res;
      this.userProfile = this.resp.returnObject;
    });
  }

  sortOrderByName(array) {
    return array.sort(function (a, b) {
      var textA = a.title.toUpperCase();
      var textB = b.title.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
  }



  onTabChange(event: any) {
    this.activeTabId = event.nextId;
    if (this.activeTabId === this.tabIdList.settings_notification) {
      if (
        this.userProfile &&
        (this.userProfile.UserNotificationSetting === undefined ||
          this.userProfile.UserNotificationSetting === null)
      ) {
        loading(true);
        let userData = JSON.parse(Tea.getItem("loginUser"));
        this.setServiceType();
        this._userService.getNotificationSettings(userData.UserID).subscribe((res: any) => {
          this.userProfile.UserNotificationSetting = res.returnObject;
          loading(false)
        }, (error: HttpErrorResponse) => {
          this._toastr.error(error.message, "Error")
          loading(false)
        });
      }

    } else if (this.activeTabId === this.tabIdList.settings_documents) {
      if (this.userProfile && !this.userProfile.UserDocumentSetttings) {
        loading(true);
        let userData = JSON.parse(Tea.getItem("loginUser"));
        this.setServiceType();
        this._userService.getUserDocument(userData.UserID).subscribe((res: any) => {
          let respObject: UserDocument[] = res.returnObject;
          this.userProfile.UserDocumentSetttings = respObject
          loading(false)
        }, (error: HttpErrorResponse) => {
          this._toastr.error(error.message, "Error")
          loading(false)
        });
      }
    }
  }

  setServiceType() {
    this._userService.getServiceType().subscribe(
      (res: any) => {
        let resp: ServiceType[] = res;

        this.serviceTypeList = resp.filter(
          service =>
            service.serviceTypeCode.toLowerCase() === "SHPG".toLowerCase() ||
            service.serviceTypeCode.toLowerCase() === "WHNG".toLowerCase()
        );
      },
      (err: HttpErrorResponse) => {
        this._toastr.error(err.message, "Error");
      }
    );
  }

  profileUpdateEvent($userData: UserSettingsProfile) {
    const userProf: UserSettingsProfile = this.userProfile
    this.userProfile = $userData
    this.userProfile.UserNotificationSetting = userProf.UserNotificationSetting
    this.userProfile.UserDocumentSetttings = userProf.UserDocumentSetttings
  }

}