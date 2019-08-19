import { Action } from "@ngrx/store";

export const FETCHING_FCL_AIR_FORWARDER_DATA = "[FCL] FetchingFCLAirForwarderData";
export const FETCHING_FCL_AIR_FORWARDER_DATA_SUCCESS = "[FCL] FetchingFCLAirForwarderDataSuccess";
export const FETCHING_FCL_AIR_FORWARDER_DATA_FAIL = "[FCL] FetchingFCLAirForwarderDataFail";
export const UPDATE_FCL_AIR_FORWARDER_SEARCH_RESULT = "[FCL] UpdateFCLAirForwarderSearchResult";
export const UPDATE_FCL_AIR_FORWARDER_VIEW_SEARCH_RESULT = "[FCL] UpdateFCLAirForwarderViewSearchResult";
export const UPDATE_FCL_AIR_FORWARDER_MAIN_SEARCH_RESULT = "[FCL] UpdateFCLAirForwarderMainSearchResult";

export class FetchingFCLAirForwarderData implements Action {
  constructor(public payload: any) { }
  readonly type: string = FETCHING_FCL_AIR_FORWARDER_DATA;
}

export class FetchingFCLAirForwarderDataSuccess implements Action {
  constructor(public payload: any) { }
  readonly type: string = FETCHING_FCL_AIR_FORWARDER_DATA_SUCCESS;
}

export class FetchingFCLAirForwarderDataFail implements Action {
  constructor(public payload: any, public errorMessage: string) { }
  readonly type: string = FETCHING_FCL_AIR_FORWARDER_DATA_FAIL;
}

export class UpdateFCLAirForwarderSearchData implements Action {
  constructor(public payload: any) { }
  readonly type: string = UPDATE_FCL_AIR_FORWARDER_SEARCH_RESULT;
}
export class UpdateFCLAirForwarderViewSearchResult implements Action {
  constructor(public payload: any) { }
  readonly type: string = UPDATE_FCL_AIR_FORWARDER_VIEW_SEARCH_RESULT;
}
export class UpdateFCLAirForwarderMainSearchResult implements Action {
  constructor(public payload: any) { }
  readonly type: string = UPDATE_FCL_AIR_FORWARDER_MAIN_SEARCH_RESULT;
}

export type AllAirForwarder = | FetchingFCLAirForwarderData | FetchingFCLAirForwarderDataSuccess | FetchingFCLAirForwarderDataFail | UpdateFCLAirForwarderSearchData | UpdateFCLAirForwarderViewSearchResult | UpdateFCLAirForwarderMainSearchResult;
