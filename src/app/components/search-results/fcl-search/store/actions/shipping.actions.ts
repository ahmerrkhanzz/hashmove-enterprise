import { Action } from "@ngrx/store";
import { SearchResult } from "../../../../../interfaces/searchResult";

export const FETCHING_FCL_SHIPPING_DATA = "[FCL] FetchingFCLShippingData";
export const FETCHING_FCL_SHIPPING_DATA_SUCCESS = "[FCL] FetchingFCLShippingDataSuccess";
export const FETCHING_FCL_SHIPPING_DATA_FAIL = "[FCL] FetchingFCLShippingDataFail";
export const UPDATE_FCL_SHIPPING_SEARCH_RESULT = "[FCL] UpdateFCLShippingSearchResult";
export const UPDATE_FCL_SHIPPING_VIEW_SEARCH_RESULT = "[FCL] UpdateFCLShippingViewSearchResult";
export const UPDATE_FCL_SHIPPING_MAIN_SEARCH_RESULT = "[FCL] UpdateFCLShippingMainSearchResult";
export const UPDATE_FCL_SHIPPING_ROUTE_CHANGE = "[FCL] UpdateFCLShippingRouteChange";

export class FetchingFCLShippingData implements Action {
  constructor(public payload: any) { }
  readonly type: string = FETCHING_FCL_SHIPPING_DATA;
}

export class FetchingFCLShippingDataSuccess implements Action {
  constructor(public payload: any) { }
  readonly type: string = FETCHING_FCL_SHIPPING_DATA_SUCCESS;
}

export class FetchingFCLShippingDataFail implements Action {
  constructor(public payload: any, public errorMessage: string) { }
  readonly type: string = FETCHING_FCL_SHIPPING_DATA_FAIL;
}
export class UpdateFCLShippingSearchData implements Action {
  constructor(public payload: any) { }
  readonly type: string = UPDATE_FCL_SHIPPING_SEARCH_RESULT;
}
export class UpdateFCLShippingViewSearchResult implements Action {
  constructor(public payload: any) { }
  readonly type: string = UPDATE_FCL_SHIPPING_VIEW_SEARCH_RESULT;
}
export class UpdateFCLShippingMainSearchResult implements Action {
  constructor(public payload: any) { }
  readonly type: string = UPDATE_FCL_SHIPPING_MAIN_SEARCH_RESULT;
}
export class UpdateFCLShippingRouteChange implements Action {
  constructor() { }
  readonly type: string = UPDATE_FCL_SHIPPING_ROUTE_CHANGE;
}

export type ShipAll = | FetchingFCLShippingData | FetchingFCLShippingDataSuccess | FetchingFCLShippingDataFail | UpdateFCLShippingSearchData | UpdateFCLShippingMainSearchResult | UpdateFCLShippingViewSearchResult | UpdateFCLShippingRouteChange
