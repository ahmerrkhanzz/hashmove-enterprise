import { Component, OnInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../services/authservice/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { PlatformLocation } from '@angular/common';


@Component({
  selector: 'app-confirm-delete-account',
  templateUrl: './confirm-delete-account.component.html',
  styleUrls: ['./confirm-delete-account.component.scss']
})
export class ConfirmDeleteAccountComponent implements OnInit {

  @Input() account: any;
  loading
  constructor(
    private _activeModal: NgbActiveModal,
    private _authService: AuthService,
    private _toast: ToastrService,
    private location: PlatformLocation
  ) {
    location.onPopState(() => this.closeModal());
  }

  ngOnInit() {
  }
  closeModal() {
    this._activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }

  onConfirmClick() {
    this.loading = true;
    this._authService.userDelete(this.account.deletingUserID, this.account.deleteByUserID).subscribe((res: any) => {
      this.loading = false;
      if (res.returnStatus == "Error") {
        this._toast.error(res.returnText);
        this.closeModal();
      }
      else if (res.returnStatus == "Success") {
        if (this.account.type === 'user') {
          this._toast.info("Your request has been sent to the admin of your organization.", '');
        } else {
          this._toast.info("Your request to delete your account has been submitted to the HashMove Support Team.", '');
        }
        this.closeModal();
      }
    }, (err: HttpErrorResponse) => {
      this.loading = false;
    })
  }
}
