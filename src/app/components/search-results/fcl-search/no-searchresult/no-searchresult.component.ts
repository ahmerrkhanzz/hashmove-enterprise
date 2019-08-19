import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CurrencyControl } from '../../../../shared/currency/currency.injectable';

@Component({
  selector: 'app-no-searchresult',
  templateUrl: './no-searchresult.component.html',
  styleUrls: ['./no-searchresult.component.scss'],
})
export class NoSearchresultComponent implements OnInit {

  constructor(
    private _currencyControl: CurrencyControl
  ) { }

  public selectedCurrencyCode: string = this._currencyControl.getCurrencyCode()
  
  ngOnInit() {
  }

}
