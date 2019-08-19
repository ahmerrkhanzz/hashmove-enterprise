import { Action } from "@ngrx/store";
import { SearchResult } from "../../../../../interfaces/searchResult";

export const FETCHING_WAREHOUSING_DATA = "[WAREHOUSING] FetchingWarehousingData";
export const FETCHING_WAREHOUSING_DATA_SUCCESS = "[WAREHOUSING] FetchingWarehousingDataSuccess";
export const FETCHING_WAREHOUSING_DATA_FAIL = "[WAREHOUSING] FetchingWarehousingDataFail";
export const UPDATE_WAREHOUSING_SEARCH_RESULT = "[WAREHOUSING] UpdateWarehousingSearchResult";
export const UPDATE_WAREHOUSING_VIEW_SEARCH_RESULT = "[WAREHOUSING] UpdateWarehousingViewSearchResult";
export const UPDATE_WAREHOUSING_MAIN_SEARCH_RESULT = "[WAREHOUSING] UpdateWarehousingMainSearchResult";

export class FetchingWarehousingData implements Action {


  constructor(public payload: any) { }
  readonly type: string = FETCHING_WAREHOUSING_DATA;
}

export class FetchingWarehousingDataSuccess implements Action {
  constructor(public payload: any) { }
  readonly type: string = FETCHING_WAREHOUSING_DATA_SUCCESS;
}

export class FetchingWarehousingDataFail implements Action {
  constructor(public payload: any, public errorMessage: string) { }
  readonly type: string = FETCHING_WAREHOUSING_DATA_FAIL;
}
export class UpdateWarehousingSearchData implements Action {
  constructor(public payload: any) { }
  readonly type: string = UPDATE_WAREHOUSING_SEARCH_RESULT;
}
export class UpdateWarehousingViewSearchResult implements Action {
  constructor(public payload: any) { }
  readonly type: string = UPDATE_WAREHOUSING_VIEW_SEARCH_RESULT;
}
export class UpdateWarehousingMainSearchResult implements Action {
  constructor(public payload: any) { }
  readonly type: string = UPDATE_WAREHOUSING_MAIN_SEARCH_RESULT;
}

export type ShipAll = | FetchingWarehousingData | FetchingWarehousingDataSuccess | FetchingWarehousingDataFail | UpdateWarehousingSearchData | UpdateWarehousingMainSearchResult | UpdateWarehousingViewSearchResult
