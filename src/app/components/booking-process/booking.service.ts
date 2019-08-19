import { Injectable } from '@angular/core';
import { baseApi } from '../../constants/base.url'
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable()
export class BookingService {

  headers: HttpHeaders

  constructor(private _http: HttpClient) {
    this.headers = new HttpHeaders()
    // .set('Cache-Control', 'no-cache');
  }

  createAuthorizationHeader() {
    this.headers = this.headers.append('Cache-Control', 'cache');
  }

  getHelpSupport(cache: boolean) {
    let url: string = "general/GetHMHelpSupportDetail";
    if (cache) {
      this.createAuthorizationHeader()
    } else {
      this.removeCache()
    }
    return this._http.get((baseApi + url), { headers: this.headers })
  }

  removeCache() {
    this.headers = this.headers.delete('Cache-Control', 'cache');
    this.headers = this.headers.append('Cache-Control', 'no-cache');
  }

  saveBooking(data) {
    let url: string = "booking/Post"; ``
    return this._http.post((baseApi + url), data)
  }

  saveWarehouseBooking(data) {
    let url: string = "booking/PostWarehouseBooking"; ``
    return this._http.post((baseApi + url), data)
  }

  getInsuranceProviders() {
    let url: string = "provider/GetInsuranceProviderList";
    return this._http.get((baseApi + url))
  }

  getVASDetails() {
    let url: string = "valueaddedservice/GetInsuranceValueAddedServiceList";
    return this._http.get((baseApi + url))
  }

  getVASList(PolId, PodId, ProviderId, bookingDateUTC) {
    let url: string = `valueaddedservice/GetValueAddedServiceList/${PolId}/${PodId}/${ProviderId}/${bookingDateUTC}`
    return this._http.get(baseApi + url)
  }

  getPaymentMode() {
    const url: string = 'paymentmode/GetAll'
    return this._http.get(baseApi + url)
  }

  getCreditCardData() {
    const url: string = 'creditcardtype/GetAll'
    return this._http.get(baseApi + url)
  }

  getProviderVASList(logServCodes, bookingDateUTC, providerId) {
    const url: string = `provider/GetProviderVASList/${logServCodes}/${bookingDateUTC}/${0}/${providerId}`
    return this._http.get(baseApi + url)
  }

  updateLoadPickupDate(body) {
    const url: string = 'booking/UpdateLoadPickupDate'
    return this._http.put(baseApi + url, body)
  }

  getTrackingInformation(bookingKey) {
    const url: string = `booking/GetTrackingInformation/${bookingKey}`
    return this._http.get(baseApi + url)
  }
  getQualityMonitoringInformation(bookingKey) {
    const url: string = `booking/GetQualityMonitoringInformation/${bookingKey}`
    return this._http.get(baseApi + url)
  }

  /**
   * Getting the IOT params
   * @memberof BookingService
   */
  getIOTParams(bookingID, mode) {
    const url: string = `booking/GetBookingParametersOfSensor/${bookingID}/${mode}`
    return this._http.get(baseApi + url)
  }

  getIOTSensorActions() {
    const url: string = `general/GetIOTSensorActionType`
    return this._http.get(baseApi + url)
  }

  updateSpecialPrice(bookingID, loginUserID, data) {
    const url = `booking/UpdateBookingSpecialPrice/${bookingID}/${loginUserID}`;
    return this._http.put(baseApi + url, data);
  }

  getBookingSpecialLogs(bookingKey: string, portalType:string) {
    const url = `booking/GetBookingSpecialPriceLog/${bookingKey}/${portalType}`;
    return this._http.get(baseApi + url);
  }

}
