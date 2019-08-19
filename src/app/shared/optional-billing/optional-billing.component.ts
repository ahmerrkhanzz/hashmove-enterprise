import { Component, OnInit, ViewEncapsulation, Input, OnDestroy } from '@angular/core';
import { HashStorage, cloneObject } from '../../constants/globalfunctions'
import { BookingSurChargeDetail, BookingDetails } from '../../interfaces/bookingDetails';
import { DataService } from '../../services/commonservice/data.service';
import { PreviousRouteService } from '../../services/commonservice/previous-route.service';
import { PlatformLocation } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { CurrencyControl } from '../currency/currency.injectable';


@Component({
  selector: 'app-optional-billing',
  templateUrl: './optional-billing.component.html',
  styleUrls: ['./optional-billing.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OptionalBillingComponent implements OnInit, OnDestroy {
  @Input() insrData: any;
  @Input() showVAS: boolean;
  @Input() insuranceAmount: number = 0;
  @Input() additionalCharges: any;
  @Input() closeIcon: boolean;

  public vasData = [];
  public billingData: any;
  public freightData: any = [];
  public bookingInfo: BookingDetails;
  public additionalData: any = [];
  public taxData: Array<BookingSurChargeDetail> = [];
  public discountData: BookingSurChargeDetail = null;
  public total: any = [];
  public subTotal: number = 0;
  public currencyCode: string;
  public discountedPrice: number = 0;
  public discountedPercent: number = 0;
  public includeInsuranceAmount: boolean = false
  public prevInsurance: number = 0
  public combinedAddedArray: any = []
  public showVasSection: boolean = false;
  public searchCriteria: any;
  public readArrayPrice: any;
  public oldTaxValue: any;
  public isInsured: boolean = false
  public discountedAmount: number = null

  constructor(
    private _dataService: DataService,
    private _previousRouteService: PreviousRouteService,
    private location: PlatformLocation,
    private _activeModal: NgbActiveModal,
    private _currencyControl: CurrencyControl
  ) {
    location.onPopState(() => this.closeModal());
  }

  ngOnInit() {
    this.searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))
    this._dataService.currentBokkingDataData.pipe(untilDestroyed(this)).subscribe(state => {
      if (state) {
        const { BookingPriceDetail } = state
        try {
          console.log(this.bookingInfo.ImpExpCharges2Remove);
        } catch (error) { }
        this.isInsured = state.IsInsured;
        this.bookingInfo = state;
        this.showVasSection = false;
        this.currencyCode = this.bookingInfo.CurrencyCode
        this.total = [];
        this.vasData = [];
        if (location.href.includes('booking-detail')) {
          const bookingDtl: any = state
          this.searchCriteria = JSON.parse(bookingDtl.JsonSearchCriteria)
        } else {
          this.searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))
        }

        let priceList = cloneObject(this.bookingInfo.BookingPriceDetail)
        try {
          if (this.bookingInfo.ImpExpCharges2Remove && this.bookingInfo.ImpExpCharges2Remove.length > 0) {
            const { ImpExpCharges2Remove } = this.bookingInfo
            ImpExpCharges2Remove.forEach($charge => {
              if ($charge.state) {
                // priceList = priceList.filter(element => !(element.SurchargeID === $charge.chargeID && element.Imp_Exp.toLowerCase() === $charge.chargeType));
                const index = priceList.findIndex(element => element.SurchargeCode === $charge.chargeID && element.Imp_Exp.toLowerCase() === $charge.chargeType);
                if (index !== -1) {
                  priceList.splice(index, 1);
                }
              }
            });
          }
        } catch (error) { }
        if (this.bookingInfo.isExcludeExp || this.bookingInfo.isExcludeImp) {
          if (this.bookingInfo.isExcludeExp && !this.bookingInfo.isExcludeImp) {
            const expFilteredPrices = priceList.filter((element: any) => element.Imp_Exp !== 'EXPORT');
            this.priceCalculation(expFilteredPrices)
          }
          if (this.bookingInfo.isExcludeImp && !this.bookingInfo.isExcludeExp) {
            const impFilteredPrices = priceList.filter((element: any) => element.Imp_Exp !== 'IMPORT');
            this.priceCalculation(impFilteredPrices)
          }
          if (this.bookingInfo.isExcludeExp && this.bookingInfo.isExcludeImp) {
            const impExpFilteredPrices = priceList.filter((element: any) => element.Imp_Exp !== 'IMPORT' && element.Imp_Exp !== 'EXPORT');
            this.priceCalculation(impExpFilteredPrices)
          }
        } else {
          this.priceCalculation(priceList)
        }

      }
    });

    if (this.bookingInfo.DiscountPrice) {
      this.discountedPrice = this.bookingInfo.DiscountPrice;
      this.discountedPercent = this.bookingInfo.DiscountPercent
    }
  }

  // ngOnDestroy() {
  //   window.removeEventListener('scroll', this.scroll, true);
  // }
  closeModal() {
    this._activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }

  priceCalculation(priceArray) {
    if (this.searchCriteria.searchMode === 'warehouse-lcl') {
      const readArray = priceArray;
      this.billingData = readArray
      const vas = priceArray.filter((element: any) => element.SurchargeType === 'VASV');

      // check if its Coming from continue booking
      if (this.bookingInfo.BookingID !== -1) {
        if (!this.bookingInfo.IsInsured) {
          priceArray.forEach(e => {
            if (e.SurchargeCode === 'INSR') {
              let x = priceArray.indexOf(e)
              priceArray.splice(x, 1)
            }
          })
        }
        this.vasData = vas
        this.vasData.forEach((e) => {
          if (e.SurchargeCode !== 'INSR' || e.SurchargeCode !== 'TRCK' || e.SurchargeCode !== 'QLTY' && !e.hasOwnProperty('IsChecked')) {
            e.IsChecked = true;
          }
        });
        this.taxData = priceArray.filter((element: any) => element.SurchargeType === 'TAX');
      } else {
        this.vasData = vas
      }
    } else {
      const readArray = priceArray.filter((e) => e.TransMode === 'Read');
      this.billingData = readArray
      const vas = priceArray.filter((element: any) => element.SurchargeType === 'VASV');
      // check if its Coming from continue booking
      if (this.bookingInfo.BookingID !== -1) {
        if (!this.bookingInfo.IsInsured) {
          priceArray.forEach(e => {
            if (e.SurchargeCode === 'INSR') {
              let x = priceArray.indexOf(e)
              priceArray.splice(x, 1)
            }
          })
        }
        this.vasData = vas.filter((element: any) => element.TransMode === 'Write')
        this.vasData.forEach((e) => {
          if (e.SurchargeCode !== 'INSR' || e.SurchargeCode !== 'TRCK' || e.SurchargeCode !== 'QLTY' && !e.hasOwnProperty('IsChecked')) {
            e.IsChecked = true;
          }
        });
      } else {
        this.vasData = vas.filter((element: any) => element.TransMode === 'Write')
      }
    }
    this.insrData = this.vasData.filter((element: any) => element.SurchargeCode === 'INSR' || element.SurchargeCode === 'TRCK' || element.SurchargeCode === 'QLTY');
    this.vasData = this.insrData
    if (this.vasData.length > 0 || this.insrData.length)
      this.showVasSection = true;

    this.freightData = this.billingData.filter((element: any) => element.SurchargeType === 'FSUR');
    // let extraPrices: number = 0
    // if (this.searchCriteria.searchMode === 'warehouse-lcl' && this.searchCriteria.storageType === 'full') {
    //   this.freightData.forEach(f_data => {
    //     if (f_data.SurchargeBasis === 'PER_MONTH' || f_data.SurchargeBasis === 'PER_YEAR') {
    //       const { TotalAmount } = f_data
    //       try {
    //         extraPrices = TotalAmount * Number(this.searchCriteria.minimumLeaseTerm)
    //         extraPrices = extraPrices - TotalAmount
    //       } catch (error) {
    //       }
    //     }
    //   });
    // }
    this.additionalData = this.billingData.filter((element: any) => element.SurchargeType === 'ADCH');

    if (this.bookingInfo.hasOwnProperty('BookingSurChargeDetail')) {
      this.taxData = this.bookingInfo.BookingSurChargeDetail.filter((element: any) => element.SurchargeType === 'TAX');
    }

    // this.currencyCode = this._currencyControl.getCurrencyCode();
    this.combinedAddedArray = this.freightData.concat(this.additionalData, this.vasData, this.taxData);

    this.combinedAddedArray.forEach(element => {
      this.total.push(element.TotalAmount);
    });
    this.subTotal = this.total.reduce((all, item) => {
      return all + item;
    });
    // this.subTotal = this.subTotal + extraPrices

    this.subTotal = this.subTotal

    //Discounted Amount
    // console.log(this.bookingInfo.BookingPriceDetail);

    try {
      const discountObj: any = this.bookingInfo.BookingPriceDetail.filter((element) => element.SurchargeCode === 'SRDISC' && element.TransMode.toLowerCase() === 'write')[0]
      if (discountObj) {
        this.discountData = discountObj
        this.discountedAmount = discountObj.TotalAmount;
      }
    } catch (error) {
      this.discountedAmount = 0
    }


    if (this.discountedAmount) {
      this.subTotal = this.subTotal + this.discountedAmount
    }

    if (this.taxData.length) {
      this.subTotal = this.subTotal - this.taxData[0].TotalAmount;
      const actualTotal = ((this.subTotal * this.taxData[0].Price) / 100);
      this.taxData[0].ActualIndividualPrice = this.taxData[0].ActualPrice
      this.taxData[0].IndividualPrice = this.taxData[0].Price
      this.taxData[0].TotalAmount = actualTotal
      this.taxData[0].ActualTotalAmount = actualTotal
      this.taxData[0].BaseTotalAmount = this._currencyControl.getPriceToBase(actualTotal, false);
      this.taxData[0].BaseCurrTotalAmount = this.taxData[0].BaseTotalAmount
      this.subTotal = this.subTotal + actualTotal
    }
    this._dataService.setTaxData(this.taxData[0])
    this._dataService.totalBookingAmount.next(this.subTotal)
  }

  ngOnChanges(changes) {
    if (changes.hasOwnProperty('showVAS')) {
      this.showVAS = changes.showVAS.currentValue;
    }

    if (changes.hasOwnProperty('vas')) {
      this.insrData = changes.vas.currentValue;
    }

    if (changes.hasOwnProperty('insuranceAmount')) {
      this.includeInsuranceAmount = true
      this.insuranceAmount = changes.insuranceAmount.currentValue;
      if (this.insrData && this.insrData.length) {
        this.insrData.forEach(element => {
          if (element.SurchargeCode === 'INSR') {
            element.TotalAmount = this.insuranceAmount;
            this.vasData.forEach(element => {
              if (element.SurchargeCode === 'INSR') {
                element.active = true;
                this.textColor();
              }
            });
          }
        });
      }
    }

    if (changes.hasOwnProperty('additionalCharges')) {
      this.additionalCharges = changes.additionalCharges.currentValue;
      if (this.vasData && this.vasData.length && this.additionalCharges !== 'undefined') {
        this.vasData.forEach(element => {
          if (element.SurchargeCode === 'TRCK' || element.SurchargeCode === 'QLTY') {
            element.active = true;
            this.textColor();
          }
        });
      }
    }
  }

  textColor() {
    setTimeout(() => {
      this.vasData.forEach(element => {
        if (element.active) {
          element.active = false;
        }
      });
    }, 3000)
  }

  ngOnDestroy() {
  }
}
