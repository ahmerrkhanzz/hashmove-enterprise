import { ActionReducerMap, createSelector, combineReducers } from '@ngrx/store'
import * as fromFCLShipping from './shipping.reducer'
import * as fromFCLForwarder from './forwarders.reducer'


export const fclReducers = {
    fcl_shippings: fromFCLShipping.fclShippingReducer,
    fcl_forwarder: fromFCLForwarder.fclForwarderReducer
}

// export const getFclShippingState = createSelector((state: FCLState) => state.fcl_shippings)

// export const getFCLData = createSelector(getFclShippingState, fromFCLShipping.getShippingData)
// export const getFCLLoading = createSelector(getFclShippingState, fromFCLShipping.getShippingLoading)
// export const getFCLLoaded = createSelector(getFclShippingState, fromFCLShipping.getShippingLoaded)
// export const getFCLHasError = createSelector(getFclShippingState, fromFCLShipping.getShippingHassError)
// export const getFCLErrorMessage = createSelector(getFclShippingState, fromFCLShipping.getShippingErrorMessage)