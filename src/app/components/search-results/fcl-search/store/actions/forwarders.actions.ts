import { Action } from "@ngrx/store";

export const FETCHING_FCL_FORWARDER_DATA = "[FCL] FetchingFCLForwarderData";
export const FETCHING_FCL_FORWARDER_DATA_SUCCESS = "[FCL] FetchingFCLForwarderDataSuccess";
export const FETCHING_FCL_FORWARDER_DATA_FAIL = "[FCL] FetchingFCLForwarderDataFail";
export const UPDATE_FCL_FORWARDER_SEARCH_RESULT = "[FCL] UpdateFCLForwarderSearchResult";
export const UPDATE_FCL_FORWARDER_VIEW_SEARCH_RESULT = "[FCL] UpdateFCLForwarderViewSearchResult";
export const UPDATE_FCL_FORWARDER_MAIN_SEARCH_RESULT = "[FCL] UpdateFCLForwarderMainSearchResult";
export const UPDATE_FCL_FORWARDER_ROUTE_CHANGE = "[FCL] UpdateFCLForwarderRouteChange";

export class FetchingFCLForwarderData implements Action {
  constructor(public payload: any) { }
  readonly type: string = FETCHING_FCL_FORWARDER_DATA;
}

export class FetchingFCLForwarderDataSuccess implements Action {
  constructor(public payload: any) { }
  readonly type: string = FETCHING_FCL_FORWARDER_DATA_SUCCESS;
}

export class FetchingFCLForwarderDataFail implements Action {
  constructor(public payload: any, public errorMessage: string) { }
  readonly type: string = FETCHING_FCL_FORWARDER_DATA_FAIL;
}

export class UpdateFCLForwarderSearchData implements Action {
  constructor(public payload: any) { }
  readonly type: string = UPDATE_FCL_FORWARDER_SEARCH_RESULT;
}
export class UpdateFCLForwarderViewSearchResult implements Action {
  constructor(public payload: any) { }
  readonly type: string = UPDATE_FCL_FORWARDER_VIEW_SEARCH_RESULT;
}
export class UpdateFCLForwarderMainSearchResult implements Action {
  constructor(public payload: any) { }
  readonly type: string = UPDATE_FCL_FORWARDER_MAIN_SEARCH_RESULT;
}
export class UpdateFCLForwarderRouteChange implements Action {
  constructor() { }
  readonly type: string = UPDATE_FCL_FORWARDER_ROUTE_CHANGE;
}

export type AllForwarder = | FetchingFCLForwarderData | FetchingFCLForwarderDataSuccess | FetchingFCLForwarderDataFail | UpdateFCLForwarderSearchData | UpdateFCLForwarderViewSearchResult | UpdateFCLForwarderMainSearchResult | UpdateFCLForwarderRouteChange;
