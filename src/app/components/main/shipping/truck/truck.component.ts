import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, SimpleChange, OnDestroy } from '@angular/core';
import { Container } from '../../../../interfaces/shipping.interface';
import { HashStorage } from '../../../../constants/globalfunctions';
import { ISlimScrollOptions, SlimScrollEvent } from 'ngx-slimscroll';
@Component({
  selector: 'app-truck',
  templateUrl: './truck.component.html',
  styleUrls: ['./truck.component.scss']
})
export class TruckComponent implements OnInit, OnChanges, OnDestroy {
  @Input() trucks: Container[];
  opts: ISlimScrollOptions;
  scrollEvents: EventEmitter<SlimScrollEvent>;

  public activeContainerId: number;
  public truckData: any = []
  public addedTrucks: any = [];
  public truckInput: TruckInput = {
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
  // public containerCount: any = 0;
  @Output() addContainerEvent = new EventEmitter<any>();
  @Output() removeContainerEvent = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    this.scrollEvents = new EventEmitter<SlimScrollEvent>();
    this.opts = {
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
    }
    this.trucks.forEach(e => {
      if (!e.totalQuantity) {
        e.totalQuantity = [];
      }
    })
    this.resetTruckList()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.trucks) {
      this.resetTruckList()
    }

  }


  resetTruckList() {
    this.trucks.forEach(element => {
      if (!element.truckInput || element.truckInput === undefined) {
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
      }
      if (!element.truckChips) {
        element.truckChips = []
      }
    });
  }

  onTruckSizeSelect($event, $text: string, jsonContProp: string) {

    // const eventValue: any = $event.target.value
    const eventValue: any = $event
    // i=0; containerSpecId, i=1 main-container-index, i=2 sub-container-index
    const contDt: Array<number> = (eventValue + '').split(';').map(Number)
    this.trucks[contDt[1]].truckInput.size = this.trucks[contDt[1]].ContainerSubDetail[contDt[2]].ContainterLength
    this.trucks[contDt[1]].truckInput.sizeUnit = this.trucks[contDt[1]].ContainerSubDetail[contDt[2]].DimensionUnit
    this.trucks[contDt[1]].truckInput.containerSpecId = this.trucks[contDt[1]].ContainerSubDetail[contDt[2]].ContainerSpecID
    this.trucks[contDt[1]].truckInput.containerSpecCode = this.trucks[contDt[1]].ContainerSpecCode
    this.trucks[contDt[1]].truckInput.WeightUnit = this.trucks[contDt[1]].ContainerSubDetail[contDt[2]].WeightUnit
    this.trucks[contDt[1]].truckInput.MaxGrossWeight = this.trucks[contDt[1]].ContainerSubDetail[contDt[2]].MaxGrossWeight
    this.trucks[contDt[1]].truckInput.selectedOpt = $text
    this.trucks[contDt[1]].truckInput.JsonContainerSpecProp = jsonContProp

  }



  closeLCLContainer() {
    this.activeContainerId = -1;
  }

  zoomLCLContainer(container, index) {
    this.activeContainerId = index;
  }

  counter(pos: string, type: any, specID: number, index?: number) {
    if (pos === "plus" && this.trucks[index].truckInput.quantity < 9999) {
      this.trucks[index].truckInput.quantity++
    } else if (pos === "minus" && this.trucks[index].truckInput.quantity > 0) {
      this.trucks[index].truckInput.quantity--
    }
  }

  onKeydown(event, index, val, model) {
    if (!val.value && model && event.keyCode === 8) {
      this.trucks[index].truckInput.quantity = null;
      this.truckInput.quantity = null;
    }
  }

  onKeypress(event, name, container) {
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
  }

  focusIn(container) {
    // this.showValidation = false;
    // if (this.showFields) {
    //   this.lclForm.controls["volume"].setValidators([
    //     Validators.required,
    //     Validators.max(container.CBM)
    //   ]);
    //   this.lclForm.controls["totalWeight"].setValidators([
    //     Validators.required,
    //     Validators.max(container.MaxGrossWeight)
    //   ]);
    // } else {
    //   this.lclForm.controls["length"].setValidators([
    //     Validators.required,
    //     Validators.max(container.ContainterLength)
    //   ]);
    //   this.lclForm.controls["width"].setValidators([
    //     Validators.required,
    //     Validators.max(container.ContainterWidth)
    //   ]);
    //   this.lclForm.controls["height"].setValidators([
    //     Validators.required,
    //     Validators.max(container.ContainterHeight)
    //   ]);
    //   this.lclForm.controls["weight"].setValidators([
    //     Validators.required,
    //     Validators.max(container.MaxGrossWeight)
    //   ]);
    // }
  }

  lclInputsChange($type: string, $change, $index: number) {
    if (!$type || !$change) {
      return;
    }
    switch ($type) {
      case "switch":
        this.trucks[$index].truckInput.toggle = $change;
        this.truckInput.toggle = $change;
        // this.lclForm.controls["toggle"].setValue($change);
        return;
      case "quantity":
        this.trucks[$index].truckInput.quantity = $change;
        this.truckInput.quantity = $change;
        return;
      default:
        return;
    }
  }

  submitLCLForm($index: number, $container: Container, $event: any) {
    const { quantity, containerSpecId, selectedOpt } = this.trucks[$index].truckInput
    let x = parseInt(quantity)
    if (!quantity || !containerSpecId || selectedOpt.toLowerCase() === 'select size') {
      return
    }

    let isPreviousModed = false

    if (this.trucks[$index].truckChips && this.trucks[$index].truckChips.length > 0) {
      this.trucks[$index].truckChips.forEach(truck => {
        if (truck.containerSpecId === containerSpecId) {
          truck.quantity = parseInt(truck.quantity) + parseInt(quantity)
          isPreviousModed = true
        }
      })
    }

    if (!isPreviousModed) {
      this.trucks[$index].truckChips.push($container.truckInput)
    }

    this.trucks[$index].truckInput.selectedOpt = 'Select Size'
    if (this.trucks[$index].totalQuantity) {
      this.trucks[$index].totalQuantity.push(x);
    } else {
      this.trucks[$index].totalQuantity = []
      this.trucks[$index].totalQuantity.push(x);
    }

    const { JsonContainerSpecProp } = this.trucks[$index].truckInput
    const output = {
      JsonContainerSpecProp,
      quantity,
      containerSpecId,
      index: $index
    }
    this.trucks[$index].truckInput = {
      quantity: null,
      size: null,
      sizeUnit: null,
      containerSpecId: null,
      containerSpecCode: null,
      toggle: null,
      MaxGrossWeight: null,
      WeightUnit: null,
      // selectedOpt: -1
      selectedOpt: 'Select Size'
    }

    const trcks = this.trucks
    setCachedTrucks(trcks)

    this.addContainerEvent.emit(output)
  }

  getTotalTruckQuantity(arr) {
    let quantityTotal = []
    quantityTotal = arr.reduce((all, item) => {
      return all + item;
    });
    return quantityTotal;
  }

  onKeyUp(event, name?) {
    if (event.target.value < 0 || event.target.value === '') {
      event.target.value = null;
      if (name === 'quantity') {
        this.truckInput.quantity = null
      }
      event.preventDefault()
    }
  }

  async onTruckRemove($event, $containerSpecId: number, $containerIndex: number, $subContIndex: number) {
    $event.stopPropagation();
    this.trucks[$containerIndex].truckChips.splice($subContIndex, 1);
    this.trucks[$containerIndex].totalQuantity.splice($subContIndex, 1);
    setCachedTrucks(this.trucks)
    this.removeContainerEvent.emit($containerSpecId)
    return;
  }

  ngOnDestroy() {
    HashStorage.setItem('trucks', JSON.stringify(this.trucks))
  }

}
export interface TruckInput {
  quantity?: any,
  size?: string | any,
  sizeUnit?: string,
  containerSpecId?: number,
  containerSpecCode?: string
  toggle?: any
  MaxGrossWeight?: number
  WeightUnit?: string
  selectedOpt?: any
  JsonContainerSpecProp?: string;
}

export const getCachedTrucks = () => {
  return JSON.parse(HashStorage.getItem("cchTrckList"));
}

export const setCachedTrucks = (obj) => {
  HashStorage.setItem("cchTrckList", JSON.stringify(obj));
}

export const removeCachedTrucks = () => {
  HashStorage.removeItem("cchTrckList");
}
