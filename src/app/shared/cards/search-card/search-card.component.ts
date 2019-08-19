import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { HashStorage, loading, getMovementType, getImagePath, ImageSource, ImageRequiredSize, getDateDiff, getProviderImage, Tea, cloneObject, isJSON } from '../../../constants/globalfunctions';
import { SearchResult, ProvidersSearchResult, PriceReqParams } from '../../../interfaces/searchResult';
import { SearchCriteria, SearchCriteriaContainerDetail } from '../../../interfaces/searchCriteria';
import { SearchResultService } from '../../../components/search-results/fcl-search/fcl-search.service';
import { ContainerDetail, PriceDetail, WarehouseBookingDetails, BookingSurChargeDetailWarehouse, ViewBooking } from '../../../interfaces/bookingDetails';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../../services/commonservice/data.service';
import { JsonResponse } from '../../../interfaces/JsonResponse';
import { PaginationInstance } from 'ngx-pagination';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { Lightbox } from 'ngx-lightbox';
import { WareDocumentData } from '../../../interfaces/warehouse.interface';
import { baseExternalAssets } from '../../../constants/base.url';
import { WarehousingService } from '../../../components/main/warehousing/warehousing.service';
import { CurrencyControl } from '../../currency/currency.injectable';
import { GeneralService } from '../../setup/general.injectable';
import { Store } from "@ngrx/store";
import * as fromFclShipping from "../../../components/search-results/fcl-search/store";
import { Observable } from "rxjs/Observable";
import { CookieService } from '../../../services/cookies.injectable';
import { untilDestroyed } from 'ngx-take-until-destroy';
import * as fromLclAir from "../../../components/search-results/air-search/store";
import { TermsConditDialogComponent } from '../../dialogues/terms-condition/terms-condition.component';
import { VideoDialogComponent } from '../../dialogues/video-dialog/video-dialog.component'
import { NgScrollbar } from 'ngx-scrollbar';
import { RequestSpeacialPriceComponent } from '../../dialogues/request-speacial-price/request-speacial-price.component';


@Component({
  selector: 'app-search-card',
  templateUrl: './search-card.component.html',
  styleUrls: ['./search-card.component.scss']
})
export class SearchCardComponent implements OnInit, OnDestroy, OnChanges {

  // public searchResult: SearchResult[];
  @ViewChild(NgScrollbar) scrollRef: NgScrollbar;
  @Input() type: string;
  @Input() searchResult: any;
  @Input() currentPage: number = 0;
  @Input() haveRecProviders: boolean
  @Output() mapCardEmitter = new EventEmitter<number>();
  public loading: boolean = false;
  public commonUnit: string;
  public searchCriteria: any;
  public lclQuantity = [];
  public lclQunatitySum: number;

  public maxSize: number = 7;
  public directionLinks: boolean = true;
  public autoHide: boolean = false;
  public toggleDiv = false;
  public config: PaginationInstance = {
    id: 'advanced2',
    itemsPerPage: 5,
    currentPage: 1
  };
  public config2: PaginationInstance = {
    id: 'advanced3',
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


  itemsPerPage: number = 5;
  totalItems: number;
  previousPage: number;
  public selectedCarrier: SearchResult
  imageData = data;
  private _albums = [];
  public dateDifference: any;
  public today: any = {
    ClosingTime: "",
    DayName: "",
    IsClosed: false,
    OpeningTime: ""
  };
  public currentDay: number;
  public BookingSurChargeDetail: BookingSurChargeDetailWarehouse[] = [];
  public cardClass: string;
  public warehosueResp: any;
  public actualScheduleResp: any;

  public $fclSearchResults: Observable<fromFclShipping.FclShippingState>;
  public $fclAirSearchResultsForward: Observable<fromLclAir.FclForwarderState>
  public shippingLines: any[];
  private termsAndCondit: string = ''
  public videoURL: string;
  public customerProviders: any[] = []
  public lastElem: any = {}
  public nonRecommendedResults:any[] = []


  constructor(
    private _searchService: SearchResultService,
    private _warehousingService: WarehousingService,
    private _router: Router,
    private _toast: ToastrService,
    private _dataService: DataService,
    private _modalService: NgbModal,
    private _lightbox: Lightbox,
    private _currencyControl: CurrencyControl,
    private _generalService: GeneralService,
    private store: Store<any>,
    private _cookieService: CookieService,
  ) {
  }

  ngOnInit() {
    this.$fclSearchResults = this.store.select("fcl_shippings");
    this.$fclAirSearchResultsForward = this.store.select('lcl_air')
    this.searchResult.forEach(e => {
      e.composeiteKey = e.ProviderID + '' + e.PolID + '' + e.PodID
    })
    let todayDate = new Date();
    this.config.currentPage = 1
    this.currentDay = todayDate.getDay();
    this.selectedCarrier = JSON.parse(HashStorage.getItem('selectedCarrier'))
    this.searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'));
    this.customerProviders = this.searchResult.filter(e => e.IsCustomerRecommended)
    this.nonRecommendedResults = this.searchResult.filter(e => !e.IsCustomerRecommended)
    
    if (this.customerProviders.length) {
      this.lastElem = this.customerProviders[this.customerProviders.length - 1]
    }
    this.addClass()

    if (this.searchCriteria.searchMode === 'warehouse-lcl') {
      const { StoreUntill, StoreFrom } = this.searchCriteria
      this.dateDifference = getDateDiff(StoreUntill, StoreFrom, 'days', "MM-DD-YYYY")
      this.searchResult.forEach(element => {
        this._albums = []
        const docsArray: Array<WareDocumentData> = JSON.parse(element.WHMedia)
        let idx = this.searchResult.indexOf(element);
        try {
          docsArray.forEach(doc => {
            if (doc.DocumentUploadedFileType.toLowerCase() === 'png' || doc.DocumentUploadedFileType.toLowerCase() === 'jpg' || doc.DocumentUploadedFileType.toLowerCase() === 'jpeg') {
              const album = {
                src: baseExternalAssets + '/' + doc.DocumentFile,
                caption: '&nbsp;',
                thumb: baseExternalAssets + '/' + doc.DocumentFile
              };
              this._albums.push(album)
              this.searchResult[idx].WHParsedMedia = this._albums;
            } else if (doc.DocumentUploadedFileType.toLowerCase() === 'mp4') {
              this.videoURL = baseExternalAssets + '/' + doc.DocumentFile
              this.searchResult[idx].videoURL = this.videoURL;
            }
          })
        } catch (error) { }
      });


      this.setDay();
    } else if (this.searchCriteria.searchMode !== 'truck-ftl' && this.searchCriteria.searchMode !== 'air-lcl') {
      this.calculateLCLQuantity();
    }
  }

  
  ngOnChanges(changes: SimpleChanges) {
    if (changes.searchResult) {
      this.config.currentPage = 1
      if (changes.searchResult.currentValue.length) {
        this.customerProviders = changes.searchResult.currentValue.filter(e => e.IsCustomerRecommended)
        this.nonRecommendedResults = changes.searchResult.currentValue.filter(e => !e.IsCustomerRecommended)
        if (this.customerProviders.length) {
          this.lastElem = this.customerProviders[this.customerProviders.length - 1]
        }
      }
    }
  }


  addClass() {
    if (this.searchCriteria.searchMode === 'sea-lcl' || this.searchCriteria.searchMode === 'truck-ftl') {
      this.cardClass = 'lcl'
    } else if (this.searchCriteria.searchMode === 'sea-fcl' || this.searchCriteria.searchMode === "air-lcl") {
      this.cardClass = 'fcl'
    } else if (this.searchCriteria.searchMode === 'warehouse-lcl') {
      this.cardClass = 'warehousing'
    }
  }

  open(index: number, imageArray): void {
    // open lightbox
    this._lightbox.open(imageArray, index);
  }

  close(): void {
    // close lightbox programmatically
    this._lightbox.close();
  }
  calculateLCLQuantity() {
    this.searchCriteria.SearchCriteriaContainerDetail.forEach(e => {
      if (this.searchCriteria.TransportMode.toLowerCase() === 'sea') {
        this.lclQuantity.push(e.contRequestedCBM);
        this.commonUnit = 'cbm'
      } else if (this.searchCriteria.TransportMode.toLowerCase() === 'air') {
        let x = (e.contRequestedWeight > e.volumetricWeight ? e.contRequestedWeight : e.volumetricWeight);
        this.commonUnit = 'kg'
        this.lclQuantity.push(x);
      }

    });
    this.lclQunatitySum = this.lclQuantity.reduce((all, item) => {
      return all + item;
    });
  }

  lclPricePerCBM(totalPrice) {
    return totalPrice / this.lclQunatitySum;
  }


  generateContainersCount() {
    let total = [];
    const { searchMode } = this.searchCriteria
    if (searchMode === 'truck-ftl') {
      this.searchCriteria.SearchCriteriaContainerDetail.forEach(element => {
        total.push(element.contRequestedQty);
      });
    } else {
      this.searchCriteria.SearchCriteriaContainerDetail.forEach(element => {
        total.push(element.contRequestedCBM);
      });
    }
    total = total.reduce((all, item) => {
      return all + item;
    });
    return total;
  }

  generateContainerDetails(): ContainerDetail[] {
    let tempCont: ContainerDetail;
    let contDtl: ContainerDetail[] = [];
    this.searchCriteria.SearchCriteriaContainerDetail.forEach(element => {
      if (this.searchCriteria.containerLoad === 'FCL' || this.searchCriteria.containerLoad === 'FTL') {
        tempCont = {
          BookingContTypeQty: (element.contRequestedCBM) ? element.contRequestedCBM : element.contRequestedQty,
          BookingPkgTypeCBM: 0,
          BookingPkgTypeWeight: 0,
          ContainerSpecID: element.contSpecID,
          ContainerSpecCode: null,
          ContainerSpecDesc: null,
          PackageCBM: 0,
          PackageWeight: 0,
          volumetricWeight: 0,
          IsTrackingRequired: false,
          IsQualityMonitoringRequired: false,
          JsonContainerDetail: JSON.stringify({
            IsTrackingApplicable: element.IsTrackingApplicable,
            IsQualityApplicable: element.IsQualityApplicable
          })
        };
      } else if (this.searchCriteria.containerLoad === 'LCL') {
        let higherWeight = element.contRequestedCBM > element.volumetricWeight ? element.contRequestedCBM : element.volumetricWeight;
        tempCont = {
          BookingContTypeQty: element.contRequestedQty,
          BookingPkgTypeCBM: element.contRequestedCBM,
          BookingPkgTypeWeight: higherWeight,
          ContainerSpecID: element.contSpecID,
          ContainerSpecCode: null,
          ContainerSpecDesc: null,
          PackageCBM: element.contRequestedCBM,
          PackageWeight: higherWeight,
          volumetricWeight: element.volumetricWeight,
          IsQualityMonitoringRequired: false,
          IsTrackingRequired: false,
          JsonContainerDetail: JSON.stringify({
            IsTrackingApplicable: element.IsTrackingApplicable,
            IsQualityApplicable: element.IsQualityApplicable
          })
        };
      }
      contDtl.push(tempCont);
    });
    return contDtl;
  }

  async bookNowWarehouse(item: any) {
    const { CustomerID, CustomerType } = this.searchCriteria
    this._searchService.getActualScheduleDetailWithPrice(item.IDList, 'warehouse', 'abc', 'abc', CustomerID, CustomerType).subscribe((resp: JsonResponse) => {
      const { returnId, returnText } = resp
      this.actualScheduleResp = JSON.parse(returnText);
      if (returnId > 0) {
        this.searchCriteria.IDList = item.IDList
        this.searchCriteria.SelProvID = item.ProviderID
        this.searchCriteria.SelWHID = item.WHID
        HashStorage.setItem('searchCriteria', JSON.stringify(this.searchCriteria))
        this._warehousingService.getWarehousePriceDetails(this.searchCriteria).subscribe((res) => {
          this.warehosueResp = res;
          let priceDetails: any[] = JSON.parse(this.warehosueResp.returnText);

          this._currencyControl.setExchangeRate(item.ExchangeRate)
          HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
          let response = JSON.parse(this.warehosueResp.returnText);
          response = this._currencyControl.applyCurrencyRateOnBookingPriceDetails(response)

          response.forEach((e) => {
            let obj: BookingSurChargeDetailWarehouse = {
              SurchargeType: e.SurchargeType,
              SurchargeID: e.SurchargeID,
              SurchargeCode: e.SurchargeCode,
              SurchargeName: e.SurchargeName,
              Price: e.Price,
              TotalAmount: e.TotalAmount,
              CurrencyID: e.CurrencyID,
              CurrencyCode: e.CurrencyCode,
              BaseCurrPrice: e.BaseCurrPrice,
              BaseCurrencyID: e.BaseCurrencyID,
              BaseCurrencyCode: e.BaseCurrencyCode,
              BaseCurrTotalAmount: e.BaseCurrTotalAmount,
              PriceBasis: e.SurchargeBasis,
              ActualPrice: e.Price,
              ActualTotalAmount: e.Price,
              ExchangeRate: e.ExchangeRate,
              CreatedBy: null
            }
            this.BookingSurChargeDetail.push(obj);
          });

          const parsedResponse = JSON.parse(returnText)
          const warehouseContainedData = parsedResponse.filter(e => e.ActualScheduleFor === 'WAREHOUSE')
          const copiedParsedResponse = warehouseContainedData[0];
          const WHJsonDataParsed = JSON.parse(warehouseContainedData[0].WHJsonData)
          // const WHTimingsParsed = JSON.parse(warehouseContainedData[0].WHTimings)
          // WHJsonDataParsed.WHTimings = Object.assign(WHTimingsParsed)
          let taxedTotalAmount: number = 0;
          let taxesBaseTotalAmount: number = 0;
          if (WHJsonDataParsed.TaxValue > 0) {
            this.BookingSurChargeDetail.forEach(e => {
              taxedTotalAmount += (e.TotalAmount * WHJsonDataParsed.TaxValue) / 100
              taxesBaseTotalAmount += (e.BaseCurrTotalAmount * WHJsonDataParsed.TaxValue) / 100
            })
          }
          const taxObj: BookingSurChargeDetailWarehouse = {
            SurchargeType: WHJsonDataParsed.TaxType,
            SurchargeID: WHJsonDataParsed.TaxID,
            SurchargeCode: WHJsonDataParsed.TaxCode,
            SurchargeName: WHJsonDataParsed.TaxName,
            Price: WHJsonDataParsed.TaxValue,
            TotalAmount: taxedTotalAmount,
            CurrencyID: this.BookingSurChargeDetail[0].CurrencyID,
            CurrencyCode: this.BookingSurChargeDetail[0].CurrencyCode,
            BaseCurrPrice: WHJsonDataParsed.TaxValue,
            BaseCurrencyID: this.BookingSurChargeDetail[0].BaseCurrencyID,
            BaseCurrencyCode: this.BookingSurChargeDetail[0].BaseCurrencyCode,
            BaseCurrTotalAmount: taxesBaseTotalAmount,
            PriceBasis: WHJsonDataParsed.TaxBasis,
            ActualPrice: WHJsonDataParsed.TaxValue,
            ActualTotalAmount: taxedTotalAmount,
            ExchangeRate: this.BookingSurChargeDetail[0].ExchangeRate,
            CreatedBy: null
          }
          HashStorage.setItem('taxObj', JSON.stringify(taxObj));
          this.BookingSurChargeDetail.push(taxObj);
          priceDetails = this._currencyControl.applyCurrencyRateOnBookingPriceDetails(priceDetails)
          delete copiedParsedResponse.WHJsonData;
          delete copiedParsedResponse.WHTimings;

          const BookingJsonDetail = WHJsonDataParsed
          const bookingDetails: WarehouseBookingDetails = {
            BookingID: -1,
            CurrencyCode: this._currencyControl.getCurrencyCode(),
            HashMoveBookingNum: null,
            HashMoveTmpBookingNum: null,
            HashMoveBookingDate: null,
            UserID: null,
            BookingSource: null,
            BookingOfficeName: null,
            BookingOfficeAddress: null,
            BookingOfficeContactNum: null,
            BookingOfficeCityID: null,
            BookingStatus: null,
            ContractNum: null,
            ShippingModeID: null,
            ShippingCatID: null,
            ShippingSubCatID: null,
            ProviderID: item.ProviderID,
            ProviderName: item.ProviderName,
            ProviderImage: item.ProviderImage,
            WHID: item.WHID,
            StoredFromUtc: this.searchCriteria.StoreFrom,
            StoredFromLcl: this.searchCriteria.StoreFrom,
            StoredUntilUtc: this.searchCriteria.StoreUntill,
            StoredUntilLcl: this.searchCriteria.StoreUntill,
            ReferenceType: null,
            ReferenceNum: null,
            ProviderRemarks: null,
            IsInsured: false,
            InsuredGoodsPrice: null,
            IsInsuranceProvider: item.IsInsuranceProvider,
            InsuredGoodsCurrencyID: item.CurrencyID,
            IsInsuredGoodsBrandNew: false,
            InsuredGoodsProviderID: item.ProviderID,
            InsuredStatus: 'Insured',
            InsuredGoodsBaseCurrencyID: item.BaseCurrencyID,
            InsuredGoodsBaseCurrPrice: null,
            InsuredGoodsActualPrice: null,
            InsuredGoodsExchangeRate: null,
            IDlist: item.IDList,
            CommodityType: 'FAK',
            DiscountedPrice: null,
            JsonSearchCriteria: JSON.stringify(this.searchCriteria),
            VASSummary: null,
            BookingJsonDetail: JSON.stringify(BookingJsonDetail),
            ActualScheduleDetail: JSON.stringify(copiedParsedResponse),
            ActualSchedulePriceDetail: warehouseContainedData[0].PriceDetailJsonData,
            BookingPriceDetail: priceDetails,
            BookingSurChargeDetail: this.BookingSurChargeDetail,
            BookingEnquiryDetail: null,
            BookingStatusDetail: null,
            Payment: null,
            CreatedBy: null
          };
          this._dataService.setBookingsData(bookingDetails);
          loading(false);
          this._router.navigate(['booking-process']);
        })

        let providerInfo = JSON.parse(this.actualScheduleResp[0].ProviderJsonData)
        let warehouseThankyouData: ViewBooking = {
          bookedFrom: this.searchCriteria.StoreFrom,
          bookedUntil: this.searchCriteria.StoreUntill,
          space: (item.AvailableSQFT) ? item.AvailableSQFT : item.WHAreaInSQFT,
          ProviderName: item.ProviderName,
          email: providerInfo.ProviderEmail,
          phone: providerInfo.ProviderPhone,
          ProviderImage: item.ProviderImage,
          IsBondedWarehouse: item.IsBondedWarehouse,
          IsTempratureControlled: item.IsTempratureControlled,
          IsTransportAvailable: item.IsTransportAvailable,
          WHParsedTiming: item.WHParsedTiming,
          WHParsedMedia: item.WHParsedMedia,
          WHAddress: item.WHAddress,
          WHAreaInSQFT: item.WHAreaInSQFT,
          WHName: item.WHName
        };
        HashStorage.setItem('warehouseSearch', JSON.stringify(warehouseThankyouData))
      } else {
      }
    }, (err: HttpErrorResponse) => {
    })
  }

  async bookNowAir(item) {
    loading(true)
    const { IDlist } = item
    HashStorage.setItem('selectedProvider', JSON.stringify(item))
    let stringedData = JSON.stringify(item);
    this.searchCriteria.carrierID = item.CarrierID;
    this.searchCriteria.routeIDs = item.ActualRouteIDs;
    this.searchCriteria.etaInDays = item.EtaInDays;
    this.searchCriteria.carrierEtdUtcDate = item.EtdUtc;
    this.searchCriteria.voyageRefNum = item.VoyageRefNum;
    this.searchCriteria.pickupFlexibleDays = 3;
    this.searchCriteria.recordCounter = 120;
    this.searchCriteria.portJsonData = (item.PortJsonData) ? item.PortJsonData : '[]'
    this.searchCriteria.IDlist = IDlist
    this.searchCriteria.ProviderID = item.ProviderID
    this.searchCriteria.termsCondition = this.termsAndCondit
    if (this.searchCriteria.deliveryPortType.toLowerCase() === 'ground') {
      this.searchCriteria.JsonDestinationPorts = JSON.stringify(item.JsonDestinationPorts.filter(e => e.isChecked))
    }
    if (this.searchCriteria.pickupPortType.toLowerCase() === 'ground') {
      this.searchCriteria.JsonOriginPorts = JSON.stringify(item.JsonOriginPorts.filter(e => e.isChecked))
    }
    const toSend = this.searchCriteria
    HashStorage.setItem('carrierSearchCriteria', JSON.stringify(toSend))
    HashStorage.setItem('selectedCarrier', stringedData);
    this.store.dispatch(
      new fromLclAir.FetchingLCLAirData(this.searchCriteria)
    );
    this._dataService.searchState.next('carrier')
    setTimeout(() => {
      if (this.type !== 'vendor') {
        this._router.navigate(["air/air-lines"]).then(() => {
          loading(false);
        });
      } else {
        // loading(false);
      }

    }, 100);
  }

  async bookNowCarriers(item) {
    loading(true)
    if (HashStorage) {
      HashStorage.setItem('selectedProvider', JSON.stringify(item))
      let jsonString = HashStorage.getItem("searchCriteria");
      this.searchCriteria = JSON.parse(jsonString);
      this.searchCriteria.ProviderID = item.ProviderID
      // Get Search Result
      if (
        this.searchCriteria !== null
      ) {
        this.searchCriteria.recordCounter = 400;
        this.searchCriteria.SearchCriteriaContainerDetail.forEach(elem => {
          elem.volumetricWeight = 0;
        });
        this.searchCriteria.termsCondition = this.termsAndCondit
        if (this.searchCriteria.deliveryPortType.toLowerCase() === 'ground') {
          this.searchCriteria.JsonDestinationPorts = JSON.stringify(item.JsonDestinationPorts.filter(e => e.isChecked))
        }
        if (this.searchCriteria.pickupPortType.toLowerCase() === 'ground') {
          this.searchCriteria.JsonOriginPorts = JSON.stringify(item.JsonOriginPorts.filter(e => e.isChecked))
        }
        HashStorage.setItem('carrierSearchCriteria', JSON.stringify(this.searchCriteria))
        this.store.dispatch(
          new fromFclShipping.FetchingFCLShippingData(this.searchCriteria)
        );
        // loading(false);
        this.$fclSearchResults.pipe(untilDestroyed(this)).subscribe(state => {
          const { loaded } = state;
          if (loaded) {
            setTimeout(() => {
              if (this.type !== 'vendor') {
                this._router.navigate(["fcl-search/shipping-lines"]).then(() => {
                  loading(false);
                });
              } else {
                this._dataService.searchState.next('carrier')
                this._dataService.closeBookingModal.next(true)
              }

            }, 100);
          }
        });
      } else {
        loading(false);
      }
    }
  }

  async bookNow(item: ProvidersSearchResult) {
    loading(true)
    let paramsObject: any[] = this.searchCriteria.SearchCriteriaContainerDetail
    if (!this.searchCriteria.SearchCriteriaContainerDetail[0].contRequestedQty) {
      let conDetails: any[] = this.searchCriteria.SearchCriteriaContainerDetail
      paramsObject = []
      conDetails.forEach(elem => {
        let temp = {
          contSpecID: elem.contSpecID,
          contRequestedCBM: elem.contRequestedCBM,
          contRequestedQty: elem.contRequestedQty,
          contRequestedWeight: elem.contRequestedWeight
        }
        paramsObject.push(temp)
      })
    } else {
      let conDetails: any[] = this.searchCriteria.SearchCriteriaContainerDetail
      paramsObject = []
      conDetails.forEach(elem => {
        let temp = {
          contSpecID: elem.contSpecID,
          contRequestedQty: elem.contRequestedQty,
          contRequestedCBM: elem.contRequestedCBM,
          contRequestedWeight: elem.contRequestedWeight
        }
        paramsObject.push(temp)
      })
    }
    const { imp_Exp, TransportMode, pickupPortType, deliveryPortType, containerLoad, CustomerID, CustomerType } = this.searchCriteria
    let portJsonData = '[]'
    if (item.PortJsonData) {
      portJsonData = item.PortJsonData
    }

    const params: any = {
      imp_Exp,
      pickupPortType,
      deliveryPortType,
      PortJsonData: (portJsonData) ? portJsonData : '[]',
      customerID: CustomerID,
      customerType: CustomerType,
      bookingReferenceIDs: item.IDlist,
      shippingMode: TransportMode,
      SearchCriteriaContainerDetail: paramsObject
    };

    const { bookingReferenceIDs } = params


    let movementType: string = ''
    if (this.searchCriteria.searchMode === 'truck-ftl') {
      movementType = 'Truck'
    } else {
      movementType = getMovementType(pickupPortType, deliveryPortType)
    }

    this._searchService.getActualScheduleDetailWithPrice(bookingReferenceIDs, movementType, containerLoad, TransportMode, CustomerID, CustomerType).subscribe((resp: JsonResponse) => {
      const { returnId, returnText } = resp
      if (returnId > 0) {
        this._dataService.searchState.next('carrier')
        this.getPriceBreakDown(item, params, returnText)
      } else {
      }
    }, (err: HttpErrorResponse) => {
    })

  }


  async getPriceBreakDown(item: any, params: PriceReqParams, actutalScheduleDtl: any) {
    try {
      let res: JsonResponse
      if (this.searchCriteria.searchMode.toLowerCase() === 'air-lcl') {
        res = await this._searchService.getPriceDetails(params).toPromise()
      } else if (this.searchCriteria.searchMode === 'truck-ftl') {
        res = await this._searchService.getTruckPriceDetails(params).toPromise()
      } else {
        res = await this._searchService.getLCLPriceDetails(params).toPromise()
      }

      if (res.returnId === 1 && JSON.parse(res.returnText).length > 0) {
        let priceDetaisl: PriceDetail[] = JSON.parse(res.returnText);

        priceDetaisl = this._currencyControl.applyCurrencyRateOnBookingPriceDetails(priceDetaisl)
        this._currencyControl.setExchangeRate(item.ExchangeRate)
        HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))

        let PolCountryName = item.PolCountryName;
        let PodCountryName = item.PodCountryName

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
          ProviderName: item.ProviderName,
          ContainerCount: this.generateContainersCount(),
          ContainerLoad: this.searchCriteria.containerLoad,
          VesselCode: item.VesselCode,
          VesselName: item.VesselName,
          EtdLcl: item.EtdLcl,
          VoyageRefNum: item.VoyageRefNum,
          CarrierName: item.CarrierName,
          TransitTime: item.EtaInDays,
          PortCutOffUtc: item.PortCutOffUtc,
          BookingTotalAmount: item.TotalPrice,
          CurrencyCode: item.CurrencyCode,
          DiscountPrice: item.DiscountPrice,
          DiscountPercent: 0,
          ProviderImage: item.ProviderImage,
          CarrierImage: item.CarrierImage,
          CarrierID: item.CarrierID,
          BookingContainerDetail: this.generateContainerDetails(),
          CurrencyID: item.CurrencyID,
          EtaLcl: item.EtaLcl,
          EtaUtc: item.EtaUtc,
          EtdUtc: item.EtdUtc,
          FreeTimeAtPort: item.FreeTimeAtPort,
          HashMoveBookingDate: null,
          HashMoveBookingNum: null,
          IsAnyRestriction: item.IsAnyRestriction,
          IsInsured: false,
          IsInsuranceProvider: item.IsInsuranceProvider,
          ProviderInsurancePercent: item.ProviderInsurancePercent,
          InsuredGoodsPrice: null,
          InsuredGoodsCurrencyID: item.CurrencyID,
          InsuredGoodsCurrencyCode: item.CurrencyCode,
          IsInsuredGoodsBrandNew: false,
          InsuredGoodsProviderID: item.ProviderID,
          InsuredStatus: 'Insured',
          PodCode: item.PodCode,
          PodModeOfTrans: item.PodModeOfTrans,
          PolCode: item.PolCode,
          PolModeOfTrans: item.PolModeOfTrans,
          PortCutOffLcl: item.PortCutOffLcl,
          BookingPriceDetail: priceDetaisl,
          ProviderID: item.ProviderID,
          BookingRouteDetail: null,
          BookingEnquiryDetail: null,
          ShippingCatName: this.searchCriteria.shippingCatID + '',
          ShippingModeCode: this.searchCriteria.SearchCriteriaTransportationDetail[0].modeOfTransportCode,
          ShippingModeName: this.searchCriteria.SearchCriteriaTransportationDetail[0].modeOfTransportDesc,
          ShippingSubCatName: this.searchCriteria.shippingSubCatID + '',
          PolID: item.PolID,
          PodID: item.PodID,
          ShippingCatID: this.searchCriteria.shippingCatID,
          ShippingModeID: this.searchCriteria.shippingModeID,
          ShippingSubCatID: this.searchCriteria.shippingSubCatID,
          IDlist: item.IDlist,
          IDListDetail: actutalScheduleDtl,
          EtaInDays: item.EtaInDays,
          InsuredGoodsBaseCurrencyID: item.BaseCurrencyID,
          InsuredGoodsBaseCurrencyCode: item.BaseCurrencyCode,
          InsuredGoodsExchangeRate: item.ExchangeRate,
          InsuredGoodsBaseCurrPrice: 0, //For Now
          InsuredGoodsActualPrice: 0, //For Now
          ExchangeRate: item.ExchangeRate,
          BaseCurrencyCode: item.BaseCurrencyCode,
          BaseCurrencyID: item.BaseCurrencyID,
          BaseCurrTotalAmount: item.BaseTotalPrice,
          FlightNo: item.FlightNo,
          AirCraftInfo: item.AirCraftInfo,
          PolCountry: PolCountryName,
          PodCountry: PodCountryName,
          TruckNumber: (item.TruckNumber) ? item.TruckNumber : null
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

  getShippingLines(item) {
    this.loading = true;
    this.shippingLines = []
    if (item.shippingLines) {
      this.shippingLines = item.shippingLines
      this.shippingLines.forEach(e => {
        e.MinTotalPrice = this._currencyControl.getNewPrice(e.BaseMinTotalPrice, this._currencyControl.getExchangeRate())
      })
      item.shippingLines = this.shippingLines
      this.loading = false;
    } else {
      this.searchCriteria.ProviderID = item.ProviderID
      this._searchService.getCarrierRouteInfo(this.searchCriteria).subscribe((res: JsonResponse) => {
        this.shippingLines = JSON.parse(res.returnText);
        const exchangeRate = cloneObject(this._currencyControl.getExchangeRate())
        this.shippingLines.forEach(e => {
          const newPrice: number = this._currencyControl.getNewPrice(e.BaseMinTotalPrice, exchangeRate)
          e.MinTotalPrice = newPrice
        })
        item.shippingLines = this.shippingLines
        this.loading = false;
      }, err => { })
    }
  }

  getTotalPages() {
    let temp: any = this.searchResult
    try {
      return Math.ceil(temp.length / this.itemsPerPage)
    }
    catch (err) {
      return 0
    }
  }

  onPageChange(number: any) {
    this.config.currentPage = number;
    let end = number * 5
    let start = end - 5
    let searchResult = this.searchResult.slice(start, end);
    this.customerProviders = searchResult.filter(e => e.IsCustomerRecommended)
  }

  shareShippingInfo($carrier, $provider, $unq, totalDays?) {

    const { searchCriteria } = this
    if (searchCriteria.searchMode === 'warehouse-lcl') {
      $provider.TotalDays = totalDays;
    }
    this._generalService.shareLclShippingAction($unq, searchCriteria, $provider)
  }

  toggleDetail() {
    this.toggleDiv = !this.toggleDiv;
  }

  getProviderImage($image: string) {
    const providerImage = getProviderImage($image)
    return getImagePath(ImageSource.FROM_SERVER, providerImage, ImageRequiredSize.original)
  }

  getCarrierImage($image: string) {
    if (isJSON($image)) {
      const providerImage = JSON.parse($image)
      return baseExternalAssets + '/' + providerImage[0].DocumentFile
    } else {
      return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
    }
  }

  setDay() {
    this.searchResult.forEach(element => {
      let arr = []
      let dayId = 1
      const timingsArray = JSON.parse(element.WHTimings)
      let idx = this.searchResult.indexOf(element);
      // timingsArray.forEach(doc => {
      //   doc.id = dayId;
      //   arr.push(doc)
      //   this.searchResult[idx].WHParsedTiming = arr;
      //   dayId++
      // })
    });
  }

  onTermsClick($item, $action) {
    const { searchMode } = this.searchCriteria
    if ($action === 'action') {
      switch (searchMode) {
        case 'air-lcl':
          this.bookNowAir($item)
          break;
        case 'sea-fcl':
          this._cookieService.deleteCookie('carrierList')
          this._cookieService.deleteCookie('withoutStop')
          this._cookieService.deleteCookie('oneStop')
          this._cookieService.deleteCookie('twoStops')
          this._cookieService.deleteCookie('twoPlusStops')
          this.bookNowCarriers($item)
          break;
        case 'sea-lcl':
          this.bookNow($item)
          break;
        case 'warehouse-lcl':
          this.bookNowWarehouse($item)
          break;
        case 'truck-ftl':
          this.bookNow($item)
          break;
      }
    } else {
      const { ProviderID } = $item
      HashStorage.setItem('partnerId', ProviderID)
      if ($item.termsAndCondition) {
        const { termsAndCondition } = $item
        this.openTermsDialog($item, termsAndCondition, searchMode, $action)
      } else {
        loading(true)
        this._searchService.getTermsCondition(ProviderID, searchMode).subscribe((res: JsonResponse) => {
          loading(false)
          const { returnObject, returnId } = res
          if (returnId > 0) {
            const { TermsCondition } = returnObject
            $item.termsCondition = TermsCondition
            this.termsAndCondit = TermsCondition
            this.openTermsDialog($item, TermsCondition, searchMode, $action)
          }
        }, (err: HttpErrorResponse) => { })
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
          case 'sea-lcl':
            this.bookNow($item)
            break;
          case 'warehouse-lcl':
            this.bookNowWarehouse($item)
            break;
          case 'truck-ftl':
            this.bookNow($item)
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

  openVideo(videoURL) {
    const modalRefVideo = this._modalService.open(VideoDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'video',
      backdrop: 'static',
      keyboard: false
    });
    modalRefVideo.componentInstance.videoURL = videoURL
  }

  cardMapCallBack($WHID) {
    this.mapCardEmitter.emit($WHID)
    if (this.scrollRef) {
      this.scrollRef.scrollYTo(0, 20);
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

  ngOnDestroy() {

  }
}

const data = [
  {
    srcUrl: '../../../../assets/images/video-warehouse.jpg',
    previewUrl: '../../../../assets/images/video-warehouse.jpg'
  },
  {
    srcUrl: 'https://preview.ibb.co/kPE1D6/clouds.jpg',
    previewUrl: 'https://preview.ibb.co/kPE1D6/clouds.jpg'
  },
  {
    srcUrl: 'https://preview.ibb.co/mwsA6R/img7.jpg',
    previewUrl: 'https://preview.ibb.co/mwsA6R/img7.jpg'
  },
  {
    srcUrl: 'https://preview.ibb.co/kZGsLm/img8.jpg',
    previewUrl: 'https://preview.ibb.co/kZGsLm/img8.jpg'
  }
];

