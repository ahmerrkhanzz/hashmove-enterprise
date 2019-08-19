import { Component, OnInit, ViewEncapsulation, Input, Renderer2, ElementRef } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomValidator, getDefaultCountryCode, validateName, Tea } from '../../../constants/globalfunctions';
import { DropDownService } from '../../../services/dropdownservice/dropdown.service'
import { Dropdown, CountryDropdown } from '../../../interfaces/dropdown';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './../../../services/authservice/auth.service';
import { EMAIL_REGEX, ValidateEmail } from '../../../constants/globalfunctions';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs/Observable';
import * as Rx from "rxjs/Rx";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { DataService } from '../../../services/commonservice/data.service';




@Component({
  selector: 'app-reg-dialog',
  templateUrl: './reg-dialog.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./reg-dialog.component.scss']
})



export class RegDialogComponent implements OnInit {

  @Input() shareUserObject: any;
  closeResult: string;
  currentJustify = 'justified';
  public creationCorporateType;
  public countryList;
  public toggle: boolean = false;
  public country;
  public cityList;
  public cityValidation;
  public cityValid;
  public companyList;
  public hearList;
  public requiredFields = "This field is required!";
  public selectedImage;
  public select;
  public countryPCode;
  public phoneCountryId;
  public colorEye;
  public term: boolean = false;
  public firstNameError;
  public lastNameError;
  public contactError;
  public cityError;
  public emailError;
  public companyError;
  public passwordError;
  public corporateUser: boolean = false;
  public company: any;

  public city: SelectedCity = {
    title: '',
    imageName: getDefaultCountryCode(),
    desc: ''
  }
  isValidFormSubmitted = null;
  userForm;
  public hideLogin: boolean = false;
  public activeIdString: string = "tab-corporate"

  public isSubmitting: boolean = false
  public userInfo: any;


  constructor(
    private modalService: NgbModal,
    private _renderer: Renderer2,
    private el: ElementRef,
    private dropdownservice: DropDownService,
    private authService: AuthService,
    private _toast: ToastrService,
    private activeModal: NgbActiveModal,
    private _dataService: DataService,
    private _http: HttpClient,
    private location: PlatformLocation
  ) {
    location.onPopState(() => this.closeModal(false));
  }
  ngOnInit() {
    this.isSubmitting = false
    this.activeIdString = 'tab-corporate'
    this.userInfo = JSON.parse(localStorage.getItem('customerSettings'))
    console.log(this.userInfo)
    this.Account('corporate')
    this._dataService.hideLogin.subscribe(res => {
      if (res) {
        this.hideLogin = true
      } else {
        this.hideLogin = false
      }
    })

    this.userForm = new FormGroup({
      firstName: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/), Validators.minLength(2), Validators.maxLength(50)]),
      lastName: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/), Validators.minLength(2), Validators.maxLength(50)]),
      city: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(25)]),
      email: new FormControl(null, [
        Validators.required,
        Validators.pattern(EMAIL_REGEX),
        Validators.maxLength(320)
      ]),
      phone: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(12)]),
      company: new FormControl('', [CustomValidator.bind(this)]),
      howHearAboutUs: new FormControl('', [Validators.required]),
      // termCondition: new FormControl('', [Validators.required]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(15)]),
    });

    this.dropdownservice.getCountry().subscribe((res: Observable<CountryDropdown>) => {
      let List = res;
      List.map((obj) => {
        obj.desc = JSON.parse(obj.desc);
      })
      this.countryList = List;
    }, (err: HttpErrorResponse) => {
    })

    this.dropdownservice.getCompany().subscribe((res: Observable<CountryDropdown>) => {
      this.companyList = res;
      if (this.shareUserObject && this.shareUserObject.CompanyName) {
        this.company = this.companyList.find(list => list.title.toLowerCase() === this.shareUserObject.CompanyName.toLowerCase());
        let companyInput = this.el.nativeElement.querySelector('input.company');
        this._renderer.setAttribute(companyInput, 'readonly', 'true');
      }

    }, (err: HttpErrorResponse) => {
    })

    this.dropdownservice.getCity().subscribe((res: Observable<Dropdown>) => {
      this.cityList = res;
      this.getUserLocation();
    }, (err: HttpErrorResponse) => {
    })


    this.dropdownservice.howhear().subscribe((res: Observable<Dropdown>) => {
      this.hearList = res;
    }, (err: HttpErrorResponse) => {
    })

    // if (this.shareUserObject && this.shareUserObject.CompanyName) {
      this.Account("corporate");
      this.creationCorporateType = true;
      let tab = this.el.nativeElement.querySelector('ul[role="tablist"]');
      this._renderer.setStyle(tab, 'display', 'none');
    // }

  }


  getUserLocation() {
    let countryCode = getDefaultCountryCode();
    this.city = this.findCityByCountryCode(countryCode);
    this.flag(this.city, 'city');
  }

  findCityByCountryCode(countryCode: string): SelectedCity {

    let searchedCity: SelectedCity;
    let cityObj = this.cityList.find((obj) => {

      if (JSON.parse(obj.desc)[0].CountryCode.toLowerCase() == countryCode.toLowerCase()) {
        searchedCity = {
          desc: obj.desc,
          title: obj.title,
          imageName: obj.imageName
        }
        return obj;
      }
    });
    return searchedCity;
  }

  errorMessages() {
    if (this.userForm.controls.firstName.status == "INVALID" && this.userForm.controls.firstName.touched) {
      this.firstNameError = true;
    }
    if (this.userForm.controls.lastName.status == "INVALID" && this.userForm.controls.lastName.touched) {
      this.lastNameError = true;
    }
    if (this.userForm.controls.phone.status == "INVALID" && this.userForm.controls.phone.touched) {
      this.contactError = true;
    }
    if (this.userForm.controls.email.status == "INVALID" && this.userForm.controls.email.touched) {
      this.emailError = true;
    }
    if (this.userForm.controls.password.status == "INVALID" && this.userForm.controls.password.touched) {
      this.passwordError = true;
    }
    if (this.userForm.controls.company.status == "INVALID" && this.userForm.controls.company.touched) {
      this.companyError = true;
    }


  }


  login() {
    this.activeModal.close();

    this.modalService.open(LoginDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);

  }
  closeModal(status) {
    this.activeModal.close(status);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  }

  flag(list, type) {
    this.cityValidation = false;
    this.cityValid = false;
    if (typeof (list) == 'object' && list.title && type == 'city') {
      this.selectedImage = list.imageName;
      let description = JSON.parse(list.desc);
      if (this.countryList && this.countryList.length) {
        this.select = this.countryList.find(item => item.id === description[0].CountryID);
        this.countryPCode = this.select.desc[0].CountryPhoneCode;
        this.phoneCountryId = this.select.id;
      }
    }
    else if (typeof (list) == 'object' && list.title && type == 'country') {
      this.selectedImage = list.code;
      let description = list.desc;
      this.countryPCode = description[0].CountryPhoneCode;
      this.phoneCountryId = list.id
    }
  }

  spaceHandler(event) {
    if (event.target.value) {
      const end = event.target.selectionEnd;
      if (event.keyCode == 32 && (event.target.value[end - 1] == " " || event.target.value[end] == " ")) {
        event.preventDefault();
        return false;
      }
    }
  }
  emailPassSpaceHandler(event) {
    if (event.keyCode == 32) {
      event.preventDefault();
      return false;
    }
  }
  checkCity(type) {

    let cityName = this.userForm.value.city;
    if (type == 'focusOut') {
      if (typeof (cityName) == "string" && cityName.length > 2 && cityName.length < 26) {
        this.cityValidation = "City should be selected from the dropdown";
        this.cityValid = false;
      }
      if (this.userForm.controls.city.status == "INVALID") {
        this.cityError = true;
      }
    }
    else if (type == 'focus' && this.cityValidation && typeof (cityName) == "string") {

      this.cityValidation = false;
      this.cityValid = true;
    }
  }
  Account(accountType) {
    if (accountType == "corporate") {
      this.corporateUser = true;
    }
    else if (accountType == "individual") {
      this.corporateUser = false;
      this.userForm.controls.company.reset();
    }
  }

  async userRegistration(userForm) {
    let userItem = JSON.parse(Tea.getItem('loginUser'));
    this.isSubmitting = true
    let valid: boolean = ValidateEmail(userForm.email);

    if (this.userForm.invalid) {
      this.isSubmitting = false
      return;
    }
    else if (!valid) {
      this.isSubmitting = false
      this._toast.warning('Invalid email entered.', 'Failed')
      return
    }

    if ((userForm.company && typeof userForm.company === 'object' && !userItem) || (userForm.company && typeof userForm.company === 'object' && userItem && userItem.IsLogedOut)) {
      this._toast.warning('Please contact ' + userForm.company.title + ' admin to create your account', 'Info')
      this.isSubmitting = false
      return false;
    }

    const { firstName, lastName } = userForm
    const fName = validateName(firstName)
    const lName = validateName(lastName)
    let country_id = JSON.parse(userForm.city.desc);
    let obj: any = {
      userID: -1,
      userCode: "",
      loginID: userForm.email,
      password: userForm.password,
      primaryEmail: userForm.email,
      secondaryEmail: "",
      firstName: fName,
      middleName: "",
      lastName: lName,
      primaryPhone: userForm.phone,
      secondaryPhone: "",
      CountryPhoneCode: this.countryPCode,
      PhoneCodeCountryID: this.phoneCountryId,
      companyID: (this.corporateUser && typeof (userForm.company) == "object") ? userForm.company.id : null,
      countryID: Number(country_id[0].CountryID),
      cityID: userForm.city.id,
      howHearAboutUs: userForm.howHearAboutUs,
      howHearOthers: "",
      roleID: null,
      isDelete: false,
      isActive: true,
      createdBy: "",
      modifiedBy: "",
      userImage: "",
      companyTradeLicenseNum: "",
      isCorporateUser: this.corporateUser,
      isAgreeTermsCond: this.term,
      customerID: this.userInfo.customerID,
      portalName: this.userInfo.portalName
    };

    if (obj && obj.isCorporateUser) {
      obj.companyName = (typeof (userForm.company) == "object") ? userForm.company.title : userForm.company;
    }
    else if (obj && !obj.isCorporateUser) {
      obj.companyName = "";
    }

    this.authService.userRegistration(obj).subscribe((res: any) => {
      if (res.returnStatus == "Error") {
        this._toast.error(res.returnText);
      }
      else if (res.returnStatus == "Success") {
        this._toast.success("You have been registered successfully. Please check your email to verify your account before logging in.");
        this.userForm.reset();
        this.closeModal('success');
      }
      this.isSubmitting = false
    }, (err: HttpErrorResponse) => {
      this.isSubmitting = false
    })
  }
  NumberValid(evt) {
    let charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 37 && charCode != 39 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }

  confirmPassword(event) {
    let element = event.target.nextSibling;
    if (element.type === "password" && element.value) {
      element.type = "text";
      this.colorEye = "black";
    }
    else {
      element.type = "password";
      this.colorEye = "grey";

    };
  }


  textValidation(event) {
    try {
      const pattern = /[a-zA-Z-][a-zA-Z -]*$/;
      const inputChar = String.fromCharCode(event.charCode);
      if (!pattern.test(inputChar)) {

        if (event.charCode == 0) {
          return true;
        }

        if (event.target.value) {
          const end = event.target.selectionEnd;
          if ((event.which == 32 || event.keyCode == 32) && (event.target.value[end - 1] == " " || event.target.value[end] == " ")) {
            event.preventDefault();
            return false;
          }
        }
        else {
          event.preventDefault();
          return false;
        }
      } else {
        return true;
      }
    } catch (error) {
      return false
    }

  }



  search = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .map(term => (!term || term.length < 3) ? []
        : this.cityList.filter(v => v.title.toLowerCase().indexOf(term.toLowerCase()) > -1));
  formatter = (x: { title: string, desc: string, imageName: string }) => {
    this.city.imageName = x.imageName;
    this.city.title = x.title;
    this.city.desc = x.desc;
    return x.title;

  };

  companyPredic = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .map(term => (!term || term.length < 3) ? []
        : this.companyList.filter(v => v.title.toLowerCase().indexOf(term.toLowerCase()) > -1));
  companyFormater = (x: { title: string, desc: string, imageName: string }) => {
    return x.title;

  };

}

interface SelectedCity {
  title: String,
  imageName: String,
  desc: any;
}
