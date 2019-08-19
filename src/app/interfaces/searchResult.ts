export interface SearchResult {
  ActualRouteIDs: string,
  BaseCurrencyID: number,
  CarrierID: number,
  CarrierImage?: string,
  CarrierDisplayImage?: string,
  CarrierName: string,
  CurrencyCode: string,
  CurrencyID: number,
  EtaInDays: number,
  EtaLcl: string,
  EtaUtc: string,
  EtdLcl: string,
  EtdUtc: string,
  FreeTimeAtPort: number,
  IDlist: string,
  IsAnyRestriction?: boolean,
  IsHazardousAllowed?: boolean,
  IsTrending: boolean,
  LayOverIDs: string,
  MaxTotalPrice: number,
  MinTotalPrice: number,
  PodCode: string,
  PodID: number,
  PodModeOfTrans: string,
  PolCode: string,
  PolID: number,
  PolModeOfTrans: string,
  PortCutOffLcl: string,
  PortCutOffUtc: string,
  Route: string,
  RouteIDs: string,
  TransfersStop: number,
  VesselCode?: string,
  VesselName?: string,
  VoyageRefNum?: string,

  PolCountryName?: string;
  PodCountryName?: string;

  PolName?: string;
  PodName?: string;

  CommPrice: number,
  CreditDays?: number,
  DealDet?: string,
  DiscountPrice?: number,
  IsFreeCancellation?: boolean,
  IsNAFLProvider?: boolean,
  IsPremiumProvider?: boolean,
  IsRecommended: boolean,
  ProviderBusYear?: number,
  ProviderID: number,
  ProviderImage?: string,
  ProviderDisplayImage?: string,
  ProviderInsurancePercent: number,
  ProviderName: string,
  TotalPrice: number,
  IsInsuranceProvider: boolean

  //Newly Added for ExchangeRage

  BaseCurrencyCode: string
  ExchangeRate: number

  BaseMaxTotalPrice: number,
  BaseMinTotalPrice: number,

  ActualMaxTotalPrice: number,
  ActualMinTotalPrice: number,

  BaseTotalPrice: number
  ActualTotalPrice: number;

  PortJsonData?: string | any

  // ProviderID: number;
  // TotalPrice: number;
  // BaseCurrencyPrice: number;
  // DiscountPrice?: number;
  // CreditDays?: number;
  // DealDet?: string;
  // ProviderImage?: string;
  // IsFreeCancellation?: boolean;
  // IsPremiumProvider?: boolean;
  // IsNAFLProvider?: boolean;
  // IsRecommended: boolean;
  // ProviderBusYear?: number;
  // RouteDetail: RouteMap
  IsNvocc?: boolean;
  MinTransitDays?: any;
}

export interface SearchResultProviders {
  ProviderID: number;
  ProviderImage?: string;
  ProviderName: string;
}

export interface SearchResultCarriers {
  CarrierID: number;
  CarrierImage?: string;
  CarrierName: string;
}


export interface SearchResultSummary {
  fastestRouteDays: number;
  fastestRoutePrice: number;
  bestRouteDays: number;
  bestRoutePrice: number;
  fastestRouteCurrency: string;
  bestRouteCurrency: string;
}

export interface SearchResultSummary {
  fastestRouteDays: number;
  fastestRoutePrice: number;
  bestRouteDays: number;
  bestRoutePrice: number;
  fastestRouteCurrency: string;
  bestRouteCurrency: string;
}

export interface RouteMap {
  Route: String
  TransitTime: number
  CarrierName: String
  CarrierImage: String
  FreeTimeAtPort: number
  RouteInfo: Array<RouteInfo>
}

interface RouteInfo {
  DateUtc: string
  DateLcl: string
  ModeOfTrans: string
  RouteDesc: string

}

export interface TransportInfo {
  PortName: String,
  Transport: String
}


export interface ProvidersSearchResult {
  ProviderName: string;
  CarrierName?: string;
  Route?: string;
  RouteIDs?: string;
  LayOverIDs?: string;
  TransfersStop?: number;
  PolCode?: string;
  PodCode?: string;
  EtdUtc?: string;
  EtdLcl?: string;
  EtaUtc?: string;
  EtaLcl?: string;
  PortCutOffUtc?: string;
  PortCutOffLcl?: string;
  EtaInDays?: number;
  PolModeOfTrans?: string;
  PodModeOfTrans?: string;
  ProviderID?: number;

  CarrierID?: number;
  CreditDays?: number;
  CarrierImage?: string;
  CarrierDisplayImage?: string;
  ProviderImage?: string;
  ProviderDisplayImage?: string;
  PolID?: number;
  PodID?: number;
  FreeTimeAtPort?: number;
  IsHazardousAllowed?: boolean;
  IsFreeCancellation?: boolean;
  IsPremiumProvider?: boolean;
  IsAnyRestriction?: boolean;
  IsNAFLProvider?: boolean;
  ProviderBusYear?: number;
  IsRecommended?: boolean;
  IsTrending?: boolean;
  DealDet?: string;
  VesselCode?: string;
  VesselName?: string;
  VoyageRefNum?: string;
  ActualRouteIDs?: string;
  IsInsuranceProvider?: boolean;
  ProviderInsurancePercent?: number;
  IDlist?: string;

  CurrencyID?: number;
  CurrencyCode?: string;
  TotalPrice?: number;
  DiscountPrice?: number;
  CommPrice?: number;

  BaseCurrencyID?: any;
  BaseCurrencyCode?: string,
  BaseTotalPrice?: number
  BaseDiscountPrice?: number
  BaseCommPrice?: number

  MinTotalPrice?: number,
  MaxTotalPrice?: number,
  ActualMinTotalPrice?: number,
  ActualMaxTotalPrice?: number,
  BaseMinTotalPrice?: number,
  BaseMaxTotalPrice?: number,

  ActualTotalPrice?: number
  ActualDiscountPrice?: number
  ActualCommPrice?: number

  ExchangeRate?: number
  BaseCurrencyPrice?: number;

  FlightNo?: string
  AirCraftInfo?: string
  PortJsonData?: string | any,
  NoOfCarrier?: number,
  JsonDestinationPorts?: any,
  JsonOriginPorts?: any,
  IsCustomerRecommended?: boolean
}

export interface PriceReqParams {
  imp_Exp: any
  bookingReferenceIDs: any;
  shippingMode: any;
  SearchCriteriaContainerDetail: any;
  PortJsonData?: string | any
  deliveryPortType?: string
  pickupPortType?: string,
  customerID?: number
}

export interface HashmoveLocation {
  PolName: string;
  PodName: string;
}