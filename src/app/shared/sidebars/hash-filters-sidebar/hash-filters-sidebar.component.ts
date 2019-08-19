import { Component, OnInit, Input } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { SearchResult } from '../../../interfaces/searchResult';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { CookieService } from '../../../services/cookies.injectable';
import { removeDuplicates, compareValues, loading, getTimeStr, getImagePath, ImageSource, ImageRequiredSize, HashStorage, isJSON } from '../../../constants/globalfunctions';
import * as fromLclAir from '../../../components/search-results/air-search/store'
import { baseExternalAssets } from '../../../constants/base.url';

@Component({
  selector: 'app-hash-filters-sidebar',
  templateUrl: './hash-filters-sidebar.component.html',
  styleUrls: ['./hash-filters-sidebar.component.scss'],
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
export class HashFiltersSidebarComponent implements OnInit {

  @Input() searchResult: Array<SearchResult> = []
  public $fclSearchResults: Observable<fromLclAir.LclAirState>
  private loadFilter = true

  public filteredResult: any;
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


  public withoutStop: any = true;
  public oneStop: any = true;
  public twoStops: any = true;
  public twoPlusStops: any = true;

  public providerSearchInput;
  public paymentSearchInput;
  public layoverSearchInput;


  // class Toggle function
  public isActive = false;
  public layoverScroll = false;




  /// toggle properties of side bar

  forwarderShow = false;

  public filters: object = {
    price: this.priceMinMax
  };
  public searchCriteria: any;
  isNVOCC: boolean = false

  constructor(
    private _store: Store<any>,
    private _cookieService: CookieService
  ) { }

  ngOnInit() {
    // this.loadFilter = true

    this.$fclSearchResults = this._store.select('lcl_air')
    this.searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))
    if (this.searchResult && this.searchResult.length > 0) {
      this.setNVOCC()
      this.setAllRanges();
      // this.setOldMoreoptions();
      this.setNumberOfStops();
      this.setDistinctCarriers();
      // this.setOldETA();
      // this.setOldFreeTime();
      this.leftPanelFilteration()
    }
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

  setOldCarrierList() {
    this.carrierList = JSON.parse(this._cookieService.getCookie('carrierList'))
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
    let maxArrival = 0
    if (this.searchCriteria.searchMode === 'air-lcl') {
      maxArrival = Math.max(...this.searchResult.map(o => o.MinTransitDays));
    } else {
      maxArrival = Math.max(...this.searchResult.map(o => o.EtaInDays));
    }
    let minArrival = 0
    if (this.searchCriteria.searchMode === 'air-lcl') {
      minArrival = Math.min(...this.searchResult.map(o => o.MinTransitDays));
    } else {
      minArrival = Math.min(...this.searchResult.map(o => o.EtaInDays));
    }

    if (maxArrival === minArrival) {
      minArrival--;
    }

    this.arrivalMinMax = [minArrival, maxArrival]
    this.tempArrivalMinMax = [minArrival, maxArrival]

    this.arrivalRange = [minArrival, maxArrival]

    this.minArrival = Math.round(minArrival)
    this.maxArrival = Math.round(maxArrival)

    //set Free time at Port
    let maxTimeAtPort = Math.max(...this.searchResult.map(o => o.FreeTimeAtPort));
    let minTimeAtPort = Math.min(...this.searchResult.map(o => o.FreeTimeAtPort));

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
    this.leftPanelFilteration()
  }

  paymentFilter(index) {
    this.paymentList[index].isChecked = !this.paymentList[index].isChecked
    this.leftPanelFilteration()
  }

  onPriceRangeChange(slider, event) {
    // this.priceRange = slide; Old

    // New-start
    slider.onFinish = event;
    this.priceRange[0] = event.from
    this.priceRange[1] = event.to
    // New-end

    this.leftPanelFilteration()
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

    this.leftPanelFilteration()
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

    this.leftPanelFilteration()
  }



  toggleFreight() {
    this.showToggleFreight = !this.showToggleFreight;
    this.buttonToggleFreight = (this.showToggleFreight) ? "Hide" : "Show";
  }

  toggleTime() {
    this.toggleTimePort = !this.toggleTimePort;
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
    // this.buttonEstimateTime = (this.showEstimateTime) ? "Hide" : "Show";
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
    if (this.searchResult && this.searchResult.length > 0) {
      if (this._cookieService.getCookie('carrierList')) {
        this.setOldCarrierList()
      }
      else {
        const sortedResult = this.searchResult.sort(compareValues('CarrierID', "asc"));
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
    this.leftPanelFilteration()
  }

  onNoRestrictions() {
    this.isNoRestrictions = !this.isNoRestrictions
    this._cookieService.setCookie('isNoRestrictions', this.isNoRestrictions + '', 1)
    this.leftPanelFilteration()
  }

  onHasDeals() {
    this.isHashDeals = !this.isHashDeals
    this._cookieService.setCookie('isHashDeals', this.isHashDeals + '', 1)
    this.leftPanelFilteration()
  }

  onTenDays() {
    // this.isHashDeals = !this.isHashDeals
    this.leftPanelFilteration()
  }
  onThirtyDays() {
    // this.isHashDeals = !this.isHashDeals
    this.leftPanelFilteration()
  }
  onSixtyDays() {
    // this.isHashDeals = !this.isHashDeals
    this.leftPanelFilteration()
  }
  onNintyDays() {
    // this.isHashDeals = !this.isHashDeals
    this.leftPanelFilteration()
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
    this.leftPanelFilteration();
  }

  leftPanelFilteration() {
    loading(true);
    // tranist time filteration
    let minArrival = Math.round(this.arrivalRange[0])
    let maxArrival = Math.round(this.arrivalRange[1])
    if (this.searchCriteria.searchMode === 'air-lcl') {
      try {
        this.searchResultFiltered = this.searchResult
          .filter((r: SearchResult) => r.MinTransitDays >= minArrival && r.MinTransitDays <= maxArrival);
      } catch (error) { }
    } else {
      this.searchResultFiltered = this.searchResult
        .filter((r: SearchResult) => r.EtaInDays >= minArrival && r.EtaInDays <= maxArrival);
    }

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


    if (tmpShipArr.length > 0) {
      this.searchResultFiltered = this.searchResultFiltered
        .filter(x => tmpShipArr.includes(x.CarrierID));
    } else {
      this.searchResultFiltered = this.searchResultFiltered
    }

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
    if (tmpRouteArray && tmpRouteArray.length > 0 ) {
      this.searchResultFiltered = this.searchResultFiltered
        .filter(x => tmpRouteArray.includes(x.TransfersStop));
    }
    this._store.dispatch(new fromLclAir.UpdateLCLAirViewSearchResult(this.searchResultFiltered))
  }

  onShipClick(index) {
    if (index === -1) {
      this.carrierList.forEach(e => {
        e.isChecked = false;
      })
    } else {
      this.carrierList[index].isChecked = !this.carrierList[index].isChecked
    }
    this.setNewCarrierList();
    this.leftPanelFilteration()
  }

  getRoundedValue(value: number) {
    return Math.round(value)
  }

  Forwardtoggle() {
    this.forwarderShow = !this.forwarderShow;
  }

  toggleClass() {
    this.isActive = !this.isActive;
  }

  layoverScrollClass() {
    this.layoverScroll = !this.layoverScroll;
  }

  getFlightTime(time: number) {
    return getTimeStr(time)
  }

  getCarrierImage($image: string) {
    if (isJSON($image)) {
      const providerImage = JSON.parse($image)
      return baseExternalAssets + '/' + providerImage[0].DocumentFile
    } else {
      return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
    }
  }
}
