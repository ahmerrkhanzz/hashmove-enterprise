import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CurrencyControl } from '../../../../shared/currency/currency.injectable';

@Component({
  selector: 'app-fetching-searchresult',
  templateUrl: './fetching.component.html',
  styleUrls: ['./fetching.component.scss'],
})
export class FetchingComponent implements OnInit {

  constructor(
    private _currencyControl: CurrencyControl
  ) { }

  ngOnInit() {
  }

}
