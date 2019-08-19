import { Component, OnInit, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators} from '@angular/forms';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { UpdatePasswordComponent } from '../update-password/update-password.component';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './../../../services/authservice/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { getLoggedUserData, Tea } from '../../../constants/globalfunctions';



@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  public emailSend: boolean = false;
  closeResult: string;
  currentJustify = 'justified';
  resetForm;
  public userInfo:any;
  @Output() onLoginClick = new EventEmitter<string>();



  constructor(
    private authService: AuthService,
    private activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private _toast: ToastrService,
    private location: PlatformLocation
  ) {
    location.onPopState(() => this.closeModal());
  }

  ngOnInit() {
    this.userInfo = JSON.parse(localStorage.getItem('customerSettings'))
    this.resetForm = new FormGroup({
      email: new FormControl(null, [
        Validators.required,
        Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}"),
        Validators.email
      ])

    });

    this.setDefaultEmail()

  }

  async setDefaultEmail() {
    const userInfo = getLoggedUserData()
    if (userInfo) {
      const { PrimaryEmail } = userInfo
      this.resetForm.controls['email'].setValue(PrimaryEmail)
    }
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

  closeModal() {
    this.activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  }


  loginModal() {
    this.onLoginClick.emit('login')
    // this.activeModal.close();
    // document.getElementsByTagName('html')[0].style.overflowY = 'auto';
    // this.modalService.open(LoginDialogComponent, {
    // size: 'lg',
    // centered: true,
    // windowClass: 'small-modal',
    // backdrop: 'static',
    // keyboard : false  });
    // setTimeout(() => {
    //   if(document.getElementsByTagName('body')[0].classList.contains('modal-open')){
    //     document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
    //   }
    // }, 0);
  }



  resetPassword(obj){
    if (this.resetForm.invalid) {
      return;
    }
    let object = {
      loginUserID: obj.email,
      RedirectUrl: window.location.protocol + "//" + window.location.host + "/login",
      customerID: this.userInfo.customerID,
      portalName: this.userInfo.portalName,
    }
    this.authService.userforgetpassword(object).subscribe((res: any) => {
      if (res.returnStatus == "Error") {
        this._toast.error(res.returnText);
        this.resetForm.reset();
        this.emailSend = false;

      }
      else if (res.returnStatus == "Success") {
        this._toast.success("A reset password link is on its way to your inbox.");
        this.emailSend = true;

      }
    }, (err: HttpErrorResponse) => {
      this.emailSend = false;
    })
  }


}
