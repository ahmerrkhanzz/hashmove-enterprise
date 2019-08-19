import { Injectable } from '@angular/core';
import { baseApi } from '../../../constants/base.url'
import { HttpClient } from '@angular/common/http';


@Injectable()
export class ShippingService {

  constructor(private _http: HttpClient) { }

  /**
   * get all ports data
   */
  getPortsData($portType?: string) {
    let portType = $portType
    if (!portType) {
      portType = 'SEA'
    }
    let url: string = `ports/GetPortsByType/${0}/${portType}`;
    return this._http.get(baseApi + url);
  }

  lclSearchResult(data) {
    let url = "actualschedule/GetLCLSearchResult"
    return this._http.post(baseApi + url, data);
  }

  truckSearchResult(data) {
    let url = "actualschedule/GetTruckSearchResult"
    return this._http.post(baseApi + url, data);
  }

  getLCLUnits() {
    let url = "general/GetUnitType"
    return this._http.get(baseApi + url)
  }


  /**
   *
   * Notify Customer
   * @param {object} dara
   * @returns
   * @memberof ShippingService
   */
  notifyCustomer(data) {
    let url = "general/SearchNotification"
    return this._http.post(baseApi + url, data)
  }

}
