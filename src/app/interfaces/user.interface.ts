export interface LoginUser {
    UserID: number;
    LoginID: string;
    FirstName: string;
    LastName: string;
    PrimaryEmail: string;
    UserImage: string;
    IsCorporateUser: boolean;
    IsAdmin: boolean;
    IsMediaContact: boolean;
    IsVerified: boolean;
    IsLogedOut: boolean;
    UserLoginID: number;
    CountryID: number;
    CountryCode: string;
    CountryName: string;
    CountryShortName: string;
    CountryFlag: string;
    CurrencyID: number;
    CurrencyOwnCountryID: number;
    CustomerID?:number
    CustomerType?:string
}
