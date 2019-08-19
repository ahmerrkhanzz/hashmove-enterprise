import { LclChip, Container } from "./shipping.interface";
import { PickupDropOff } from "../components/main/shipping/shipping.component";

export class SearchCriteriaTransportationDetail {
  modeOfTransportID: number = 0;
  modeOfTransportCode: string = "";
  modeOfTransportDesc: string = "";
}

export class SearchCriteriaContainerDetail {
  contSpecID: number = 0;
  contRequestedQty: number = 0;
  contRequestedCBM: number = 0;
  contRequestedWeight: number = 0;
  volumetricWeight: number = 0;
  containerCode: string = '';
  IsTrackingApplicable?: boolean = false;
  IsQualityApplicable?: boolean = false;
  containerDtl?: Container
}

  export class SearchCriteria {
  // bookingCategoryID: number = 0;
  bookingCategoryID: number = 0;
  pickupPortID: number = 0;
  pickupPortCode: string = "";
  pickupPortName: string = "";
  deliveryPortID: number = 0;
  deliveryPortCode: string = "";
  deliveryPortName: string = "";
  pickupDate: string = "";
  pickupDateTo?: string = "";
  deliveryDate?: string = "";
  pickupFlexibleDays: number = 3;
  shippingModeID: number = 0;
  shippingCatID: number = 0;
  shippingSubCatID: number = 0;
  containerLoad: string = "FCL";
  imp_Exp: string = "EXP";
  carrierID: number = 0;
  routeIDs: string = "";
  etaInDays: number = 0;
  carrierEtdUtcDate: string = "";
  voyageRefNum: string = "";
  recordCounter?: number;
  searchMode?: string; //Refer to DOC-1 at the bottom
  totalChargeableWeight?: number;
  SearchCriteriaTransportationDetail: Array<SearchCriteriaTransportationDetail>;
  SearchCriteriaContainerDetail: Array<SearchCriteriaContainerDetail>;
  LclChips?: Array<LclChip>;
  TransportMode?: string;
  shippingModeId?: number;
  totalShipmentCMB?: number
  totalVolumetricWeight?: number
  deliveryPortType?: string
  pickupPortType?: string
  pickUpAddress?: string
  deliveryAddress?: string
  userPickup?: PickupDropOff
  userDelivery?: PickupDropOff
  SearchCriteriaPickupGroundDetail?: SearchCriteriaPickupGroundDetail
  SearchCriteriaDropGroundDetail?: SearchCriteriaDropGroundDetail
  portJsonData?: string | any = "[]";
  IDlist?: string | any
  criteriaFrom?: string
  selectedModeCaption?: any //only for shipment component use for tempSearchCriteria
  searchTransportDetails?: any //only for shipment component use for tempSearchCriteria
  ProviderID?: any;
  loggedID?: number;
  CustomerID: number;
  CustomerType: string;
  isSearchByCalender:boolean = false;
  chargeableWeight?: number = null
  cargoLoadType?: string = null
  airChipData?: LclChip
}


export interface SearchCriteriaPickupGroundDetail {
  Address: string;
  Lat: number;
  Lng: number
  AddressComponents: SearchCriteriaGroundDetailAddressComponents
}
export interface SearchCriteriaDropGroundDetail {
  Address: string;
  Lat: number;
  Lng: number
  AddressComponents: SearchCriteriaGroundDetailAddressComponents
}

export class SearchCriteriaGroundDetailAddressComponents {

  LongName_L1?: string = ""
  ShortName_L1?: string = ""
  ComponentDesc_L1?: string = ""

  LongName_L2?: string = ""
  ShortName_L2?: string = ""
  ComponentDesc_L2?: string = ""

  LongName_L3?: string = ""
  ShortName_L3?: string = ""
  ComponentDesc_L3?: string = ""

  LongName_L4?: string = ""
  ShortName_L4?: string = ""
  ComponentDesc_L4?: string = ""

  LongName_L5?: string = ""
  ShortName_L5?: string = ""
  ComponentDesc_L5?: string = ""

  LongName_L6?: string = ""
  ShortName_L6?: string = ""
  ComponentDesc_L6?: string = ""

}

export interface GeocoderAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

// Searcmode Keys (DOC-1)
// sea-fcl
// sea-lcl
// air-lcl
// warehouse-lcl
// truck-ftl
// truck-ltl
