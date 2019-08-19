
export interface BookingContainerDetail {
  ContainerSpecID: number;
  ContainerSpecCode: string;
  ContainerSpecDesc: string;
  BookingContTypeQty: number;
  BookingPkgTypeCBM?: any;
  BookingPkgTypeWeight?: any;
  ContainerSpecShortName?: any;
  IsTrackingRequired?: boolean;
  IsQualityMonitoringRequired?: boolean;
  JsonContainerInfo?: string;
  parsedJsonContainerInfo?: any
}

export interface BookingRouteDetail {
  PolPodCode: string;
  EtdUtc: string;
  EtdLcl: string;
  EtaUtc: string;
  EtaLcl: string;
}

export interface BookingPriceDetail {
  SurchargeType: string;
  SurchargeID: number;
  SurchargeCode: string;
  SurchargeName: string;
  SurchargeBasis: string;
  ContainerSpecID?: number;
  CurrencyID: number;
  CurrencyCode: string;
  BaseCurrencyID: number;
  BaseCurrencyCode: string;
  TotalAmount: number;
  BaseCurrTotalAmount: number;
  IndividualPrice?: number;
  BaseCurrIndividualPrice?: number;
  SortingOrder: number;
  TransMode: string;
  ExchangeRate: number;
  ActualIndividualPrice: number;
  ActualTotalAmount: number;
}

export interface BookingDocumentDetail {
  DocumentTypeID: number;
  DocumentTypeCode: string;
  DocumentTypeName: string;
  DocumentTypeDesc: string;
  SortingOrder: number;
  DocumentNature: string;
  DocumentSubProcess: string;
  DocumentID?: any;
  UserID?: any;
  BookingID?: any;
  CompanyID?: any;
  ProviderID?: any;
  DocumentName: string;
  DocumentDesc: string;
  DocumentFileName?: string;
  DocumentFileContent: string;
  DocumentUploadedFileType?: any;
  DocumentLastStatus?: any;
  ExpiryStatusCode: string;
  ExpiryStatusMessage: string;
  DocumentUploadDate?: any;
  IsDownloadable: boolean;
  IsApprovalRequired: boolean;
  MetaInfoKeysDetail?: any;
  IsUploadable: boolean;
  BusinessLogic: string;
  CopyOfDocTypeID: number;
  ReasonID?: number;
  ReasonCode?: string;
  ReasonName?: string;
  DocumentStausRemarks?: string;
  StatusAction?: string;
}

export interface RouteInfo {
  DateUtc: string;
  DateLcl: string;
  ModeOfTrans: string;
  RouteDesc: string;
  IsPassed: boolean;
  PortCode: string;
  PortName: string;
  Latitude?: number;
  Longitude?: number;
  FlightNo?: string;
  AirCraftInfo?: string;
}

export interface BookingRouteMapInfo {
  Route: string;
  TransitTime: number;
  CarrierName: string;
  CarrierImage: string;
  FreeTimeAtPort: number;
  RouteInfo: RouteInfo[];
}

export interface ViewBookingDetails {
  BookingID: number;
  HashMoveBookingNum: string;
  HashMoveBookingDate: string;
  ShippingModeName: string;
  ShippingModeCode: string;
  ShippingCatName: string;
  ShippingSubCatName: string;
  PolCode: string;
  PolName: string;
  PolImage?: string;
  PolLatitude?: number;
  PolLongitude?: number;
  PodCode: string;
  PodName: string;
  PodImage?: string;
  PodLatitude?: number;
  PodLongitude?: number;
  PolModeOfTrans: string;
  PodModeOfTrans: string;
  ContainerLoad: string;
  ContainerCount: number;
  EtdUtc?: string;
  EtdLcl?: string;
  EtaUtc?: string;
  EtaLcl?: string;
  TransitTime: number;
  PortCutOffUtc?: string;
  PortCutOffLcl?: string;
  FreeTimeAtPort: number;
  ProviderID: number;
  ProviderName: string;
  ProviderImage: string;
  ProviderDisplayImage?: string;
  ProviderEmail: string;
  ProviderPhone: string;
  CarrierID: number;
  CarrierName: string;
  CarrierImage: string;
  CarrierDisplayImage?: string;
  VesselCode: string;
  VesselName: string;
  VoyageRefNum: string;
  IsInsured: boolean;
  IsAnyRestriction: boolean;
  PolID: number;
  PodID: number;
  EtaInDays: number;
  IDlist: string;
  CurrencyID: number;
  CurrencyCode: string;
  BookingTotalAmount: number;
  BaseCurrencyID: number;
  BaseCurrencyCode: string;
  BaseCurrTotalAmount: number;
  ExchangeRate: number;
  DiscountPercent?: any;
  DiscountPrice?: any;
  ShippingModeID: number;
  ShippingSubCatID: number;
  ShippingCatID: number;
  InsuredGoodsPrice: number;
  InsuredGoodsCurrencyID?: any;
  InsuredGoodsCurrencyCode?: any;
  IsInsuredGoodsBrandNew?: any;
  InsuredGoodsProviderID?: any;
  InsuredStatus: string;
  ProviderInsurancePercent?: any;
  IsInsuranceProvider: boolean;
  InsuredGoodsBaseCurrencyID?: any;
  InsuredGoodsBaseCurrPrice?: any;
  InsuredGoodsActualPrice?: any;
  InsuredGoodsExchangeRate?: any;
  BookingStatus: string;
  UserName: string;
  UserCountryName: string;
  UserCityName: string;
  PolCountry: string;
  PodCountry: string;
  CommodityType?: any;
  DiscountedPrice?: any;
  BookingContainerDetail: BookingContainerDetail[];
  BookingRouteDetail: BookingRouteDetail[];
  BookingPriceDetail: BookingPriceDetail[];
  BookingEnquiryDetail?: any;
  BookingDocumentDetail: BookingDocumentDetail[];
  BookingRouteMapInfo: BookingRouteMapInfo;
  PolType?: string;
  PodType?: string;
  PolInputAddress?: string;
  PolAddress?: string;
  PodInputAddress?: string;
  PodAddress?: string;
  WHName?: string;
  WHCityCode?: string;
  WHCityName?: string;
  WHCountryCode?: string;
  WHCountryName?: string;
  WHGLocCode?: string;
  WHGLocName?: string;
  WHAddress?: string;
  WHLatitude?: number;
  WHLongitude?: number;
  WHImages?: string;
  WHMedia?: string;
  JsonSearchCriteria?: string
  StoredFromLcl?: string;
  StoredFromUtc?: string;
  StoredUntilLcl?: string;
  StoredUntilUtc?: string;
  LoadPickupDate?: string;
  JsonBookingLocation?: string;
  PolCity?: string;
  PodCity?: string;
  TruckNumber?: string;
  IsTracking?: boolean;
  IsQuality?: boolean
  ShippingStatus?: string;
  BookingStatusCode?: string;
  ShippingStatusCode?: string;
  BookingDesc?: string;
  UserCompanyName?: string;
  ProviderCountryPhoneID?: number;
  JsonShippingOrgInfo: any;
  JsonShippingDestInfo: any;
  JsonAgentOrgInfo: any;
  JsonAgentDestInfo: any;
}

export interface LineMarker {
  LatitudeA: number;
  LongitudeA: number;
  transPortModeA?: string;
  IconA?: string;
  LatitudeB: number;
  LongitudeB: number;
  transPortModeB?: string;
  IconB?: string;
}

export interface UpdateLoadPickupDate {
  loginUserID: string;
  bookingID: number;
  bookingType: string;
  loadPickupDate?: string;
  isCancelLoadPickup: boolean;
}


export interface Polyline {
  lat: number;
  lng: number;
  IsCurrloc: boolean;
  IsHistory: boolean;
  PortCode: string;
  PortName: string;
  PolylineStatus: string;
  IsPort: boolean;
  IsGround?: boolean;
  PortType?: string;
  // PolylineStatus = "Origin" | "Destination" | "Waypoint" | "Connecting"
}

export interface EtaDetails {
  EtaUtc: string;
  EtaLcl: string;
  Status: string;
}

export interface VesselPhoto {
  DocumentFileID: number;
  DocumentFileName: string;
}

export interface VesselInfo {
  VesselName: string;
  VesselType: string;
  VesselFlag: string;
  VesselPhotos: VesselPhoto[];
}

export interface ContainerDetail {
  ContainerNo: string;
  IsTrackingRequired: boolean;
  IsQualityMonitoringRequired: boolean;
  ContainerSpecDesc: string;
  ContainerImage: string;
  ContainerShortName: string;
  ContainerSpecCode: string;
}

export interface TrackingMonitoring {
  Polylines: Polyline[];
  RouteInformation?: any;
  EtaDetails: EtaDetails;
  VesselInfo: VesselInfo;
  ContainerDetails: ContainerDetail[];
}

export interface QaualitMonitorResp {
  AlertData: QualityMonitoringAlertData[]
  MonitoringData: QualityMonitorGraphData[]
  ProgressIndicators: ProgressIndicator[]
}

export interface QualityMonitorGraphData {
  Key: string;
  SensorID: string;
  EventType: string;
  IOTParamValue: number;
  IOTParamName: string;
  SortingOrder: number;
  ContainerNo: string;
  AlertCount: number;
  IOTParamPerformancePercent: number
  TotalCount: number
}


export interface QualityMonitoringAlertData {
  AlertRange?: string
  ContainerNo: string
  ContainerSize: string
  GCoordinates: string
  Humidity?: number
  HumidityDateTimeUTC?: string
  SensorID: string
  Temperature?: number
  TemperatureDateTimeUTC?: string
  ActionEmail: string
  ActionSMS: string;
  TotalTemp?: number;
  TotalTempCount?: number;
  TotalHumid?: number;
  TotalHumidCount?: number;
  AlertMin?: number;
  AlertMax?: number;
}

export interface ProgressIndicator {
  ProgressID: number;
  ProgressIndicatorMin: number;
  ProgressIndicatorMax: number;
  ProgressIndicatorColor: string;
  ProgressIndicatorName: string;
}
