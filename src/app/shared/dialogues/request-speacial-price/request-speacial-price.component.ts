import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { getSearchCriteria, HashStorage, loading, getMovementType, Tea, createSaveObject, getLoggedUserData } from '../../../constants/globalfunctions';
import { SearchCriteriaContainerDetail } from '../../../interfaces/searchCriteria';
import { ShippingComponent } from '../../../components/main/shipping/shipping.component';
import { SearchResult } from '../../../interfaces/searchResult';
import { JsonResponse } from '../../../interfaces/JsonResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { SearchResultService } from '../../../components/search-results/fcl-search/fcl-search.service';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { CookieService } from '../../../services/cookies.injectable';
import { CurrencyControl } from '../../currency/currency.injectable';
import { DataService } from '../../../services/commonservice/data.service';
import { ToastrService } from 'ngx-toastr';
import { PriceDetail, ContainerDetail } from '../../../interfaces/bookingDetails';
import { HashCardComponent } from '../../cards/hash-search-card/hash-search-card.component';
import { DropDownService } from '../../../services/dropdownservice/dropdown.service';
import { BookingService } from '../../../components/booking-process/booking.service';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { BookingStaticUtils } from '../../../components/booking-process/booking-static-utils';

@Component({
  selector: "app-request-speacial-price",
  templateUrl: "./request-speacial-price.component.html",
  styleUrls: ["./request-speacial-price.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestSpeacialPriceComponent implements OnInit {


  selectedContainers: Array<SearchCriteriaContainerDetail> = []
  public userData: any = {}
  desc
  @Input() data: any;
  public loading: boolean = false

  constructor(
    private _activeModal: NgbActiveModal,
    private _searchService: SearchResultService,
    private _store: Store<any>,
    private _storeProvider: Store<any>,
    private _router: Router,
    private _cookieService: CookieService,
    private _modalService: NgbModal,
    private _currencyControl: CurrencyControl,
    private _dataService: DataService,
    private _toast: ToastrService,
    private _dropDownService: DropDownService,
    private _bookingService: BookingService
  ) { }

  searchCriteria
  selectedProvider

  ngOnInit() {
    this.selectedProvider = JSON.parse(HashStorage.getItem('selectedProvider'))
    this.userData = JSON.parse(Tea.getItem('loginUser'));
    console.log(this.data)
    if (this.data.JsonSearchCriteria) {
      this.searchCriteria = JSON.parse(this.data.JsonSearchCriteria)
    } else {
      this.searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))
    }

    const { SearchCriteriaContainerDetail } = this.searchCriteria
    this.selectedContainers = SearchCriteriaContainerDetail
  }

  getContainerInfo(container) {
    return ShippingComponent.getFclContDesc(container)
  }

  closeModal() {
    this._activeModal.close(false)
  }


  bookNowCarriers() {
    this.loading = true
    if (this.data.JsonSearchCriteria) {
      loading(true);
      let obj = {
        bookingID: this.data.BookingID,
        currencyID: 0,
        actualIndividualPrice: 0,
        baseIndividualPrice: 0,
        exchangeRate: 0,
        specialRequestComments: this.desc,
        userID: this.userData.UserID,
        requestStatus: 'REQUESTED AGAIN'
      }
      this._bookingService.updateSpecialPrice(this.data.BookingID, this.userData.UserLoginID, obj).subscribe((res: JsonResponse) => {
        loading(false);
        const { returnId, returnText } = res
        if (returnId > 0) {
          try {
            let response = JSON.parse(returnText)
            let logs = JSON.parse(response.JSONSpecialRequestLogs)
            let obj = {
              status: response.SpecialRequestStatus,
              logs: logs
            }
          } catch (error) {
          }
        } else {
          this._toast.error(returnText, 'Error')
        }
        this._activeModal.close(obj)
      }, (err: any) => {
        loading(false);
        this._toast.error('There was an error while processing your request, please try later', 'Error')
        console.log(err);
      })
    } else {
      const { data } = this
      if (HashStorage) {
        loading(true);
        let paramsObject: any[] = this.searchCriteria.SearchCriteriaContainerDetail
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
        const { TransportMode, imp_Exp, containerLoad, pickupPortType, deliveryPortType, CustomerID, CustomerType } = this.searchCriteria
        const { PortJsonData, IDlist } = data
        const params = {
          imp_Exp,
          pickupPortType,
          deliveryPortType,
          customerID: CustomerID,
          customerType: CustomerType,
          PortJsonData: (PortJsonData) ? PortJsonData : '[]',
          bookingReferenceIDs: IDlist,
          shippingMode: TransportMode,
          SearchCriteriaContainerDetail: paramsObject
        };

        const { bookingReferenceIDs } = params

        const movementType: string = getMovementType(pickupPortType, deliveryPortType)
        this._searchService.getActualScheduleDetailWithPrice(bookingReferenceIDs, movementType, containerLoad, TransportMode, CustomerID, CustomerType).subscribe((resp: JsonResponse) => {
          loading(false)
          const { returnId, returnText } = resp
          if (returnId > 0) {
            this.getPriceBreakDown(params, data, returnText);
          } else {
          }
        }, (error: HttpErrorResponse) => {
          loading(false)
        })
      }
    }
  }

  getPriceBreakDown(params, data: any, actutalScheduleDtl: string) {
    const loginObj = JSON.parse(Tea.getItem('loginUser'));
    // if (loginObj && !loginObj.IsLogedOut) {
    //   params.customerID = loginObj.UserID;
    // } else {
    //   params.customerID = null;
    // }

    if (HashStorage) {
      if (this.searchCriteria.searchMode === 'sea-fcl') {
        this._searchService.getPriceDetails(params).subscribe((res: any) => {
          if (res.returnId === 1 && JSON.parse(res.returnText).length > 0) {
            let priceDetaisl: PriceDetail[] = JSON.parse(res.returnText);
            priceDetaisl = this._currencyControl.applyCurrencyRateOnBookingPriceDetails(priceDetaisl)
            this._currencyControl.setExchangeRate(data.ExchangeRate)
            HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
            const { ProviderID, ProviderImage, ProviderName, ProviderInsurancePercent, IsInsuranceProvider } = this.selectedProvider

            let PolCountryName = data.PolCountryName;
            let PodCountryName = data.PodCountryName

            if (this.searchCriteria.SearchCriteriaPickupGroundDetail) {
              const { LongName_L1 } = this.searchCriteria.SearchCriteriaPickupGroundDetail.AddressComponents
              PolCountryName = LongName_L1
            }
            if (this.searchCriteria.SearchCriteriaDropGroundDetail) {
              const { LongName_L1 } = this.searchCriteria.SearchCriteriaDropGroundDetail.AddressComponents
              PodCountryName = LongName_L1
            }

            const bookingDetails = {
              BookingID: -1,
              PolName: this.searchCriteria.pickupPortName,
              PodName: this.searchCriteria.deliveryPortName,
              ProviderName: ProviderName,
              ProviderImage: ProviderImage,
              ContainerCount: HashCardComponent.getContCount(this.searchCriteria),
              ContainerLoad: this.searchCriteria.containerLoad,
              VesselCode: data.VesselCode,
              VesselName: data.VesselName,
              EtdLcl: data.EtdLcl,
              VoyageRefNum: data.VoyageRefNum,
              CarrierName: data.CarrierName,
              TransitTime: data.EtaInDays,
              PortCutOffUtc: data.PortCutOffUtc,
              BookingTotalAmount: data.TotalPrice,
              CurrencyCode: data.CurrencyCode,
              DiscountPrice: data.DiscountPrice,
              DiscountPercent: 0,
              CarrierImage: data.CarrierImage,
              CarrierID: data.CarrierID,
              BookingContainerDetail: BookingStaticUtils.generateContainerDetails(this.searchCriteria),
              CurrencyID: data.CurrencyID,
              EtaLcl: data.EtaLcl,
              EtaUtc: data.EtaUtc,
              EtdUtc: data.EtdUtc,
              FreeTimeAtPort: data.FreeTimeAtPort,
              HashMoveBookingDate: null,
              HashMoveBookingNum: null,
              IsAnyRestriction: data.IsAnyRestriction,
              IsInsured: false,
              IsInsuranceProvider: IsInsuranceProvider,
              ProviderInsurancePercent: ProviderInsurancePercent,
              InsuredGoodsPrice: null,
              InsuredGoodsCurrencyID: data.CurrencyID,
              InsuredGoodsCurrencyCode: data.CurrencyCode,
              IsInsuredGoodsBrandNew: false,
              InsuredGoodsProviderID: ProviderID,
              InsuredStatus: 'Insured',
              PodCode: data.PodCode,
              PodModeOfTrans: data.PodModeOfTrans,
              PolCode: data.PolCode,
              PolModeOfTrans: data.PolModeOfTrans,
              PortCutOffLcl: data.PortCutOffLcl,
              BookingPriceDetail: priceDetaisl,
              ProviderID: ProviderID,
              BookingRouteDetail: null,
              BookingEnquiryDetail: null,
              ShippingCatName: this.searchCriteria.shippingCatID + '',
              ShippingModeCode: this.searchCriteria.SearchCriteriaTransportationDetail[0].modeOfTransportCode,
              ShippingModeName: this.searchCriteria.SearchCriteriaTransportationDetail[0].modeOfTransportDesc,
              ShippingSubCatName: this.searchCriteria.shippingSubCatID + '',
              PolID: data.PolID,
              PodID: data.PodID,
              ShippingCatID: this.searchCriteria.shippingCatID,
              ShippingModeID: this.searchCriteria.shippingModeID,
              ShippingSubCatID: this.searchCriteria.shippingSubCatID,
              IDlist: data.IDlist,
              IDListDetail: actutalScheduleDtl,
              EtaInDays: data.EtaInDays,
              InsuredGoodsBaseCurrencyID: data.BaseCurrencyID,
              InsuredGoodsBaseCurrencyCode: data.BaseCurrencyCode,
              InsuredGoodsExchangeRate: data.ExchangeRate,
              InsuredGoodsBaseCurrPrice: 0, //For Now
              InsuredGoodsActualPrice: 0, //For Now
              ExchangeRate: data.ExchangeRate,
              BaseCurrencyCode: data.BaseCurrencyCode,
              BaseCurrencyID: data.BaseCurrencyID,
              BaseCurrTotalAmount: data.BaseTotalPrice,
              PolCountry: PolCountryName,
              PodCountry: PodCountryName,
              FlightNo: data.FlightNo,
              AirCraftInfo: data.AirCraftInfo,
              isExcludeExp: false,
              isExcludeImp: false,
              IsSpecialRequest: true,
              SpecialRequestDesc: this.desc
            };
            // HashStorage.setItem('bookingInfo', JSON.stringify(bookingDetails))
            // this._dataService.setBookingsData(bookingDetails)
            BookingStaticUtils.saveBookingAction(bookingDetails,
              getLoggedUserData(),
              this._cookieService,
              this._dropDownService,
              this._bookingService,
              null,
              this.searchCriteria,
              this._toast,
              this._currencyControl,
              this._router,
              this._modalService,
              false,
              true,
              this.desc
            ).then(res => {
              this.closeModal()
            }).catch(res => {
              this.closeModal()
            })
            // this._cookieService.deleteCookies();
            loading(false);
            // this._router.navigate(['booking-process']);
          } else {
            loading(false);
            this._toast.error(res.returnText, 'Failed');
          }
        }, (err: any) => {
          loading(false);
        });
      } else if (this.searchCriteria.searchMode === 'sea-lcl') {
        this._searchService.getLCLPriceDetails(params).subscribe((res: any) => {
          if (res.returnId === 1 && JSON.parse(res.returnText).length > 0) {
            let priceDetaisl: PriceDetail[] = JSON.parse(res.returnText);
            priceDetaisl = this._currencyControl.applyCurrencyRateOnBookingPriceDetails(priceDetaisl)
            this._currencyControl.setExchangeRate(data.ExchangeRate)
            HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
            const { ProviderID, ProviderImage, ProviderName, ProviderInsurancePercent, IsInsuranceProvider } = this.data
            let PolCountryName = data.PolCountryName;
            let PodCountryName = data.PodCountryName

            if (this.searchCriteria.SearchCriteriaPickupGroundDetail) {
              const { LongName_L1 } = this.searchCriteria.SearchCriteriaPickupGroundDetail.AddressComponents
              PolCountryName = LongName_L1
            }
            if (this.searchCriteria.SearchCriteriaDropGroundDetail) {
              const { LongName_L1 } = this.searchCriteria.SearchCriteriaDropGroundDetail.AddressComponents
              PodCountryName = LongName_L1
            }

            const bookingDetails = {
              BookingID: -1,
              PolName: this.searchCriteria.pickupPortName,
              PodName: this.searchCriteria.deliveryPortName,
              ProviderName: ProviderName,
              ProviderImage: ProviderImage,
              ContainerCount: HashCardComponent.getContCount(this.searchCriteria),
              ContainerLoad: this.searchCriteria.containerLoad,
              VesselCode: data.VesselCode,
              VesselName: data.VesselName,
              EtdLcl: data.EtdLcl,
              VoyageRefNum: data.VoyageRefNum,
              CarrierName: data.CarrierName,
              TransitTime: data.EtaInDays,
              PortCutOffUtc: data.PortCutOffUtc,
              BookingTotalAmount: data.TotalPrice,
              CurrencyCode: data.CurrencyCode,
              DiscountPrice: data.DiscountPrice,
              DiscountPercent: 0,
              CarrierImage: data.CarrierImage,
              CarrierID: data.CarrierID,
              BookingContainerDetail: BookingStaticUtils.generateContainerDetails(this.searchCriteria),
              CurrencyID: data.CurrencyID,
              EtaLcl: data.EtaLcl,
              EtaUtc: data.EtaUtc,
              EtdUtc: data.EtdUtc,
              FreeTimeAtPort: data.FreeTimeAtPort,
              HashMoveBookingDate: null,
              HashMoveBookingNum: null,
              IsAnyRestriction: data.IsAnyRestriction,
              IsInsured: false,
              IsInsuranceProvider: IsInsuranceProvider,
              ProviderInsurancePercent: ProviderInsurancePercent,
              InsuredGoodsPrice: null,
              InsuredGoodsCurrencyID: data.CurrencyID,
              InsuredGoodsCurrencyCode: data.CurrencyCode,
              IsInsuredGoodsBrandNew: false,
              InsuredGoodsProviderID: ProviderID,
              InsuredStatus: 'Insured',
              PodCode: data.PodCode,
              PodModeOfTrans: data.PodModeOfTrans,
              PolCode: data.PolCode,
              PolModeOfTrans: data.PolModeOfTrans,
              PortCutOffLcl: data.PortCutOffLcl,
              BookingPriceDetail: priceDetaisl,
              ProviderID: ProviderID,
              BookingRouteDetail: null,
              BookingEnquiryDetail: null,
              ShippingCatName: this.searchCriteria.shippingCatID + '',
              ShippingModeCode: this.searchCriteria.SearchCriteriaTransportationDetail[0].modeOfTransportCode,
              ShippingModeName: this.searchCriteria.SearchCriteriaTransportationDetail[0].modeOfTransportDesc,
              ShippingSubCatName: this.searchCriteria.shippingSubCatID + '',
              PolID: data.PolID,
              PodID: data.PodID,
              ShippingCatID: this.searchCriteria.shippingCatID,
              ShippingModeID: this.searchCriteria.shippingModeID,
              ShippingSubCatID: this.searchCriteria.shippingSubCatID,
              IDlist: data.IDlist,
              IDListDetail: actutalScheduleDtl,
              EtaInDays: data.EtaInDays,
              InsuredGoodsBaseCurrencyID: data.BaseCurrencyID,
              InsuredGoodsBaseCurrencyCode: data.BaseCurrencyCode,
              InsuredGoodsExchangeRate: data.ExchangeRate,
              InsuredGoodsBaseCurrPrice: 0, //For Now
              InsuredGoodsActualPrice: 0, //For Now
              ExchangeRate: data.ExchangeRate,
              BaseCurrencyCode: data.BaseCurrencyCode,
              BaseCurrencyID: data.BaseCurrencyID,
              BaseCurrTotalAmount: data.BaseTotalPrice,
              PolCountry: PolCountryName,
              PodCountry: PodCountryName,
              FlightNo: data.FlightNo,
              AirCraftInfo: data.AirCraftInfo,
              isExcludeExp: false,
              isExcludeImp: false,
              IsSpecialRequest: true,
              SpecialRequestDesc: this.desc
            };
            // HashStorage.setItem('bookingInfo', JSON.stringify(bookingDetails))
            // this._dataService.setBookingsData(bookingDetails)
            BookingStaticUtils.saveBookingAction(bookingDetails,
              getLoggedUserData(),
              this._cookieService,
              this._dropDownService,
              this._bookingService,
              null,
              this.searchCriteria,
              this._toast,
              this._currencyControl,
              this._router,
              this._modalService,
              false,
              true,
              this.desc
            ).then(res => {
              this.closeModal()
            }).catch(res => {
              this.closeModal()
            })
            // this._cookieService.deleteCookies();
            loading(false);
            // this._router.navigate(['booking-process']);
          } else {
            loading(false);
            this._toast.error(res.returnText, 'Failed');
          }
        }, (err: any) => {
          loading(false);
        });
      } else if (this.searchCriteria.searchMode === 'truck-ftl') {
        this._searchService.getTruckPriceDetails(params).subscribe((res: any) => {
          if (res.returnId === 1 && JSON.parse(res.returnText).length > 0) {
            let priceDetaisl: PriceDetail[] = JSON.parse(res.returnText);
            priceDetaisl = this._currencyControl.applyCurrencyRateOnBookingPriceDetails(priceDetaisl)
            this._currencyControl.setExchangeRate(data.ExchangeRate)
            HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
            const { ProviderID, ProviderImage, ProviderName, ProviderInsurancePercent, IsInsuranceProvider } = this.data
            let PolCountryName = data.PolCountryName;
            let PodCountryName = data.PodCountryName

            if (this.searchCriteria.SearchCriteriaPickupGroundDetail) {
              const { LongName_L1 } = this.searchCriteria.SearchCriteriaPickupGroundDetail.AddressComponents
              PolCountryName = LongName_L1
            }
            if (this.searchCriteria.SearchCriteriaDropGroundDetail) {
              const { LongName_L1 } = this.searchCriteria.SearchCriteriaDropGroundDetail.AddressComponents
              PodCountryName = LongName_L1
            }

            const bookingDetails = {
              BookingID: -1,
              PolName: this.searchCriteria.pickupPortName,
              PodName: this.searchCriteria.deliveryPortName,
              ProviderName: ProviderName,
              ProviderImage: ProviderImage,
              ContainerCount: HashCardComponent.getContCount(this.searchCriteria),
              ContainerLoad: this.searchCriteria.containerLoad,
              VesselCode: data.VesselCode,
              VesselName: data.VesselName,
              EtdLcl: data.EtdLcl,
              VoyageRefNum: data.VoyageRefNum,
              CarrierName: data.CarrierName,
              TransitTime: data.EtaInDays,
              PortCutOffUtc: data.PortCutOffUtc,
              BookingTotalAmount: data.TotalPrice,
              CurrencyCode: data.CurrencyCode,
              DiscountPrice: data.DiscountPrice,
              DiscountPercent: 0,
              CarrierImage: data.CarrierImage,
              CarrierID: data.CarrierID,
              BookingContainerDetail: BookingStaticUtils.generateContainerDetails(this.searchCriteria),
              CurrencyID: data.CurrencyID,
              EtaLcl: data.EtaLcl,
              EtaUtc: data.EtaUtc,
              EtdUtc: data.EtdUtc,
              FreeTimeAtPort: data.FreeTimeAtPort,
              HashMoveBookingDate: null,
              HashMoveBookingNum: null,
              IsAnyRestriction: data.IsAnyRestriction,
              IsInsured: false,
              IsInsuranceProvider: IsInsuranceProvider,
              ProviderInsurancePercent: ProviderInsurancePercent,
              InsuredGoodsPrice: null,
              InsuredGoodsCurrencyID: data.CurrencyID,
              InsuredGoodsCurrencyCode: data.CurrencyCode,
              IsInsuredGoodsBrandNew: false,
              InsuredGoodsProviderID: ProviderID,
              InsuredStatus: 'Insured',
              PodCode: data.PodCode,
              PodModeOfTrans: data.PodModeOfTrans,
              PolCode: data.PolCode,
              PolModeOfTrans: data.PolModeOfTrans,
              PortCutOffLcl: data.PortCutOffLcl,
              BookingPriceDetail: priceDetaisl,
              ProviderID: ProviderID,
              BookingRouteDetail: null,
              BookingEnquiryDetail: null,
              ShippingCatName: this.searchCriteria.shippingCatID + '',
              ShippingModeCode: this.searchCriteria.SearchCriteriaTransportationDetail[0].modeOfTransportCode,
              ShippingModeName: this.searchCriteria.SearchCriteriaTransportationDetail[0].modeOfTransportDesc,
              ShippingSubCatName: this.searchCriteria.shippingSubCatID + '',
              PolID: data.PolID,
              PodID: data.PodID,
              ShippingCatID: this.searchCriteria.shippingCatID,
              ShippingModeID: this.searchCriteria.shippingModeID,
              ShippingSubCatID: this.searchCriteria.shippingSubCatID,
              IDlist: data.IDlist,
              IDListDetail: actutalScheduleDtl,
              EtaInDays: data.EtaInDays,
              InsuredGoodsBaseCurrencyID: data.BaseCurrencyID,
              InsuredGoodsBaseCurrencyCode: data.BaseCurrencyCode,
              InsuredGoodsExchangeRate: data.ExchangeRate,
              InsuredGoodsBaseCurrPrice: 0, //For Now
              InsuredGoodsActualPrice: 0, //For Now
              ExchangeRate: data.ExchangeRate,
              BaseCurrencyCode: data.BaseCurrencyCode,
              BaseCurrencyID: data.BaseCurrencyID,
              BaseCurrTotalAmount: data.BaseTotalPrice,
              PolCountry: PolCountryName,
              PodCountry: PodCountryName,
              FlightNo: data.FlightNo,
              AirCraftInfo: data.AirCraftInfo,
              isExcludeExp: false,
              isExcludeImp: false,
              IsSpecialRequest: true,
              SpecialRequestDesc: this.desc
            };
            // HashStorage.setItem('bookingInfo', JSON.stringify(bookingDetails))
            // this._dataService.setBookingsData(bookingDetails)
            BookingStaticUtils.saveBookingAction(bookingDetails,
              getLoggedUserData(),
              this._cookieService,
              this._dropDownService,
              this._bookingService,
              null,
              this.searchCriteria,
              this._toast,
              this._currencyControl,
              this._router,
              this._modalService,
              false,
              true,
              this.desc
            ).then(res => {
              this.closeModal()
            }).catch(res => {
              this.closeModal()
            })
            // this._cookieService.deleteCookies();
            loading(false);
            // this._router.navigate(['booking-process']);
          } else {
            loading(false);
            this._toast.error(res.returnText, 'Failed');
          }
        }, (err: any) => {
          loading(false);
        });
      }
      this.loading = false
    }
  }


}
