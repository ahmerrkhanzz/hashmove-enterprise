import * as fromLCLAir from './air.reducer'
import * as fromLCLAirForwarder from './air-forwarders.reducer'

export const lclAirReducers = {
    lcl_air: fromLCLAir.lclAirReducer,
    lcl_air_forwarder: fromLCLAirForwarder.fclAirForwarderReducer
}