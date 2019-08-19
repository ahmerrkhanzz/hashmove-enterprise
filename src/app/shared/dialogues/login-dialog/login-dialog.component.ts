import { Component, OnInit, AfterViewInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RegDialogComponent } from '../reg-dialog/reg-dialog.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component'
import { AuthService } from '../../../services/authservice/auth.service'
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { ToastrService, Overlay } from 'ngx-toastr';
import { JsonResponse } from '../../../interfaces/JsonResponse'
import { EMAIL_REGEX, ValidateEmail, HashStorage, Tea, getDefaultCountryCode, getSearchCriteria, setSearchCriteria } from '../../../constants/globalfunctions';
import { baseExternalAssets } from '../../../constants/base.url';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { DataService } from '../../../services/commonservice/data.service';
import { CurrencyDetails } from '../../../interfaces/currencyDetails';
import { saveJwtToken, saveRefreshToken } from '../../../constants/auth';
import * as moment from 'moment';
import * as JQ from 'jquery';
import { Observable } from 'rxjs';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { CurrencyControl } from '../../currency/currency.injectable';
import { SearchCriteria } from '../../../interfaces/searchCriteria';
import { LoginUser } from '../../../interfaces/user.interface';


@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  public savedUser: boolean;
  closeResult: string;
  currentJustify = 'justified';
  private tempResponse: any
  public saveUserData: any
  public userAvatar: string
  public userName: string = ''
  public countryCode: string;
  public loading: boolean;
  public colorEye;
  public placeholder: string = "Your unique password"
  emailError
  passError
  loginForm: FormGroup;
  isFormInValid: boolean = true
  public searchCriteria: any;
  public customerSettings: any = {}
  @Output() onForgetPassClick = new EventEmitter<string>();

  constructor(
    private _http: HttpClient,
    private activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private authService: AuthService,
    private toastr: ToastrService,
    private _router: Router,
    private _dataService: DataService,
    private location: PlatformLocation,
    private _currencyControl: CurrencyControl
  ) {
    location.onPopState(() => this.closeModal());
  }

  ngOnInit() {
    this.getUserLocation()
    this.customerSettings = JSON.parse(HashStorage.getItem('customerSettings'))
    if (HashStorage) {
      if (Tea.getItem('loginUser')) {
        this.saveUserData = JSON.parse(Tea.getItem('loginUser'))
        this.savedUser = true;
        this.placeholder = "Enter your unique password";
        if (this.saveUserData.UserImage) {
          // this.userAvatar = baseExternalAssets + "images/80x80/" + this.saveUserData.UserImage
          this.userAvatar = baseExternalAssets + this.saveUserData.UserImage;
        }
        this.userName = this.saveUserData.FirstName + ' ' + this.saveUserData.LastName
      }
    }
    this.createForm()
    this.loginForm.statusChanges.pipe(untilDestroyed(this)).subscribe(state => {
      const { invalid } = this.loginForm
      this.isFormInValid = invalid
    })
  }


  ngAfterViewInit() {

    setTimeout(() => {
      try {
        let loginUserID = document.getElementById('loginUserID')
        const isAutoFilled = JQ(loginUserID).is(":-webkit-autofill")
        if (isAutoFilled) {
          this.isFormInValid = false
        }
      } catch (error) { }
    }, 200);
  }


  private createForm() {
    this.loginForm = new FormGroup({
      loginUserID: new FormControl('', [Validators.required, patternValidator(EMAIL_REGEX), Validators.maxLength(320)]),
      password: new FormControl('', [Validators.required, Validators.minLength(1)]),
    });

    if (this.savedUser) {
      this.loginForm.controls['loginUserID'].setValue(this.saveUserData.LoginID)
    }
  }



  forgetPassword() {
    this.onForgetPassClick.emit('f_pass')
    // this.activeModal.close()
    // document.getElementsByTagName('html')[0].style.overflowY = 'auto';
    // this.modalService.open(ForgotPasswordComponent, {
    //   size: 'lg',
    //   centered: true,
    //   windowClass: 'small-modal',
    //   backdrop: 'static',
    //   keyboard: false
    // });
    // setTimeout(() => {
    //   if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
    //     document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
    //   }
    // }, 0);
  }
  closeModal() {
    this.activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }


  loginUser(data) {
    let valid: boolean = ValidateEmail(data.loginUserID)
    if (!valid) {
      this.toastr.error('Invalid email entered.', 'Error');
      return
    }
    this.loading = true;
    let toSend = {
      password: data.password,
      loginUserID: data.loginUserID,
      CustomerID: this.customerSettings.customerID,
      CustomerType: this.customerSettings.customerType,
      CountryCode: (this.countryCode) ? this.countryCode : 'DEFAULT AE',
      LoginIpAddress: "0.0.0.0",
      LoginDate: moment(Date.now()).format(),
      LoginRemarks: "",
    }
    this.authService.userLogin(toSend).subscribe((response: JsonResponse) => {
      this.tempResponse = response
      let resp: JsonResponse = this.tempResponse
      if (resp.returnId > 0) {
        this.loading = false;
        if (HashStorage) {
          if (resp.returnObject) {
            saveJwtToken(resp.returnObject.token)
            saveRefreshToken(resp.returnObject.refreshToken)
          }

          let loginData: LoginUser = JSON.parse(resp.returnText)
          loginData.IsLogedOut = false

          if (!this._router.url.includes('booking')) {
            if ((loginData.CurrencyOwnCountryID && loginData.CurrencyOwnCountryID > 0) && (loginData.CurrencyID && loginData.CurrencyID > 0)) {
              this._currencyControl.setToCountryID(loginData.CurrencyOwnCountryID)
              this._currencyControl.setCurrencyID(loginData.CurrencyID)
              this._currencyControl.setCurrencyCode(loginData.CountryCode)
            }
          }

          try {
            let searchCriteria: SearchCriteria = getSearchCriteria()

            if (searchCriteria) {
              const { CustomerID, CustomerType } = loginData
              searchCriteria.CustomerID = CustomerID
              searchCriteria.CustomerType = CustomerType
              setSearchCriteria(searchCriteria)
            }
          } catch (error) {
            console.log('Customer Id not set');

          }
          console.log(loginData)
          Tea.setItem('loginUser', JSON.stringify(loginData))
          this.checkPreferredProviders(loginData.CustomerID)
        } else {
          this.toastr.warning("Please Enable Cookies to use this app", "Cookies Disabled")
          this._router.navigate(['enable-cookies']);
          this.activeModal.close();
          document.getElementsByTagName('html')[0].style.overflowY = 'auto';
          return;
        }

        this._dataService.reloadHeader.next(true)

        // this.toastr.success('Login Successful!', 'Success');
        this.activeModal.close(JSON.parse(resp.returnText));
        this._router.navigate(['home']);
        document.getElementById('preloader2').classList.remove('logout');
        document.getElementsByTagName('html')[0].style.overflowY = 'auto';
        if (this._router.url.includes('search')) {
          this._dataService.reloadSearchCurreny.next(true);
        }

      } else {
        this.loading = false;
        this.toastr.error('Invalid email or password.', 'Failed')

      }
    }, (err: HttpErrorResponse) => {
      this.loading = false;
      this.toastr.error('Invalid email or password.', 'Failed')
    })

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


  /**
   * CHECK PREFERRED PROVIDERS
   *
   * @param {number} customerID
   * @memberof LoginDialogComponent
   */
  checkPreferredProviders(customerID) {
    this.loading = true
    this.authService.checkUserProviders(customerID).subscribe((res: any) => {
      if (res.returnObject && res.returnObject.length) {
        HashStorage.setItem('preferredProviders', JSON.stringify(res.returnObject))
      } else {
        HashStorage.setItem('preferredProviders', null)
      }
      this.loading = false
    }, (err: any) => {
      this.loading = false
    })
  }

  registration() {

    this._dataService.hideLogin.next(false)
    // HashStorage.removeItem("hideLogin")
    this.activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
    this.modalService.open(RegDialogComponent, {
      size: 'lg',
      windowClass: 'reg-dialog',
      backdrop: 'static',
      keyboard: false
    });
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);

  }

  notMyAccount() {
    this.savedUser = !this.savedUser;
    this.loginForm.reset();
    this.placeholder = "Your unique password";

  }

  getUserLocation() {
    // this._http.get('https://api.teletext.io/api/v1/geo-ip').subscribe((res: any) => {
    this.countryCode = getDefaultCountryCode();
    // });
  }

  errorMessagesEmail() {
    this.emailError = true;
  }

  errorMessagePass() {
    this.passError = true
  }

  ngOnDestroy() {

  }

}


export function patternValidator(regexp: RegExp): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const value = control.value;
    if (value === '') {
      return null;
    }
    return !regexp.test(value) ? { 'patternInvalid': { regexp } } : null;
  };
}
