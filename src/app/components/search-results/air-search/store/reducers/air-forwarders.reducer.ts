import * as ForwarderActions from '../actions/air-forwarders.actions'
import { ProvidersSearchResult, SearchResult } from '../../../../../interfaces/searchResult';
import { ExchangeRate } from '../../../../../interfaces/currencyDetails';
import { JsonResponse } from '../../../../../interfaces/JsonResponse';

export type ForwardAction = ForwarderActions.AllAirForwarder

export interface FclForwarderState {
  loading: boolean;
  loaded: boolean;
  data: FclForwarderResponse;
  isSearchUpdate: boolean;
  isViewResultModified: boolean;
  isMainResultModified: boolean;
  loadFromApi: boolean;
  hassError: boolean;
  errorMessage: any;
}

interface FclForwarderResponse {
  response: any,
  providersList: ProvidersSearchResult[],
  mainProvidersList: ProvidersSearchResult[]
  exchangeRates: ExchangeRate,
}

//Default app state
const initialState: FclForwarderState = {
  loaded: false,
  loading: false,
  data: null,
  hassError: false,
  errorMessage: null,
  isSearchUpdate: false,
  isViewResultModified: false,
  isMainResultModified: false,
  loadFromApi: false,
}

//Helper for setting new state
const newState = (state: FclForwarderState, newState: FclForwarderState) => {
  return Object.assign({}, state, newState)
}

//Reducer function
export function fclAirForwarderReducer (state: FclForwarderState = initialState, action: any) {

  switch (action.type) {
    case ForwarderActions.FETCHING_FCL_AIR_FORWARDER_DATA: return newState(state, {
      loading: true,
      loaded: false,
      data: null,
      hassError: null,
      errorMessage: null,
      isSearchUpdate: false,
      isViewResultModified: false,
      isMainResultModified: false,
      loadFromApi: false,
    })

    case ForwarderActions.FETCHING_FCL_AIR_FORWARDER_DATA_SUCCESS:
      
      return newState(state, {
        loading: false,
        loaded: true,
        data: {
          exchangeRates: action.payload[1].returnObject,
          response: action.payload,
          providersList: JSON.parse(action.payload[0].returnText),
          mainProvidersList: JSON.parse(action.payload[0].returnText)
        },
        hassError: false,
        errorMessage: null,
        isSearchUpdate: false,
        isViewResultModified: false,
        isMainResultModified: false,
        loadFromApi: true,
      })

    case ForwarderActions.FETCHING_FCL_AIR_FORWARDER_DATA_FAIL: return newState(state, {
      loading: false,
      loaded: true,
      data: null,
      hassError: true,
      errorMessage: 'Error Fetching Data',
      isSearchUpdate: false,
      isViewResultModified: false,
      isMainResultModified: false,
      loadFromApi: false,
    })
    case ForwarderActions.UPDATE_FCL_AIR_FORWARDER_SEARCH_RESULT:
      
      return newState(state, {
        loading: false,
        loaded: true,
        data: {
          exchangeRates: state.data.exchangeRates,
          response: state.data.response,
          providersList: action.payload,
          mainProvidersList: action.payload
        },
        hassError: false,
        errorMessage: null,
        isSearchUpdate: true,
        isViewResultModified: true,
        isMainResultModified: true,
        loadFromApi: false,
      })
    case ForwarderActions.UPDATE_FCL_AIR_FORWARDER_VIEW_SEARCH_RESULT:
      
      return newState(state, {
        loading: false,
        loaded: true,
        data: {
          exchangeRates: state.data.exchangeRates,
          response: state.data.response,
          providersList: action.payload,
          mainProvidersList: state.data.mainProvidersList
        },
        hassError: false,
        errorMessage: null,
        isSearchUpdate: true,
        isViewResultModified: true,
        isMainResultModified: false,
        loadFromApi: false,
      })
    case ForwarderActions.UPDATE_FCL_AIR_FORWARDER_MAIN_SEARCH_RESULT:
      return newState(state, {
        loading: false,
        loaded: true,
        data: {
          exchangeRates: state.data.exchangeRates,
          response: state.data.response,
          providersList: state.data.providersList,
          mainProvidersList: action.payload
        },
        hassError: false,
        errorMessage: null,
        isSearchUpdate: true,
        isViewResultModified: false,
        isMainResultModified: true,
        loadFromApi: false,
      })

    default:
      return state
  }

}

// export const getShippingLoading = (state: FclForwarderState) => state.loading
// export const getShippingLoaded = (state: FclForwarderState) => state.loaded
// export const getShippingData = (state: FclForwarderState) => state.data
// export const getShippingHassError = (state: FclForwarderState) => state.hassError
// export const getShippingErrorMessage = (state: FclForwarderState) => state.errorMessage
export const getFclAirInitalForwarderState = () => initialState