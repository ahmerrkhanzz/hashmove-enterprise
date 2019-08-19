import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import * as fromLclAir from './store'
import { Store } from '@ngrx/store';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { loading, HashStorage } from '../../../constants/globalfunctions';
import { SearchResult, ProvidersSearchResult, HashmoveLocation } from '../../../interfaces/searchResult';

import { Router, NavigationEnd } from '@angular/router';
import { DataService } from '../../../services/commonservice/data.service';
import { VendorProfileService } from '../../vendor-profile/vendor-profile.service';

@Component({
  selector: 'app-air-search',
  templateUrl: './air-search.component.html',
  styleUrls: ['./air-search.component.scss']
})
export class AirSearchComponent implements OnInit, OnDestroy {


  public $fclSearchResults: Observable<fromLclAir.LclAirState>
  public $fclAirSearchResults: Observable<fromLclAir.FclForwarderState>
  public shouldDispatch: boolean = false
  public searchResult: SearchResult[];
  public mainsearchResult: SearchResult[];
  public providerSearchResult: ProvidersSearchResult[];
  public mainProvidersearchResult: ProvidersSearchResult[];

  public isCarrier: boolean = true

  public providerResponse: any;
  public providerReviews: any;
  public responseObj: any = {}
  public selectedProvider: any;
  public showNoResult: boolean = false;
  public showResult: boolean = false
  isFetchingData: boolean = true


  constructor(
    private _store: Store<any>,
    private _router: Router,
    private _renderer: Renderer2,
    private _dataService: DataService,
    private _vendorService: VendorProfileService
  ) {
    _router.events.filter((event: any) => event instanceof NavigationEnd)
      .subscribe((event: any) => {
        this.checkCurrentRoute(event.url)
      });
  }

  ngOnInit() {

    this.checkCurrentRoute(this._router.url)
    if (!HashStorage) {
      this._router.navigate(['enable-cookies']);
      return
    }
    HashStorage.removeItem('tempSearchCriteria');
    this.setResultScreen(false, false)

    this._renderer.addClass(document.body, 'bg-grey');
    this._renderer.removeClass(document.body, 'bg-white');
    this._renderer.removeClass(document.body, 'bg-lock-grey');

    this.$fclSearchResults = this._store.select('lcl_air')
    this.$fclAirSearchResults = this._store.select('lcl_air_forwarder')

    const uiLoader = loading
    
    this.$fclSearchResults.pipe(untilDestroyed(this)).subscribe(state => {

      const { loaded, data, hassError, isMainResultModified, loading } = state
      uiLoader(false)

      if (loading) {
        this.isFetchingData = true
      } else {
        this.isFetchingData = false
      }

      if (loaded && data) {
        const { searchResult, mainsearchResult } = data
        this.searchResult = searchResult
        this.mainsearchResult = mainsearchResult
        this.checkCurrentRoute(this._router.url)
      }

      // if (isMainResultModified) {
      //   this.isCarrier = true
      // }

      if (state === fromLclAir.getLclInitalAirState()) {
        const searchCriteria = JSON.parse(localStorage.getItem('carrierSearchCriteria'))
        if (searchCriteria) {
          if (this._router.url.includes('air') && this._router.url.includes('air-lines')) {
            this._store.dispatch(new fromLclAir.FetchingLCLAirData(searchCriteria))
          }
        }
        return;
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

      if (data && data.mainsearchResult && data.mainsearchResult.length > 0) {
        this.setResultScreen(false, true)
      }

      if (data && data.mainsearchResult && data.mainsearchResult.length === 0) {
        this.setResultScreen(true, false)
        setTimeout(() => {
          uiLoader(false)
        }, 0);
      }
      if (hassError) {
        this.searchResult = null
        this.setResultScreen(true, false)
      }

    })

    this.$fclAirSearchResults.pipe(untilDestroyed(this)).subscribe(state => {
      const { loaded, data, hassError, loading } = state
      uiLoader(false)

      if (loading) {
        this.isFetchingData = true
      } else {
        this.isFetchingData = false
      }

      if (loaded && data) {
        const { providersList, mainProvidersList } = data
        this.providerSearchResult = providersList
        this.mainProvidersearchResult = mainProvidersList
        this.checkCurrentRoute(this._router.url)
      }
      if (state === fromLclAir.getFclAirInitalForwarderState()) {
        const providerSearchCriteria = JSON.parse(localStorage.getItem('searchCriteria'))
        if (providerSearchCriteria) {
          if (this._router.url.includes('air')) {
            this._store.dispatch(new fromLclAir.FetchingFCLAirForwarderData(providerSearchCriteria))
          }
        }
        return;
      }

      if (data && data.mainProvidersList && data.mainProvidersList.length > 0) {
        this.setResultScreen(false, true)
      }

      if (data && data.mainProvidersList && data.mainProvidersList.length === 0) {
        this.setResultScreen(true, false)
        uiLoader(false)
      }


      if (hassError) {
        this.searchResult = null
        this.setResultScreen(true, false)
      }
    })
  }

  checkCurrentRoute(url: string) {
    if (url.includes('air-lines') && this.mainsearchResult && this.mainsearchResult.length > 0) {
      setTimeout(() => {
        this.isCarrier = true
        this.selectedProvider = JSON.parse(HashStorage.getItem('selectedProvider'))
        this.getProviderInfo(this.selectedProvider.ProviderID);
        this.getProviderReviews(this.selectedProvider.ProviderID)
      }, 200);
    } else if (url.includes('freight-forwarders') && this.mainProvidersearchResult && this.mainProvidersearchResult.length > 0) {
      setTimeout(() => {
        this.isCarrier = false
      }, 200);
    }
  }

  getProviderInfo(id) {
    this._vendorService.getProviderDetailsByID(id).subscribe(res => {
      this.responseObj = res;
      this.providerResponse = this.responseObj.returnObject
    }, err => {
    })
  }

  getProviderReviews(id) {
    this._vendorService.getProviderReviews(id).subscribe(res => {
      this.responseObj = res;
      this.providerReviews = this.responseObj.returnObject;
    }, err => {
    })
  }

  ngOnDestroy() { }

  setResultScreen($first: boolean, $second: boolean) {
    this.showNoResult = $first
    this.showResult = $second
  }
}
