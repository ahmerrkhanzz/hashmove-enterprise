import { UserDocument } from "./document.interface";

export interface BookingList {
  BookingID: number;
  HashMoveBookingNum: string;
  PolCode: string;
  PodCode: string;
  PolModeOfTrans: string;
  PodModeOfTrans: string;
  PolName: string;
  PodName: string;
  PolType?: string;
  PolInputAddress?: string;
  PolAddress?: string;
  PodType?: string;
  PodInputAddress?: string;
  PodAddress?: string;
  PolCountry?: string;
  PodCountry?: string;
  HashMoveBookingDate: string;
  BookingType: string;
  ShippingMode: string;
  ShippingModeCode?: string;
  BookingStatus: string;
  BookingTab: string;
  EtdUtc: string;
  EtdLcl: string;
  EtaUtc: string;
  EtaLcl: string;
  ContainerLoad: string;
  ContainerCount: number;
  BookingTotalAmount: number;
  CurrencyID: number;
  CurrencyCode: number;
  FirstName: string;
  LastName: string;
  UserImage: string;
  BaseCurrencyID: number;
  BaseCurrencyCode: number;
  BaseCurrTotalAmount: number;
  ContainerLoadType: string;
  ContainerLoadTypeList: Array<string>
  BookingRoutePorts: Array<BookingRoutePorts>
  WHAddress?: string;
  WHCityCode?: string;
  WHCityName?: string;
  WHCountryCode?: string;
  WHCountryName?: string;
  WHGLocCode?: string;
  WHGLocName?: string;
  WHImages?: string;
  WHLatitude?: number;
  WHLongitude?: number;
  WHName?: string;
  StoredUntilUtc?: any;
  StoredFromUtc?: any;
}

export interface BookingRoutePorts {
  BookingID: number;
  PolCode: string;
  PolID: number;
  PolName: string;
  PolLatitude: number;
  PolLongitude: number;
  PodCode: string;
  PodID: number;
  PodName: string;
  PodLatitude: number;
  PodLongitude: number;
  EtdUtc: string;
  EtdLcl: string;
  EtaUtc: string;
  EtaLcl: string;
  SortOrder: number;
  PolType?: string;
  PodType?: string;
}

export interface MapMarker {
  BookingId: number;
  PortName: string;
  PortCode: string;
  PortLat: number;
  PortLng: number;
  EtaUtc?: string;
  EtdUtc?: string;
  SortingOrder: number; //should be sorted from server
}

export interface MarkerInfo {
  PortName: string;
  PortCode: string;
  BookingData: MarkerBookingData;
}

interface MarkerBookingData {
  BookingID: Array<number>;
  HashMoveBookingNum: Array<string>;
}

export interface UserSettingsProfile {
  UserPersonalInfo: UserPersonalInfo;
  UserRegionalSetting: UserRegionalSetting;
  UserCompanyInfo: UserCompanyInfo;
  UserShippingSetting: UserShippingSetting;
  UserNotificationSetting: UserNotificationSetting;
  UserDocumentSetttings: UserDocument[]
}

export interface UserShippingSetting {
  UserID: number;
  LoginID: string;
  ShippingFreqCode: string;
  ShippingFreqName: string;
  IsInternationalShip: boolean;
  IsLocalShip: boolean;
  UserServiceCategories: UserServiceCategory[];
}

export interface UserServiceCategory {
  UserID: number;
  LoginID: string;
  ShippingModeID: number;
  ShippingCatID: number;
  ShippingCatName: string;
  ShippingSubCatID: number;
  ShippingSubCatName: string;
  IsActive: boolean;
  SortingOrder: number;
}

export interface UserCompanyInfo {
  UserID: number;
  LoginID: string;
  CompanyID: number;
  CompanyName: string;
  CityID?: any;
  CityName?: any;
  CompanyAddress: string;
  CompanyWebAdd: string;
  CompanyTypeID?: any;
  CompanyTypeName?: any;
  CompanySizeID?: any;
  CompanySizeDesc?: any;
  CompanyImage?:any
}

export interface UserRegionalSetting {
  UserID: number;
  RegionID?: any;
  RegionName?: any;
  CurrencyID?: any;
  CurrencyName?: any;
  LoginID: string;
  CurrencyOwnCountryID?: number;
}

export interface UserPersonalInfo {
  UserID: number;
  LoginID: string;
  PrimaryEmail: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  CityID: number;
  CityName: string;
  CountryID: number;
  PrimaryPhone: string;
  DepartmentID?: any;
  DepartmentName?: any;
  CountryPhoneCode: string;
  PhoneCodeCountryID: number;
  UserImage: string;
}

export interface ShippingFrequency {
  codeValID: number;
  codeVal: string;
  codeValShortDesc: string;
  codeValDesc: string;
  codeValPreVal?: any;
  codeValNextVal?: any;
  languageID: number;
  codeType: string;
  isDelete: boolean;
  isActive: boolean;
  createdBy: string;
  createdDateTime: string;
  modifiedBy: string;
  modifiedDateTime: string;
  sortingOrder: number;
  codeValLink?: any;
}

export interface UserNotification {
  UserID: number;
  LoginID: string;
  UserNotificationID: number;
  UserNotTypeID: number;
  UserNotTypeName: string;
  UserNotTypeDesc: string;
  UserNotTypeCat: string;//Grouping
  UserNotTypeCatDesc: string;
  IsSms: boolean;
  IsEmail: boolean;
  IsPushNot: boolean;
  SortingOrder: number;
}

export interface UserDealNotification {
  UserID: number;
  LoginID: string;
  UserDealNotificationID: number;
  ServiceTypeID: number;
  ServiceTypeName: string; //Grouping
  CountryID: number;
  CountryName: string;
  CountryCode: string;
  CountryShortName: string;
  CountryFlag: string;
}

export interface UserNotificationSetting {
  UserID: number;
  LoginID: string;
  IsNotifyAllDeals: boolean;
  UserNotification: UserNotification[];
  UserDealNotification: UserDealNotification[];
}

export interface ServiceType {
  serviceTypeID: number;
  serviceTypeCode: string;
  serviceTypeName: string;
  serviceTypeDesc: string;
  isDelete: boolean;
  isActive: boolean;
  createdBy?: any;
  createdDateTime?: any;
  modifiedBy?: any;
  modifiedDateTime?: any;
  sortingOrder: number;
}

export interface UserDashboardData {
  LastName: string;
  UserID: number;
  IsVerified: boolean;
  CompanyID: number;
  CompanyName: string;
  CompanyUserCount: number;
  LastLoginIpAddress: string;
  LastLoginDate: Date;
  LastLoginDays: number;
  LastLoginCountryID: number;
  LastLoginCountryName: string;
  CurrentBookingCount: number;
  SavedBookingCount: number;
  TotalBookingCount: number;
  WalletBalance: number;
  WalletCurrencyID: number;
  WalletCurrencyCode: string;
  BillingTillDate: number;
  BillingCurrencyID: number;
  BillingCurrencyCode: string;
  BookingDetails: Array<BookingList>;
}
