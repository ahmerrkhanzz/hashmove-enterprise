import * as ShippingActions from '../actions/shipping.actions'
import { SearchResult } from '../../../../../interfaces/searchResult';
import { ExchangeRate } from '../../../../../interfaces/currencyDetails';
import { JsonResponse } from '../../../../../interfaces/JsonResponse';

export type ShipAction = ShippingActions.ShipAll

export interface FclShippingState {
    loading: boolean;
    loaded: boolean;
    data: FclShippingResponse;
    isSearchUpdate: boolean;
    isViewResultModified: boolean;
    isMainResultModified: boolean;
    hassError: boolean;
    errorMessage: any;
    loadFromApi: boolean;
    reloadFilters: boolean
}

interface FclShippingResponse {
    response: Array<JsonResponse>;
    searchResult: SearchResult[];
    mainsearchResult: SearchResult[];
    exchangeRates: ExchangeRate;
}

//Default app state
const initialState: FclShippingState = {
    loaded: false,
    loading: false,
    data: null,
    hassError: false,
    errorMessage: null,
    isViewResultModified: false,
    isMainResultModified: false,
    isSearchUpdate: false,
    loadFromApi: false,
    reloadFilters: false
}

//Helper for setting new state
const newState = (state: FclShippingState, newState: FclShippingState) => {
    return Object.assign({}, state, newState)
}

//Reducer function
export function fclShippingReducer(state: FclShippingState = initialState, action: any) {
    switch (action.type) {
        case ShippingActions.FETCHING_FCL_SHIPPING_DATA: return newState(state, {
            loading: true,
            loaded: false,
            data: null,
            hassError: null,
            errorMessage: null,
            isViewResultModified: false,
            isMainResultModified: false,
            isSearchUpdate: false,
            loadFromApi: true,
            reloadFilters: false
        })

        case ShippingActions.FETCHING_FCL_SHIPPING_DATA_SUCCESS:
            return newState(state, {
                loading: false,
                loaded: true,
                data: {
                    exchangeRates: action.payload[1].returnObject,
                    response: action.payload,
                    searchResult: JSON.parse(action.payload[0].returnText),
                    mainsearchResult: JSON.parse(action.payload[0].returnText),
                },
                hassError: false,
                errorMessage: null,
                isViewResultModified: true,
                isMainResultModified: true,
                isSearchUpdate: false,
                loadFromApi: true,
                reloadFilters: true
            })

        case ShippingActions.FETCHING_FCL_SHIPPING_DATA_FAIL: return newState(state, {
            loading: false,
            loaded: true,
            data: {
                exchangeRates: null,
                response: null,
                searchResult: [],
                mainsearchResult: [],
            },
            hassError: true,
            errorMessage: 'Error Fetching Data',
            isViewResultModified: false,
            isMainResultModified: false,
            isSearchUpdate: false,
            loadFromApi: true,
            reloadFilters: false
        })
        case ShippingActions.UPDATE_FCL_SHIPPING_SEARCH_RESULT: return newState(state, {
            loading: false,
            loaded: true,
            data: {
                exchangeRates: state.data.exchangeRates,
                response: state.data.response,
                searchResult: action.payload,
                mainsearchResult: action.payload,
            },
            hassError: false,
            errorMessage: null,
            isViewResultModified: true,
            isMainResultModified: true,
            isSearchUpdate: true,
            loadFromApi: false,
            reloadFilters: true
        })
        case ShippingActions.UPDATE_FCL_SHIPPING_VIEW_SEARCH_RESULT: return newState(state, {
            loading: false,
            loaded: true,
            data: {
                exchangeRates: state.data.exchangeRates,
                response: state.data.response,
                searchResult: action.payload,
                mainsearchResult: state.data.mainsearchResult,
            },
            hassError: false,
            errorMessage: null,
            isViewResultModified: true,
            isMainResultModified: false,
            isSearchUpdate: true,
            loadFromApi: false,
            reloadFilters: true
        })
        case ShippingActions.UPDATE_FCL_SHIPPING_MAIN_SEARCH_RESULT: return newState(state, {
            loading: false,
            loaded: true,
            data: {
                exchangeRates: state.data.exchangeRates,
                response: state.data.response,
                searchResult: state.data.searchResult,
                mainsearchResult: action.payload,
            },
            hassError: false,
            errorMessage: null,
            isViewResultModified: false,
            isMainResultModified: true,
            isSearchUpdate: true,
            loadFromApi: false,
            reloadFilters: true
        })
        case ShippingActions.UPDATE_FCL_SHIPPING_ROUTE_CHANGE: return newState(state, {
            loading: false,
            loaded: true,
            data: {
                exchangeRates: state.data.exchangeRates,
                response: state.data.response,
                searchResult: state.data.searchResult,
                mainsearchResult: state.data.mainsearchResult,
            },
            hassError: false,
            errorMessage: null,
            isViewResultModified: true,
            isMainResultModified: true,
            isSearchUpdate: false,
            loadFromApi: false,
            reloadFilters: true
        })

        default:
            return state
    }

}

// export const getShippingLoading = (state: FclShippingState) => state.loading
// export const getShippingLoaded = (state: FclShippingState) => state.loaded
// export const getShippingData = (state: FclShippingState) => state.data
// export const getShippingHassError = (state: FclShippingState) => state.hassError
// export const getShippingErrorMessage = (state: FclShippingState) => state.errorMessage
export const getFclInitalShippingState = () => initialState
