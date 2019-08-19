import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewEncapsulation, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateFRParserFormatter } from '../../../../constants/ngb-date-parser-formatter';
import { LclChip } from '../../../../interfaces/shipping.interface';
import { HashStorage } from '../../../../constants/globalfunctions';
import { HttpErrorResponse } from '@angular/common/http';
import { ShippingService } from '../shipping.service';
@Component({
  selector: 'app-air-search',
  templateUrl: './air.component.html',
  styleUrls: ['./air.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter }
  ]
})
export class AirComponent implements OnInit, OnDestroy, OnChanges {
  @Input() airInpData: LclChip
  @Output() onInputChange = new EventEmitter<LclChip>();
  unitTabId: string
  public lengthUnits: any;
  public weightUnits: any;
  public volumeUnits: any;
  public selectedLengthUnit: number;
  public unitsResponse: any;
  public selectedLengthUnitID: number = 2;
  public selectedWeightUnitID: number = 6;
  public selectedVolumeUnitID: number = 9;
  public selectedAreaUnitID: number = 13;
  public areaUnits: any;
  public airData: LclChip = {
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
  };
  public totalCBM: number;
  public totalWeight: number;
  public totalArea: number;
  public currentJustify: string = "justified";
  isChargableFocus: boolean = false

  constructor(
    private _shippingService: ShippingService
  ) { }

  ngOnInit() {
    this.getWarehousingUnits();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.airInpData) {
      this.airData = this.airInpData
      try {
        this.unitTabId = this.airInpData.cargoLoadType

        this.weightUnits = this.airData.totalWeightUnit
        this.selectedLengthUnitID = this.airData.lengthUnit
        this.selectedWeightUnitID = this.airData.weightUnit
        this.selectedVolumeUnitID = this.airData.volumeUnit
        this.selectedAreaUnitID = this.airData.areaUnit
      } catch { }
    }
  }

  ngOnDestroy() {

  }

  tabChangeEvent(event) {
    this.unitTabId = event.nextId;

    this.airData.weight = null
    this.airData.volume = null

    this.airData.length = null
    this.airData.width = null
    this.airData.height = null
    this.airData.quantity = null

    this.calculateTotalCBM()
  }

  modelChange(event, type?: string) {
    if (event < 0) {
      Math.abs(event);
    }
    let numb = 0
    if (event || event === 0 || event > 0) {
      numb = event
    }
    if (numb) {
      this.airData.chargeableWeight = 0
    }

    try {
      if (type && type === 'totalWeight') {
        this.airData.totalWeight = numb
        try {
          this.airData.weight = null
          this.airData.volume = null

          this.airData.length = null
          this.airData.width = null
          this.airData.height = null
          this.airData.quantity = null
        } catch (error) { }

      } else if (type && type === 'weight' || type === 'volume') {
        if (type === 'weight') {
          this.airData.weight = numb
          this.airData.volume = null

          this.airData.length = null
          this.airData.width = null
          this.airData.height = null
          this.airData.quantity = null
        }
        else if (type === 'volume') {
          this.airData.volume = numb
          this.airData.weight = null

          this.airData.length = null
          this.airData.width = null
          this.airData.height = null
          this.airData.quantity = null
        }
        else if (type === 'length') {
          this.airData.length = numb
          this.airData.weight = null
          this.airData.volume = null
        }
        else if (type === 'height') {
          this.airData.height = numb
          this.airData.weight = null
          this.airData.volume = null
        }
        else if (type === 'quantity') {
          this.airData.quantity = numb
          this.airData.weight = null
          this.airData.volume = null
        }

        this.airData.totalWeight = null
      }

    } catch (error) { }
    this.calculateTotalCBM();
  }

  counter(pos, event) {
    if (
      this.airData.quantity === undefined ||
      this.airData.quantity === null ||
      !this.airData.quantity
    ) {
      this.airData.quantity = 0;
    }
    this.airData.quantity = parseInt(this.airData.quantity);
    if (pos === "plus") {
      if (this.airData.quantity <= 999) {
        this.airData.quantity++;
      } else {
        event.preventDefault();
      }
      this.calculateTotalCBM();
    } else if (pos === "minus" && this.airData.quantity > 0) {
      this.airData.quantity--;
      this.calculateTotalCBM();
    }
  }

  calculateTotalCBM() {
    const { unitTabId } = this;
    this.totalCBM = 0;
    this.totalWeight = 0;
    this.totalArea = 0;
    if (unitTabId === "by_unit") {
      if (
        this.airData.height &&
        this.airData.length &&
        this.airData.width
      ) {
        if (this.airData.lengthUnit === 2) {
          this.totalCBM =
            this.airData.length *
            0.01 *
            (this.airData.width * 0.01) *
            (this.airData.height * 0.01) *
            this.airData.quantity;
          this.totalArea =
            this.airData.length *
            0.0328084 *
            (this.airData.width * 0.0328084);
        } else if (this.airData.lengthUnit === 3) {
          this.totalCBM =
            this.airData.length *
            0.001 *
            (this.airData.width * 0.001) *
            (this.airData.height * 0.001) *
            this.airData.quantity;
          this.totalArea =
            this.airData.length *
            0.001 *
            (this.airData.width * 0.001);
        } else if (this.airData.lengthUnit === 4) {
          this.totalCBM =
            this.airData.length *
            0.3048 *
            (this.airData.width * 0.3048) *
            (this.airData.height * 0.3048) *
            this.airData.quantity;
          this.totalArea = this.airData.length * this.airData.width;
        } else if (this.airData.lengthUnit === 5) {
          this.totalCBM =
            this.airData.length *
            0.0254 *
            (this.airData.width * 0.0254) *
            (this.airData.height * 0.0254) *
            this.airData.quantity;
          this.totalArea =
            this.airData.length *
            0.0833333 *
            (this.airData.width * 0.0833333);
        } else if (this.airData.lengthUnit === 1) {
          this.totalCBM =
            this.airData.length *
            this.airData.width *
            this.airData.height *
            this.airData.quantity;
          this.totalArea =
            this.airData.length *
            3.28084 *
            (this.airData.width * 3.28084);
        }
      }
      if (this.airData.weight) {
        if (this.airData.weightUnit === 7) {
          this.totalWeight = this.airData.weight / 2.20462;
        } else if (this.airData.weightUnit === 8) {
          this.totalWeight = this.airData.weight * 2204.62;
        } else {
          this.totalWeight = this.airData.weight;
        }
      }
      if (this.airData.totalWeight) {
        if (this.airData.totalWeightUnit === 7) {
          this.totalWeight = this.airData.totalWeight / 2.20462;
        } else if (this.airData.totalWeightUnit === 8) {
          this.totalWeight = this.airData.totalWeight / 2204.62;
        } else {
          this.totalWeight = this.airData.totalWeight;
        }
      }
    } else {
      if (this.airData.totalWeight) {
        if (this.airData.totalWeightUnit === 7) {
          this.totalWeight = this.airData.totalWeight / 2.20462;
        } else if (this.airData.totalWeightUnit === 8) {
          this.totalWeight = this.airData.totalWeight / 2204.62;
        } else {
          this.totalWeight = this.airData.totalWeight;
        }
      } else {
      }
      if (this.airData.volume) {
        if (this.airData.volumeUnit === 10) {
          this.totalCBM = this.airData.volume * 0.0283168;
        } else {
          this.totalCBM = this.airData.volume;
        }
      }
      if (this.airData.area) {
        if (this.airData.areaUnit === 11) {
          this.totalArea = this.airData.area * 0.00107639;
        } else if (this.airData.areaUnit === 12) {
          this.totalArea = this.airData.area * 10.7639;
        } else if (this.airData.areaUnit === 13) {
          this.totalArea = this.airData.area;
        } else if (this.airData.areaUnit === 14) {
          this.totalArea = this.airData.area * 9;
        }
      }
    }
    this.totalArea = Math.ceil(this.totalArea);
    this.totalCBM = Math.ceil(this.totalCBM);
    this.totalWeight = Math.ceil(this.totalWeight);

    let weightOne: number = 0
    let weightTwo: number = 0
    let finWeight: number = 0

    try {
      weightOne = this.airData.weight
      weightTwo = this.totalCBM * 1.67

      finWeight = (weightOne > weightTwo) ? weightOne : weightTwo
    } catch (error) {
      console.warn('error:', error)
    }

    console.log(finWeight);


    this.airData.chargeableWeight = finWeight
    this.airData.cargoLoadType = this.unitTabId
    this.onInputChange.emit(this.airData)
  }

  onKeyUp(event, name?) {
    // if (event.target.value < 0 || event.target.value === "") {
    //   event.target.value = null;
    //   if (name === "length") {
    //     this.airData.length = null;
    //   } else if (name === "width") {
    //     this.airData.width = null;
    //   } else if (name === "height") {
    //     this.airData.height = null;
    //   } else if (name === "weight") {
    //     this.airData.weight = null;
    //   } else if (name === "area") {
    //     this.airData.area = null;
    //   } else if (name === "quantity") {
    //     this.airData.quantity = null;
    //   } else if (name === "volume") {
    //     this.airData.volume = null;
    //   } else if (name === "totalWeight") {
    //     console.log('544');
    //     this.airData.totalWeight = null;
    //   }
    //   event.preventDefault();
    // }
    // this.calculateTotalCBM();
  }


  onUnitChange(event, type) {
    event = parseInt(event);
    console.log(event);

    if (type === "length") {
      this.airData.lengthUnit = event;
      this.selectedLengthUnitID = event;
      this.calculateTotalCBM();
    } else if (type === "weight") {
      this.airData.weightUnit = event;
      this.selectedWeightUnitID = event;
      this.calculateTotalCBM();
    } else if (type === "volume") {
      this.airData.volumeUnit = event;
      this.selectedVolumeUnitID = event;
      this.calculateTotalCBM();
    } else if (type === "area") {
      this.airData.areaUnit = event;
      this.selectedAreaUnitID = event;
      this.calculateTotalCBM();
    } else if (type === "totalWeight") {
      this.airData.totalWeightUnit = event;
      this.selectedWeightUnitID = event;
      this.calculateTotalCBM();
    }
  }

  onKeypress(event, name?) {
    let charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
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
    } else if (name === "volume" || name === "area" || name === "totalWeight") {
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

  getWarehousingUnits() {
    if (!HashStorage.getItem("units")) {
      this._shippingService.getLCLUnits().subscribe(
        (res: Response) => {
          this.unitsResponse = res;
          this.setWarehousingUnits(this.unitsResponse.returnObject);
          HashStorage.setItem(
            "units",
            JSON.stringify(this.unitsResponse.returnObject)
          );
        },
        (err: HttpErrorResponse) => { }
      );
    } else {
      this.setWarehousingUnits(JSON.parse(HashStorage.getItem("units")));
    }
  }

  setWarehousingUnits(unitsResponse) {
    this.lengthUnits = unitsResponse.filter(e => e.UnitTypeNature === "LENGTH");
    this.weightUnits = unitsResponse.filter(e => e.UnitTypeNature === "WEIGHT");
    this.volumeUnits = unitsResponse.filter(e => e.UnitTypeNature === "VOLUME");
    this.areaUnits = unitsResponse.filter(e => e.UnitTypeNature === "AREA");
    this.selectedLengthUnit = parseInt(this.lengthUnits[1].UnitTypeID);
  }




}


export interface AirOutput {
  totalArea?: number
  totalCBM?: number
  totalWeight?: number
}
