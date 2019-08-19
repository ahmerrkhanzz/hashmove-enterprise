import { Component, OnInit, Input, ViewEncapsulation, OnDestroy, OnChanges } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { RouteMap, SearchResult, PriceReqParams } from '../../../interfaces/searchResult';
import { SearchResultService } from '../../../components/search-results/fcl-search/fcl-search.service';
import { JsonResponse } from '../../../interfaces/JsonResponse';
import { Observable } from 'rxjs';
import * as fromLclAir from '../../../components/search-results/air-search/store'
import { Store } from '@ngrx/store';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Router } from '@angular/router';
import { SearchCriteria } from '../../../interfaces/searchCriteria';
import { HashStorage, loading, getTimeStr, getGreyIcon, getAnimatedGreyIcon, getImagePath, ImageSource, ImageRequiredSize, getMovementType, Tea, isJSON } from '../../../constants/globalfunctions';
import { PaginationInstance } from 'ngx-pagination';
import { HttpErrorResponse } from '@angular/common/http';
import { CookieService } from '../../../services/cookies.injectable';
import { ShareshippingComponent } from '../../dialogues/shareshipping/shareshipping.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PriceDetail, ContainerDetail } from '../../../interfaces/bookingDetails';
import { CurrencyControl } from '../../currency/currency.injectable';
import { DataService } from '../../../services/commonservice/data.service';
import { ToastrService } from 'ngx-toastr';
import { TermsConditDialogComponent } from '../../dialogues/terms-condition/terms-condition.component';
import { RequestSpeacialPriceComponent } from '../../dialogues/request-speacial-price/request-speacial-price.component';
import { baseExternalAssets } from '../../../constants/base.url';

@Component({
  selector: 'app-hash-search-card',
  templateUrl: './hash-search-card.component.html',
  styleUrls: ['./hash-search-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
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
export class HashCardComponent implements OnInit, OnChanges, OnDestroy {

  @Input() type: string;
  @Input() searchResult: Array<SearchResult> = []
  public searchCriteria: SearchCriteria

  public hideRoute = {};
  public portWare = []
  public portLand = []
  public portAir = []
  public portSea = []
  public portDoor = [];

  public selectedRoutesInfo = [];
  public routesDirection = [];
  public RouteMap: RouteMap = {
    Route: "",
    TransitTime: 0,
    CarrierName: "",
    CarrierImage: "",
    FreeTimeAtPort: 0,
    RouteInfo: []
  }
  public config: PaginationInstance = {
    id: 'advanced2',
    itemsPerPage: 5,
    currentPage: 1
  };
  public labels: any = {
    previousLabel: '',
    nextLabel: '',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };

  public maxSize: number = 7;


  public totalPages: number = 0


  public $fclSearchResults: Observable<fromLclAir.LclAirState>
  public cardClass: string;
  public selectedProvider: any;

  constructor(
    private _searchService: SearchResultService,
    private _store: Store<any>,
    private _storeProvider: Store<any>,
    private _router: Router,
    private _cookieService: CookieService,
    private _modalService: NgbModal,
    private _currencyControl: CurrencyControl,
    private _dataService: DataService,
    private _toast: ToastrService,
  ) {
    this.hideRoute = {};
    this.portWare = Array(1).fill(0).map((x, i) => i);
    this.portLand = Array(3).fill(0).map((x, i) => i);
    this.portAir = Array(5).fill(0).map((x, i) => i);
    this.portSea = Array(14).fill(0).map((x, i) => i);
  }

  ngOnInit() {
    this.selectedProvider = JSON.parse(HashStorage.getItem('selectedProvider'))
    this.$fclSearchResults = this._store.select('lcl_air')
    this._storeProvider.select('lcl_air_forwarder')
    this.searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))
    const loginObj = JSON.parse(Tea.getItem('loginUser'));
    this.addCardClass()
  }

  ngOnChanges(x) {
    this.onPageChange(1);
  }

  addCardClass() {
    if (this.searchCriteria.searchMode === 'sea-fcl' || this.searchCriteria.searchMode === 'air-lcl') {
      this.cardClass = 'fcl'
    }
  }
  getRouteDetails(bookRefIDs, index) {
    this.hideRoute[index] = !this.hideRoute[index]
    const { TransportMode, pickupPortType, deliveryPortType } = this.searchCriteria
    let data = {
      bookingReferenceIDs: bookRefIDs,
      shippingMode: TransportMode,
      pickupPortType: pickupPortType,
      deliveryPortType: deliveryPortType
    }
    this._searchService.getRouteMapInfo(data).toPromise().then((res: JsonResponse) => {
      if (res != null && res.returnId == 1) {
        let jsonString = res.returnText;
        let temp = JSON.parse(jsonString);
        this.RouteMap = temp[0];
        this.setRouteDirections(this.RouteMap.Route, index);
      }
    }).catch((error: HttpErrorResponse) => {
    })
  }
  setRouteDirections(route, index) {
    let listOfRoutes = (route.split('^'));
    this.routesDirection[index] = []
    let y = [];
    for (let i = 0; i < listOfRoutes.length; i++) {
      let childRoute = listOfRoutes[i];
      setTimeout(() => {
        y.push(childRoute.split('|'));
      }, 300 * (i + 1));
    }
    this.routesDirection[index] = y;
  }
  getRoutesObject(index) {
    return this.RouteMap;
  }

  getIndexedRouted(index) {
    this.selectedRoutesInfo[index] = [];
    let x = this.getRoutesObject(index);
    let indexed = 0;
    let y = [];
    let timeInterval = 300;
    setInterval(() => {
      if (indexed == x.RouteInfo.length)
        return;
      y.push(x.RouteInfo[indexed]);
      timeInterval = timeInterval + 300
      index++;
      indexed++;
    }, timeInterval);
    this.selectedRoutesInfo[index] = y;
  }

  getIndexedMap(index) {
    this.selectedRoutesInfo[index] = [];
    let x = this.getRoutesObject(index);
    let listOfRoutes = (x.Route.split('^'));
    this.routesDirection[index] = []
    let y = [];
    for (let i = 0; i < listOfRoutes.length; i++) {
      let student = listOfRoutes[i];
      setTimeout(() => {
        y.push(student.split('|'));
      }, 300 * (i + 1));
    }
    this.routesDirection[index] = y;
  }

  resetHide() {
    for (let i = 0; i < 10; i++) {
      this.hideRoute[i] = false
    }
  }

  getRepeatTimes(type) {
    if (type === 'SEA') {
      return this.portSea
    } else if (type === 'LAND') {
      return this.portLand
    } else if (type === 'AIR') {
      return this.portAir
    } else if (type === 'WAREHOUSE') {
      return this.portWare
    } else if (type === 'DOOR') {
      return this.portWare
    }
  }
  getViaRoutes(route) {
    let str = route
    let arr = str.split('->');
    let index = arr.length - 2;
    let str2 = ''

    if (arr.length === 3) {
      str2 = 'via ' + arr[index]
    } else if (arr.length > 3) {
      str2 = 'via ' + arr[index] + ' +' + (arr.length - 3) + ' more'
    } else if (arr.length === 2) {
      str2 = 'Direct'
    }
    return str2
  }

  bookNowAir(carrier: SearchResult) {
    loading(true)
    let paramsObject: any[] = this.searchCriteria.SearchCriteriaContainerDetail
    // if (!this.searchCriteria.SearchCriteriaContainerDetail[0].contRequestedQty) {
    //   let conDetails: any[] = this.searchCriteria.SearchCriteriaContainerDetail

    //   paramsObject = []
    //   conDetails.forEach(elem => {
    //     let temp = {
    //       contSpecID: elem.contSpecID,
    //       contRequestedCBM: elem.contRequestedCBM,
    //       contRequestedQty: elem.contRequestedQty,
    //       contRequestedWeight: elem.contRequestedWeight
    //     }
    //     paramsObject.push(temp)
    //   })
    // }
    const { imp_Exp, TransportMode, pickupPortType, deliveryPortType, containerLoad, CustomerID, CustomerType } = this.searchCriteria
    const { PortJsonData } = carrier
    const params: any = {
      imp_Exp,
      pickupPortType,
      deliveryPortType,
      PortJsonData: (PortJsonData) ? PortJsonData : '[]',
      customerID: (CustomerID) ? CustomerID : -1,
      customerType: (CustomerType) ? CustomerType : 'user',
      bookingReferenceIDs: carrier.IDlist,
      shippingMode: TransportMode,
      SearchCriteriaContainerDetail: paramsObject,
      chargeableWeight: this.searchCriteria.chargeableWeight
    };

    const { bookingReferenceIDs } = params

    const movementType: string = getMovementType(pickupPortType, deliveryPortType)
    this._searchService.getActualScheduleDetailWithPrice(bookingReferenceIDs, movementType, containerLoad, TransportMode, CustomerID, CustomerType).subscribe((resp: JsonResponse) => {
      const { returnId, returnText } = resp
      if (returnId > 0) {
        this.getPriceBreakDown(params, carrier, returnText)
      } else {
        loading(false)
      }
    }, (err: HttpErrorResponse) => {
      loading(false)
    })
    // this.getPriceBreakDownAir(carrier)
  }

  async getPriceBreakDownAir(carrier, params: PriceReqParams, actutalScheduleDtl: any) {
    try {
      let res: any
      if (this.searchCriteria.searchMode.toLowerCase() === 'air-lcl') {
        res = await this._searchService.getPriceDetails(params).toPromise()
      } else {
        res = await this._searchService.getLCLPriceDetails(params).toPromise()
      }

      if (res.returnId === 1 && JSON.parse(res.returnText).length > 0) {


        let priceDetaisl: PriceDetail[] = JSON.parse(res.returnText);
        priceDetaisl = this._currencyControl.applyCurrencyRateOnBookingPriceDetails(priceDetaisl)
        this._currencyControl.setExchangeRate(carrier.ExchangeRate)
        HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
        let PolCountryName = null;
        let PodCountryName = null

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
          CommodityType: 'demo',
          PolName: this.searchCriteria.pickupPortName,
          PodName: this.searchCriteria.deliveryPortName,
          ProviderName: carrier.ProviderName,
          ContainerCount: this.generateContainersCount(),
          ContainerLoad: this.searchCriteria.containerLoad,
          VesselCode: carrier.VesselCode,
          VesselName: carrier.VesselName,
          EtdLcl: carrier.EtdLcl,
          VoyageRefNum: carrier.VoyageRefNum,
          CarrierName: carrier.CarrierName,
          TransitTime: carrier.EtaInDays,
          PortCutOffUtc: carrier.PortCutOffUtc,
          BookingTotalAmount: carrier.TotalPrice,
          CurrencyCode: carrier.CurrencyCode,
          DiscountPrice: carrier.DiscountPrice,
          DiscountPercent: 0,
          ProviderImage: carrier.ProviderImage,
          CarrierImage: carrier.CarrierImage,
          CarrierID: carrier.CarrierID,
          BookingContainerDetail: this.generateContainerDetails(),
          CurrencyID: carrier.CurrencyID,
          EtaLcl: carrier.EtaLcl,
          EtaUtc: carrier.EtaUtc,
          EtdUtc: carrier.EtdUtc,
          FreeTimeAtPort: carrier.FreeTimeAtPort,
          HashMoveBookingDate: null,
          HashMoveBookingNum: null,
          IsAnyRestriction: carrier.IsAnyRestriction,
          IsInsured: false,
          IsInsuranceProvider: carrier.IsInsuranceProvider,
          ProviderInsurancePercent: carrier.ProviderInsurancePercent,
          InsuredGoodsPrice: null,
          InsuredGoodsCurrencyID: carrier.CurrencyID,
          InsuredGoodsCurrencyCode: carrier.CurrencyCode,
          IsInsuredGoodsBrandNew: false,
          InsuredGoodsProviderID: carrier.ProviderID,
          InsuredStatus: 'Insured',
          PodCode: carrier.PodCode,
          PodModeOfTrans: carrier.PodModeOfTrans,
          PolCode: carrier.PolCode,
          PolModeOfTrans: carrier.PolModeOfTrans,
          PortCutOffLcl: carrier.PortCutOffLcl,
          BookingPriceDetail: priceDetaisl,
          ProviderID: carrier.ProviderID,
          BookingRouteDetail: null,
          BookingEnquiryDetail: null,
          ShippingCatName: this.searchCriteria.shippingCatID + '',
          ShippingModeCode: this.searchCriteria.SearchCriteriaTransportationDetail[0].modeOfTransportCode,
          ShippingModeName: this.searchCriteria.SearchCriteriaTransportationDetail[0].modeOfTransportDesc,
          ShippingSubCatName: this.searchCriteria.shippingSubCatID + '',
          PolID: carrier.PolID,
          PodID: carrier.PodID,
          ShippingCatID: this.searchCriteria.shippingCatID,
          ShippingModeID: this.searchCriteria.shippingModeID,
          ShippingSubCatID: this.searchCriteria.shippingSubCatID,
          IDlist: carrier.IDlist,
          IDListDetail: actutalScheduleDtl,
          EtaInDays: carrier.EtaInDays,
          InsuredGoodsBaseCurrencyID: carrier.BaseCurrencyID,
          InsuredGoodsBaseCurrencyCode: carrier.BaseCurrencyCode,
          InsuredGoodsExchangeRate: carrier.ExchangeRate,
          InsuredGoodsBaseCurrPrice: 0, //For Now
          InsuredGoodsActualPrice: 0, //For Now
          ExchangeRate: carrier.ExchangeRate,
          BaseCurrencyCode: carrier.BaseCurrencyCode,
          BaseCurrencyID: carrier.BaseCurrencyID,
          BaseCurrTotalAmount: carrier.BaseTotalPrice,
          FlightNo: carrier.FlightNo,
          AirCraftInfo: carrier.AirCraftInfo,
          PolCountry: PolCountryName,
          PodCountry: PodCountryName,
          isExcludeExp: false,
          isExcludeImp: false
        };
        // HashStorage.setItem('bookingInfo', JSON.stringify(bookingDetails))
        await this._dataService.setBookingsData(bookingDetails);
        // this._cookieService.deleteCookies();
        loading(false);
        this._router.navigate(['booking-process']);
      } else {
        loading(false);
        this._toast.error(res.returnText, 'Failed');
      }
    } catch (err) {
      loading(false);
    }
  }

  bookNowCarriers(data: SearchResult) {
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
        const { returnId, returnText } = resp
        if (returnId > 0) {
          this.getPriceBreakDown(params, data, returnText);
        } else {
        }
      }, (error: HttpErrorResponse) => {
      })

      // this.getPriceBreakDown(params, data);

    }
  }

  onSpecialPrice(data) {
    const modalRef = this._modalService.open(RequestSpeacialPriceComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'request-special',
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.data = data
  }
  generateContainersCount() {
    try {
      let total = [];
      this.searchCriteria.SearchCriteriaContainerDetail.forEach(element => {
        total.push(element.contRequestedQty);
      });
      total = total.reduce((all, item) => {
        return all + item;
      });
      return total;
    } catch (error) {
      return 0
    }
  }

  onTermsClick($item: any, $action: string) {
    const { searchMode } = this.searchCriteria
    if ($action === 'action') {
      switch (searchMode) {
        case 'air-lcl':
          this.bookNowAir($item)
          break;
        case 'sea-fcl':
          this.bookNowCarriers($item)
          break;
      }
    } else {
      if (HashStorage.getItem('partnerId')) {
        loading(true)
        this._searchService.getTermsCondition(this.selectedProvider.ProviderID, searchMode).subscribe((res: JsonResponse) => {
          loading(false)
          const { returnObject, returnId } = res
          if (returnId > 0) {
            const { TermsCondition } = returnObject
            $item.termsCondition = TermsCondition
            this.openTermsDialog($item, TermsCondition, searchMode, $action)
          }
        }, (err: HttpErrorResponse) => { })
      } else {
        loading(true)
        const carrierCriteria = JSON.parse(HashStorage.getItem('carrierSearchCriteria'))
        const { termsCondition } = carrierCriteria
        this.openTermsDialog($item, termsCondition, searchMode, $action)
        loading(false)
      }
    }

  }



  openTermsDialog($item: any, termsCondition: string, $mode: string, action) {
    const modalRef = this._modalService.open(TermsConditDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'termsAndCondition',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.messageData = {
      data: { provider: $item, termsCondition, action },
    }
    modalRef.result.then((result: string) => {
      if (result === 'accept') {
        switch ($mode) {
          case 'air-lcl':
            this.bookNowAir($item)
            break;
          case 'sea-fcl':
            this.bookNowCarriers($item)
            break;
        }
      }
    })
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }


  generateContainerDetails(): ContainerDetail[] {
    let tempCont: ContainerDetail;
    let contDtl: ContainerDetail[] = [];
    this.searchCriteria.SearchCriteriaContainerDetail.forEach(element => {
      tempCont = {
        BookingContTypeQty: element.contRequestedQty,
        BookingPkgTypeCBM: 0,
        BookingPkgTypeWeight: 0,
        ContainerSpecID: element.contSpecID,
        ContainerSpecCode: null,
        ContainerSpecDesc: null,
        PackageCBM: 0,
        PackageWeight: 0,
        volumetricWeight: 0,
        IsQualityMonitoringRequired: false,
        IsTrackingRequired: false,
        JsonContainerDetail: JSON.stringify({
          IsTrackingApplicable: element.IsTrackingApplicable,
          IsQualityApplicable: element.IsQualityApplicable
        })
      };
      contDtl.push(tempCont);
    });
    return contDtl;
  }

  getPriceBreakDown(params, data: any, actutalScheduleDtl: string) {
    const loginObj = JSON.parse(Tea.getItem('loginUser'));
    if (loginObj && !loginObj.IsLogedOut) {
      params.customerID = loginObj.UserID;
    } else {
      params.customerID = null;
    }
    if (HashStorage) {
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
            ContainerCount: this.generateContainersCount(),
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
            BookingContainerDetail: this.generateContainerDetails(),
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
            isExcludeImp: false
          };
          // HashStorage.setItem('bookingInfo', JSON.stringify(bookingDetails))
          this._dataService.setBookingsData(bookingDetails)
          // this._cookieService.deleteCookies();
          loading(false);
          this._router.navigate(['booking-process']);
        } else {
          loading(false);
          this._toast.error(res.returnText, 'Failed');
        }
      }, (err: any) => {
        loading(false);
      });
    }
  }


  getTotalPages() {
    let temp: any = this.searchResult
    try {
      return Math.ceil(temp.length / this.config.itemsPerPage)
    }
    catch (err) {
      return 0
    }
  }

  onPageChange(number: any) {
    this.resetHide()
    this.config.currentPage = number;
    this._cookieService.setCookie('ship-page', number, 1)
  }

  shareShippingInfo(provider, Carrier) {

    const ContainerLoadType: string = this.searchCriteria.containerLoad
    const ShippingMode: string = this.searchCriteria.TransportMode
    const selectedProvider = JSON.parse(HashStorage.getItem('selectedProvider'))


    const modalRef = this._modalService.open(ShareshippingComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.shareObjectInfo = {
      carrier: Carrier,
      provider: selectedProvider,
      ContainerLoadType: ContainerLoadType,
      ShippingMode: ShippingMode
    }
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }

  getFlightTime(time: number) {
    return getTimeStr(time)
  }

  getImageByMode($transMode: string) {
    return getGreyIcon($transMode)
  }

  getAnimatedImageByMode($transMode: string) {
    return getAnimatedGreyIcon($transMode)
  }

  getCarrierImage($image: string) {
    if (isJSON($image)) {
      const providerImage = JSON.parse($image)
      return baseExternalAssets + '/' + providerImage[0].DocumentFile
    } else {
      return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
    }
  }

  static getContCount(searchCriteria) {
    let total = [];
    searchCriteria.SearchCriteriaContainerDetail.forEach(element => {
      total.push(element.contRequestedQty);
    });
    total = total.reduce((all, item) => {
      return all + item;
    });
    return total;
  }

  getJsonDepartureDays($jsonData: string) {
    let strReturn: string = ''
    try {
      const jsonData: any = JSON.parse($jsonData)
      if (jsonData.JsonDepartureDays && jsonData.JsonDepartureDays.length > 1) {
        const arr: Array<any> = jsonData.JsonDepartureDays.split(',')
        arr.forEach(element => {
          strReturn += element + "<br/>"
        })
      } else {
        strReturn = 'N/A'
      }
    } catch (error) {
      strReturn = 'N/A'
    }
    return strReturn
  }


  ngOnDestroy() {

  }

}
