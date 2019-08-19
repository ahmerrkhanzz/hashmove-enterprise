import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { getImagePath, ImageSource, ImageRequiredSize, getDateDiff, encryptBookingID, Tea, getProviderImage, isJSON } from '../../../constants/globalfunctions';
import { Router } from '@angular/router';
import { DataService } from '../../../services/commonservice/data.service';
import { CancelBookingDialogComponent } from '../../dialogues/cancel-booking-dialog/confirm-booking-dialog.component';
import { ConfirmBookingDialogComponent } from '../../dialogues/confirm-booking-dialog/confirm-booking-dialog.component';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PriceLogsComponent } from '../../dialogues/price-logs/price-logs.component'
import { CargoDetailsComponent } from '../../dialogues/cargo-details/cargo-details.component'
import { RequestSpeacialPriceComponent } from '../../dialogues/request-speacial-price/request-speacial-price.component';
import { baseExternalAssets } from '../../../constants/base.url';

@Component({
  selector: 'app-booking-card',
  templateUrl: './booking-card.component.html',
  styleUrls: ['./booking-card.component.scss']
})
export class BookingCardComponent implements OnInit {
  @Input() bookings: any
  @Output() bookingRemove = new EventEmitter<number>();
  public dateDifference: any;
  constructor(
    private _router: Router,
    private _dataService: DataService,
    private _modalService: NgbModal,
    private _activeModal: NgbActiveModal
  ) { }

  public statusCode = {
    DRAFT: 'draft',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    CONFIRMED: 'confirmed',
    IN_TRANSIT: 'in-transit',
    RE_UPLOAD: 're-upload',
    COMPLETED: 'completed',
    READY_TO_SHIP: 'ready to ship',
    IN_REVIEW: 'in-review',
    PENDING: 'pending',
    REQUESTED_AGAIN: 'requested again'
  }

  ngOnInit() {
    this.dateDifference = getDateDiff(this.bookings.StoredUntilUtc, this.bookings.StoredFromUtc, 'days', "YYYY-MM-DD")
    try {
      if (this.bookings.JSONSpecialRequestLogs) {
        this.bookings.parsedJSONSpecialRequestLogs = JSON.parse(this.bookings.JSONSpecialRequestLogs)
      }
    } catch {
      console.log('error');
    }
  }
  getUIImage($image: string) {
    if (isJSON($image)) {
      const providerImage = JSON.parse($image)
      return baseExternalAssets + '/' + providerImage[0].DocumentFile
    } else {
      return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
    }
  }

  getProviderImage($image: string) {
    const providerImage = getProviderImage($image)
    return getImagePath(ImageSource.FROM_SERVER, providerImage, ImageRequiredSize.original)
  }

  viewBookingDetails(bookingId, userId, shippingModeCode) {
    if (this.bookings.BookingTab.toLowerCase() === 'saved' || this.bookings.BookingTab.toLowerCase() === 'specialrequest') {
      return;
    }
    const safeBookingId = encryptBookingID(bookingId, userId, shippingModeCode)
    this._router.navigate(['/user/booking-detail', safeBookingId]);
  }


  continueBooking(bookingId, userId, shippingModeCode, bookingTab) {
    const encBookingID = encryptBookingID(bookingId, userId, shippingModeCode)
    this._activeModal.close();
    const modalRef = this._modalService.open(ConfirmBookingDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.bookingId = encBookingID
    modalRef.componentInstance.bookingType = bookingTab
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }

  discardSaveBooking(bookingId) {
    let userData = JSON.parse(Tea.getItem("loginUser"));
    let toSend = {
      loginUserID: userData.UserID,
      BookingID: bookingId
    };

    this._dataService.cancelBookingMsg = {
      messageTitle: "Discard Booking",
      messageContent: "Are you sure you want to discard the booking?",
      openedFrom: "/user/dashboard",
      buttonTitle: "Yes, I want to discard",
      data: toSend
    };
    const modalRef = this._modalService.open(CancelBookingDialogComponent, {
      size: "lg",
      backdrop: "static",
      centered: true,
      windowClass: "small-modal",
      keyboard: false
    });
    modalRef.result.then(result => {
      this.bookingRemove.emit(result)
    });
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


  /**
   *
   * VIEW CARGO DETAILS
   * @param {object} booking
   * @memberof BookingCardComponent
   */
  openCargoDetails(booking) {
    const modalRef = this._modalService.open(CargoDetailsComponent, {
      size: "sm",
      backdrop: "static",
      centered: true,
      windowClass: "carge-detail",
      keyboard: false
    });
    modalRef.result.then(result => {
      // this.bookingRemove.emit(result)
    });
    modalRef.componentInstance.data = this.bookings
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


  /**
   *
   * VIEW PRICE LOGS
   * @param {object} booking
   * @memberof BookingCardComponent
   */
  openPriceLog(booking) {
    const modalRef = this._modalService.open(PriceLogsComponent, {
      size: "lg",
      backdrop: "static",
      centered: true,
      windowClass: 'request-special',
      keyboard: false
    });
    modalRef.componentInstance.data = {
      booking: this.bookings,
      logs: JSON.parse(this.bookings.JSONSpecialRequestLogs)
    }
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

  public specialStatus: string;
  public cachedLogs: any[] = []
  onSpecialPrice() {
    const modalRef = this._modalService.open(RequestSpeacialPriceComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'request-special',
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.data = this.bookings
    modalRef.result.then(result => {
      if (result) {
        this.specialStatus = result.status
        this.bookings.SpecialRequestStatus = result.status
        this.cachedLogs = result.logs
      }
    })
  }

}
