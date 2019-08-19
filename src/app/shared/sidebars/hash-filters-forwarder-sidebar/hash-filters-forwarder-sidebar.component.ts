import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { SearchResult, ProvidersSearchResult } from '../../../interfaces/searchResult';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { CookieService } from '../../../services/cookies.injectable';
import { removeDuplicates, compareValues, loading, getImagePath, ImageSource, ImageRequiredSize, HashStorage, getProviderImage, filterByType, isJSON } from '../../../constants/globalfunctions';
import * as fromLclAir from '../../../components/search-results/air-search/store'
import * as fromWarehousing from '../../../components/search-results/warehousing-search/store'
import { DataService } from '../../../services/commonservice/data.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { WarehouseSearchResult } from '../../../interfaces/warehouse.interface';
import { baseExternalAssets } from '../../../constants/base.url';

@Component({
  selector: 'app-hash-filters-forwarder-sidebar',
  templateUrl: './hash-filters-forwarder-sidebar.component.html',
  styleUrls: ['./hash-filters-forwarder-sidebar.component.scss'],
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
export class HashFiltersForwarderSidebarComponent implements OnInit, OnDestroy {

  // @Input() providersResult: SearchResult[];
  @Input() providersResult: any[] = [];
  public searchCriteria: any;
  public searchResultFiltered: any[] = [];
  public freighFilterObject = [];
  public experienceResults: any = [];

  public neighbourList = [];
  public paymentList: any = [];
  public providerList: Array<any> = [];

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
  public neighbourCount: number = 0; // total count of # of neighbours
  public providerlimit: number = 3; // limit of providers to show without more in ui
  public showMoreProvider: boolean = false //this is used to handle show more


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
  public showCompanies: boolean = true;
  public buttonShipLine: string;

  public showMore: boolean = true;
  public buttonMore: string;
  public buttonMoreCompanies: string;
  public buttonMoreOrigin: string;
  public buttonMoreDestination: string;

  public isFreeCancelable: boolean = false
  public isNoRestrictions: boolean = false
  public isHashDeals: boolean = false
  public isFiveChecked: boolean = false
  public isTenChecked: boolean = false
  public isTwentyChecked: boolean = false
  public isMoreChecked: boolean = false

  // Billing Checks
  public isDailyChecked: boolean = false
  public isWeeklyChecked: boolean = false
  public isMonthlyChecked: boolean = false
  public isQuarterlyChecked: boolean = false
  public isYearlyChecked: boolean = false

  // More Checks
  public isBondedChecked: boolean = false;
  public isTempChecked: boolean = false;
  public isTransportChecked: boolean = false;
  public isDealChecked: boolean = false;

  public showToggleExperience: boolean = true;
  public showToggleDeals: boolean = true;
  public buttonToggleExperience: string;


  public showMinimumBooking: boolean = true;
  public buttonMinimumBooking: string;


  public providerSearchInput;
  public paymentSearchInput;
  public layoverSearchInput;


  // class Toggle function
  public isActive = false;
  public layoverScroll = false;


  /// toggle properties of side bar

  forwarderShow = false;
  public showOrigin: boolean = true;
  public showDestination: boolean = true;

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

  toggleOrigin() {
    this.showOrigin = !this.showOrigin;
    this.buttonMoreOrigin = (this.showOrigin) ? "Hide" : "Show";
  }

  toggleDestination() {
    this.showDestination = !this.showDestination;
    this.buttonMoreDestination = (this.showDestination) ? "Hide" : "Show";
  }

  miniBooking() {
    this.showMinimumBooking = !this.showMinimumBooking;
    this.buttonMinimumBooking = (this.showMinimumBooking) ? "Hide" : "Show";
  }

  toggleDeals() {
    this.showToggleDeals = !this.showToggleDeals;
    this.buttonToggleExperience = (this.showToggleDeals) ? "Hide" : "Show";
  }



  public currencyCode: string = 'AED'

  public filters: object = {
    price: this.priceMinMax
  };


  loadFilters: boolean = true
  public $fclProviderResults: Observable<fromLclAir.FclForwarderState>
  public $warehousingResults: Observable<fromWarehousing.WarehousingState>
  public destinationList: any = []
  public originList: any = []
  public originListView: any = []
  public destinationListView: any = []

  constructor(
    private _dataService: DataService,
    private _cookieService: CookieService,
    private store: Store<any>
  ) { }



  ngOnInit() {
    this.providerCount = 0
    this.loadFilters = true
    this.searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))
    const { searchMode } = this.searchCriteria
    if (searchMode === 'warehouse-lcl') {
      this.$warehousingResults = this.store.select('warehousing_shippings')
      this.$warehousingResults.pipe(untilDestroyed(this)).subscribe(state => {
        const { data, loaded, isSearchUpdate, isMainResultModified } = state

        if (loaded && data && this.loadFilters) {
          const { mainsearchResult } = data

          this.providersResult = mainsearchResult
          if (mainsearchResult && mainsearchResult.length > 0) {
            this.setCurrencyCode(mainsearchResult[0].CurrencyCode)
          }
          this.setAllRanges();
          this.setDistinctNeighbours();
          this.setDistinctFreightForwarders();
          this.setDistinctPaymentDues();
          this.loadFilters = false
        }

        if (isSearchUpdate && isMainResultModified) {
          const { mainsearchResult } = data

          if (mainsearchResult && mainsearchResult.length > 0) {
            this.setCurrencyCode(mainsearchResult[0].CurrencyCode)
          }
          this.setPriceRange(mainsearchResult)
          this.providersResult = mainsearchResult
        }
      })
    } else {
      this.$fclProviderResults = this.store.select('lcl_air_forwarder')

      this.$fclProviderResults.pipe(untilDestroyed(this)).subscribe(state => {

        const { data, loaded, isSearchUpdate, isMainResultModified } = state

        if (loaded && data && this.loadFilters) {
          this.loadFilters = false
          const { mainProvidersList } = data
          this.providersResult = mainProvidersList
          this.setAllRanges();
          this.setDistinctFreightForwarders();
          this.setDistinctPaymentDues();
          this.setCachedExp()
          if (this.searchCriteria.pickupPortType.toLowerCase() === 'ground') {
            this.setOriginList();
          }
          if (this.searchCriteria.deliveryPortType.toLowerCase() === 'ground') {
            this.setDestinationList();
          }
          this.leftPanelFilteration()
        }

        if (isSearchUpdate && isMainResultModified) {
          const { mainProvidersList } = data
          if (mainProvidersList && mainProvidersList.length > 0) {
            this.setCurrencyCode(mainProvidersList[0].CurrencyCode)
          }
          this.providersResult = mainProvidersList
          this.setPriceRange(mainProvidersList)
          this.leftPanelFilteration()
        }
      })
    }
  }


  setCurrencyCode($code: string) {
    this.currencyCode = $code
  }

  setDestinationList() {
    this.providersResult.forEach(e => {
      e.JsonDestinationPorts.forEach(element => {
        element.ProviderID = e.ProviderID;
      })
      this.destinationList.push(...e.JsonDestinationPorts);
      this.destinationList.forEach(element => {
        element.isChecked = false;
      });
      this.destinationListView = removeDuplicates(this.destinationList, "PodSeaID");
    })
  }

  setOriginList() {
    this.providersResult.forEach(e => {
      e.JsonOriginPorts.forEach(element => {
        element.ProviderID = e.ProviderID;
      })
      this.originList.push(...e.JsonOriginPorts);
      this.originList.forEach(element => {
        element.isChecked = false;
      });
    })
    this.originListView = removeDuplicates(this.originList, "PolSeaID");
  }

  setPriceRange($providersResult: Array<any>) {
    const providersResult: Array<any> = $providersResult
    let maxPrice = 0
    let minPrice = 0

    //Set Price Range
    if (this.searchCriteria.searchMode === 'air-lcl') {
      maxPrice = Math.max(...providersResult.map(o => o.MaxTotalPrice));
      minPrice = Math.min(...providersResult.map(o => o.MinTotalPrice));
    } else {
      maxPrice = Math.max(...providersResult.map(o => o.TotalPrice));
      minPrice = Math.min(...providersResult.map(o => o.TotalPrice));
    }


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
    const { providersResult } = this
    this.setPriceRange(providersResult)
    //set Time of Arrival
    let maxArrival = Math.max(...providersResult.map(o => o.EtaInDays));
    let minArrival = Math.min(...providersResult.map(o => o.EtaInDays));

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
    let maxTimeAtPort = Math.max(...providersResult.map(o => o.FreeTimeAtPort));
    let minTimeAtPort = Math.min(...providersResult.map(o => o.FreeTimeAtPort));

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


  desinationFilter(index) {
    this.destinationList.forEach(element => {
      if (this.destinationList[index].PodSeaID === element.PodSeaID) {
        let idx = this.destinationList.indexOf(element);
        this.destinationList[idx].isChecked = !this.destinationList[idx].isChecked;
      }
    });
    this.leftPanelFilteration()
  }

  originFilter(index) {
    this.originList.forEach(element => {
      if (this.originList[index].PolSeaID === element.PolSeaID) {
        let idx = this.originList.indexOf(element);
        this.originList[idx].isChecked = !this.originList[idx].isChecked;
      }
    });
    this.leftPanelFilteration()
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



  neighbourFilter(index) {
    this.neighbourList[index].isChecked = !this.neighbourList[index].isChecked;

    this.leftPanelFilteration()
  }

  paymentFilter(index) {
    this.paymentList[index].isChecked = !this.paymentList[index].isChecked;
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
    this.showCompanies = !this.showCompanies;
    this.buttonMoreCompanies = (this.showCompanies) ? "Hide" : "Show";
  }

  setDistinctFreightForwarders() {
    if (this.providersResult != null) {

      if (this.setCachedProviders()) {  return }

      let freightForwarderList = removeDuplicates(this.providersResult, "ProviderName");
      let pIndex = 0
      freightForwarderList.map((x, k) => {
        this.providerList.push({
          ProviderID: x.ProviderID,
          ProviderName: x.ProviderName,
          ProviderImage: x.ProviderImage,
          isChecked: false,
          pIndex: pIndex
        });
        pIndex++
        this.providerCount++;
      });
    }
  }


  setDistinctNeighbours() {
    const { providersResult } = this
    if (providersResult != null) {
      let neighList = removeDuplicates(providersResult, "WHNeighborhood");

      neighList.map((element, k) => {
        // this.neighbourList.push({ "ProviderID": x.ProviderID, "ProviderName": x.ProviderName, "ProviderImage": x.ProviderImage });
        this.neighbourList.push({
          "WHNeighborhood": element.WHNeighborhood,
          "WHNeighborhoodCode": element.WHNeighborhoodCode,
          "WHNeighborhoodID": element.WHNeighborhoodID
        });
        this.neighbourCount++;
      });

    }
  }

  setDistinctProvider() {
    const { providersResult } = this

    if (providersResult[0] != null) {
      let ProviderList = removeDuplicates(providersResult, "ProviderName");
      let pIndex: number = 0
      ProviderList.map((x, k) => {
        this.providerList.push({
          ProviderID: x.ProviderID,
          ProviderImage: x.ProviderImage,
          ProviderName: x.ProviderName,
          isChecked: false,
          pIndex: pIndex
        });
        pIndex++
        this.providerCount++;
      });
    }
  }

  setDistinctPaymentDues() {
    const { providersResult } = this
    if (providersResult != null) {
      this.paymentList.push({ "CreditDays": 10, "strCreditDays": '10 Days', "isChecked": false });
      this.paymentList.push({ "CreditDays": 30, "strCreditDays": '30 Days', "isChecked": false });
      this.paymentList.push({ "CreditDays": 60, "strCreditDays": '60 Days', "isChecked": false });
      this.paymentList.push({ "CreditDays": 90, "strCreditDays": '90 Days', "isChecked": false });
      this.paymentCount = 2
    }
  }

  onFreeCancelable() {
    this.isFreeCancelable = !this.isFreeCancelable
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

  onExperienceChange(number) {
    if (number === 5) {
      this.isFiveChecked = !this.isFiveChecked
      this._cookieService.setCookie('isFiveChecked', this.isFiveChecked + '', 1)
    } else if (number === 10) {
      this.isTenChecked = !this.isTenChecked
      this._cookieService.setCookie('isTenChecked', this.isTenChecked + '', 1)
    } else if (number === 20) {
      this.isTwentyChecked = !this.isTwentyChecked
      this._cookieService.setCookie('isTwentyChecked', this.isTwentyChecked + '', 1)
    } else if (number === 30) {
      this.isMoreChecked = !this.isMoreChecked
      this._cookieService.setCookie('isMoreChecked', this.isMoreChecked + '', 1)
    }
    this.leftPanelFilteration()
  }

  onBillingChange(type: string) {
    if (type === 'daily') {
      this.isDailyChecked = !this.isDailyChecked
    } else if (type === 'weekly') {
      this.isWeeklyChecked = !this.isWeeklyChecked
    } else if (type === 'monthly') {
      this.isMonthlyChecked = !this.isMonthlyChecked
    } else if (type === 'quarterly') {
      this.isQuarterlyChecked = !this.isQuarterlyChecked
    } else if (type === 'yearly') {
      this.isYearlyChecked = !this.isYearlyChecked
    }
    // this.leftPanelFilteration()
  }

  onMoreChange(type: string) {
    if (type === 'bonded') {
      this.isBondedChecked = !this.isBondedChecked
    } else if (type === 'temp') {
      this.isTempChecked = !this.isTempChecked
    } else if (type === 'transport') {
      this.isTransportChecked = !this.isTransportChecked
    } else if (type === 'deal') {
      this.isDealChecked = !this.isDealChecked
    }
    this.leftPanelFilteration()
  }

  // providerMoreLess() {
  //   if (this.providerlimit == 4) {
  //     this.providerlimit = this.providerCount;
  //   }
  //   else {
  //     this.providerlimit = 4;
  //   }
  // }

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
    const { providersResult } = this
    let searchResultFiltered: any = providersResult as any
    if (this.searchCriteria.searchMode !== 'warehouse-lcl') {
      searchResultFiltered = searchResultFiltered.filter((r) => r.MinTotalPrice >= minPrice && r.MaxTotalPrice <= maxPrice);
    } else if (this.searchCriteria.searchMode === 'warehouse-lcl') {
      searchResultFiltered = searchResultFiltered.filter((r) => r.TotalPrice >= minPrice && r.TotalPrice <= maxPrice);
    }
    // provider (Freight Forwarder) filter
    let tmpProviderArr = [];
    this.providerList.map((x, k) => {
      if (x.isChecked === true) {
        tmpProviderArr.push(x.ProviderID);
      }
    })
    if (tmpProviderArr.length > 0) {
      searchResultFiltered = searchResultFiltered.filter(x => tmpProviderArr.includes(x.ProviderID));
    }

    // neighbour (Freight Forwarder) filter
    tmpProviderArr = [];
    this.neighbourList.map((x, k) => {
      if (x.isChecked === true) {
        tmpProviderArr.push(x.WHNeighborhoodID);
      }
    })
    if (tmpProviderArr.length > 0) {
      searchResultFiltered = searchResultFiltered.filter(x => tmpProviderArr.includes(x.WHNeighborhoodID));
    }

    // Destination Filter
    let tempProviderDestinationArr = []
    this.destinationList.map((x, k) => {
      if (x.isChecked === true) {
        tempProviderDestinationArr.push(x.ProviderID);
      }
    })
    if (tempProviderDestinationArr.length > 0) {
      this.searchResultFiltered = this.searchResultFiltered
        .filter(x => tempProviderDestinationArr.includes(x.ProviderID));
    }

    // Origin Filter
    let tempProviderOriginArr = []
    this.originList.map((x, k) => {
      if (x.isChecked) {
        tempProviderOriginArr.push(x.ProviderID);
      }
    })
    if (tempProviderOriginArr.length > 0) {
      this.searchResultFiltered = this.searchResultFiltered
        .filter(x => tempProviderOriginArr.includes(x.ProviderID));
    }


    // Credit Days Filter
    let tmpPaymentArr = [];
    this.paymentList.map((x, k) => {
      if (x.isChecked === true) {
        tmpPaymentArr.push(x.CreditDays);
      }
    })

    if (tmpPaymentArr.length > 0) {
      searchResultFiltered = searchResultFiltered
        .filter(x => tmpPaymentArr.includes(x.CreditDays));
    }


    // Experience Filter

    if (this.searchCriteria.searchMode !== 'warehouse-lcl') {
      let tmpExpArr = [];
      // <5 years
      if (this.isFiveChecked) {
        searchResultFiltered.forEach((element) => {
          if (element.ProviderBusYear && element.ProviderBusYear < 5) {
            tmpExpArr.push(element.ProviderBusYear);
          } else {
            tmpExpArr.push(0);
          }
        });
      }
      // 5-10 years
      if (this.isTenChecked) {
        searchResultFiltered.forEach((element) => {
          if (element.ProviderBusYear !== null && element.ProviderBusYear >= 5 && element.ProviderBusYear < 10) {
            tmpExpArr.push(element.ProviderBusYear);
          } else {
            tmpExpArr.push(0);
          }
        });
      }
      // 10-20 years
      if (this.isTwentyChecked) {
        searchResultFiltered.forEach((element) => {
          if (element.ProviderBusYear !== null) {
            if (element.ProviderBusYear >= 10 && element.ProviderBusYear <= 20) {
              tmpExpArr.push(element.ProviderBusYear);
            } else {
              tmpExpArr.push(0);
            }
          }
        });
      }
      // 20+ years
      if (this.isMoreChecked) {
        searchResultFiltered.forEach((element) => {
          if (element.ProviderBusYear !== null && element.ProviderBusYear > 20) {
            tmpExpArr.push(element.ProviderBusYear);
          } else {
            tmpExpArr.push(0);
          }
        });
      }

      if (tmpExpArr.length > 0) {
        searchResultFiltered = searchResultFiltered
          .filter(x => tmpExpArr.includes(x.ProviderBusYear));
      }
    } else if (this.searchCriteria.searchMode === 'warehouse-lcl') {

      // More Filter
      // isBondedChecked
      if (this.isBondedChecked) {
        searchResultFiltered = searchResultFiltered
          .filter(x => x.IsBondedWarehouse === this.isBondedChecked);
      }
      // isTempChecked
      if (this.isTempChecked) {
        searchResultFiltered = searchResultFiltered
          .filter(x => x.IsTempratureControlled === this.isTempChecked);
      }
      // isTransportChecked
      if (this.isTransportChecked) {
        searchResultFiltered = searchResultFiltered
          .filter(x => x.IsTransportAvailable === this.isTransportChecked);
      }
      // isDealChecked
      if (this.isDealChecked) {
        searchResultFiltered = searchResultFiltered
          .filter(x => x.HasDeal === this.isDealChecked);
      }

    }

    if (this.searchCriteria.searchMode === 'warehouse-lcl') {
      this.store.dispatch(new fromWarehousing.UpdateWarehousingViewSearchResult(searchResultFiltered))
    } else {
      this.store.dispatch(new fromLclAir.UpdateFCLAirForwarderViewSearchResult(searchResultFiltered))
    }

  }

  onShipClick(index) {
    if (index === -1) {
      this.providerList.forEach(e => {
        e.isChecked = false;
      })
    } else {
      this.providerList[index].isChecked = !this.providerList[index].isChecked
    }
    this.leftPanelFilteration()
  }

  getCarrierImage($image: string) {
    // const providerImage = getProviderImage($image)
    // return getImagePath(ImageSource.FROM_SERVER, providerImage, ImageRequiredSize.original)
    if (isJSON($image)) {
      const providerImage = JSON.parse($image)
      return baseExternalAssets + '/' + providerImage[0].DocumentFile
    } else {
      return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
    }
  }

  setCachedProviders(): boolean {
    let isSet = false
    try {
      //set Provider List
      const oldProviders = this._cookieService.getCookie('providerList')
      if (oldProviders && JSON.parse(oldProviders).length > 0) {
        this.providerList = JSON.parse(oldProviders)
        this.providerCount = this.providerList.length;
        isSet = true
      }
    } catch (error) {
      isSet = false
    }
    return isSet
  }

  setCachedExp() {
    try {
      this.isFiveChecked = JSON.parse(this._cookieService.getCookie('isFiveChecked'))
      this.isTenChecked = JSON.parse(this._cookieService.getCookie('isTenChecked'))
      this.isTwentyChecked = JSON.parse(this._cookieService.getCookie('isTwentyChecked'))
      this.isMoreChecked = JSON.parse(this._cookieService.getCookie('isMoreChecked'))
    } catch (error) { }
  }

  setCachedPriceRange() {
    //Set Price Range
    const oldPriceRange0 = this._cookieService.getCookie('fromPriceRange')
    if (oldPriceRange0 && parseFloat(oldPriceRange0) > 0) {
      this.priceRange[0] = parseFloat(oldPriceRange0)
      this.minPriceRange = this.priceRange[0]

    }
    const oldPriceRange1 = this._cookieService.getCookie('toPriceRange')
    if (oldPriceRange1 && parseFloat(oldPriceRange1) > 0) {
      this.priceRange[1] = parseFloat(oldPriceRange1)
      this.maxPriceRange = this.priceRange[1]
    }
  }

  ngOnDestroy() {

  }

}
