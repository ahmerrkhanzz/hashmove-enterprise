import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import * as warehousingActions from "../actions/warehousing.actions";
import { Observable } from "rxjs";
import { Action } from "@ngrx/store";
import { flatMap, map, catchError, mergeMap } from "rxjs/operators";
import { of } from "rxjs/observable/of";
import * as WarehousingActions from "../actions/warehousing.actions";
import { DropDownService } from "../../../../../services/dropdownservice/dropdown.service";
import { WarehousingService } from "../../../../main/warehousing/warehousing.service";
import { CurrencyControl } from "../../../../../shared/currency/currency.injectable";

@Injectable()
export class WarehousingEffects {
  constructor(
    private $actions: Actions,
    private _searchService: WarehousingService,
    private _dropDownService: DropDownService,
    private _currencyControl: CurrencyControl
  ) { }

  @Effect()
  $fetchLClShippings: Observable<Action> = this.$actions.pipe(
    ofType(WarehousingActions.FETCHING_WAREHOUSING_DATA),
    mergeMap((action: any) => {
      return (
        Observable.forkJoin([
          this._searchService.warehouseSearchResult(action.payload),
          this._dropDownService.getExchangeRateList(
            this._currencyControl.getBaseCurrencyID()
          )
        ]).pipe(
          // If successful, dispatch success action with result
          map(
            (data: any) => {
              const { returnId } = data[0]
              if (returnId > 0) {
                return new warehousingActions.FetchingWarehousingDataSuccess(data)
              } else {
                return new warehousingActions.FetchingWarehousingDataFail(
                  null,
                  "Network Error Occured"
                )
              }
            }
          ),
          // If request fails, dispatch failed action
          catchError(() =>
            of(
              new warehousingActions.FetchingWarehousingDataFail(
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
