import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { CookieService } from '../../../services/cookies.injectable';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as fromWarehousing from './store'
import { loading, HashStorage, removeDuplicateCurrencies, compareValues } from '../../../constants/globalfunctions';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { DataService } from '../../../services/commonservice/data.service';
import { WarehouseSearchResult, WareDocumentData } from '../../../interfaces/warehouse.interface';
import { SelectedCurrency } from '../../../shared/currency-dropdown/currency-dropdown.component';
import { CurrencyDetails, ExchangeRate } from '../../../interfaces/currencyDetails';
import { DropDownService } from '../../../services/dropdownservice/dropdown.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Lightbox } from 'ngx-lightbox';
import { baseExternalAssets } from '../../../constants/base.url';
import { ToastrService } from 'ngx-toastr';
import { WarehouseEmitModel } from '../../../shared/map-utils/map.component';
import { CurrencyControl } from '../../../shared/currency/currency.injectable';
import { GeneralService } from '../../../shared/setup/general.injectable';
import { WarehouseSearchCriteria } from '../../../interfaces/warehousing';
import { currErrMsg } from '../../../shared/constants';
import { SearchResultService } from '../fcl-search/fcl-search.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WarehousingService } from '../../main/warehousing/warehousing.service';
import { ViewBookingDetails } from './../../../interfaces/view-booking.interface';
import { BookingSurChargeDetailWarehouse, WarehouseBookingDetails, ViewBooking } from './../../../interfaces/bookingDetails';
import { JsonResponse } from './../../../interfaces/JsonResponse';
import { TermsConditDialogComponent } from './../../../shared/dialogues/terms-condition/terms-condition.component';
import { VideoDialogComponent } from '../../../shared/dialogues/video-dialog/video-dialog.component';

@Component({
  selector: 'app-warehousing-search',
  templateUrl: './warehousing-search.component.html',
  styleUrls: ['./warehousing-search.component.scss']
})
export class WarehousingSearchComponent implements OnInit, OnDestroy {
  public $warehouseSearchResults: Observable<fromWarehousing.WarehousingState>
  public searchResult: WarehouseSearchResult[]
  public mainsearchResult: WarehouseSearchResult[]
  public currentSelectedCurrency: SelectedCurrency
  public currencyFlags: CurrencyDetails[];
  public mapView: boolean = false;
  public selectedSortType: string = 'Price'
  public selectedSortText: string = 'low to high'
  public searchCriteria: WarehouseSearchCriteria
  bestSelectedOption: any;

  public _albums: Array<WareDocumentData> = []
  public showResult: boolean = false
  private termsAndCondit: string = ''
  public BookingSurChargeDetail: BookingSurChargeDetailWarehouse[] = [];

  constructor(
    private renderer: Renderer2,
    private _store: Store<any>,
    private _cookieService: CookieService,
    private _router: Router,
    private _dataService: DataService,
    private _dropdownService: DropDownService,
    private _lightbox: Lightbox,
    private _toast: ToastrService,
    private _currencyControl: CurrencyControl,
    private _generalService: GeneralService,
    private _searchService: SearchResultService,
    private _modalService: NgbModal,
    private _warehousingService: WarehousingService,
  ) { }

  ngOnInit() {
    loading(false)
    this.renderer.addClass(document.body, 'bg-grey');
    this.renderer.removeClass(document.body, 'bg-white');
    this.renderer.removeClass(document.body, 'bg-lock-grey');
    this.searchCriteria = JSON.parse(localStorage.getItem('searchCriteria'))
    this.$warehouseSearchResults = this._store.select('warehousing_shippings')

    this.showResult = false
    this._dataService.setmapWarehouseId(-1)
    // loading(true)

    this.$warehouseSearchResults.pipe(untilDestroyed(this)).subscribe(state => {
      const { data, loaded, loadFromApi, isSearchUpdate, isMainResultModified, isViewResultModified } = state
      loading(false)
      this.currenyFlags(false)
      if (data && loaded && loadFromApi) {
        const { response } = data
        this.setWarehouseData(response)
        loading(false)
      }

      if (isSearchUpdate && isViewResultModified && !isMainResultModified) {
        const { searchResult, mainsearchResult } = data
        this.searchResult = searchResult
        this.mainsearchResult = mainsearchResult
        this.sorter("TotalPrice", "asc", null, null)
        setTimeout(() => {
          this._dataService.obsWarehouseMap.next(true)
        }, 10);
        loading(false)
      }

      if (isSearchUpdate && isMainResultModified && !isViewResultModified) {
        const { mainsearchResult, searchResult } = data
        this.mainsearchResult = mainsearchResult
        this.searchResult = searchResult
        loading(false)
      }

      if (state === fromWarehousing.getWarehousingInitalState()) {
        if (this.searchCriteria) {
          if (this._router.url.includes('warehousing')) {
            this._store.dispatch(new fromWarehousing.FetchingWarehousingData(this.searchCriteria))
          }
        }
        return;
      }

      if (data && data.mainsearchResult && data.mainsearchResult.length > 0) {
        this.showResult = true
      }
      if (data && data.mainsearchResult && data.mainsearchResult.length === 0) {
        this.showResult = false
        setTimeout(() => {
          loading(false)
        }, 0);
      }

    })

    this._dataService.reloadSearchCurreny.subscribe(res => {
      if (res) {
        if (this.searchResult && this.searchResult.length) {
          if (this.currencyFlags && this.currencyFlags.length) {
            this.selectedCurrency(true)
          } else {
            this.currenyFlags(true)
          }
        }
      }
    });
  }

  openVideo(videoURL: string) {
    const modalRefVideo = this._modalService.open(VideoDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'video',
      backdrop: 'static',
      keyboard: false
    });
    modalRefVideo.componentInstance.videoURL = videoURL
  }
  async setWarehouseData(res) {
    let searchResp: any = res[0];
    if (searchResp.returnId === 1 && searchResp.returnObject && searchResp.returnObject.length > 0) {
      this._dataService.searchResultFiltered = searchResp.returnObject;
      this.searchResult = searchResp.returnObject
      this.mainsearchResult = this.searchResult
      this._dataService.searchResultFiltered.sort((a: any, b: any) => {
        var comparison;
        if (a.IsRecommended > b.IsRecommended) {
          comparison = -1;
        } else if (b.IsRecommended > a.IsRecommended) {
          comparison = 1;
        }
        return comparison;
      })

      let exchangeResp: any = res[1]
      this._currencyControl.setExchangeRateList(exchangeResp.returnObject)
      this._cookieService.deleteCookies()
      this.currenyFlags(true);
      this.sorter("TotalPrice", "asc", null, null)
      // HashStorage.setItem('searchResult', JSON.stringify(this._dataService.searchResultFiltered));
    }
  }

  selectedCurrency($shouldSetRates: boolean) {
    let currencyId = this._currencyControl.getCurrencyID()
    let seletedCurrency: CurrencyDetails

    if (this._currencyControl.getToCountryID() && this._currencyControl.getToCountryID() > 0) {
      seletedCurrency = this.currencyFlags.filter(obj =>
        (obj.id == currencyId && JSON.parse(obj.desc).CountryID === this._currencyControl.getToCountryID())
      )[0];
    } else {
      seletedCurrency = this.currencyFlags.filter(obj =>
        (obj.id == currencyId)
      )[0];
    }
    let newSelectedCurrency: SelectedCurrency = {
      sortedCountryFlag: seletedCurrency.imageName.toLowerCase(),
      sortedCountryName: seletedCurrency.shortName,
      sortedCurrencyID: seletedCurrency.id,
      sortedCountryId: JSON.parse(seletedCurrency.desc).CountryID
    }

    this.currentSelectedCurrency = newSelectedCurrency

    this._dataService.forwardCurrencyCode.next(this.currentSelectedCurrency.sortedCountryName)

    this._currencyControl.setCurrencyID(this.currentSelectedCurrency.sortedCurrencyID)
    this._currencyControl.setCurrencyCode(this.currentSelectedCurrency.sortedCountryName)

    HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
    if ($shouldSetRates) {
      this.setProviderRates(this._currencyControl.getBaseCurrencyID(), true)
    }
  }

  currencyFilter($currency: SelectedCurrency) {
    // loading(true);

    this.currentSelectedCurrency = $currency

    this._currencyControl.setCurrencyID($currency.sortedCurrencyID)
    this._currencyControl.setCurrencyCode($currency.sortedCountryName)
    this._currencyControl.setToCountryID($currency.sortedCountryId)

    this._dataService.forwardCurrencyCode.next($currency.sortedCountryName)

    HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
    this.setProviderRates(this._currencyControl.getBaseCurrencyID(), true)
  }

  currenyFlags($shouldSetRates: boolean) {
    const { currencyFlags } = this
    if (!currencyFlags || currencyFlags.length === 0) {
      // this._dropdownService.getCurrency().subscribe((res: any) => {
      //   let newCurrencyList = removeDuplicateCurrencies(res)
      //   newCurrencyList.sort(compareValues('title', "asc"));
      //   this.currencyFlags = newCurrencyList
      //   this.selectedCurrency($shouldSetRates)
      // })
      this.currencyFlags = JSON.parse(HashStorage.getItem('currencyList'))
      this.selectedCurrency($shouldSetRates);
    } else {
      this.selectedCurrency($shouldSetRates)
    }
  }

  setProviderRates(baseCurrencyID: number, $shouldDispatch: boolean) {
    const { searchResult, mainsearchResult } = this
    this._dropdownService.getExchangeRateList(baseCurrencyID).subscribe((res: any) => {
      let exchangeRate: ExchangeRate = res.returnObject
      this._currencyControl.setExchangeRateList(exchangeRate)
      let searchResultData: any = searchResult
      let mainSearchResult: any = mainsearchResult
      try {
        this.x++
        searchResultData = this._currencyControl.applyCurrencyRateOnSearchResult(this._currencyControl.getCurrencyID(), exchangeRate, null, searchResultData)
        this.searchResult = searchResultData
        mainSearchResult = this._currencyControl.applyCurrencyRateOnSearchResult(this._currencyControl.getCurrencyID(), exchangeRate, null, mainSearchResult)
        this._store.dispatch(new fromWarehousing.UpdateWarehousingViewSearchResult(searchResultData))
        this._store.dispatch(new fromWarehousing.UpdateWarehousingMainSearchResult(mainSearchResult))
        loading(false);

      } catch (err) {
        loading(false);
        const { title, text } = currErrMsg
        this._toast.error(text, title)
      }
    }, (error: HttpErrorResponse) => {
      this._toast.error(error.message, 'Failed')
    })
  }
  x = 0

  sorter(sortBy: string, sortOrder: string, event, type) {
    // loading(true);

    this.selectedSortType = type;
    this.bestSelectedOption = null
    if (sortOrder === 'desc')
      this.selectedSortText = 'high to low'
    else if (sortOrder === 'asc')
      this.selectedSortText = 'low to high'
    let recommendedArr = this.searchResult.filter((element) => element.IsRecommended);

    let notRecommended = this.searchResult.filter((element) => !element.IsRecommended);
    recommendedArr = recommendedArr.sort(compareValues('TotalPrice', sortOrder));
    if (recommendedArr && recommendedArr.length > 0) {
      recommendedArr.sort(
        compareValues("TotalPrice", "asc")
      );
    }
    recommendedArr.sort((a: any, b: any) => {
      var comparison;
      if (a.DealDet > b.DealDet) {
        comparison = -1;
      } else if (b.DealDet > a.DealDet) {
        comparison = 1;
      }
      return comparison;
    })
    notRecommended = notRecommended.sort(compareValues('TotalPrice', sortOrder));

    this.searchResult = recommendedArr.concat(notRecommended);
    if (event) {
      let count = event.currentTarget.parentElement.parentElement.parentElement.children;
      for (let i = 0; i < count.length; i++) {
        for (let j = 1; j < count[i].children.length; j++) {
          if (count[i].children[j].children[0].classList.length) {
            count[i].children[j].children[0].classList.remove('active');
            count[i].classList.remove('active');
          }
        }
        event.currentTarget.parentElement.parentElement.classList.add('active');
        event.currentTarget.classList.add('active');
      }
    }
    loading(false);
  }

  mapViewChange(event) {
    this.mapView = event;
  }
  onWarehouseClick($emitEvent: WarehouseEmitModel) {
    if ($emitEvent.type === 'share') {
      const searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))
      this._generalService.shareLclShippingAction(null, searchCriteria, $emitEvent.searchResult)
    }
    if ($emitEvent.type === 'proceed') {
      this.onTermsClick($emitEvent.searchResult, 'action')
    }
    if ($emitEvent.type === 'gallery') {
      this.onGalleryClick($emitEvent.searchResult)
    }
    if ($emitEvent.type === 'video') {
      const parsedArray: Array<WareDocumentData> = JSON.parse($emitEvent.searchResult.WHMedia)
      const videoData: WareDocumentData = parsedArray.filter(doc => doc.DocumentUploadedFileType.toLowerCase() === 'mp4')[0]
      const videoURL = baseExternalAssets + '/' + videoData.DocumentFile
      this.openVideo(videoURL)
    }
  }

  onGalleryClick($searchCard: WarehouseSearchResult) {
    try {
      const parsedArray: Array<WareDocumentData> = JSON.parse($searchCard.WHMedia)
      const docsArray: Array<WareDocumentData> = parsedArray.filter(doc => doc.DocumentUploadedFileType.toLowerCase() !== 'mp4')
      const albumArr = []

      docsArray.forEach(doc => {
        const album = {
          src: baseExternalAssets + '/' + doc.DocumentFile,
          caption: '&nbsp;',
          thumb: baseExternalAssets + '/' + doc.DocumentFile
        };
        albumArr.push(album)
      })
      this.open(albumArr)

    } catch (error) {
    }
  }

  open(_albums: any): void {
    // open lightbox
    this._lightbox.open(_albums);
  }

  mapActionReciever($WHID) {
    this.mapView = true
    this._dataService.setmapWarehouseId($WHID)
  }

  onTermsClick($item, $action) {
    // const { searchMode } = this.searchCriteria
    this.bookNowWarehouse($item)
    // const { ProviderID } = $item
    // if ($item.termsAndCondition) {
    //   const { termsAndCondition } = $item
    //   this.openTermsDialog($item, termsAndCondition, searchMode, $action)
    // } else {
    //   this._searchService.getTermsCondition(ProviderID, searchMode).subscribe((res: JsonResponse) => {
    //     const { returnObject, returnId } = res
    //     if (returnId > 0) {
    //       const { TermsCondition } = returnObject
    //       $item.termsCondition = TermsCondition
    //       this.termsAndCondit = TermsCondition
    //       this.openTermsDialog($item, TermsCondition, searchMode, $action)
    //     }
    //   }, (err: HttpErrorResponse) => { })
    // }
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
        this.bookNowWarehouse($item)
      }
    })
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }

  async bookNowWarehouse(item: any) {
    const { CustomerID, CustomerType } = this.searchCriteria
    this._searchService.getActualScheduleDetailWithPrice(item.IDList, 'warehouse', 'abc', 'abc', CustomerID, CustomerType).subscribe((resp: JsonResponse) => {
      const { returnId, returnText } = resp
      const actualScheduleResp = JSON.parse(returnText);
      if (returnId > 0) {
        this.searchCriteria.IDList = item.IDList
        this.searchCriteria.SelProvID = item.ProviderID
        this.searchCriteria.SelWHID = item.WHID
        HashStorage.setItem('searchCriteria', JSON.stringify(this.searchCriteria))
        this._warehousingService.getWarehousePriceDetails(this.searchCriteria).subscribe((res) => {
          const warehosueResp: JsonResponse = res;
          let priceDetails: any[] = JSON.parse(warehosueResp.returnText);

          this._currencyControl.setExchangeRate(item.ExchangeRate)
          HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
          let response = JSON.parse(warehosueResp.returnText);
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

        let providerInfo = JSON.parse(actualScheduleResp[0].ProviderJsonData)

        let warehouseThankyouData: ViewBooking = {
          bookedFrom: this.searchCriteria.StoreFrom,
          bookedUntil: this.searchCriteria.StoreUntill,
          space: providerInfo.AvailableSQFT,
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

  ngOnDestroy() {

  }

}
