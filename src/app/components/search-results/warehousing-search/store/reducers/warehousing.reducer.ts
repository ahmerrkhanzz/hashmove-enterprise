import * as ShippingActions from '../actions/warehousing.actions'
import { ExchangeRate } from '../../../../../interfaces/currencyDetails';
import { JsonResponse } from '../../../../../interfaces/JsonResponse';
import { WarehouseSearchResult } from '../../../../../interfaces/warehouse.interface';

export type ShipAction = ShippingActions.ShipAll

export interface WarehousingState {
    loading: boolean;
    loaded: boolean;
    data: WarehousingResponse;
    isSearchUpdate: boolean;
    isViewResultModified: boolean;
    isMainResultModified: boolean;
    hassError: boolean;
    errorMessage: any;
    loadFromApi: boolean;
    reloadFilters: boolean
}

interface WarehousingResponse {
    response: JsonResponse;
    searchResult: WarehouseSearchResult[];
    mainsearchResult: WarehouseSearchResult[];
    exchangeRates: ExchangeRate;
}

//Default app state
const initialState: WarehousingState = {
    loaded: false,
    loading: false,
    data: null,
    hassError: false,
    errorMessage: null,
    isViewResultModified: false,
    isMainResultModified: false,
    isSearchUpdate: false,
    loadFromApi: true,
    reloadFilters: false
}

//Helper for setting new state
const newState = (state: WarehousingState, newState: WarehousingState) => {
    return Object.assign({}, state, newState)
}

//Reducer function
export function warehousingReducer(state: WarehousingState = initialState, action: any) {
    switch (action.type) {
        case ShippingActions.FETCHING_WAREHOUSING_DATA: return newState(state, {
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

        case ShippingActions.FETCHING_WAREHOUSING_DATA_SUCCESS:
            return newState(state, {
                loading: false,
                loaded: true,
                data: {
                    exchangeRates: action.payload[1].returnObject,
                    response: action.payload,
                    searchResult: action.payload[0].returnObject,
                    mainsearchResult: action.payload[0].returnObject,
                },
                hassError: false,
                errorMessage: null,
                isViewResultModified: true,
                isMainResultModified: true,
                isSearchUpdate: false,
                loadFromApi: true,
                reloadFilters: true
            })

        case ShippingActions.FETCHING_WAREHOUSING_DATA_FAIL:
            return newState(state, {
                loading: false,
                loaded: true,
                data: null,
                hassError: true,
                errorMessage: 'Error Fetching Data',
                isViewResultModified: false,
                isMainResultModified: false,
                isSearchUpdate: false,
                loadFromApi: true,
                reloadFilters: false
            })
        case ShippingActions.UPDATE_WAREHOUSING_SEARCH_RESULT:
            return newState(state, {
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
        case ShippingActions.UPDATE_WAREHOUSING_VIEW_SEARCH_RESULT:
            return newState(state, {
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
        case ShippingActions.UPDATE_WAREHOUSING_MAIN_SEARCH_RESULT: return newState(state, {
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

        default:
            return state
    }

}

// export const getShippingLoading = (state: WarehousingState) => state.loading
// export const getShippingLoaded = (state: WarehousingState) => state.loaded
// export const getShippingData = (state: WarehousingState) => state.data
// export const getShippingHassError = (state: WarehousingState) => state.hassError
// export const getShippingErrorMessage = (state: WarehousingState) => state.errorMessage
export const getWarehousingInitalState = () => initialState