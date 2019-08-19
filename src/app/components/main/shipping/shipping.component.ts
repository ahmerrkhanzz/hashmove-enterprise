/// <reference types="@types/googlemaps" />
import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  NgZone,
  OnDestroy,
  Input,
  ViewChildren,
  QueryList,
} from "@angular/core";
import {
  NgbDateParserFormatter, NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";
import { NgbDateFRParserFormatter } from "../../../constants/ngb-date-parser-formatter";
import {
  FormGroup,
  FormControl,
  AbstractControl,
  FormBuilder,
  Validators
} from "@angular/forms";
import { Router, ActivatedRoute, NavigationStart } from "@angular/router";
import { SearchCriteria, SearchCriteriaContainerDetail, GeocoderAddressComponent, SearchCriteriaPickupGroundDetail, SearchCriteriaGroundDetailAddressComponents, SearchCriteriaDropGroundDetail } from "./../../../interfaces/searchCriteria";
import { PagesService } from "../../pages.service";
import { ShippingService } from "./shipping.service";
import { HttpErrorResponse } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import * as moment from "moment";
import { ToastrService } from "ngx-toastr";
import { DataService } from "../../../services/commonservice/data.service";
import {
  HashStorage,
  feet2String,
  loading,
  getLoggedUserData,
  Tea,
  cloneObject,
  kFormatter
} from "../../../constants/globalfunctions";
import { CookieService } from "../../../services/cookies.injectable";
import { Store } from "@ngrx/store";
import * as fromLclShipping from "../../search-results/lcl-search/store";
import * as fromFclShipping from "../../search-results/fcl-search/store";
import { untilDestroyed } from "ngx-take-until-destroy";
import * as fromLclAir from "../../search-results/air-search/store";
import {
  ShippingArray,
  Container,
  LclChip
} from "../../../interfaces/shipping.interface";
import { JsonResponse } from "../../../interfaces/JsonResponse";
import { MapsAPILoader } from "@agm/core";
import { CurrencyControl } from "../../../shared/currency/currency.injectable";
import { NgbDate } from "@ng-bootstrap/ng-bootstrap/datepicker/ngb-date";
import { getCachedTrucks, removeCachedTrucks } from "./truck/truck.component";
import { SetupService } from "../../../shared/setup/setup.injectable";
import { LeftSidebarComponent } from "../../search-results/fcl-search/left-sidebar/left-sidebar.component";
import { DropDownService } from "../../../services/dropdownservice/dropdown.service";
import { of } from "rxjs";
declare var $

@Component({
  selector: "app-shipping",
  templateUrl: "./shipping.component.html",
  styleUrls: ["./shipping.component.scss"],
  providers: [
    PagesService,
    ShippingService,
    ToastrService,
    { provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter }
  ],
  encapsulation: ViewEncapsulation.None,
  host: {
    "(document:click)": "closeDatepicker($event)"
  }
})
export class ShippingComponent implements OnInit, OnDestroy {
  // [x: string]: any;

  //Main Boxes
  @ViewChild("pickupBox") pickupBox: ElementRef;
  @ViewChild("deliverBox") deliverBox: ElementRef;
  @ViewChild("calenderField") calenderField: any;

  //Sea Elemtns
  @ViewChild("portPickup") portPickup: ElementRef;
  @ViewChild("portDropOff") portDropOff: ElementRef;

  //Door Elements
  @ViewChild("inpDoorPickupSea") inpDoorPickupSea: ElementRef;
  @ViewChild("inpDoorDeliverySea") inpDoorDeliverySea: ElementRef;

  //Misc-Utils
  @ViewChild("d") eventDate;

  @Input() type?: string;

  currentOrientation = "horizontal";
  public noParent: boolean = true; // For focus purpose only
  public isDiable: boolean = false;
  public tempSearchCriteria: any = {};
  public showFields: boolean = false;
  public flexDays: number = 3;
  public shippingArray: Array<ShippingArray> = [];
  public containersArray: any;
  public selectedMode: ShippingArray;
  public selectedCategory: any;
  public selectedModeId: number;
  public selectedCatId: number = 100;
  public containerZoom: number;
  public selectedCatCode: string;
  public selectedSubCatId: number;
  public subCategory: any;
  public ports: any;
  public selectedContainer: any;
  public SearchCriteriaContainerDetail: any = [];
  public containerCount: any = 0;
  public containerQuantity: any;
  public showAddedContainers: boolean = false;
  public dynamicLeft: any;
  public triangle: any;
  public showCountTop: boolean = false;
  public pickupDate: any = {
    year: null,
    month: null,
    day: null
  };
  displayMonths = 2;
  navigation = "select";
  showWeekNumbers = false;
  currentJustify = "justified";
  public pickupDropdown: any = "Show";
  public minDate: any;
  public maxDate: any;
  public show2: boolean = false;
  public pickupDropdown2: any = "show2";
  public showPickupDropdown: boolean = false;
  public showDeliveryDropdown: boolean = false;
  public searchCriteria: SearchCriteria;
  public excludeElement: string;
  public selectedCriteria: any;
  public SearchReset: boolean = false;
  public resp;
  public portValidation: boolean;
  public unitsResponse: any;
  public FCLContainers: Array<Container> = [];
  public LCLContainers: Array<Container> = [];
  // public FTLContainers: Array<Container> = [];
  // public LTLContainers: Array<Container> = [];
  public totalCBM: number;
  public defaultCBMValues = {
    m: 1,
    cm: 100,
    ft: 3.28084,
    mm: 1000,
    in: 39.3701
  };
  public shipmentVolumetricWeight: string;
  public validatedCBM: number;

  public pickup: PickupDropOff = {
    title: "", //tooltip only
    imageName: ""
  };
  public delivery: PickupDropOff = {
    title: "", //tooltip only
    imageName: ""
  };
  public searchTransportDetails: any = {
    modeOfTransportID: 100,
    modeOfTransportCode: "By Sea",
    modeOfTransportDesc: "By Sea"
  };
  public selectedContainerObj: any = {
    contSpecID: 0,
    contRequestedQty: 0
  };
  public totalShipment: any;
  public suppressScrollX = true;
  public loading: boolean;
  public calenderToggle: boolean = false;
  public calenderDisplay: any;

  public $fclSearchResults: Observable<fromFclShipping.FclShippingState>;
  public $lclSearchResults: Observable<fromLclShipping.LclShippingState>;
  public $lclAirSearchResults: Observable<fromLclAir.LclAirState>;

  // LCL Vars
  activeTab: string = "fcl";
  public addedLCLPackages: Array<LclChip> = [];
  public LCLSinglePackages: Array<LclChip> = [];
  public lclForm: FormGroup;
  public quantity: AbstractControl;
  public length: AbstractControl;
  public width: AbstractControl;
  public height: AbstractControl;
  public weight: AbstractControl;
  public volume: AbstractControl;
  public totalWeight: AbstractControl;
  public lengthUnit: AbstractControl;
  public weightUnit: AbstractControl;
  public volumeUnit: AbstractControl;
  public totalWeightUnit: AbstractControl;
  public lclFields: any = {
    quantity: 0,
    lengthUnitID: 2,
    weightUnitID: 6,
    volumeUnitID: 1
  };
  public lclContainerCount: number;
  public maxVolume: number;
  public lengthUnits = [];
  public weightUnits = [];
  public selectedLengthUnit: number;
  public selectedWeightUnit;
  public selectedVolumeUnit;
  public volumeUnits = [];
  public total = [];
  public subTotal = [];
  public calcualtedTotalWeight: number;
  public validatedLength: boolean = true;
  public selectedLengthUnitID: number = 2;
  public selectedWeightUnitID: number = 6;
  public selectedVolumeUnitID: number = 9;
  public selectedAreaUnitID: number = 13;
  public formValidation = {
    invalid: false,
    message: ""
  };
  public formValidation2: any = {
    invalid: false,
    message: ""
  };

  public activeContainerTabID: string = "fcl";
  public hideLCL_FCL: boolean = false;
  public showMainCategory: boolean = true;
  public strSelectedMode: string = "SEA";
  public selectedShippingModeID: number = 100;
  public searchMode: string = "sea-fcl";
  public toggleLabel: string = 'By Total Shipment';

  // searchMode = sea-fcl | sea-lcl | air-lcl

  public portCaptionList: Array<TransportModeCaption> = [
    {
      transModeCode: "SEA",
      strPickup: "FROM SEA PORT",
      strPickupIcon: "icon_anchor.svg",
      strPickupParentIcon: "icon_anchor.svg",
      strDeliver: "DELIVERY AT PORT",
      strDeliverIcon: "icon_anchor.svg",
      strDeliverParentIcon: "icon_anchor.svg",
    },
    {
      transModeCode: "AIR",
      strPickup: "FROM AIR PORT",
      strPickupIcon: "icon_plane.svg",
      strPickupParentIcon: "icon_plane.svg",
      strDeliver: "DELIVERY AT AIR PORT",
      strDeliverIcon: "icon_plane.svg",
      strDeliverParentIcon: "icon_plane.svg"
    },
    {
      transModeCode: "TRUCK",
      strPickup: "FROM SEA PORT",
      strPickupIcon: "icon_anchor.svg",
      strPickupParentIcon: "icon_anchor.svg",
      strDeliver: "DELIVERY AT PORT",
      strDeliverIcon: "icon_anchor.svg",
      strDeliverParentIcon: "icon_anchor.svg",
    }
  ];
  public selectedModeCaption: TransportModeCaption = {
    transModeCode: "SEA",
    strPickup: "FROM SEA PORT",
    strPickupIcon: "icon_anchor.svg",
    strPickupParentIcon: "icon_anchor.svg",
    strDeliver: "DELIVERY AT PORT",
    strDeliverIcon: "icon_anchor.svg",
    strDeliverParentIcon: "icon_anchor.svg"
  };
  public lclData = [];
  public TransportMode: string = "SEA";
  public totalVolumetricWeight: number;
  public volumetricWeight: number;

  //extended Sea Port Work by Hassan
  public showSeaPortPickup: boolean = false
  public showSeaPortDelivery: boolean = false
  public selectedModeIcon: string = 'icon_anchor.svg'

  //Door Work
  public showDoorPickupSea: boolean = false
  public showDoorDropSea: boolean = false
  public doorPickupSea: string = ''
  public doorDropSea: string = ''
  public deliveryPortType: string = 'SEA'
  public pickupPortType: string = 'SEA'
  public isModeChange: boolean = false
  public trucks = []
  public searchInpForm: any
  public deliveryPortName: any
  public showValidation: any
  public loginUser: any
  public customerSettings: any = {}

  @ViewChildren('inpContainerCount') $inpContainerCount: QueryList<any>;


  constructor(
    private _shippingService: ShippingService,
    private router: Router,
    private _toast: ToastrService,
    private _fb: FormBuilder,
    private dataService: DataService,
    private _cookieService: CookieService,
    private store: Store<any>,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private _currencyControl: CurrencyControl,
    private _setupService: SetupService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _dropdownservice: DropDownService,
    private _parserFormatter: NgbDateParserFormatter
  ) {
    this.searchCriteria = new SearchCriteria();
    this.lclForm = _fb.group({
      quantity: [
        "",
        Validators.compose([Validators.required, Validators.min(1)])
      ],
      length: [
        "",
        Validators.compose([Validators.required, Validators.min(1)])
      ],
      width: ["", Validators.compose([Validators.required, Validators.min(1)])],
      height: [
        "",
        Validators.compose([Validators.required, Validators.min(1)])
      ],
      weight: [
        "",
        Validators.compose([Validators.required, Validators.min(1)])
      ],
      weightUnit: [""],
      lengthUnit: new FormControl(0),
      volumeUnit: [""],
      totalWeightUnit: [""],
      volume: ["", Validators.compose([Validators.min(1)])],
      totalWeight: ["", Validators.compose([Validators.min(1)])]
    });
    this.quantity = this.lclForm.controls["quantity"];
    this.length = this.lclForm.controls["length"];
    this.width = this.lclForm.controls["width"];
    this.height = this.lclForm.controls["height"];
    this.weight = this.lclForm.controls["weight"];
    this.volume = this.lclForm.controls["volume"];
    this.weightUnit = this.lclForm.controls["weightUnit"];
    this.lengthUnit = this.lclForm.controls["lengthUnit"];
    this.volumeUnit = this.lclForm.controls["volumeUnit"];
    this.totalWeightUnit = this.lclForm.controls["totalWeightUnit"];
    this.totalWeight = this.lclForm.controls["totalWeight"];
    this.searchInpForm = new FormGroup({
      pickupData: new FormControl("", [Validators.required]),
      deliveryData: new FormControl("", [Validators.required]),
      dateData: new FormControl("", [Validators.required]),
    })

    this._router.events
      .filter(event => event instanceof NavigationStart)
      .subscribe((event: NavigationStart) => {
        if (event instanceof NavigationStart) {
          this._cookieService.deleteCookies()
        };
      });
  }

  ngOnInit() {
    this.searchCriteria.deliveryPortType = this.deliveryPortType
    this.searchCriteria.pickupPortType = this.pickupPortType
    try {
      this.customerSettings = JSON.parse(HashStorage.getItem('customerSettings'))
      this.configureModalFields()
    } catch (error) { }
    this.removeAllGlow()
    this.blinkingInputs();
    this.getLCLUnits();
    // this.$fclSearchResults = this.store.select("fcl_shippings");
    this.$fclSearchResults = this.store.select("fcl_forwarder");
    this.$lclSearchResults = this.store.select("lcl_shippings");
    this.$lclAirSearchResults = this.store.select("lcl_air_forwarder");

    if (HashStorage) {
      this.shippingArray = JSON.parse(
        HashStorage.getItem("shippingCategories")
      ).filter(e => e.ShippingModeCode.toLowerCase() !== 'warehouse')
      this.shippingArray.forEach(shipping => {
        if (shipping.ShippingModeCode.toLowerCase() === "sea") {
          shipping.isActive = true;
        }
      });

      let date = new Date();
      this.minDate = {
        month: date.getMonth() + 1,
        day: date.getDate(),
        year: date.getFullYear()
      };
      this.maxDate = {
        year: ((this.minDate.month === 12 && this.minDate.day >= 17) ? date.getFullYear() + 1 : date.getFullYear()),
        month:
          moment(date)
            .add(30, "days")
            .month() + 1,
        day: moment(date)
          .add(30, "days")
          .date()
      };

      this.dataService.criteria.pipe(untilDestroyed(this)).subscribe(state => {
        const { isMod, from } = state
        if (from === 'ship') {
          this.SearchReset = isMod
          if (this.SearchReset) {
            let jsonString = HashStorage.getItem("searchCriteria");
            this.selectedCriteria = JSON.parse(jsonString);
          }
          this.dataService.modifySearch({ isMod: false, from: 'null' })
        }
      });

      let tempData = JSON.parse(HashStorage.getItem('tempSearchCriteria'))
      if (tempData && tempData.currentMode === 'shipment') {
        this.getTempData();
      } else {
        this.selectedModeId = this.shippingArray[0].ShippingModeID;
        if (!this.SearchReset) {
          this.selectedCatId = this.shippingArray[0].ShippingCriteriaCat[0].ShippingCatID;
          this.selectedCatCode = this.shippingArray[0].ShippingCriteriaCat[0].ShippingCatCode;
          this.subCategory = this.shippingArray[0].ShippingCriteriaCat[0].ShippingCriteriaSubCat;
          this.selectedSubCatId = this.subCategory[0].ShippingSubCatID;
          this.containersArray = this.subCategory[0].Containers;
          const tabOne = (this.selectedModeCaption.transModeCode.toLowerCase() === 'truck') ? 'FTL' : 'FCL'
          const tabTwo = (this.selectedModeCaption.transModeCode.toLowerCase() === 'truck') ? 'LTL' : 'LCL'

          this.FCLContainers = cloneObject(this.containersArray).filter(
            e => e.ContainerLoadType === tabOne
          );
          this.LCLContainers = this.containersArray.filter(
            e => e.ContainerLoadType === tabTwo
          );
          // this.FTLContainers = this.containersArray.filter(
          //   e => e.ContainerLoadType === "FTL"
          // );
          // this.LTLContainers = this.containersArray.filter(
          //   e => e.ContainerLoadType === "LTL"
          // );
          this.resetLclInputs();
          this.LCLContainers.forEach(e => {
            e.CBM = e.ContainterLength * e.ContainterWidth * e.ContainterHeight;
            e.LClContainerInputs.toggle = false;
          });
        }
        this.shippingArray.forEach(element => {
          if (element.ShippingModeID === this.selectedModeId)
            this.selectedMode = element;
        });
      }
      this.getPortDetails();
    }
    const externalLink = this._route.snapshot.queryParamMap.get('mode')
    if (externalLink && externalLink === 'air') {
      this.onRouteChangeForAir(101)
    } else if (externalLink && externalLink === 'truck') {
      this.onRouteChangeForAir(102)
    }
  }

  public selectedContainers = [];

  onRouteChangeForAir(id) {
    const prevShipArray: ShippingArray = this.shippingArray.find(
      ship => ship.ShippingModeID === id
    );
    const indexForShippingId: number = this.shippingArray.indexOf(prevShipArray);
    this.onShippingModeClick(prevShipArray, indexForShippingId, false);
  }

  selectedFields(obj: SearchCriteria) {

    const previosShippingModeId: number = obj.SearchCriteriaTransportationDetail[0].modeOfTransportID;
    const prevShipArray: ShippingArray = this.shippingArray.find(
      ship => ship.ShippingModeID === previosShippingModeId
    );
    const indexForShippingId: number = this.shippingArray.indexOf(prevShipArray);
    this.onShippingModeClick(prevShipArray, indexForShippingId, false);

    let selectedDate = new Date(obj.pickupDate);
    this.flexDays = obj.pickupFlexibleDays;
    this.searchCriteria.isSearchByCalender = obj.isSearchByCalender;
    this.pickupDate = {
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth() + 1,
      day: selectedDate.getDate()
    };
    this.selectedModeCaption = obj.selectedModeCaption
    console.log(obj);


    if (obj.deliveryPortType === 'CITY') {
      let pickupCity = {
        code: obj.userPickup.code,
        desc: obj.userPickup.desc,
        id: obj.userPickup.id,
        imageName: obj.userPickup.imageName,
        lastUpdate: obj.userPickup.lastUpdate,
        shortName: obj.userPickup.shortName,
        sortingOrder: obj.userPickup.sortingOrder,
        title: obj.userPickup.name,
        name: obj.userPickup.name,
        type: obj.userPickup.type,
        webURL: obj.userPickup.webURL
      }
      console.log(obj.userDelivery)
      let deliveryCity = {
        code: obj.userDelivery.code,
        desc: obj.userDelivery.desc,
        id: obj.userDelivery.id,
        imageName: obj.userDelivery.imageName,
        lastUpdate: obj.userDelivery.lastUpdate,
        shortName: obj.userDelivery.shortName,
        sortingOrder: obj.userDelivery.sortingOrder,
        title: obj.userDelivery.name,
        name: obj.userDelivery.name,
        type: obj.userDelivery.type,
        webURL: obj.userDelivery.webURL
      }
      setTimeout(() => {
        try {
          this.pickupBox.nativeElement.value = pickupCity.title
          this.deliverBox.nativeElement.value = deliveryCity.title
          this.delivery = deliveryCity
          this.pickup = pickupCity
        } catch (error) {
          console.log('yoloys');

        }
      }, 10);
      this.delivery = cloneObject(obj.userDelivery.title)
      this.searchCriteria.pickupPortID = pickupCity.id;
      this.searchCriteria.pickupPortCode = pickupCity.code;
      this.searchCriteria.pickupPortName = pickupCity.shortName;
      this.searchCriteria.pickupPortType = obj.pickupPortType
      this.searchCriteria.SearchCriteriaPickupGroundDetail = obj.SearchCriteriaPickupGroundDetail
      this.searchCriteria.deliveryPortID = deliveryCity.id;
      this.searchCriteria.deliveryPortCode = deliveryCity.code;
      this.searchCriteria.deliveryPortName = deliveryCity.shortName;
      this.searchCriteria.deliveryPortType = obj.deliveryPortType
      this.searchCriteria.SearchCriteriaDropGroundDetail = obj.SearchCriteriaDropGroundDetail
    } else {
      this.pickup = obj.userPickup
      this.searchCriteria.pickupPortID = this.pickup.id;
      this.searchCriteria.pickupPortCode = this.pickup.code;
      this.searchCriteria.pickupPortName = this.pickup.shortName;
      this.searchCriteria.pickupPortType = obj.pickupPortType
      this.searchCriteria.SearchCriteriaPickupGroundDetail = obj.SearchCriteriaPickupGroundDetail
      this.delivery = obj.userDelivery
      this.searchCriteria.deliveryPortID = this.delivery.id;
      this.searchCriteria.deliveryPortCode = this.delivery.code;
      this.searchCriteria.deliveryPortName = this.delivery.shortName;
      this.searchCriteria.deliveryPortType = obj.deliveryPortType
      this.searchCriteria.SearchCriteriaDropGroundDetail = obj.SearchCriteriaDropGroundDetail
    }




    this.selectedContainers = obj.SearchCriteriaContainerDetail;
    if (obj.containerLoad === "LCL" || obj.containerLoad === "LTL") {
      this.activeContainerTabID = "lcl";
    } else {
      this.activeContainerTabID = "fcl";
    }
    // this.searchTransportDetails = obj.SearchCriteriaContainerDetail[0]
    this.searchMode = obj.searchMode;
    this.TransportMode = obj.TransportMode;

    // if (this.TransportMode.toLowerCase() === 'air') {
    //   this.airInpData = obj.airChipData
    //   console.log(obj.airChipData);


    //   let selectedDate = new Date(obj.pickupDate);
    //   let deliverDate = new Date(obj.pickupDateTo);

    //   this.fromDate = {
    //     year: selectedDate.getFullYear(),
    //     month: selectedDate.getMonth() + 1,
    //     day: selectedDate.getDate()
    //   };
    //   this.toDate = {
    //     year: deliverDate.getFullYear(),
    //     month: deliverDate.getMonth() + 1,
    //     day: deliverDate.getDate()
    //   };

    //   const parsedDate = this._parserFormatter.format(this.fromDate) + " - " + this._parserFormatter.format(this.toDate);
    //   setTimeout(() => {
    //     try {
    //       this.calenderField.nativeElement.value = parsedDate;
    //     } catch (error) {
    //       console.warn(error);
    //     }
    //   }, 100);
    // }

    if (obj.TransportMode.toLowerCase() === 'sea' || obj.TransportMode.toLowerCase() === 'truck') {
      const selectedShipMode: ShippingArray = this.shippingArray.find(ship => ship.ShippingModeID === obj.shippingModeID)
      selectedShipMode.ShippingCriteriaCat.filter(item => {
        if (item.ShippingCatID == obj.shippingCatID) {
          const searchR: SearchCriteria = JSON.parse(HashStorage.getItem("searchCriteria"));

          this.selectedMode.ShippingCriteriaCat = selectedShipMode.ShippingCriteriaCat;
          this.selectedCatId = obj.shippingCatID;
          item.ShippingCriteriaSubCat.forEach((elem: any) => {
            if (elem.ShippingSubCatID == obj.shippingSubCatID) {
              this.subCategory = item.ShippingCriteriaSubCat;
              this.selectedSubCatId = obj.shippingSubCatID;
              this.containersArray = elem.Containers;

              const tabOne = (this.TransportMode.toLowerCase() === 'truck') ? 'FTL' : 'FCL'
              const tabTwo = (this.TransportMode.toLowerCase() === 'truck') ? 'LTL' : 'LCL'


              this.FCLContainers = cloneObject(this.containersArray).filter(
                e => e.ContainerLoadType === tabOne
              );
              this.LCLContainers = this.containersArray.filter(
                e => e.ContainerLoadType === tabTwo
              );

              this.LCLContainers.forEach(e => {
                e.LClContainerInputs = {
                  toggle: false
                };
              })

              const ftlTrucks: any = getCachedTrucks()
              if (ftlTrucks && this.TransportMode.toLowerCase() === 'truck') {
                this.FCLContainers = ftlTrucks.filter(
                  e => e.ContainerLoadType === tabOne
                );
              }


              if (searchR.LclChips) {
                this.addedLCLPackages = searchR.LclChips;
                this.LCLContainers.forEach(container => {
                  searchR.LclChips.forEach(e => {
                    if (e.contSpecID === container.ContainerSpecID) {
                      container.LClContainerInputs = {
                        toggle: e.toggle,
                        inpVolume: e.inpVolume,
                        inpTotalWeight: e.inpTotalWeight,
                        weightUnit: e.weightUnit,
                        volumeUnit: e.volumeUnit
                      }
                      this.selectedVolumeUnitID = e.volumeUnit;
                      this.selectedWeightUnitID = e.weightUnit;
                    }
                  })
                })
              }

              this.LCLContainers.forEach(e => {
                e.CBM =
                  e.ContainterLength * e.ContainterWidth * e.ContainterHeight;
              });
              if (obj.containerLoad === "FCL" || obj.containerLoad === "FTL") {
                this.FCLContainers.forEach(item => {
                  const parsedJsonContainerSpecProp = JSON.parse(item.JsonContainerSpecProp)
                  for (let i = 0; i < this.selectedContainers.length; i++) {
                    if (item.ContainerSpecID === this.selectedContainers[i].contSpecID && this.TransportMode.toLowerCase() !== 'truck') {
                      this.selectedContainerObj.contSpecID = this.selectedContainers[i].contSpecID;
                      this.selectedContainerObj.contRequestedQty = this.selectedContainers[i].contRequestedQty;
                      this.selectedContainerObj.contRequestedCBM = 0;
                      this.selectedContainerObj.contRequestedWeight = 0;
                      this.selectedContainerObj.IsTrackingApplicable = parsedJsonContainerSpecProp.IsTrackingApplicable;
                      this.selectedContainerObj.IsQualityApplicable = parsedJsonContainerSpecProp.IsQualityApplicable;
                      this.selectedContainerObj.containerDtl = item
                      item.selected = this.selectedContainers[i].contRequestedQty;
                      this.SearchCriteriaContainerDetail.push(this.selectedContainerObj);
                      this.selectedContainerObj = {};
                    } else if (this.TransportMode.toLowerCase() === 'truck') {
                      item.ContainerSubDetail.forEach(subCont => {
                        if (subCont.ContainerSpecID === this.selectedContainers[i].contSpecID) {
                          this.selectedContainerObj.contSpecID = this.selectedContainers[i].contSpecID;
                          this.selectedContainerObj.contRequestedQty = this.selectedContainers[i].contRequestedQty;
                          this.selectedContainerObj.contRequestedCBM = 0;
                          this.selectedContainerObj.contRequestedWeight = 0;
                          this.selectedContainerObj.IsTrackingApplicable = this.selectedContainers[i].IsTrackingApplicable;
                          this.selectedContainerObj.IsQualityApplicable = this.selectedContainers[i].IsQualityApplicable;
                          this.selectedContainerObj.containerDtl = item
                          item.selected = this.selectedContainers[i].contRequestedQty;
                          this.SearchCriteriaContainerDetail.push(cloneObject(this.selectedContainerObj))
                        }
                      })
                    }
                  }
                });
              } else if (obj.containerLoad === "LCL") {
                if (obj.TransportMode.toLowerCase() === "sea" || obj.TransportMode.toLowerCase() === "truck") {
                  this.LCLContainers.forEach(item => {
                    const parsedJsonContainerSpecProp = JSON.parse(item.JsonContainerSpecProp)
                    for (let i = 0; i < this.selectedContainers.length; i++) {
                      if (
                        item.ContainerSpecID ==
                        this.selectedContainers[i].contSpecID
                      ) {
                        this.selectedContainerObj.contSpecID = this.selectedContainers[i].contSpecID;
                        this.selectedContainerObj.contRequestedQty = this.selectedContainers[i].contRequestedQty;
                        this.selectedContainerObj.contRequestedCBM = this.selectedContainers[i].contRequestedCBM;
                        this.selectedContainerObj.volumetricWeight = this.selectedContainers[i].volumetricWeight;
                        this.selectedContainerObj.contRequestedWeight = this.selectedContainers[i].contRequestedWeight || 0;
                        this.selectedContainerObj.containerCode = this.selectedContainers[i].containerCode
                        this.selectedContainerObj.IsTrackingApplicable = parsedJsonContainerSpecProp.IsTrackingApplicable;
                        this.selectedContainerObj.IsQualityApplicable = parsedJsonContainerSpecProp.IsQualityApplicable;
                        this.selectedContainerObj.containerDtl = item
                        this.SearchCriteriaContainerDetail.push(
                          this.selectedContainerObj
                        );
                        this.selectedContainerObj = {};
                      }
                    }
                  });
                  this.LCLContainers.forEach(e => {
                    this.total = []
                    this.subTotal = []
                    this.addedLCLPackages.forEach(element => {
                      if (element.contSpecID === e.ContainerSpecID) {
                        let x = element.contRequestedCBM
                        this.total.push(x);
                        this.subTotal = this.total.reduce((all, item) => {
                          return all + item;
                        });
                        e.selected = this.subTotal;
                      }
                    });
                  });
                }
              }
            }
          });
        }
      });
    } else if (obj.TransportMode.toLowerCase() === 'air') {
      this.shippingArray[1].ShippingCriteriaCat.filter(item => {
        if (item.ShippingCatID == obj.shippingCatID) {
          this.selectedMode.ShippingCriteriaCat = this.shippingArray[0].ShippingCriteriaCat;
          this.selectedCatId = obj.shippingCatID;
          item.ShippingCriteriaSubCat.forEach((elem: any) => {
            if (elem.ShippingSubCatID == obj.shippingSubCatID) {
              this.subCategory = item.ShippingCriteriaSubCat;
              this.selectedSubCatId = obj.shippingSubCatID;
              this.containersArray = elem.Containers;

              const tabTwo = (this.selectedModeCaption.transModeCode.toLowerCase() === 'truck') ? 'LTL' : 'LCL'

              this.LCLContainers = this.containersArray.filter(
                e => e.ContainerLoadType === tabTwo
              );
              // this.LTLContainers = this.containersArray.filter(
              //   e => e.ContainerLoadType === "LCL"
              // );
              const searchR: SearchCriteria = JSON.parse(
                HashStorage.getItem("searchCriteria")
              );
              if (searchR.LclChips) {
                this.addedLCLPackages = searchR.LclChips;
                this.LCLContainers.forEach(container => {
                  searchR.LclChips.forEach(e => {
                    if (e.contSpecID === container.ContainerSpecID && e.toggle) {
                      container.LClContainerInputs.toggle = e.toggle;
                      container.LClContainerInputs.inpVolume = e.inpVolume;
                      container.LClContainerInputs.inpTotalWeight = e.inpTotalWeight;
                      container.LClContainerInputs.weightUnit = e.weightUnit
                      this.selectedVolumeUnitID = e.volumeUnit;
                      this.selectedWeightUnitID = e.weightUnit;
                      container.LClContainerInputs.volumeUnit = e.volumeUnit;
                    }
                  })
                })
              }
              // this.LCLContainers.forEach(item => {
              //   for (let i = 0; i < this.selectedContainers.length; i++) {
              //     if (
              //       item.ContainerSpecID ==
              //       this.selectedContainers[i].contSpecID
              //     ) {
              //       this.selectedContainerObj.contSpecID = this.selectedContainers[
              //         i
              //       ].contSpecID;
              //       this.selectedContainerObj.contRequestedQty = this.selectedContainers[
              //         i
              //       ].contRequestedQty;
              //       this.selectedContainerObj.contRequestedCBM = this.selectedContainers[
              //         i
              //       ].contRequestedCBM;
              //       this.selectedContainerObj.volumetricWeight = this.selectedContainers[
              //         i
              //       ].volumetricWeight;
              //       this.selectedContainerObj.contRequestedWeight =
              //         this.selectedContainers[i].contRequestedWeight || 0;
              //       this.selectedContainerObj.containerCode = this.selectedContainers[i].containerCode
              //       this.SearchCriteriaContainerDetail.push(
              //         this.selectedContainerObj);
              //       this.selectedContainerObj = {};
              //     }
              //   }
              // });
            }
            this.airInpData = obj.airChipData
          });
        }
      });
      // this.LCLContainers.forEach(e => {
      //   this.total = []
      //   this.subTotal = []
      //   this.addedLCLPackages.forEach(element => {
      //     if (element.contSpecID === e.ContainerSpecID) {
      //       let x = element.contRequestedWeight > element.volumetricWeight ? element.contRequestedWeight : element.volumetricWeight
      //       this.total.push(x);
      //       this.subTotal = this.total.reduce((all, item) => {
      //         return all + item;
      //       });
      //       e.selected = this.subTotal;
      //     }
      //   });
      // });

      const pickUpDateObj = new Date(obj.pickupDate);
      const dropDateObj = new Date(obj.pickupDateTo);
      this.searchCriteria.isSearchByCalender = obj.isSearchByCalender;
      this.fromDate = {
        year: pickUpDateObj.getFullYear(),
        month: pickUpDateObj.getMonth() + 1,
        day: pickUpDateObj.getDate()
      };
      this.toDate = {
        year: dropDateObj.getFullYear(),
        month: dropDateObj.getMonth() + 1,
        day: dropDateObj.getDate()
      };

    }
    this.calculateTotalShipment();
  }


  /**
   *
   * Convert Value to K,M format
   * @param {number} value
   * @returns
   * @memberof ShippingComponent
   */
  kFormatting(value) {
    return kFormatter(this._currencyControl.applyRoundByDecimal(value, 2))
  }

  getTempData() {
    let tempData = JSON.parse(HashStorage.getItem("tempSearchCriteria"));
    this.selectedModeCaption = tempData.selectedModeCaption
    this.searchTransportDetails = tempData.searchTransportDetails
    this.searchMode = tempData.searchMode
    this.addedLCLPackages = tempData.addedLCLPackages;

    this.pickup = tempData.pickup || this.pickup;
    this.delivery = tempData.delivery || this.delivery;
    this.pickupDate = tempData.pickupDate || {};
    this.activeContainerTabID = tempData.activeContainerTabID;
    this.SearchCriteriaContainerDetail = tempData.SearchCriteriaContainerDetail
    this.selectedShippingModeID = tempData.shippingModeID
    this.TransportMode = tempData.TransportMode
    this.shippingArray.forEach(mode => {
      if (mode.ShippingModeID === tempData.shippingModeID) {
        this.selectedModeId = mode.ShippingModeID;
        mode.isActive = true;
        this.selectedMode = mode;
        this.selectedCatId = tempData.shippingCatID;
        mode.ShippingCriteriaCat.forEach(cat => {
          if (cat.ShippingCatID === tempData.shippingCatID) {
            this.selectedCatId = tempData.shippingCatID;
            this.subCategory = cat.ShippingCriteriaSubCat;
            cat.ShippingCriteriaSubCat.forEach(subCat => {
              if (subCat.ShippingSubCatID === tempData.shippingSubCatID) {
                this.selectedSubCatId = subCat.ShippingSubCatID;
                this.containersArray = subCat.Containers;

                const tabOne = (this.selectedModeCaption.transModeCode.toLowerCase() === 'truck') ? 'FTL' : 'FCL'

                this.FCLContainers = cloneObject(this.containersArray).filter(
                  e => e.ContainerLoadType === tabOne
                );
                if (this.activeContainerTabID === 'fcl' && this.FCLContainers.length > 0) {
                  if (this.TransportMode.toLowerCase() !== 'truck') {
                    this.FCLContainers.forEach(contaienr => {
                      tempData.containers.forEach(tempCont => {
                        if (contaienr.ContainerSpecID === tempCont.contSpecID) {
                          contaienr.selected = tempCont.contRequestedQty
                        }
                      })
                    })
                  }

                  if (this.TransportMode.toLowerCase() === 'truck' && tabOne === 'FTL') {
                    const ftlTrucks: any = getCachedTrucks()
                    if (ftlTrucks && this.TransportMode.toLowerCase() === 'truck') {
                      this.FCLContainers = ftlTrucks.filter(
                        e => e.ContainerLoadType === tabOne
                      );
                    }
                  }
                }

                this.LCLContainers = tempData.lclData;
                this.LCLContainers.forEach(e => {
                  e.CBM =
                    e.ContainterLength * e.ContainterWidth * e.ContainterHeight;
                });
                this.calculateTotalShipment()
                // this.SearchCriteriaContainerDetail = [];
              }
            });
          }
        });
      } else {
        mode.isActive = false;
      }
    });

    this.searchCriteria.SearchCriteriaPickupGroundDetail = tempData.SearchCriteriaPickupGroundDetail
    this.searchCriteria.SearchCriteriaDropGroundDetail = tempData.SearchCriteriaDropGroundDetail
    this.searchCriteria.deliveryPortType = tempData.deliveryPortType
    this.searchCriteria.pickupPortType = tempData.pickupPortType
    this.searchCriteria.pickupPortCode = tempData.pickupPortType
    this.searchCriteria.deliveryPortCode = tempData.deliveryPortCode

    if (tempData.shippingModeID === 101) {
      this.hideLCL_FCL = true;
      this.activeContainerTabID = "lcl";
      this.showMainCategory = true;
      this.toggleLabel = 'By Total Volume'
      this.selectedModeIcon = 'icon_plane.svg'
      this.strSelectedMode = tempData.TransportMode
      this.TransportMode = tempData.TransportMode
      this.selectedShippingModeID = tempData.shippingModeID
      this.searchTransportDetails = {
        modeOfTransportID: tempData.shippingModeID,
        modeOfTransportCode: 'By Air',
        modeOfTransportDesc: 'By Air'
      };
    }
    const { pickup, delivery, pickupDate } = this
    const containerLenght = (this.SearchCriteriaContainerDetail) ? this.SearchCriteriaContainerDetail.length : 0

    let shouldGlow = false

    if (this.pickup.title || delivery.title || Object.keys(pickupDate).length) {
      shouldGlow = true
    }

    if (shouldGlow) {
      setTimeout(() => {
        if (!pickup.title) {
          this.pickupBox.nativeElement.classList.remove("blinking");
          this.pickupBox.nativeElement.classList.add("inputInvalid");
        }
        if (!delivery.title) {
          this.deliverBox.nativeElement.classList.remove("blinking");
          this.deliverBox.nativeElement.classList.add("inputInvalid");
        }
        if (
          !pickupDate ||
          (pickupDate && !Object.keys(pickupDate).length)
        ) {
          this.calenderField.nativeElement.classList.remove('blinking');
          // this.calenderField.nativeElement.classList.add("inputInvalid");
        }
      }, 0);
    }

    if (this.TransportMode.toLowerCase() === 'air') {
      this.airInpData = tempData.airChipData
      this.fromDate = tempData.pickupDate
      this.toDate = tempData.pickupDateTo

      try {
        const date1 = this._parserFormatter.format(this.fromDate)
        const date2 = this._parserFormatter.format(this.toDate)

        if (this.fromDate && this.fromDate.day && this.toDate && this.toDate.day) {
          const parsedDate = date1 + " - " + date2;
          setTimeout(() => {
            try {
              this.calenderField.nativeElement.value = parsedDate;
            } catch (error) {
              console.warn(error);

            }
          }, 100);
        }
      } catch (error) { }
    }
  }

  togglePortvalid(type, event) {
    if (typeof event === "object" && type === "pickup") {
      this.selectedModeCaption.strPickupParentIcon = this.selectedModeIcon
      this.toggle("pickup");
      this.noParent = true;
      this.pickupBox.nativeElement.classList.remove("blinking");
      if (!this.delivery.title) {
        this.deliverBox.nativeElement.classList.add("blinking");
        this.deliverBox.nativeElement.classList.remove("inputInvalid");
      }
    } else if (typeof event === "object" && type === "delivery") {
      this.selectedModeCaption.strDeliverParentIcon = this.selectedModeIcon
      this.toggle("deliver");
      this.deliverBox.nativeElement.classList.remove("blinking");
      try {
        let calenderElem = document.getElementById("hashDatepicker") as any;
        if (!calenderElem.value) {
          calenderElem.classList.add("blinking");
          // calenderElem.classList.remove("inputInvalid");
        }
      } catch (error) { }
      this.noParent = true;
      // document.getElementById('hashDatepicker').click();
    }
    this.portValidation = false;
  }
  toggle(type: string) {
    this.show2 = false;
    this.portValidation = false;
    if (type === "pickup") {
      this.showPickupDropdown = !this.showPickupDropdown;
      this.showDeliveryDropdown = false;
    } else if (type === "city") {
      this.showPickupDropdown = !this.showPickupDropdown;
      this.showDeliveryDropdown = false;
    } else if (type === "deliver") {
      if (!this.pickup.title) {
        this.pickupBox.nativeElement.classList.remove("blinking");
        this.pickupBox.nativeElement.classList.add("inputInvalid");
      }
      this.showDeliveryDropdown = !this.showDeliveryDropdown;
      this.showPickupDropdown = false;
    } else if (type === "selectPickup") {
      if (typeof this.pickup === "object") {
        this.showPickupDropdown = false;
        this.showDeliveryDropdown = false;
      } else {
        this.portValidation = true;
        this.show2 = true;
      }
    } else if (type === "selectDeliver") {
      if (typeof this.delivery === "object") {
        this.showPickupDropdown = false;
        this.showDeliveryDropdown = false;
      } else {
        this.portValidation = true;
        this.show2 = true;
      }
    }
  }

  showbutton($type: string) {
    if ($type === 'single') {
      this.calenderField.nativeElement.focus();
      const { pickup, delivery } = this
      if (!pickup.title) {
        this.pickupBox.nativeElement.classList.remove("blinking");
        this.pickupBox.nativeElement.classList.add("inputInvalid");
      }
      if (!delivery.title) {
        this.deliverBox.nativeElement.classList.remove("blinking");
        this.deliverBox.nativeElement.classList.add("inputInvalid");
      }
      setTimeout(() => {
        let element
        // if (this.type === 'vendor') {
        //   element = document.getElementsByClassName("d-block")[1];
        // } else {
        element = document.getElementsByClassName("ngb-dp-navigation-select")[0];
        // }
        let calenderBox = document.getElementsByTagName("ngb-datepicker")[0];
        this.calenderDisplay = !this.calenderDisplay;
        if (element) {
          element.innerHTML = "";
          let button = document.createElement("button");
          let button2 = document.createElement("button");
          let CustomDiv = document.createElement("div");
          let label = document.createElement("label");
          label.classList.add("switch");
          let sliderSpan = document.createElement("span");
          sliderSpan.classList.add("slider");
          CustomDiv.classList.add("flexible-dates");
          calenderBox.addEventListener("click", (e: Event) => {
            this.excludeElement = "ngb-datepicker";
            e.stopPropagation();
          });
          console.log(this.TransportMode);

          if (this.TransportMode.toLowerCase() !== 'truck') {
            let input = document.createElement("input");
            input.id = "flexible-toggle";

            input.setAttribute("type", "checkbox");
            input.setAttribute("checked", "checked");
            input.checked = (this.flexDays && this.flexDays !== -1) ? true : false;

            input.addEventListener("change", (e: Event) => {
              if ((<HTMLInputElement>e.target).checked) {
                this.flexDays = 3;
              } else {
                this.flexDays = 0;
              }
            });
            let span = document.createElement("span");
            button.classList.add("departure-button");
            button2.classList.add("reachBy-button");
            button.innerHTML = "DEPARTURE DATE";
            button2.innerHTML = "MUST REACH BY";
            span.innerHTML = `Flexible Dates  <img id="hm-datepicker-tp" data-toggle="tooltip" title="Will display results 14 days ahead of the selected date" src="../../../../../assets/images/icons/icon_info2 - grey.svg" width="16px">`;
            calenderBox.appendChild(CustomDiv);
            CustomDiv.appendChild(label);
            label.appendChild(input);
            label.appendChild(sliderSpan);
            CustomDiv.appendChild(span);
          }
          // $('hm-datepicker-tp').ready(function () {
          //   $('[data-toggle="tooltip"]').tooltip();
          // });

        }
      }, 0);
    } else {
      console.log('yolo');

      try {
        this.eventDate.toggle();
      } catch (error) {
        console.log(error);
      }
    }
  }

  onfocusremoveBlink(evt) {
    this.activeContainerId = -1;
    evt.currentTarget.classList.remove("blinking");
    evt.currentTarget.classList.remove("inputInvalid");
    if (evt.currentTarget.id === "typeahead-basic") {
      this.calenderField.nativeElement.classList.remove("blinking");
    }
  }

  removeAllGlow() {
    setTimeout(() => {
      this.pickupBox.nativeElement.classList.remove("blinking");
      this.pickupBox.nativeElement.classList.remove("inputInvalid");

      this.deliverBox.nativeElement.classList.remove("blinking");
      this.deliverBox.nativeElement.classList.remove("inputInvalid");

      this.calenderField.nativeElement.classList.remove("blinking");
      // this.calenderField.nativeElement.classList.remove("inputInvalid");
    }, 0);
  }


  checkInputData() {
    if (this.isModeChange) {
      return
    }

    if (!this.pickup.title) {
      this.pickupBox.nativeElement.classList.remove('blinking');
      this.pickupBox.nativeElement.classList.add('inputInvalid');
    }
    if (!this.delivery.title) {
      this.deliverBox.nativeElement.classList.remove('blinking');
      this.deliverBox.nativeElement.classList.add('inputInvalid');
    }

    if ((!this.pickupDate || (this.pickupDate && !Object.keys(this.pickupDate).length))) {

      this.calenderField.nativeElement.classList.remove('blinking');
      // this.calenderField.nativeElement.classList.add("inputInvalid");
    }
  }

  InputErrorValidate(from: string) {

    if (this.isModeChange) {
      return
    }

    setTimeout(() => {
      if (from === "port-pickup") {
        if (!this.pickup.title && !this.showPickupDropdown) {
          this.pickupBox.nativeElement.classList.add("inputInvalid");
        } else {
          this.pickupBox.nativeElement.classList.remove("blinking");
          this.pickupBox.nativeElement.classList.remove("inputInvalid");
        }
      }
      if (from === "port-drop") {
        if (!this.delivery.title && !this.showDeliveryDropdown) {
          this.deliverBox.nativeElement.classList.add("inputInvalid");
        } else {
          this.deliverBox.nativeElement.classList.remove("blinking");
          this.deliverBox.nativeElement.classList.remove("inputInvalid");
        }
      }
      if (from == "port-depart") {
        if (
          !this.pickupDate || (this.pickupDate && !Object.keys(this.pickupDate).length)
        ) {
          // this.calenderField.nativeElement.classList.add("inputInvalid");
        }
      }
    }, 0);
  }

  public isDateOpen: boolean = false

  closeDatepicker(e) {
    // let calenderBox = document.getElementsByTagName("ngb-datepicker")[0];
    if (e.clientX !== 0 && e.clientY !== 0 && e.target.id != "hashDatepicker" && this.isDateOpen) {
      this.eventDate.close();
      this.calenderToggle = false;
      this.isDateOpen = false
      if (!this.calenderToggle && this.calenderDisplay != undefined && this.isModeChange === false) {
        this.InputErrorValidate("port-depart");
      }
      this.noParent = true;
      if (this.showPickupDropdown || this.showDeliveryDropdown) {
        this.noParent = false;
      }
    }
    if (e.target.id === "hashDatepicker") {
      let calenderBox = document.getElementsByTagName("ngb-datepicker")[0];
      if (!calenderBox) {
        this.isDateOpen = true
        this.eventDate.open();
        this.calenderToggle = true;
        this.noParent = false;
      } else {
        this.eventDate.close();
        this.noParent = true;
      }
    }
  }

  onDateSelect(e) {
    this.searchCriteria.isSearchByCalender = true
    if (e) {
      this.noParent = true;
      this.eventDate.close();
    }
  }


  // Append google autocomplete to door pickup
  doorTodoor() {
    $(".pac-container.pac-logo").appendTo($("#pac-card"));
  }

  public searchCriteriaPickupGroundDetail: SearchCriteriaPickupGroundDetail

  public showCityPickupSea: boolean = false;
  public showSeaCityDelivery: boolean = false;
  toggle2(from, event, type: string) {
    this.show2 = !this.show2;
    this.noParent = false;
    event.stopPropagation();

    if (type === 'showSeaPortPickup') {
      this.showSeaPortPickup = true
      this.showDoorPickupSea = false
      this.showCityPickupSea = false

      // this.searchCriteria.SearchCriteriaPickupGroundDetail = null
      this.searchCriteria.pickupPortType = this.TransportMode
      this.pickupPortType = this.TransportMode

      setTimeout(() => {
        this.portPickup.nativeElement.focus();
        this.portPickup.nativeElement.select();
      }, 10);
    }

    if (type === 'showCityPickupSea') {
      this.showSeaPortPickup = false
      this.showDoorPickupSea = false
      this.showCityPickupSea = true

      // this.searchCriteria.SearchCriteriaPickupGroundDetail = null
      this.searchCriteria.pickupPortType = this.TransportMode
      this.pickupPortType = this.TransportMode

      // setTimeout(() => {
      //   this.portPickup.nativeElement.focus();
      //   this.portPickup.nativeElement.select();
      // }, 10);
    }

    if (type === 'showDoorPickupSea') {
      this.showDoorPickupSea = true
      this.showSeaPortPickup = false
      this.showCityPickupSea = false

      setTimeout(() => {
        this.inpDoorPickupSea.nativeElement.focus();
        this.inpDoorPickupSea.nativeElement.select();

        this.mapsAPILoader.load().then(
          () => {

            let autocomplete = new google.maps.places.Autocomplete(this.inpDoorPickupSea.nativeElement, { types: ['establishment'] });
            autocomplete.addListener("place_changed", () => {
              this.ngZone.run(() => {
                const pickupPlaces: google.maps.places.PlaceResult = autocomplete.getPlace();
                if (pickupPlaces.geometry === undefined || pickupPlaces.geometry === null) {
                  return;
                } else {
                  this.selectedModeCaption.strPickupParentIcon = 'Icons_Location.svg'
                  const newEmpty: any = {}

                  this.pickup = newEmpty
                  //Getting Required Data Start
                  const pickupName = pickupPlaces.name
                  const fAddress = pickupPlaces.formatted_address
                  const addressComponents: GeocoderAddressComponent[] = pickupPlaces.address_components

                  const latlong = {
                    lat: pickupPlaces.geometry.location.lat(),
                    lng: pickupPlaces.geometry.location.lng()
                  }


                  const filtered_array_country = pickupPlaces.address_components.filter(function (address_component) {
                    return address_component.types.includes("country");
                  });


                  const countryCode = filtered_array_country.length ? filtered_array_country[0].short_name : "";

                  //Getting Required Data End.....

                  let searchCriteriaGroundDtlComp: SearchCriteriaGroundDetailAddressComponents = {

                  }

                  if (filtered_array_country) {
                    searchCriteriaGroundDtlComp.LongName_L1 = filtered_array_country[0].long_name
                    searchCriteriaGroundDtlComp.ShortName_L1 = filtered_array_country[0].short_name
                    searchCriteriaGroundDtlComp.ComponentDesc_L1 = filtered_array_country[0].types + ''
                  }

                  const addCompLenght: number = addressComponents.length

                  for (let index = 1; index < addCompLenght; index++) {
                    const adComp = addressComponents[index]
                    if (index === 1) {
                      searchCriteriaGroundDtlComp.LongName_L2 = adComp.long_name
                      searchCriteriaGroundDtlComp.ShortName_L2 = adComp.short_name
                      searchCriteriaGroundDtlComp.ComponentDesc_L2 = adComp.types + ''
                    }
                    if (index === 2) {
                      searchCriteriaGroundDtlComp.LongName_L3 = adComp.long_name
                      searchCriteriaGroundDtlComp.ShortName_L3 = adComp.short_name
                      searchCriteriaGroundDtlComp.ComponentDesc_L3 = adComp.types + ''
                    }
                    if (index === 3) {
                      searchCriteriaGroundDtlComp.LongName_L4 = adComp.long_name
                      searchCriteriaGroundDtlComp.ShortName_L4 = adComp.short_name
                      searchCriteriaGroundDtlComp.ComponentDesc_L4 = adComp.types + ''
                    }
                    if (index === 4) {
                      searchCriteriaGroundDtlComp.LongName_L5 = adComp.long_name
                      searchCriteriaGroundDtlComp.ShortName_L5 = adComp.short_name
                      searchCriteriaGroundDtlComp.ComponentDesc_L5 = adComp.types + ''
                    }
                    if (index === 5) {
                      searchCriteriaGroundDtlComp.LongName_L6 = adComp.long_name
                      searchCriteriaGroundDtlComp.ShortName_L6 = adComp.short_name
                      searchCriteriaGroundDtlComp.ComponentDesc_L6 = adComp.types + ''
                    }
                  }

                  const SearchCriteriaPickupGroundDetail: SearchCriteriaPickupGroundDetail = {
                    Address: fAddress,
                    Lat: latlong.lat,
                    Lng: latlong.lng,
                    AddressComponents: searchCriteriaGroundDtlComp
                  }

                  this.pickup.code = "GROUND"
                  this.pickupPortType = "GROUND"
                  this.searchCriteria.pickupPortType = this.pickupPortType
                  this.searchCriteria.SearchCriteriaPickupGroundDetail = SearchCriteriaPickupGroundDetail

                  this.pickup.imageName = countryCode

                  this.pickup.title = pickupName
                  this.pickup.shortName = pickupName
                  this.showPickupDropdown = false
                  this.noParent = true
                }
              });
            });
          }
        );
      }, 10);



    }

    if (type === 'showSeaPortDelivery') {
      this.showSeaPortDelivery = true
      this.showDoorDropSea = false
      // this.searchCriteria.SearchCriteriaDropGroundDetail = null
      this.searchCriteria.deliveryPortType = this.TransportMode
      this.deliveryPortType = this.TransportMode

      setTimeout(() => {
        this.portDropOff.nativeElement.focus();
        this.portDropOff.nativeElement.select();
      }, 50);
    }

    if (type === 'showSeaCityDelivery') {
      this.showSeaPortDelivery = true
      this.showDoorDropSea = false
      // this.searchCriteria.SearchCriteriaDropGroundDetail = null
      this.searchCriteria.deliveryPortType = this.TransportMode
      this.deliveryPortType = this.TransportMode

      setTimeout(() => {
        this.portDropOff.nativeElement.focus();
        this.portDropOff.nativeElement.select();
      }, 50);
    }

    if (type === 'showDoorDropSea') {
      this.showDoorDropSea = true
      this.showSeaPortDelivery = false

      setTimeout(() => {
        this.inpDoorDeliverySea.nativeElement.focus();
        this.inpDoorDeliverySea.nativeElement.select();

        this.mapsAPILoader.load().then(
          () => {
            let autocomplete = new google.maps.places.Autocomplete(this.inpDoorDeliverySea.nativeElement, { types: ['establishment'] });
            autocomplete.addListener("place_changed", () => {
              this.ngZone.run(() => {
                let dropPlace: google.maps.places.PlaceResult = autocomplete.getPlace();
                if (dropPlace.geometry === undefined || dropPlace.geometry === null) {
                  return;
                } else {
                  //Getting Required Data Start
                  this.selectedModeCaption.strDeliverParentIcon = 'Icons_Location.svg'
                  const newEmpty: any = {}
                  this.delivery = newEmpty

                  const dropName = dropPlace.name
                  const fAddress = dropPlace.formatted_address
                  const addressComponents: GeocoderAddressComponent[] = dropPlace.address_components

                  const latlong = {
                    lat: dropPlace.geometry.location.lat(),
                    lng: dropPlace.geometry.location.lng()
                  }


                  const filtered_array_country = dropPlace.address_components.filter(function (address_component) {
                    return address_component.types.includes("country");
                  })

                  const countryCode = filtered_array_country.length ? filtered_array_country[0].short_name : "";

                  //Getting Required Data End.....
                  let searchCriteriaGroundDtlComp: SearchCriteriaGroundDetailAddressComponents = {

                  }

                  if (filtered_array_country) {
                    searchCriteriaGroundDtlComp.LongName_L1 = filtered_array_country[0].long_name
                    searchCriteriaGroundDtlComp.ShortName_L1 = filtered_array_country[0].short_name
                    searchCriteriaGroundDtlComp.ComponentDesc_L1 = JSON.stringify(filtered_array_country[0].types)
                  }

                  const addCompLenght: number = addressComponents.length

                  for (let index = 1; index < addCompLenght; index++) {
                    const adComp = addressComponents[index]
                    if (index === 1) {
                      searchCriteriaGroundDtlComp.LongName_L2 = adComp.long_name
                      searchCriteriaGroundDtlComp.ShortName_L2 = adComp.short_name
                      searchCriteriaGroundDtlComp.ComponentDesc_L2 = JSON.stringify(adComp.types)
                    }
                    if (index === 2) {
                      searchCriteriaGroundDtlComp.LongName_L3 = adComp.long_name
                      searchCriteriaGroundDtlComp.ShortName_L3 = adComp.short_name
                      searchCriteriaGroundDtlComp.ComponentDesc_L3 = JSON.stringify(adComp.types)
                    }
                    if (index === 3) {
                      searchCriteriaGroundDtlComp.LongName_L4 = adComp.long_name
                      searchCriteriaGroundDtlComp.ShortName_L4 = adComp.short_name
                      searchCriteriaGroundDtlComp.ComponentDesc_L4 = JSON.stringify(adComp.types)
                    }
                    if (index === 4) {
                      searchCriteriaGroundDtlComp.LongName_L5 = adComp.long_name
                      searchCriteriaGroundDtlComp.ShortName_L5 = adComp.short_name
                      searchCriteriaGroundDtlComp.ComponentDesc_L5 = JSON.stringify(adComp.types)
                    }
                    if (index === 5) {
                      searchCriteriaGroundDtlComp.LongName_L6 = adComp.long_name
                      searchCriteriaGroundDtlComp.ShortName_L6 = adComp.short_name
                      searchCriteriaGroundDtlComp.ComponentDesc_L6 = JSON.stringify(adComp.types)
                    }
                  }


                  const SearchCriteriaPickupGroundDetail: SearchCriteriaDropGroundDetail = {
                    Address: fAddress,
                    Lat: latlong.lat,
                    Lng: latlong.lng,
                    AddressComponents: searchCriteriaGroundDtlComp
                  }

                  this.delivery.code = "GROUND"
                  this.deliveryPortType = "GROUND"
                  this.searchCriteria.deliveryPortType = "GROUND"
                  this.searchCriteria.SearchCriteriaDropGroundDetail = SearchCriteriaPickupGroundDetail
                  this.delivery.imageName = countryCode

                  this.delivery.title = dropName
                  this.delivery.shortName = dropName
                  this.deliveryPortName = dropName
                  this.showDeliveryDropdown = false
                  this.noParent = true
                }
              });
            });
          }
        );
      }, 50);
    }

  }

  tabClick(catId, catCode, type, event) {
    this.activeContainerId = -1;
    if (
      this.SearchReset ||
      JSON.parse(HashStorage.getItem("tempSearchCriteria"))
    ) {
      let count =
        event.currentTarget.parentElement.parentElement.parentElement
          .parentElement.children;
      for (let i = 0; i < count.length; i++) {
        if (count[i].children[0].classList.length > 1) {
          count[i].children[0].classList.remove("active");
        }
      }
      event.currentTarget.parentElement.parentElement.classList.add("active");
    }
    if (type === "category") {
      this.selectedCatId = catId;
      this.selectedMode.ShippingCriteriaCat.forEach(element => {
        if (
          element.ShippingCatID === catId &&
          element.ShippingCatCode === catCode
        ) {
          this.selectedCategory = element;
          this.subCategory = this.selectedCategory.ShippingCriteriaSubCat;
          this.selectedSubCatId = this.subCategory[0].ShippingSubCatID;
          this.containersArray = this.subCategory.Containers;
        }
      });
    }
  }

  getContainerLenght(desc, length) {
    return desc + " " + feet2String(length);
  }

  getContainerInfo(container) {
    return ShippingComponent.getFclContDesc(container)
  }

  static getFclContDesc(container) {
    let containerInfo = {
      containerSize: undefined,
      containerWeight: undefined
    };
    containerInfo.containerWeight = container.MaxGrossWeight;
    containerInfo.containerSize =
      feet2String(container.ContainterLength) +
      ` x ` +
      feet2String(container.ContainterWidth) +
      ` x ` +
      feet2String(container.ContainterHeight);
    return containerInfo;
  }

  onCounterModelChange(event, container) {
    this.addContainer(event, container.ContainerSpecID, container.JsonContainerSpecProp);
  }

  addContainer(quantity: number, specID: number, JsonContainerSpecProp?: any) {
    if (typeof quantity === "string") {
      quantity = parseInt(quantity);
    }
    let parsedJsonContainerSpecProp = {
      IsTrackingApplicable: false,
      IsQualityApplicable: false
    }
    if (JsonContainerSpecProp && JSON.parse(JsonContainerSpecProp)) {
      parsedJsonContainerSpecProp = JSON.parse(JsonContainerSpecProp)
    }


    let finQuantity = quantity

    if (this.TransportMode.toLowerCase() === 'truck') {
      const oldTruckList = this.SearchCriteriaContainerDetail.filter(truck => truck.contSpecID === specID)
      if (oldTruckList && oldTruckList.length > 0) {
        finQuantity = parseInt(oldTruckList[0].contRequestedQty) + quantity
      }
    }

    this.selectedContainerObj.contSpecID = specID;
    this.selectedContainerObj.contRequestedQty = finQuantity;
    this.selectedContainerObj.IsTrackingApplicable = parsedJsonContainerSpecProp.IsTrackingApplicable;
    this.selectedContainerObj.IsQualityApplicable = parsedJsonContainerSpecProp.IsQualityApplicable;
    if (this.TransportMode.toLowerCase() === 'truck') {
      this.FCLContainers.forEach(container => {
        container.ContainerSubDetail.forEach(subCont => {
          if (subCont.ContainerSpecID === specID) {
            this.selectedContainerObj.containerDtl = container
          }
        })
      });
    } else {
      this.FCLContainers.forEach(element => {
        if (element.ContainerSpecID === specID) {
          element.selected = quantity;
          this.selectedContainerObj.containerDtl = element
        }
      });
    }

    this.showAddedContainers = true;

    this.SearchCriteriaContainerDetail.forEach(element => {
      if (element.contSpecID === specID) {
        let index = this.SearchCriteriaContainerDetail.indexOf(element);
        this.SearchCriteriaContainerDetail.splice(index, 1);
      }
    });

    if (this.selectedContainerObj.contRequestedQty > 0) {
      this.checkInputData();
      this.SearchCriteriaContainerDetail.push(this.selectedContainerObj);
    }
    this.containerQuantity = quantity;
    this.selectedContainerObj = {};
  }

  removeContainers(specId) {
    // event.stopPropagation();
    let index;
    this.containerCount = 0;
    this.showAddedContainers = false;
    const { TransportMode } = this
    this.SearchCriteriaContainerDetail.forEach(element => {
      if (element.contSpecID === specId) {
        index = this.SearchCriteriaContainerDetail.indexOf(element);
        this.SearchCriteriaContainerDetail.splice(index, 1);
      }
    });
    this.containersArray.forEach(element => {
      if (element.selected && element.ContainerSpecID === specId) {
        element.selected = null;
      }
    });
  }

  subCatClick(event, subCat) {
    this.activeContainerId = -1;
    this.isModeChange = true
    if (this.selectedSubCatId !== subCat.ShippingSubCatID) {
      this.SearchCriteriaContainerDetail = [];
      this.totalShipment = 0;
      this.totalVolumetricWeight = 0;
      this.addedLCLPackages = [];
      this.LCLSinglePackages = [];
      this.resetLclInputs();
      if (subCat.hasOwnProperty("ShippingCatID")) {
        this.selectedSubCatId = subCat.ShippingCriteriaSubCat[0].ShippingSubCatID;
        this.containersArray = subCat.ShippingCriteriaSubCat[0].Containers;
        this.containersArray.forEach(element => {
          element.selected = 0;
        });

        const tabOne = (this.selectedModeCaption.transModeCode.toLowerCase() === 'truck') ? 'FTL' : 'FCL'
        const tabTwo = (this.selectedModeCaption.transModeCode.toLowerCase() === 'truck') ? 'LTL' : 'LCL'
        this.FCLContainers = cloneObject(this.containersArray).filter(
          e => e.ContainerLoadType === tabOne
        );
        this.LCLContainers = this.containersArray.filter(
          e => e.ContainerLoadType === tabTwo
        );
        // this.FTLContainers = this.containersArray.filter(
        //   e => e.ContainerLoadType === "FTL"
        // );
        // this.LTLContainers = this.containersArray.filter(
        //   e => e.ContainerLoadType === "LTL"
        // );
        this.resetLclInputs();
        this.LCLContainers.forEach(e => {
          e.CBM = e.ContainterLength * e.ContainterWidth * e.ContainterHeight;
          e.LClContainerInputs.toggle = false;
        });
      } else {
        this.selectedSubCatId = subCat.ShippingSubCatID;
        this.containersArray = subCat.Containers;

        const tabOne = (this.selectedModeCaption.transModeCode.toLowerCase() === 'truck') ? 'FTL' : 'FCL'
        const tabTwo = (this.selectedModeCaption.transModeCode.toLowerCase() === 'truck') ? 'LTL' : 'LCL'

        this.FCLContainers = cloneObject(this.containersArray).filter(
          e => e.ContainerLoadType === tabOne
        );
        this.LCLContainers = this.containersArray.filter(
          e => e.ContainerLoadType === tabTwo
        );
        // this.FTLContainers = this.containersArray.filter(
        //   e => e.ContainerLoadType === "FTL"
        // );
        // this.LTLContainers = this.containersArray.filter(
        //   e => e.ContainerLoadType === "LTL"
        // );
        this.resetLclInputs();

        this.LCLContainers.forEach(e => {
          e.CBM = e.ContainterLength * e.ContainterWidth * e.ContainterHeight;
          e.LClContainerInputs.toggle = false;
        });
        this.containersArray.forEach(element => {
          element.selected = 0;
        });
      }
    }

    let count = event.currentTarget.parentElement.parentElement.children;
    for (let i = 0; i < count.length; i++) {
      if (count[i].children[0].classList.length > 1) {
        count[i].children[0].classList.remove("active");
      }
    }
    event.currentTarget.classList.add("active");
    this.removeAllGlow()
    this.blinkingInputs()
    setTimeout(() => {
      this.isModeChange = false
    }, 0);
  }

  counter(pos, type, specID: number, index?, JsonContainerSpecProp?) {

    if (type === "FCL") {
      if (pos === "plus" && this.containerCount < 9999) {
        this.containerCount++;
      } else if (pos === "minus" && this.containerCount > 0) {
        this.containerCount--;
        if (this.containerCount === 0) {
          this.removeContainers(specID);
        }
      }
      this.addContainer(this.containerCount, specID, JsonContainerSpecProp);
    } else if (type === "FTL") {
      let newSpecId: number = (specID) ? specID : this.FCLContainers[index].ContainerSubDetail[0].ContainerSpecID
      if (pos === "plus" && this.containerCount < 9999) {
        this.containerCount++;
      } else if (pos === "minus" && this.containerCount > 0) {
        this.containerCount--;
        if (this.containerCount === 0) {
          this.removeContainers(newSpecId);
        }
      }
      this.addContainer(this.containerCount, newSpecId, JsonContainerSpecProp);
    } else if (type === "LCL" || type === "LTL") {
      if (pos === "plus") {

        if (this.lclFields.quantity === undefined || this.lclFields.quantity === null) {
          this.lclFields.quantity = 1
        } else {
          this.lclFields.quantity++;
        }

        this.LCLContainers[
          index
        ].LClContainerInputs.inpQuantity = this.lclFields.quantity;
        this.lclForm.controls["quantity"].setValue(this.lclFields.quantity);
      } else if (pos === "minus" && this.lclFields.quantity > 0) {
        this.lclFields.quantity--;
        this.LCLContainers[
          index
        ].LClContainerInputs.inpQuantity = this.lclFields.quantity;
        this.lclForm.controls["quantity"].setValue(this.lclFields.quantity);
      }
      this.checkInputData();
    }
  }

  /**
   * get all ports data
   */
  getPortDetails() {
    let ports = JSON.parse(HashStorage.getItem("shippingPortDetails"));
    this.ports = ports;
    if (this.SearchReset) {
      this.selectedFields(this.selectedCriteria);
    }
  }

  calculateResult(event) {
    event.stopPropagation();
    loading(true);
    if (HashStorage) {
      this.searchCriteria.pickupFlexibleDays = 3;
      this.searchCriteria.bookingCategoryID = 114;
      this.searchCriteria.pickupPortID = this.pickup.id;
      this.searchCriteria.pickupPortCode = this.pickup.code;
      this.searchCriteria.pickupPortName = this.pickup.shortName;
      this.searchCriteria.deliveryPortID = this.delivery.id;
      this.searchCriteria.deliveryPortCode = this.delivery.code;
      this.searchCriteria.deliveryPortName = this.delivery.shortName;
      this.searchCriteria.containerLoad = (this.selectedModeCaption.transModeCode === 'TRUCK') ? 'FTL' : 'FCL'
      let pickupDate
      try {
        if (this.pickupDate && this.pickupDate.year) {
          pickupDate = new Date(
            this.pickupDate.year,
            this.pickupDate.month - 1,
            this.pickupDate.day
          );
        } else {
          this.searchCriteria.isSearchByCalender = false
          pickupDate = new Date()
        }
      } catch (error) {
        pickupDate = new Date()
      }
      if (this.searchCriteria.isSearchByCalender) {
        if (this.flexDays === -1) {
          this.searchCriteria.pickupFlexibleDays = 0
        } else {
          this.searchCriteria.pickupFlexibleDays = this.flexDays
        }
      } else {
        this.searchCriteria.pickupFlexibleDays = -1
      }
      this.searchCriteria.pickupDate = moment(pickupDate).format("L");
      this.searchCriteria.shippingModeID = this.selectedShippingModeID
      this.searchCriteria.shippingCatID = this.selectedCatId;
      this.searchCriteria.shippingSubCatID = this.selectedSubCatId;
      this.searchCriteria.SearchCriteriaTransportationDetail = [
        this.searchTransportDetails
      ];
      this.searchCriteria.SearchCriteriaContainerDetail = this.SearchCriteriaContainerDetail;
      this.searchCriteria.recordCounter = 400;

      const loginObj = JSON.parse(Tea.getItem('loginUser'));
      if (loginObj && !loginObj.IsLogedOut) {
        this.searchCriteria.CustomerID = loginObj.CustomerID;
        this.searchCriteria.CustomerType = loginObj.CustomerType;
        this.searchCriteria.loggedID = loginObj.UserID;
      } else {
        this.searchCriteria.CustomerID = null;
        this.searchCriteria.CustomerType = null;
        this.searchCriteria.loggedID = null;
      }
      // this.searchCriteria.searchMode = "sea-fcl"; //'sea-fcl | sea-lcl | air-lcl'


      if (this.TransportMode.toLowerCase() === "sea") {
        this.searchCriteria.searchMode = "sea-fcl";
        this.searchCriteria.totalChargeableWeight = this.totalVolumetricWeight;
      } else {
        this.searchCriteria.searchMode = "truck-ftl";
        this.searchCriteria
      }


      const isSameCountry: boolean = this.pickup.imageName.toLowerCase() === this.delivery.imageName.toLowerCase()
      if (isSameCountry && this.searchCriteria.searchMode === "sea-fcl") {
        this._toast.warning("Please select different pickup and drop Country");
        loading(false);
        return false;
      }

      if (this.searchCriteria.deliveryPortName.toLowerCase() === this.searchCriteria.pickupPortName.toLowerCase() && (this.searchCriteria.searchMode === "sea-fcl" || this.searchCriteria.searchMode === "truck-ftl")) {
        this._toast.warning("Please select different pickup & dropoff ports.");
        loading(false);
        return false;
      }
      this.searchCriteria.TransportMode = this.TransportMode;
      const { pickup, delivery } = this
      this.searchCriteria.userPickup = pickup
      this.searchCriteria.userDelivery = delivery
      this.searchCriteria.portJsonData = "[]"
      this.searchCriteria.criteriaFrom = (this.type === 'vendor' ? 'vendor' : 'search')
      this.searchCriteria.selectedModeCaption = this.selectedModeCaption

      let jsonString = JSON.stringify(this.searchCriteria);
      HashStorage.setItem("searchCriteria", jsonString);
      LeftSidebarComponent.loadFilter = true
      LeftSidebarComponent.isRangeLoaded = true
      this.setCurreny2Default()
      if (this.type === 'vendor' && this.searchCriteria.searchMode === "sea-fcl") {
        this.dataService.closeBookingModal.next(true);
        let provider = JSON.parse(HashStorage.getItem('selectedProvider'))
        this.bookNowCarriers(provider)
      } else {
        this.getSearchResult();
      }
    }
  }

  async getSearchResult() {
    setTimeout(() => {
      this.removeTempCriteria()
    }, 0);
    if (HashStorage) {
      let jsonString = HashStorage.getItem("searchCriteria");
      this.searchCriteria = JSON.parse(jsonString);
      // Get Search Result
      if (this.searchCriteria) {
        this.searchCriteria.recordCounter = 400;
        this._cookieService.deleteCookies();
        this.searchCriteria.SearchCriteriaContainerDetail.forEach(elem => {
          elem.volumetricWeight = 0;
        });

        const { searchMode } = this.searchCriteria
        this.setCurreny2Default()


        if (searchMode === 'sea-fcl') {
          this.seaFclDispatchCall(this.searchCriteria)
        } else if (searchMode === 'truck-ftl') {
          if (this.type === 'vendor') {
            let provider = JSON.parse(HashStorage.getItem('selectedProvider'))
            this.searchCriteria.ProviderID = provider.ProviderID
          }
          this.truckFTlDispatchCall(this.searchCriteria)
        }
      } else {
        loading(false);
      }
    }
  }
  async bookNowCarriers(item) {
    loading(true)
    setTimeout(() => {
      this.removeTempCriteria()
    }, 0);
    if (HashStorage) {
      HashStorage.setItem('selectedProvider', JSON.stringify(item))
      this.searchCriteria.ProviderID = item.ProviderID
      // Get Search Result
      if (
        this.searchCriteria !== null
      ) {
        this.searchCriteria.recordCounter = 400;
        this._cookieService.deleteCookies();
        this.searchCriteria.SearchCriteriaContainerDetail.forEach(elem => {
          elem.volumetricWeight = 0;
        });
        HashStorage.setItem('carrierSearchCriteria', JSON.stringify(this.searchCriteria))
        this.store.dispatch(
          new fromFclShipping.FetchingFCLShippingData(this.searchCriteria)
        );
        // loading(false);
        this.$fclSearchResults.pipe(untilDestroyed(this)).subscribe(state => {
          const { loaded } = state;
          if (loaded) {
            setTimeout(() => {
              if (this.type !== 'vendor') {
                this._router.navigate(["fcl-search/shipping-lines"]).then(() => {
                  loading(false);
                });
              } else {
                this.dataService.searchState.next('carrier')
                this.dataService.closeBookingModal.next(true)
              }

            }, 100);
          }
        });
      } else {
        loading(false);
      }
    }
  }

  async bookNowAir(item) {
    setTimeout(() => {
      this.removeTempCriteria()
    }, 0);
    loading(true)
    const { IDlist } = item
    let stringedData = JSON.stringify(item);
    this.searchCriteria.carrierID = item.CarrierID;
    this.searchCriteria.routeIDs = item.ActualRouteIDs;
    this.searchCriteria.etaInDays = item.EtaInDays;
    this.searchCriteria.carrierEtdUtcDate = item.EtdUtc;
    this.searchCriteria.voyageRefNum = item.VoyageRefNum;
    this.searchCriteria.pickupFlexibleDays = 3;
    this.searchCriteria.recordCounter = 120;
    this.searchCriteria.portJsonData = (item.PortJsonData) ? item.PortJsonData : '[]'
    this.searchCriteria.IDlist = IDlist
    this.searchCriteria.ProviderID = item.ProviderID

    const toSend = this.searchCriteria
    HashStorage.setItem('carrierSearchCriteria', JSON.stringify(toSend))
    HashStorage.setItem('selectedCarrier', stringedData);
    this.store.dispatch(
      new fromLclAir.FetchingLCLAirData(this.searchCriteria)
    );
    setTimeout(() => {
      if (this.type !== 'vendor') {
        this._router.navigate(["air/air-lines"]).then(() => {
          loading(false);
        });
      } else {
        // loading(false);
      }

    }, 100);
  }

  seaFclDispatchCall(toSend) {
    this.store.dispatch(
      new fromFclShipping.FetchingFCLForwarderData(toSend)
    );
    // loading(false);
    this.$fclSearchResults.pipe(untilDestroyed(this)).subscribe(state => {
      const { loaded } = state;
      if (loaded) {
        if (this.type !== 'vendor') {
          setTimeout(() => {
            this.router.navigate(["fcl-search/forwarders"]).then(() => {
              loading(false);
            });
          }, 100);
        }
      }
    });
  }
  truckFTlDispatchCall(toSend) {
    this.store.dispatch(
      new fromLclShipping.FetchingLCLShippingData(toSend)
    );
    // loading(false);
    this.$lclSearchResults.pipe(untilDestroyed(this)).subscribe(state => {
      const { loaded } = state;

      if (loaded) {
        setTimeout(() => {
          if (this.type !== 'vendor') {
            this.router.navigate(["truck-search/consolidators"]).then(() => {
              loading(false);
            });
          } else {
            loading(false);
            this.dataService.closeBookingModal.next(true);
          }
        }, 100);
      }
    });
  }

  numericKeyPress(event: any) {
    const pattern = /[0-9\+\-\ ]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (
      (event.keyCode != 8 && !pattern.test(inputChar)) ||
      event.keyCode === 45
    ) {
      event.preventDefault();
    }
  }

  ngOnDestroy() {
    let toBeSetContainers;
    if (this.SearchCriteriaContainerDetail.length) {
      toBeSetContainers = this.SearchCriteriaContainerDetail;
    } else {
      toBeSetContainers = this.containersArray;
    }

    this.tempSearchCriteria = {
      ...this.searchCriteria,
      currentMode: 'shipment',
      pickup: this.pickup,
      delivery: this.delivery,
      // pickupDate: (this.TransportMode.toLowerCase() === 'air') ? this.fromDate : this.pickupDate,
      // pickupDateTo: (this.TransportMode.toLowerCase() === 'air') ? this.toDate : null,
      pickupDate: this.pickupDate,
      pickupDateTo: null,
      containers: toBeSetContainers,
      shippingModeID: this.selectedShippingModeID,
      shippingCatID: this.selectedCatId,
      shippingSubCatID: this.selectedSubCatId,
      activeContainerTabID: this.activeContainerTabID,
      lclData: this.LCLContainers,
      SearchCriteriaContainerDetail: this.SearchCriteriaContainerDetail,
      TransportMode: this.TransportMode,
      addedLCLPackages: this.addedLCLPackages,
      selectedModeCaption: this.selectedModeCaption,
      searchTransportDetails: this.searchTransportDetails,
      searchMode: this.searchMode,
      airChipData: (this.airInpData) ? this.airInpData : null
    };
    this.searchTransportDetails
    HashStorage.setItem(
      "tempSearchCriteria",
      JSON.stringify(this.tempSearchCriteria)
    );
  }

  tabChangeEvent(event) {
    this.isModeChange = true
    this.activeContainerId = -1;
    this.activeContainerTabID = event.nextId;
    if (event.nextId === "fcl") {
      this.SearchCriteriaContainerDetail = [];
      this.FCLContainers.forEach(e => {
        e.selected = 0;
      });
      if (this.TransportMode.toLowerCase() === 'truck') {
        this.resetTruckList()
      }
    } else if (event.nextId === "lcl") {
      this.SearchCriteriaContainerDetail = [];
      this.LCLContainers.forEach(e => {
        e.selected = 0;
        if (e.ContainerSpecCode === 'PLTS') {
          e.LClContainerInputs.inpLenght = 120
          e.LClContainerInputs.inpWidth = 80
          e.LClContainerInputs.inpHeight = 160
        }
      });
      this.totalShipment = 0;
      this.totalVolumetricWeight = 0;
      this.addedLCLPackages = [];
      this.LCLSinglePackages = [];
      this.resetLclInputs();
    }
    setTimeout(() => {
      this.resetSearchInputs()
      this.removeAllGlow()
      setTimeout(() => {
        this.initBlinkingInputs()
      }, 0);
    }, 40);
    setTimeout(() => {
      this.isModeChange = false
    }, 10);
  }

  resetTruckList() {
    if (!this.trucks) {
      this.trucks = []
    }
    this.trucks.forEach(element => {
      element.truckInput = {
        quantity: null,
        size: null,
        sizeUnit: null,
        containerSpecId: null,
        containerSpecCode: null,
        MaxGrossWeight: null,
        WeightUnit: null,
        toggle: null,
        // selectedOpt: -1
        selectedOpt: 'Select Size'
      }

      element.truckChips = []
    });
  }

  search = (text$: Observable<string>) => {
    return (text$
      .debounceTime(200)
      .map(
        term =>
          !term || term.length < 3
            ? []
            : this.ports.filter(
              v => v.title.toLowerCase().indexOf(term.toLowerCase()) > -1
            )
      ))
  }

  formatter = (x: any) => {
    if (this.searchCriteria.pickupPortType.toLowerCase() !== 'ground' && x && x.title && x.title.length > 0 && x.id) {
      this.searchCriteria.SearchCriteriaPickupGroundDetail = null
    }
    if (this.searchCriteria.deliveryPortCode.toLowerCase() !== 'ground' && x && x.title && x.title.length > 0 && x.id) {
      this.searchCriteria.SearchCriteriaDropGroundDetail = null
    }
    return x.title
  };



  /**
   *
   * CITIES FORMATTER
   * @memberof ShippingComponent
   */
  isCitySearching: boolean = false
  hasCitySearchFailed: boolean = false
  hasCitySearchSuccess: boolean = false
  citySearch = (text$: Observable<string>) =>
    text$
      .debounceTime(300) //debounce time
      .distinctUntilChanged()
      .do(() => { this.isCitySearching = true; this.hasCitySearchFailed = false; this.hasCitySearchSuccess = false; }) // do any action while the user is typing
      .switchMap(term => {
        let some = of([]); //  Initialize the object to return
        if (term && term.length >= 3) { //search only if item are more than three
          some = this._dropdownservice.getFilteredCity(term)
            .do((res) => { this.isCitySearching = false; this.hasCitySearchSuccess = true; return res; })
            .catch(() => { this.isCitySearching = false; this.hasCitySearchFailed = true; return []; })
        } else { this.isCitySearching = false; some = of([]); }
        return some;
      })
      .do((res) => { this.isCitySearching = false; return res; })
      .catch(() => { this.isCitySearching = false; return of([]); }); // final server list

  citiesFormatterPickup = (x: { title: string, code: string, imageName: string, shortName: string, id: number, desc: string, type: string, lastUpdate: string, webURL: string, sortingOrder: string }) => {
    this.pickup.shortName = x.shortName;
    this.pickup.id = x.id
    this.pickup.imageName = x.imageName;
    this.pickup.title = x.title;
    this.pickup.code = x.code;
    this.pickup.name = x.title;
    this.pickup.desc = x.desc;
    this.pickup.shortName = x.shortName;
    this.pickup.type = x.type
    this.pickup.webURL = x.webURL
    this.pickup.lastUpdate = x.lastUpdate
    this.pickup.sortingOrder = x.sortingOrder
    this.selectedModeCaption.strPickupParentIcon = 'Icons_Location.svg'
    return x.title
  };
  citiesFormatterDropoff = (x: { title: string, code: string, imageName: string, shortName: string, id: number, desc: string, type: string, lastUpdate: string, webURL: string, sortingOrder: string }) => {
    this.delivery.shortName = x.shortName;
    this.delivery.id = x.id
    this.delivery.imageName = x.imageName;
    this.delivery.title = x.title;
    this.delivery.code = x.code;
    this.delivery.name = x.title;
    this.delivery.desc = x.desc;
    this.delivery.shortName = x.shortName;
    this.delivery.type = x.type
    this.delivery.webURL = x.webURL
    this.delivery.lastUpdate = x.lastUpdate
    this.delivery.sortingOrder = x.sortingOrder
    this.selectedModeCaption.strDeliverParentIcon = 'Icons_Location.svg'
    return x.title
  };




  blinkingInputs() {
    try {
      let pickupInput = this.pickupBox.nativeElement;
      let dropInput = this.deliverBox.nativeElement;
      let calenderInput = this.calenderField.nativeElement;
      setTimeout(() => {
        if (!pickupInput.value) {
          pickupInput.classList.add("blinking");
        } else if (!dropInput.value) {
          dropInput.classList.add("blinking");
        } else if (!calenderInput.value) {
          calenderInput.classList.add("blinking");
        }
      }, 0)
    } catch (error) { }
  }

  customStartBlink($type: string) {
    let pickupInput = this.pickupBox.nativeElement;
    let dropInput = this.deliverBox.nativeElement;
    let calenderInput = this.calenderField.nativeElement;
    setTimeout(() => {
      if ($type === 'pick') {
        pickupInput.classList.add("blinking");
      } else if ($type === 'drop') {
        dropInput.classList.add("blinking");
      } else if ($type === 'date') {
        calenderInput.classList.add("blinking");
      }
    }, 0)
  }

  initBlinkingInputs() {
    let pickupInput = this.pickupBox.nativeElement;
    setTimeout(() => {
      if (!pickupInput.value) {
        pickupInput.classList.add("blinking");
      }
    }, 10);
  }

  // LCL WORKING
  public activeContainerId: number;
  zoomLCLContainer(container, index) {
    if (container.ContainerLoadType === 'LCL') {
      if (this.tempSearchCriteria) {
        this.lclFields.length = container.LClContainerInputs.inpLenght;
        this.lclFields.width = container.LClContainerInputs.inpWidth;
        this.lclFields.height = container.LClContainerInputs.inpHeight;
        this.lclFields.weight = container.LClContainerInputs.inpWeight;
        this.lclFields.quantity = container.LClContainerInputs.inpQuantity;
        this.lclFields.id = container.ContainerSpecID
      }
      if (container.LClContainerInputs.toggle) {
        this.selectedVolumeUnitID = container.LClContainerInputs.volumeUnit;
        this.selectedWeightUnitID = container.LClContainerInputs.weightUnit;
      }
    }

    this.activeContainerId = index;
    this.LCLSinglePackages = [];
    if (this.lclFields.id !== container.ContainerSpecID) {
      this.lclForm.reset();
    }
    this.lastActiveContainer = container.ContainerSpecID;
    if (
      container.LClContainerInputs &&
      !container.LClContainerInputs.inpTotalWeight &&
      !container.LClContainerInputs.inpVolume
    ) {
      this.formValidation2 = {
        invalid: false,
        message: ""
      };
      this.formValidation = {
        invalid: false,
        message: ""
      };
    }
    this.showValidation = false;
    const { ContainerLoadType } = container;
    if (ContainerLoadType === "LCL" && this.addedLCLPackages.length) {
      this.LCLSinglePackages = this.addedLCLPackages.filter(
        e => e.packageType === container.ContainerSpecCode
      );
    }
    this.containerCount = 0;
    this.selectedContainer = container;
    this.SearchCriteriaContainerDetail.forEach(element => {
      if (element.contSpecID === container.ContainerSpecID) {
        this.showAddedContainers = true;
        this.containerCount = element.contRequestedQty;
        this.containerQuantity = this.containerCount;
      }
    });
  }

  closeLCLContainer() {
    this.activeContainerId = -1;
  }

  focusIn(container) {
    this.showValidation = false;
    if (this.showFields) {
      this.lclForm.controls["volume"].setValidators([
        Validators.required,
        Validators.max(container.CBM)
      ]);
      this.lclForm.controls["totalWeight"].setValidators([
        Validators.required,
        Validators.max(container.MaxGrossWeight)
      ]);
    } else {
      this.lclForm.controls["length"].setValidators([
        Validators.required,
        Validators.max(container.ContainterLength)
      ]);
      this.lclForm.controls["width"].setValidators([
        Validators.required,
        Validators.max(container.ContainterWidth)
      ]);
      this.lclForm.controls["height"].setValidators([
        Validators.required,
        Validators.max(container.ContainterHeight)
      ]);
      this.lclForm.controls["weight"].setValidators([
        Validators.required,
        Validators.max(container.MaxGrossWeight)
      ]);
    }
  }
  onKeydown(event, index, val, model) {
    if (!val.value && model && event.keyCode === 8) {
      this.LCLContainers[index].LClContainerInputs.inpQuantity = null;
      this.lclFields.quantity = null;
      this.lclForm.controls["quantity"].setValue(null);
    }
  }

  onKeypress(event, control, name, container) {
    let charCode = (event.which) ? event.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;

    if (name === "quantity") {
      const pattern = /[0-9\+\-\ ]/;
      let inputChar = String.fromCharCode(event.charCode);
      if (
        (event.keyCode != 8 && !pattern.test(inputChar)) ||
        event.keyCode === 45
      ) {
        event.preventDefault();
      }
    }
    if (name === "length") {

    } else if (name === "width" && control.value > container.ContainterWidth) {
      // event.preventDefault();
    } else if (
      name === "height" &&
      control.value > container.ContainterHeight
    ) {
      // event.preventDefault();
    } else if (name === "weight" && control.value > container.MaxGrossWeight) {
      // event.preventDefault();
    } else if (name === "volume") {
      const pattern = /[0-9\+\-\ ]/;
      let inputChar = String.fromCharCode(event.charCode);
      if (
        (event.keyCode != 8 && !pattern.test(inputChar)) ||
        event.keyCode === 45
      ) {
        event.preventDefault();
      }
    } else if (
      name === "totalWeight") {
      const pattern = /[0-9\+\-\ ]/;
      let inputChar = String.fromCharCode(event.charCode);
      if (
        (event.keyCode != 8 && !pattern.test(inputChar)) ||
        event.keyCode === 45
      ) {
        event.preventDefault();
      }
    }
  }

  submitLCLForm(index, container, event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    this.total = [];
    this.subTotal = [];

    let obj = this.lclFields
    this.formValidation.message = null
    let lengthValidation = this.unitConversion(this.lclFields.lengthUnitID, 2, this.lclFields.length, container, 'length');
    let widthValidation = this.unitConversion(this.lclFields.lengthUnitID, 2, this.lclFields.width, container, 'width');
    let heightValidation = this.unitConversion(this.lclFields.lengthUnitID, 2, this.lclFields.height, container, 'height');
    let weightValidation = this.unitConversion(this.lclFields.weightUnitID, 6, this.lclFields.weight, container, 'weight');

    if (
      !lengthValidation ||
      !widthValidation ||
      !heightValidation ||
      !weightValidation
    ) {
      return false;
    }

    if (
      !(this.lclFields.quantity > 0) ||
      !this.lclFields.length ||
      !this.lclFields.width ||
      !this.lclFields.height ||
      !this.lclFields.weight
    ) {
      this.formValidation = {
        invalid: true,
        message: "Please fill all fields."
      };
      return false;
    }

    this.formValidation = {
      invalid: false,
      message: ""
    };

    this.calculateTotalCBM();

    obj.quantity = parseInt(obj.quantity);
    obj.packageType = container.ContainerSpecCode;
    obj.contSpecID = container.ContainerSpecID;
    let selectedLength = this.lengthUnits.filter(
      e => e.UnitTypeID === this.lclFields.lengthUnitID
    );
    obj.lengthUnit = selectedLength[0].UnitTypeID;
    let selectedWeight = this.weightUnits.filter(
      e => e.UnitTypeID === this.lclFields.weightUnitID
    );
    obj.weightUnit = selectedWeight[0].UnitTypeID;
    obj.contRequestedQty = 0;
    obj.toggle = false;

    if (obj.quantity) {
      obj.contRequestedCBM = this.totalCBM * obj.quantity;
      obj.contRequestedWeight = obj.weight * obj.quantity;
      obj.volumetricWeight = this.volumetricWeight;
    } else {
      obj.contRequestedWeight = obj.weight;
      obj.contRequestedCBM = this.totalCBM;
    }
    const parsedJsonContainerSpecProp = JSON.parse(container.JsonContainerSpecProp)
    let forCriteriaObj = {
      contSpecID: container.ContainerSpecID,
      containerCode: container.ContainerSpecCode,
      contRequestedQty: obj.quantity,
      contRequestedCBM: obj.contRequestedCBM,
      contRequestedWeight: obj.contRequestedWeight,
      volumetricWeight: this.volumetricWeight,
      IsTrackingApplicable: parsedJsonContainerSpecProp.IsTrackingApplicable,
      IsQualityApplicable: parsedJsonContainerSpecProp.IsQualityApplicable
    };

    this.SearchCriteriaContainerDetail.push(forCriteriaObj);

    this.addedLCLPackages.push(obj);

    this.LCLSinglePackages = this.addedLCLPackages.filter(
      e => e.packageType === container.ContainerSpecCode
    );
    this.lclForm.reset();

    if (this.TransportMode.toLowerCase() === "air") {
      this.LCLSinglePackages.forEach(element => {
        if (element.contRequestedWeight > element.volumetricWeight) {
          this.total.push(element.contRequestedWeight);
        } else if (element.volumetricWeight > element.contRequestedWeight) {
          this.total.push(element.volumetricWeight);
        }
      });

      this.subTotal = this.total.reduce((all, item) => {
        return all + item;
      });

      this.LCLContainers.forEach(e => {
        this.LCLSinglePackages.forEach(element => {
          if (element.contSpecID === e.ContainerSpecID) {
            e.selected = this.subTotal;
          }
        });
      });
    } else if (this.TransportMode.toLowerCase() === "sea") {
      this.LCLSinglePackages.forEach(element => {
        this.total.push(element.contRequestedCBM);
      });

      this.subTotal = this.total.reduce((all, item) => {
        return all + item;
      });

      this.LCLContainers.forEach(e => {
        this.LCLSinglePackages.forEach(element => {
          if (element.contSpecID === e.ContainerSpecID) {
            e.selected = this.subTotal;
          }
        });
      });
    }

    this.calculateTotalShipment();

    this.lclFields = {
      quantity: 0,
      length: 0,
      weight: 0,
      height: 0,
      lengthUnitID: this.selectedLengthUnitID,
      weightUnitID: this.selectedWeightUnitID,
      volumeUnitID: 1
    };
    this.lclForm.reset();
    this.LCLContainers[index].LClContainerInputs = {
      inpHeight: null,
      inpLenght: null,
      inpQuantity: null,
      inpWeight: null,
      inpWidth: null,
      lengthUnit: this.selectedLengthUnitID,
      weightUnit: this.selectedWeightUnitID,
      volumeUnit: this.selectedVolumeUnitID
    };
    this.checkInputData();
  }

  calculateTotalShipment() {
    this.totalShipment = 0;
    this.totalVolumetricWeight = 0;
    this.SearchCriteriaContainerDetail.forEach(obj => {
      if (typeof (obj.contRequestedCBM) === 'string') {
        obj.contRequestedCBM = parseInt(obj.contRequestedCBM)
      }
      if (obj.contRequestedCBM) {
        this.totalShipment += obj.contRequestedCBM;
        this.totalVolumetricWeight += (obj.contRequestedWeight > obj.volumetricWeight) ? obj.contRequestedWeight : obj.volumetricWeight;
      }
    });
    this.totalShipment = Math.ceil(this.totalShipment)
  }

  unitConversion(srcUnit, destUnit, srcVal, container, type: string) {
    let maxLength = container.ContainterLength;
    let maxWidth = container.ContainterWidth;
    let maxHeight = container.ContainterHeight;
    let maxWeight = container.MaxGrossWeight;
    let maxVolume = maxLength * 0.01 * (maxWidth * 0.01) * (maxHeight * 0.01);
    this.validatedLength = true;
    if (srcUnit >= 1 && srcUnit <= 5) {
      let sourceUnitObj = this.lengthUnits.filter(
        e => e.UnitTypeID === srcUnit
      );
      let destinationUnitObj = this.lengthUnits.filter(
        e => e.UnitTypeID === destUnit
      );
      if (srcUnit !== destUnit) {
        let x = destinationUnitObj[0].UnitCalculation.filter(
          e => e.UnitTypeID === srcUnit
        );
        srcVal = srcVal / x[0].UnitTypeCalc;
      }
      if (type === "length" && srcVal > maxLength) {
        this.validatedLength = false;
        if (srcUnit !== destUnit) {
          let x = destinationUnitObj[0].UnitCalculation.filter(
            e => e.UnitTypeID === srcUnit
          );
          maxLength = maxLength * x[0].UnitTypeCalc;
          maxWidth = maxWidth * x[0].UnitTypeCalc;
          maxHeight = maxHeight * x[0].UnitTypeCalc;
        }

        if (!this.formValidation.message) {
          const strMessage = 'length should not exceed ' + this._currencyControl.applyRoundByDecimal(maxLength, 2) + ' ' + sourceUnitObj[0].UnitTypeShortName
          this.setValidMsgLWHW(strMessage, true)
        }
      } else if (type === "width" && srcVal > maxWidth) {
        this.validatedLength = false;
        if (srcUnit !== destUnit) {
          let x = destinationUnitObj[0].UnitCalculation.filter(
            e => e.UnitTypeID === srcUnit
          );
          maxLength = maxLength * x[0].UnitTypeCalc;
          maxWidth = maxWidth * x[0].UnitTypeCalc;
          maxHeight = maxHeight * x[0].UnitTypeCalc;
        }

        if (!this.formValidation.message) {
          const strMessage = 'width should not exceed ' + this._currencyControl.applyRoundByDecimal(maxWidth, 2) + ' ' + sourceUnitObj[0].UnitTypeShortName
          this.setValidMsgLWHW(strMessage, true)
        }
      } else if (type === "height" && srcVal > maxHeight) {
        this.validatedLength = false;
        if (srcUnit !== destUnit) {
          let x = destinationUnitObj[0].UnitCalculation.filter(
            e => e.UnitTypeID === srcUnit
          );
          maxLength = maxLength * x[0].UnitTypeCalc;
          maxWidth = maxWidth * x[0].UnitTypeCalc;
          maxHeight = maxHeight * x[0].UnitTypeCalc;
        }
        if (!this.formValidation.message) {
          const strMessage = 'height should not exceed ' + this._currencyControl.applyRoundByDecimal(maxHeight, 2) + ' ' + sourceUnitObj[0].UnitTypeShortName
          this.setValidMsgLWHW(strMessage, true)
        }
      }
    } else if (srcUnit >= 6 && srcUnit <= 8) {
      let sourceUnitObj = this.weightUnits.filter(
        e => e.UnitTypeID === srcUnit
      );
      let destinationUnitObj = this.weightUnits.filter(
        e => e.UnitTypeID === destUnit
      );
      if (srcUnit !== destUnit) {
        let x = destinationUnitObj[0].UnitCalculation.filter(
          e => e.UnitTypeID === srcUnit
        );
        maxWeight = maxWeight * x[0].UnitTypeCalc;
      }
      if (type === "weight" && srcVal > maxWeight) {
        this.validatedLength = false;
        if (!this.formValidation.message) {
          const strMessage = 'weight should not exceed ' + this._currencyControl.applyRoundByDecimal(maxWeight, 2) + ' ' + sourceUnitObj[0].UnitTypeShortName
          this.setValidMsgLWHW(strMessage, true)
        }
      } else if (type === 'totalWeight' && srcVal > maxWeight) {
        this.validatedLength = false;
        this.formValidation = {
          invalid: true,
          message:
            "weight should not exceed " +
            this._currencyControl.applyRoundByDecimal(maxWeight, 2) +
            " " +
            sourceUnitObj[0].UnitTypeShortName
        };
      }
    } else if (srcUnit >= 9 && srcUnit <= 10) {

      let sourceUnitObj = this.volumeUnits.filter(
        e => e.UnitTypeID === srcUnit
      );
      let destinationUnitObj = this.volumeUnits.filter(
        e => e.UnitTypeID === destUnit
      );
      if (srcUnit !== destUnit) {
        let x = destinationUnitObj[0].UnitCalculation.filter(
          e => e.UnitTypeID === srcUnit
        );
        srcVal = srcVal / x[0].UnitTypeCalc;
      }

      if (srcVal > maxVolume) {
        this.validatedLength = false;
        if (srcUnit !== destUnit) {
          let x = destinationUnitObj[0].UnitCalculation.filter(
            e => e.UnitTypeID === srcUnit
          );
          maxVolume = maxVolume / x[0].UnitTypeCalc;
        }
        this.formValidation2 = {
          invalid: true,
          message:
            "volume should not exceed " +
            this._currencyControl.applyRoundByDecimal(maxVolume, 2) +
            " " +
            sourceUnitObj[0].UnitTypeShortName
        };
      }
    }
    return this.validatedLength;
  }

  setValidMsgLWHW($msg: string, $status: boolean) {
    this.formValidation = {
      invalid: $status,
      message: $msg
    }
  }

  calculateLCLResult() {
    this.activeContainerId = -1;
    loading(true);

    this.searchCriteria.pickupFlexibleDays = this.flexDays;
    this.searchCriteria.bookingCategoryID = 114;
    this.searchCriteria.pickupPortID = this.pickup.id;
    this.searchCriteria.pickupPortCode = this.pickup.code;
    this.searchCriteria.pickupPortName = this.pickup.shortName;
    this.searchCriteria.deliveryPortID = this.delivery.id;
    this.searchCriteria.deliveryPortCode = this.delivery.code;
    this.searchCriteria.deliveryPortName = this.delivery.shortName;
    let pickupDate: any = null
    let deliveryDate: any = null
    try {
      // if (this.pickupDate && this.pickupDate.year && this.TransportMode.toLowerCase() !== 'air') {
      if (this.pickupDate && this.pickupDate.year) {
        pickupDate = new Date(
          this.pickupDate.year,
          this.pickupDate.month - 1,
          this.pickupDate.day
        );
      } else {
        this.searchCriteria.isSearchByCalender = false
        pickupDate = new Date()
      }
    } catch (error) {
      pickupDate = new Date()
    }
    if (this.searchCriteria.isSearchByCalender) {
      if (this.flexDays === -1) {
        this.searchCriteria.pickupFlexibleDays = 0
      } else {
        this.searchCriteria.pickupFlexibleDays = this.flexDays
      }
    } else {
      this.searchCriteria.pickupFlexibleDays = -1
    }

    if (this.TransportMode.toLowerCase() === 'air') {
      if (this.searchCriteria.pickupFlexibleDays > 0) {
        const addedDate = moment(pickupDate).add('days', 14);
        deliveryDate = addedDate
      } else {
        deliveryDate = pickupDate
      }
    }
    this.searchCriteria.shippingModeID = this.selectedModeId;
    this.searchCriteria.shippingCatID = this.selectedCatId;
    this.searchCriteria.shippingSubCatID = this.selectedSubCatId;
    this.searchCriteria.containerLoad = "LCL";
    this.searchCriteria.SearchCriteriaTransportationDetail = [
      this.searchTransportDetails
    ];
    this.searchCriteria.SearchCriteriaContainerDetail = this.SearchCriteriaContainerDetail;
    this.searchCriteria.shippingModeID = this.selectedShippingModeID;
    this.searchCriteria.TransportMode = this.TransportMode;

    this.searchCriteria.portJsonData = "[]" // Default Empty
    this.searchCriteria.criteriaFrom = (this.type === 'vendor' ? 'vendor' : 'search')

    if (this.addedLCLPackages.length > 0) {
      this.searchCriteria.LclChips = this.addedLCLPackages;
    }

    if (this.strSelectedMode.toLowerCase() === "air") {
      this.searchCriteria.searchMode = "air-lcl";
      this.searchCriteria.totalChargeableWeight = this.totalVolumetricWeight;
      this.searchCriteria.SearchCriteriaContainerDetail = []


      this.searchCriteria.pickupDate = moment(pickupDate).format("L");
      this.searchCriteria.pickupDateTo = moment(deliveryDate).format("L");
      try {
        this.searchCriteria.cargoLoadType = this.airInpData.cargoLoadType
        this.searchCriteria.chargeableWeight = this.airInpData.chargeableWeight
      } catch (error) { }
    } else {
      this.searchCriteria.pickupDate = moment(pickupDate).format("L");
      this.searchCriteria.searchMode = "sea-lcl";
    }

    const loginObj = JSON.parse(Tea.getItem('loginUser'));
    if (loginObj && !loginObj.IsLogedOut) {
      this.searchCriteria.CustomerID = loginObj.CustomerID;
      this.searchCriteria.CustomerType = loginObj.CustomerType;
      this.searchCriteria.loggedID = loginObj.UserID;
    } else {
      this.searchCriteria.CustomerID = null;
      this.searchCriteria.CustomerType = null;
      this.searchCriteria.loggedID = null
    }



    const isSameCountry: boolean = this.pickup.imageName.toLowerCase() === this.delivery.imageName.toLowerCase()

    if (isSameCountry) {
      this._toast.warning("Please select different pickup and drop Country");
      loading(false);
      return false;
    }


    if (this.searchCriteria.deliveryPortName.toLowerCase() === this.searchCriteria.pickupPortName.toLowerCase()) {
      this._toast.warning("Please select different pickup & dropoff ports.");
      loading(false);
      return false;
    }
    this._cookieService.deleteCookies();

    this.searchCriteria.totalShipmentCMB = this.totalShipment
    this.searchCriteria.totalVolumetricWeight = this.totalVolumetricWeight

    const { pickup, delivery } = this
    this.searchCriteria.userPickup = pickup
    this.searchCriteria.userDelivery = delivery
    this.searchCriteria.selectedModeCaption = this.selectedModeCaption
    this.searchCriteria.airChipData = this.airInpData
    this.setCurreny2Default()
    HashStorage.setItem("searchCriteria", JSON.stringify(this.searchCriteria));
    if (this.strSelectedMode.toLowerCase() === "air") {
      if (this.type === 'vendor') {
        this.dataService.closeBookingModal.next(true);
        let provider = JSON.parse(HashStorage.getItem('selectedProvider'))
        this.bookNowAir(provider)
      } else {
        this.store.dispatch(
          new fromLclAir.FetchingFCLAirForwarderData(this.searchCriteria)
        );
        this.$lclAirSearchResults.pipe(untilDestroyed(this)).subscribe(state => {
          const { loaded } = state;
          if (loaded) {
            setTimeout(() => {
              if (this.type !== 'vendor') {
                this.router.navigate(["air/freight-forwarders"]).then(() => {
                  loading(false);
                });
              } else {
                loading(false);
                this.dataService.closeBookingModal.next(true);
              }
            }, 100);
          }
        });
      }
    } else {
      if (this.type === 'vendor') {
        let provider = JSON.parse(HashStorage.getItem('selectedProvider'))
        this.searchCriteria.ProviderID = provider.ProviderID
      }
      this.store.dispatch(
        new fromLclShipping.FetchingLCLShippingData(this.searchCriteria)
      );
      this.$lclSearchResults.pipe(untilDestroyed(this)).subscribe(state => {
        const { loaded } = state;
        if (loaded) {
          setTimeout(() => {
            if (this.type !== 'vendor') {
              this.router.navigate(["lcl-search/consolidators"]).then(() => {
                loading(false);
              });
            } else {
              loading(false);
              this.dataService.closeBookingModal.next(true);
            }
          }, 100);
        }
      });
    }
  }

  getLCLUnits() {
    if (!HashStorage.getItem('units')) {
      this._shippingService.getLCLUnits().subscribe(
        (res: Response) => {
          this.unitsResponse = res;
          this.setLCLUnits(this.unitsResponse.returnObject)
          HashStorage.setItem('units', JSON.stringify(this.unitsResponse.returnObject))
        },
        (err: HttpErrorResponse) => {
        }
      );
    } else {
      this.setLCLUnits(JSON.parse(HashStorage.getItem('units')))
    }
  }

  setLCLUnits(unitsResponse) {
    this.lengthUnits = unitsResponse.filter(
      e => e.UnitTypeNature === "LENGTH"
    );
    this.weightUnits = unitsResponse.filter(
      e => e.UnitTypeNature === "WEIGHT"
    );
    this.volumeUnits = unitsResponse.filter(
      e => e.UnitTypeNature === "VOLUME"
    );
    this.selectedLengthUnit = parseInt(this.lengthUnits[1].UnitTypeID);
  }


  onUnitChange(event, type, container, index) {
    event = parseInt(event);
    if (type === "length") {
      this.lclFields.lengthUnitID = event;
      this.selectedLengthUnitID = event;
      container.LClContainerInputs.lengthUnit = event;
    } else if (type === "weight") {
      this.lclFields.weightUnitID = event;
      this.selectedWeightUnitID = event;
      container.LClContainerInputs.weightUnit = event;
    } else if (type === "volume") {
      this.lclFields.volumeUnitID = event;
      this.selectedVolumeUnitID = event;
      container.LClContainerInputs.volumeUnit = event;
      this.unitFocusOut(index, container)
      this.formValidation2 = {
        invalid: false,
        message: ''
      }
    }
    else if (type === "totalWeight") {
      this.lclFields.weightUnitID = event;
      this.selectedWeightUnitID = event;
      container.LClContainerInputs.weightUnit = event;
      this.unitFocusOut(index, container)
      this.formValidation2 = {
        invalid: false,
        message: ''
      }
    }
  }

  public showCBMValidation: boolean = false;

  unitFocusOut(index, container) {
    if ((container.LClContainerInputs.inpTotalWeight && container.LClContainerInputs.inpVolume) || (!container.LClContainerInputs.inpTotalWeight && !container.LClContainerInputs.inpVolume && container.LClContainerInputs.volumetricWeight)) {

      if (!container.LClContainerInputs.inpTotalWeight && container.LClContainerInputs.volumetricWeight) {
        this.onRemoveTotalShipment(container)
        return;
      }
      container.LClContainerInputs.inpTotalWeight = parseInt(container.LClContainerInputs.inpTotalWeight)
      container.LClContainerInputs.inpVolume = parseInt(container.LClContainerInputs.inpVolume)
      let totalWeightValidation = this.unitConversion(
        container.LClContainerInputs.weightUnit,
        6,
        container.LClContainerInputs.inpTotalWeight,
        container,
        "totalWeight"
      );
      let volumeValidation = this.unitConversion(
        container.LClContainerInputs.volumeUnit,
        9,
        container.LClContainerInputs.inpVolume,
        container,
        "volume"
      );

      if (!volumeValidation || !totalWeightValidation) {
        if (!volumeValidation) {
          this.onRemoveTotalShipment(container)
        } else if (!totalWeightValidation) {
          this.onRemoveTotalShipment(container)
        }
        return false;
      }
      this.formValidation2 = {
        invalid: false,
        message: ""
      };

      // remove duplicates
      this.SearchCriteriaContainerDetail.forEach(element => {
        if (element.contSpecID === container.ContainerSpecID) {
          let index = this.SearchCriteriaContainerDetail.indexOf(element);
          this.SearchCriteriaContainerDetail.splice(index, 1);
        }
      });
      this.addedLCLPackages.forEach(element => {
        if (element.contSpecID === container.ContainerSpecID) {
          let index = this.addedLCLPackages.indexOf(element);
          this.addedLCLPackages.splice(index, 1);
        }
      });

      if (container.LClContainerInputs.weightUnit === 1) {
        container.LClContainerInputs.inpTotalWeight = container.LClContainerInputs.inpTotalWeight / 2.20462;
      } else if (container.LClContainerInputs.weightUnit === 3) {
        container.LClContainerInputs.inpTotalWeight = container.LClContainerInputs.inpTotalWeight / 2204.62;
      }


      let addedLCLObj: LclChip = {};
      addedLCLObj.contSpecID = container.ContainerSpecID;
      addedLCLObj.contRequestedQty = 1;
      addedLCLObj.contRequestedCBM = container.LClContainerInputs.volumeUnit === 10 ? container.LClContainerInputs.inpVolume * 0.0283168 : container.LClContainerInputs.inpVolume;
      addedLCLObj.contRequestedWeight = container.LClContainerInputs.inpTotalWeight;
      if (this.TransportMode.toLowerCase() === "air") {
        addedLCLObj.volumetricWeight = addedLCLObj.contRequestedCBM / 0.006
        this.shipmentVolumetricWeight = this._currencyControl.applyRoundByDecimal(addedLCLObj.volumetricWeight, 0) + ' kg'
      } else if (this.TransportMode.toLowerCase() === "sea") {
        addedLCLObj.volumetricWeight = 0;
      }
      addedLCLObj.toggle = true;
      addedLCLObj.volumeUnit = container.LClContainerInputs.volumeUnit
      addedLCLObj.weightUnit = container.LClContainerInputs.weightUnit
      addedLCLObj.inpVolume = container.LClContainerInputs.inpVolume
      addedLCLObj.inpTotalWeight = container.LClContainerInputs.inpTotalWeight
      // const parsedJsonContainerSpecProp = JSON.parse(container.parsedJsonContainerSpecProp)
      let containerDetailObj: SearchCriteriaContainerDetail = {
        contSpecID: container.ContainerSpecID,
        contRequestedQty: 1,
        contRequestedCBM: addedLCLObj.contRequestedCBM,
        contRequestedWeight: addedLCLObj.contRequestedWeight,
        volumetricWeight: addedLCLObj.volumetricWeight,
        containerCode: container.ContainerSpecCode,
        // IsTrackingApplicable: parsedJsonContainerSpecProp.IsTrackingApplicable,
        // IsQualityApplicable: parsedJsonContainerSpecProp.IsQualityApplicable
      }
      this.SearchCriteriaContainerDetail.push(containerDetailObj);
      this.addedLCLPackages.push(addedLCLObj);
      this.total = [];
      this.subTotal = [];

      this.LCLContainers.forEach(e => {
        this.SearchCriteriaContainerDetail.forEach(element => {
          if (
            element.contSpecID === e.ContainerSpecID &&
            element.contSpecID === container.ContainerSpecID
          ) {
            if (this.TransportMode.toLowerCase() === "sea") {
              e.selected = element.contRequestedCBM;
            } else if (this.TransportMode.toLowerCase() === "air") {
              e.selected = (element.contRequestedWeight > element.volumetricWeight ? element.contRequestedWeight : element.volumetricWeight);
              e.LClContainerInputs.volumetricWeight = element.contRequestedWeight > element.volumetricWeight ? element.contRequestedWeight : element.volumetricWeight
            }
          }
        });
      });
      this.checkInputData();
      this.lclFields = {
        quantity: 0,
        length: 0,
        weight: 0,
        height: 0,
        lengthUnitID: this.selectedLengthUnitID,
        weightUnitID: this.selectedWeightUnitID,
        volumeUnitID: 1
      };
      this.formValidation = {
        invalid: false,
        message: ""
      };
    } else {
      this.onRemoveTotalShipment(container)
    }
    this.formValidation = {
      invalid: false,
      message: ""
    };
    this.formValidation2 = {
      invalid: false,
      message: ""
    };
    this.calculateTotalShipment();
  }

  onRemoveTotalShipment(container) {
    this.SearchCriteriaContainerDetail.forEach(element => {
      if (element.contSpecID === container.ContainerSpecID) {
        let index = this.SearchCriteriaContainerDetail.indexOf(element);
        this.SearchCriteriaContainerDetail.splice(index, 1);
      }
    });
    this.LCLContainers.forEach(e => {
      if (e.ContainerSpecID === container.ContainerSpecID) {
        e.selected = 0
      }
    })
    this.calculateTotalShipment();
  }

  onTotalShpmentChange(model, container) {
    this.lclFields.volume = model;
  }

  onFieldsChange(event, container) {
    container.LClContainerInputs.toggle = event;
    this.showFields = container.LClContainerInputs.toggle;
    let filteredPackages = this.addedLCLPackages.filter(e => e.contSpecID != container.ContainerSpecID);
    let filteredContainers = this.SearchCriteriaContainerDetail.filter(e => e.contSpecID != container.ContainerSpecID);
    this.addedLCLPackages = filteredPackages;
    this.SearchCriteriaContainerDetail = filteredContainers
    let containerIndex = this.LCLContainers.indexOf(container);
    this.LCLContainers[containerIndex].LClContainerInputs.toggle = event;
    container.LClContainerInputs = {
      lengthUnit: this.selectedLengthUnitID,
      weightUnit: this.selectedWeightUnitID,
      volumeUnit: this.selectedVolumeUnitID,
    };

    this.LCLContainers.forEach(element => {
      if (element.ContainerSpecID === container.ContainerSpecID) {
        element.selected = 0;
      }
    });
    this.lclForm.reset();

    this.calculateTotalShipment();
    this.formValidation = {
      invalid: true,
      message: ""
    };
    this.formValidation2 = {
      invalid: true,
      message: ""
    };
  }

  calculateTotalCBM() {
    this.volumetricWeight = 0;
    if (
      this.lclFields.height &&
      this.lclFields.length &&
      this.lclFields.width
    ) {
      if (this.lclFields.lengthUnitID === 2) {
        this.lclFields.volume =
          this.lclFields.length *
          0.01 *
          (this.lclFields.width * 0.01) *
          (this.lclFields.height * 0.01);
        this.totalCBM = this.lclFields.volume;
        this.volumetricWeight =
          (this.lclFields.length *
            0.01 *
            (this.lclFields.width * 0.01) *
            (this.lclFields.height * 0.01) *
            this.lclFields.quantity) /
          0.006;
      } else if (this.lclFields.lengthUnitID === 3) {
        this.lclFields.volume =
          this.lclFields.length *
          0.001 *
          (this.lclFields.width * 0.001) *
          (this.lclFields.height * 0.001);
        this.totalCBM = this.lclFields.volume;
        this.volumetricWeight =
          (this.lclFields.length *
            this.lclFields.width *
            this.lclFields.height *
            this.lclFields.quantity) /
          0.006;
      } else if (this.lclFields.lengthUnitID === 4) {
        this.lclFields.volume =
          this.lclFields.length *
          0.3048 *
          (this.lclFields.width * 0.3048) *
          (this.lclFields.height * 0.3048);
        this.totalCBM = this.lclFields.volume;
        this.volumetricWeight =
          (this.lclFields.length *
            this.lclFields.width *
            this.lclFields.height *
            this.lclFields.quantity) /
          0.006;
      } else if (this.lclFields.lengthUnitID === 5) {
        this.lclFields.volume =
          this.lclFields.length *
          0.0254 *
          (this.lclFields.width * 0.0254) *
          (this.lclFields.height * 0.0254);
        this.totalCBM = this.lclFields.volume;
        this.volumetricWeight =
          (this.lclFields.length *
            this.lclFields.width *
            this.lclFields.height *
            this.lclFields.quantity) /
          0.006;
      } else if (this.lclFields.lengthUnitID === 1) {
        this.lclFields.volume =
          this.lclFields.length *
          this.lclFields.width *
          this.lclFields.height;
        this.totalCBM = this.lclFields.volume;
        this.volumetricWeight =
          (this.lclFields.length *
            this.lclFields.width *
            this.lclFields.height *
            this.lclFields.quantity) /
          0.006;
      }
    }

    if (this.lclFields.weight) {
      this.lclFields.weight = this.lclFields.weight;
      if (this.lclFields.weightUnitID === 1) {
        this.lclFields.weight = this.lclFields.weight * 2.20462;
        // this.calcualtedTotalWeight = this.lclFields.weight;
        this.calcualtedTotalWeight =
          this.lclFields.weight * this.lclFields.quantity;
      } else if (this.lclFields.lengthUnitID === 3) {
        this.lclFields.weight = this.lclFields.weight * 2204.62;
        // this.calcualtedTotalWeight = this.lclFields.weight;
        this.calcualtedTotalWeight =
          this.lclFields.weight * this.lclFields.quantity;
      } else {
        this.calcualtedTotalWeight =
          this.lclFields.weight * this.lclFields.quantity;
      }
    }
  }

  public lastActiveContainer: number;

  zoom(val, container: Container, index: number) {
    this.LCLSinglePackages = [];
    if (this.lclFields.id !== container.ContainerSpecID) {
      this.lclForm.reset();
    }
    this.lastActiveContainer = container.ContainerSpecID;
    if (
      container.LClContainerInputs &&
      !container.LClContainerInputs.inpTotalWeight &&
      !container.LClContainerInputs.inpVolume
    ) {
      this.formValidation2 = {
        invalid: false,
        message: ""
      };
      this.formValidation = {
        invalid: false,
        message: ""
      };
    }
    this.showValidation = false;
    const { ContainerLoadType } = container;
    if (ContainerLoadType === "LCL" && this.addedLCLPackages.length) {
      this.LCLSinglePackages = this.addedLCLPackages.filter(
        e => e.packageType === container.ContainerSpecCode
      );
    }
    this.containerCount = 0;
    this.selectedContainer = container;
    this.SearchCriteriaContainerDetail.forEach(element => {
      if (element.contSpecID === container.ContainerSpecID) {
        this.showAddedContainers = true;
        this.containerCount = element.contRequestedQty;
        this.containerQuantity = this.containerCount;
      }
    });

    try {
      const $currentInput = this.$inpContainerCount.toArray()[index]
      $currentInput.nativeElement.focus()
    } catch (error) {
    }
  }

  validateCBM() {
    if (this.lclFields.lengthUnitID === 2) {
      if (
        this.lclForm.value.length < this.defaultCBMValues.cm ||
        this.lclForm.value.width < this.defaultCBMValues.cm ||
        this.lclForm.value.height < this.defaultCBMValues.cm
      ) {
        this.showValidation = true;
        this.validatedCBM = this.defaultCBMValues.cm;
      }
    } else if (this.lclFields.lengthUnitID === 3) {
      if (
        this.lclForm.value.length < this.defaultCBMValues.mm ||
        this.lclForm.value.width < this.defaultCBMValues.mm ||
        this.lclForm.value.height < this.defaultCBMValues.mm
      ) {
        this.showValidation = true;
        this.validatedCBM = this.defaultCBMValues.mm;
      }
    } else if (this.lclFields.lengthUnitID === 4) {
      if (
        this.lclForm.value.length < this.defaultCBMValues.ft ||
        this.lclForm.value.width < this.defaultCBMValues.ft ||
        this.lclForm.value.height < this.defaultCBMValues.ft
      ) {
        this.showValidation = true;
        this.validatedCBM = this.defaultCBMValues.ft;
      }
    } else if (this.lclFields.lengthUnitID === 5) {
      if (
        this.lclForm.value.length < this.defaultCBMValues.in ||
        this.lclForm.value.width < this.defaultCBMValues.in ||
        this.lclForm.value.height < this.defaultCBMValues.in
      ) {
        this.showValidation = true;
        this.validatedCBM = this.defaultCBMValues.in;
      }
    } else {
      if (
        this.lclForm.value.length < this.defaultCBMValues.m ||
        this.lclForm.value.width < this.defaultCBMValues.m ||
        this.lclForm.value.height < this.defaultCBMValues.m
      ) {
        this.showValidation = true;
        this.validatedCBM = this.defaultCBMValues.m;
      }
    }
  }


  async removeSelectedUnits(event, container: Container, index, item: LclChip) {
    event.stopPropagation();

    let hasPopped: boolean = false;
    this.addedLCLPackages.forEach(e => {
      if (JSON.stringify(item) === JSON.stringify(e) && !hasPopped) {
        let idx = this.addedLCLPackages.indexOf(e);
        this.addedLCLPackages.splice(idx, 1);
        hasPopped = true;
      }
    });

    let hasCaluclated: boolean = false;
    this.SearchCriteriaContainerDetail.forEach(element => {
      if (
        element.contSpecID === item.contSpecID &&
        !hasCaluclated
      ) {
        let index = this.SearchCriteriaContainerDetail.indexOf(element);
        this.SearchCriteriaContainerDetail.splice(index, 1);
        hasCaluclated = true;
      }
    });

    this.LCLContainers.forEach(e => {
      if (e.ContainerSpecID === item.contSpecID) {
        if (this.TransportMode.toLowerCase() === "sea") {
          let x = e.selected - item.contRequestedCBM;
          if (x === 0 || !this.addedLCLPackages.length) {
            e.selected = 0;
          } else {
            e.selected = x;
          }
        } else if (this.TransportMode.toLowerCase() === "air") {
          let y = e.selected - (item.contRequestedWeight > item.volumetricWeight ? item.contRequestedWeight : item.volumetricWeight);
          if (y === 0 || !this.addedLCLPackages.length) {
            e.selected = 0;
          } else {
            e.selected = y;
          }
        }
      }
    });
    const newLclPackageList = this.LCLSinglePackages.filter(
      pkg => pkg.contSpecID !== item.contSpecID
    );
    const newAddedLclPackages = this.addedLCLPackages.filter(
      pkg => pkg.contSpecID !== item.contSpecID
    );

    this.LCLSinglePackages = this.addedLCLPackages.filter(
      e => e.packageType === container.ContainerSpecCode
    );
    this.calculateTotalShipment();
    return;
  }

  // AIR WORKING
  async onShippingModeClick($shippingMode: ShippingArray, $index: number, resetTrck: boolean) {

    // resetting sea
    this.isModeChange = true
    this.activeContainerId = -1;
    this.lclForm.reset();
    this.SearchCriteriaContainerDetail = [];
    this.FCLContainers.forEach(e => {
      e.selected = 0;
    });
    this.LCLContainers.forEach(e => {
      e.selected = 0;
    });
    // this.FTLContainers.forEach(e => {
    //   e.selected = 0;
    // });
    // this.LTLContainers.forEach(e => {
    //   e.selected = 0;
    // });
    this.totalShipment = 0;
    this.totalVolumetricWeight = 0;
    this.addedLCLPackages = [];
    this.LCLSinglePackages = [];
    const { ShippingModeCode } = $shippingMode;

    if (
      ShippingModeCode.toLowerCase() === "sea" ||
      ShippingModeCode.toLowerCase() === "air" ||
      ShippingModeCode.toLowerCase() === "truck"
    ) {

      this.selectedModeId = $shippingMode.ShippingModeID

      this.shippingArray.forEach(element => {
        if (element.ShippingModeID === $shippingMode.ShippingModeID)
          this.selectedMode = element;
      });

      const filteredCaption: TransportModeCaption = this.portCaptionList.filter(
        caption =>
          caption.transModeCode.toLowerCase() === ShippingModeCode.toLowerCase()
      )[0];


      this.selectedModeCaption = filteredCaption;

      this.deliveryPortType = ShippingModeCode
      this.pickupPortType = ShippingModeCode

      this.resetSearchInputs()
      if (resetTrck) {
        removeCachedTrucks()
        HashStorage.removeItem('trucks')
      }
      this.removeAllGlow()
      setTimeout(() => {
        this.isModeChange = false
        setTimeout(() => {
          this.initBlinkingInputs()
        }, 0);
      }, 0);

      this.shippingArray[$index].isActive = true;
      const shipLenght = this.shippingArray.length;

      for (let index = 0; index < shipLenght; index++) {
        if (index !== $index) {
          this.shippingArray[index].isActive = false;
        }
      }
      this.searchTransportDetails = {
        modeOfTransportID: $shippingMode.ShippingModeID,
        modeOfTransportCode: $shippingMode.ShippingModeDesc,
        modeOfTransportDesc: $shippingMode.ShippingModeDesc
      };


      this.selectedShippingModeID = $shippingMode.ShippingModeID;
      this.selectedCatId = $shippingMode.ShippingCriteriaCat[0].ShippingCatID;

      this.hideLCL_FCL = false;
      this.activeContainerTabID = "fcl";
      this.showMainCategory = true;
      this.strSelectedMode = $shippingMode.ShippingModeCode;
      this.TransportMode = $shippingMode.ShippingModeCode;
      this.subCategory = $shippingMode.ShippingCriteriaCat[0].ShippingCriteriaSubCat;
      this.selectedSubCatId = this.subCategory[0].ShippingSubCatID;
      this.containersArray = this.subCategory[0].Containers;

      const tabOne = (ShippingModeCode.toLowerCase() === 'truck') ? 'FTL' : 'FCL'
      const tabTwo = (ShippingModeCode.toLowerCase() === 'truck') ? 'LTL' : 'LCL'

      this.FCLContainers = cloneObject(this.containersArray).filter(
        e => e.ContainerLoadType === tabOne
      );
      this.LCLContainers = this.containersArray.filter(
        e => e.ContainerLoadType === tabTwo
      );
      this.resetLclInputs();
      this.selectedModeIcon = 'icon_anchor.svg'
      if ($shippingMode.ShippingModeCode.toLowerCase() === "air") {
        this.hideLCL_FCL = true;
        this.activeContainerTabID = "lcl";
        this.showMainCategory = false;
        this.toggleLabel = 'By Total Volume'
        this.selectedModeIcon = 'icon_plane.svg'
      }

      const ports_to_get = (ShippingModeCode.toLowerCase() === 'truck') ? 'SEA' : ShippingModeCode;
      const newPorts: JsonResponse = await this._shippingService
        .getPortsData(ports_to_get)
        .toPromise();
      this.ports = newPorts;
      // HashStorage.setItem("shippingPortDetails", JSON.stringify(newPorts));
    }

  }

  resetSearchInputs() {

    this.pickup = {
      title: null,
      imageName: "",
      id: 0,
      code: "",
      shortName: ""
    };
    this.delivery = {
      title: null,
      imageName: "",
      id: 0,
      code: "",
      shortName: ""
    };
    setTimeout(() => {
      try {
        this.pickupBox.nativeElement.value = ''
      } catch (error) { }
      try {
        this.deliverBox.nativeElement.value = ''
      } catch (error) { }
    }, 0);
    this.pickupDate = {};
    if (this.TransportMode.toLowerCase() === 'air') {
      this.airInpData = {
        stackable: false,
        tempControl: false,
        bonded: false,
        quantity: null,
        length: null,
        height: null,
        width: null,
        area: null,
        totalWeight: null,
        totalWeightUnit: this.selectedWeightUnitID,
        lengthUnit: this.selectedLengthUnitID,
        weightUnit: this.selectedWeightUnitID,
        volumeUnit: this.selectedVolumeUnitID,
        areaUnit: this.selectedAreaUnitID,
        chargeableWeight: null
      }
    }
  }

  lclInputsChange($type: string, $change, $index: number) {
    if (!$type || !$change) {
      return;
    }
    switch ($type) {
      case "switch":
        this.LCLContainers[$index].LClContainerInputs.toggle = $change;
        this.lclFields.toggle = $change;
        // this.lclForm.controls["toggle"].setValue($change);
        return;
      case "quantity":
        this.LCLContainers[$index].LClContainerInputs.inpQuantity = $change;
        this.lclFields.quantity = $change;
        this.lclForm.controls["quantity"].setValue($change);
        return;
      case "length":
        this.LCLContainers[$index].LClContainerInputs.inpLenght = $change;
        this.lclFields.length = $change;
        this.lclForm.controls["length"].setValue($change);
        return;
      case "width":
        this.LCLContainers[$index].LClContainerInputs.inpWidth = $change;
        this.lclFields.width = $change;
        this.lclForm.controls["width"].setValue($change);
        return;
      case "height":
        this.LCLContainers[$index].LClContainerInputs.inpHeight = $change;
        this.lclFields.height = $change;
        this.lclForm.controls["height"].setValue($change);
        return;
      case "weight":
        this.LCLContainers[$index].LClContainerInputs.inpWeight = $change;
        this.lclFields.weight = $change;
        this.lclForm.controls["weight"].setValue($change);
        return;
      case "totalWeight":
        this.LCLContainers[$index].LClContainerInputs.inpTotalWeight = $change;
        this.lclFields.totalWeight = $change;
        this.lclForm.controls["totalWeight"].setValue($change);
        return;
      case "volume":
        this.LCLContainers[$index].LClContainerInputs.inpVolume = $change;
        this.lclFields.volume = $change;
        this.lclForm.controls["volume"].setValue($change);
        return;
      default:
        return;
    }
  }

  async resetLclInputs(event?, container?) {
    this.LCLContainers.forEach(container => {
      if (container.ContainerSpecCode === 'PLTS') {
        container.LClContainerInputs = {
          inpHeight: 160,
          inpLenght: 120,
          inpQuantity: null,
          inpWeight: null,
          inpWidth: 80,
          inpTotalWeight: null,
          inpVolume: null,
          lengthUnit: this.selectedLengthUnitID,
          weightUnit: this.selectedWeightUnitID,
          volumeUnit: this.selectedVolumeUnitID
        };
      } else {
        container.LClContainerInputs = {
          inpHeight: null,
          inpLenght: null,
          inpQuantity: null,
          inpWeight: null,
          inpWidth: null,
          inpTotalWeight: null,
          inpVolume: null,
          lengthUnit: this.selectedLengthUnitID,
          weightUnit: this.selectedWeightUnitID,
          volumeUnit: this.selectedVolumeUnitID
        };
      }

    });
  }

  toggleWithGreeting(tooltip, greeting: string) {
    if (tooltip.isOpen()) {
      tooltip.close();
    } else {
      tooltip.open({ greeting });
    }
  }



  ngAdToolTipClass() {
    setTimeout(() => {
      try {
        document.getElementsByTagName('ngb-tooltip-window')[0].classList.add('air-info-tooltip')
      } catch (error) { }
    }, 0);
  }

  onTruckSizeSelect($event) {
    const eventValue: any = $event.target.value
    if (eventValue && eventValue !== null && eventValue !== undefined && eventValue !== 'null') {
      const contDt: Array<number> = (eventValue + '').split(';').map(Number)
      this.FCLContainers[contDt[1]].ContainerSubDetail[contDt[2]].isSelected = !this.FCLContainers[contDt[1]].ContainerSubDetail[contDt[2]].isSelected
    }
  }

  onTruckAdd($container: any) {
    const { containerSpecId, quantity, JsonContainerSpecProp } = $container
    this.addContainer(quantity, containerSpecId, JsonContainerSpecProp)
  }

  setCurreny2Default() {
    try {
      this.loginUser = JSON.parse(Tea.getItem('loginUser'));
      this.loginUser
      HashStorage.removeItem('CURR_MASTER')
      if (this.loginUser && (this.loginUser && !this.loginUser.IsLogedOut)) {
        const { CurrencyID, CurrencyOwnCountryID } = this.loginUser
        if (CurrencyID && CurrencyID > -1) {
          this._currencyControl.setCurrencyID(CurrencyID)
          this._currencyControl.setToCountryID(CurrencyOwnCountryID)
        }
      } else {
        this._setupService.setCurrency2Location()
      }

      let exchnageRate: any = this._currencyControl.getExchangeRateList().rates.filter(rate => rate.currencyID === this._currencyControl.getCurrencyID())[0]
      console.log('exchnageRate:', exchnageRate);
      this._currencyControl.setExchangeRate(exchnageRate.rate)
    } catch (error) { }
  }

  removeTempCriteria() {
    HashStorage.removeItem('tempSearchCriteria');
  }

  public singleField: boolean = false;
  public filedChecks: any[] = []
  configureModalFields() {
    // this.customerSettings.isSeaPortRequired = true
    // this.customerSettings.isSeaDoorRequired = true
    // this.customerSettings.isSeaCityRequired = true
    if ((this.customerSettings.isSeaPortRequired && !this.customerSettings.isSeaDoorRequired && !this.customerSettings.isSeaCityRequired)
      || (!this.customerSettings.isSeaPortRequired && this.customerSettings.isSeaDoorRequired && !this.customerSettings.isSeaCityRequired)
      || (!this.customerSettings.isSeaPortRequired && !this.customerSettings.isSeaDoorRequired && this.customerSettings.isSeaCityRequired)) {
      this.singleField = true;
      if (this.customerSettings.isSeaCityRequired) {
        this.deliveryPortType = 'CITY'
        this.pickupPortType = 'CITY'
        this.searchCriteria.deliveryPortType = this.deliveryPortType
        this.searchCriteria.pickupPortType = this.pickupPortType
      }
    }
    // this.blinkingInputs();
  }

  airInpData: LclChip = {
    stackable: false,
    tempControl: false,
    bonded: false,
    quantity: null,
    length: null,
    height: null,
    width: null,
    area: null,
    totalWeight: null,
    totalWeightUnit: this.selectedWeightUnitID,
    lengthUnit: this.selectedLengthUnitID,
    weightUnit: this.selectedWeightUnitID,
    volumeUnit: this.selectedVolumeUnitID,
    areaUnit: this.selectedAreaUnitID,
    chargeableWeight: null
  }

  onAirInputChange($event: LclChip) {
    this.airInpData = $event
    this.searchCriteria.airChipData = $event
  }

  hoveredDate: NgbDate;
  public fromDate = {
    day: undefined,
    month: undefined,
    year: undefined
  };
  public toDate = {
    day: undefined,
    month: undefined,
    year: undefined
  };

  isHovered = date =>
    this.fromDate &&
    !this.toDate &&
    this.hoveredDate &&
    after(date, this.fromDate) &&
    before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);

  onDateSelection(date: NgbDateStruct) {
    let parsed = "";
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
      this.toDate = date;
      // this.model = `${this.fromDate.year} - ${this.toDate.year}`;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    if (this.fromDate) {
      parsed += this._parserFormatter.format(this.fromDate);
    }
    if (this.toDate) {
      parsed += " - " + this._parserFormatter.format(this.toDate);
      this.searchCriteria.isSearchByCalender = true
    }

    console.log(parsed);
    setTimeout(() => {
      this.calenderField.nativeElement.value = parsed;
      if (this.toDate) {
        this.eventDate.toggle();
      }
    }, 0);
  }

  isSearchInValid() {
    if (this.TransportMode.toLowerCase() === 'air') {
      try {
        const x = !!(!this.delivery.title || !this.pickup.title || !this.airInpData.chargeableWeight || this.airInpData.chargeableWeight === 0)
        return x
      } catch (error) {
        return true
      }
    } else {

      return !this.delivery.title || !this.pickup.title || this.SearchCriteriaContainerDetail.length < 1
    }
  }
  /**
   * NOTIFY CUSTOMER
   *
   * @memberof ShippingComponent
   */
  notify() {
    // let obj = {
    //   CustomerID: this.searchCriteria.CustomerID,
    //   CustomerType: this.searchCriteria.CustomerType,
    //   JSONSearchCriteria: JSON.stringify(this.searchCriteria),
    //   LoginUserID: this.searchCriteria.loggedID,
    //   userName: "string",
    //   companyName: "string",
    //   email: "string"
    // }
    // this._shippingService.notifyCustomer(obj).pipe(untilDestroyed(this)).subscribe((res: any) => {
    //   loading(false);
    //   this._toast.success('Successfully notified to customer', 'Success')
    // }, (err: any) => {
    //   console.log(err)
    // })
  }
}


const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one &&
  two &&
  two.year === one.year &&
  two.month === one.month &&
  two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two
    ? false
    : one.year === two.year
      ? one.month === two.month
        ? one.day === two.day
          ? false
          : one.day < two.day
        : one.month < two.month
      : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two
    ? false
    : one.year === two.year
      ? one.month === two.month
        ? one.day === two.day
          ? false
          : one.day > two.day
        : one.month > two.month
      : one.year > two.year;


export interface PickupDropOff {
  title: any; //tooltip
  imageName: string;
  id?: any;
  code?: string;
  shortName?: string;
  name?: string
  desc?: string
  lastUpdate?: string
  sortingOrder?: string
  type?: string
  webURL?: string
}

export interface TransportModeCaption {
  transModeCode: string;
  strPickup: string;
  strDeliver: string;
  strPickupIcon: string;
  strPickupParentIcon: string;
  strDeliverIcon: string;
  strDeliverParentIcon: string;
}

export interface TruckOptSelect {
  specId: number;
  containerIndex: number;
  subIndex: number;
}
