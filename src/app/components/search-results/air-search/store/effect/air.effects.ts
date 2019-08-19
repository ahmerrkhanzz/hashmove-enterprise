import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import * as lclAirActions from "../actions/air.actions";
import { Observable } from "rxjs";
import { Action } from "@ngrx/store";
import { flatMap, map, catchError, mergeMap } from "rxjs/operators";
import { of } from "rxjs/observable/of";
import * as LCLAirActions from "../actions/air.actions";
import { DropDownService } from "../../../../../services/dropdownservice/dropdown.service";
import { SearchResultService } from "../../../fcl-search/fcl-search.service";
import { JsonResponse } from "../../../../../interfaces/JsonResponse";
import { CurrencyControl } from "../../../../../shared/currency/currency.injectable";

@Injectable()
export class LclAirEffects {
  constructor(
    private $actions: Actions,
    private _searchService: SearchResultService,
    private _dropDownService: DropDownService,
    private _currencyControl: CurrencyControl
  ) { }

  @Effect()
  $fetchLClAirs: Observable<Action> = this.$actions.pipe(
    ofType(LCLAirActions.FETCHING_LCL_AIR_DATA),
    mergeMap((action: any) => {
      return (
        Observable.forkJoin([
          this._searchService.searchResult(action.payload),
          this._dropDownService.getExchangeRateList(
            this._currencyControl.getBaseCurrencyID()
          )
        ]).pipe(
          // If successful, dispatch success action with result
          map(
            (data: any) => {
              const { returnId } = data[0]
              if (returnId > 0) {
                return new lclAirActions.FetchingLCLAirDataSuccess(data)
              } else {
                return new lclAirActions.FetchingLCLAirDataFail(
                  null,
                  "Network Error Occured"
                )
              }
            }
          ),
          // If request fails, dispatch failed action
          catchError(() =>
            of(
              new lclAirActions.FetchingLCLAirDataFail(
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
