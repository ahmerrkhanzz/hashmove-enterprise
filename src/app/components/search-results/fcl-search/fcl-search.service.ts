import { Injectable } from '@angular/core';
import { baseApi } from '../../../constants/base.url'
import { HttpClient } from '@angular/common/http';
import { SearchCriteria } from '../../../interfaces/searchCriteria';
import { getSearchCriteria } from '../../../constants/globalfunctions';

@Injectable()
export class SearchResultService {

  constructor(private http: HttpClient) { }

  searchResult(data) {
    // let url = "actualschedule/GetCarrierSearchResult"
    let url = "actualschedule/SearchResultStep2" // for testing only
    return this.http.post(baseApi + url, data);
  }
  searchResult_O(data) {
    let url = "actualschedule/GetCarrierSearchResult_O"
    // let url = "actualschedule/GetCarrierSearchResultStressTesting" // for testing only
    return this.http.post(baseApi + url, data);
  }

  searchResultDetail(data) {
    let url = "actualschedule/GetSearchResultDetail"
    return this.http.post(baseApi + url, data);
  }

  getRouteMapInfo(data) {
    let url = "actualschedule/GetRouteMapInfo"
    return this.http.post(baseApi + url, data)
  }

  getCarrierRouteInfo(data) {
    let url = "actualschedule/GetRouteCarrierInfo"
    return this.http.post(baseApi + url, data)
  }

  getPriceDetails(data: any) {
    const { customerID, customerType, ...newObj } = data
    const { CustomerID, CustomerType } = getSearchCriteria()
    const toSend = {
      ...newObj,
      customerID: (CustomerID) ? CustomerID : -1,
      customerType: (CustomerType) ? CustomerType : 'user',
    }
    const url = "actualschedule/GetSearchResultPriceDetail"
    return this.http.post(baseApi + url, toSend)
  }

  getLCLPriceDetails(data) {
    let url = "actualschedule/GetSearchResultLclPriceDetail"
    return this.http.post(baseApi + url, data)
  }

  getProvidersSearchResult(data) {
    // let url = "actualschedule/GetProviderSearchResult"
    let url = "actualschedule/SearchResultStep1"
    // let url = "actualschedule/GetProviderSearchResultStressTesting" // for testing only
    return this.http.post(baseApi + url, data)
  }

  shareShippingInfo(data) {
    let url = "booking/ShareBooking"
    return this.http.post(baseApi + url, data)
  }

  sharePartnerShippingInfo(data) {
    let url = "provider/ProfileSharing"
    return this.http.post(baseApi + url, data)
  }

  getActualScheduleDetailWithPrice(bookingReferenceIDs: string, movementType: string, containerLoadType: string, shippingMode: string, customerID?: number, customerType?: string) {
    const { CustomerID, CustomerType } = getSearchCriteria()
    const newCustomerID: number = (!CustomerID) ? -1 : CustomerID
    const newCustomerType: string = (!CustomerType) ? 'user' : CustomerType
    const url = `actualschedule/GetActualScheduleDetailWithPrice/${bookingReferenceIDs}/${movementType}/${containerLoadType}/${shippingMode}/${newCustomerID}/${newCustomerType}`
    return this.http.get(baseApi + url)
  }

  getTruckPriceDetails(data) {
    let url = "actualschedule/GetTruckSearchResultPriceDetail"
    return this.http.post(baseApi + url, data)
  }

  getTermsCondition(providerId, searchMode) {
    let url = `provider/GetProviderTermsCondition/${searchMode}/${providerId}`
    return this.http.get(baseApi + url)
  }

}
