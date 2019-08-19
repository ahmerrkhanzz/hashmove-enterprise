import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { ShareshippingComponent } from '../../../../shared/dialogues/shareshipping/shareshipping.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../../../services/commonservice/data.service';
import { SearchCriteria } from '../../../../interfaces/searchCriteria';
import { SearchResult, RouteMap, ProvidersSearchResult, HashmoveLocation } from '../../../../interfaces/searchResult';
import { compareValues, HashStorage, Tea, cloneObject, loading, removeDuplicateCurrencies, doubleSorter, getDuplicateValues, getGreyIcon, getAnimatedGreyIcon, getImagePath, ImageSource, ImageRequiredSize } from '../../../../constants/globalfunctions';
import { SearchResultService } from '../fcl-search.service';
import { Observable } from 'rxjs/Observable';
import { PaginationInstance } from 'ngx-pagination';
import { Router } from '@angular/router';
import { DropDownService } from '../../../../services/dropdownservice/dropdown.service';
import { ToastrService } from 'ngx-toastr';
import { CurrencyDetails, ExchangeRate } from '../../../../interfaces/currencyDetails';
import { HttpErrorResponse } from '@angular/common/http';
import { CookieService } from '../../../../services/cookies.injectable';
import { SelectedCurrency } from '../../../../shared/currency-dropdown/currency-dropdown.component';
import { firstBy } from 'thenby';
import { Store } from '@ngrx/store';
import * as fromFclShipping from '../store'
import { AppComponent } from '../../../../app.component';
import { untilDestroyed } from 'ngx-take-until-destroy';
import * as moment from "moment";
import { SetupService } from '../../../../shared/setup/setup.injectable';
import { CurrencyControl } from '../../../../shared/currency/currency.injectable';
import { currErrMsg } from '../../../../shared/constants';

@Component({
  selector: 'app-shipping-card',
  templateUrl: './shipping-card.component.html',
  styleUrls: ['./shipping-card.component.scss'],
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
export class ShippingCardComponent implements OnInit, OnDestroy {
  public isCollapsed = true;
  public selectedSortType: string = 'Price'
  public selectedSortText: string = 'low to high'
  public searchCriteria: SearchCriteria;
  // public providersSearchResult: ProvidersSearchResult[];
  public response: any;
  public mainSearchResult: SearchResult[];
  public page: number = 1;
  public pageSize: number = 5;
  public totalElements: number;

  parentData: SearchResult[];
  public searchResultSummary: any = [];
  public recordCount;
  public dealCount;
  public showForwarders: number = 0;
  public providersResult: any;
  public isDataLoaded: boolean = false
  public PickupDate: any;
  public fastestRouteDays: string = '0 Day';
  public bestRouteDays: string = '0 Day';
  // public fastestRoute: number;

  public savedSeaarchCriteria: any;
  public currencyFlags: CurrencyDetails[];
  public currentSelectedCurrency: SelectedCurrency
  public sortBy: string;
  public sortOrder: string;
  public activeEvent: any;
  public resp;
  public hideRoute = {};

  public portWare = []
  public portLand = []
  public portAir = []
  public portSea = []
  public portDoor = [];

  private currentPage: number = 1;
  private totalPages: number = 0

  public routesDirection = [];
  public searchResult: SearchResult[];
  public RouteMap: RouteMap = {
    Route: "",
    TransitTime: 0,
    CarrierName: "",
    CarrierImage: "",
    FreeTimeAtPort: 0,
    RouteInfo: []
  }

  itemsPerPage: number = 5;
  totalItems: number;
  previousPage: number;

  // Pagination variables decleration start
  public maxSize: number = 7;
  public directionLinks: boolean = true;
  public autoHide: boolean = false;
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
  //Pagination End

  //Loading
  public isSearchResultLoaded: boolean = false

  public bestSelectedOption: string = null

  public selectedRoutesInfo = [];

  public $fclSearchResults: Observable<fromFclShipping.FclShippingState>
  public $fclForwardsData: Observable<fromFclShipping.FclForwarderState>
  public selectedProvider: any;

  constructor(
    private _modalService: NgbModal,
    private _dataService: DataService,
    private _router: Router,
    private _dropdownService: DropDownService,
    private _searchService: SearchResultService,
    private _toast: ToastrService,
    private _cookieService: CookieService,
    private _storeShipping: Store<any>,
    private _storeForward: Store<any>,
    private _setup: SetupService,
    private _currencyControl: CurrencyControl

  ) {
    this.hideRoute = {};
    this.portWare = Array(1).fill(0).map((x, i) => i);
    this.portLand = Array(3).fill(0).map((x, i) => i);
    this.portAir = Array(5).fill(0).map((x, i) => i);
    this.portSea = Array(14).fill(0).map((x, i) => i);
  }

  public shouldDispatch: boolean = false
  mainProvidersData = []

  ngOnInit() {
    this.selectedProvider = JSON.parse(HashStorage.getItem('selectedProvider'))
    this.$fclSearchResults = this._storeShipping.select('fcl_shippings')

    this._dataService.modifySearch({ isMod: false, from: 'ship' })
    this.resetHide()
    this.getSearchCriteria()

    const uiLoader = loading
    this.$fclSearchResults.pipe(untilDestroyed(this)).subscribe(state => {
      const { data, loaded, loadFromApi, isSearchUpdate, isMainResultModified, isViewResultModified, loading } = state

      this.config.currentPage = 1

      if (data && loaded && loadFromApi) {
        const { response, searchResult } = data
        this.shouldDispatch = true
        this.getCalculateFCLShippingData(response)
        this.setSearchResultScreen(searchResult)
        return
      }

      if (isSearchUpdate && isViewResultModified) {
        uiLoader(false)
        const { searchResult, mainsearchResult } = data
        this.mainSearchResult = mainsearchResult
        this.shouldDispatch = false
        this.onSearchResultUpdate(searchResult)
        return
      }

      if (isSearchUpdate && isMainResultModified) {
        uiLoader(false)
        const { mainsearchResult } = data
        this.mainSearchResult = mainsearchResult
        return
      }

      if (data && data.searchResult && data.mainsearchResult) {
        uiLoader(false)
        const { mainsearchResult } = data
        if (mainsearchResult.length > 0) {
          if (this._currencyControl.getCurrencyID() !== mainsearchResult[0].CurrencyID) {
            this.setSearchResultScreen(mainsearchResult)
          }
        }
      }
    })




    this._dataService.reloadSearchCurreny.pipe(untilDestroyed(this)).subscribe(res => {
      if (res) {
        if (this.currencyFlags && this.currencyFlags.length) {
          this.selectedCurrency(true)
        } else {
          this.currenyFlags(true)
        }
      }
    });
  }

  setSearchResultScreen(searchData: SearchResult[]) {
    if (HashStorage) {
      this.searchResult = searchData
      this.mainSearchResult = this.searchResult;
      this.currenyFlags(true)
      if (this._cookieService.getCookie('ship-page')) {
        let currPage = this._cookieService.getCookie('ship-page')
        this.config.currentPage = parseInt(currPage)
      }
    }
  }

  onSearchResultUpdate(data) {
    loading(false);
    if (data !== null) {
      this.parentData = data;
      this.resetHide();
      // this.mainSearchResult = data
      this.searchResult = data;
      this.setSummary();
      let deal = data.filter((x: SearchResult) => x.DiscountPrice > 0);
      this.dealCount = deal.length;
      this.recordCount = data.length;
      this.isDataLoaded = true;
      this.config.currentPage = 1;
      if (!this.currencyFlags || this.currencyFlags.length === 0) {
        this.currenyFlags(true)
      }
    } else {
      this.recordCount = 0
    }
  }

  private getCalculateFCLShippingData(data: any) {
    const searchResp: any = data[0];
    if (searchResp.returnId === 1 && JSON.parse(searchResp.returnText).length > 0) {

      const jsonString = searchResp.returnText;
      this.searchResult = JSON.parse(jsonString)
      this.mainSearchResult = JSON.parse(jsonString)
      this.searchResult.sort((a: any, b: any) => {
        var comparison;
        if (a.IsRecommended > b.IsRecommended) {
          comparison = -1;
        }
        else if (b.IsRecommended > a.IsRecommended) {
          comparison = 1;
        }
        return comparison;
      });
      const exchangeResp: any = data[1];
      this._currencyControl.setExchangeRateList(exchangeResp.returnObject);
      // let searchResultData: any = this.searchResult;
      // searchResultData = this._currencyControl.applyCurrencyRateOnSearchResult(this._currencyControl.getCurrencyID(), exchangeResp.returnObject, searchResultData, null);
      // this.searchResult = searchResultData;
      // this.mainSearchResult = searchResultData
      // this._storeShipping.dispatch(new fromFclShipping.UpdateFCLShippingMainSearchResult(searchResultData))
    }
    else {
      loading(false);
    }
  }

  currenyFlags($shouldSetRates: boolean) {
    loading(false)
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


  selectedCurrency($shouldSetRates: boolean) {
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

    let newSelectedCurrency: SelectedCurrency = {
      sortedCountryFlag: seletedCurrency.imageName.toLowerCase(),
      sortedCountryName: seletedCurrency.shortName,
      sortedCurrencyID: seletedCurrency.id,
      sortedCountryId: JSON.parse(seletedCurrency.desc).CountryID
    }

    this.currentSelectedCurrency = newSelectedCurrency

    this._currencyControl.setCurrencyID(this.currentSelectedCurrency.sortedCurrencyID)
    this._currencyControl.setCurrencyCode(this.currentSelectedCurrency.sortedCountryName)
    HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
    this.setProviderRates(this._currencyControl.getBaseCurrencyID(), $shouldSetRates)
  }



  currencyFilter($currency: SelectedCurrency) {
    loading(true);

    this.currentSelectedCurrency = $currency

    this._currencyControl.setCurrencyID($currency.sortedCurrencyID)
    this._currencyControl.setCurrencyCode($currency.sortedCountryName)
    this._currencyControl.setToCountryID($currency.sortedCountryId)

    HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
    this.setProviderRates(this._currencyControl.getBaseCurrencyID(), true)
  }

  setProviderRates(baseCurrencyID: number, $shouldDispatch: boolean) {
    this._dropdownService.getExchangeRateList(baseCurrencyID).subscribe((res: any) => {
      let exchangeRate: ExchangeRate = res.returnObject
      this._currencyControl.setExchangeRateList(exchangeRate)

      let searchResultData: any = this.searchResult
      try {
        this.x++
        searchResultData = this._currencyControl.applyCurrencyRateOnSearchResult(this._currencyControl.getCurrencyID(), exchangeRate, searchResultData, null)
        // this._dataService.setData(searchResultData)
        this.searchResult = searchResultData
        // this._dataService.searchResultFiltered = searchResultData
        let mainSearchResult: any = this.mainSearchResult

        mainSearchResult = this._currencyControl.applyCurrencyRateOnSearchResult(this._currencyControl.getCurrencyID(), exchangeRate, mainSearchResult, null)
        // HashStorage.setItem('searchResult', JSON.stringify(mainSearchResult));
        this.mainSearchResult = mainSearchResult

        if ($shouldDispatch) {
          this._storeShipping.dispatch(new fromFclShipping.UpdateFCLShippingViewSearchResult(searchResultData))
          this._storeShipping.dispatch(new fromFclShipping.UpdateFCLShippingMainSearchResult(mainSearchResult))
        }
        this.setSummaryV2();
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
  bookNow(carrier: SearchResult) {
    loading(true);
    let stringedData = JSON.stringify(carrier);

    const { IDlist } = carrier

    this.searchCriteria.carrierID = carrier.CarrierID;
    this.searchCriteria.routeIDs = carrier.ActualRouteIDs;
    this.searchCriteria.etaInDays = carrier.EtaInDays;
    this.searchCriteria.carrierEtdUtcDate = carrier.EtdUtc;
    this.searchCriteria.voyageRefNum = carrier.VoyageRefNum;
    this.searchCriteria.pickupFlexibleDays = 1;
    this.searchCriteria.recordCounter = 120;
    this.searchCriteria.portJsonData = (carrier.PortJsonData) ? carrier.PortJsonData : '[]'
    this.searchCriteria.IDlist = IDlist

    const toSend = this.searchCriteria
    HashStorage.setItem('providerSearchCriteria', JSON.stringify(toSend))

    this._storeForward.dispatch(new fromFclShipping.FetchingFCLForwarderData(toSend))
    HashStorage.setItem('selectedCarrier', stringedData);
    this._router.navigate(['fcl-search/forwarders']);
  }

  currencyParser(obj) {
    return JSON.parse(obj).CountryName;
  }


  sorter(sortBy: string, sortOrder: string, event, type) {
    loading(true);
    this.selectedSortType = type;
    this.bestSelectedOption = null
    if (sortOrder === 'desc')
      this.selectedSortText = 'high to low'
    else if (sortOrder === 'asc')
      this.selectedSortText = 'low to high'

    let recommendedArr = this.searchResult.filter((element) => element.IsRecommended);
    let notRecommended = this.searchResult.filter((element) => !element.IsRecommended);
    recommendedArr = recommendedArr.sort(compareValues(sortBy, sortOrder));
    if (recommendedArr && recommendedArr.length > 0) {
      if (sortBy === 'TotalPrice') {

        if (sortOrder === 'asc') {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v1.TotalPrice - v2.TotalPrice; })
              .thenBy("EtaInDays")
              .thenBy(function (v1, v2) { return v1.PortCutOffUtc - v2.PortCutOffUtc; })
              .thenBy("CarrierName")
          );

        } else {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v2.TotalPrice - v1.TotalPrice; })
              .thenBy("EtaInDays")
              .thenBy("CarrierName")
              .thenBy(function (v1, v2) { return v1.PortCutOffUtc - v2.PortCutOffUtc; })

          );
        }
      } else if (sortBy === 'EtaInDays') {
        if (sortOrder === 'asc') {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v1.EtaInDays - v2.EtaInDays; })
              .thenBy("TotalPrice")
              .thenBy("CarrierName")
              .thenBy(function (v1, v2) { return v1.PortCutOffUtc - v2.PortCutOffUtc; })

          );
        } else {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v2.EtaInDays - v1.EtaInDays; })
              .thenBy("TotalPrice")
              .thenBy("CarrierName")
              .thenBy(function (v1, v2) { return v1.PortCutOffUtc - v2.PortCutOffUtc; })
          );
        }
      } else if (sortBy === 'PortCutOffUtc') {
        if (sortOrder === 'asc') {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v1.PortCutOffUtc - v2.PortCutOffUtc; })
              .thenBy("EtaInDays")
              .thenBy("TotalPrice")
              .thenBy("CarrierName")
          );
        } else {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v2.PortCutOffUtc - v1.PortCutOffUtc; })
              .thenBy("EtaInDays")
              .thenBy("TotalPrice")
              .thenBy("CarrierName")
          );
        }
      }
    }
    if (notRecommended && notRecommended.length > 0) {
      if (sortBy === 'TotalPrice') {
        if (sortOrder === 'asc') {
          notRecommended.sort(
            firstBy(function (v1, v2) { return v1.TotalPrice - v2.TotalPrice; })
              .thenBy("EtaInDays")
              .thenBy(function (v1, v2) { return v1.PortCutOffUtc - v2.PortCutOffUtc; })
              .thenBy("CarrierName")
          );
        } else {
          notRecommended.sort(
            firstBy(function (v1, v2) { return v2.TotalPrice - v1.TotalPrice; })
              .thenBy("EtaInDays")
              .thenBy("CarrierName")
              .thenBy(function (v1, v2) { return v1.PortCutOffUtc - v2.PortCutOffUtc; })
          );
        }
      } else if (sortBy === 'EtaInDays') {
        if (sortOrder === 'asc') {
          notRecommended.sort(
            firstBy(function (v1, v2) { return v1.EtaInDays - v2.EtaInDays; })
              .thenBy("TotalPrice")
              .thenBy("CarrierName")
              .thenBy(function (v1, v2) { return v1.PortCutOffUtc - v2.PortCutOffUtc; })
          );
        } else {
          notRecommended.sort(
            firstBy(function (v1, v2) { return v2.EtaInDays - v1.EtaInDays; })
              .thenBy("TotalPrice")
              .thenBy("CarrierName")
              .thenBy(function (v1, v2) { return v1.PortCutOffUtc - v2.PortCutOffUtc; })
          );
        }
      } else if (sortBy === 'PortCutOffUtc') {
        if (sortOrder === 'asc') {
          notRecommended.sort(
            firstBy(function (v1, v2) { return parseInt(moment(v1.PortCutOffUtc).format('X')) - parseInt(moment(v2.PortCutOffUtc).format('X')) })
              .thenBy("TotalPrice")
              .thenBy("CarrierName")
          );
        } else {
          notRecommended.sort(
            firstBy(function (v1, v2) { return parseInt(moment(v2.PortCutOffUtc).format('X')) - parseInt(moment(v1.PortCutOffUtc).format('X')) })
              .thenBy("TotalPrice")
              .thenBy("CarrierName")
          );
        }
      }
    }
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

  isAllDecoupled = false

  setSummary() {
    if (this.searchResult.length > 0) {
      // Getting Minimum Days with minimum price for best route card on ui (Alpha/Start)
      const { searchResult } = this
      const coupledResults = searchResult.filter(res => res.EtaUtc && res.EtaUtc.length >= 1)
      let x = coupledResults.sort(compareValues('EtaInDays', "asc"))[0];

      if (!x){
        this.isAllDecoupled = true
        return
      }

      let bestEtaS: SearchResult[] = this.searchResult.filter(elem => elem.EtaInDays && elem.EtaInDays === x.EtaInDays)

      bestEtaS = bestEtaS.sort(compareValues('TotalPrice', 'asc'));

      this.searchResultSummary.fastestRouteCurrency = x.CurrencyCode;
      this.searchResultSummary.fastestRoutePrice = this._currencyControl.applyRoundByDecimal(bestEtaS[0].TotalPrice, this._currencyControl.getGlobalDecimal());
      this.searchResultSummary.fastestRouteDays = (x.EtaInDays) ? x.EtaInDays : 0;
      this.isAllDecoupled = (x.EtaInDays) ? false : true;
      console.log(this.isAllDecoupled);
      
      //this.fastestRoute = x.EtaInDays;
      if (x.EtaInDays && x.EtaInDays > 1) {
        this.fastestRouteDays = x.EtaInDays.toString() + " Days";
        //this.fastestRoute = x.EtaInDays;
      } else if (x.EtaInDays) {
        this.fastestRouteDays = x.EtaInDays.toString() + " Day";
        //this.fastestRoute = x.EtaInDays;
      }
      //(Alpha/End)

      // Getting Minimum price with minimum days for best price card on ui (Beta/Start)
      x = this.searchResult.sort(compareValues('TotalPrice', "asc"))[0];

      let bestPrice: SearchResult[] = this.searchResult.filter(elem => elem.TotalPrice === x.TotalPrice)
      bestPrice = bestPrice.sort(compareValues('EtaInDays', 'asc'));
      this.searchResultSummary.bestRouteCurrency = x.CurrencyCode;
      this.searchResultSummary.bestRoutePrice = this._currencyControl.applyRoundByDecimal(x.TotalPrice, this._currencyControl.getGlobalDecimal());
      this.searchResultSummary.bestRouteDays = bestPrice[0].EtaInDays;

      if (bestPrice[0].EtaInDays && bestPrice[0].EtaInDays > 1) {
        this.bestRouteDays = bestPrice[0].EtaInDays.toString() + " Days";
      } else if (bestPrice[0].EtaInDays) {
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

  setSummaryV2() {
    if (this.searchResult.length > 0) {
      // Getting Minimum Days with minimum price for best route card on ui (Alpha/Start)
      const mainSearchRes: SearchResult[] = cloneObject(this.searchResult)
      const { searchResult } = this
      const coupledResults = searchResult.filter(res => res.EtaUtc && res.EtaUtc.length >= 1)
      let x = coupledResults.sort(compareValues('EtaInDays', "asc"))[0];

      if (!x){
        this.isAllDecoupled = true
        return
      }

      let bestEtaS: SearchResult[] = mainSearchRes.filter(elem => elem.EtaInDays && elem.EtaInDays === x.EtaInDays)

      try {
        bestEtaS = bestEtaS.sort(compareValues('TotalPrice', 'asc'));
      } catch (error) { }

      this.searchResultSummary.fastestRouteCurrency = x.CurrencyCode;
      try {
        this.searchResultSummary.fastestRoutePrice = this._currencyControl.applyRoundByDecimal(bestEtaS[0].TotalPrice, this._currencyControl.getGlobalDecimal());
      } catch (error) {
        this.searchResultSummary.fastestRoutePrice = 0
      }
      this.searchResultSummary.fastestRouteDays = (x.EtaInDays) ? x.EtaInDays : 0;
      this.isAllDecoupled = (x.EtaInDays) ? false : true;

      if (x.EtaInDays && x.EtaInDays > 1) {
        this.fastestRouteDays = x.EtaInDays.toString() + " Days";
      } else if (x.EtaInDays) {
        this.fastestRouteDays = x.EtaInDays.toString() + " Day";
      }
      //(Alpha/End)

      // Getting Minimum price with minimum days for best price card on ui (Beta/Start)
      x = mainSearchRes.sort(compareValues('TotalPrice', "asc"))[0];

      let bestPrice: SearchResult[] = mainSearchRes.filter(elem => elem.TotalPrice === x.TotalPrice)
      bestPrice = bestPrice.sort(compareValues('EtaInDays', 'asc'));

      this.searchResultSummary.bestRouteCurrency = x.CurrencyCode;
      this.searchResultSummary.bestRoutePrice = this._currencyControl.applyRoundByDecimal(x.TotalPrice, this._currencyControl.getGlobalDecimal());
      this.searchResultSummary.bestRouteDays = bestPrice[0].EtaInDays;

      if (bestPrice[0].EtaInDays && bestPrice[0].EtaInDays > 1) {
        this.bestRouteDays = bestPrice[0].EtaInDays.toString() + " Days";
      } else if (bestPrice[0].EtaInDays) {
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

  getSearchCriteria() {
    if (HashStorage) {
      let jsonString = HashStorage.getItem("searchCriteria");
      this.searchCriteria = JSON.parse(jsonString);
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


  getRouteDetails(bookRefIDs, index) {
    this.hideRoute[index] = !this.hideRoute[index]
    const { TransportMode, pickupPortType, deliveryPortType } = this.searchCriteria

    let data = {
      bookingReferenceIDs: bookRefIDs,
      shippingMode: TransportMode,
      pickupPortType: pickupPortType,
      deliveryPortType: deliveryPortType
    }
    this._searchService.getRouteMapInfo(data).subscribe((res: Observable<Response>) => {
      this.resp = res;
      if (this.resp != null && this.resp.returnId == 1) {
        let jsonString = this.resp.returnText;
        let temp = JSON.parse(jsonString);
        this.RouteMap = temp[0];
        this.setRouteDirections(this.RouteMap.Route, index);
      }
    })
  }

  setRouteDirections(route, index) {
    let listOfRoutes = (route.split('^'));
    this.routesDirection[index] = []
    let y = [];
    // listOfRoutes.forEach(elem => {
    //   this.routesDirection.push(elem.split('|'))
    // })
    for (let i = 0; i < listOfRoutes.length; i++) {
      let childRoute = listOfRoutes[i];
      setTimeout(() => {
        y.push(childRoute.split('|'));
      }, 300 * (i + 1));
    }
    this.routesDirection[index] = y;
  }

  getRouteDirections(route) {
    let listOfRoutes = (route.split('^'));
    let tempRoutes = []
    listOfRoutes.forEach(elem => {
      tempRoutes.push(elem.split('|'))
    })
    return tempRoutes
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

  getPageSize(): number {
    return this.mainSearchResult.length
  }

  getTotalPages() {
    let temp: any = this.mainSearchResult
    try {
      return Math.ceil(temp.length / this.itemsPerPage)
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

  quickSort(sortBy: string) {
    loading(true);
    const { searchResult } = this
    if (sortBy.toLowerCase() === 'TotalPrice'.toLowerCase()) {

      if (this.bestSelectedOption && this.bestSelectedOption.toLowerCase() === 'price') {
        loading(false);
        return
      }

      this.bestSelectedOption = 'price'
      const minPrice = Math.min(...searchResult.map(o => o.TotalPrice));
      let bestPrice: SearchResult[] = searchResult.filter(elem => elem.TotalPrice === minPrice)

      bestPrice.sort(
        firstBy(function (v1, v2) { return v1.TotalPrice - v2.TotalPrice; })
          .thenBy("EtaInDays")
          .thenBy(function (v1, v2) { return v1.PortCutOffUtc - v2.PortCutOffUtc; })
          .thenBy("CarrierName")
      );

      const OtherPrices: SearchResult[] = searchResult.filter(elem => elem.TotalPrice !== minPrice)
      this.searchResult = bestPrice.concat(OtherPrices)

    } else {

      if (this.bestSelectedOption && this.bestSelectedOption.toLowerCase() === 'days') {
        loading(false);
        return
      }

      this.bestSelectedOption = 'days'

      const minEta = Math.min(...searchResult.map(o => o.EtaInDays));


      let bestEtaS: SearchResult[] = this.searchResult.filter(elem => elem.EtaInDays === minEta)

      bestEtaS.sort(
        firstBy(function (v1, v2) { return v1.EtaInDays - v2.EtaInDays; })
          .thenBy(function (v1, v2) { return v1.PortCutOffUtc - v2.PortCutOffUtc; })
          .thenBy("TotalPrice")
          .thenBy("CarrierName")
      );

      const OtherEtaS: SearchResult[] = this.searchResult.filter(elem => elem.EtaInDays !== minEta)
      this.searchResult = bestEtaS.concat(OtherEtaS)
    }
    this.resetHide()
    loading(false);
  }

  selectEvent(event) {
  }

  getImageByMode($transMode: string) {
    return getGreyIcon($transMode)
  }

  getAnimatedImageByMode($transMode: string) {
    return getAnimatedGreyIcon($transMode)
  }

  getUIImage($image: string) {
    return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
  }

  async setUpConfig() {
    try {
      await this._setup.setBaseCurrencyConfig();
    } catch (error) { }
  }

  ngOnDestroy() { }

}
