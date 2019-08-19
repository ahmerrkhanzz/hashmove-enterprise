import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { DataService } from '../../../services/commonservice/data.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CancelBookingDialogComponent } from '../../dialogues/cancel-booking-dialog/confirm-booking-dialog.component';
import { ConfirmModifySearchComponent } from '../../dialogues/confirm-modify-search/confirm-modify-search.component';
import { LoginDialogComponent } from '../../dialogues/login-dialog/login-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { BookingService } from '../../../components/booking-process/booking.service'
import { HashStorage, Tea, createSaveObject, loading, getLoggedUserData } from '../../../constants/globalfunctions';
import { BookingDetails, SaveBookingObject } from '../../../interfaces/bookingDetails';
import { DropDownService } from '../../../services/dropdownservice/dropdown.service';
import { ConfirmSavePaymentComponent } from '../../dialogues/confirm-save-payment/confirm-save-payment.component';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { HashmoveLocation } from '../../../interfaces/searchResult';
import { CurrencyControl } from '../../currency/currency.injectable';
import { CookieService } from '../../../services/cookies.injectable';
import { BookingStaticUtils } from '../../../components/booking-process/booking-static-utils';

@Component({
  selector: 'app-search-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-header.component.html',
  styleUrls: ['./search-header.component.scss'],
  providers: [BookingService, DropDownService]
})
export class SearchHeaderComponent implements OnInit, OnDestroy {
  public searchCriteria: any;
  public PickupDate: any;
  public DeliveryDate: any;
  public pickupCountry: string;
  public deliverCountry: string;
  public containersQty: number = 0;
  public orderSummary: BookingDetails
  public BookingContainerTypeDetail = [];
  userItem: any;
  public saveBookingObj: SaveBookingObject;
  public hashmoveLocation: HashmoveLocation = null

  @Input() name: string;
  @Input() buttons: boolean;
  @Input() strActiveTabId: string;
  @Input() page?: string;
  public taxData: any;
  public total: any;
  public subTotal: any;

  constructor(private _dataService: DataService,
    private _bookingService: BookingService,
    private _toast: ToastrService,
    private _router: Router,
    private _modalService: NgbModal,
    private _dropDownService: DropDownService,
    private _currencyControl: CurrencyControl,
    private _cookieService: CookieService
  ) {
  }

  ngOnInit() {
    if (!HashStorage) {
      this._router.navigate(['enable-cookies']);
      return
    }
    if (HashStorage) {
      this.getSearchCriteria();
      this.orderSummary = this._dataService.getBookingData()
    }
    this._dataService.currentBokkingDataData.pipe(untilDestroyed(this)).subscribe((res) => {
      if (res) {
        this.orderSummary = res;
      }
    });

    this._dataService.dsHashmoveLocation.pipe(untilDestroyed(this)).subscribe(state => {
      if (state) {
        this.hashmoveLocation = state
      } else {
        this.hashmoveLocation = null
      }
    })

    window.addEventListener('scroll', this.scroll, true); //third parameter
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scroll, true);
  }

  scroll = ($event): void => {
    const scroller = document.querySelector('.results-header');
    scroller.classList.remove('scrolled');
    if ($event.target.scrollTop > 70 && $event.target.childElementCount > 1) {
      scroller.classList.add('scrolled');
    }
  };


  getSearchCriteria() {
    if (HashStorage.getItem("searchCriteria")) {
      let jsonString = HashStorage.getItem("searchCriteria");
      this.searchCriteria = JSON.parse(jsonString);
      if (this.searchCriteria.searchMode !== 'warehouse-lcl') {
        if (this.searchCriteria.containerLoad === 'FCL' || this.searchCriteria.containerLoad === 'FTL') {
          this.searchCriteria.SearchCriteriaContainerDetail.forEach(obj => {
            if (obj.contRequestedQty) {
              this.containersQty += Number(obj.contRequestedQty)
            } else {
              this.containersQty += Number(obj.BookingContTypeQty)
            }
          })
        } else {
          this.searchCriteria.SearchCriteriaContainerDetail.forEach(obj => {
            if (obj.contRequestedCBM) {
              this.containersQty += Number(obj.contRequestedCBM)
            } else {
              this.containersQty += Number(obj.BookingContTypeQty)
            }
          })
          this.containersQty = Math.ceil(this.containersQty)
        }

        // this.pickupCountry = this.searchCriteria.pickupPortCode.split(' ').shift().toLowerCase();
        // this.deliverCountry = this.searchCriteria.deliveryPortCode.split(' ').shift().toLowerCase();

        if (this.searchCriteria.pickupPortCode === 'GROUND') {
          this.pickupCountry = this.searchCriteria.SearchCriteriaPickupGroundDetail.AddressComponents.ShortName_L1.toLowerCase()
        } else {
          this.pickupCountry = this.searchCriteria.pickupPortCode.split(' ').shift().toLowerCase();
        }

        if (this.searchCriteria.deliveryPortCode === 'GROUND') {
          this.deliverCountry = this.searchCriteria.SearchCriteriaDropGroundDetail.AddressComponents.ShortName_L1.toLowerCase()
        } else {
          this.deliverCountry = this.searchCriteria.deliveryPortCode.split(' ').shift().toLowerCase();
        }
        this.PickupDate = new Date(this.searchCriteria.pickupDate);
        if (this.searchCriteria.searchMode === 'air-lcl') {
          this.DeliveryDate = new Date(this.searchCriteria.pickupDateTo);
        } else {
          this.DeliveryDate = null;
        }
      } else if (this.searchCriteria.searchMode === 'warehouse-lcl') {
        this.PickupDate = new Date(this.searchCriteria.StoreFrom);
        this.DeliveryDate = new Date(this.searchCriteria.StoreUntill);
      }

    }
  }


  modify() {
    this._modalService.open(ConfirmModifySearchComponent, {
      size: 'sm',
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

  onCancelClicked() {
    this._dataService.cancelBookingMsg = {
      messageTitle: 'Cancel Booking',
      messageContent: 'Are you sure you want to cancel your Booking?',
      openedFrom: 'booking-process',
      buttonTitle: 'Yes I would like to Cancel this booking',
      data: ''
    }

    this._modalService.open(CancelBookingDialogComponent, {
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

  saveBooking() {

    if (this.orderSummary.BookingType && this.orderSummary.BookingType === 'specialrequest') {
      this._toast.warning('Special Bookings cannot be saved as they are already Draft', 'Warning')
      return;
    }

    this._dataService.saveButtonTrigger.next(true)
    if (this.strActiveTabId && this.strActiveTabId === 'tab-billing') {
      const modalRef = this._modalService.open(ConfirmSavePaymentComponent, { size: 'lg', centered: true, windowClass: 'small-modal' });
      modalRef.result.then((result) => {
        if (result === 'confirm') {
          BookingStaticUtils.saveBookingAction(this.orderSummary,
            getLoggedUserData(),
            this._cookieService,
            this._dropDownService,
            this._bookingService,
            this.strActiveTabId,
            this.searchCriteria,
            this._toast,
            this._currencyControl,
            this._router,
            this._modalService,
            true
          )
        }
      });
      return
    }
    BookingStaticUtils.saveBookingAction(this.orderSummary,
      getLoggedUserData(),
      this._cookieService,
      this._dropDownService,
      this._bookingService,
      this.strActiveTabId,
      this.searchCriteria,
      this._toast,
      this._currencyControl,
      this._router,
      this._modalService,
      true
    )
  }



  setTaxData() {
    const taxData = this._dataService.getTaxData()
    const surChargeLenght = this.orderSummary.BookingSurChargeDetail.length
    for (let index = 0; index < surChargeLenght; index++) {
      const charge = this.orderSummary.BookingSurChargeDetail[index];
      if (charge.SurchargeType === 'TAX') {
        this.orderSummary.BookingSurChargeDetail[index] = taxData
      }
    }
  }
}




