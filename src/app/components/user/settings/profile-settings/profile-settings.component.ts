import { Component, OnInit, Renderer2, ViewEncapsulation, ViewChild, ElementRef, Output, Input, EventEmitter } from "@angular/core";
import { trigger, style, animate, transition } from '@angular/animations';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";

import { ConfirmDeleteAccountComponent } from "../../../../shared/dialogues/confirm-delete-account/confirm-delete-account.component";
import { DropDownService } from "../../../../services/dropdownservice/dropdown.service";
import { DataService } from "../../../../services/commonservice/data.service";
import { baseExternalAssets } from "../../../../constants/base.url";
import { DomSanitizer } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UserService } from "../../user-service";

import {
  patternValidator, EMAIL_REGEX, matchOtherValidator, Tea, removeDuplicates, URL_REGEX, cloneObject, HashStorage, loading, isJSON
} from "../../../../constants/globalfunctions";
import {
  UserSettingsProfile, ShippingFrequency, UserServiceCategory, ServiceType
} from "../../../../interfaces/user-dashboard";

import { Observable } from "rxjs";
import * as Rx from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import { HttpErrorResponse } from "@angular/common/http";
import { CurrencyControl } from "../../../../shared/currency/currency.injectable";
import { DocumentFile } from "../../../../interfaces/document.interface";

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss'],
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
export class ProfileSettingsComponent implements OnInit {

  //Range Date Picker

  displayMonths = 2;
  navigation = 'select';
  showWeekNumbers = false;
  outsideDays = 'visible';

  //variabbles
  public firstNameError;
  public lastNameError;

  public contactError;
  public emailError;

  public country;

  public selectedImage;
  public select;
  public countryPCode;
  public countryPhoneCode;
  public countryPhoneId;

  public requiredFields = "This field is required!";

  public cityError;
  public cityValidation;
  public cityValid;

  public profileUpdtBlock: boolean;
  public regionalBlock: boolean;
  public companyBlock: boolean;
  public shippingBlock: boolean;

  public city: any = {
    title: "Dubai, United Arab Emirates",
    imageName: "ae",
    desc:
      '[{"CountryID":101,"CountryCode":"AE","CountryName":"United Arab Emirates","CountryPhoneCode":"+971"}]'
  };

  public companyCityError;
  public companyCityValidation;
  public companyCityValid;

  public companyCityList;
  public companyCity = {
    id: 101,
    title: "Dubai, United Arab Emirates",
    imageName: "ae",
    desc:
      '[{"CountryID":101,"CountryCode":"AE","CountryName":"United Arab Emirates","CountryPhoneCode":"+971"}]'
  };
  public companySelectedImage;
  public companyCountryPCode;
  public companySelect;

  public profileUpdate;
  public regionalUpdate;
  public companyUpdate;
  public updatePassword;
  public updateShipping;

  public currencyError;
  public currencyValidation;
  public currencyValid;
  public currencyCode;
  public closeAccordion = true;

  public currency = {
    code: "AED",
    desc: "United Arab Emirates",
    id: 101,
    imageName: "AE",
    shortName: "AED",
    sortingOrder: null,
    title: "UAE Dirham",
    webURL: null
  };
  public selectedCurrency;

  public companyError;
  public websiteError;



  public currPass: boolean = false;
  public newPass: boolean = false;
  public confirmPass: boolean = false;
  public isAdmin: boolean = false;
  public isVerified: boolean = false;

  public serviceCategories: UserServiceCategory[];
  public distinchCat: UserServiceCategory[];




  public serviceTypeList: ServiceType[];

  //Notification End

  public filUrl;
  public filUrlLogo;
  public imgSrc: any = [];
  public base64Img: string;
  public base64ComLogo: string;
  private fileTypeLogo: string;
  public loggedInUser: any;

  selectedFile: File = null;
  selectedFileCompany: File = null;
  @ViewChild("userAvatar") userAvatar: ElementRef;
  @ViewChild("logoCompany") logoCompany: ElementRef;
  @ViewChild("imgUser") imgUser: ElementRef;
  @Output() onProfileUpdate: EventEmitter<UserSettingsProfile> = new EventEmitter<UserSettingsProfile>();

  public userCompany = {
    companyID: 0,
    companyName: "string"
  };

  options = {
    fileSize: 2048, // in Bytes (by default 2048 Bytes = 2 MB)
    // minWidth: 0, // minimum width of image that can be uploaded (by default 0, signifies any width)
    // maxWidth: 0,  // maximum width of image that can be uploaded (by default 0, signifies any width)
    // minHeight: 0,  // minimum height of image that can be uploaded (by default 0, signifies any height)
    // maxHeight: 0,  // maximum height of image that can be uploaded (by default 0, signifies any height)
    fileType: ["image/gif", "image/jpeg", "image/png"], // mime type of files accepted
    // height: 400, // height of cropper
    // quality: 0.8, // quaity of image after compression
    crop: [
      // array of objects for mulitple image crop instances (by default null, signifies no cropping)
      {
        ratio: 1 // ratio in which image needed to be cropped (by default null, signifies ratio to be free of any restrictions)
        // minWidth: 0, // minimum width of image to be exported (by default 0, signifies any width)
        // maxWidth: 0,  // maximum width of image to be exported (by default 0, signifies any width)
        // minHeight: 0,  // minimum height of image to be exported (by default 0, signifies any height)
        // maxHeight: 0,  // maximum height of image to be exported (by default 0, signifies any height)
        // width: 0,  // width of image to be exported (by default 0, signifies any width)
        // height: 0,  // height of image to be exported (by default 0, signifies any height)
      }
    ]
  };


  private resp: any;

  @Input() userProfile: UserSettingsProfile;
  @Input() shippingFreg: ShippingFrequency[];
  @Input() companySizeList = [];
  @Input() companyTypeList = [];
  @Input() departmentList = [];
  @Input() countryList = [];
  @Input() currencyList = [];
  @Input() cityList = [];
  @Input() regionList = [];

  constructor(
    private _userService: UserService,
    private _toastr: ToastrService,
    private dropdownservice: DropDownService,
    private _modalService: NgbModal,
    private _dataService: DataService,
    private _currencyControl: CurrencyControl
  ) { }

  ngOnInit() {
    this.loggedInUser = JSON.parse(Tea.getItem("loginUser"));
    this.createForm();
    this.setInitData();

  }

  setInitData() {

    this.flag(this.city, "city");

    //City List
    //Region List
    //Currenncy list
    //Department List
    //CompanyType List
    //CompanySize List

    let UserData = JSON.parse(Tea.getItem("loginUser"));
    this.isAdmin = UserData.IsAdmin;
    this.isVerified = UserData.IsVerified;
    this.setProfileData();
  }


  accordionClose() {
    this.closeAccordion = !this.closeAccordion;
  }

  setProfileData() {
    // Set Personal Info
    this.setPersonalInfo();

    //Set Region Update
    this.setRegionalInfo();

    // Company Update
    this.setCompanyInfo();
    //Update Ship
    this.setShippingInfo();

  }

  setShippingInfo() {
    this.serviceCategories = cloneObject(
      this.userProfile.UserShippingSetting.UserServiceCategories
    );


    this.distinchCat = removeDuplicates(
      this.serviceCategories,
      "ShippingCatName"
    );

    // this.distinchCat.sort((a , b ) => { return b.SortingOrder - a.SortingOrder });
    this.serviceCategories.sort((a, b) => { return a.SortingOrder - b.SortingOrder });

    if (this.userProfile.UserShippingSetting.IsInternationalShip) {
      let international = this.userProfile.UserShippingSetting
        .IsInternationalShip;
      this.updateShipping.controls["international"].setValue(international);
    } else {
      this.updateShipping.controls["international"].setValue(false);
    }

    if (this.userProfile.UserShippingSetting.IsLocalShip) {
      let stateLocal = this.userProfile.UserShippingSetting.IsLocalShip;
      this.updateShipping.controls["stateLocal"].setValue(stateLocal);
    } else {
      this.updateShipping.controls["stateLocal"].setValue(false);
    }

    if (
      this.userProfile.UserShippingSetting.ShippingFreqCode &&
      this.userProfile.UserShippingSetting.ShippingFreqCode.length > 0
    ) {
      let freqCode = this.userProfile.UserShippingSetting.ShippingFreqCode;
      this.updateShipping.controls["shipFreq"].setValue(freqCode);
    }
    this.shippingBlock = false;
  }
  userInfo() {
    let UserData = JSON.parse(Tea.getItem("loginUser"));
    this._userService.getUserProfile(UserData.UserID).subscribe(res => {
      this.resp = res;
      if (this.resp.returnId > 0) {
        this.onProfileUpdate.emit(this.resp.returnObject);
        this.userProfile = this.resp.returnObject;
        this.setPersonalInfo();
        this.setRegionalInfo();
        this.setCompanyInfo();
        this.setShippingInfo();
      }
    }, (error: HttpErrorResponse) => {
    });
  }
  setPersonalInfo() {
    this.profileUpdate.controls["userEmail"].setValue(
      this.userProfile.UserPersonalInfo.PrimaryEmail
    );
    this.profileUpdate.controls["firstName"].setValue(
      this.userProfile.UserPersonalInfo.FirstName
    );
    this.profileUpdate.controls["lastName"].setValue(
      this.userProfile.UserPersonalInfo.LastName
    );

    if (
      this.userProfile.UserPersonalInfo.CityID !== undefined &&
      this.userProfile.UserPersonalInfo.CityID > 0
    ) {
      let tempCity = cloneObject(this.cityList).filter(
        city => city.id === this.userProfile.UserPersonalInfo.CityID
      )[0];

      this.city = tempCity;

      this.profileUpdate.controls["city"].setValue(tempCity);
    }




    this.profileUpdate.controls["phone"].setValue(
      this.userProfile.UserPersonalInfo.PrimaryPhone
    );

    if (
      this.userProfile.UserPersonalInfo.PhoneCodeCountryID !== null &&
      this.userProfile.UserPersonalInfo.PhoneCodeCountryID > 0
    ) {
      let tempCountry = this.countryList.filter(
        country =>
          country.id === this.userProfile.UserPersonalInfo.PhoneCodeCountryID
      )[0];

      this.selectedImage = tempCountry.code;
      let description = tempCountry.desc;

      this.countryPCode = description[0].CountryPhoneCode;
      this.countryPhoneCode = description[0].CountryPhoneCode;
      this.countryPhoneId = tempCountry.id;
    } else {
      let tempCountry = this.countryList.filter(
        country => 100 === country.id
      )[0];

      this.selectedImage = tempCountry.code;
      let description = tempCountry.desc;

      this.countryPCode = description[0].CountryPhoneCode;
      this.countryPhoneCode = description[0].CountryPhoneCode;
      this.countryPhoneId = tempCountry.id;
    }

    if (this.userProfile.UserPersonalInfo.DepartmentID) {
      this.profileUpdate.controls["department"].setValue(
        this.userProfile.UserPersonalInfo.DepartmentID
      );
    }

    if (this.userProfile.UserPersonalInfo.UserImage && !this.selectedFile) {
      // this.userImagePath = baseExternalAssets + "images/80x80/" + userInfo.UserImage
      let newPath: any = baseExternalAssets + this.userProfile.UserPersonalInfo.UserImage.replace("large", "x-small");
      this.selectedFile = newPath;
    }
    this.profileUpdtBlock = false;
  }

  setRegionalInfo() {
    if (
      this.userProfile.UserRegionalSetting.RegionID !== null &&
      this.userProfile.UserRegionalSetting.RegionID !== undefined &&
      this.userProfile.UserRegionalSetting.RegionID > 0
    ) {
      this.regionalUpdate.controls["region"].setValue(
        this.userProfile.UserRegionalSetting.RegionID
      );
    }

    if (
      this.userProfile.UserRegionalSetting.CurrencyID !== null &&
      this.userProfile.UserRegionalSetting.CurrencyID !== undefined &&
      this.userProfile.UserRegionalSetting.CurrencyID > 0 &&
      this.userProfile.UserRegionalSetting.CurrencyOwnCountryID !== undefined &&
      this.userProfile.UserRegionalSetting.CurrencyOwnCountryID > 0
    ) {
      // const tempCurrency = cloneObject(this.currencyList).filter(
      //   currency =>
      //     (currency.id === this.userProfile.UserRegionalSetting.CurrencyID && JSON.parse(currency.desc).CountryID === this.userProfile.UserRegionalSetting.CurrencyOwnCountryID))[0];
      const tempCurrency = cloneObject(this.currencyList).filter(
        currency => (currency.id === this.userProfile.UserRegionalSetting.CurrencyID)
      )[0];

      this.currency = tempCurrency;
      this.regionalUpdate.controls["currency"].setValue(tempCurrency);
    }
    else {
      this.regionalUpdate.controls["currency"].setValue(undefined);
      // this.regionalUpdate.controls["region"].setValue(0);
    }
    this.regionalBlock = false;
  }

  setCompanyInfo() {
    if (this.isAdmin) {
      this.userCompany.companyID = this.userProfile.UserCompanyInfo.CompanyID;
      this.userCompany.companyName = this.userProfile.UserCompanyInfo.CompanyName;
      // try {
      //   this.currCompanyLogo.whole = this.userProfile.UserCompanyInfo.CompanyImage
      //   this.currCompanyLogo.fileType = this.userProfile.UserCompanyInfo.CompanyImageExtension
      // } catch (error) { }

      this.companyUpdate.controls["company"].setValue(
        this.userProfile.UserCompanyInfo.CompanyName
      );

      if (this.userProfile.UserCompanyInfo.CityID) {
        let tempBusCity = cloneObject(this.cityList).filter(
          city => city.id === this.userProfile.UserCompanyInfo.CityID
        )[0];

        this.companyCity = tempBusCity;
      }

      this.companyUpdate.controls["city"].setValue(this.companyCity);

      this.companyUpdate.controls["website"].setValue(
        this.userProfile.UserCompanyInfo.CompanyWebAdd
      );

      if (
        this.userProfile.UserCompanyInfo.CompanyTypeID !== null &&
        this.userProfile.UserCompanyInfo.CompanyTypeID > 0
      ) {
        let tempCompType = this.companyTypeList.filter(
          compType =>
            compType.id === this.userProfile.UserCompanyInfo.CompanyTypeID
        )[0];

        this.companyUpdate.controls["industry"].setValue(tempCompType.id);
      }

      if (
        this.userProfile.UserCompanyInfo.CompanySizeID !== null &&
        this.userProfile.UserCompanyInfo.CompanySizeID > 0
      ) {
        let tempCompSize = this.companySizeList.filter(
          compType =>
            compType.id === this.userProfile.UserCompanyInfo.CompanySizeID
        )[0];

        this.companyUpdate.controls["businessSize"].setValue(tempCompSize.id);
      }

      if (this.userProfile.UserCompanyInfo.CompanyImage && isJSON(this.userProfile.UserCompanyInfo.CompanyImage)) {
        // this.userImagePath = baseExternalAssets + "images/80x80/" + userInfo.UserImage
        this.userProfile.UserCompanyInfo.CompanyImage = JSON.parse(this.userProfile.UserCompanyInfo.CompanyImage)[0].DocumentFile
        let newPath: any = baseExternalAssets + this.userProfile.UserCompanyInfo.CompanyImage.replace("large", "x-small");
        this.currCompanyLogo.whole = newPath;

      }
      this.companyBlock = false;
    }
  }

  private createForm() {
    this.profileUpdate = new FormGroup({
      userEmail: new FormControl("", [
        Validators.required,
        patternValidator(EMAIL_REGEX),
        Validators.maxLength(320)
      ]),
      firstName: new FormControl("", [
        Validators.required,
        Validators.pattern(/[a-zA-Z-][a-zA-Z -]*$/),
        Validators.minLength(2),
        Validators.maxLength(50)
      ]),
      lastName: new FormControl("", [
        Validators.required,
        Validators.pattern(/[a-zA-Z-][a-zA-Z -]*$/),
        Validators.minLength(2),
        Validators.maxLength(50)
      ]),
      city: new FormControl("", [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(25)
      ]),
      department: new FormControl(""
        // ,[Validators.required]
      ),
      phone: new FormControl("", [
        Validators.required,
        Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/),
        Validators.minLength(7),
        Validators.maxLength(15)
      ])
      // userImage: new FormControl("", [Validators.required])
    });

    this.regionalUpdate = new FormGroup({
      currency: new FormControl("", [
        Validators.required,
        Validators.minLength(3)
        // Validators.maxLength(25)
      ]),
      region: new FormControl("", [Validators.required])
    });

    this.companyUpdate = new FormGroup({
      company: new FormControl("", [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(25)
      ]),
      city: new FormControl("", [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(25)
      ]),
      website: new FormControl("", [
        // Validators.required,
        patternValidator(URL_REGEX),
        Validators.maxLength(50)
      ]),
      industry: new FormControl("", [
        // Validators.required
      ]),
      businessSize: new FormControl("", [
        // Validators.required
      ])
    });

    this.updateShipping = new FormGroup({
      shipFreq: new FormControl("", [Validators.required]),
      international: new FormControl("", [Validators.required]),
      stateLocal: new FormControl("", [Validators.required])
    });

    this.updatePassword = new FormGroup({
      currPass: new FormControl("", [
        Validators.required,
        Validators.minLength(1)
      ]),
      newPass: new FormControl("", [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(15)
      ]),
      confirmPass: new FormControl("", [matchOtherValidator("newPass")])
    });
  }

  passwordMatchValidator() {
    if (this.updatePassword !== undefined && this.updatePassword !== null) {
      return this.updatePassword.get("newPass").value ===
        this.updatePassword.get("confirmPass").value
        ? null
        : {
          mismatch: true
        };
    }
  }

  flag(list, type) {
    this.cityValidation = false;
    this.cityValid = false;
    if (typeof list == "object" && list.title && type == "city") {
      // this.selectedImage = list.imageName;
      let description = JSON.parse(list.desc);
      this.select = this.countryList.find(
        item => item.id === description[0].CountryID
      );
      // this.countryPCode = this.select.desc[0].CountryPhoneCode;
      // this.countryPhoneCode = description[0].CountryPhoneCode;
      // this.countryPhoneId = this.select.desc[0].CountryID;
    } else if (typeof list == "object" && list.title && type == "country") {
      this.selectedImage = list.code;
      let description = list.desc;
      this.countryPCode = description[0].CountryPhoneCode;
      this.countryPhoneCode = description[0].CountryPhoneCode;
      this.countryPhoneId = list.id;
    }
    // else if (typeof list == "object" && list.title && type == "route") {
    //   let description = JSON.parse(list.desc);
    //   this.routeSelect = this.countryList.find(
    //     item => item.id === description[0].CountryID
    //   );
    // }
  }

  companyFlag(list, type) {
    this.companyCityValidation = false;
    this.companyCityValid = false;
    if (typeof list == "object" && list.title && type == "city") {
      this.companySelectedImage = list.imageName;
      let description = JSON.parse(list.desc);
      this.companySelect = this.countryList.find(
        item => item.id === description[0].CountryID
      );
      this.companyCountryPCode = this.select.desc[0].CountryPhoneCode;
    }
  }

  flagcurrency(list) {
    this.currencyValidation = false;
    this.currencyValid = false;
    if (typeof list == "object") {
      this.selectedCurrency = list.imageName;
      this.currencyCode = list.code;
    }
  }

  checkCity(type) {
    let cityName = this.profileUpdate.value.city;
    if (type == "focusOut") {
      if (
        typeof cityName == "string" &&
        cityName.length > 2 &&
        cityName.length < 26
      ) {
        this.cityValidation = "City should be selected from the dropdown";
        this.cityValid = false;
      }
      if (this.profileUpdate.controls.city.status == "INVALID") {
        this.cityError = true;
      }
    } else if (
      type == "focus" &&
      this.cityValidation &&
      typeof cityName == "string"
    ) {
      this.cityValidation = false;
      this.cityValid = true;
    }
  }

  checkCompanyCity(type) {
    let cityName = this.companyUpdate.value.city;
    if (type == "focusOut") {
      if (
        typeof cityName == "string" &&
        cityName.length > 2 &&
        cityName.length < 26
      ) {
        this.companyCityValidation =
          "City should be selected from the dropdown";
        this.companyCityValid = false;
      }
      if (this.companyUpdate.controls.city.status == "INVALID") {
        this.companyCityError = true;
      }
    } else if (
      type == "focus" &&
      this.companyCityValidation &&
      typeof cityName == "string"
    ) {
      this.companyCityValidation = false;
      this.companyCityValid = true;
    }
  }

  checkCurrency(type) {
    let currencyName = this.regionalUpdate.value.currency;
    if (type == "focusOut") {
      if (
        typeof currencyName == "string" &&
        currencyName.length > 2 &&
        currencyName.length < 26
      ) {
        this.currencyValidation =
          "Country should be selected from the dropdown";
        this.currencyValid = false;
      }
      if (this.regionalUpdate.controls.currency.status == "INVALID") {
        this.currencyError = true;
      }
    } else if (
      type == "focus" &&
      this.currencyValidation &&
      typeof currencyName == "string"
    ) {
      this.currencyValidation = false;
      this.currencyValid = true;
    }
  }

  NumberValid(evt) {
    let charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 37 && charCode != 39 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }


  errorMessages() {
    if (
      this.profileUpdate.controls["firstName"].touched &&
      this.profileUpdate.controls["firstName"].status === "INVALID"
    ) {
      this.firstNameError = true;
    }
    if (
      this.profileUpdate.controls["lastName"].touched &&
      this.profileUpdate.controls["lastName"].status === "INVALID"
    ) {
      this.lastNameError = true;
    }
    if (
      this.profileUpdate.controls["phone"].touched &&
      this.profileUpdate.controls["phone"].status === "INVALID"
    ) {
      this.contactError = true;
    }
    if (
      this.profileUpdate.controls["userEmail"].touched &&
      this.profileUpdate.controls["userEmail"].status === "INVALID"
    ) {
      this.emailError = true;
    }
  }
  errorMessagesPasswordUpdate() {
    if (
      this.updatePassword.controls["currPass"].touched &&
      this.updatePassword.controls["currPass"].status === "INVALID"
    ) {
      this.currPass = true;
    }
    if (
      this.updatePassword.controls["newPass"].touched &&
      this.updatePassword.controls["newPass"].status === "INVALID"
    ) {
      this.newPass = true;
    }
    if (
      this.updatePassword.controls["confirmPass"].touched &&
      this.updatePassword.controls["confirmPass"].status === "INVALID"
    ) {
      this.confirmPass = true;
    }
  }

  errorCompanyMessage() {
    if (
      this.companyUpdate.controls["company"].touched &&
      this.companyUpdate.controls["company"].status === "INVALID"
    ) {
      this.companyError = true;
    } else {
      this.companyError = false;
    }
    if (
      this.companyUpdate.controls["website"].touched &&
      this.companyUpdate.controls["website"].status === "INVALID"
    ) {
      this.websiteError = true;
    } else {
      this.websiteError = false;
    }
  }

  search = (text$: Observable<string>) =>
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
  companySearch = (text$: Observable<string>) =>
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
  currencySearch = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .map(
        term =>
          !term || term.length < 3
            ? []
            : this.currencyList.filter(
              v =>
                v.title.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                v.code.toLowerCase().indexOf(term.toLowerCase()) > -1
            )
      );
  formatter = (x: { title: string; desc: string; imageName: string }) => {
    this.city.imageName = x.imageName;
    this.city.title = x.title;
    this.city.desc = x.desc;
    return x.title;
  };
  companyformatter = (x: {
    title: string;
    desc: string;
    imageName: string;
  }) => {
    this.companyCity.imageName = x.imageName;
    this.companyCity.title = x.title;
    this.companyCity.desc = x.desc;
    return x.title;
  };

  currencyformatter = (x: {
    title: string;
    desc: string;
    imageName: string;
    id: number;
    code: string;
  }) => {
    this.currency.imageName = x.imageName;
    this.currency.title = x.title;
    this.currency.id = x.id;
    this.currency.code = x.code;
    return x.title + " - " + x.code;
  };

  textValidation(event) {
    const pattern = /[a-zA-Z-][a-zA-Z -]*$/;
    let inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      if (event.charCode == 0) {
        return true;
      }

      if (event.target.value) {
        var end = event.target.selectionEnd;
        if (event.keyCode == 32 && (event.target.value[end - 1] == " " || event.target.value[end] == " ")) {
          event.preventDefault();
          return false;
        }
      }
      else {
        return false;
      }
    }
    else {
      return true;
    }

  }

  getSubCatList(catId) {
    let filt = this.serviceCategories.filter(x => x.ShippingCatID === catId);
    return filt;
  }

  _profileUpdate(isSave: boolean) {
    if (isSave) {
      let UserData = JSON.parse(Tea.getItem("loginUser"));
      let userImage = null;
      if (this.base64Img) {
        userImage = this.base64Img;
      }
      if (!this.profileUpdate.invalid && this.profileUpdate.controls["userEmail"].value && this.profileUpdate.controls["userEmail"].value != "null" && typeof Number(this.profileUpdate.controls["userEmail"].value) == "number") {

        let deptId = this.profileUpdate.controls["department"].value == -1 ? null : this.profileUpdate.controls["department"].value;

        let countryDesc = JSON.parse(
          this.profileUpdate.controls["city"].value.desc
        );

        let toSend = {
          userID: UserData.UserID,
          loginID: UserData.LoginID,
          primaryEmail: this.profileUpdate.controls["userEmail"].value,
          firstName: this.profileUpdate.controls["firstName"].value,
          middleName: "",
          cityID: this.profileUpdate.controls["city"].value.id,
          lastName: this.profileUpdate.controls["lastName"].value,
          cityName: "",
          primaryPhone: this.profileUpdate.controls["phone"].value,
          departmentID: deptId ? null : deptId,
          departmentName: "",
          CountryPhoneCode: this.countryPCode,
          PhoneCodeCountryID: this.countryPhoneId,
          CountryID: countryDesc[0].CountryID,
          // userImage: this.profileUpdate.controls["userImage"].value.value
          userImage: userImage
        };

        this._userService.profileUpdate(toSend).subscribe(res => {
          this.resp = res;
          if (this.resp.returnId > 0) {
            this._toastr.success("Successfully Updated.", "Success");
            this.profileUpdtBlock = false;
            let returnData = JSON.parse(this.resp.returnText);
            if (UserData.UserID === returnData.UserID) {
              Tea.setItem("loginUser", this.resp.returnText);
            }
            this._dataService.reloadHeader.next(true);
            this.userInfo();
          } else {
            this._toastr.error(this.resp.returnText, "Failed");
          }
        });
      } else {
        this._toastr.warning(
          "Please fill the entire form",
          "Invalid Form"
        );
      }
    } else {
      // this.profileUpdate.reset();
      this.filUrl = null;
      this.firstNameError = false;
      this.lastNameError = false;
      this.contactError = false;
      this.emailError = false;
      this.cityError = false;
      this.selectedFile = null;
      // this.base64Img = null
      this.userInfo();
      this.userAvatar.nativeElement.value = "";
    }
  }
  profileModelChange() {
    this.profileUpdtBlock = true;
  }
  regionalModelChange() {
    this.regionalBlock = true;
  }
  companyModelChange() {
    this.companyBlock = true;
  }
  shippingModelChange() {
    this.shippingBlock = true;
  }

  _regionalUpdate(isSave: boolean) {
    if (isSave) {
      if (
        typeof (this.regionalUpdate.controls["currency"].value) == "object" &&
        this.regionalUpdate.controls["region"].value &&
        this.regionalUpdate.controls["region"].value != "null" &&
        typeof (Number(this.regionalUpdate.controls["region"].value)) == "number" &&
        !this.regionalUpdate.invalid &&
        !this.currencyError &&
        !this.currencyValidation
      ) {
        let UserData = JSON.parse(Tea.getItem("loginUser"));
        let contryInfo = JSON.parse(this.regionalUpdate.controls["currency"].value.desc)

        let currId = this.regionalUpdate.controls["currency"].value.id
        let code = this.regionalUpdate.controls["currency"].value.code
        let toSend = {
          userID: UserData.UserID,
          regionID: this.regionalUpdate.controls["region"].value,
          regionName: "",
          currencyID: currId,
          currencyName: this.regionalUpdate.controls["currency"].value.shortName,
          loginID: UserData.LoginID,
          currencyOwnCountryID: contryInfo.CountryID
        };

        this._userService.regionalUpdate(toSend).subscribe(res => {
          this.resp = res;
          if (this.resp.returnId > 0) {
            this._toastr.success("Successfully updated.", "Success");
            this.regionalBlock = false;
            this.userInfo();
            let userData = JSON.parse(Tea.getItem('loginUser'))
            userData.CurrencyID = currId
            userData.CurrencyOwnCountryID = contryInfo.CountryID
            this._currencyControl.setCurrencyID(currId)
            this._currencyControl.setCurrencyCode(code)
            this._currencyControl.setToCountryID(contryInfo.CountryID)
            HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
            Tea.setItem('loginUser', JSON.stringify(userData))
          } else {
            this._toastr.error(this.resp.returnText, "Failed");
          }
        });
      } else {
        if (typeof (this.regionalUpdate.controls["currency"].value) == "string") {
          this.currencyValidation = "Country should be selected from the dropdown";
        }
        else {
          this._toastr.warning("Please fill the entire form", "Invalid Form");
        }
      }
    } else {
      this.currencyError = false;
      this.userInfo();
    }
  }

  _companyUpdate(isSave: boolean) {
    const { fileBaseString } = this.currCompanyLogo
    if (isSave) {
      if (!this.companyUpdate.invalid) {
        let companyTypeID = (this.companyUpdate.controls["industry"].value && this.companyUpdate.controls["industry"].value != "null" && typeof (Number(this.companyUpdate.controls["industry"].value)) == "number") ? this.companyUpdate.controls["industry"].value : null;
        let businessSize = (this.companyUpdate.controls["businessSize"].value && this.companyUpdate.controls["businessSize"].value != "null" && typeof (Number(this.companyUpdate.controls["businessSize"].value)) == "number") ? this.companyUpdate.controls["businessSize"].value : null;
        let UserData = JSON.parse(Tea.getItem("loginUser"));
        let toSend = {
          userID: UserData.UserID,
          loginID: UserData.LoginID,
          companyID: this.userCompany.companyID,
          companyName: this.userCompany.companyName,
          cityID: this.companyUpdate.controls["city"].value.id,
          cityName: this.companyUpdate.controls["city"].value.title,
          companyAddress: "",
          companyWebAdd: this.companyUpdate.controls["website"].value,
          companyTypeID: companyTypeID,
          companyTypeName: "",
          companySizeID: businessSize,
          companyImage: fileBaseString,
          companyImageExtension: this.currCompanyLogo.fileType
        };

        // this.currCompanyLogo.whole = null
        this.currCompanyLogo.fileBaseString = null


        this._userService.companyUpdate(toSend).subscribe(res => {
          this.resp = res;
          if (this.resp.returnId > 0) {
            this.companyBlock = false;
            this.userInfo();
            this._toastr.success("Successfully updated.", "Success");
          } else {
            this._toastr.error(this.resp.returnText, "Failed");
          }
        });
      } else {
        this._toastr.warning("Please fill the entire form", "Invalid Form");
      }
    } else {
      // this.companyUpdate.reset();
      this.filUrlLogo = null;
      this.selectedFileCompany = null;
      this.websiteError = false;
      this.userInfo();
    }
  }

  _updatePassword(isSave: boolean) {
  const customerSettings = JSON.parse(HashStorage.getItem('customerSettings'))
    if (isSave) {
      if (!this.updatePassword.invalid) {
        let UserData = JSON.parse(Tea.getItem("loginUser"));

        let toSend = {
          CurrentPassword: this.updatePassword.controls["currPass"].value,
          Email: UserData.LoginID,
          Password: this.updatePassword.controls["newPass"].value,
          PortalName: 'ENTERPRISE',
          CustomerID: (customerSettings.customerID) ? customerSettings.customerID : null,
          CustomerType: (customerSettings.customerType) ? customerSettings.customerType : null,
        };

        this._userService.updatePassword(toSend).subscribe(res => {
          this.resp = res;
          if (this.resp.returnId > 0) {
            this._toastr.success("Successfully updated.", "Success");
            this.updatePassword.reset();
          } else {
            this._toastr.error(this.resp.returnText, "Failed");
          }
        });
      } else {
        this._toastr.warning("Please fill the entire form", "Invalid Form");
      }
    } else {
      this.currPass = false;
      this.newPass = false;
      this.confirmPass = false;
      this.updatePassword.reset();
    }
  }

  catClicked(catId, subCatId) {
    this.shippingBlock = true;
    this.serviceCategories.forEach(elem => {
      if (elem.ShippingCatID === catId && elem.ShippingSubCatID === subCatId) {
        elem.IsActive = !elem.IsActive;
        return;
      }
    });
  }

  _updateShipping(isSave: boolean) {
    let newFullList = this.serviceCategories.filter(
      res => res.IsActive === true
    );

    if (isSave) {
      if (!this.updateShipping.invalid && this.updateShipping.controls["shipFreq"].value && this.updateShipping.controls["shipFreq"].value != "null") {
        let UserData = JSON.parse(Tea.getItem("loginUser"));

        let localShip: boolean = false;
        let isInternationalShip: boolean = false;

        if (this.updateShipping.controls["stateLocal"].value) {
          localShip = this.updateShipping.controls["stateLocal"].value;
        }
        if (this.updateShipping.controls["international"].value) {
          isInternationalShip = this.updateShipping.controls["international"]
            .value;
        }

        let toSend = {
          userID: UserData.UserID,
          loginID: UserData.LoginID,
          shippingFreqCode: this.updateShipping.controls["shipFreq"].value,
          shippingFreqName: "",
          isInternationalShip: isInternationalShip,
          isLocalShip: localShip,
          userServiceCategories: newFullList
        };

        this._userService.updateShipping(toSend).subscribe(res => {
          this.resp = res;
          if (this.resp.returnId > 0) {
            this.userInfo();
            this._toastr.success("Successfully updated.", "Success");
            this.shippingBlock = false;
          } else {
            this._toastr.error(this.resp.returnText, "Failed");
          }
        });
      } else {
        this._toastr.warning("Please fill the entire form", "Invalid Form");
      }
    } else {
      // this.updateShipping.reset();
      this.userInfo();
    }
  }

  resendEmailRequest() {
    let UserData = JSON.parse(Tea.getItem("loginUser"));

    this._userService.resendEmail(UserData.UserID).subscribe(res => {
      this.resp = res;
      if (this.resp.returnId > 0) {
        this._toastr.success(this.resp.returnText, this.resp.returnStatus);
      } else {
        this._toastr.warning(this.resp.returnText, this.resp.returnStatus);
      }
    });
  }

  onFileChange(event) {
    let reader = new FileReader();

    if (event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        let newFile = {
          filename: file.name,
          filetype: file.type,
          value: reader.result.toString().split(",")[1]
        };

        this.filUrl = reader.result;

        this.profileUpdate.get("userImage").setValue(newFile);
      };
    }
  }
  onFileChangeLogo(event) {
    let reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        let newFile = {
          filename: file.name,
          filetype: file.type,
          value: reader.result.toString().split(",")[1]
        };

        this.filUrlLogo = reader.result;
        this.companyUpdate.get("companyLogo").setValue(newFile);
      };
    }
  }
  selectImageModal(imagePicker, type) {
    if (type == 'Avatar') {
      let oldImage = this.selectedFile;
      this._modalService
        .open(imagePicker, { backdrop: "static" })
        .result.then(res => {
          if (res === "close") {
            this.selectedFile = oldImage;
          } else if (res === 'select') {
            this.profileUpdtBlock = true;
          }
        });
    }
    else if (type == 'Company Logo') {
      let oldImage = this.selectedFileCompany;
      this._modalService
        .open(imagePicker, { backdrop: "static" })
        .result.then(res => {
          if (res === "close") {
            this.selectedFileCompany = oldImage;
          } else if (res === 'select') {
            this.companyBlock = true;
          }
        });
    }
  }

  onSelect($event) {
    this.selectedFile = $event;
    this.imgSrc = [];
    switch (typeof $event) {
      case "string":
        this.imgSrc = [$event];
        break;
      case "object":
        this.imgSrc = $event;
        break;
      default:
    }

    let byteString: any;
    let someStr: string = this.imgSrc.toString();
    let imgData = someStr.split(",");

    let newFile = {
      filename: imgData[0],
      filetype: imgData[0],
      value: imgData[1].toString()
    };
    this.base64Img = newFile.value;
  }

  onSelectComLogo($event) {
    this.selectedFileCompany = $event;
    this.imgSrc = [];
    switch (typeof $event) {
      case "string":
        this.imgSrc = [$event];
        break;
      case "object":
        this.imgSrc = $event;
        break;
      default:
    }

    let byteString: any;
    let someStr: string = this.imgSrc.toString();
    let imgData = someStr.split(",");

    let newFile = {
      filename: imgData[0],
      filetype: imgData[0],
      value: imgData[1].toString()
    };
    this.fileTypeLogo = newFile.filetype.split('/').pop().split(';').shift();
    this.base64ComLogo = newFile.value;
  }


  selectImage(type) {
    if (type == 'logo') {
      this.logoCompany.nativeElement.click();
    }
    else {
      this.userAvatar.nativeElement.click();
    }
  }


  reset() {
    this.imgSrc = [];
  }

  deleteAccount() {
    const modalRef = this._modalService.open(ConfirmDeleteAccountComponent, {
      size: "lg",
      centered: true,
      windowClass: "small-modal",
      backdrop: "static",
      keyboard: false
    });
    let userData = JSON.parse(Tea.getItem("loginUser"));
    let obj = {
      deletingUserID: this.userProfile.UserPersonalInfo.UserID,
      deleteByUserID: userData.UserID
    };
    modalRef.componentInstance.account = obj;

    setTimeout(() => {
      if (
        document
          .getElementsByTagName("body")[0]
          .classList.contains("modal-open")
      ) {
        document.getElementsByTagName("html")[0].style.overflowY = "hidden";
      }
    }, 0);
  }

  //////////


  public currCompanyLogo: DocumentFile = {
    fileBaseString: null,
    fileName: null,
    fileType: null,
    whole: null,
  }

  customDragCheck($fileEvent: DocumentFile) {
    let selectedFile: DocumentFile = $fileEvent
    this.currCompanyLogo = selectedFile
    this.companyModelChange()
  }

  fileSelectFailedEvent($message: string) {
    this._toastr.error($message, 'Error')
  }


  maxLogoSize = 5 * 1024 * 1000;
  allowedExtension = ['jpg', 'jpeg', 'png']

  onFileCompanyLogoChange(event) {
    let reader = new FileReader();

    if (event.target.files) {
      try {
        let file = event.target.files[0];
        reader.readAsDataURL(file);
        reader.onload = () => {
          if (file.size > this.maxLogoSize) {
            this._toastr.warning('Unable to Upload Document , Document size should not exceed 5 MB')
            return
          }
          let selectedFile: DocumentFile = {
            fileName: file.name,
            fileType: '',
            fileBaseString: reader.result.toString().split(',')[1],
            whole: reader.result
          }
          let flag = false
          if (!file.name.includes('.')) {
            this._toastr.warning('Invalid File Selected')
            return;
          }
          const cpyfileName = file.name
          const fileExtension = cpyfileName.substring(cpyfileName.lastIndexOf('.') + 1, cpyfileName.length)
          this.allowedExtension.forEach((extension: string) => {
            if (fileExtension.toLowerCase().includes(extension.toLowerCase())) {
              selectedFile.fileType = extension
              flag = true;
            }
          })
          if (!flag) {
            this._toastr.warning('Invalid File Selected')
            return;
          }
          this.companyModelChange()
          this.currCompanyLogo = selectedFile;
        };
      } catch (err) { }
    }
  }

  onCompanyChange() {
    try {
      document.getElementById('file-company-logo').click()
    } catch (error) {
    }
  }
}
