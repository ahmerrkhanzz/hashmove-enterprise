import { Injectable } from "@angular/core";
import { baseApi } from "../../constants/base.url";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class DropDownService {
  constructor(private http: HttpClient) { }

  getCountry() {
    let url: string = "Country/GetDropDownDetail/0";
    return this.http.get(baseApi + url);
  }

  getCurrency() {
    let url: string = "Currency/GetDropDownDetail/100";
    return this.http.get(baseApi + url);
  }

  getCity() {
    let url: string = "City/GetDropDownDetail/0";
    return this.http.get(baseApi + url);
  }

  getFilteredCity($filterVal) {
    let url: string = `city/GetCityDropDownDetail/0/${$filterVal}`
    return this.http.get(baseApi + url);
  }

  getCompany() {
    let url: string = "Company/GetDropDownDetail/0";
    return this.http.get(baseApi + url);
  }

  getInco() {
    let url: string = "Inco/GetDropDownDetail/0";
    return this.http.get(baseApi + url);
  }

  howhear() {
    let url: string = "MstCodeVal/GetMstCodeValMultipleList/HOW_HEAR_US";
    return this.http.get(baseApi + url);
  }

  getRegions() {
    let url = "region/GetDropDownDetail/0";
    return this.http.get(baseApi + url);
  }

  getDepartments() {
    let url = "department/GetDropDownDetail/0"
    return this.http.get(baseApi + url)
  }

  getCompanyType() {
    let url = "companytype/GetDropDownDetail/0"
    return this.http.get(baseApi + url)
  }

  getCompanySize() {
    let url = "companysize/GetDropDownDetail/0"
    return this.http.get(baseApi + url)
  }
  getShippingFreq() {
    let url = "MstCodeVal/GetMstCodeValMultipleList/SHIPPING_FREQ "
    return this.http.get(baseApi + url)
  }
  getBrowserLocation() {
    let url = 'http://ip-api.com/json';
    return this.http.get(url)
  }

  getTest() {
    let url = 'http://localhost:5000/api/users';
    return this.http.get(url)
  }

  getBaseCurrency() {
    let url = 'currency/GetBaseCurrency';
    return this.http.get(baseApi + url)
  }

  getExchangeRateList(currencyID) {
    let url = 'currency/GetExchangeRateList/' + currencyID
    return this.http.get(baseApi + url)
  }

  getCompanyV1() {
    let url = "company/GetAll"
    return this.http.get(baseApi + url);
  }

  getMstCodeVal(tag: string) {
    let url = `MstCodeVal/GetMstCodeValMultipleList/${tag}`
    return this.http.get(baseApi + url);
  }

  getCustomerSettings(customer: string) {
    let url: string = `general/GetCustomerSettings/${customer}`;
    return this.http.get(baseApi + url);
  }
}
