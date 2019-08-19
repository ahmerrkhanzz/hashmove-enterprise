export interface ContainerDetail {
  ContainerSpecID: number;
  ContainerSpecCode: string;
  ContainerSpecDesc: string;
  BookingContTypeQty: number;
  BookingPkgTypeCBM: number;
  BookingPkgTypeWeight: number;
  PackageCBM: number;
  PackageWeight: number;
  volumetricWeight: number;
  IsTrackingRequired: boolean;
  IsQualityMonitoringRequired: boolean;
  JsonContainerDetail?: string;
  IOTParams?: string;
}

export interface RouteDetail {
  PolPodCode: string;
  EtdUtc: string;
  EtdLcl: string;
  EtaUtc: string;
  EtaLcl: string;
}

export interface PriceDetail {
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
  MinTotalPrice?: number;
  MaxTotalPrice?: number;
  BaseMinTotalPrice?: number;
  BaseMaxTotalPrice?: number;
  IndividualPrice?: number;
  SortingOrder: number;
  TransMode: string;
  BaseCurrIndividualPrice: number;
  ExchangeRate?: number;
  ActualIndividualPrice?: number;
  ActualTotalAmount?: number;
  LogServShortName?: any;
  IsChecked?: boolean;
  ShowInsurance?: boolean;
  Price?: number,
  ActualPrice?: number
  BaseCurrPrice?: number
  PriceBasis?: string,
  CreatedBy?: string,
  BookingSurChargeDetail?: BookingSurChargeDetail[],
  Imp_Exp?: string;
  isChargeChecked?: boolean;
}

export interface EnquiryDetail {
  BookingEnquiryID: number;
  BookingEnquiryType: string;
  BookingEnquiryDate: Date;
  BookingID: number;
  BookingEnquiryAckDate?: Date;
  BookingEnquiryPrice?: number;
  CurrencyID?: number;
  CurrencyCode?: string;
  BookingEnquiryAckRemarks?: string;
  ProviderID: number;
  ProviderCode: string;
  ProviderName: string;
  ProviderShortName: string;
  ProviderImage: string;
  ProviderEmail: string;
}

export interface BookingDetails {
  BookingID: number;
  ProfileID?: string;
  HashMoveBookingNum: string;
  HashMoveBookingDate: string;
  ShippingCatID: number;
  ShippingSubCatID: number;
  ShippingModeID: number;
  ShippingModeName: string;
  ShippingModeCode: string;
  ShippingCatName: string;
  ShippingSubCatName: string;
  JsonSearchCriteria?: string;
  PolID: number
  PolCode: string;
  PolName: string;
  PolCountry: string;
  PodID: number
  PodCode: string;
  PodName: string;
  PodCountry: string;
  PolModeOfTrans: string;
  PodModeOfTrans: string;
  ContainerLoad: string;
  ContainerCount: any;
  EtdUtc: string;
  EtdLcl: string;
  EtaUtc: string;
  EtaLcl: string;
  EtaInDays?: number;
  TransitTime: number;
  PortCutOffUtc: string;
  PortCutOffLcl: string;
  FreeTimeAtPort: number;
  ProviderID: number;
  ProviderName: string;
  ProviderImage: string;
  ProviderEmail: string;
  ProviderPhone: string;
  CarrierID: number;
  CarrierName: string;
  CarrierImage: string;
  VesselCode: string;
  VesselName: string;
  VoyageRefNum: string;
  IsInsured: boolean;
  ProviderInsurancePercent: number,
  InsuredGoodsPrice: number;
  InsuredGoodsCurrencyID: number;
  InsuredGoodsCurrencyCode: string;
  IsInsuredGoodsBrandNew: boolean;
  InsuredGoodsProviderID: number;
  InsuredStatus: string;
  IsInsuranceProvider: boolean,
  IsAnyRestriction: boolean;
  CurrencyID: number;
  CurrencyCode: string;
  BookingTotalAmount: number;
  BookingContainerDetail: ContainerDetail[];
  BookingRouteDetail: RouteDetail[];
  BookingPriceDetail: PriceDetail[];
  BookingEnquiryDetail: EnquiryDetail[];
  BookingStatus: string;
  DiscountPrice?: number;
  DiscountPercent?: number;
  IDlist?: string;
  InsuredGoodsBaseCurrPrice: number;
  InsuredGoodsBaseCurrencyID: number;
  InsuredGoodsBaseCurrencyCode: string;
  InsuredGoodsActualPrice: number;
  InsuredGoodsExchangeRate: number;
  BaseCurrencyID: number;
  BaseCurrencyCode: string;
  BaseCurrTotalAmount: number;
  ExchangeRate: number;
  ProviderDisplayImage?: string;
  CarrierDisplayImage?: string;
  UserName: string;
  UserCountryName: string;
  UserCityName: string;
  isConinueBooking?: boolean
  IDListDetail?: string
  FlightNo?: string,
  AirCraftInfo?: string,
  BookingSurChargeDetail?: BookingSurChargeDetail[]
  TruckNumber?: any,
  BookingDesc?: string,
  BookingAcknowledgment?: boolean,
  JsonParametersOfSensor?: string,
  IncoID?: number,
  isExcludeExp?: boolean,
  isExcludeImp?: boolean;
  BookingJsonDetail?: any;
  BookingType?: string;
  JsonCustomerSettting?: string;
  ImpExpCharges2Remove?: Charges2Remove[];
}

export interface Charges2Remove {
  chargeType?: string;
  chargeID?: any;
  state?: boolean;
}



export interface BookingPriceDetail {
  SurchargeType: string;
  SurchargeID: number;
  SurchargeCode: string;
  SurchargeName: string;
  ContainerSpecID?: number;
  CurrencyID: number;
  CurrencyCode: string;
  BaseCurrencyID?: number;
  BaseCurrencyCode?: string;
  TotalAmount: number;
  BaseCurrencyPrice?: number;
  IndividualPrice?: number;
  SortingOrder: number;
  SortOrder?: number;
  TransMode?: string;
  BaseCurrTotalAmount?: number;
  BaseCurrIndividualPrice?: number;
  ActualTotalAmount?: number;
  ActualIndividualPrice?: number;
  ExchangeRate?: number;
}

export interface BookingContainerTypeDetail {
  BookingContTypeQty: number;
  ContainerSpecID: number;
  ContainerSpecCode?: any;
  ContainerSpecDesc?: any;
  PackageCBM: number;
  PackageWeight: number;
}

export interface BookingSurChargeDetail {
  SurchargeType: string;
  SurchargeID: number;
  SurchargeCode: string;
  SurchargeName: string;
  SurchargeBasis?: string;
  ContainerSpecID: number;
  CurrencyID: number;
  CurrencyCode: string;
  BaseCurrencyID: number;
  BaseCurrencyCode: string;
  TotalAmount: number;
  BaseCurrencyPrice: number;
  IndividualPrice: number;
  SortingOrder: number;
  SortOrder: number;
  TransMode: string;
  BaseCurrTotalAmount: number;
  BaseCurrIndividualPrice: number;
  ActualTotalAmount: number;
  ActualIndividualPrice: number;
  ExchangeRate: number;
  BaseTotalAmount?: number
  Price?: number
  ActualPrice?: number
}

export interface BookingSurChargeDetailWarehouse {
  BookingSurChgID?: number;
  BookingID?: number;
  SurchargeType: string;
  SurchargeID: number;
  SurchargeCode: string;
  SurchargeName: string;
  ActualPrice?: number;
  Price: number;
  BaseCurrencyID?: number;
  BaseCurrPrice?: number;
  BaseCurrencyCode?: string;
  BaseCurrTotalAmount?: number;
  BaseCurrIndividualPrice?: number;
  ActualTotalAmount?: number;
  ActualIndividualPrice?: number;
  CurrencyID: number;
  CurrencyCode: string;
  TotalDays?: number;
  TotalQty?: number;
  TotalQtyUOM?: string
  TotalAmount?: number
  RevenueTon?: string
  FreightTerm?: string
  BookingPartyID?: number
  IsDelete?: boolean
  IsActive?: boolean
  CreatedBy?: string
  CreatedDateTime?: string
  ModifiedBy?: string
  ModifiedDateTime?: string
  PriceBasis?: string;
  SortingOrder?: number;
  ExchangeRate: number;
}

export interface SaveBookingObject {
  BookingID: number;
  UserID: number;
  BookingSource: string;
  BookingStatus: string;
  MovementType: string;
  ShippingSubCatID: number;
  ShippingModeID: number;
  CarrierID: number;
  CarrierImage: string;
  CarrierName: string;
  ProviderID: number;
  ProviderImage: string;
  ProviderName: string;
  PolID: number;
  PodID: number;
  PolName: string;
  PodName: string;
  EtdUtc: Date;
  EtdLcl: Date;
  EtaUtc: Date;
  EtaLcl: Date;
  PortCutOffUtc: Date;
  PortCutOffLcl: Date;
  TransitTime: number;
  ContainerLoad: string;
  FreeTimeAtPort: number;
  IsInsured: boolean;
  IsInsuranceProvider: boolean;
  InsuredGoodsPrice?: any;
  InsuredGoodsCurrencyID: number;
  InsuredGoodsCurrencyCode: string;
  IsInsuredGoodsBrandNew: boolean;
  InsuredGoodsProviderID: number;
  InsuredStatus: string;
  IsAnyRestriction: boolean;
  PolModeOfTrans: string;
  PodModeOfTrans: string;
  VesselCode: string;
  VesselName: string;
  VoyageRefNum: string;
  CreatedBy: string;
  ModifiedBy: string;
  IDlist: string;
  InsuredGoodsBaseCurrPrice: number;
  InsuredGoodsBaseCurrencyID: number;
  InsuredGoodsBaseCurrencyCode: string;
  InsuredGoodsActualPrice: number;
  InsuredGoodsExchangeRate: number;
  BookingPriceDetail: BookingPriceDetail[];
  BookingContainerTypeDetail: BookingContainerTypeDetail[];
  BookingSurChargeDetail: BookingSurChargeDetail[];
  BookingEnquiryDetail: any[];
  Payment?: BookingPayment;
}

export interface InsuranceProvider {
  ProviderID: number;
  ProviderCode: string;
  ProviderName: string;
  ProviderShortName: string;
  ProviderImage: string;
  ProviderEmail: string;
  isChecked: boolean;
}


export interface AdditionalOptions {
  VASID: number;
  VASCode: string;
  VASName: string;
  VASDesc?: any;
  ModeOfTrans: string;
  VASBasis: string;
  LogServID: number;
  LogServName: string;
  LogServShortName: string;
  SurchargeType: string;
  SurchargeID: number;
  SurchargeName: string;
  SurchargeCode: string;
  ProviderID: number;
  PortID: number;
  ImpExpFlag: string;
  CurrencyID: number;
  VASChargeType: string;
  VASCharges: number;
  ProviderCode: string;
  ProviderName: string;
  ProviderImage: string;
  PortCode: string;
  PortName: string;
  CountryID: number;
  CountryCode: string;
  CountryName: string;
  CurrencyCode: string;
  CurrencyName: string;
  BaseCurrencyID: number;
  BaseCurrencyCode: string;
  ExchangeRate: number;
  BaseCurrVASCharges: number;
  IsChecked: boolean;
  TotalAmount: number;
}


export interface BookingPayment {
  PaymentID: number;
  PaymentNum?: any;
  BookingID: number;
  PaymentModeID: number;
  CreditCardTypeID: number;
  PaymentGatewayID: number;
  CreditCardNumber: string;
  CardHolderName: string;
  ExpiryDate: string;
  CVV: string;
  CCLast4Digit: number;
  PaymentDateUtc?: any;
  PaymentDateLcl?: any;
  GatewayResponse?: any;
  BookingCurrencyID: number;
  BookingAmount: number;
  BaseCurrencyID: number;
  BaseBookingAmount: number;
  BaseExchangeRate: number;
  BaseActualAmount: number;
  PaymentCurrencyID: number;
  PaymentAmount: number;
  PaymentExchangeRate: number;
  PaymentActualAmount: number;
  PaymentDesc?: any;
  UserID: number;
  OtherReference1?: any;
  OtherReference2?: any;
  IsDelete?: any;
  IsActive?: any;
  CreatedBy?: any;
  CreatedDateTime?: any;
  ModifiedBy?: any;
  ModifiedDateTime?: any;
}


export interface WarehouseBookingDetails {
  BookingID: number;
  CurrencyCode: string;
  HashMoveBookingNum: any,
  HashMoveTmpBookingNum: any,
  HashMoveBookingDate: any,
  UserID: number,
  BookingSource: string,
  BookingOfficeName: string,
  BookingOfficeAddress: string,
  BookingOfficeContactNum: string,
  BookingOfficeCityID: number,
  BookingStatus: string,
  ContractNum: string,
  ShippingModeID: number,
  ShippingCatID: number,
  ShippingSubCatID: number,
  ProviderID: number,
  ProviderName: string,
  ProviderImage: string,
  WHID: number,
  StoredFromUtc: string,
  StoredFromLcl: string,
  StoredUntilUtc: string,
  StoredUntilLcl: string,
  ReferenceType: string,
  ReferenceNum: string,
  ProviderRemarks: string,
  IsInsured: boolean,
  InsuredGoodsPrice: number,
  InsuredGoodsCurrencyID: number,
  IsInsuredGoodsBrandNew: boolean,
  InsuredGoodsProviderID: number,
  InsuredStatus: string,
  IsInsuranceProvider: boolean,
  InsuredGoodsBaseCurrencyID: number,
  InsuredGoodsBaseCurrPrice: number,
  InsuredGoodsActualPrice: number,
  InsuredGoodsExchangeRate: number,
  IDlist: string,
  CommodityType: string,
  IsDelete?: boolean,
  IsActive?: false,
  CreatedBy?: any;
  CreatedDateTime?: any;
  ModifiedBy?: any;
  ModifiedDateTime?: any;
  DeleteRemarks?: any,
  DiscountedPrice: number,
  JsonSearchCriteria: string,
  VASSummary: string,
  BookingJsonDetail: string,
  ActualScheduleDetail: string,
  ActualSchedulePriceDetail: string,
  BookingSurChargeDetail: BookingSurChargeDetailWarehouse[],
  BookingPriceDetail: BookingPriceDetail[];
  BookingEnquiryDetail: any[],
  BookingStatusDetail: any,
  Payment?: BookingPayment,
  tax?: any
}

export interface ViewBooking {
  bookedFrom: string,
  bookedUntil: string,
  space: number,
  bookedSpace?: number;
  ProviderName: string,
  email: string,
  phone: string,
  ProviderImage: string,
  IsBondedWarehouse: boolean,
  IsTempratureControlled: boolean,
  IsTransportAvailable: boolean,
  WHParsedTiming: any,
  WHParsedMedia: any,
  WHAddress: string,
  WHAreaInSQFT: number,
  WHName?: string,
  WHDesc?: string;
}
