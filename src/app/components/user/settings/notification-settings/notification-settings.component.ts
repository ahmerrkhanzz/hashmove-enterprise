import { Component, OnInit, Input } from '@angular/core';
import { UserDealNotification, UserNotification, ServiceType, UserNotificationSetting } from '../../../../interfaces/user-dashboard';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../user-service';
import { Tea, cloneObject, loading, removeDuplicates } from '../../../../constants/globalfunctions';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit {

  public notificationDealsDistinctList: UserDealNotification[];
  // public notificationDealsList: UserDealNotification[];
  public notificationDealsList: UserDealNotification[];
  public notificationModalList: UserDealNotification[];
  public notificationDistinctList: UserNotification[];
  public notificationList: UserNotification[];

  public countryList = []


  public routeCity: any = {
    title: "",
    imageName: "",
    desc: "[]"
  };

  public routeSelectedImage;
  public routeSelect;

  public addRouteType: string = "Shipping";
  
  public addRouteTypeID: number = -1;
  public loggedInUser: any;
  //Notification End

  @Input() userNotificationSettings: UserNotificationSetting;
  @Input() cityList = []
  @Input() serviceTypeList: ServiceType[];

  constructor(
    private _userService: UserService,
    private _toastr: ToastrService,
    private _modalService: NgbModal
  ) { }

  ngOnInit() {
    this.loggedInUser = JSON.parse(Tea.getItem('loginUser'))
    this.setNotificationList()
  }


  notifClicked(notifType: string, notTypeID, isEmail, isSms, IsPushNot) {

    this.notificationList.forEach(elem => {
      if (
        elem.UserNotTypeCat.toLowerCase() === notifType.toLowerCase() &&
        elem.UserNotTypeID === notTypeID
      ) {
        if (isSms) {

          elem.IsSms = !elem.IsSms;
        }
        if (isEmail) {

          elem.IsEmail = !elem.IsEmail;
        }

        if (IsPushNot) {
          elem.IsPushNot = !elem.IsPushNot;
        }
        return;
      }
    });
  }

  _updateNotification() {
    let toSend: UserNotificationSetting = cloneObject(
      this.userNotificationSettings
    );
    toSend.UserDealNotification = this.notificationDealsList;
    toSend.UserNotification = this.notificationList;

    let userData = JSON.parse(Tea.getItem("loginUser"));

    loading(true);
    this._userService
      .setNotificationSettings(toSend, userData.UserID)
      .subscribe((res: any) => {
        loading(false);
        if (res.returnId > 0) {
          this._toastr.success("Successfully updated.", "Success");
        } else {
          this._toastr.error(res.returnText, "Failed");
        }

      });
  }

  checkForDeals(type: string) {
    if (type.toLowerCase() === "Deals".toLowerCase()) {
      return true;
    } else {
      return false;
    }
  }

  changeAllDeals() {
    this.userNotificationSettings.IsNotifyAllDeals = !this.userNotificationSettings.IsNotifyAllDeals;
  }

  addCityCountryShip(
    routePicker,
    serviceTypeName: string,
    serviceTypeID: number
  ) {
    this.addRouteType = serviceTypeName;
    this.addRouteTypeID = serviceTypeID;
    this._modalService.open(routePicker, { size: "lg", centered: true });
  }

  routeFlag(list, type) {
    if (typeof list == "object" && list.title && type == "route") {
      let description = JSON.parse(list.desc);
      this.routeSelect = this.countryList.find(
        item => item.id === description[0].CountryID
      );
    }
  }

  routeSearch = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .map(
        term =>
          !term || term.length < 3
            ? []
            : this.cityList.filter(
              v => v.title.toLowerCase().indexOf(term.toLowerCase()) > -1
            )
      );

  routeFormatter = (routeDet: {
    title: string;
    desc: string;
    imageName: string;
  }) => {
    this.routeCity.imageName = routeDet.imageName;
    this.routeCity.title = routeDet.title;
    this.routeCity.desc = routeDet.desc;
    this.addRoute(routeDet);
    // return x.title;
  };

  addRoute(city) {
    let cityDesc = JSON.parse(city.desc);

    let tmpCity: UserDealNotification = {
      CountryCode: cityDesc[0].CountryCode,
      CountryFlag: city.imageName,
      CountryID: cityDesc[0].CountryID,
      CountryName: cityDesc[0].CountryName,
      CountryShortName: cityDesc[0].CountryCode,
      LoginID: this.loggedInUser.LoginID,
      ServiceTypeID: this.addRouteTypeID,
      ServiceTypeName: this.addRouteType,
      UserDealNotificationID: 0,
      UserID: this.loggedInUser.UserID
    };

    if (!this.checkCountry(tmpCity.CountryID, this.addRouteTypeID)) {
      this.notificationDealsList.push(tmpCity);
      let newDeals = cloneObject(this.notificationDealsList);
      this.notificationDealsList = newDeals;
    }
  }

  checkCountry(countryID: number, serviceTypeID): boolean {
    let isExist = false;
    this.notificationDealsList.forEach(elem => {
      if (elem.CountryID === countryID && elem.ServiceTypeID === serviceTypeID) {
        isExist = true;
      }
    });
    return isExist;
  }

  removeCountry(countryID: number, serviceTypeID) {
    let newList = this.notificationDealsList.filter(deal => !(deal.CountryID === countryID && deal.ServiceTypeID === serviceTypeID))
    this.notificationDealsList = newList
  }

  setNotificationList() {
    if (
      this.userNotificationSettings.UserNotification &&
      this.userNotificationSettings.UserNotification.length >
      0
    ) {
      this.notificationList = cloneObject(
        this.userNotificationSettings.UserNotification
      );
      this.notificationDistinctList = removeDuplicates(
        this.notificationList,
        "UserNotTypeCat"
      );
    } else {
      this.notificationList = [];
      this.notificationDistinctList = [];
    }

    if (
      this.userNotificationSettings.UserDealNotification &&
      this.userNotificationSettings.UserDealNotification
        .length > 0
    ) {
      this.notificationDealsList = cloneObject(
        this.userNotificationSettings.UserDealNotification
      );
      this.notificationDealsDistinctList = removeDuplicates(
        this.notificationDealsList,
        "ServiceTypeName"
      );
    } else {
      this.notificationDealsList = [];
      this.notificationDealsDistinctList = [];
    }
  }

}
