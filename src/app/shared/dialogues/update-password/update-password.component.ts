import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Location, PlatformLocation } from '@angular/common';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './../../../services/authservice/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { HashStorage } from '../../../constants/globalfunctions';
import { DataService } from '../../../services/commonservice/data.service';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UpdatePasswordComponent implements OnInit, AfterViewInit {

  public colorEye;
  public passwordError;
  closeResult: string;
  currentJustify = 'justified';
  updateForm: FormGroup;


  constructor(
    private authService: AuthService,
    private activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private _toast: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _location: Location,
    private _browseNavigate: PlatformLocation,
    private _dataService: DataService
  ) {
    _browseNavigate.onPopState(() => this.closeModal());
  }

  ngOnInit() {
    this.updateForm = new FormGroup({
      password: new FormControl('', { validators: [Validators.required, Validators.minLength(6), Validators.maxLength(15)] })
    });
  }
  ngAfterViewInit() {
    // this.updateForm = new FormGroup({
    //   password: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(15)]),

    // });
  }
  errorMessages() {

    if (this.updateForm.controls.password.status == "INVALID" && this.updateForm.controls.password.touched) {
      this.passwordError = true;
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

  closeModal() {
    this._location.replaceState('login');
    this.activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }

  loginModal() {
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



  updatePassword(obj) {
    this.errorMessages();
    if (this.updateForm.invalid) {
      return;
    }
    const customerSettings = JSON.parse(HashStorage.getItem('customerSettings'))

    let object = {
      Code: this._dataService.getUpdatePassCode(),
      Password: obj.password,
      PortalName: 'ENTERPRISE',
      CustomerID: (customerSettings.customerID) ? customerSettings.customerID : null,
      CustomerType: (customerSettings.customerType) ? customerSettings.customerType : null,
    };
    this.authService.userupdatepassword(object).subscribe((res: any) => {
      if (res.returnStatus == "Error") {
        this._toast.error(res.returnText);
      }
      else if (res.returnStatus == "Success") {
        this._toast.success("Password updated successfully.");
        this.updateForm.reset();
        this.closeModal()
        this._location.replaceState('login');
      }
    }, (err: HttpErrorResponse) => {
    })
  }


}
