import * as AirActions from '../actions/air.actions'
import { SearchResult } from '../../../../../interfaces/searchResult';
import { ExchangeRate } from '../../../../../interfaces/currencyDetails';
import { JsonResponse } from '../../../../../interfaces/JsonResponse';

export type AirAction = AirActions.AirAll
export interface LclAirState {
    loading: boolean;
    loaded: boolean;
    data: LclAirResponse;
    isSearchUpdate: boolean;
    isViewResultModified: boolean;
    isMainResultModified: boolean;
    hassError: boolean;
    errorMessage: any;
    loadFromApi: boolean;
    reloadFilters: boolean
}

interface LclAirResponse {
    response: JsonResponse;
    searchResult: SearchResult[];
    mainsearchResult: SearchResult[];
    exchangeRates: ExchangeRate;
}

//Default app state
const initialState: LclAirState = {
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
const newState = (state: LclAirState, newState: LclAirState) => {
    return Object.assign({}, state, newState)
}



//Reducer function
export function lclAirReducer(state: LclAirState = initialState, action: any) {
    switch (action.type) {
        case AirActions.FETCHING_LCL_AIR_DATA: return newState(state, {
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

        case AirActions.FETCHING_LCL_AIR_DATA_SUCCESS:
            return newState(state, {
                loading: false,
                loaded: true,
                data: {
                    response: action.payload,
                    exchangeRates: action.payload[0].returnObject,
                    mainsearchResult: JSON.parse(action.payload[0].returnText),
                    searchResult: JSON.parse(action.payload[0].returnText)
                },
                hassError: false,
                errorMessage: null,
                isViewResultModified: true,
                isMainResultModified: true,
                isSearchUpdate: false,
                loadFromApi: true,
                reloadFilters: true
            })

        case AirActions.FETCHING_LCL_AIR_DATA_FAIL:
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
        case AirActions.UPDATE_LCL_AIR_SEARCH_RESULT:
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
        case AirActions.UPDATE_LCL_AIR_VIEW_SEARCH_RESULT:
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
        case AirActions.UPDATE_LCL_AIR_MAIN_SEARCH_RESULT: return newState(state, {
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

// export const getAirLoading = (state: LclAirState) => state.loading
// export const getAirLoaded = (state: LclAirState) => state.loaded
// export const getAirData = (state: LclAirState) => state.data
// export const getAirHassError = (state: LclAirState) => state.hassError
// export const getAirErrorMessage = (state: LclAirState) => state.errorMessage
export const getLclInitalAirState = () => initialState
