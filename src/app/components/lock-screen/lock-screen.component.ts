import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/authservice/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Base64 } from 'js-base64';
import { Tea, EMAIL_REGEX, HashStorage } from '../../constants/globalfunctions';
import { FormGroup, Validators, FormControl } from '@angular/forms';


@Component({
  selector: 'app-lock-screen',
  templateUrl: './lock-screen.component.html',
  styleUrls: ['./lock-screen.component.scss']
})
export class LockScreenComponent implements OnInit {

  public passwordField: boolean = true;
  public password: any;
  public email: any;
  public lockForm: FormGroup;
  loading: boolean;
  public partnerURL: string;

  constructor(
    private _router: Router,
    private _renderer: Renderer2,
    private _authService: AuthService,
    private _toast: ToastrService
  ) { }

  ngOnInit() {

    this.lockForm = new FormGroup({
      password: new FormControl(''),
    });
    this._renderer.addClass(document.body, 'bg-lock-grey');
    this._renderer.removeClass(document.body, 'bg-white');
    this.partnerURL = localStorage.getItem('partnerURL')
  }

  submitUser(password) {
    this.loading = true;
    let enc_pass = Base64.encode(password)
    this._authService.userProtected({ Password: enc_pass }).subscribe((res: any) => {
      if (res.returnId > 0) {
        this.loading = false;
        Tea.setItem('protectorUserlogIn', JSON.stringify(true))
        if (this.partnerURL) {
          const pURL = this.partnerURL
          if (this.partnerURL.includes('partner')) {
            const providerID = pURL.substr(pURL.indexOf('partner'), pURL.length)
            this._router.navigate([providerID]);
          } else if (this.partnerURL.includes('admin')) {
            this._router.navigate(['admin']);
          }
        } else {
          this._router.navigate(['home']);
        }

      }
      else {
        this.loading = false;
        this._toast.error(res.returnText, "Failed");
      }
    }, (err: HttpErrorResponse) => {
      this.loading = false;
    })
  }

  sendEmail(email) {
    this.loading = true;
    var emailRegexp: RegExp = EMAIL_REGEX
    if (email && !emailRegexp.test(email)) {
      this.loading = false;
      this._toast.error('Invalid email entered.', 'Error');
      return false;
    }
    this._authService.forgetEmailLockScreen({ Email: email }).subscribe((res: any) => {
      if (res.returnId > 0) {
        this.loading = false;
        this._toast.success("Email sent successfully.", "Success");
        this.passwordField = !this.passwordField;
        this.email = '';
      } else {
        this.loading = false;
        this._toast.error(res.returnText, "Failed");
      }
    }, (err: HttpErrorResponse) => {
      this.loading = false;
    })
  }

  forgetLink() {
    this.passwordField = !this.passwordField;
  }

  ngAfterViewInit() {
    var loader = document.getElementsByClassName("overlay")[0] as HTMLElement;
    loader.style.display = "none";
  }

}
