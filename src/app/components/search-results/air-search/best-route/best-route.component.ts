import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { loading, compareValues, getTimeStr } from '../../../../constants/globalfunctions';
import { SearchResult } from '../../../../interfaces/searchResult';
import { Store } from '@ngrx/store';
import * as fromLclAir from '../store'
import { Observable } from 'rxjs';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { CurrencyControl } from '../../../../shared/currency/currency.injectable';
import { firstBy } from 'thenby';

@Component({
  selector: 'app-best-route',
  templateUrl: './best-route.component.html',
  styleUrls: ['./best-route.component.scss']
})
export class BestRouteComponent implements OnInit, OnDestroy {

  @Input() isActive: boolean = false
  @Input() searchResult: any = []
  @Output() searchEmit = new EventEmitter<any>();
  @Input() selectedOption: string = 'price'


  public toFilter: string = 'MinTotalPrice'
  public fastetDay: string = '0h 0m'
  public currencyCode: string = 'AED'
  public bestPrice: number = 0
  public $lclAirSearchResult: Observable<fromLclAir.LclAirState>


  constructor(
    private _store: Store<any>,
    private _currencyControl: CurrencyControl
  ) { }

  ngOnInit() {
    this.$lclAirSearchResult = this._store.select('lcl_air')
    this.$lclAirSearchResult.pipe(untilDestroyed(this)).subscribe(state => {
      const { data, isViewResultModified, isMainResultModified, loaded } = state
      if (data && loaded) {
        const { searchResult, mainsearchResult } = data
        if (mainsearchResult && mainsearchResult.length > 0) {
          this.searchResult = searchResult
          this.currencyCode = this._currencyControl.getCurrencyCode()
          this.setSummary()
        }
      }
    })
    this.setSummary()
  }


  async quickSort(sortBy: string) {
    try {
      loading(true);
      const { searchResult } = this

      if (sortBy.toLowerCase() === 'price'.toLowerCase()) {

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
    } catch (error) {
    }

    this.searchEmit.emit(this.searchResult)
    this._store.dispatch(new fromLclAir.UpdateFCLAirForwarderViewSearchResult(this.searchResult))
    loading(false);
  }

  setSummary() {
    if (this.searchResult.length > 0) {
      // Getting Minimum Days with minimum price for best route card on ui (Alpha/Start)
      var x = this.searchResult.sort(compareValues('EtaInDays', "asc"))[0];
      let bestEtaS: SearchResult[] = this.searchResult.filter(elem => elem.EtaInDays === x.EtaInDays)
      bestEtaS = bestEtaS.sort(compareValues('TotalPrice', 'asc'));
      this.bestPrice = this._currencyControl.applyRoundByDecimal(bestEtaS[0].TotalPrice, this._currencyControl.getGlobalDecimal());
      // this.currencyCode = x.CurrencyCode;

      this.fastetDay = getTimeStr(x.EtaInDays);
      // Getting Minimum price with minimum days for best price card on ui (Beta/Start)
      x = this.searchResult.sort(compareValues('TotalPrice', "asc"))[0];

      let bestPrice: SearchResult[] = this.searchResult.filter(elem => elem.TotalPrice === x.TotalPrice)
      bestPrice = bestPrice.sort(compareValues('EtaInDays', 'asc'));
      this.bestPrice = this._currencyControl.applyRoundByDecimal(x.TotalPrice, this._currencyControl.getGlobalDecimal());
      this.fastetDay = (getTimeStr(bestPrice[0].EtaInDays));
    }
    else {
      this.bestPrice = 0;
      this.fastetDay = getTimeStr(0);
      this.currencyCode = this._currencyControl.getCurrencyCode();
    }

  }

  getFlightTime(time: number) {
    return getTimeStr(time)
  }

  ngOnDestroy() {

  }

}
