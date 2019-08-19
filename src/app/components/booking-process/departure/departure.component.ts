import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, ViewChild } from '@angular/core';
import { SaveBooking } from '../../../interfaces/save-booking';
import { BookingService } from '../booking.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { LoginDialogComponent } from '../../../shared/dialogues/login-dialog/login-dialog.component';
import { HashStorage, Tea, createSaveObject, getImagePath, ImageSource, ImageRequiredSize, loading, getTimeStr, getProviderImage } from '../../../constants/globalfunctions'
import { BookingDetails, SaveBookingObject } from '../../../interfaces/bookingDetails';
import { DropDownService } from '../../../services/dropdownservice/dropdown.service';
import { Router } from '@angular/router';
import { DataService } from '../../../services/commonservice/data.service';
import { SearchCriteria } from '../../../interfaces/searchCriteria';
import { CurrencyControl } from '../../../shared/currency/currency.injectable';
import { ExchangeRate } from '../../../interfaces/currencyDetails';
import { Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';


@Component({
  selector: 'app-departure',
  templateUrl: './departure.component.html',
  styleUrls: ['./departure.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class DepartureComponent implements OnInit {

  public BookingContainerTypeDetail = [];
  // public message: boolean = true;
  public saveBookingObj: SaveBookingObject;
  public orderSummary: BookingDetails
  public insuranceAmount;
  public searchCriteria: SearchCriteria
  public transitDays: string
  public BookingDesc: string = '';
  public BookingAcknowledgment: boolean = false;


  // @Output() messageEvent = new EventEmitter<boolean>();
  @Output() tabChange = new EventEmitter<string>();
  @Output() departureEvent = new EventEmitter<string>();
  public hasTextError: boolean = false;
  public hasCheckError: boolean = false;
  public incoList: any = []
  public selectedInco: number = -1;
  protected isPaymentDispatched: boolean = false

  constructor(
    private _bookingService: BookingService,
    private _toast: ToastrService,
    private _modalService: NgbModal,
    private _dropDownService: DropDownService,
    private _router: Router,
    private _dataService: DataService,
    private _currencyControl: CurrencyControl


  ) { }

  ngOnInit() {
    this.searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))
    this.orderSummary = this._dataService.getBookingData()
    this.BookingDesc = this.orderSummary.BookingDesc
    this.BookingAcknowledgment = this.orderSummary.BookingAcknowledgment
    this.setTransitDays()
    // this.getIncoList()
    this.insuranceAmount = this.orderSummary.InsuredGoodsPrice * this.orderSummary.ProviderInsurancePercent / 100;
    // if (this.orderSummary.BookingID !== -1 && this.orderSummary.IncoID) {
    //   this.selectedInco = this.orderSummary.IncoID
    //   const arr = this.incoList.filter(e => e.id === this.orderSummary.IncoID)
    //   this.selectedInco = arr[0]
    // }
  }

  confirmBooking() {
    let userItem = JSON.parse(Tea.getItem('loginUser'));
    if (userItem && !userItem.IsLogedOut && userItem.IsVerified) {
      this.orderSummary.BookingPriceDetail.forEach((e) => {
        if (e.SurchargeType === 'VASV' && !(e.SurchargeCode === 'INSR' || e.SurchargeCode === 'TRCK' || e.SurchargeCode === 'QLTY')) {
          let index = this.orderSummary.BookingPriceDetail.indexOf(e);
          this.orderSummary.BookingPriceDetail.splice(index, 1)
        }
      });
      // this.tabChange.emit('tab-billing') @todo // un comment it when billing tab will be enabled
      this.confirmBookingWithoutPayment()
    } else if (!userItem || userItem && userItem.IsLogedOut) {
      const modalRef = this._modalService.open(LoginDialogComponent, { size: 'lg', centered: true, windowClass: 'small-modal' });
      modalRef.result.then((result) => {
        if (result) {
          this._toast.success('Logged in successfully.', 'Success');
        }
      });
    }
    else if (userItem && !userItem.IsVerified) {
      this._toast.warning('You need to verify your email address before making a booking.', 'Info');
    }
  }

  backToOptional() {
    this.tabChange.emit('tab-optional-services');
  }

  setTransitDays() {

    const { TransitTime } = this.orderSummary
    const { searchMode } = this.searchCriteria

    if ((searchMode === 'sea-fcl' || searchMode === 'truck-ftl') && this.orderSummary.EtdUtc && this.orderSummary.EtdUtc.length > 1) {
      this.transitDays = TransitTime + ''
    } else if (searchMode === 'air-lcl') {
      this.transitDays = getTimeStr(TransitTime)
    }

  }


  getUIImage($image: string, isProvider) {
    if (isProvider) {
      const providerImage = getProviderImage($image)
      return getImagePath(ImageSource.FROM_SERVER, providerImage, ImageRequiredSize.original)
    } else {
      return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
    }
  }

  onBookingCheck() {
    this.BookingAcknowledgment = !this.BookingAcknowledgment
    this.orderSummary.BookingAcknowledgment = this.BookingAcknowledgment;
    this._dataService.setBookingsData(this.orderSummary)
  }

  onFocusOut(event) {
    // this.BookingDesc = event.target.value;
    this.orderSummary.BookingDesc = this.BookingDesc
    this._dataService.setBookingsData(this.orderSummary)
  }

  confirmBookingWithoutPayment() {
    loading(true)
    if (this.isPaymentDispatched === true) {
      return
    }
    this.isPaymentDispatched = true
    const userItem = JSON.parse(Tea.getItem('loginUser'));
    if (!this.BookingDesc || !this.BookingAcknowledgment) {
      if (!this.BookingDesc) {
        this.hasTextError = true;
      }
      if (!this.BookingAcknowledgment) {
        this.hasCheckError = true;
      }
      this._toast.error('Please fill the required fields', 'Error')
      this.isPaymentDispatched = false
      loading(false)
      return false;
    }

    this.hasCheckError = false;
    this.hasTextError = false;
    this.saveBookingObj = createSaveObject(userItem, this.orderSummary, 'In-Review')
    this._dropDownService.getExchangeRateList(this._currencyControl.getBaseCurrencyID()).subscribe((res: any) => {
      let exchangeData: ExchangeRate = res.returnObject
      this._currencyControl.setExchangeRateList(exchangeData)
      let newSaveObject = this._currencyControl.getSaveObjectByLatestRates(this.saveBookingObj, res.returnObject)
      this.saveBookingObj = newSaveObject
      if (this.searchCriteria.searchMode !== 'warehouse-lcl') {
        this._bookingService.saveBooking(this.saveBookingObj).subscribe((res: any) => {
          this.isPaymentDispatched = false
          if (res.returnId > 0) {
            this._toast.info('Rates may have been updated since the booking was last saved.', 'Booking Successful');
            HashStorage.removeItem('selectedDeal');
            HashStorage.removeItem('CURR_MASTER')
            HashStorage.setItem('bookinRef', res.returnText);
            this._router.navigate(['/thankyou-booking'])
            // this.messageEvent.emit(this.message);
            loading(false);
          } else {
            loading(false);
            this._toast.error(res.returnText, 'Failed')
          }
        }, (err) => {
          this.isPaymentDispatched = false
          loading(false);
          this._toast.error('An unexpected error occurred while saving your booking, Please try again later.', 'Failed');
        })
      } else if (this.searchCriteria.searchMode === 'warehouse-lcl') {
        this._bookingService.saveWarehouseBooking(this.saveBookingObj).subscribe((res: any) => {
          this.isPaymentDispatched = false
          if (res.returnId > 0) {
            this._toast.info('Rates may have been updated since the booking was last saved.', 'Booking Successful');
            HashStorage.removeItem('selectedDeal');
            HashStorage.removeItem('CURR_MASTER')
            HashStorage.setItem('bookinRef', res.returnText);
            this._router.navigate(['/thankyou-booking']);
            loading(false);
          } else {
            loading(false);
            this._toast.error(res.returnText, 'Failed')
          }
        }, (err) => {
          this.isPaymentDispatched = false
          loading(false);
          this._toast.error('An unexpected error occurred while saving your booking, Please try again later.', 'Failed');
        })
      }
    })
  }

  getIncoList() {
    this._dropDownService.getInco().subscribe((res: any) => {
      this.incoList = res
    }, (err) => {
    })
  }

  onIncoSelection(event) {
    this.orderSummary.IncoID = event.id
    this._dataService.setBookingsData(this.orderSummary)
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => term === '' ? []
        : this.incoList.filter(v => v.title.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

  formatter = (x: { title: string }) => x.title;

}
