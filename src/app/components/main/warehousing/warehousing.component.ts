import { Component, OnInit, ViewChild, OnDestroy, ElementRef, Input, EventEmitter, HostListener } from '@angular/core';
import { ShippingArray, Container, LclChip, ShippingCriteriaCat } from "../../../interfaces/shipping.interface";
import { WarehouseSearchCriteria, City } from '../../../interfaces/warehousing'
import { HashStorage, loading, getDateDiff, Tea } from '../../../constants/globalfunctions';
import { Observable } from 'rxjs/Observable';
import { HttpErrorResponse } from '@angular/common/http';
import { Dropdown } from '../../../interfaces/dropdown';
import { DropDownService } from '../../../services/dropdownservice/dropdown.service';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { map } from 'rxjs/operators/map';
import { NgbDateFRParserFormatter } from "../../../constants/ngb-date-parser-formatter";
import { ShippingService } from '../shipping/shipping.service';
import * as moment from "moment";
import { ToastrService } from 'ngx-toastr';
import { CookieService } from '../../../services/cookies.injectable';
import { Store } from '@ngrx/store';
import * as fromWarehousing from "../../search-results/warehousing-search/store";
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Router } from '@angular/router';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../../services/commonservice/data.service';
import { CodeValMst, CodeValMstModel } from '../../user/reports/resports.interface';
import { ISlimScrollOptions } from 'ngx-slimscroll/dist/app/ngx-slimscroll/classes/slimscroll-options.class';
import { SlimScrollEvent } from 'ngx-slimscroll';
import { from, of } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-warehousing',
  templateUrl: './warehousing.component.html',
  styleUrls: ['./warehousing.component.scss'],
  // encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter }],
  host: {
    "(document:click)": "closeDatepicker($event)"
  }
})
export class WarehousingComponent implements OnInit, OnDestroy {
  @Input() type?: string;
  public warehousingArray: Array<ShippingArray> = [];
  public warehousingCategories: Array<ShippingCriteriaCat> = [];
  public warehousingSubCategories: Array<any> = [];
  public selectedModeId: number;
  public selectedCatId: any;
  public selectedSubCatId: number;
  public selectedCategory: any;
  public currentJustify: string = 'justified';

  public cityList: Array<City> = [];
  public storeFrom: any = null;
  public storeUntil: any = null;
  public minDate: any = new Date();
  public maxDate: any;
  public displayMonths = 2;
  public navigation = "select";
  public showWeekNumbers = false;
  public city: City = {
    desc: '',
    id: null,
    imageName: '',
    shortName: '',
    title: ''
  }
  public lengthUnits: any;
  public weightUnits: any;
  public volumeUnits: any;
  public selectedLengthUnit: number;
  public unitsResponse: any;
  public selectedLengthUnitID: number = 2;
  public selectedWeightUnitID: number = 6;
  public selectedVolumeUnitID: number = 9;
  public selectedAreaUnitID: number = 13
  public areaUnits: any;
  public warehouseData: LclChip = {
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
    areaUnit: this.selectedAreaUnitID
  };
  public subWarehouseTabID: string = 'by_unit'
  public totalCBM: number;
  public totalWeight: number;
  public totalArea: number;
  public searchCriteria: WarehouseSearchCriteria | WarehouseSearchCriteria;
  //Store
  public $warehousingSearchResults: Observable<fromWarehousing.WarehousingState>;
  public tempSearchCriteria: any = {};

  //ViewChildren
  @ViewChild("d") eventDate;
  @ViewChild("d2") eventDate2;

  @ViewChild('elCity') elCity: ElementRef;

  //FirstTab
  @ViewChild('elVolume') elVolume: ElementRef;
  @ViewChild('elWeight') elWeight: ElementRef;

  //SecondTab
  @ViewChild('elArea') elArea: ElementRef;
  @ViewChild('elVolTotal') elVolTotal: ElementRef;
  @ViewChild('elWeightTotal') elWeightTotal: ElementRef;

  public warehouseTabId: string = 'shared_warehouse'
  activeCat: any
  public srch_lease_term: Array<CodeValMst> = []
  public selected_srch_lease_term: CodeValMst = new CodeValMstModel
  public srch_spce_req: Array<CodeValMst> = []
  public selected_srch_spce_req: CodeValMst = new CodeValMstModel

  opts: ISlimScrollOptions = {
    position: 'right',
    barBackground: '#C9C9C9',
    barOpacity: '0.8',
    barWidth: '5',
    barBorderRadius: '20',
    barMargin: '0',
    gridBackground: '#D9D9D9',
    gridOpacity: '1',
    gridWidth: '2',
    gridBorderRadius: '20',
    gridMargin: '0',
    alwaysVisible: true,
  };
  scrollEvents: EventEmitter<SlimScrollEvent>;
  isMod: boolean = false

  constructor(
    private _dropdownservice: DropDownService,
    private _shippingService: ShippingService,
    private _toast: ToastrService,
    private _cookieService: CookieService,
    private _store: Store<any>,
    private _router: Router,
    private _dataService: DataService
  ) {
    this.searchCriteria = new WarehouseSearchCriteria();
  }

  ngOnInit() {
    this.scrollEvents = new EventEmitter<SlimScrollEvent>();
    this.$warehousingSearchResults = this._store.select('warehousing_shippings')
    this.getCities()
    this.getWarehousingUnits()

    this.warehousingArray = JSON.parse(
      HashStorage.getItem("shippingCategories")
    ).filter(e => e.ShippingModeCode.toLowerCase() === 'warehouse')
    this.warehousingCategories = this.warehousingArray[0].ShippingCriteriaCat
    this.selectedModeId = this.warehousingArray[0].ShippingModeID
    this.warehousingSubCategories = this.warehousingCategories[0].ShippingCriteriaSubCat
    this.selectedCategory = this.warehousingCategories[0]
    this.selectedCatId = this.selectedCategory.ShippingCatID
    this.selectedSubCatId = this.warehousingSubCategories[0].ShippingSubCatID

    let tempData = JSON.parse(HashStorage.getItem('tempSearchCriteria'))
    if (tempData && tempData.mode && tempData.mode === 'temp') {
      this.isMod = true;
      try {
        this.setModifyData(tempData);
      } catch (error) { }
    }

    this._dataService.criteria.pipe(untilDestroyed(this)).subscribe(state => {
      const { isMod, from } = state
      if (from === 'warehouse' && isMod) {
        this.isMod = true;
        const searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'));
        try {
          this.setMSTLists()
          this.setModifyData(searchCriteria);
        } catch (error) { }
      }
    });

    this.setMSTLists()


    let date = new Date();
    this.minDate = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }
  async setMSTLists(): Promise<any> {
    const { isMod } = this

    const searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))

    if (!this.srch_lease_term || this.srch_lease_term.length === 0) {
      this._dropdownservice.getMstCodeVal('SRCH_LEASE_TERM').pipe(untilDestroyed(this)).subscribe((res: any) => {
        this.srch_lease_term = res
        if (isMod) {
          try {
            const selectedLease = this.srch_lease_term.filter(res => res.codeValID === searchCriteria.leaseCodeId)[0]
            
            if (selectedLease) {
              this.selected_srch_lease_term = selectedLease
            }
          } catch (error) { }
        }
      }, (error: HttpErrorResponse) => {
        const { message } = error
      })
    } else {
      if (isMod) {
        try {
          const selectedLease = this.srch_lease_term.filter(res => res.codeValID === searchCriteria.leaseCodeId)[0]
          
          if (selectedLease) {
            this.selected_srch_lease_term = selectedLease
          }
        } catch (error) { }
      }
    }
    if (this.srch_spce_req || this.srch_spce_req.length === 0) {
      this._dropdownservice.getMstCodeVal('SRCH_SPCE_REQ').pipe(untilDestroyed(this)).subscribe((res: any) => {
        this.srch_spce_req = res
        if (isMod) {
          try {
            const selectedSize = this.srch_spce_req.filter(res => res.codeValID === searchCriteria.sizeCodeId)[0]
            
            if (selectedSize) {
              this.selected_srch_spce_req = selectedSize
            }
          } catch (error) { }
        }
      }, (error: HttpErrorResponse) => {
        const { message } = error
        console.warn(message);
      })
    } else {
      if (isMod) {
        try {
          const selectedSize = this.srch_spce_req.filter(res => res.codeValID === searchCriteria.sizeCodeId)[0]
          
          if (selectedSize) {
            this.selected_srch_spce_req = selectedSize
          }
        } catch (error) { }
      }
    }
  }

  setModifyData(searchCriteria: WarehouseSearchCriteria) {
    const { SearchLog, cityObj, pickupDate, deliveryDate, subWarehouseTabID, ShippingCatID, ShippingSubCatID, warehouseTabId, sizeCodeId, leaseCodeId } = searchCriteria
    const { warehousingCategories } = this

    this.warehouseData = SearchLog
    this.city = cityObj
    
    this.storeFrom = pickupDate
    this.storeUntil = deliveryDate

    const { title } = cityObj
    this.subWarehouseTabID = subWarehouseTabID
    this.warehouseTabId = warehouseTabId

    let selectedCat


    warehousingCategories.forEach(wHouse => {
      if (wHouse.ShippingCatID === ShippingCatID) {
        selectedCat = wHouse
      }
    })

    this.activeCat = ShippingCatID
    this.tabClick(selectedCat, ShippingSubCatID)
    
    setTimeout(() => {
      try {
        this.elCity.nativeElement.value = title
        if (subWarehouseTabID === 'by_unit') {
          this.elVolume.nativeElement.value = SearchLog.lengthUnit
          this.elWeight.nativeElement.value = SearchLog.weightUnit
        } else {
          this.elArea.nativeElement.value = SearchLog.areaUnit
          this.elVolTotal.nativeElement.value = SearchLog.volumeUnit
          this.elWeightTotal.nativeElement.value = SearchLog.totalWeightUnit
        }
      } catch (error) { }
    }, 10);

    this.calculateTotalCBM()
  }

  /**
   *
   * On Sub Category Click
   * @param {object} event
   * @param {ID} subCat
   * @memberof WarehousingComponent
   */
  subCatClick(subCat) {
    if (subCat.hasOwnProperty("ShippingCatID")) {
      this.selectedSubCatId = subCat.ShippingCriteriaSubCat[0].ShippingSubCatID;
    } else {
      this.selectedSubCatId = subCat.ShippingSubCatID;
    }
  }


  /**
   *
   * On Category Click
   * @param {Object} cat
   * @param {Number} catCode
   * @param {string} type
   * @param {object} event
   * @memberof WarehousingComponent
   */
  tabClick(cat, subcatId?) {
    this.selectedCategory = cat
    this.selectedCatId = this.selectedCategory.ShippingCatID
    this.warehousingSubCategories = this.selectedCategory.ShippingCriteriaSubCat;
    if (subcatId) {
      this.selectedSubCatId = subcatId
    } else {
      this.selectedSubCatId = this.warehousingSubCategories[0].ShippingSubCatID;
    }
  }


  /**
   *
   * Get cities through API
   * @memberof WarehousingComponent
   */
  getCities() {
    this._dropdownservice.getCity().subscribe((res: any) => {
      this.cityList = res;
    }, (err: HttpErrorResponse) => {
    })
  }


  /**
   *
   * Close Datepicker when click outside
   * @param {object} e
   * @memberof WarehousingComponent
   */
  closeDatepicker(e) {
    if (e.clientX !== 0 && e.clientY !== 0 && (e.target.id != "hashDatepicker" || e.target.id != "hashDatepicker2") && this.eventDate && this.eventDate2) {
      this.eventDate.close();
      this.eventDate2.close();
    }
    if (e.target.id === "hashDatepicker") {
      let calenderBox = document.getElementsByTagName("ngb-datepicker")[0];
      if (!calenderBox) {
        this.eventDate.open();
        this.eventDate2.close();
      } else {
        this.eventDate.open();
        this.eventDate2.close();
      }
    } else if (e.target.id === "hashDatepicker2") {
      let calenderBox = document.getElementsByTagName("ngb-datepicker")[1];
      if (!calenderBox) {
        this.eventDate2.open();
        this.eventDate.close();
      } else {
        this.eventDate2.open();
        this.eventDate.close();
      }
    }
  }

  /**
   *
   * API call for getting Units
   * @memberof WarehousingComponent
   */
  getWarehousingUnits() {
    if (!HashStorage.getItem('units')) {
      this._shippingService.getLCLUnits().subscribe(
        (res: Response) => {
          this.unitsResponse = res;
          this.setWarehousingUnits(this.unitsResponse.returnObject)
          HashStorage.setItem('units', JSON.stringify(this.unitsResponse.returnObject))
        },
        (err: HttpErrorResponse) => {
        }
      );
    } else {
      this.setWarehousingUnits(JSON.parse(HashStorage.getItem('units')))
    }
  }

  /**
   *
   * Setting Warehouing units is already cached
   * @param {object} unitsResponse
   * @memberof WarehousingComponent
   */
  setWarehousingUnits(unitsResponse) {
    this.lengthUnits = unitsResponse.filter(
      e => e.UnitTypeNature === "LENGTH"
    );
    this.weightUnits = unitsResponse.filter(
      e => e.UnitTypeNature === "WEIGHT"
    );
    this.volumeUnits = unitsResponse.filter(
      e => e.UnitTypeNature === "VOLUME"
    );
    this.areaUnits = unitsResponse.filter(
      e => e.UnitTypeNature === "AREA"
    );
    this.selectedLengthUnit = parseInt(this.lengthUnits[1].UnitTypeID);
  }


  /**
   *
   * Tab Click Event
   * @param {object} event
   * @memberof WarehousingComponent
   */
  tabChangeEvent(event) {
    this.subWarehouseTabID = event.nextId
    this.clearByUnitData()
    this.clearByAreaData()
    this.clearFullWarehouse()
  }

  clearByUnitData() {
    this.warehouseData.length = null
    this.warehouseData.width = null
    this.warehouseData.height = null
    this.warehouseData.quantity = null
    this.warehouseData.weight = null
    this.totalCBM = 0
    this.totalWeight = 0
  }

  clearByAreaData() {
    this.warehouseData.area = null
    this.warehouseData.totalWeight = null
    this.warehouseData.volume = null
    this.totalCBM = 0
    this.totalWeight = 0
  }

  clearFullWarehouse() {
    this.selected_srch_lease_term = new CodeValMstModel()
    this.selected_srch_spce_req = new CodeValMstModel()
  }


  /**
   *
   * On Adding / Subtracting Quantity
   * @param {string} pos
   * @param {object} event
   * @memberof WarehousingComponent
   */
  counter(pos, event) {
    if (this.warehouseData.quantity === undefined || this.warehouseData.quantity === null || !this.warehouseData.quantity) {
      this.warehouseData.quantity = 0
    }
    this.warehouseData.quantity = parseInt(this.warehouseData.quantity)
    if (pos === "plus") {
      if (this.warehouseData.quantity <= 999) {
        this.warehouseData.quantity++;
      } else {
        event.preventDefault();
      }
      this.unitFocusOut()
    } else if (pos === "minus" && this.warehouseData.quantity > 0) {
      this.warehouseData.quantity--;
      this.unitFocusOut()
    }
  }


  onKeyUp(event, name?) {
    if (event.target.value < 0 || event.target.value === '') {
      event.target.value = null;
      if (name === 'length') {
        this.warehouseData.length = null
      } else if (name === 'width') {
        this.warehouseData.width = null
      } else if (name === 'height') {
        this.warehouseData.height = null
      } else if (name === 'weight') {
        this.warehouseData.weight = null
      } else if (name === 'area') {
        this.warehouseData.area = null
      } else if (name === 'quantity') {
        this.warehouseData.quantity = null
      } else if (name === 'volume') {
        this.warehouseData.volume = null
      } else if (name === 'totalWeight') {
        this.warehouseData.totalWeight = null
      }
      event.preventDefault()
    }
    this.unitFocusOut()
  }


  /**
   *
   * Validate number on key press
   * @param {object} event
   * @param {number} control
   * @param {string} name
   * @returns {boolean}
   * @memberof WarehousingComponent
   */
  onKeypress(event, name?) {
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
    } else if (name === "volume" || name === 'area' || name === 'totalWeight') {
      const pattern = /[0-9\+\-\ ]/;
      let inputChar = String.fromCharCode(event.charCode);
      if (
        (event.keyCode != 8 && !pattern.test(inputChar)) ||
        event.keyCode === 45
      ) {
        event.preventDefault();
      }
    }
    this.unitFocusOut()
  }


  /**
   *
   * Unit Change From Selection
   * @param {string} event
   * @param {string} type
   * @memberof WarehousingComponent
   */
  onUnitChange(event, type, ) {
    event = parseInt(event);
    if (type === "length") {
      this.warehouseData.lengthUnit = event;
      this.selectedLengthUnitID = event;
      this.unitFocusOut();
    } else if (type === "weight") {
      this.warehouseData.weightUnit = event;
      this.selectedWeightUnitID = event;
      this.unitFocusOut();
    } else if (type === "volume") {
      this.warehouseData.volumeUnit = event;
      this.selectedVolumeUnitID = event;
      this.unitFocusOut();
      // this.formValidation2 = {
      //   invalid: false,
      //   message: ''
      // }
    } else if (type === "area") {
      this.warehouseData.areaUnit = event;
      this.selectedAreaUnitID = event;
      this.unitFocusOut();
    }
    else if (type === "totalWeight") {
      this.warehouseData.totalWeightUnit = event;
      this.selectedWeightUnitID = event;
      this.unitFocusOut();
      // this.formValidation = {
      //   invalid: false,
      //   message: ''
      // }
    }
  }


  /**
   *
   * Calculating total size of shipment
   * @memberof WarehousingComponent
   */
  unitFocusOut() {
    // if (!this.warehouseData.toggle) {
    //   if (
    //     this.warehouseData.length &&
    //     this.warehouseData.width &&
    //     this.warehouseData.height &&
    //     this.warehouseData.quantity
    //   ) {
    //     this.calculateTotalCBM()
    //   } else if (this.warehouseData.weight) {
    //     this.calculateTotalCBM()
    //   }
    // } else if (this.warehouseData.toggle) {
    //   // if (this.warehouseData.area && this.warehouseData.volume && this.warehouseData.totalWeight) {
    //   //   this.calculateTotalCBM()
    //   // }
    this.calculateTotalCBM()
    // }
  }


  modelChange(event, type?: string) {
    if (event < 0) {
      Math.abs(event)
    }

    if (event > 0) {
      this.unitFocusOut()
    }
  }


  /**
   *
   * Calculate Total Size of Shipment
   * @memberof WarehousingComponent
   */
  calculateTotalCBM() {
    const { subWarehouseTabID } = this
    this.totalCBM = 0;
    this.totalWeight = 0;
    this.totalArea = 0;
    if (subWarehouseTabID === 'by_unit') {
      if (
        this.warehouseData.height &&
        this.warehouseData.length &&
        this.warehouseData.width
      ) {
        if (this.warehouseData.lengthUnit === 2) {
          this.totalCBM =
            (this.warehouseData.length *
              0.01) *
            (this.warehouseData.width * 0.01) *
            (this.warehouseData.height * 0.01) *
            this.warehouseData.quantity;
          this.totalArea = (this.warehouseData.length * 0.0328084) * (this.warehouseData.width * 0.0328084)
        } else if (this.warehouseData.lengthUnit === 3) {
          this.totalCBM =
            (this.warehouseData.length *
              0.001) *
            (this.warehouseData.width * 0.001) *
            (this.warehouseData.height * 0.001) *
            this.warehouseData.quantity;
          this.totalArea = (this.warehouseData.length * 0.001) * (this.warehouseData.width * 0.001)
        } else if (this.warehouseData.lengthUnit === 4) {
          this.totalCBM =
            (this.warehouseData.length *
              0.3048) *
            (this.warehouseData.width * 0.3048) *
            (this.warehouseData.height * 0.3048) *
            this.warehouseData.quantity;
          this.totalArea = this.warehouseData.length * this.warehouseData.width
        } else if (this.warehouseData.lengthUnit === 5) {
          this.totalCBM =
            (this.warehouseData.length * 0.0254) *
            (this.warehouseData.width * 0.0254) *
            (this.warehouseData.height * 0.0254) *
            this.warehouseData.quantity;
          this.totalArea = (this.warehouseData.length * 0.0833333) * (this.warehouseData.width * 0.0833333)
        } else if (this.warehouseData.lengthUnit === 1) {
          this.totalCBM =
            this.warehouseData.length *
            this.warehouseData.width *
            this.warehouseData.height *
            this.warehouseData.quantity;
          this.totalArea = (this.warehouseData.length * 3.28084) * (this.warehouseData.width * 3.28084)
        }
      }
      if (this.warehouseData.weight) {
        if (this.warehouseData.weightUnit === 7) {
          this.totalWeight =
            this.warehouseData.weight / 2.20462;
        } else if (this.warehouseData.weightUnit === 8) {
          this.totalWeight = this.warehouseData.weight * 2204.62;
        } else {
          this.totalWeight =
            this.warehouseData.weight;
        }
      }
    } else if (subWarehouseTabID === 'by_vol_weight' || subWarehouseTabID === 'by_area') {

      if (this.warehouseData.totalWeight) {
        if (this.warehouseData.totalWeightUnit === 7) {
          this.totalWeight =
            this.warehouseData.totalWeight / 2.20462;
        } else if (this.warehouseData.totalWeightUnit === 8) {
          this.totalWeight = this.warehouseData.totalWeight / 2204.62;
        } else {
          this.totalWeight =
            this.warehouseData.totalWeight;
        }
      }
      if (this.warehouseData.volume) {
        if (this.warehouseData.volumeUnit === 10) {
          this.totalCBM = this.warehouseData.volume * 0.0283168;
        } else {
          this.totalCBM = this.warehouseData.volume;
        }
      }
      if (this.warehouseData.area) {
        if (this.warehouseData.areaUnit === 11) {
          this.totalArea = this.warehouseData.area * 0.00107639
        } else if (this.warehouseData.areaUnit === 12) {
          this.totalArea = this.warehouseData.area * 10.7639
        } else if (this.warehouseData.areaUnit === 13) {
          this.totalArea = this.warehouseData.area
        } else if (this.warehouseData.areaUnit === 14) {
          this.totalArea = this.warehouseData.area * 9
        }
      }
    }
    this.totalArea = Math.ceil(this.totalArea)
    this.totalCBM = Math.ceil(this.totalCBM)
    this.totalWeight = Math.ceil(this.totalWeight)
  }

  /**
   *
   * On Toggle Change
   * @param {boolean} event
   * @param {string} type
   * @memberof WarehousingComponent
   */
  onSwitchChange(event, type) {
    if (type === 'stackable') {
      this.warehouseData.stackable = event
    } else if (type === 'tempControl') {
      this.warehouseData.tempControl = event
    } else if (type === 'bonded') {
      this.warehouseData.bonded = event
    }
  }


  /**
   *
   * API call for gettins search results data
   * @memberof WarehousingComponent
   */
  calculateWarehouseResult() {
    loading(true);

    try {
      this.getWarehouseSearchResult()
    } catch (error) {
      console.warn(error)
    }

  }

  getWarehouseSearchResult() {
    let pickupDate;
    let deliveryDate;
    const { warehouseTabId } = this

    if (warehouseTabId === 'shared_warehouse') {
      try {
        pickupDate = new Date(
          this.storeFrom.year,
          this.storeFrom.month - 1,
          this.storeFrom.day
        );
        deliveryDate = new Date(
          this.storeUntil.year,
          this.storeUntil.month - 1,
          this.storeUntil.day
        );
      } catch (error) { }
    }

    this.searchCriteria.CityID = this.city.id
    this.searchCriteria.StoreFrom = (pickupDate) ? (moment(pickupDate).format("L")) : null
    this.searchCriteria.StoreUntill = (deliveryDate) ? (moment(deliveryDate).format("L")) : null
    this.searchCriteria.CBM = this.totalCBM
    this.searchCriteria.SQFT = this.totalArea
    this.searchCriteria.KG = this.totalWeight
    this.searchCriteria.ReqStackable = this.warehouseData.stackable
    this.searchCriteria.ReqTempControl = this.warehouseData.tempControl
    this.searchCriteria.ReqBonded = this.warehouseData.bonded
    this.searchCriteria.SearchLog = this.warehouseData
    this.searchCriteria.searchMode = 'warehouse-lcl'
    this.searchCriteria.criteriaFrom = (this.type === 'vendor' ? 'vendor' : 'search')
    this.searchCriteria.CityName = this.city.title
    this.searchCriteria.TotalDays = (deliveryDate) ? (getDateDiff(moment(deliveryDate).format("L"), moment(pickupDate).format("L"), 'days', "MM-DD-YYYY")) : null
    this.searchCriteria.ShippingModeID = this.selectedModeId
    this.searchCriteria.ShippingCatID = this.selectedCatId
    this.searchCriteria.ShippingSubCatID = this.selectedSubCatId
    this.searchCriteria.cityObj = this.city
    this.searchCriteria.pickupDate = this.storeFrom
    this.searchCriteria.deliveryDate = this.storeUntil
    this.searchCriteria.subWarehouseTabID = this.subWarehouseTabID
    this.searchCriteria.warehouseTabId = this.warehouseTabId
    this.searchCriteria.storageType = (this.warehouseTabId === 'shared_warehouse') ? 'shared' : 'full' //Server Varbialbe (Dont touch)
    this.searchCriteria.searchBy = this.subWarehouseTabID //Server Varbialbe (Dont touch)
    if (this.warehouseTabId === 'full_warehouse') {
      this.searchCriteria.spaceReqFrom = this.selected_srch_spce_req.codeValPreVal
      this.searchCriteria.spaceReqUntill = this.selected_srch_spce_req.codeValNextVal
      this.searchCriteria.spaceReqString = this.selected_srch_spce_req.codeValDesc
      this.searchCriteria.minimumLeaseTerm = parseInt(this.selected_srch_lease_term.codeVal)
      this.searchCriteria.minimumLeaseTermString = this.selected_srch_lease_term.codeValDesc
      this.searchCriteria.sizeCodeId = this.selected_srch_spce_req.codeValID
      this.searchCriteria.leaseCodeId = this.selected_srch_lease_term.codeValID
      this.searchCriteria.containerLoad = 'FCL'
    }

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
    this._cookieService.deleteCookies();
    const currentDate = moment().format('ZZ')
    const finDate = parseFloat(currentDate) / 100
    this.searchCriteria.Offset = finDate

    if (warehouseTabId === 'shared_warehouse' && this.searchCriteria.StoreFrom === this.searchCriteria.StoreUntill) {
      this._toast.warning("Please select different from & to dates.");
      loading(false);
      return false;
    } else if (moment(this.searchCriteria.StoreFrom).format("YYYY-MM-DD") > moment(this.searchCriteria.StoreUntill).format("YYYY-MM-DD")) {
      this._toast.warning("Store from date cannot be greater than store until date");
      loading(false);
      return false;
    }
    HashStorage.setItem("searchCriteria", JSON.stringify(this.searchCriteria));
    if (this.type === 'vendor') {
      // this._dataService.closeBookingModal.next(true);
      let provider = JSON.parse(HashStorage.getItem('selectedProvider'))
      this.searchCriteria.ProviderID = provider.ProviderID
    }

    new Promise((resolve, reject) => {
      setTimeout(() => {
        this._dataService.isWarehouseDispatched = true
        resolve();
      }, 0)
    }).then(res => {
      setTimeout(() => {
        this._store.dispatch(
          new fromWarehousing.FetchingWarehousingData(this.searchCriteria)
        );
        this._dataService.modifySearch({ from: '', isMod: false })
      }, 0);
    })

    this.$warehousingSearchResults.pipe(untilDestroyed(this)).subscribe(state => {
      const { loaded, data, hassError } = state;
      if (loaded && (data || hassError)) {
        setTimeout(() => {
          if (this.type !== 'vendor') {
            this._router.navigate(["warehousing/warehousing-search"]).then(() => {
              loading(false);
            });
          } else {
            loading(true);
            this._dataService.closeBookingModal.next(true);
          }
        }, 100);
      }
    });
  }

  /**
   *
   * Typehead for Warehousing Location
   * @memberof WarehousingComponent
   */

  onChange($event) {
    

  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => (!term || term.length < 3) ? [] : this.cityList.filter(v => v.title.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
  // Added
  formatMatches = (value: any) => value.name || '';

  isCitySearching: boolean = false
  hasCitySearchFailed: boolean = false
  hasCitySearchSuccess: boolean = false

  search2 = (text$: Observable<string>) =>
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

  formatter = (x: { title: string, desc: string, imageName: string, shortName: string, id: number }) => {
    this.city.shortName = x.shortName;
    this.city.id = x.id
    this.city.imageName = x.imageName;
    this.city.title = x.title;
    this.city.desc = x.desc;
    return x.title
  };

  onCitySelect({ target }, city) {
    // const text$: Observable<string> = Observable.from([target.value])
    // text$.pipe(
    //   debounceTime(200),
    //   distinctUntilChanged(),
    //   map(term => (!term || term.length < 3) ? 
    // )
    if (target.value === "") {
      this.city = {};
    }
  }

  ngOnDestroy() {
    let tempData: any = {}
    tempData.SearchLog = this.warehouseData
    tempData.cityObj = this.city
    tempData.pickupDate = this.storeFrom
    tempData.deliveryDate = this.storeUntil
    tempData.subWarehouseTabID = this.subWarehouseTabID
    tempData.ShippingCatID = this.selectedCatId
    tempData.ShippingSubCatID = this.selectedSubCatId
    tempData.mode = 'temp'
    tempData.subWarehouseTabID = this.subWarehouseTabID
    tempData.warehouseTabId = this.warehouseTabId
    HashStorage.setItem('tempSearchCriteria', JSON.stringify(tempData))
  }

  onWarehouseTabChange($payload: any) {
    try {
      this.warehouseTabId = $payload.nextId
      
      
    } catch (error) { console.warn(error); }
    this.clearByUnitData()
    this.clearByAreaData()
    this.clearFullWarehouse()
    if (this.city && this.city.title) {
      setTimeout(() => {
        const { title } = this.city
        this.elCity.nativeElement.value = title
      }, 0);
    }
  }

  trackByFn(index: number, item: any) {
    return index;
  }


  onDropDownEvent($action: string, $payload: CodeValMst) {
    if ($action.toLowerCase() === 'srch_lease_term') {
      this.selected_srch_lease_term = $payload
    }
    if ($action.toLowerCase() === 'srch_spce_req') {
      this.selected_srch_spce_req = $payload
    }
  }

  isSearchInValid() {
    const { warehouseTabId, subWarehouseTabID } = this
    let isValid = false
    if (warehouseTabId === 'shared_warehouse') {
      if (subWarehouseTabID === 'by_area') {
        isValid = !!(this.totalArea && this.totalWeight && this.city.id && this.storeFrom && this.storeUntil)
      }
      if (subWarehouseTabID === 'by_vol_weight') {
        isValid = !!(this.totalCBM && this.totalWeight && this.city.id && this.storeFrom && this.storeUntil)
      }
      if (subWarehouseTabID === 'by_unit') {
        isValid = !!(this.warehouseData.length && this.warehouseData.width && this.warehouseData.height && this.totalCBM && this.totalWeight && this.city.id && this.storeFrom && this.storeUntil)
      }
    }
    if (warehouseTabId === 'full_warehouse') {
      isValid = Boolean((this.city.id && this.selected_srch_lease_term.codeValID > -1 && this.selected_srch_spce_req.codeValID > -1))
    }
    return isValid
  }

  @HostListener('window:keyup.shift.c', ['$event'])
  keyCEvent(event: KeyboardEvent) {
    
    try {
      this.elCity.nativeElement.focus()
    } catch (error) {
      this._toast.warning('loding data')
    }
  }
  @HostListener('window:keyup.shift.f', ['$event'])
  keyFullEvent(event: KeyboardEvent) {
    
    try {
      this.warehouseTabId = 'full_warehouse'
    } catch (error) {
      this._toast.warning('loding data')
    }
  }

}
