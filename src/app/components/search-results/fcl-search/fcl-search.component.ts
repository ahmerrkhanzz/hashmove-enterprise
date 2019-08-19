import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { SearchCriteria } from '../../../interfaces/searchCriteria';
import { Router, NavigationEnd } from '@angular/router';
import { HashStorage, loading } from '../../../constants/globalfunctions';
import { SearchResult, HashmoveLocation } from '../../../interfaces/searchResult';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromFclShipping from './store'
import { PreviousRouteService } from '../../../services/commonservice/previous-route.service';
import { DataService } from '../../../services/commonservice/data.service';
import { VendorProfileService } from '../../vendor-profile/vendor-profile.service';

@Component({
  selector: 'app-fcl-search',
  templateUrl: './fcl-search.component.html',
  styleUrls: ['./fcl-search.component.scss'],
})
export class SearchresultComponent implements OnInit, OnDestroy {

  public forwardersSidebar: boolean = false;
  searchCriteria: SearchCriteria;
  public hasResults: boolean = false
  public searchResult: SearchResult;
  public showNoResult: boolean = false
  public showResult: boolean = false
  public $fclSearchResults: Observable<fromFclShipping.FclShippingState>
  public $fclProviderResults: Observable<fromFclShipping.FclForwarderState>

  public mainImages
  public subImages
  public subSubImages
  public containers
  public providerResponse: any;
  public providerReviews: any;
  public responseObj: any = {}
  public selectedProvider: any;
  isFetchingData: boolean = true


  constructor(
    private renderer: Renderer2,
    private _router: Router,
    private _storeShipping: Store<any>,
    private _storeForward: Store<any>,
    private _previousRouteService: PreviousRouteService,
    private _dataService: DataService,
    private _vendorService: VendorProfileService
  ) {
    this.searchCriteria = new SearchCriteria();
    _router.events.filter((event: any) => event instanceof NavigationEnd)
      .subscribe(event => {
        if (event.url === '/fcl-search/shipping-lines') {
          this.selectedProvider = JSON.parse(HashStorage.getItem('selectedProvider'))
          this.forwardersSidebar = false;
          this.getProviderInfo(this.selectedProvider.ProviderID);
          this.getProviderReviews(this.selectedProvider.ProviderID)
        } else if (event.url === '/fcl-search/forwarders') {
          this.forwardersSidebar = true;
        }
      });
  }

  ngOnInit() {

    const uiLoader = loading
    uiLoader(true)
    this.showNoResult = false
    this.showResult = false

    this.$fclSearchResults = this._storeShipping.select('fcl_shippings')
    this.$fclProviderResults = this._storeShipping.select('fcl_forwarder')

    if (!HashStorage) {
      this._router.navigate(['enable-cookies']);
      return
    }

    HashStorage.removeItem('tempSearchCriteria');
    this.renderer.addClass(document.body, 'bg-grey');
    this.renderer.removeClass(document.body, 'bg-white');
    this.renderer.removeClass(document.body, 'bg-lock-grey');

    this.$fclSearchResults.subscribe(state => {
      const { data, hassError, loading } = state

      if (loading) {
        this.isFetchingData = true
      } else {
        this.isFetchingData = false
      }

      if (state === fromFclShipping.getFclInitalShippingState()) {
        const searchCriteria = JSON.parse(localStorage.getItem('carrierSearchCriteria'))
        if (searchCriteria) {
          if (this._router.url.includes('fcl-search') && this._router.url.includes('shipping-lines')) {
            this._storeShipping.dispatch(new fromFclShipping.FetchingFCLShippingData(searchCriteria))
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
        this.showNoResult = false
        this.showResult = true
      }
      if (data && data.mainsearchResult && data.mainsearchResult.length === 0) {
        this.showNoResult = true
        this.showResult = false
        setTimeout(() => {
          uiLoader(false)
        }, 0);
      }

      if (hassError) {
        this.showNoResult = true
        uiLoader(false)
      }
    })

    this.$fclProviderResults.subscribe(state => {
      const { data, hassError, loading } = state
      if (loading) {
        this.isFetchingData = true
      } else {
        this.isFetchingData = false
      }
      if (state === fromFclShipping.getFclInitalForwarderState()) {
        const providerSearchCriteria = JSON.parse(localStorage.getItem('searchCriteria'))
        if (providerSearchCriteria) {
          if (this._router.url.includes('fcl-search')) {
            setTimeout(() => {
              uiLoader(true)
            }, 0);
            this._storeShipping.dispatch(new fromFclShipping.FetchingFCLForwarderData(providerSearchCriteria))
          }
        }
        return;
      }
      if (data && data.mainProvidersList && data.mainProvidersList.length > 0) {
        this.showNoResult = false
        this.showResult = true
      }
      if (data && data.mainProvidersList && data.mainProvidersList.length === 0) {
        this.showNoResult = true
        this.showResult = false
        uiLoader(false)
      }

      if (hassError) {
        this.showNoResult = true
        uiLoader(false)
      }

    })
  }

  getProviderInfo(id) {
    this._vendorService.getProviderDetailsByID(id).subscribe(res => {
      this.responseObj = res;
      this.providerResponse = this.responseObj.returnObject
      try {
        let selectedProvider = JSON.parse(HashStorage.getItem('selectedProvider'))
        selectedProvider.ProfileID = this.providerResponse.ProfileID
        HashStorage.setItem('selectedProvider', JSON.stringify(selectedProvider))
      } catch { }
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

  ngOnDestroy() {
    this.$fclSearchResults.subscribe().unsubscribe()
    this.$fclProviderResults.subscribe().unsubscribe()
  }
}
