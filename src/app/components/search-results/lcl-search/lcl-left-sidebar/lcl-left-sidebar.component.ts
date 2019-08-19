import { Component, OnInit, ViewChildren, OnDestroy } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { DataService } from '../../../../services/commonservice/data.service';
import { CookieService } from '../../../../services/cookies.injectable';
import { HashStorage, removeDuplicates, loading, getSearchCriteria, filterByType } from '../../../../constants/globalfunctions';
import { SearchResult } from '../../../../interfaces/searchResult';
import * as fromLclShipping from '../store'
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { SearchCriteria } from '../../../../interfaces/searchCriteria';
import { untilDestroyed } from 'ngx-take-until-destroy';
@Component({
  selector: 'app-lcl-left-sidebar',
  templateUrl: './lcl-left-sidebar.component.html',
  styleUrls: ['./lcl-left-sidebar.component.scss'],
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
export class LclLeftSidebarComponent implements OnInit, OnDestroy {


  // public providersResult: SearchResult[];
  public searchResult: SearchResult[];
  public searchResultFiltered: SearchResult[];
  public providersResult: any = [];
  public freighFilterObject = [];
  public experienceResults: any = [];

  public providerList = [];
  public paymentList: any = [];
  public carrierList: any = [];

  public priceMinMax = [1, 99999];
  public arrivalMinMax = [1, 99];
  public freeTimeMinMax = [0, 200];

  public tempPriceMinMax = [1, 99999];
  public tempArrivalMinMax = [1, 99];
  public tempFreeTimeMinMax = [0, 200];

  public priceRange = this.priceMinMax;
  public arrivalRange = this.arrivalMinMax;
  public freeTimeRange = this.freeTimeMinMax;

  public minPriceRange: number = 0
  public maxPriceRange: number = 0

  public show: boolean = true;

  public carrierCount: number = 0;
  public carrierlimit: number = 9;

  public providerCount: number = 0; // total count of # of providers
  public providerlimit: number = 3; // limit of providers to show without more in ui
  public showMoreProvider: boolean = false //this is used to handle show more
  public moreProvPostFilter: number = 0 //this is used to handle show more


  public paymentCount: number = 0;
  public paymentLimit: number = 4;

  public showToggleFreight: boolean = true;
  public buttonToggleFreight: string;


  public toggleTimePort: boolean = true;
  public btntoggleTimePort: string;


  public showLayover: boolean = true;
  public buttonLayover: string;

  public showNumStops: boolean = true;
  public buttonNumStops: string;

  public showRange: boolean = true;
  public buttonRange: string;


  public showEstimateTime: boolean = true;
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
  public isFiveChecked: boolean = false
  public isTenChecked: boolean = false
  public isTwentyChecked: boolean = false
  public isMoreChecked: boolean = false

  public showToggleExperience: boolean = true;
  public buttonToggleExperience: string;




  public providerSearchInput;
  public paymentSearchInput;
  public layoverSearchInput;


  // class Toggle function
  public isActive = false;
  public layoverScroll = false;


  /// toggle properties of side bar

  forwarderShow = false;

  @ViewChildren('providerListView') providerListView;

  Forwardtoggle() {
    this.forwarderShow = !this.forwarderShow;
  }

  toggleProviderChange() {
    this.showMoreProvider = !this.showMoreProvider;
  }

  layoverScrollClass() {
    this.layoverScroll = !this.layoverScroll;
  }

  toggleExperience() {
    this.showToggleExperience = !this.showToggleExperience;
    this.buttonToggleExperience = (this.showToggleExperience) ? "Hide" : "Show";
  }



  public currencyCode: string = 'AED'

  public filters: object = {
    price: this.priceMinMax
  };

  public $fclSearchResults: Observable<fromLclShipping.LclShippingState>
  searchCriteria: SearchCriteria

  constructor(
    private _dataService: DataService,
    private _cookieService: CookieService,
    private _store: Store<any>
  ) { }


  loadFilter: boolean = true

  ngOnInit() {
    this.providerCount = 0
    this.$fclSearchResults = this._store.select('lcl_shippings')

    this.loadFilter = true
    this.searchCriteria = getSearchCriteria()

    this.$fclSearchResults.pipe(untilDestroyed(this)).subscribe(state => {

      const { data, loaded, isSearchUpdate, isMainResultModified, isViewResultModified } = state

      if (loaded && data && this.loadFilter) {
        const { mainsearchResult } = data
        if (mainsearchResult && mainsearchResult.length > 0) {
          this.providersResult = mainsearchResult
          this.setAllRanges();
          this.setDistinctFreightForwarders();
          this.setDistinctCarriers();
          this.setDistinctPaymentDues();
          this.setCachedOldOptions()
          if (this.loadFilter) {
            this.leftPanelFilteration()
          }
          this.loadFilter = false
        }
      }
      if (isSearchUpdate && isMainResultModified && data && data.mainsearchResult && data.mainsearchResult.length > 0) {
        const { mainsearchResult } = data
        this.providersResult = mainsearchResult
        this.setPriceRange(mainsearchResult)
        this.leftPanelFilteration()
      }

    })




    this._dataService.forwardCurrencyCode.subscribe((currCode: any) => {
      this.currencyCode = currCode
    })
  }

  setCachedOldOptions() {
    try {
      const oldisFiveChecked = this._cookieService.getCookie('isFreeCancelable')
      if (oldisFiveChecked) {
        this.isFreeCancelable = JSON.parse(oldisFiveChecked)
      }
    } catch (error) { }
  }


  setPriceRange(providerList) {
    //Set Price Range
    let maxPrice = Math.max(...providerList.map(o => o.TotalPrice));
    let minPrice = Math.min(...providerList.map(o => o.TotalPrice));

    if (maxPrice === minPrice) {
      minPrice--;
    }

    this.priceMinMax[0] = minPrice;
    this.priceMinMax[1] = maxPrice;
    this.tempPriceMinMax[0] = minPrice
    this.tempPriceMinMax[1] = maxPrice

    this.priceRange[0] = minPrice;
    this.priceRange[1] = maxPrice;

    this.minPriceRange = minPrice
    this.maxPriceRange = maxPrice
  }




  setAllRanges() {
    //Set Price Range
    let maxPrice = Math.max(...this.providersResult.map(o => o.TotalPrice));
    let minPrice = Math.min(...this.providersResult.map(o => o.TotalPrice));

    if (maxPrice === minPrice) {
      minPrice--;
    }

    this.priceMinMax[0] = minPrice;
    this.priceMinMax[1] = maxPrice;
    this.tempPriceMinMax[0] = minPrice
    this.tempPriceMinMax[1] = maxPrice

    this.priceRange[0] = minPrice;
    this.priceRange[1] = maxPrice;

    this.minPriceRange = minPrice
    this.maxPriceRange = maxPrice

    //set Time of Arrival
    let maxArrival = Math.max(...this.providersResult.map(o => o.EtaInDays));
    let minArrival = Math.min(...this.providersResult.map(o => o.EtaInDays));

    if (maxArrival === minArrival) {
      minArrival--;
    }

    this.arrivalMinMax[0] = minArrival;
    this.arrivalMinMax[1] = maxArrival;
    this.tempArrivalMinMax[0] = minArrival
    this.tempArrivalMinMax[1] = maxArrival

    this.arrivalRange[0] = minArrival;
    this.arrivalRange[1] = maxArrival;

    //set Free time at Port
    let maxTimeAtPort = Math.max(...this.providersResult.map(o => o.FreeTimeAtPort));
    let minTimeAtPort = Math.min(...this.providersResult.map(o => o.FreeTimeAtPort));

    if (maxTimeAtPort === minTimeAtPort) {
      minTimeAtPort--;
    }

    this.freeTimeMinMax[0] = minTimeAtPort;
    this.freeTimeMinMax[1] = maxTimeAtPort;

    this.tempFreeTimeMinMax[0] = minTimeAtPort
    this.tempFreeTimeMinMax[1] = maxTimeAtPort

    this.freeTimeRange[0] = minTimeAtPort;
    this.freeTimeRange[1] = maxTimeAtPort;

  }



  provideFilter(index) {
    this.providerList[index].isChecked = !this.providerList[index].isChecked;
    const { providerList } = this
    this._cookieService.setCookie('providerList', JSON.stringify(providerList) + '', 1)
    this.leftPanelFilteration()
  }

  providerModelChange($change) {
    try {
      const { providerList } = this
      const filtProvider = filterByType(providerList, "ProviderName", $change)
      this.providerCount = filtProvider.length
    } catch (error) {
    }
  }


  paymentFilter(index) {
    this.paymentList[index].isChecked = !this.paymentList[index].isChecked;
    const { paymentList } = this
    this._cookieService.setCookie('paymentList', JSON.stringify(paymentList) + '', 1)
    this.leftPanelFilteration()
  }

  experienceFilterFilter(index) {
    this.experienceResults[index].isChecked = !this.experienceResults[index].isChecked;
    this.leftPanelFilteration()
  }

  onPriceRangeChange(slider, event) {

    // New-start
    slider.onFinish = event;
    this.priceRange[0] = event.from
    this.priceRange[1] = event.to
    // New-end

    this._cookieService.setCookie('fromPriceRange', this.arrivalRange[0] + '', 1)
    this._cookieService.setCookie('toPriceRange', this.arrivalRange[1] + '', 1)

    this.leftPanelFilteration()
  }

  onPriceRangeSelectedChange(event) {
    this.minPriceRange = event.from
    this.maxPriceRange = event.to
  }

  onArrivalRangeChange(slider, event) {

    slider.onFinish = event;
    this.arrivalRange[0] = event.from
    this.arrivalRange[1] = event.to
    this.leftPanelFilteration()
  }

  onFreeTimeChange(slider, event) {
    slider.onFinish = event;
    this.freeTimeRange[0] = event.from
    this.freeTimeRange[1] = event.to
    this.leftPanelFilteration()
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
    this.showMoreShip = !this.showMoreShip;
    this.buttonMore = (this.showMoreShip) ? "Hide" : "Show";
  }

  toggleShipLines() {
    this.showMoreShip = !this.showMoreShip;
  }

  setDistinctFreightForwarders() {
    if (this.providersResult != null) {

      if (this.setCachedProviders()) { return }

      this.providerList = []
      this.providerCount = 0;
      this.moreProvPostFilter = 0;
      let freightForwarderList = removeDuplicates(this.providersResult, "ProviderName");
      let pIndex = 0
      freightForwarderList.map((x, k) => {
        this.providerList.push({
          ProviderID: x.ProviderID,
          ProviderName: x.ProviderName,
          ProviderImage: x.ProviderImage,
          pIndex: pIndex
        });
        pIndex++
        this.providerCount++;
        this.moreProvPostFilter++;
      });
    }
  }

  setDistinctCarriers() {
    if (this.providersResult != null) {
      let CarrierList = removeDuplicates(this.providersResult, "CarrierName");

      CarrierList.map((x, k) => {
        this.carrierList.push({ "CarrierID": x.CarrierID, "CarrierImage": x.CarrierImage, "CarrierName": x.CarrierName, "isChecked": true });
        this.carrierCount++;
      });
    }
  }

  setDistinctPaymentDues() {
    if (this.providersResult != null) {
      if (this.setCachedPayment()) { return }
      this.paymentList = []
      this.paymentList.push({ "CreditDays": 0, "strCreditDays": 'Pay on delivery', "isChecked": false });
      this.paymentList.push({ "CreditDays": 30, "strCreditDays": '30 days credit', "isChecked": false });
      this.paymentList.push({ "CreditDays": 60, "strCreditDays": '60 days credit', "isChecked": false });
      this.paymentList.push({ "CreditDays": 90, "strCreditDays": '90 days credit', "isChecked": false });
      this.paymentCount = 2
    }
  }

  onFreeCancelable() {
    this.isFreeCancelable = !this.isFreeCancelable
    this._cookieService.setCookie('isFreeCancelable', this.isFreeCancelable + '', 1)
    this.leftPanelFilteration()
  }

  onNoRestrictions() {
    this.isNoRestrictions = !this.isNoRestrictions
    this.leftPanelFilteration()
  }

  onHasDeals() {
    this.isHashDeals = !this.isHashDeals
    this.leftPanelFilteration()
  }

  onExperienceChange(event) {
    this.isFiveChecked = !this.isFiveChecked;
    this.leftPanelFilteration()
  }

  paymentMoreLess() {
    if (this.paymentLimit == 4) {
      this.paymentLimit = this.paymentCount;
    }
    else {
      this.paymentLimit = 4;
    }
  }

  withoutStop = true;
  oneStop = true;
  twoStops = true;
  twoPlusStops = false;

  noOfStopClick(val: number) {

    if (val === 0) {
      if (!this.withoutStop) { this.withoutStop = true }
      else { this.withoutStop = false }
    } else if (val === 1) {
      if (!this.oneStop) { this.oneStop = true }
      else { this.oneStop = false }
    } else if (val === 2) {
      if (!this.twoStops) { this.twoStops = true }
      else { this.twoStops = false }
    } else if (val === 3) {
      if (!this.twoPlusStops) { this.twoPlusStops = true }
      else { this.twoPlusStops = false }
    }

    // applying left panel filteration
    this.leftPanelFilteration();
  }

  leftPanelFilteration() {
    loading(true);
    // Total Price Filter
    let minPrice = this.priceRange[0]
    let maxPrice = this.priceRange[1]

    this.searchResultFiltered = this.providersResult
      .filter((r) => r.TotalPrice >= minPrice && r.TotalPrice <= maxPrice);

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

    // Credit Days Filter
    let tmpPaymentArr = [];
    this.paymentList.map((x, k) => {
      if (x.isChecked === true) {
        tmpPaymentArr.push(x.CreditDays);
      }
    })

    if (tmpPaymentArr.length > 0) {
      this.searchResultFiltered = this.searchResultFiltered
        .filter(x => tmpPaymentArr.includes(x.CreditDays));
    }

    // Experience Filter

    let tmpExpArr = [];

    // <5 years
    if (this.isFreeCancelable) {
      this.searchResultFiltered.forEach((element) => {
        if (element.IsFreeCancellation) {
          tmpExpArr.push(element);
        } else {
          tmpExpArr.push(0);
        }
      });
    }
    if (tmpExpArr.length > 0) {
      this.searchResultFiltered = this.searchResultFiltered
        .filter(x => tmpExpArr.includes(x.IsFreeCancellation));
    }

    // this._dataService.setProvidersData(this.searchResultFiltered);
    this._store.dispatch(new fromLclShipping.UpdateLCLShippingViewSearchResult(this.searchResultFiltered))
  }

  onShipClick(index) {
    this.carrierList[index].isChecked = !this.carrierList[index].isChecked
    this.leftPanelFilteration()
  }

  async onProviderChange() {
    setTimeout(() => {
      const value2 = this.providerListView.toArray().length
      this.moreProvPostFilter = value2
    }, 0);
  }

  setCachedPayment(): boolean {
    let isSet = false
    try {
      //set Provider List
      const oldCarriers = this._cookieService.getCookie('paymentList')
      if (oldCarriers && JSON.parse(oldCarriers).length > 0) {
        this.paymentList = JSON.parse(oldCarriers)
        isSet = true
      }
    } catch (error) {
      isSet = false
    }
    return isSet
  }

  setCachedProviders(): boolean {
    let isSet = false
    try {
      //set Provider List
      const oldProviders = this._cookieService.getCookie('providerList')
      if (oldProviders && JSON.parse(oldProviders).length > 0) {
        this.providerList = JSON.parse(oldProviders)
        this.providerCount = this.providerList.length;
        this.moreProvPostFilter = this.providerList.length;
        isSet = true
      }
    } catch (error) {
      isSet = false
    }
    return isSet
  }

  ngOnDestroy() { }

}
