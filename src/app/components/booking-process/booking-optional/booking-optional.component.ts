import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { Tea, HashStorage, createSaveObject, getImagePath, ImageSource, ImageRequiredSize, getProviderImage, loading, cloneObject } from '../../../constants/globalfunctions';
import { BookingDetails, EnquiryDetail, PriceDetail, InsuranceProvider, Charges2Remove } from '../../../interfaces/bookingDetails';
import { BookingService } from '../booking.service'
import { DataService } from '../../../services/commonservice/data.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginDialogComponent } from '../../../shared/dialogues/login-dialog/login-dialog.component';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ShippingService } from '../../main/shipping/shipping.service';
import { MasterCurrency, ExchangeRate } from '../../../interfaces/currencyDetails';
import * as moment from 'moment'
import { SearchCriteria } from '../../../interfaces/searchCriteria';
import { ProviderVAS } from '../../../interfaces/order-summary';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { JsonResponse } from '../../../interfaces/JsonResponse';
import { CurrencyControl } from '../../../shared/currency/currency.injectable';
import { DropDownService } from '../../../services/dropdownservice/dropdown.service';
import { SearchResultService } from '../../search-results/fcl-search/fcl-search.service';
import { WarehousingService } from '../../main/warehousing/warehousing.service';

@Component({
  selector: 'app-booking-optional',
  templateUrl: './booking-optional.component.html',
  styleUrls: ['./booking-optional.component.scss'],
  // encapsulation: ViewEncapsulation.None,
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ transform: 'translateY(-10%)', opacity: 0 }),
          animate('300ms', style({ transform: 'translateY(0)', opacity: 1 }))
        ]),
        transition(':leave', [
          style({ transform: 'translateY(0)', opacity: 1 }),
          animate('300ms', style({ transform: 'translateY(-10%)', opacity: 0 }))
        ])
      ]
    )
  ],
})

export class BookingOptionalComponent implements OnInit, OnDestroy {

  @Output() optionalEvent = new EventEmitter<string>();
  @Output() IsInsured = new EventEmitter<any>();
  @Output() tabChange = new EventEmitter<string>()
  @Input() previousTab: string;
  @Input() stage: string;
  @Input() providerVasList: ProviderVAS[]
  public isDisabled: boolean = false;
  public selectedProviders: boolean = false;
  public outputAdditionCharge: any;
  public loading: boolean = false;
  public validated: true;
  public insureGoods = false;
  public userItem: any;
  public isGoodsBrandNew: boolean = false;
  public goodsAmount: number;
  public bookingInfo: BookingDetails;
  public insuranceProvidersList: InsuranceProvider[] = [];
  public vasList: any = [];
  public AdOptionsList = [];
  public additionCharges: any = []
  public valueAddedServicesList = [];
  public addVas: boolean = false;
  public enquiryFields: any = [];
  public saveBookingObj: any;
  public insuranceAmount: number;
  public pickUpPortDetail: any;
  public showGoodsValidation: boolean = false;
  public BackToforwarderLink: boolean = true;
  public decimal = 0;
  public selectedCurrencyCode: string = ''
  public invalidAmount: boolean = false;
  public searchCriteria: SearchCriteria
  public insuranceProvider: boolean;
  public isExcludeExp: boolean = false;
  public isExcludeImp: boolean = false;
  public subTotalImp;
  public subTotalExp;

  importChargeList: PriceDetail[] = []
  exportChargeList: PriceDetail[] = []

  constructor(
    private _bookingsService: BookingService,
    private _dataService: DataService,
    private _toast: ToastrService,
    private _modalService: NgbModal,
    private _shippingService: ShippingService,
    private _route: Router,
    private _bookingService: BookingService,
    private _currencyControl: CurrencyControl,
    private _dropDownService: DropDownService,
    private _searchService: SearchResultService,
    private _warehouseService: WarehousingService,
  ) { }

  ngOnInit() {
    this.searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))
    this.selectedCurrencyCode = this._currencyControl.getCurrencyCode()
    this.bookingInfo = this._dataService.getBookingData();
    let importChargeList = this.bookingInfo.BookingPriceDetail.filter((element: any) => element.Imp_Exp === 'IMPORT' && element.TransMode === 'Read');
    importChargeList.forEach(charge => {
      charge.isChargeChecked = false
    })
    this.importChargeList = importChargeList

    let exportChargeList = this.bookingInfo.BookingPriceDetail.filter((element: any) => element.Imp_Exp === 'EXPORT' && element.TransMode === 'Read');
    exportChargeList.forEach(charge => {
      charge.isChargeChecked = false
    })
    this.exportChargeList = exportChargeList
    this.calculateImpExpCharges()
    this.getPortDetails();
    this.setProviderVASList();
    this.insureGoods = this.bookingInfo.IsInsured;
    if (this.bookingInfo.BookingID !== -1) {
      HashStorage.setItem('bookingInfo', JSON.stringify(this.bookingInfo))
      this.getPriceBreakDown()
      this.BackToforwarderLink = false;
      this.goodsAmount = this.bookingInfo.InsuredGoodsPrice;
      this.insureGoods = this.bookingInfo.IsInsured;
      this.isGoodsBrandNew = this.bookingInfo.IsInsuredGoodsBrandNew;
      if (this.bookingInfo.InsuredStatus === 'Enquiry') {
        // if (HashStorage.getItem('insuranceProviders') && HashStorage.getItem('insuranceProviders').length > 0) {
        //   this.insuranceProvidersList = JSON.parse(HashStorage.getItem('insuranceProviders'));
        // } else {
        this.getInsuranceProvidersList();
        // }
      }
      this.bookingInfo.BookingPriceDetail.forEach(e => {
        if (e.SurchargeType === 'VASV')
          this.insuranceAmount = e.TotalAmount;
      });
    }
    if (!this.bookingInfo.IsInsuranceProvider) {
      this.bookingInfo.InsuredStatus = 'Enquiry';
      this.bookingInfo.BookingEnquiryDetail = null;
      // if (HashStorage.getItem('insuranceProviders') && HashStorage.getItem('insuranceProviders').length > 0) {
      //   this.insuranceProvidersList = JSON.parse(HashStorage.getItem('insuranceProviders'));
      // } else {
      this.getInsuranceProvidersList();
      // }
    }
    this.setAdditionalData()
  }

  setAdditionalData() {
    loading(true)
    if (this.bookingInfo.InsuredStatus === 'Enquiry') {
      if (this.bookingInfo.BookingEnquiryDetail !== null) {
        this.insuranceProvidersList.forEach(e => {
          this.bookingInfo.BookingEnquiryDetail.forEach(e2 => {
            if (e.ProviderID === e2.ProviderID) {
              e.isChecked = true;
            }
          });
        });

        if (typeof this.bookingInfo.InsuredGoodsPrice === 'string') {
          this.bookingInfo.InsuredGoodsPrice = parseInt(this.bookingInfo.InsuredGoodsPrice);
        }
        this.goodsAmount = this.bookingInfo.InsuredGoodsPrice;
        this.insureGoods = this.bookingInfo.IsInsured;
        this.isGoodsBrandNew = this.bookingInfo.IsInsuredGoodsBrandNew;
      } else if (this.bookingInfo.BookingEnquiryDetail === null) {
        // console.log(this.bookingInfo.BookingPriceDetail);

        this._dataService.setBookingsData(this.bookingInfo);
      }
    } else if (this.bookingInfo.InsuredStatus === 'Insured') {
      if (typeof this.bookingInfo.InsuredGoodsPrice === 'string') {
        this.bookingInfo.InsuredGoodsPrice = parseInt(this.bookingInfo.InsuredGoodsPrice);
        if (!this.bookingInfo.InsuredGoodsPrice) {
          this.bookingInfo.InsuredGoodsPrice = null;
        }
        // console.log(this.bookingInfo.BookingPriceDetail);

        this._dataService.setBookingsData(this.bookingInfo);
      }
      this.goodsAmount = this.bookingInfo.InsuredGoodsPrice;
      if (this.bookingInfo.InsuredGoodsPrice === null) {
        this.insureGoods = false;
      } else {
        this.insureGoods = this.bookingInfo.IsInsured;
      }
      this.insureGoods = this.bookingInfo.IsInsured
      this.isGoodsBrandNew = this.bookingInfo.IsInsuredGoodsBrandNew;
      this.insuranceAmount = (this.goodsAmount * this.bookingInfo.ProviderInsurancePercent) / 100;
    }
    this.addVas = this.bookingInfo.IsInsured;
    this.optionalEvent.emit('init');
    // console.log(this.bookingInfo.BookingPriceDetail);

    this._dataService.setBookingsData(this.bookingInfo);
    this.getVASDetails();
    if (this.bookingInfo && this.bookingInfo.PodID && this.bookingInfo.PolID && this.bookingInfo.ProviderID) {
      this.getOptionalDataList(this.bookingInfo.PolID, this.bookingInfo.PodID, this.bookingInfo.ProviderID);
    }
    loading(false)
  }


  getOptionalDataList(polID, PodID, ProviderID) {
    let date = new Date();
    let bookingDateUTC = moment.utc(date).format();
    this._bookingsService.getVASList(polID, PodID, ProviderID, bookingDateUTC).subscribe((res: any) => {
      if (res.returnObject && res.returnObject.length) {
        let adOptions = res.returnObject;
        this.AdOptionsList = adOptions.filter(list => list.LogServShortName.toLowerCase() == "PAOP".toLowerCase() && list.ImpExpFlag.toLowerCase() == "export");
        this.AdOptionsList.forEach((item) => {
          let newRate = this._currencyControl.getNewPrice(item.BaseCurrVASCharges, this._currencyControl.getExchangeRate())
          item.CurrencyID = this.bookingInfo.CurrencyID;
          item.CurrencyCode = this.bookingInfo.CurrencyCode; //Changing from Fixed to Dynami;
          item.BaseCurrencyID = this.bookingInfo.BaseCurrencyID; //Changing from Fixed to Dynami;
          item.BaseCurrencyCode = this.bookingInfo.BaseCurrencyCode, //Changing from Fixed to Dynami;
            item.TotalAmount = newRate;
          item.VASCharges = newRate;
          item.IsChecked = false;
          let obj: PriceDetail = {
            SurchargeType: item.SurchargeType,
            SurchargeID: item.VASID,
            SurchargeCode: item.logServCode,
            SurchargeBasis: item.vasBasis,
            SurchargeName: item.VASName,
            CurrencyID: this.bookingInfo.CurrencyID,
            CurrencyCode: this.bookingInfo.CurrencyCode, //Changing from Fixed to Dynamic
            BaseCurrencyID: this.bookingInfo.BaseCurrencyID, //Changing from Fixed to Dynamic
            BaseCurrencyCode: this.bookingInfo.BaseCurrencyCode, //Changing from Fixed to Dynamic
            TotalAmount: newRate,
            BaseCurrTotalAmount: item.BaseCurrVASCharges,
            IndividualPrice: 0,
            SortingOrder: 0,
            TransMode: 'Write',
            ActualIndividualPrice: 0,
            ActualTotalAmount: 0,
            BaseCurrIndividualPrice: item.BaseCurrVASCharges,
            ExchangeRate: this.bookingInfo.ExchangeRate,
            IsChecked: false
          }
          if (this.searchCriteria.searchMode !== 'warehouse-lcl') {
            obj.ContainerSpecID = this.bookingInfo.BookingContainerDetail[0].ContainerSpecID
          }
          let index = this.bookingInfo.BookingPriceDetail.findIndex(element => element.SurchargeCode === item.logServCode);
          if (index === -1) {
            this.bookingInfo.BookingPriceDetail.push(obj);
          }
        })
      }
      this.getCheckedOptions();
      // console.log(this.bookingInfo.BookingPriceDetail);

      this._dataService.setBookingsData(this.bookingInfo);
    });
  }

  addOption(x) {
    if (this.bookingInfo.BookingID !== -1) {
      let newRate = this._currencyControl.getNewPrice(x.BaseCurrVASCharges, this._currencyControl.getExchangeRate())
      let obj: PriceDetail = {
        SurchargeType: x.SurchargeType,
        SurchargeID: x.VASID,
        SurchargeCode: x.logServCode,
        SurchargeName: x.VASName,
        SurchargeBasis: x.vasBasis,
        ContainerSpecID: this.bookingInfo.BookingContainerDetail[0].ContainerSpecID,
        CurrencyID: this.bookingInfo.CurrencyID,
        CurrencyCode: this.bookingInfo.CurrencyCode, //Changing from Fixed to Dynamic
        BaseCurrencyID: this.bookingInfo.BaseCurrencyID, //Changing from Fixed to Dynamic
        BaseCurrencyCode: this.bookingInfo.BaseCurrencyCode, //Changing from Fixed to Dynamic
        TotalAmount: newRate,
        BaseCurrTotalAmount: x.BaseCurrVASCharges,
        IndividualPrice: 0,
        SortingOrder: 0,
        TransMode: 'Read',
        ActualIndividualPrice: 0,
        ActualTotalAmount: 0,
        BaseCurrIndividualPrice: x.BaseCurrVASCharges,
        ExchangeRate: this.bookingInfo.ExchangeRate,
        IsChecked: true
      }
      let index = this.bookingInfo.BookingPriceDetail.findIndex(element => element.SurchargeCode === x.logServCode && element.TransMode === 'Read');
      let index2 = this.bookingInfo.BookingPriceDetail.findIndex(element => element.SurchargeCode === x.logServCode && element.TransMode === 'Write');
      if (index === -1) {
        this.bookingInfo.BookingPriceDetail.push(obj);
        this.bookingInfo.BookingPriceDetail[index2].IsChecked = true;
      } else {
        this.bookingInfo.BookingPriceDetail[index].IsChecked = !this.bookingInfo.BookingPriceDetail[index].IsChecked;
        this.bookingInfo.BookingPriceDetail[index2].IsChecked = !x.IsChecked;
      }
    } else {
      let index = this.bookingInfo.BookingPriceDetail.findIndex(element => element.SurchargeCode === x.logServCode);
      this.bookingInfo.BookingPriceDetail[index].IsChecked = !this.bookingInfo.BookingPriceDetail[index].IsChecked;
    }
    this.outputAdditionCharge = x;
    // HashStorage.setItem('bookingInfo', JSON.stringify(this.bookingInfo));
    // console.log(this.bookingInfo.BookingPriceDetail);

    this._dataService.setBookingsData(this.bookingInfo);
  }

  getCheckedOptions() {
    if (this.bookingInfo.BookingID === -1) {
      this.bookingInfo.BookingPriceDetail.forEach((element: any) => {
        this.AdOptionsList.forEach((e) => {
          if (e.logServCode === element.SurchargeCode)
            e.IsChecked = element.IsChecked;
        });
      });
    } else {
      this.bookingInfo.BookingPriceDetail.forEach((element: any) => {
        if (element.SurchargeCode !== 'INSR' && !element.hasOwnProperty('IsChecked')) {
          this.AdOptionsList.forEach((e) => {
            if (e.logServCode === element.SurchargeCode)
              e.IsChecked = true;
          });
        }
      });
    }
  }

  getPortDetails() {
    let ports = JSON.parse(HashStorage.getItem('shippingPortDetails'));
    let searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'));
    if (searchCriteria && searchCriteria.pickupPortID) {
      let PortDetail = ports.find((obj) => obj.id == searchCriteria.pickupPortID);
      this.pickUpPortDetail = PortDetail;
    }
  }

  validateNumber(evt: any, amount) {
    let charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 37 && charCode != 39 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }

  focusOut(event, model) {
    if (!model || model < 1) {
      this.showGoodsValidation = true;
    }
  }

  onInsuranceChange($event: boolean) {
    this.insureGoods = $event;
    this.insChangeEvent($event)
    // HashStorage.setItem('bookingInfo', JSON.stringify(this.bookingInfo));
  }

  insChangeEvent($insEvent: boolean) {
    this.IsInsured.emit($insEvent);
    this.addVas = $insEvent;
    this.insuranceAmount = 0;
    this.bookingInfo.BookingPriceDetail.forEach((e) => {
      if (e.SurchargeCode == 'INSR')
        e.ShowInsurance = $insEvent;
    });
    if (!$insEvent) {
      let index = this.bookingInfo.BookingPriceDetail.findIndex(x => x.SurchargeCode == 'INSR');
      if (index !== -1) {
        this.bookingInfo.BookingPriceDetail.splice(index, 1);
      }
    }

    this.goodsAmount = 0;
    this.bookingInfo.InsuredGoodsPrice = 0
    this.bookingInfo.InsuredGoodsCurrencyID = -1
    this.bookingInfo.InsuredGoodsCurrencyCode = ''
    this.bookingInfo.InsuredGoodsBaseCurrPrice = 0
    this.bookingInfo.InsuredGoodsBaseCurrencyID = -1
    this.bookingInfo.InsuredGoodsActualPrice = 0
    this.bookingInfo.InsuredGoodsExchangeRate = 1
    this.bookingInfo.IsInsured = $insEvent;

    if (!this.insureGoods) {
      this.optionalEvent.emit('insuranceOff');
    } else {
      this.optionalEvent.emit('departure');
    }

    // console.log(this.bookingInfo.BookingPriceDetail);

    this._dataService.setBookingsData(this.bookingInfo)
    setTimeout(() => {
      if ($insEvent) {
        this.onModelChange(1)
      }
    }, 30);
  }

  onModelChange(event) {
    this.valueAddedServicesList
    if (event === null || event === 0) {
      this.insChangeEvent(false);
      return;
    }
    this.goodsAmount = event;
    this.showGoodsValidation = false;
    this.bookingInfo.InsuredGoodsPrice = this.goodsAmount;
    this.bookingInfo.InsuredGoodsBaseCurrPrice = this._currencyControl.getPriceToBase(this.goodsAmount, false)
    this.bookingInfo.InsuredGoodsActualPrice = this.goodsAmount;    // this.insuranceAmount = (event * this.bookingInfo.ProviderInsurancePercent) / 100;
    this.insuranceAmount = (event * 1) / 100;
    // if (this.insuranceAmount > 0 && this.insureGoods && this.bookingInfo.IsInsured) {
    if (this.bookingInfo.IsInsured) {
      let masterCurrency: MasterCurrency = this._currencyControl.getMasterCurrency()
      this.valueAddedServicesList = this.vasList;
      let index = this.bookingInfo.BookingPriceDetail.findIndex(x => x.SurchargeCode == 'INSR');
      this.valueAddedServicesList.forEach(e => {
        if (e.logServCode === 'INSR' && index === -1) {
          e.insuranceAmount = this.insuranceAmount;
          e.SurchargeType = e.surchargeType;
          e.SurchargeID = e.vasid;
          e.SurchargeCode = e.logServCode;
          e.SurchargeName = e.vasName;
          e.ContainerSpecID = 100;
          e.CurrencyID = masterCurrency.toCurrencyID; //Changing from Fixed to Dynamic
          e.CurrencyCode = masterCurrency.toCurrencyCode; //Changing from Fixed to Dynamic
          e.BaseCurrencyID = masterCurrency.fromCurrencyID; //Changing from Fixed to Dynamic
          e.BaseCurrencyCode = masterCurrency.fromCurrencyCode; //Changing from Fixed to Dynamic
          e.TotalAmount = e.insuranceAmount;
          e.BaseCurrTotalAmount = e.insuranceAmount;
          e.IndividualPrice = 0;
          e.SortingOrder = 0;
          e.ActualIndividualPrice = e.insuranceAmount;
          e.BaseCurrIndividualPrice = e.insuranceAmount;
          e.ExchangeRate = this._currencyControl.getExchangeRate();
          e.IndividualPrice = e.insuranceAmount;
          e.ShowInsurance = true;
          e.TransMode = 'Write';

          const baseInsAmount: number = this._currencyControl.getPriceToBase(e.insuranceAmount, false)

          let obj: PriceDetail = {
            SurchargeType: e.surchargeType,
            SurchargeID: e.vasid,
            SurchargeCode: e.logServCode,
            SurchargeName: e.vasName,
            SurchargeBasis: e.vasBasis,
            CurrencyID: masterCurrency.toCurrencyID, //Changing from Fixed to Dynamic
            CurrencyCode: masterCurrency.toCurrencyCode, //Changing from Fixed to Dynamic
            BaseCurrencyID: masterCurrency.fromCurrencyID, //Changing from Fixed to Dynamic
            BaseCurrencyCode: masterCurrency.fromCurrencyCode, //Changing from Fixed to Dynamic
            TotalAmount: e.insuranceAmount,
            BaseCurrTotalAmount: baseInsAmount,
            IndividualPrice: e.insuranceAmount,
            SortingOrder: 0,
            TransMode: 'Write',
            ShowInsurance: true,
            ActualIndividualPrice: e.insuranceAmount,
            ActualTotalAmount: e.insuranceAmount,
            BaseCurrIndividualPrice: baseInsAmount,
            ExchangeRate: masterCurrency.rate,
          }
          if (this.searchCriteria.searchMode !== 'warehouse-lcl') {
            obj.ContainerSpecID = this.bookingInfo.BookingContainerDetail[0].ContainerSpecID
          } else if (this.searchCriteria.searchMode === 'warehouse-lcl') {
            obj.Price = e.insuranceAmount;
            obj.ActualPrice = e.insuranceAmount;
            obj.BaseCurrPrice = e.insuranceAmount;
            obj.PriceBasis = e.vasBasis
          }
          this.bookingInfo.BookingPriceDetail.push(obj);
        } else {
          this.bookingInfo.InsuredGoodsPrice = this.goodsAmount;
          this.bookingInfo.InsuredGoodsBaseCurrPrice = this._currencyControl.getPriceToBase(this.goodsAmount, false);
          this.bookingInfo.InsuredGoodsActualPrice = this.goodsAmount;
          this.bookingInfo.BookingPriceDetail.forEach(e => {
            if (e.SurchargeCode === 'INSR') {
              e.TotalAmount = this.insuranceAmount;
              e.BaseCurrTotalAmount = this._currencyControl.getPriceToBase(this.insuranceAmount, false);
            }
          });
          this.valueAddedServicesList.forEach(e => {
            e.TotalAmount = this.insuranceAmount;
            e.BaseCurrTotalAmount = this._currencyControl.getPriceToBase(this.insuranceAmount, false);
            e.SurchargeType = e.surchargeType;
            e.SurchargeID = e.vasid;
            e.SurchargeCode = e.logServCode;
            e.SurchargeName = e.vasName;
            e.ContainerSpecID = 100;
            e.CurrencyID = masterCurrency.toCurrencyID;
            e.CurrencyCode = masterCurrency.toCurrencyCode;
            e.BaseCurrencyID = masterCurrency.fromCurrencyID;
            e.BaseCurrencyCode = masterCurrency.fromCurrencyCode;
            e.IndividualPrice = 0;
            e.SortingOrder = 8;
            e.TransMode = 'Write';
          });
        }
      });
    }
    if (this.insuranceAmount > 0) {
      this.optionalEvent.emit('optional');
    } else {
      this.optionalEvent.emit('departure');
    }
    // console.log(this.bookingInfo.BookingPriceDetail);

    this._dataService.setBookingsData(this.bookingInfo);
  }

  goToDepartuteDate() {
    if (this.bookingInfo.IsInsured) {
      if (this.bookingInfo.InsuredStatus.toLowerCase() === 'enquiry') {
        if (this.bookingInfo.BookingID === -1) {
          if (!this.bookingInfo.InsuredGoodsPrice || this.bookingInfo.InsuredGoodsPrice < 0) {
            this.showGoodsValidation = true;
            this._toast.error('Please enter a valid invoice value of your goods.', 'Error');
            return;
          }
          if (!this.bookingInfo.BookingEnquiryDetail || this.bookingInfo.BookingEnquiryDetail.length === 0) {
            this._toast.error('Please select an insurance provider to send an enquiry to, or decline insurance.', 'Error');
            return;
          }
        } else if (this.bookingInfo.BookingID > -1) {
          if (!this.bookingInfo.InsuredGoodsPrice || this.bookingInfo.InsuredGoodsPrice < 0) {
            this._toast.error('Please enter a valid invoice value of your goods.', 'Error');
            return;
          }
          if (!this.bookingInfo.BookingEnquiryDetail || this.bookingInfo.BookingEnquiryDetail.length === 0) {
            this._toast.error('Please select an insurance provider to send an enquiry to, or decline insurance.', 'Error');
            return;
          }
        }
      } else {
        if (!this.bookingInfo.InsuredGoodsPrice || this.bookingInfo.InsuredGoodsPrice < 0) {
          this._toast.error('Please enter a valid invoice value of your goods.', 'Error');
          this.showGoodsValidation = true;
          return;
        }
      }
      // console.log(this.bookingInfo.BookingPriceDetail);

      this._dataService.setBookingsData(this.bookingInfo)
    }

    if (this.bookingInfo.InsuredStatus === 'Enquiry') {
      this.setEnquiryData();
    }

    this.bookingInfo.BookingEnquiryDetail = this.enquiryFields;
    this.bookingInfo.InsuredGoodsPrice = this.goodsAmount;
    this.bookingInfo.InsuredGoodsProviderID = -1;
    this.bookingInfo.IsInsured = this.insureGoods;

    if (this.insureGoods && this.bookingInfo.InsuredGoodsPrice > 0 && this.bookingInfo.InsuredStatus === 'Enquiry' && this.bookingInfo.BookingEnquiryDetail.length < 1) {
      this._toast.error('Please select an insurance provider to send an enquiry to, or decline insurance.', 'Error');
      // this.optionalEvent.emit('departure');
      return;
    }
    // HashStorage.setItem('bookingInfo', JSON.stringify(this.bookingInfo))
    // console.log(this.bookingInfo.BookingPriceDetail);

    this._dataService.setBookingsData(this.bookingInfo)
    const { searchMode } = this.searchCriteria
    if (searchMode === 'sea-lcl' || searchMode === 'warehouse-lcl') {
      let userItem = JSON.parse(Tea.getItem('loginUser'));
      if (userItem && !userItem.IsLogedOut && userItem.IsVerified) {
        // loading(true);
        // this.tabChange.emit('tab-billing')
        this.tabChange.emit('tab-departure-date');
        // this.confirmBookingWithoutPayment()
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
    } else {
      this.tabChange.emit('tab-departure-date');
    }

  }

  getInsuranceProvidersList() {
    this.insureGoods = false
    this._bookingsService.getInsuranceProviders().subscribe((res: any) => {
      if (res.returnId === -1) {
        this.bookingInfo.IsInsured = false
        this.insureGoods = false
        // console.log(this.bookingInfo.BookingPriceDetail);

        this._dataService.setBookingsData(this.bookingInfo);
        this.isDisabled = true
      } else {
        this.insuranceProvidersList = res.returnObject;
        this.insuranceProvidersList.forEach(e => {
          e.isChecked = false;
        });
        HashStorage.setItem('insuranceProviders', JSON.stringify(this.insuranceProvidersList));
      }
    }, (err: HttpErrorResponse) => {
      loading(false)
    });
  }

  getVASDetails() {
    this._bookingsService.getVASDetails().subscribe((res: any) => {
      this.vasList = res.returnObject;
    }, (err: HttpErrorResponse) => {
    });
  }

  brandNewGoods(val) {
    this.isGoodsBrandNew = val;
    this.bookingInfo.IsInsuredGoodsBrandNew = this.isGoodsBrandNew;
    // HashStorage.setItem('bookingInfo', JSON.stringify(this.bookingInfo));
    // console.log(this.bookingInfo.BookingPriceDetail);

    this._dataService.setBookingsData(this.bookingInfo);
  }


  sendEnquiry() {
    if (!this.goodsAmount) {
      this._toast.error('Please enter a invoice value of your goods.', 'Error');
      return;
    }
    if (this.bookingInfo.InsuredGoodsPrice < 0) {
      this._toast.error('Please enter a valid invoice value of your goods.', 'Error');
      return;
    }
    if (!this.bookingInfo.InsuredGoodsPrice) {
      this._toast.error('Please enter a invoice value of your goods.', 'Error');
      return;
    }

    this.setEnquiryData();
    this.bookingInfo.BookingEnquiryDetail = this.enquiryFields;
    this.bookingInfo.InsuredGoodsPrice = this.goodsAmount;
    this.bookingInfo.InsuredGoodsProviderID = -1;

    // HashStorage.setItem('bookingInfo', JSON.stringify(this.bookingInfo));
    // console.log(this.bookingInfo.BookingPriceDetail);

    this._dataService.setBookingsData(this.bookingInfo)

    this.bookingInfo.IsInsured = this.insureGoods;
    if (this.insureGoods && this.bookingInfo.InsuredGoodsPrice > 0 && this.bookingInfo.InsuredStatus === 'Enquiry' && this.bookingInfo.BookingEnquiryDetail.length < 1) {
      this._toast.error('Please select an insurance provider to send an enquiry to, or decline insurance.', 'Error');
      this.optionalEvent.emit('departure');
      return;
    }
    // HashStorage.setItem('bookingInfo', JSON.stringify(this.bookingInfo));
    if (this.searchCriteria.searchMode === 'warehouse-lcl') {
      let taxData = JSON.parse(HashStorage.getItem('taxObj'));
      let taxLength;
      if (this.bookingInfo.BookingID === -1) {
        taxLength = this.bookingInfo.BookingSurChargeDetail.filter(e => e.SurchargeType === ' TAX')
      } else {
        taxLength = this.bookingInfo.BookingPriceDetail.filter(e => e.SurchargeType === ' TAX')
      }
    }
    // console.log(this.bookingInfo.BookingPriceDetail);

    this._dataService.setBookingsData(this.bookingInfo);
    HashStorage.removeItem('taxObj');

    if (HashStorage) {
      this.userItem = JSON.parse(Tea.getItem('loginUser'));
      if (this.userItem && !this.userItem.IsLogedOut) {
        this.saveBookingObj = createSaveObject(this.userItem, this.bookingInfo, 'Draft');
        if (this.searchCriteria.searchMode !== 'warehouse-lcl') {
          this._toast.success('Your enquiry has been sent successfully.', 'Success');
        } else if (this.searchCriteria.searchMode === 'warehouse-lcl') {
          this._toast.success('Your enquiry has been sent successfully.', 'Success');
        }
      } else {
        const modalRef = this._modalService.open(LoginDialogComponent, { size: 'lg', centered: true, windowClass: 'small-modal' });
        modalRef.result.then((result) => {
          if (result) {
            this._toast.success('Logged in successfully.', 'Success');
          }
        });
      }
    }
  }

  selectProvider(provider, idx) {
    this.insuranceProvidersList[idx].isChecked = !this.insuranceProvidersList[idx].isChecked;
    this.insuranceProvidersList.forEach(e => {
      if (e.ProviderID !== provider.ProviderID) {
        e.isChecked = false;
      }
    })
    let x = this.insuranceProvidersList.filter(e => e.isChecked);
    if (x.length) {
      this.selectedProviders = true;
    } else {
      this.selectedProviders = false;
    }
    // this.setEnquiryData();
    // this.bookingInfo.BookingEnquiryDetail = this.enquiryFields;
    // HashStorage.setItem('bookingInfo', JSON.stringify(this.bookingInfo));
  }

  onAmountFocus(ev) {
    this.showGoodsValidation = false;
  }


  setEnquiryData() {
    if (this.bookingInfo.InsuredStatus === 'Enquiry') {
      if (this.insuranceProvidersList) {
        this.insuranceProvidersList.forEach((e) => {
          if (e.isChecked) {
            let obj: EnquiryDetail;
            obj = {
              BookingEnquiryID: -1,
              BookingEnquiryType: this.bookingInfo.InsuredStatus,
              BookingEnquiryDate: null,
              BookingID: null,
              BookingEnquiryAckDate: null,
              BookingEnquiryPrice: null,
              CurrencyID: null,
              CurrencyCode: null,
              BookingEnquiryAckRemarks: null,
              ProviderID: e.ProviderID,
              ProviderCode: e.ProviderCode,
              ProviderName: e.ProviderName,
              ProviderShortName: e.ProviderShortName,
              ProviderImage: e.ProviderImage,
              ProviderEmail: e.ProviderEmail
            }
            let index = this.enquiryFields.findIndex(x => x.ProviderID === e.ProviderID);
            if (index === -1) {
              this.enquiryFields.push(obj);
            }
          } else {
            let index = this.enquiryFields.findIndex(x => x.ProviderID === e.ProviderID);
            if (index !== -1) {
              this.enquiryFields.splice(index, 1);
            }
          }
        });
      }
    }
  }

  gotoTraking(name: string) {

    if (name === 'tracking') {
      const isInsured: boolean =
        (this.bookingInfo.InsuredGoodsPrice && this.bookingInfo.InsuredGoodsPrice > 0) ||
        (this.bookingInfo.BookingEnquiryDetail && this.bookingInfo.BookingEnquiryDetail.length > 0)

      if (!isInsured) {
        this.bookingInfo.IsInsured = false
        // console.log(this.bookingInfo.BookingPriceDetail);

        this._dataService.setBookingsData(this.bookingInfo)
      }
      this.tabChange.emit('tab-tracking')
    } else if (name === 'warehouse-lcl' || name === 'truck-ftl' || name === 'sea-lcl' || name === 'air-lcl') {
      if (this.searchCriteria.criteriaFrom === 'search') {
        if (name === 'warehouse-lcl') {
          this._route.navigate(['warehousing/warehousing-search']);
        } else if (name === 'truck-ftl') {
          this._route.navigate(['truck-search/consolidators']);
        } else if (name === 'sea-lcl') {
          this._route.navigate(['lcl-search/consolidators']);
        } else if (name === 'air-lcl') {
          this._route.navigate(['air/air-lines']);
        }

      } else if (this.searchCriteria.criteriaFrom === 'vendor') {
        let selectedProvider = JSON.parse(HashStorage.getItem('selectedProvider'))
        this._route.navigate(['partner', (selectedProvider.ProfileID)]);
      }
    }

  }



  getUIImage($image: string, isProvider: boolean) {
    if (isProvider) {
      const providerImage = getProviderImage($image)
      return getImagePath(ImageSource.FROM_SERVER, providerImage, ImageRequiredSize.original)
    } else {
      return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
    }
  }

  setProviderVASList() {
    if (!this.providerVasList) {
      this._bookingService.getProviderVASList('INSR', new Date().toUTCString(), this.bookingInfo.ProviderID).pipe(untilDestroyed(this)).subscribe((resp: JsonResponse) => {
        const { returnId, returnObject } = resp
        if (returnId > 0 && returnObject) {
          this.bookingInfo.IsInsuranceProvider = (returnObject[0].ProviderVASDetail ? true : false)
          if (this.bookingInfo.IsInsuranceProvider) {
            this.bookingInfo.InsuredStatus = 'Insured';
            this.bookingInfo.BookingEnquiryDetail = null;
            this.bookingInfo.ProviderInsurancePercent = returnObject[0].ProviderVASDetail[0].Rate
            // this.bookingInfo.ProviderInsurancePercent = 0
          } else {
            this.bookingInfo.InsuredStatus = 'Enquiry';
            this.bookingInfo.BookingEnquiryDetail = null;
            // if (HashStorage.getItem('insuranceProviders') && HashStorage.getItem('insuranceProviders').length > 0) {
            //   this.insuranceProvidersList = JSON.parse(HashStorage.getItem('insuranceProviders'));
            // } else {
            this.getInsuranceProvidersList();
            // }
          }
          // console.log(this.bookingInfo.BookingPriceDetail);

          this._dataService.setBookingsData(this.bookingInfo);
        }
      })
    }
  }

  confirmBookingWithoutPayment() {
    const userItem = JSON.parse(Tea.getItem('loginUser'));
    this.saveBookingObj = createSaveObject(userItem, this.bookingInfo, 'Confirmed')
    this._dropDownService.getExchangeRateList(this._currencyControl.getBaseCurrencyID()).subscribe((res: any) => {
      let exchangeData: ExchangeRate = res.returnObject
      this._currencyControl.setExchangeRateList(exchangeData)

      let newSaveObject = this._currencyControl.getSaveObjectByLatestRates(this.saveBookingObj, res.returnObject)

      this.saveBookingObj = newSaveObject
      if (this.searchCriteria.searchMode !== 'warehouse-lcl') {
        this._bookingService.saveBooking(this.saveBookingObj).subscribe((res: any) => {
          if (res.returnId > 0) {
            this._toast.info('Rates may have been updated since the booking was last saved.', 'Booking Successful');
            HashStorage.removeItem('selectedDeal');
            HashStorage.removeItem('CURR_MASTER')
            HashStorage.setItem('bookinRef', res.returnText);
            this._route.navigate(['/thankyou-booking'])
            // this.messageEvent.emit(this.message);
            loading(false);
          } else {
            loading(false);
            this._toast.error(res.returnText, 'Failed')
            // console.log('yolo');

          }
        }, (err) => {
          loading(false);
          this._toast.error('An unexpected error occurred while saving your booking, Please try again later.', 'Failed');
          // console.log('yolo');

        })
      } else if (this.searchCriteria.searchMode === 'warehouse-lcl') {
        this._bookingService.saveWarehouseBooking(this.saveBookingObj).subscribe((res: any) => {
          if (res.returnId > 0) {
            this._toast.info('Rates may have been updated since the booking was last saved.', 'Booking Successful');
            HashStorage.removeItem('selectedDeal');
            HashStorage.removeItem('CURR_MASTER')
            HashStorage.setItem('bookinRef', res.returnText);
            this._route.navigate(['/thankyou-booking'])
            loading(false);
          } else {
            loading(false);
            this._toast.error(res.returnText, 'Failed')
            // console.log('yolo');

          }
        }, (err) => {
          loading(false);
          this._toast.error('An unexpected error occurred while saving your booking, Please try again later.', 'Failed');
          // console.log('yolo');

        })
      }
    })
  }

  calculateImpExpCharges() {
    let totalExp = []
    let totalImp = []
    const expCharges = this.bookingInfo.BookingPriceDetail.filter(e => e.Imp_Exp === 'EXPORT' && e.TransMode === 'Read')
    const impCharges = this.bookingInfo.BookingPriceDetail.filter(e => e.Imp_Exp === 'IMPORT' && e.TransMode === 'Read')
    if (expCharges.length) {
      expCharges.forEach(element => {
        totalExp.push(element.TotalAmount);
      });
      this.subTotalExp = totalExp.reduce((all, item) => {
        return all + item;
      });
    }

    if (impCharges.length) {
      impCharges.forEach(element => {
        totalImp.push(element.TotalAmount);
      });
      this.subTotalImp = totalImp.reduce((all, item) => {
        return all + item;
      });
    }
  }

  onExcludeCharges($event: any, $type: string, $chargeType?: string, $type_id?: number) {
    console.log($event);
    if ($type === 'all') {
      this._dataService.setBookingsData(this.bookingInfo)
    } else {
      let { bookingInfo } = this
      let chargeArray: Charges2Remove[] = []
      try {
        if (this.bookingInfo.ImpExpCharges2Remove) {
          chargeArray = this.bookingInfo.ImpExpCharges2Remove
        }
      } catch (error) {
        chargeArray = []
      }
      const charge: Charges2Remove = {
        chargeID: $type_id,
        chargeType: $chargeType,
        state: $event
      }
      if (chargeArray && chargeArray.length > 0) {
        const index = chargeArray.findIndex(x => x.chargeID === $type_id && x.chargeType.toLowerCase() === $chargeType.toLowerCase());
        if (index !== -1) {
          chargeArray.splice(index, 1);
        }
      }
      chargeArray.push(charge)
      bookingInfo.ImpExpCharges2Remove = chargeArray
      this._dataService.setBookingsData(bookingInfo)
    }
  }

  async getPriceBreakDown() {
    loading(true)
    let paramsObject: any[] = []

    if (this.searchCriteria.SearchCriteriaContainerDetail && this.searchCriteria.SearchCriteriaContainerDetail.length > 0) {
      paramsObject = this.searchCriteria.SearchCriteriaContainerDetail
      if (!this.searchCriteria.SearchCriteriaContainerDetail[0].contRequestedQty) {
        let conDetails: any[] = this.searchCriteria.SearchCriteriaContainerDetail
        paramsObject = []
        conDetails.forEach(elem => {
          let temp = {
            contSpecID: elem.ContainerSpecID,
            contRequestedQty: elem.BookingContTypeQty,
          }
          paramsObject.push(temp)
        })
      }
    }

    const { TransportMode, imp_Exp, containerLoad, pickupPortType, deliveryPortType, CustomerID, CustomerType } = this.searchCriteria

    const params = {
      imp_Exp,
      pickupPortType,
      deliveryPortType,
      customerID: CustomerID,
      customerType: CustomerType,
      PortJsonData: '[]',
      bookingReferenceIDs: this.bookingInfo.IDlist,
      shippingMode: TransportMode,
      SearchCriteriaContainerDetail: paramsObject
    };

    if (HashStorage && !(this.bookingInfo.BookingID > 0)) {
      try {
        let res: JsonResponse
        if (this.searchCriteria.searchMode.toLowerCase() === 'air-lcl') {
          res = await this._searchService.getPriceDetails(params).toPromise()
        } else if (this.searchCriteria.searchMode === 'truck-ftl') {
          res = await this._searchService.getTruckPriceDetails(params).toPromise()
        } else if (this.searchCriteria.searchMode === 'sea-fcl') {
          res = await this._searchService.getPriceDetails(params).toPromise()
        } else if (this.searchCriteria.searchMode === 'sea-lcl') {
          res = await this._searchService.getLCLPriceDetails(params).toPromise()
        } else if (this.searchCriteria.searchMode === 'warehouse-lcl') {
          res = await this._warehouseService.getWarehousePriceDetails(this.searchCriteria).toPromise()
        }
        if (res.returnId === 1 && JSON.parse(res.returnText).length > 0) {
          let priceDetails: PriceDetail[] = JSON.parse(res.returnText);
          priceDetails = this._currencyControl.applyCurrencyRateOnBookingPriceDetails(priceDetails)
          const vasCharges = this.bookingInfo.BookingPriceDetail.filter(e => e.SurchargeType === 'VASV' || e.SurchargeCode === 'SRDISC');
          priceDetails = priceDetails.concat(vasCharges);
          if (this.searchCriteria.searchMode === 'warehouse-lcl') {
            try {
              const warehouseTaxData = JSON.parse(this.bookingInfo.BookingJsonDetail)
              const newTabObj = CurrencyControl.GENERATE_TAX_OBJECT(priceDetails, warehouseTaxData)
              priceDetails.push(newTabObj)
              HashStorage.setItem('taxObj', JSON.stringify(newTabObj));
            } catch (error) {
              console.log(error)
            }
          }
          this.bookingInfo.BookingPriceDetail = priceDetails

          // console.log(this.bookingInfo.BookingPriceDetail);

          this._dataService.setBookingsData(this.bookingInfo)
          loading(false);
        } else {
          loading(false);
        }
      } catch{
        loading(false);
      }
    }
  }

  ngOnDestroy() {
  }
}
