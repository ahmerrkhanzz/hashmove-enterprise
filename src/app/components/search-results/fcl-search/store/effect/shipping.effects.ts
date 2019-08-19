import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import * as fclShippingActions from "../actions/shipping.actions";
import { Observable } from "rxjs";
import { Action } from "@ngrx/store";
import { SearchResultService } from "../../fcl-search.service";
import { flatMap, map, catchError, mergeMap } from "rxjs/operators";
import { of } from "rxjs/observable/of";
import * as FCLShippingActions from "../actions/shipping.actions";
import { DropDownService } from "../../../../../services/dropdownservice/dropdown.service";
import { CurrencyControl } from "../../../../../shared/currency/currency.injectable";
import { decryptStringAES, encryptStringAES } from "../../../../../constants/globalfunctions";
import * as moment from 'moment'

@Injectable()
export class FclShippingEffects {
  constructor(
    private $actions: Actions,
    private _searchService: SearchResultService,
    private _dropDownService: DropDownService,
    private _currencyControl: CurrencyControl
  ) { }

  @Effect()
  $fetchFClShippings: Observable<Action> = this.$actions.pipe(
    ofType(fclShippingActions.FETCHING_FCL_SHIPPING_DATA),
    mergeMap((action: any) => {
      // const encryptedPayload = encryptStringAES({ d1: moment(Date.now()).format().substring(0, 16), d2: JSON.stringify(action.payload) })
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
              const { returnId, returnText } = data[0]
              if (returnId > 0) {
                return new fclShippingActions.FetchingFCLShippingDataSuccess(data)
              } else {
                return new fclShippingActions.FetchingFCLShippingDataFail(
                  null,
                  "Network Error Occured"
                )
              }
            }
          ),
          // If request fails, dispatch failed action
          catchError(() =>
            of(
              new fclShippingActions.FetchingFCLShippingDataFail(
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
