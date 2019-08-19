import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { loading, HashStorage, compareValues, removeDuplicateCurrencies, getSearchCriteria } from '../../../constants/globalfunctions';
import { SearchResult, HashmoveLocation } from '../../../interfaces/searchResult';
import { SelectedCurrency } from '../../../shared/currency-dropdown/currency-dropdown.component';
import { DataService } from '../../../services/commonservice/data.service';
import { CurrencyDetails, ExchangeRate } from '../../../interfaces/currencyDetails';
import { DropDownService } from '../../../services/dropdownservice/dropdown.service';
import { HttpErrorResponse } from '@angular/common/http';
import { firstBy } from 'thenby';
import { PaginationInstance } from 'ngx-pagination';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromLclShipping from './store'
import { CookieService } from '../../../services/cookies.injectable';
import { Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { CurrencyControl } from '../../../shared/currency/currency.injectable';
import { SearchCriteria } from '../../../interfaces/searchCriteria';

@Component({
  selector: 'app-lcl-search',
  templateUrl: './lcl-search.component.html',
  styleUrls: ['./lcl-search.component.scss']
})
export class LclSearchComponent implements OnInit, OnDestroy {
  searchResult: SearchResult[] = [];
  mainsearchResult: SearchResult[] = [];

  public currentSelectedCurrency: SelectedCurrency
  public currencyFlags: CurrencyDetails[];
  public selectedSortType: string = 'Price'
  public selectedSortText: string = 'low to high'
  bestSelectedOption: any;

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
  public recordCount: number;

  public $fclSearchResults: Observable<fromLclShipping.LclShippingState>
  public searchCriteria: SearchCriteria


  constructor(
    private renderer: Renderer2,
    private _dataService: DataService,
    private _dropdownService: DropDownService,
    private _store: Store<any>,
    private _cookieService: CookieService,
    private _router: Router,
    private _currencyControl: CurrencyControl
  ) { }

  ngOnInit() {
    this.$fclSearchResults = this._store.select('lcl_shippings')
    this.searchCriteria = getSearchCriteria()
    // if (this._currencyControl.getCurrencyList()) {
    //   this.currencyFlags = this._currencyControl.getCurrencyList()
    // }
    this.currenyFlags(false)

    HashStorage.removeItem('tempSearchCriteria');

    this.$fclSearchResults.pipe(untilDestroyed(this)).subscribe(state => {
      const { data, loaded, loadFromApi, isSearchUpdate, isMainResultModified, isViewResultModified } = state
      loading(false)
      // this.currenyFlags(false)
      if (data && loaded && loadFromApi) {
        this.setLclData(data.response)
      }

      if (isSearchUpdate && isViewResultModified && !isMainResultModified) {
        const { searchResult, mainsearchResult } = data
        this.searchResult = searchResult
        this.mainsearchResult = mainsearchResult
      }

      if (isSearchUpdate && isMainResultModified && !isViewResultModified) {
        const { mainsearchResult, searchResult } = data

        this.mainsearchResult = mainsearchResult
        this.searchResult = searchResult
      }

      if (data) {
        const { mainsearchResult } = data
        if (mainsearchResult && mainsearchResult.length > 0) {
          const { PolName, PodName } = mainsearchResult[0]

          const hashmoveLoc: HashmoveLocation = {
            PolName,
            PodName
          }

          this._dataService.setHashmoveLocation(hashmoveLoc)
        }
      } else {
        this._dataService.setHashmoveLocation(null)
      }

      if (state === fromLclShipping.getLclInitalShippingState()) {
        const searchCriteria = JSON.parse(localStorage.getItem('searchCriteria'))
        if (searchCriteria) {
          if (this._router.url.includes('lcl-search') || this._router.url.includes('truck-search')) {
            this._store.dispatch(new fromLclShipping.FetchingLCLShippingData(searchCriteria))
          }
        }
        return;
      }

    })

    this.renderer.addClass(document.body, 'bg-grey');
    this.renderer.removeClass(document.body, 'bg-white');
    this.renderer.removeClass(document.body, 'bg-lock-grey');

    this._dataService.reloadSearchCurreny.subscribe(res => {
      if (res) {
        if (this.searchResult && this.searchResult.length) {
          if (this.currencyFlags && this.currencyFlags.length) {
            setTimeout(() => {
              this.selectedCurrency(true)
            }, 200);
          } else {
            this.currenyFlags(true)
          }
        }
      }
    });
  }

  selectedCurrency($shouldSetRates: boolean) {
    try {
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
      this._dataService.forwardCurrencyCode.next(this.currentSelectedCurrency.sortedCountryName)

      this._currencyControl.setCurrencyID(this.currentSelectedCurrency.sortedCurrencyID)
      this._currencyControl.setCurrencyCode(this.currentSelectedCurrency.sortedCountryName)

      HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
      if ($shouldSetRates) {
        this.setProviderRates(this._currencyControl.getBaseCurrencyID())
      }

    } catch (error) {
      console.warn('Could not set currency', error)
    }
  }

  currencyFilter($currency: SelectedCurrency) {
    loading(true);

    this.currentSelectedCurrency = $currency

    this._currencyControl.setCurrencyID($currency.sortedCurrencyID)
    this._currencyControl.setCurrencyCode($currency.sortedCountryName)
    this._currencyControl.setToCountryID($currency.sortedCountryId)

    this._dataService.forwardCurrencyCode.next($currency.sortedCountryName)

    HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
    this.setProviderRates(this._currencyControl.getBaseCurrencyID())
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


  setProviderRates(baseCurrencyID: number) {
    this._dropdownService.getExchangeRateList(baseCurrencyID).subscribe((res: any) => {
      let exchangeRate: ExchangeRate = res.returnObject
      this._currencyControl.setExchangeRateList(exchangeRate)

      let searchResultData: any = this.searchResult
      try {

        searchResultData = this._currencyControl.applyCurrencyRateOnSearchResult(this._currencyControl.getCurrencyID(), exchangeRate, null, searchResultData)
        this.searchResult = searchResultData

        this._dataService.searchResultFiltered = searchResultData
        let mainSearchResult: any = this.mainsearchResult
        mainSearchResult = this._currencyControl.applyCurrencyRateOnSearchResult(this._currencyControl.getCurrencyID(), exchangeRate, null, mainSearchResult)
        // HashStorage.setItem('searchResult', JSON.stringify(mainSearchResult));
        // this.setSummaryV2();
        this._store.dispatch(new fromLclShipping.UpdateLCLShippingViewSearchResult(searchResultData))
        this._store.dispatch(new fromLclShipping.UpdateLCLShippingMainSearchResult(mainSearchResult))
        loading(false);
      } catch (err) {
        loading(false);
        // this._toast.error('Currency conversion rates are not available. Please select any other currency, or try again later.', 'Conversion Failed')


      }
    }, (error: HttpErrorResponse) => {
    })
  }

  getPageSize(): number {
    return this.searchResult.length
  }

  getTotalPages() {
    if (this.searchResult && this.searchResult) {
      let temp: any = this.searchResult
      return Math.ceil(temp.length / this.itemsPerPage)
    } else {
      return 0
    }
  }

  onPageChange(number: any) {

    this.config.currentPage = number;
    // this._cookieService.setCookie('ship-page', number, 1)
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


    if (recommendedArr && recommendedArr.length > 0) {
      if (sortBy === 'TotalPrice') {
        if (sortOrder === 'asc') {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v1.TotalPrice - v2.TotalPrice; })
              .thenBy("ProviderName")
          );
        } else {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v2.TotalPrice - v1.TotalPrice; })
              .thenBy(function (v1, v2) { return v1.PortCutOffUtc - v2.PortCutOffUtc; })
          );
        }
      }
    }

    if (notRecommended && notRecommended.length > 0) {
      if (sortBy === 'TotalPrice') {
        if (sortOrder === 'asc') {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v1.TotalPrice - v2.TotalPrice; })
              .thenBy("ProviderName")
          );
        } else {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v2.TotalPrice - v1.TotalPrice; })
              .thenBy("ProviderName")
          );
        }
      }
    }


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

  async setLclData(res) {
    let searchResp: any = res[0];
    if (searchResp.returnId === 1 && searchResp.returnObject && searchResp.returnObject.length > 0) {
      this._dataService.searchResultFiltered = searchResp.returnObject;
      this.searchResult = searchResp.returnObject
      this.mainsearchResult = searchResp.returnObject
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
      // this._cookieService.deleteCookies()
      this.currenyFlags(true);
      // HashStorage.setItem('searchResult', JSON.stringify(this._dataService.searchResultFiltered));
    }
  }

  ngOnDestroy() {

  }
}
