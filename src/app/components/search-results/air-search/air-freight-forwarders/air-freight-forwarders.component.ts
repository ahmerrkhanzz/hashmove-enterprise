import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { ProvidersSearchResult, SearchResult } from '../../../../interfaces/searchResult';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { untilDestroyed } from 'ngx-take-until-destroy';
import * as fromFclAirProvider from '../store'
import { HashStorage, loading, compareValues, cloneObject, removeDuplicateCurrencies, getTimeStr, getImagePath, ImageSource, ImageRequiredSize } from '../../../../constants/globalfunctions';
import { Router } from '@angular/router';
import { SelectedCurrency } from '../../../../shared/currency-dropdown/currency-dropdown.component';
import { CurrencyDetails, ExchangeRate } from '../../../../interfaces/currencyDetails';
import { SearchCriteria } from '../../../../interfaces/searchCriteria';
import { firstBy } from 'thenby';
import { HttpErrorResponse } from '@angular/common/http';
import { DropDownService } from '../../../../services/dropdownservice/dropdown.service';
import * as fromLclAir from '../store'
import { ToastrService } from 'ngx-toastr';
import { CurrencyControl } from '../../../../shared/currency/currency.injectable';
import { currErrMsg } from '../../../../shared/constants';

@Component({
  selector: 'app-air-freight-forwarders',
  templateUrl: './air-freight-forwarders.component.html',
  styleUrls: ['./air-freight-forwarders.component.scss']
})
export class AirFreightForwardersComponent implements OnInit, OnDestroy {


  //ProviderSearchResult
  public providerSearchResult: Array<ProvidersSearchResult> = []
  public mainProviderSearchResult: Array<ProvidersSearchResult> = []
  public selectedCarrier: SearchResult
  public currentSelectedCurrency: SelectedCurrency
  public currencyList: CurrencyDetails[];
  public selectedSortType: string = 'Price'
  public selectedSortText: string = 'low to high'
  public shippingMode = 'AIR'
  public searchCriteria: any
  public currencyCode: string = 'AED'
  public shouldDispatch: boolean = true
  public mainsearchResult: SearchResult[] = []
  bestSelectedOption: any;


  constructor(
    private renderer: Renderer2,
    private _store: Store<any>,
    private _storeCarrier: Store<any>,
    private _router: Router,
    private _dropdownService: DropDownService,
    private _toast: ToastrService,
    private _currencyControl: CurrencyControl
  ) { }

  public $fclAirProvidersResult: Observable<fromFclAirProvider.FclForwarderState>
  public $fclAirCarrier: Observable<fromFclAirProvider.LclAirState>

  ngOnInit() {

    this.currencyFlags(false)
    this.selectedCarrier = JSON.parse(HashStorage.getItem('selectedCarrier'))

    this.$fclAirProvidersResult = this._store.select('lcl_air_forwarder')
    this.$fclAirCarrier = this._storeCarrier.select('lcl_air')

    this.$fclAirCarrier.pipe(untilDestroyed(this)).subscribe(state => {
      const { data, loaded } = state
      if (data && loaded) {
        const { mainsearchResult } = data
        this.mainsearchResult = mainsearchResult
      }

    })

    this.$fclAirProvidersResult.pipe(untilDestroyed(this)).subscribe(state => {
      const { loaded, data, isViewResultModified, loadFromApi } = state

      if (data && loaded && loadFromApi) {
        const { mainProvidersList, providersList } = data
        this.mainProviderSearchResult = mainProvidersList
        this.providerSearchResult = providersList
        this.currencyFlags(true)
      }

      if ((data && loaded) || isViewResultModified) {
        loading(false)
        const { providersList, mainProvidersList } = data
        this.providerSearchResult = providersList
        this.mainProviderSearchResult = mainProvidersList
      }

    })

    this.renderer.addClass(document.body, 'bg-grey');
    this.renderer.removeClass(document.body, 'bg-white');
    this.renderer.removeClass(document.body, 'bg-lock-grey');
  }

  gotoSearchResults() {
    this._storeCarrier.dispatch(new fromFclAirProvider.UpdateLCLAirMainSearchResult(this.mainsearchResult))
    this._router.navigate(['air/air-lines']);
  }

  sorter(sortBy: string, sortOrder: string, event, type, shouldDispatch: boolean) {
    loading(true);
    this.selectedSortType = type;
    // this.bestSelectedOption = null
    if (sortOrder === 'desc')
      this.selectedSortText = 'high to low'
    else if (sortOrder === 'asc')
      this.selectedSortText = 'low to high'

    let recommendedArr = this.providerSearchResult.filter((element) => element.IsRecommended);
    let notRecommended = this.providerSearchResult.filter((element) => !element.IsRecommended);
    recommendedArr = recommendedArr.sort(compareValues(sortBy, sortOrder));
    if (recommendedArr && recommendedArr.length > 0) {
      if (sortBy === 'MinTotalPrice') {
        if (sortOrder === 'asc') {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v1.MinTotalPrice - v2.MinTotalPrice; })
              .thenBy("EtaInDays")
              .thenBy("ProviderName")
          );
        } else {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v2.MinTotalPrice - v1.MinTotalPrice; })
              .thenBy("EtaInDays")
              .thenBy("ProviderName")
          );
        }
      } else if (sortBy === 'EtaInDays') {
        if (sortOrder === 'asc') {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v1.EtaInDays - v2.EtaInDays; })
              .thenBy("MinTotalPrice")
              .thenBy("ProviderName")
          );
        } else {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v2.EtaInDays - v1.EtaInDays; })
              .thenBy("MinTotalPrice")
              .thenBy("ProviderName")
          );
        }
      } else if (sortBy === 'PortCutOffUtc') {
        if (sortOrder === 'asc') {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v1.PortCutOffUtc - v2.PortCutOffUtc; })
              .thenBy("EtaInDays")
              .thenBy("MinTotalPrice")
              .thenBy("ProviderName")
          );
        } else {
          recommendedArr.sort(
            firstBy(function (v1, v2) { return v2.PortCutOffUtc - v1.PortCutOffUtc; })
              .thenBy("EtaInDays")
              .thenBy("MinTotalPrice")
              .thenBy("ProviderName")
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
      if (sortBy === 'MinTotalPrice') {
        if (sortOrder === 'asc') {
          notRecommended.sort(
            firstBy(function (v1, v2) { return v1.MinTotalPrice - v2.MinTotalPrice; })
              .thenBy("EtaInDays")
              .thenBy("ProviderName")
          );
        } else {
          notRecommended.sort(
            firstBy(function (v1, v2) { return v2.MinTotalPrice - v1.MinTotalPrice; })
              .thenBy("EtaInDays")
              .thenBy("ProviderName")
          );
        }
      } else if (sortBy === 'EtaInDays') {
        if (sortOrder === 'asc') {
          notRecommended.sort(
            firstBy(function (v1, v2) { return v1.EtaInDays - v2.EtaInDays; })
              .thenBy("MinTotalPrice")
              .thenBy("ProviderName")
          );
        } else {
          notRecommended.sort(
            firstBy(function (v1, v2) { return v2.EtaInDays - v1.EtaInDays; })
              .thenBy("MinTotalPrice")
              .thenBy("ProviderName")
          );
        }
      }
    }
    this.providerSearchResult = recommendedArr.concat(notRecommended);
    // this.mainProviderSearchResult = recommendedArr.concat(notRecommended);
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

    // this.providerSearchResult
    // this._store.dispatch(new fromLclAir.UpdateLCLAirViewSearchResult())
    loading(false);
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
    const { providerSearchResult, mainProviderSearchResult } = this
    this._dropdownService.getExchangeRateList(baseCurrencyID).subscribe((res: any) => {
      let exchangeRate: ExchangeRate = res.returnObject
      this._currencyControl.setExchangeRateList(exchangeRate)

      let searchResultData: any = providerSearchResult
      let mainSearchResult: any = mainProviderSearchResult
      try {
        searchResultData = this._currencyControl.applyCurrencyRateOnSearchResult(this._currencyControl.getCurrencyID(), exchangeRate, null, searchResultData)
        mainSearchResult = this._currencyControl.applyCurrencyRateOnSearchResult(this._currencyControl.getCurrencyID(), exchangeRate, null, mainSearchResult)

        if ($shouldDispatch) {
          this._store.dispatch(new fromLclAir.UpdateFCLAirForwarderViewSearchResult(searchResultData))
          this._store.dispatch(new fromLclAir.UpdateFCLAirForwarderMainSearchResult(mainSearchResult))
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
    if (this.providerSearchResult.length > 0) {
      let mainSearchRes: SearchResult[] = cloneObject(this.providerSearchResult)
      var x = mainSearchRes.sort(compareValues('EtaInDays', "asc"))[0];

      let bestEtaS: SearchResult[] = mainSearchRes.filter(elem => elem.EtaInDays === x.EtaInDays)

      bestEtaS = bestEtaS.sort(compareValues('MinTotalPrice', 'asc'));

      x = mainSearchRes.sort(compareValues('MinTotalPrice', "asc"))[0];

      let bestPrice: SearchResult[] = mainSearchRes.filter(elem => elem.MinTotalPrice === x.MinTotalPrice)
      bestPrice = bestPrice.sort(compareValues('EtaInDays', 'asc'));

    }
    else {

    }

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
      this.setProviderRates(this._currencyControl.getBaseCurrencyID(), this.shouldDispatch)
    }
  }


  currencyFlags($shouldSetRates: boolean) {
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

  getFlightTime(time: number) {
    return getTimeStr(time)
  }

  getUIImage($image: string) {
    return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
  }

  bestRouteChange($selected) {
    this.bestSelectedOption = $selected
  }

  recieveBestRouteChange($searchResult: any) {
    this.providerSearchResult = $searchResult
  }

  ngOnDestroy() { }

}
