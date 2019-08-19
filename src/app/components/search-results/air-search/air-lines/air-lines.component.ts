import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { SearchResult } from '../../../../interfaces/searchResult';
import { ToastrService } from 'ngx-toastr';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Store } from '@ngrx/store';
import * as fromLclAir from '../store'
import { SelectedCurrency } from '../../../../shared/currency-dropdown/currency-dropdown.component';
import { CurrencyDetails, ExchangeRate } from '../../../../interfaces/currencyDetails';
import { loading, HashStorage, cloneObject, compareValues, removeDuplicateCurrencies } from '../../../../constants/globalfunctions';
import { HttpErrorResponse } from '@angular/common/http';
import { DropDownService } from '../../../../services/dropdownservice/dropdown.service';
import { firstBy } from 'thenby';
import { SearchCriteria } from '../../../../interfaces/searchCriteria';
import { PaginationInstance } from 'ngx-pagination/dist/ngx-pagination.module';
import { CurrencyControl } from '../../../../shared/currency/currency.injectable';
import { currErrMsg } from '../../../../shared/constants';

@Component({
  selector: 'app-air-lines',
  templateUrl: './air-lines.component.html',
  styleUrls: ['./air-lines.component.scss']
})

export class AirLinesComponent implements OnInit, OnDestroy {

  public $fclSearchResults: Observable<fromLclAir.LclAirState>
  public shouldDispatch: boolean = false

  public searchResult: Array<SearchResult> = [];
  public mainsearchResult: Array<SearchResult> = [];
  public bestSelectedOption: string
  public currentSelectedCurrency: SelectedCurrency
  public currencyList: CurrencyDetails[];
  public selectedSortType: string = 'Price'
  public selectedSortText: string = 'low to high'
  public shippingMode = 'SEA'
  public searchCriteria: SearchCriteria
  public currencyCode: string = 'AED'

  public config: PaginationInstance = {
    id: 'advanced2',
    itemsPerPage: 5,
    currentPage: 1
  };


  public totalSearchCount: number = 0
  public selectedCarrier
  private viewInitLoad: boolean = true
  selectedProvider: any;

  constructor(
    private renderer: Renderer2,
    private _store: Store<any>,
    private _toast: ToastrService,
    private _dropdownService: DropDownService,
    private _currencyControl: CurrencyControl
  ) { }

  ngOnInit() {
    this.selectedProvider = JSON.parse(HashStorage.getItem('selectedProvider'))
    this.viewInitLoad = true
    this.searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))
    this.currencyCode = this._currencyControl.getCurrencyCode()
    this.$fclSearchResults = this._store.select('lcl_air')
    this.totalSearchCount = this.mainsearchResult.length

    this.currenyFlags(false)


    this.$fclSearchResults.pipe(untilDestroyed(this)).subscribe(state => {
      const { loaded, data, isSearchUpdate, isViewResultModified, loadFromApi, isMainResultModified } = state


      if (loaded && data && this.viewInitLoad) {
        const { mainsearchResult } = data
        this.totalSearchCount = mainsearchResult.length
        this.mainsearchResult = mainsearchResult
        this.searchResult = mainsearchResult
        this.shouldDispatch = true
        this.shippingMode = this.searchCriteria.TransportMode
        this.currencyCode = this._currencyControl.getCurrencyCode()
        this.viewInitLoad = false
        this.currenyFlags(true)
        return
      }

      if (isSearchUpdate && isViewResultModified) {
        const { searchResult } = data
        this.totalSearchCount = searchResult.length
        this.shouldDispatch = false
        this.onSearchResultUpdate(searchResult)
        this.shippingMode = this.searchCriteria.TransportMode
        this.currencyCode = this._currencyControl.getCurrencyCode()
        return
      }

      if (isSearchUpdate && isMainResultModified) {
        loading(false)
        const { mainsearchResult } = data
        this.mainsearchResult = mainsearchResult
      }

      if (loaded && data) {
        loading(false)
        const { searchResult, mainsearchResult } = data
        this.searchResult = searchResult
        this.totalSearchCount = searchResult.length
        this.mainsearchResult = mainsearchResult
        return
      }
    })


    this.renderer.addClass(document.body, 'bg-grey');
    this.renderer.removeClass(document.body, 'bg-white');
    this.renderer.removeClass(document.body, 'bg-lock-grey');
  }

  currenyFlags($shouldSetRates: boolean) {
    const { currencyList } = this
    if (!currencyList || currencyList.length === 0) {
      // this._dropdownService.getCurrency().subscribe((res: any) => {
      //   let newCurrencyList = removeDuplicateCurrencies(res)
      //   newCurrencyList.sort(compareValues('title', "asc"));
      //   this.currencyList = newCurrencyList
      //   this.selectedCurrency($shouldSetRates)
      // })
      this.currencyList = JSON.parse(HashStorage.getItem('currencyList'))
      this.selectedCurrency($shouldSetRates);
    } else {
      this.selectedCurrency($shouldSetRates)
    }
  }


  onSearchResultUpdate(data) {
    loading(false);
    if (data !== null) {
      this.searchResult = data;
      // let deal = data.filter((x: SearchResult) => x.DiscountPrice > 0);
      // this.sorter('TotalPrice', 'asc', null, 'Price', this.shouldDispatch)
    }
  }


  bestRouteChange($selected) {
    this.bestSelectedOption = $selected
  }

  recieveBestRouteChange($searchResult: any) {
    this.searchResult = $searchResult
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
        searchResultData = this._currencyControl.applyCurrencyRateOnSearchResult(this._currencyControl.getCurrencyID(), exchangeRate, searchResultData, null)
        this.searchResult = searchResultData
        let mainSearchResult: any = this.mainsearchResult
        mainSearchResult = this._currencyControl.applyCurrencyRateOnSearchResult(this._currencyControl.getCurrencyID(), exchangeRate, mainSearchResult, null)
        if ($shouldDispatch) {
          this._store.dispatch(new fromLclAir.UpdateLCLAirViewSearchResult(searchResultData))
          this._store.dispatch(new fromLclAir.UpdateLCLAirMainSearchResult(mainSearchResult))
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

  setSummaryV2() {
    if (this.searchResult.length > 0) {
      let mainSearchRes: SearchResult[] = cloneObject(this.searchResult)
      var x = mainSearchRes.sort(compareValues('EtaInDays', "asc"))[0];

      let bestEtaS: SearchResult[] = mainSearchRes.filter(elem => elem.EtaInDays === x.EtaInDays)

      bestEtaS = bestEtaS.sort(compareValues('TotalPrice', 'asc'));

      x = mainSearchRes.sort(compareValues('TotalPrice', "asc"))[0];

      let bestPrice: SearchResult[] = mainSearchRes.filter(elem => elem.TotalPrice === x.TotalPrice)
      bestPrice = bestPrice.sort(compareValues('EtaInDays', 'asc'));
      this.sorter('TotalPrice', 'asc', null, 'Price', this.shouldDispatch)
    }
    else {

    }

  }

  sorter(sortBy: string, sortOrder: string, event, type, shouldDispatch: boolean) {
    loading(true);
    this.selectedSortType = type;
    // this.bestSelectedOption = null
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
              .thenBy("CarrierName")
          );
        } else {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v2.TotalPrice - v1.TotalPrice; })
              .thenBy("EtaInDays")
              .thenBy("CarrierName")
          );
        }
      } else if (sortBy === 'EtaInDays') {
        if (sortOrder === 'asc') {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v1.EtaInDays - v2.EtaInDays; })
              .thenBy("TotalPrice")
              .thenBy("CarrierName")
          );
        } else {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v2.EtaInDays - v1.EtaInDays; })
              .thenBy("TotalPrice")
              .thenBy("CarrierName")
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
    recommendedArr.sort((a: any, b: any) => {
      var comparison;
      if (a.DealDet > b.DealDet) {
        comparison = -1;
      } else if (b.DealDet > a.DealDet) {
        comparison = 1;
      }
      return comparison;
    })
    // notRecommended = notRecommended.sort(compareValues(sortBy, sortOrder));
    if (notRecommended && notRecommended.length > 0) {
      if (sortBy === 'TotalPrice') {
        if (sortOrder === 'asc') {
          notRecommended.sort(
            firstBy(function (v1, v2) { return v1.TotalPrice - v2.TotalPrice; })
              .thenBy("EtaInDays")
              .thenBy("CarrierName")
          );
        } else {
          notRecommended.sort(
            firstBy(function (v1, v2) { return v2.TotalPrice - v1.TotalPrice; })
              .thenBy("EtaInDays")
              .thenBy("CarrierName")
          );
        }
      } else if (sortBy === 'EtaInDays') {
        if (sortOrder === 'asc') {
          notRecommended.sort(
            firstBy(function (v1, v2) { return v1.EtaInDays - v2.EtaInDays; })
              .thenBy("TotalPrice")
              .thenBy("CarrierName")
          );
        } else {
          notRecommended.sort(
            firstBy(function (v1, v2) { return v2.EtaInDays - v1.EtaInDays; })
              .thenBy("TotalPrice")
              .thenBy("CarrierName")
          );
        }
      }
      // else if (sortBy === 'PortCutOffUtc') {
      //   if (sortOrder === 'asc') {
      //     notRecommended.sort(
      //       firstBy("PortCutOffUtc")
      //         .thenBy("EtaInDays")
      //         .thenBy("TotalPrice")
      //         .thenBy("CarrierName")
      //     );
      //   } else {
      //     notRecommended.sort(
      //       firstBy("PortCutOffUtc", { direction: -1 })
      //         .thenBy("EtaInDays")
      //         .thenBy("TotalPrice")
      //         .thenBy("CarrierName")
      //     );
      //   }
      // }
    }
    this.searchResult = recommendedArr.concat(notRecommended);
    // this.mainsearchResult = recommendedArr.concat(notRecommended);
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

    // this.searchResult
    // this._store.dispatch(new fromLclAir.UpdateLCLAirViewSearchResult())
    loading(false);
  }

  selectedCurrency($shouldSetRates: boolean) {
    let currencyId = this._currencyControl.getCurrencyID()
    let seletedCurrency: CurrencyDetails

    if (this._currencyControl.getToCountryID() && this._currencyControl.getToCountryID() > 0) {
      seletedCurrency = this.currencyList.find(obj =>
        (obj.id == currencyId && JSON.parse(obj.desc).CountryID === this._currencyControl.getToCountryID())
      );
    } else {
      seletedCurrency = this.currencyList.find(obj =>
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
    if ($shouldSetRates) {
      this.setProviderRates(this._currencyControl.getBaseCurrencyID(), $shouldSetRates)
    }
  }

  ngOnDestroy() {

  }

}
