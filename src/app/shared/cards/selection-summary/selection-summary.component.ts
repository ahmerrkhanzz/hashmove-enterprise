import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { getProviderImage, getImagePath, ImageSource, ImageRequiredSize, HashStorage, loading } from '../../../constants/globalfunctions';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { untilDestroyed } from 'ngx-take-until-destroy';
import * as fromFclShipping from '../../../components/search-results/fcl-search/store/'
import * as fromAirShipping from '../../../components/search-results/air-search/store/'
import { Store } from '@ngrx/store';
import { DataService } from '../../../services/commonservice/data.service';



@Component({
  selector: 'app-selection-summary',
  templateUrl: './selection-summary.component.html',
  styleUrls: ['./selection-summary.component.scss']
})
export class SelectionSummaryComponent implements OnInit, OnDestroy {
  @Input() data: any;
  @Input() page: string;
  public showProviderFields: boolean = true;
  public searchCriteria: any;
  mainProvidersShipData: any
  mainProviderAirData: any
  public $seaLoaded: boolean = false
  public $fclForwardSeaData: Observable<fromFclShipping.FclForwarderState>
  public $airLoaded: boolean = false
  public $fclForwardsAirData: Observable<fromAirShipping.FclForwarderState>

  fetchingData: boolean = false
  changeText: string = 'Change Freight Forwarder';

  constructor(
    private _router: Router,
    private _store: Store<any>,
    private _dataService: DataService
  ) { }

  ngOnInit() {
    this.data = JSON.parse(HashStorage.getItem('selectedProvider'));
    this.showProviderFields = false;
    this.searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))

    this.$fclForwardSeaData = this._store.select('fcl_forwarder')
    this.$fclForwardsAirData = this._store.select('lcl_air_forwarder')
    if (this._router.url.includes('air') || this._router.url.includes('partner')) {
      this.$fclForwardsAirData.pipe(untilDestroyed(this)).subscribe(state => {
        const { data, loaded } = state
        this.$airLoaded = loaded
        if (data) {
          const { response } = data
          this.mainProviderAirData = response
        }
      })
    }

    if (this._router.url.includes('sea') || this._router.url.includes('partner')) {
      this.$fclForwardSeaData.pipe(untilDestroyed(this)).subscribe(state => {
        const { data, loaded } = state
        this.$seaLoaded = loaded
        if (data) {
          const { response } = data
          this.mainProvidersShipData = response
        }
      })
    }
  }

  getUIImage($image: string, isProvider: boolean) {
    if (isProvider) {
      const providerImage = getProviderImage($image)
      return getImagePath(ImageSource.FROM_SERVER, providerImage, ImageRequiredSize.original)
    } else {
      return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
    }
  }

  gotoSearchResults() {
    if (this.searchCriteria.searchMode === 'sea-fcl' && this.page === 'search') {
      loading(true)
      this._router.navigate(['fcl-search/forwarders']).then(res => {
      });
    } else if (this.searchCriteria.searchMode === 'air-lcl' && this.page === 'search') {
      loading(true)
      this._router.navigate(['/air/freight-forwarders']).then(res => {
      })
    } else if (this._router.url.includes('partner') && this.page === 'vendor') {
      this._dataService.searchState.next('provider')
    }
  }

  ngOnDestroy() { }

}
