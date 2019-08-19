import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import * as lclShippingActions from "../actions/shipping.actions";
import { Observable } from "rxjs";
import { Action } from "@ngrx/store";
import { flatMap, map, catchError, mergeMap } from "rxjs/operators";
import { of } from "rxjs/observable/of";
import * as LCLShippingActions from "../actions/shipping.actions";
import { DropDownService } from "../../../../../services/dropdownservice/dropdown.service";
import { ShippingService } from "../../../../main/shipping/shipping.service";
import { CurrencyControl } from "../../../../../shared/currency/currency.injectable";

@Injectable()
export class LclShippingEffects {
  constructor(
    private $actions: Actions,
    private _searchService: ShippingService,
    private _dropDownService: DropDownService,
    private _currencyControl: CurrencyControl
  ) { }

  @Effect()
  $fetchLClShippings: Observable<Action> = this.$actions.pipe(
    ofType(LCLShippingActions.FETCHING_LCL_SHIPPING_DATA),
    mergeMap((action: any) => {
      const { searchMode } = action.payload
      return (
        Observable.forkJoin([
          (searchMode === 'truck-ftl') ? this._searchService.truckSearchResult(action.payload) : this._searchService.lclSearchResult(action.payload),
          this._dropDownService.getExchangeRateList(this._currencyControl.getBaseCurrencyID())
        ]).pipe(
          // If successful, dispatch success action with result
          map(
            (data: any) => {
              const { returnId } = data[0]
              if (returnId > 0) {
                return new lclShippingActions.FetchingLCLShippingDataSuccess(data)
              } else {
                return new lclShippingActions.FetchingLCLShippingDataFail(
                  null,
                  "Network Error Occured"
                )
              }
            }
          ),
          // If request fails, dispatch failed action
          catchError(() =>
            of(
              new lclShippingActions.FetchingLCLShippingDataFail(
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
