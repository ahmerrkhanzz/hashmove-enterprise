import { Action } from "@ngrx/store";
import { SearchResult } from "../../../../../interfaces/searchResult";

export const FETCHING_LCL_SHIPPING_DATA = "[LCL] FetchingLCLShippingData";
export const FETCHING_LCL_SHIPPING_DATA_SUCCESS = "[LCL] FetchingLCLShippingDataSuccess";
export const FETCHING_LCL_SHIPPING_DATA_FAIL = "[LCL] FetchingLCLShippingDataFail";
export const UPDATE_LCL_SHIPPING_SEARCH_RESULT = "[LCL] UpdateLCLShippingSearchResult";
export const UPDATE_LCL_SHIPPING_VIEW_SEARCH_RESULT = "[LCL] UpdateLCLShippingViewSearchResult";
export const UPDATE_LCL_SHIPPING_MAIN_SEARCH_RESULT = "[LCL] UpdateLCLShippingMainSearchResult";

export class FetchingLCLShippingData implements Action {
  constructor(public payload: any) { }
  readonly type: string = FETCHING_LCL_SHIPPING_DATA;
}

export class FetchingLCLShippingDataSuccess implements Action {
  constructor(public payload: any) { }
  readonly type: string = FETCHING_LCL_SHIPPING_DATA_SUCCESS;
}

export class FetchingLCLShippingDataFail implements Action {
  constructor(public payload: any, public errorMessage: string) { }
  readonly type: string = FETCHING_LCL_SHIPPING_DATA_FAIL;
}
export class UpdateLCLShippingSearchData implements Action {
  constructor(public payload: any) { }
  readonly type: string = UPDATE_LCL_SHIPPING_SEARCH_RESULT;
}
export class UpdateLCLShippingViewSearchResult implements Action {
  constructor(public payload: any) { }
  readonly type: string = UPDATE_LCL_SHIPPING_VIEW_SEARCH_RESULT;
}
export class UpdateLCLShippingMainSearchResult implements Action {
  constructor(public payload: any) { }
  readonly type: string = UPDATE_LCL_SHIPPING_MAIN_SEARCH_RESULT;
}

export type ShipAll = | FetchingLCLShippingData | FetchingLCLShippingDataSuccess | FetchingLCLShippingDataFail | UpdateLCLShippingSearchData | UpdateLCLShippingMainSearchResult | UpdateLCLShippingViewSearchResult
