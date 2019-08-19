import * as fromWarehousing from './warehousing.reducer'


export const warehousingReducers = {
    warehousing_shippings: fromWarehousing.warehousingReducer
}

// export const getFclShippingState = createSelector((state: FCLState) => state.fcl_shippings)

// export const getFCLData = createSelector(getFclShippingState, fromFCLShipping.getShippingData)
// export const getFCLLoading = createSelector(getFclShippingState, fromFCLShipping.getShippingLoading)
// export const getFCLLoaded = createSelector(getFclShippingState, fromFCLShipping.getShippingLoaded)
// export const getFCLHasError = createSelector(getFclShippingState, fromFCLShipping.getShippingHassError)
// export const getFCLErrorMessage = createSelector(getFclShippingState, fromFCLShipping.getShippingErrorMessage)