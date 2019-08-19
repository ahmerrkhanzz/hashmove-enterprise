import { Action } from "@ngrx/store";
import { SearchResult } from "../../../../../interfaces/searchResult";

export const FETCHING_LCL_AIR_DATA = "[LCL] FetchingLCLAirData";
export const FETCHING_LCL_AIR_DATA_SUCCESS = "[LCL] FetchingLCLAirDataSuccess";
export const FETCHING_LCL_AIR_DATA_FAIL = "[LCL] FetchingLCLAirDataFail";
export const UPDATE_LCL_AIR_SEARCH_RESULT = "[LCL] UpdateLCLAirSearchResult";
export const UPDATE_LCL_AIR_VIEW_SEARCH_RESULT = "[LCL] UpdateLCLAirViewSearchResult";
export const UPDATE_LCL_AIR_MAIN_SEARCH_RESULT = "[LCL] UpdateLCLAirMainSearchResult";

export class FetchingLCLAirData implements Action {
  constructor(public payload: any) { }
  readonly type: string = FETCHING_LCL_AIR_DATA;
}

export class FetchingLCLAirDataSuccess implements Action {
  constructor(public payload: any) { }
  readonly type: string = FETCHING_LCL_AIR_DATA_SUCCESS;
}

export class FetchingLCLAirDataFail implements Action {
  constructor(public payload: any, public errorMessage: string) { }
  readonly type: string = FETCHING_LCL_AIR_DATA_FAIL;
}
export class UpdateLCLAirSearchData implements Action {
  constructor(public payload: any) { }
  readonly type: string = UPDATE_LCL_AIR_SEARCH_RESULT;
}
export class UpdateLCLAirViewSearchResult implements Action {
  constructor(public payload: any) { }
  readonly type: string = UPDATE_LCL_AIR_VIEW_SEARCH_RESULT;
}
export class UpdateLCLAirMainSearchResult implements Action {
  constructor(public payload: any) { }
  readonly type: string = UPDATE_LCL_AIR_MAIN_SEARCH_RESULT;
}

export type AirAll = | FetchingLCLAirData | FetchingLCLAirDataSuccess | FetchingLCLAirDataFail | UpdateLCLAirSearchData | UpdateLCLAirMainSearchResult | UpdateLCLAirViewSearchResult
