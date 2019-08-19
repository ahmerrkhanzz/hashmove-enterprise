export interface IHelpSupport {
    HMSupportID: number,
    HMSupportAddress: String,
    HMSupportPhone: String,
    HMSupportWebAdd: String,
    HMSupportEmail: String,
}

export interface ProviderVASDetail {
    VASID: number;
    ProviderID: number;
    PortID: number;
    PortCode: string;
    CurrencyID: number;
    CurrencyCode: string;
    Rate: number;
    RateType: string;
    BaseCurrencyID: number;
    BaseCurrencyCode: string;
    ExchangeRate: number;
    BaseRate: number;
    ProviderCode: string;
    ProviderName: string;
    ProviderType: string;

}

export interface ProviderVAS {
    VASID: number;
    VASCode: string;
    VASName: string;
    VASDesc?: any;
    ModeOfTrans: string;
    VASBasis: string;
    LogServID: number;
    LogServCode: string;
    LogServName: string;
    LogServShortName: string;
    SurchargeType: string;
    ProviderVASDetail: ProviderVASDetail[];
}