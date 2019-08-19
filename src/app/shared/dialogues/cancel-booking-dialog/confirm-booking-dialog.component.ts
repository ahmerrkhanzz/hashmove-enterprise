import { Component, OnInit, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DataService } from '../../../services/commonservice/data.service';
import { CancelDialogContent } from '../../../interfaces/cancel-dialog';
import { UserService } from '../../../components/user/user-service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { PlatformLocation } from '@angular/common';
import { HashStorage, Tea, getLoggedUserData } from '../../../constants/globalfunctions';
import { UserDashboardData } from '../../../interfaces/user-dashboard';

@Component({
  selector: 'app-confirm-cancel-dialog',
  templateUrl: './confirm-booking-dialog.component.html',
  styleUrls: ['./confirm-booking-dialog.component.scss'],
  providers: [UserService]
})
export class CancelBookingDialogComponent implements OnInit {
  @Input() cancelData: any;
  messageData: CancelDialogContent = {
    messageTitle: 'Cancel Booking',
    messageContent: 'Are you sure you want to cancel your Booking?',
    openedFrom: 'cancel-booking',
    data: '',
    buttonTitle: 'Yes'
  }

  resp: any

  isRouting: boolean = false
  previousUrl: string;
  public reasons: CancelReasons[];
  bookingStatus: any;
  public cancel = {
    id: '',
    remarks: '',
    reasonText: ''
  }

  constructor(
    private _router: Router,
    private _activeModal: NgbActiveModal,
    private _dataService: DataService,
    private toastr: ToastrService,
    private _booking: UserService,
    private location: PlatformLocation,
    private _userService: UserService
  ) {
    location.onPopState(() => this.closeModal());
    this._router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe(e => {
      });
  }

  ngOnInit() {
    this.messageData = this._dataService.cancelBookingMsg
    this.isRouting = false
    if (this.cancelData && this.cancelData.type === 'cancel') {
      this.getCancelReasons()
      this.getBookingStatus()
    }
  }

  closeModal() {
    if (this.isRouting) {
      return
    }
    this._activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }

  onConfirmClick() {
    if (this.messageData.openedFrom === 'booking-process') {
      this.cancelBookingAction()
    } else if (this.messageData.openedFrom === '/user/dashboard') {
      this.discardBookingAction()
      // this._activeModal.close()
      document.getElementsByTagName('html')[0].style.overflowY = 'auto';
    } else {
      this._activeModal.close()
      document.getElementsByTagName('html')[0].style.overflowY = 'auto';
    }
  }

  cancelBookingAction() {
    this.isRouting = true
    localStorage.removeItem('searchCriteria');
    // localStorage.removeItem('searchResult');
    localStorage.removeItem('selectedCarrier');
    localStorage.removeItem('providerSearchCriteria');
    // localStorage.removeItem('bookingInfo');
    this._router.navigate(['/home']).then(() => {
      this._activeModal.close()
      document.getElementsByTagName('html')[0].style.overflowY = 'auto';
      this.isRouting = false
    })
  }

  discardBookingAction() {
    this.isRouting = true
    this._booking.discardBooking(this.messageData.data).subscribe(res => {
      this.resp = res
      if (this.resp.returnId > 0) {
        this.toastr.success(this.resp.returnText, this.resp.returnStatus)
        this._dataService.reloadBoard.next(true)
      } else {
        this.toastr.warning(this.resp.returnText, this.resp.returnStatus)
      }
      this.isRouting = true
      this._activeModal.close(this.resp.returnId);
      document.getElementsByTagName('html')[0].style.overflowY = 'auto';
    }, (err: HttpErrorResponse) => {
      this.toastr.error('There was an error while updating your booking, please try later')
      this.isRouting = false
      this._activeModal.close(-1)
      document.getElementsByTagName('html')[0].style.overflowY = 'auto';
    })
  }

  getBookingStatus() {
    const toSend: string = (this.cancelData.booking.ShippingModeCode === 'WAREHOUSE') ? 'WAREHOUSE' : 'BOOKING'
    this._userService.getBookingStatuses(toSend).subscribe((res: any) => {
      this.bookingStatus = res.returnObject.filter(e => e.BusinessLogic === 'CANCELLED')
    })
  }

  getCancelReasons() {
    this._userService.getBookingReasons().subscribe((res: any) => {
      if (res.returnId === 1) {
        this.reasons = res.returnObject.filter(e => e.BusinessLogic !== 'CANCELLED')
      } else {
        this.toastr.error('There was an error while updating your booking, please try later')
      }
    }, (err) => {
      this.toastr.error('There was an error while updating your booking, please try later')
    })
  }

  submitCancel() {
    if (!this.cancel.id) {
      this.toastr.error('Please select reason', 'Error')
      return false;
    }
    if (!this.cancel.remarks) {
      this.toastr.error('Please provide reason remarks', 'Error')
      return false;
    }

    let _CompanyName: string = ''

    try {
      const cmpy: UserDashboardData = this._dataService.getDashboardData();
      if (cmpy.CompanyName) {
        _CompanyName = cmpy.CompanyName
      } else {
        _CompanyName = ''
      }
    } catch (error) { }

    const userInfo = JSON.parse(Tea.getItem('loginUser'))
    const obj = {
      bookingID: this.cancelData.booking.BookingID,
      bookingStatus: this.bookingStatus[0].StatusName,
      bookingStatusRemarks: this.cancel.remarks,
      createdBy: userInfo.LoginID,
      modifiedBy: '',
      approverID: userInfo.UserID,
      approverType: 'USER',
      reasonID: parseInt(this.cancel.id),
      reasonText: this.cancel.reasonText,
      providerName: this.cancelData.booking.ProviderName,
      emailTo: this.cancelData.booking.ProviderEmail,
      phoneTo: this.cancelData.booking.ProviderPhone,
      userName: this.cancelData.booking.UserName,
      userCompanyName: _CompanyName,
      hashMoveBookingNum: this.cancelData.booking.HashMoveBookingNum,
      userCountryPhoneCode: this.cancelData.booking.ProviderCountryPhoneID
    }
    this._userService.cancelBooking(obj).subscribe((res: any) => {
      if (res.returnId > 0) {
        this._activeModal.close(res.returnObject)
        this.toastr.success(res.returnText, 'Success')
      } else {
        this.toastr.error('There was an error while updating your booking, please try later')
      }
    }, (err) => {
      this.toastr.error('There was an error while updating your booking, please try later')
    })
  }

  async onReasonChange($event: any) {
    try {
      const { reasons } = this
      this.cancel.reasonText = reasons.filter(reason => reason.ReasonID === parseInt($event))[0].ReasonName
    } catch (error) {
      console.log(error);
    }
  }
}

export interface CancelReasons {
  BusinessLogic: string;
  ReasonCode?: string;
  ReasonID: number;
  ReasonName: string;
}
