
export interface CurrencyDetails {
  id: number;
  code: string;
  title: string;
  shortName: string;
  imageName: string;
  desc: string;
  webURL?: any;
  sortingOrder?: any;
  isActive?: boolean;
}

export interface Rate {
  currencyID: number;
  currencyCode: string;
  rate: number;
}

export interface ExchangeRate {
  fromCurrencyID: number;
  fromCurrencyCode: string;
  lastUpdate: Date;
  rates: Rate[];
}

export interface MasterCurrency {
  fromCurrencyID: number;
  fromCurrencyCode: string;
  rate: number;
  toCurrencyID: number;
  toCurrencyCode: string;
  toCountryID: number;
}
