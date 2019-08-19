export class WarehouseSearchCriteria {
    CityID: number
    CityName?: string
    StoreFrom: string
    StoreUntill: string
    CBM: number
    SQFT: number
    KG: number
    PLT:any
    ReqStackable: boolean
    ReqTempControl: boolean
    ReqBonded: boolean
    TotalDays: number
    SearchLog?: SearchLog
    searchMode?: string
    criteriaFrom?: string
    Offset: number
    IDList?: string
    SelProvID?: number
    SelWHID?: number
    ShippingModeID?: number
    ShippingCatID?: number
    ShippingSubCatID?: number
    cityObj?: City
    pickupDate?: any
    deliveryDate?: any
    ProviderID?: number;
    CustomerID: number;
    CustomerType: string;
    loggedID?: number;
    subWarehouseTabID?: string;
    warehouseTabId?: string
    storageType?: string
    searchBy?: string
    minimumLeaseTerm?: number
    minimumLeaseTermString?: string
    spaceReqFrom?: string
    spaceReqUntill?: string
    spaceReqString?: string
    sizeCodeId?: number;
    leaseCodeId?: number;
    containerLoad?:string;
}

export interface SearchLog {
    height?: number | any
    length?: number | any
    lengthUnit?: string | any
    quantity?: number | any
    totalWeight?: number | any
    totalWeightUnit?: number | any
    volume?: number | any
    volumeUnit?: number | any
    weight?: number | any
    weightUnit?: string | any
    width?: number | any
    toggle?: boolean | any
    area?: number | any
    areaUnit?: string | any,
    stackable?: boolean
    tempControl?: boolean,
    bonded?: boolean,
    activeTab?: string
}


export interface City {
    desc?: string;
    id?: number;
    imageName?: string;
    shortName?: string;
    title?: string;
}
