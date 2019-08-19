export interface WarehouseSearchResult {
    ProviderID: number;
    WHID: number;
    ProviderName: string;
    ProviderImage: string;
    WHEstablishedDate: string;
    CreditDays: number;
    WHAddress: string;
    WHAreaInSQFT: string;
    WHNeighborhood: string;
    IsBondedWarehouse: boolean;
    IsTempratureControlled: boolean;
    IsTransportAvailable: boolean;
    IsRecommended: boolean;
    WHMedia: string;
    WHLatitude: number;
    WHLongitude: number;
    TotalPrice: number;
    CurrencyID: number;
    CurrencyCode: string;
    CurrencyName: string;
    BaseCurrencyID: number;
    BaseCurrencyCode: string;
    BaseCurrencyName: string;
    BaseTotalPrice: number;
    AvgPricePerDayPerUnit: number;
    AvgBasePricePerDayPerUnit: number;
    HasDeal: boolean;
    IDList: string;
    WHTimings: string;
    WHEstablishedYear: number;
    ProviderBusYear: number;
    WHParsedMedia?: Array<WareDocumentData>;
    WHParsedTiming?: Array<WHTiming>
    DiscountPrice?: number;
    WHName: string,
    WHDesc: string,
    WHShortName: string
    WHLatLng?: string;
    WHNeighborhoodID?:number
}

export interface WareDocumentData {
    DocumentID: any | number;
    DocumentFileID: number;
    DocumentFileName: string;
    DocumentFile: string;
    DocumentUploadedFileType: string;
}
export interface WHTiming {
    DayName: string;
    OpeningTime: string;
    ClosingTime: string;
    IsClosed: boolean;
}

export enum WarehouseEnum {
  shared_warehouse,
  full_warehouse
}
