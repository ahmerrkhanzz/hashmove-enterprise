import { Injectable } from '@angular/core';
import { baseApi } from '../../../constants/base.url'
import { HttpClient } from '@angular/common/http';
import { getLoggedUserData, getSearchCriteria } from '../../../constants/globalfunctions';


@Injectable()
export class WarehousingService {

    constructor(private _http: HttpClient) { }

    warehouseSearchResult(data) {
        let url = "actualschedule/GetWarehouseSearchResult"
        return this._http.post(baseApi + url, data);
    }

    getWarehousePriceDetails(data) {
        const { CustomerID, CustomerType } = getSearchCriteria()
        data.CustomerID = (CustomerID) ? CustomerID : -1
        data.CustomerType = (CustomerType) ? CustomerType : 'user'
        let url = "actualschedule/GetWarehouseSearchResultPriceDetail"
        return this._http.post(baseApi + url, data)
    }

}
