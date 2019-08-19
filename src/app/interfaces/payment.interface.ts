export interface PaymentMode {
    paymentModeID: number;
    paymentModeCode: string;
    paymentModeDesc: string;
    paymentShortName: string;
    paymentModeNature?: any;
    isDelete: boolean;
    isActive: boolean;
    createdBy: string;
    createdDateTime: Date;
    modifiedBy: string;
    modifiedDateTime: Date;
}

export interface CreditCard {
    creditCardTypeID: number;
    creditCardTypeCode: string;
    creditCardTypeName: string;
    ccShortName: string;
    ccImage: string;
    startWithKey: string;
    ccNumLength: string;
    isDelete: boolean;
    isActive: boolean;
    createdBy: string;
    createdDateTime: Date;
    modifiedBy?: any;
    modifiedDateTime?: any;
}