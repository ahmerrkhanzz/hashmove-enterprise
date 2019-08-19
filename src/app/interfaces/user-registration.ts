export interface UserRegistration {

    userID: number;
    userCode: string;
    loginID: string;
    password: string;
    primaryEmail: string;
    secondaryEmail: string;
    firstName: string;
    middleName: string;
    lastName: string;
    primaryPhone: string;
    secondaryPhone: string;
    countryID: number;
    cityID: number;
    companyID: number;
    // companyName:string;
    // companyTradeLiscenceNum: string;
    howHearAboutUs:string;
    howHearOthers:string;
    roleID: number;
    isDelete: boolean;
    isActive: boolean;
    createdBy: string;
    modifiedBy: string;
    userImage: string;
}
