import { TruckInput } from "../components/main/shipping/truck/truck.component";

export interface Container {
  ContainerSpecID?: number | any;
  ContainerSpecCode?: string | any;
  ContainerSpecDesc?: string | any;
  ContainerSpecImage?: string | any;
  ContainerSizeID?: number | any;
  ContainterLength?: number | any;
  ContainterWidth?: number | any;
  ContainterHeight?: number | any;
  MaxGrossWeight?: number | any;
  IsActive?: boolean | any;
  SortingOrder?: number | any;
  ContainerLoadType?: string | any;
  selected?: any
  CBM?: number | any
  LClContainerInputs?: LClContainerInputs
  LclChips?: Array<LclChip>
  ContainerSubDetail?: Array<ContainerSubDetail>;
  MinGWT?: number;
  MaxGWT?: number;
  WeightUnit?: string;
  truckInput?: TruckInput;
  truckChips?: Array<TruckInput>
  size?: any;
  totalQuantity?: Array<any>;
  JsonContainerSpecProp?: string;
}
export interface ContainerSubDetail {
  ContainerSpecID: number;
  ContainterLength: number;
  ContainterWidth: number;
  ContainterHeight: number;
  MaxGrossWeight: number;
  IsActive: boolean;
  DimensionUnit: string;
  WeightUnit: string;
  isSelected?: boolean | any;
  count?: number | any;
}

export interface LClContainerInputs {
  contSpecID?: number | any
  inpQuantity?: number | any
  inpLenght?: number | any
  inpWidth?: number | any
  inpHeight?: number | any
  inpWeight?: number | any
  inpTotalWeight?: number | any
  inpVolume?: number | any
  lengthUnit?: number | any
  weightUnit?: number | any
  volumeUnit?: number | any
  toggle?: boolean | any,
  volumetricWeight?: number | any;
}

export interface LclChip {
  contRequestedCBM?: number | any
  contRequestedQty?: number | any
  contRequestedWeight?: number | any
  contSpecID?: number | any
  height?: number | any
  inpHeight?: number | any
  length?: number | any
  inpLength?: number | any
  lengthUnit?: string | any
  packageType?: string | any
  quantity?: number | any
  totalWeight?: number | any
  inpTotalWeight?: number | any
  totalWeightUnit?: number | any
  volume?: number | any
  inpVolume?: number | any
  volumeUnit?: number | any
  weight?: number | any
  inpWeight?: number | any
  weightUnit?: string | any
  width?: number | any
  inpWidth?: number | any
  toggle?: boolean | any
  volumetricWeight?: number | any
  area?: number | any
  areaUnit?: string | any,
  stackable?: boolean
  tempControl?: boolean,
  bonded?: boolean
  chargeableWeight?: number | any
  cargoLoadType?: string
}

export interface ShippingCriteriaSubCat {
  ShippingSubCatID: number;
  ShippingSubCatCode: string;
  ShippingSubCatName: string;
  ShippingSubCatImage: string;
  ShippingSubCatDesc: string;
  SortingOrder: number;
  Containers: Container[];
}

export interface ShippingCriteriaCat {
  ShippingCatID: number;
  ShippingCatCode: string;
  ShippingCatName: string;
  ShippingCatImage: string;
  ShippingCatDesc: string;
  SortingOrder: number;
  ShippingCriteriaSubCat: ShippingCriteriaSubCat[];
}

export interface ShippingArray {
  ShippingModeID: number;
  ShippingModeCode: string;
  ShippingModeName: string;
  ShippingModeImage: string;
  ShippingModeDesc: string;
  SortingOrder: number;
  ShippingCriteriaCat: ShippingCriteriaCat[];
  isActive?: boolean
}
