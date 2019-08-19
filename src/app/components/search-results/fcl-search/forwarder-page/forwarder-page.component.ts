import { Component, OnInit, OnDestroy } from '@angular/core';
import { compareValues, HashStorage, Tea, getDefaultCountryCode, loading, removeDuplicateCurrencies, cloneObject, getMovementType, getImagePath, ImageSource, ImageRequiredSize, getProviderImage } from '../../../../constants/globalfunctions';
import { ContainerDetail, BookingDetails, PriceDetail } from '../../../../interfaces/bookingDetails';
import { SearchCriteria } from '../../../../interfaces/searchCriteria';
import { SearchResult, ProvidersSearchResult } from '../../../../interfaces/searchResult';
import { SearchResultService } from '../fcl-search.service';
import { Router } from '@angular/router';
import { DataService } from '../../../../services/commonservice/data.service';
import { PaginationInstance } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { DropDownService } from '../../../../services/dropdownservice/dropdown.service';
import { ShareshippingComponent } from '../../../../shared/dialogues/shareshipping/shareshipping.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExchangeRate, CurrencyDetails, MasterCurrency } from '../../../../interfaces/currencyDetails';
import { CookieService } from '../../../../services/cookies.injectable';
import { SelectedCurrency } from '../../../../shared/currency-dropdown/currency-dropdown.component';
import { firstBy } from 'thenby';
import { Store } from '@ngrx/store';
import * as fromFclShipping from '../store'
import { Observable } from 'rxjs';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { JsonResponse } from '../../../../interfaces/JsonResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyControl } from '../../../../shared/currency/currency.injectable';
import { VendorProfileService } from '../../../vendor-profile/vendor-profile.service';
import { baseExternalAssets, baseApi } from '../../../../constants/base.url';
import * as moment from 'moment'

@Component({
  selector: 'app-forwarder-page',
  templateUrl: './forwarder-page.component.html',
  styleUrls: ['./forwarder-page.component.scss'],
})

export class ForwarderPageComponent implements OnInit, OnDestroy {

  public selectedSortType: string = 'Price'
  public selectedSortText: string = 'low to high'

  public selectedCarrier: SearchResult;
  public page: number = 1;
  public dealCount;
  public currencyFlags: CurrencyDetails[];
  public currentSelectedCurrency: SelectedCurrency
  public mainProvidersData: ProvidersSearchResult[] = [];
  public recordCount: number;

  public pageSize: number = 10;
  public totalElements: number;
  public recommendedDeals: any = [];
  public topRecommendedDeals: any = [];
  public nonRecommendedDeals: any = [];
  public providersData: ProvidersSearchResult[];
  public sortedProvidersData: ProvidersSearchResult[];

  private currentPage: number = 1;
  private totalPages: number = 0;

  itemsPerPage: number = 10;
  totalItems: number;
  previousPage: number;

  // Pagination variables decleration start
  public maxSize: number = 7;
  public directionLinks: boolean = true;
  public autoHide: boolean = false;
  public config: PaginationInstance = {
    id: 'advanced2',
    itemsPerPage: 10,
    currentPage: 1
  };

  public labels: any = {
    previousLabel: '',
    nextLabel: '',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };
  //Pagination End

  public searchCriteria: SearchCriteria;
  public $fclProviderResults: Observable<fromFclShipping.FclForwarderState>
  fastestRouteDays: string;
  public searchResultSummary: any = [];
  bestRouteDays: string;
  userID: any;
  public haveRecProviders: boolean = false





  constructor(
    private _modalService: NgbModal,
    private _dataService: DataService,
    private _searchService: SearchResultService,
    private _dropdownService: DropDownService,
    private _router: Router,
    private _toast: ToastrService,
    private _cookieService: CookieService,
    private store: Store<any>,
    private _currencyControl: CurrencyControl
  ) { }

  //

  ngOnInit() {
    this.selectedCarrier = JSON.parse(HashStorage.getItem('selectedCarrier'))
    this.$fclProviderResults = this.store.select('fcl_forwarder')
    this.getSearchCriteria();
    this.currenyFlags(false);
    // const uiLoader = loading
    // loading(true)

    this.$fclProviderResults.pipe(untilDestroyed(this)).subscribe(state => {
      const { data, loaded, loadFromApi, isSearchUpdate, isViewResultModified, isMainResultModified, hassError } = state

      if (data && loaded && loadFromApi) {
        loading(false)
        const { mainProvidersList } = data
        this.mainProvidersData = mainProvidersList
        this.currenyFlags(true);
        this.setProvidersData(data.response)
        return
      }


      if (isSearchUpdate && isViewResultModified) {
        loading(false)
        const { providersList, mainProvidersList } = data
        this.mainProvidersData = mainProvidersList
        this.onSearchResultUpdate(providersList)
      }

      if (isSearchUpdate && isMainResultModified && !isViewResultModified) {
        loading(false)
        const { mainProvidersList } = data
        this.mainProvidersData = mainProvidersList
      }

      if (data && data.providersList && data.mainProvidersList) {
        const { providersList, mainProvidersList } = data
        if (providersList.length > 0) {
          if (this._currencyControl.getCurrencyID() !== providersList[0].CurrencyID) {
            this.setRates(mainProvidersList)
          }
        }
      }
      if (hassError) {
        loading(false)
      }
    })

    this._dataService.reloadSearchCurreny.pipe(untilDestroyed(this)).subscribe(res => {
      if (res) {
        if (this.currencyFlags) {
          this.selectedCurrency(true)
        } else {
          this.currenyFlags(true)
        }
      }
    })
  }

  onSearchResultUpdate(data) {
    loading(false);
    this.providersData = data;
    // this.topRecommendedDeals = this.providersData.filter((element) => element.IsRecommended);
    this.recommendedDeals = this.providersData.filter((element) => element.IsRecommended);
    this.nonRecommendedDeals = this.providersData.filter((element) => !element.IsRecommended);

    let deal = this.providersData.filter((x) => x.DiscountPrice > 0);

    this.dealCount = deal.length;
    this.recordCount = this.providersData.length;
    // this.sortedProvidersData = this.recommendedDeals.concat(this.nonRecommendedDeals)
    // this.sortedProvidersData = this.providersData
    // this.providersData = this.recommendedDeals.concat(this.nonRecommendedDeals);
    this.config.currentPage = 1;
    this.sorter('MinTotalPrice', 'asc', null, 'Price')
    // this.setSummary();

  }

  async setProvidersData(data) {

    const providerResponse: any = data[0];
    if (providerResponse.returnId > 0) {
      let providersSearchResult = JSON.parse(providerResponse.returnText);

      loading(false);
      const exchangeResp: any = data[1];
      this._currencyControl.setExchangeRateList(exchangeResp.returnObject);
      this.setRates(providersSearchResult)

    } else {
      loading(false);
      this._toast.error(providerResponse.returnText, 'Failed');
    }
  }

  setRates(providersSearchResult) {
    let providersSearchData: any = providersSearchResult
    providersSearchData = this._currencyControl.applyCurrencyRateOnSearchResult(this._currencyControl.getCurrencyID(), cloneObject(this._currencyControl.getExchangeRateList()), null, providersSearchData)
    // this.store.dispatch(new fromFclShipping.UpdateFCLForwarderSearchData(providersSearchData))
  }

  getSearchCriteria() {
    if (HashStorage) {
      const jsonString = HashStorage.getItem('searchCriteria');
      this.searchCriteria = JSON.parse(jsonString);
    }
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

  sorter(sortBy: string, sortOrder: string, event, type) {
    const { providersData } = this

    loading(true);
    this.selectedSortType = type;
    if (sortOrder === 'desc')
      this.selectedSortText = 'high to low'
    else if (sortOrder === 'asc')
      this.selectedSortText = 'low to high'

    // this.topRecommendedDeals = providersData.filter((element) => element.IsRecommended);

    //New Atco work:
    let recProviders = providersData.filter(provider => provider.IsCustomerRecommended === true)
    let nonrecProviders = providersData.filter(provider => !provider.IsCustomerRecommended)

    recProviders = recProviders.sort(
      firstBy(function (v1, v2) { return v1.MinTotalPrice - v2.MinTotalPrice; })
        .thenBy("ProviderName")
    );

    nonrecProviders = nonrecProviders.sort(
      firstBy(function (v1, v2) { return v1.MinTotalPrice - v2.MinTotalPrice; })
        .thenBy("ProviderName")
    );
    this.haveRecProviders = (recProviders && recProviders.length > 0) ? true : false;
    this.sortedProvidersData = recProviders.concat(nonrecProviders)

    loading(false);
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
  }
  selectedCurrency($shouldSetRates: boolean) {
    //  loading(true);
    let currencyId = this._currencyControl.getCurrencyID()
    let seletedCurrency: CurrencyDetails

    if (this._currencyControl.getToCountryID() && this._currencyControl.getToCountryID() > 0) {
      seletedCurrency = this.currencyFlags.find(obj =>
        (obj.id == currencyId && JSON.parse(obj.desc).CountryID === this._currencyControl.getToCountryID())
      );
    } else {
      seletedCurrency = this.currencyFlags.find(obj =>
        (obj.id == currencyId)
      );
    }
    if (seletedCurrency) {
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
    }

    HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
    if ($shouldSetRates) {
      this.setProviderRates(this._currencyControl.getBaseCurrencyID())
    }
  }

  setProviderRates(baseCurrencyID: number) {
    this._dropdownService.getExchangeRateList(baseCurrencyID).subscribe((res: any) => {

      let exchangeRate: ExchangeRate = res.returnObject
      this._currencyControl.setExchangeRateList(exchangeRate)

      let providerSearchResultData: any = this.providersData
      providerSearchResultData = this._currencyControl.applyCurrencyRateOnSearchResult(this._currencyControl.getCurrencyID(), exchangeRate, null, providerSearchResultData)

      let mainProvidersData: any = this.mainProvidersData
      mainProvidersData = this._currencyControl.applyCurrencyRateOnSearchResult(this._currencyControl.getCurrencyID(), exchangeRate, null, mainProvidersData)
      this.store.dispatch(new fromFclShipping.UpdateFCLForwarderViewSearchResult(providerSearchResultData))
      this.store.dispatch(new fromFclShipping.UpdateFCLForwarderMainSearchResult(mainProvidersData))
    })
  }

  currencyFilter($currency: SelectedCurrency) {
    // loading(true)

    this.currentSelectedCurrency = $currency

    this._dataService.forwardCurrencyCode.next($currency.sortedCountryName)

    this._currencyControl.setCurrencyID($currency.sortedCurrencyID)
    this._currencyControl.setCurrencyCode($currency.sortedCountryName)
    this._currencyControl.setToCountryID($currency.sortedCountryId)

    HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
    this.setProviderRates(this._currencyControl.getBaseCurrencyID())
  }

  gotoSearchResults() {
    this._router.navigate(['/fcl-search/shipping-lines']);
  }

  priceBreakDown(data: ProvidersSearchResult) {
    if (HashStorage) {
      loading(true);
      const loginObj = JSON.parse(Tea.getItem('loginUser'));
      if (loginObj && !loginObj.IsLogedOut) {
        this.userID = loginObj.UserID;
      } else {
        this.userID = null;
      }
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
        SearchCriteriaContainerDetail: paramsObject,
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
    }
  }

  shareShippingInfo(Carrier, Provider) {
    const modalRef = this._modalService.open(ShareshippingComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.shareObjectInfo = {
      carrier: Carrier,
      provider: Provider
    }
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }

  getPriceBreakDown(params, data: ProvidersSearchResult, actutalScheduleDtl: string) {
    if (HashStorage) {
      this._searchService.getPriceDetails(params).subscribe((res: any) => {
        if (res.returnId === 1 && JSON.parse(res.returnText).length > 0) {
          let priceDetaisl: PriceDetail[] = JSON.parse(res.returnText);
          // const readArray: PriceDetail[] = priceDetaisl.filter((e) => e.TransMode === 'Read');
          // const writeArray: PriceDetail[] = priceDetaisl.filter((e) => e.TransMode === 'Write');
          priceDetaisl = this._currencyControl.applyCurrencyRateOnBookingPriceDetails(priceDetaisl)
          this._currencyControl.setExchangeRate(data.ExchangeRate)
          HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))

          const { PolCountryName, PodCountryName } = this.selectedCarrier
          const bookingDetails = {
            BookingID: -1,
            PolName: this.searchCriteria.pickupPortName,
            PodName: this.searchCriteria.deliveryPortName,
            ProviderName: data.ProviderName,
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
            ProviderImage: data.ProviderImage,
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
            IsInsuranceProvider: data.IsInsuranceProvider,
            ProviderInsurancePercent: data.ProviderInsurancePercent,
            InsuredGoodsPrice: null,
            InsuredGoodsCurrencyID: data.CurrencyID,
            InsuredGoodsCurrencyCode: data.CurrencyCode,
            IsInsuredGoodsBrandNew: false,
            InsuredGoodsProviderID: data.ProviderID,
            InsuredStatus: 'Insured',
            PodCode: data.PodCode,
            PodModeOfTrans: data.PodModeOfTrans,
            PolCode: data.PolCode,
            PolModeOfTrans: data.PolModeOfTrans,
            PortCutOffLcl: data.PortCutOffLcl,
            BookingPriceDetail: priceDetaisl,
            ProviderID: data.ProviderID,
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
          };
          // HashStorage.setItem('bookingInfo', JSON.stringify(bookingDetails))
          this._dataService.setBookingsData(bookingDetails)
          this._cookieService.deleteCookies();
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

  generateContainersCount() {
    let total = [];
    this.searchCriteria.SearchCriteriaContainerDetail.forEach(element => {
      total.push(element.contRequestedQty);
    });
    total = total.reduce((all, item) => {
      return all + item;
    });
    return total;
  }

  getPageSize(): number {
    return this.nonRecommendedDeals.length
  }

  getTotalPages() {
    return Math.ceil(this.nonRecommendedDeals.length / this.itemsPerPage)
  }

  onPageChange(number: any) {
    this.config.currentPage = number;
  }

  getUIImage($image: string, isProvider: boolean) {
    if (isProvider) {
      const providerImage = getProviderImage($image)
      return getImagePath(ImageSource.FROM_SERVER, providerImage, ImageRequiredSize.original)
    } else {
      return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
    }
  }

  public bestSelectedOption: string = null
  quickSort(sortBy: string) {
    loading(true);
    if (sortBy.toLowerCase() === 'MinTotalPrice'.toLowerCase()) {

      if (this.bestSelectedOption && this.bestSelectedOption.toLowerCase() === 'price') {
        loading(false);
        return
      }

      this.bestSelectedOption = 'price'
      this.providersData = this.providersData.sort(compareValues(sortBy, 'asc'));

      let minPrice: ProvidersSearchResult = this.providersData.reduce((prev, curr) => {
        return prev.MinTotalPrice < curr.MinTotalPrice ? prev : curr;
      });

      let bestPrice: ProvidersSearchResult[] = this.providersData.filter(elem => elem.MinTotalPrice === minPrice.MinTotalPrice)
      bestPrice = bestPrice.sort(compareValues('EtaInDays', 'asc'));
      bestPrice = bestPrice.sort(compareValues('CarrierName', 'asc'));

      let OtherPrices: ProvidersSearchResult[] = this.providersData.filter(elem => elem.MinTotalPrice !== minPrice.MinTotalPrice)
      this.providersData = bestPrice.concat(OtherPrices)

    } else {

      if (this.bestSelectedOption && this.bestSelectedOption.toLowerCase() === 'days') {
        loading(false);
        return
      }

      this.bestSelectedOption = 'days'
      this.providersData = this.providersData.sort(compareValues(sortBy, 'asc'));

      let minEta: ProvidersSearchResult = this.providersData.reduce((prev, curr) => {
        return prev.EtaInDays < curr.EtaInDays ? prev : curr;
      });

      let bestEtaS: ProvidersSearchResult[] = this.providersData.filter(elem => elem.EtaInDays === minEta.EtaInDays)
      bestEtaS = bestEtaS.sort(compareValues('CarrierName', 'asc'));
      bestEtaS = bestEtaS.sort(compareValues('MinTotalPrice', 'asc'));
      // bestEtaS = bestEtaS.sort(compareValues('CarrierName', 'asc'));

      let OtherEtaS: ProvidersSearchResult[] = this.providersData.filter(elem => elem.EtaInDays !== minEta.EtaInDays)
      this.providersData = bestEtaS.concat(OtherEtaS)
    }
    // this.resetHide()
    loading(false);
  }

  setSummary() {
    if (this.providersData.length > 0) {
      // Getting Minimum Days with minimum price for best route card on ui (Alpha/Start)
      var x = this.providersData.sort(compareValues('EtaInDays', "asc"))[0];
      let bestEtaS: ProvidersSearchResult[] = this.providersData.filter(elem => elem.EtaInDays === x.EtaInDays)
      bestEtaS = bestEtaS.sort(compareValues('MinTotalPrice', 'asc'));
      this.searchResultSummary.fastestRouteCurrency = x.CurrencyCode;
      this.searchResultSummary.fastestRoutePrice = this._currencyControl.applyRoundByDecimal(bestEtaS[0].MinTotalPrice, this._currencyControl.getGlobalDecimal());
      this.searchResultSummary.fastestRouteDays = x.EtaInDays;
      //this.fastestRoute = x.EtaInDays;
      if (x.EtaInDays > 1) {
        this.fastestRouteDays = x.EtaInDays.toString() + " Days";
        //this.fastestRoute = x.EtaInDays;
      }
      else {
        this.fastestRouteDays = x.EtaInDays.toString() + " Day";
        //this.fastestRoute = x.EtaInDays;
      }
      //(Alpha/End)

      // Getting Minimum price with minimum days for best price card on ui (Beta/Start)
      x = this.providersData.sort(compareValues('MinTotalPrice', "asc"))[0];

      let bestPrice: ProvidersSearchResult[] = this.providersData.filter(elem => elem.MinTotalPrice === x.MinTotalPrice)
      bestPrice = bestPrice.sort(compareValues('EtaInDays', 'asc'));

      this.searchResultSummary.bestRouteCurrency = x.CurrencyCode;
      this.searchResultSummary.bestRoutePrice = this._currencyControl.applyRoundByDecimal(x.MinTotalPrice, this._currencyControl.getGlobalDecimal());
      this.searchResultSummary.bestRouteDays = bestPrice[0].EtaInDays;

      if (bestPrice[0].EtaInDays > 1) {
        this.bestRouteDays = bestPrice[0].EtaInDays.toString() + " Days";
      }
      else {
        this.bestRouteDays = bestPrice[0].EtaInDays.toString() + " Day";
      }
      // (Beta/End)
    }
    else {
      this.searchResultSummary.fastestRoutePrice = 0;
      this.searchResultSummary.fastestRouteDays = 0;
      this.searchResultSummary.fastestRouteCurrency = this._currencyControl.getCurrencyCode();
      this.searchResultSummary.bestRoutePrice = 0;
      this.searchResultSummary.bestRouteDays = 0;
      this.searchResultSummary.bestRouteCurrency = this._currencyControl.getCurrencyCode();
    }

  }

  Download() {

    const toSend = {
      searchres: this.providersData,
      searchCriteria: this.searchCriteria,
      baseURL: baseExternalAssets
    }
    var request = new XMLHttpRequest();
    request.open('POST', baseApi + "ShareSearchResult/ShareSearchResultStep1", true);
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    request.responseType = 'blob';
    request.send(JSON.stringify(toSend));
    loading(true)

    request.onload = () => {
      loading(false)
      // Only handle status code 200
      if (request.status === 200) {
        // Try to find out the filename from the content disposition `filename` value
        try {
          const disposition = request.getResponseHeader('content-disposition');
          const matches = /"([^"]*)"/.exec(disposition);
          const newStamp = new Date().valueOf()
          const filename = (matches != null && matches[1] ? matches[1] : newStamp + '.pdf');
          // The actual download
          const blob = new Blob([request.response], { type: 'application/pdf' });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) { }
      } else {
        this._toast.error('Error While fetching data')
      }
      // some error handling should be done here...
    };
  }
  ngOnDestroy() { }
}

