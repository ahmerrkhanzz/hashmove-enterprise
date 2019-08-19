import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter, OnDestroy } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { DataService } from "../../../../services/commonservice/data.service";
import { SearchResult } from '../../../../interfaces/searchResult'
import { removeDuplicates, loading, compareValues, getImagePath, ImageSource, ImageRequiredSize, isJSON } from '../../../../constants/globalfunctions';
import { CookieService } from '../../../../services/cookies.injectable';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromFclShipping from '../store'
import { untilDestroyed } from 'ngx-take-until-destroy';
import { baseExternalAssets } from '../../../../constants/base.url';


@Component({
  selector: 'app-left-sidebar',
  templateUrl: './left-sidebar.component.html',
  styleUrls: ['./left-sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ transform: 'translateY(-20%)', opacity: 0 }),
          animate('300ms', style({ transform: 'translateY(0)', opacity: 1 }))
        ]),
        transition(':leave', [
          style({ transform: 'translateY(0)', opacity: 1 }),
          animate('300ms', style({ transform: 'translateY(-20%)', opacity: 0 }))
        ])
      ]
    )
  ],
})

export class LeftSidebarComponent implements OnInit, OnDestroy {

  @Input() conditionalFilters: boolean;
  @Output() providersEmitter = new EventEmitter<any>();

  public filteredResult: SearchResult[];
  public searchResultFiltered: SearchResult[];
  public providersResult: any = [];
  public freighFilterObject = []

  public providerList: any = [];
  public paymentList: any = [];
  public carrierList = [];

  public priceMinMax = [1, 99999];
  public arrivalMinMax = [1, 99];
  public freeTimeMinMax = [0, 200];

  public tempPriceMinMax = [1, 99999];
  public tempArrivalMinMax = [1, 99];
  public tempFreeTimeMinMax = [0, 200];

  public priceRange = this.priceMinMax;
  public arrivalRange = this.arrivalMinMax;
  public freeTimeRange = this.freeTimeMinMax;

  public minArrival: number = 0
  public maxArrival: number = 0

  public minFreeTime: number = 0
  public maxFreeTime: number = 0


  public show: boolean = true;

  public carrierCount: number = 0;
  public carrierlimit: number = 9;

  public providerCount: number = 0;
  public providerlimit: number = 4;


  public paymentCount: number = 0;
  public paymentLimit: number = 4;

  public showToggleFreight: boolean = true;
  public buttonToggleFreight: string;


  public toggleTimePort: boolean = false;
  public btntoggleTimePort: string;


  public showLayover: boolean = true;
  public buttonLayover: string;

  public showNumStops: boolean = true;
  public buttonNumStops: string;

  public showRange: boolean = true;
  public buttonRange: string;


  public showEstimateTime: boolean = false;
  public buttonEstimateTime: string;

  public showPayment: boolean = true;
  public buttonPayment: string;

  public showMoreShip: boolean = true;
  public buttonShipLine: string;

  public showMore: boolean = true;
  public buttonMore: string;

  public isFreeCancelable: boolean = false
  public isNoRestrictions: boolean = false
  public isHashDeals: boolean = false




  public providerSearchInput;
  public paymentSearchInput;
  public layoverSearchInput;


  // class Toggle function
  public isActive = false;
  public layoverScroll = false;


  /// toggle properties of side bar

  forwarderShow = false;


  Forwardtoggle() {
    this.forwarderShow = !this.forwarderShow;
  }

  toggleClass() {
    this.isActive = !this.isActive;
  }

  layoverScrollClass() {
    this.layoverScroll = !this.layoverScroll;
  }


  public filters: object = {
    price: this.priceMinMax
  };


  // loadFilter = true
  // isRangeLoaded = true

  isNVOCC: boolean = false

  constructor(
    private _dataService: DataService,
    private _cookieService: CookieService,
    private store: Store<any>
  ) { }

  public withoutStop: any = true;
  public oneStop: any = true;
  public twoStops: any = true;
  public twoPlusStops: any = true;
  public $fclSearchResults: Observable<fromFclShipping.FclShippingState>
  static loadFilter = true
  static isRangeLoaded = true

  ngOnInit() {

    this.$fclSearchResults = this.store.select('fcl_shippings')

    LeftSidebarComponent.loadFilter = true
    LeftSidebarComponent.isRangeLoaded = true

    this.$fclSearchResults.pipe(untilDestroyed(this)).subscribe(state => {
      const { data, loaded } = state


      if (loaded && data && LeftSidebarComponent.isRangeLoaded) {
        const { mainsearchResult, response } = data
        if (mainsearchResult) {
          this.setNVOCC()
          this.filteredResult = mainsearchResult
        } else {
          this.store.dispatch(new fromFclShipping.UpdateFCLShippingMainSearchResult(mainsearchResult))
          return
        }

        this.filteredResult = mainsearchResult
        this.setAllRanges();
        this.setDistinctCarriers();
        this.setCachedNumStops()
        // this.setOldMoreoptions();
        this.setNumberOfStops();
        // this.setOldETA();
        // this.setOldFreeTime();

        if (LeftSidebarComponent.loadFilter) {
          this.leftPanelFilteration(this.conditionalFilters);
        }
        LeftSidebarComponent.isRangeLoaded = false
        LeftSidebarComponent.loadFilter = false
      }


      // if (isSearchUpdate && isMainResultModified) {
      //   const { mainsearchResult } = data
      //   this.filteredResult = mainsearchResult
      // }
    })

    // this._dataService.currentProvidersData.subscribe(data => {
    //   if (data !== null) {
    //     this.providersResult = data;
    //     this.setAllRanges();
    //     this.setDistinctFreightForwarders();
    //   }
    // });
  }

  setNVOCC() {
    try {
      const { filteredResult } = this
      filteredResult.forEach(res => {
        if (res.IsNvocc) {
          this.isNVOCC = true
          return
        }
      })
    } catch (error) { }
  }

  setOldMoreoptions() {
    if (this._cookieService.getCookie('isFreeCancelable')) {
      let isFreeCancelable = this._cookieService.getCookie('isFreeCancelable');
      this.isFreeCancelable = (isFreeCancelable === 'true') ? true : false;
    }
    if (this._cookieService.getCookie('isNoRestrictions')) {
      let isNoRestrictions = this._cookieService.getCookie('isNoRestrictions');
      this.isNoRestrictions = (isNoRestrictions === 'true') ? true : false;
    }
    if (this._cookieService.getCookie('isHashDeals')) {
      let isHashDeals = this._cookieService.getCookie('isHashDeals');
      this.isHashDeals = (isHashDeals === 'true') ? true : false;
    }

  }

  setNumberOfStops() {
    if (this._cookieService.getCookie('withoutStop')) {
      let withoutStop = this._cookieService.getCookie('withoutStop');
      this.withoutStop = (withoutStop === 'true') ? true : false;
    }
    if (this._cookieService.getCookie('oneStop')) {
      let oneStop = this._cookieService.getCookie('oneStop');
      this.oneStop = (oneStop === 'true') ? true : false;
    }
    if (this._cookieService.getCookie('twoStops')) {
      let twoStops = this._cookieService.getCookie('twoStops');
      this.twoStops = (twoStops === 'true') ? true : false;
    }
    if (this._cookieService.getCookie('twoPlusStops')) {
      let twoPlusStops = this._cookieService.getCookie('twoPlusStops');
      this.twoPlusStops = (twoPlusStops === 'true') ? true : false;
    }
  }


  setOldETA() {
    if (this._cookieService.getCookie('fromArrivalRange')) {
      this.arrivalRange[0] = Number(this._cookieService.getCookie('fromArrivalRange'))
    }
    if (this._cookieService.getCookie('toArrivalRange')) {
      this.arrivalRange[1] = Number(this._cookieService.getCookie('toArrivalRange'))
    }
  }
  setOldFreeTime() {
    if (this._cookieService.getCookie('fromFreeTimeRange')) {
      this.freeTimeRange[0] = Number(this._cookieService.getCookie('fromFreeTimeRange'))
    }
    if (this._cookieService.getCookie('toFreeTimeRange')) {
      this.freeTimeRange[1] = Number(this._cookieService.getCookie('toFreeTimeRange'))
    }
  }

  setNewCarrierList() {
    this._cookieService.setCookie('carrierList', JSON.stringify(this.carrierList), 1)
  }



  setAllRanges() {
    let maxArrival = Math.max(...this.filteredResult.map(o => o.EtaInDays));
    let minArrival = Math.min(...this.filteredResult.map(o => o.EtaInDays));

    if (maxArrival === minArrival) {
      minArrival--;
    }

    this.arrivalMinMax = [minArrival, maxArrival]
    this.tempArrivalMinMax = [minArrival, maxArrival]
    this.arrivalRange = [minArrival, maxArrival]

    this.minArrival = Math.round(minArrival)
    this.maxArrival = Math.round(maxArrival)

    //set Free time at Port
    let maxTimeAtPort = Math.max(...this.filteredResult.map(o => o.FreeTimeAtPort));
    let minTimeAtPort = Math.min(...this.filteredResult.map(o => o.FreeTimeAtPort));

    if (maxTimeAtPort === minTimeAtPort) {
      minTimeAtPort--;
    }

    this.freeTimeMinMax = [minTimeAtPort, maxTimeAtPort]
    this.tempFreeTimeMinMax = [minTimeAtPort, maxTimeAtPort]
    this.freeTimeRange = [minTimeAtPort, maxTimeAtPort]

    this.minFreeTime = Math.round(minTimeAtPort)
    this.maxFreeTime = Math.round(maxTimeAtPort)

    this.setOldETA()
    this.setOldFreeTime()
  }



  provideFilter(index) {
    this.providerList[index].isChecked = !this.providerList[index].isChecked
    // this._cookieService.setCookie('providerList', this.providerList, 1)
    this.leftPanelFilteration(this.conditionalFilters)
  }

  paymentFilter(index) {
    this.paymentList[index].isChecked = !this.paymentList[index].isChecked
    this.leftPanelFilteration(this.conditionalFilters)
  }

  onPriceRangeChange(slider, event) {
    // this.priceRange = slide; Old

    // New-start
    slider.onFinish = event;
    this.priceRange[0] = event.from
    this.priceRange[1] = event.to
    // New-end

    this.leftPanelFilteration(this.conditionalFilters)
  }


  onArrivalSelectedChange(event) {
    this.minArrival = Math.round(event.from)
    this.maxArrival = Math.round(event.to)
  }

  onArrivalRangeChange(slider, event) {
    // this.arrivalRange = e

    slider.onFinish = event;
    this.arrivalRange[0] = event.from
    this.arrivalRange[1] = event.to

    this._cookieService.setCookie('fromArrivalRange', this.arrivalRange[0] + '', 1)
    this._cookieService.setCookie('toArrivalRange', this.arrivalRange[1] + '', 1)

    this.leftPanelFilteration(this.conditionalFilters)
  }

  onFreeTimeSelectedChange(event) {
    this.minFreeTime = Math.round(event.from)
    this.maxFreeTime = Math.round(event.to)
  }

  onFreeTimeChange(slider, event) {
    slider.onFinish = event;
    this.freeTimeRange[0] = event.from
    this.freeTimeRange[1] = event.to

    this._cookieService.setCookie('fromFreeTimeRange', this.freeTimeRange[0] + '', 1)
    this._cookieService.setCookie('toFreeTimeRange', this.freeTimeRange[1] + '', 1)

    this.leftPanelFilteration(this.conditionalFilters)
  }



  toggleFreight() {
    this.showToggleFreight = !this.showToggleFreight;
    this.buttonToggleFreight = (this.showToggleFreight) ? "Hide" : "Show";
  }

  toggleTime() {
    this.toggleTimePort = !this.toggleTimePort;
    this.btntoggleTimePort = this.toggleTimePort ? "Hide" : "Show"
  }

  toggleLayover() {
    this.showLayover = !this.showLayover;
    this.buttonLayover = (this.showLayover) ? "Hide" : "Show";
  }


  toggleRange() {
    this.showRange = !this.showRange;
    this.buttonRange = (this.showRange) ? "Hide" : "Show";
  }


  toggleEstimateTime() {
    this.showEstimateTime = !this.showEstimateTime;
    this.buttonEstimateTime = (this.showEstimateTime) ? "Hide" : "Show";
  }


  toggleNumStops() {
    this.showNumStops = !this.showNumStops;
    this.buttonNumStops = (this.showNumStops) ? "Hide" : "Show";
  }


  togglePayment() {
    this.showPayment = !this.showPayment;
    this.buttonPayment = (this.showPayment) ? "Hide" : "Show";
  }

  toggleMore() {
    this.showMore = !this.showMore;
    this.buttonMore = (this.showMore) ? "Hide" : "Show";
  }

  toggleCredit() {
    this.showMore = !this.showMore;
    this.buttonMore = (this.showMore) ? "Hide" : "Show";
  }

  toggleShipLines() {
    this.showMoreShip = !this.showMoreShip;
    this.buttonShipLine = (this.showMoreShip) ? "Hide" : "Show";
  }

  setDistinctFreightForwarders() {
    if (this.providersResult != null) {
      let freightForwarderList = removeDuplicates(this.providersResult, "ProviderName");
      freightForwarderList.map((x, k) => {
        this.providerList.push({ "ProviderID": x.ProviderID, "ProviderName": x.ProviderName, "ProviderImage": x.ProviderImage });
        this.providerCount++;
      });
    }
  }

  setDistinctCarriers() {
    if (this.filteredResult && this.filteredResult.length > 0) {

      if (this.setCachedCarriers()) {
        return
      }

      let sortedResult: SearchResult[] = this.filteredResult.sort(compareValues('CarrierID', "asc"))
      // try {
      //   sortedResult = sortedResult.filter(res => res.EtaLcl && res.EtaLcl.length > 1)
      // } catch (error) {
      //   console.warn(error);
      // }
      let newCarriers = []
      let prevCarrierID = -1
      sortedResult.forEach((x) => {
        if (prevCarrierID != x.CarrierID) {
          prevCarrierID = x.CarrierID
          newCarriers.push({ "CarrierID": x.CarrierID, "CarrierImage": x.CarrierImage, "CarrierName": x.CarrierName, "isChecked": false });
        }
      });
      this.carrierList = Object.assign([], this.carrierList, newCarriers)
    }
  }

  setDistinctPaymentDues() {
    if (this.providersResult != null) {
      let paymentDuesList = []
      paymentDuesList = removeDuplicates(this.providersResult, "CreditDays");

      let strCreditDays = ''

      this.paymentList.push({ "CreditDays": 0, "strCreditDays": 'UpFront', "isChecked": false });
      this.paymentList.push({ "CreditDays": -1, "strCreditDays": 'Pay on Delivery', "isChecked": false });
      this.paymentCount = 2
      paymentDuesList.map((x, k) => {
        if (x.CreditDays > 0) {
          strCreditDays = x.CreditDays + ' day(s) credit'
          this.paymentList.push({ "CreditDays": x.CreditDays, "strCreditDays": strCreditDays, "isChecked": false });
          this.paymentCount++;
        }
      });
    }
  }

  onFreeCancelable() {
    this.isFreeCancelable = !this.isFreeCancelable
    this._cookieService.setCookie('isFreeCancelable', this.isFreeCancelable + '', 1)
    this.leftPanelFilteration(this.conditionalFilters)
  }

  onNoRestrictions() {
    this.isNoRestrictions = !this.isNoRestrictions
    this._cookieService.setCookie('isNoRestrictions', this.isNoRestrictions + '', 1)
    this.leftPanelFilteration(this.conditionalFilters)
  }

  onHasDeals() {
    this.isHashDeals = !this.isHashDeals
    this._cookieService.setCookie('isHashDeals', this.isHashDeals + '', 1)
    this.leftPanelFilteration(this.conditionalFilters)
  }

  onTenDays() {
    // this.isHashDeals = !this.isHashDeals
    this.leftPanelFilteration(this.conditionalFilters)
  }
  onThirtyDays() {
    // this.isHashDeals = !this.isHashDeals
    this.leftPanelFilteration(this.conditionalFilters)
  }
  onSixtyDays() {
    // this.isHashDeals = !this.isHashDeals
    this.leftPanelFilteration(this.conditionalFilters)
  }
  onNintyDays() {
    // this.isHashDeals = !this.isHashDeals
    this.leftPanelFilteration(this.conditionalFilters)
  }

  providerMoreLess() {
    if (this.providerlimit == 4) {
      this.providerlimit = this.providerCount;
    }
    else {
      this.providerlimit = 4;
    }
  }

  paymentMoreLess() {
    if (this.paymentLimit == 4) {
      this.paymentLimit = this.paymentCount;
    }
    else {
      this.paymentLimit = 4;
    }
  }



  noOfStopClick(val: number) {

    if (val === 0) {
      if (!this.withoutStop) { this.withoutStop = true }
      else { this.withoutStop = false }
      this._cookieService.setCookie('withoutStop', this.withoutStop + '', 1)
    } else if (val === 1) {
      if (!this.oneStop) { this.oneStop = true }
      else { this.oneStop = false }
      this._cookieService.setCookie('oneStop', this.oneStop + '', 1)
    } else if (val === 2) {
      if (!this.twoStops) { this.twoStops = true }
      else { this.twoStops = false }
      this._cookieService.setCookie('twoStops', this.twoStops + '', 1)
    } else if (val === 3) {
      if (!this.twoPlusStops) { this.twoPlusStops = true }
      else { this.twoPlusStops = false }
      this._cookieService.setCookie('twoPlusStops', this.twoPlusStops + '', 1)
    }

    // applying left panel filteration
    this.leftPanelFilteration(this.conditionalFilters);
  }

  leftPanelFilteration(condition) {
    loading(true);

    // tranist time filteration
    let minArrival = Math.round(this.arrivalRange[0])
    let maxArrival = Math.round(this.arrivalRange[1])
    this.searchResultFiltered = this.filteredResult
      .filter((r: SearchResult) => r.EtaInDays >= minArrival && r.EtaInDays <= maxArrival);

    // Free time at port filteration
    let minFreeTime = Math.round(this.freeTimeRange[0])
    let maxFreeTime = Math.round(this.freeTimeRange[1])
    this.searchResultFiltered = this.searchResultFiltered
      .filter((r: SearchResult) => r.FreeTimeAtPort >= minFreeTime && r.FreeTimeAtPort <= maxFreeTime);

    // Non-stop, 1 stop, 2 stops & 2+ stop data filteration

    let tmpRouteArray = [];

    // without stop (Non-Stop)
    if (this.withoutStop) {
      tmpRouteArray.push(0);
    }
    // 1 stop
    if (this.oneStop) {
      tmpRouteArray.push(1);
    }
    // 2 stop
    if (this.twoStops) {
      tmpRouteArray.push(2);
    }
    // 2+ stop
    if (this.twoPlusStops) {
      for (var i = 3; i <= 20; i++) {
        tmpRouteArray.push(i);
      }
    }

    // Shipping Lines (Carrier) filter
    let tmpShipArr = [];

    this.carrierList.forEach((x, k) => {
      if (x.isChecked === true) {
        tmpShipArr.push(x.CarrierID);
      }
    })

    // provider (Freight Forwarder) filter
    let tmpProviderArr = [];
    this.providerList.map((x, k) => {
      if (x.isChecked === true) {
        tmpProviderArr.push(x.ProviderID);
      }
    })

    if (tmpProviderArr.length > 0) {
      this.searchResultFiltered = this.searchResultFiltered
        .filter(x => tmpProviderArr.includes(x.ProviderID));
    }

    // const searchResult = this.searchResultFiltered

    // const deCoupledResults = searchResult.filter(res => !res.EtdUtc)  
    // const coupledResults = searchResult.filter(res => res.EtdUtc && res.EtdUtc.length >= 1)

    if (tmpShipArr.length > 0) {
      this.searchResultFiltered = this.searchResultFiltered.filter(x => tmpShipArr.includes(x.CarrierID));
    }
    // this.searchResultFiltered = coupledResults.concat(deCoupledResults)
    // Fee Cancellation
    if (this.isFreeCancelable) {
      this.searchResultFiltered = this.searchResultFiltered
        .filter(x => x.IsFreeCancellation === this.isFreeCancelable);
    }

    // No Restriction
    if (this.isNoRestrictions) {
      this.searchResultFiltered = this.searchResultFiltered
        .filter(x => x.IsAnyRestriction != this.isNoRestrictions);
    }

    if (tmpRouteArray.length > 0) {

      const searchResult = this.searchResultFiltered

      const deCoupledResults = searchResult.filter(res => !res.EtdUtc)
      const coupledResults = searchResult.filter(res => res.EtdUtc && res.EtdUtc.length >= 1)

      const tempSearch = coupledResults
        .filter(x => tmpRouteArray.includes(x.TransfersStop));
      this.searchResultFiltered = tempSearch.concat(deCoupledResults)
    }
    const { searchResultFiltered } = this
    this.store.dispatch(new fromFclShipping.UpdateFCLShippingViewSearchResult(searchResultFiltered))

  }

  onShipClick(index) {
    if (index === -1) {
      this.carrierList.forEach(e => {
        e.isChecked = false;
      })
    } else {
      this.carrierList[index].isChecked = !this.carrierList[index].isChecked
    }
    const { carrierList } = this
    this._cookieService.setCookie('carrierList', JSON.stringify(carrierList), 1)
    this.leftPanelFilteration(this.conditionalFilters)
  }

  getRoundedValue(value: number) {
    return Math.round(value)
  }

  getUIImage($image: string) {
    if (isJSON($image)) {
      const providerImage = JSON.parse($image)
      return baseExternalAssets + '/' + providerImage[0].DocumentFile
    } else {
      return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
    }
  }

  setCachedCarriers(): boolean {
    let isSet = false
    try {
      //set Provider List
      const oldCarriers = this._cookieService.getCookie('carrierList')
      if (oldCarriers && JSON.parse(oldCarriers).length > 0) {
        this.carrierList = JSON.parse(oldCarriers)
        isSet = true
      }
    } catch (error) {
      isSet = false
    }
    return isSet
  }

  setCachedNumStops() {
    try {
      const oldwithoutStop = this._cookieService.getCookie('withoutStop')
      if (oldwithoutStop) {
        this.withoutStop = JSON.parse(oldwithoutStop)
      }
      const oldoneStop = this._cookieService.getCookie('oneStop')

      if (oldoneStop) {
        this.oneStop = JSON.parse(oldoneStop)
      }
      const oldtwoStops = this._cookieService.getCookie('twoStops')

      if (oldtwoStops) {
        this.twoStops = JSON.parse(oldtwoStops)
      }
      const oldtwoPlusStops = this._cookieService.getCookie('twoPlusStops')

      if (oldtwoPlusStops) {
        this.twoPlusStops = JSON.parse(oldtwoPlusStops)
      }
    } catch (error) { }

  }

  ngOnDestroy() { }
}
