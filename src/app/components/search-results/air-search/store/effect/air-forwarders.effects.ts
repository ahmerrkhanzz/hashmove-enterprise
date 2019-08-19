import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import * as fclForwarderActions from "../actions/air-forwarders.actions";
import { Observable } from "rxjs";
import { Action } from "@ngrx/store";
import { flatMap, map, catchError, mergeMap } from "rxjs/operators";
import { of } from "rxjs/observable/of";
import { DropDownService } from "../../../../../services/dropdownservice/dropdown.service";
import { SearchResultService } from "../../../fcl-search/fcl-search.service";
import { CurrencyControl } from "../../../../../shared/currency/currency.injectable";

@Injectable()
export class FclAirForwarderEffects {
  constructor(
    private $actions: Actions,
    private _searchService: SearchResultService,
    private _dropDownService: DropDownService,
    private _currencyControl: CurrencyControl
  ) { }

  @Effect()
  $fetchFClAirForwarders: Observable<Action> = this.$actions.pipe(
    ofType(fclForwarderActions.FETCHING_FCL_AIR_FORWARDER_DATA),
    mergeMap((action: any) => {
      return (
        Observable.forkJoin([
          this._searchService.getProvidersSearchResult(action.payload),
          this._dropDownService.getExchangeRateList(
            this._currencyControl.getBaseCurrencyID()
          )
        ]).pipe(
          // If successful, dispatch success action with result
          map(
            (data: any) => {
              const { returnId } = data[0]
              if (returnId > 0) {
                return new fclForwarderActions.FetchingFCLAirForwarderDataSuccess(data)
              } else {
                return new fclForwarderActions.FetchingFCLAirForwarderDataFail(
                  null,
                  "Network Error Occured"
                )
              }
            }
          ),
          // If request fails, dispatch failed action
          catchError(() =>
            of(
              new fclForwarderActions.FetchingFCLAirForwarderDataFail(
                null,
                "Network Error Occured"
              )
            )
          )
        )
      )
    })
  );
}
