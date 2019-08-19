import { Component, OnInit, Output, Input, EventEmitter, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyDetails } from '../../interfaces/currencyDetails';
import { ISlimScrollOptions, SlimScrollEvent } from 'ngx-slimscroll';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-currency-dropdown',
  templateUrl: './currency-dropdown.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./currency-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrencyDropdownComponent implements OnInit {


  opts: ISlimScrollOptions;
  scrollEvents: EventEmitter<SlimScrollEvent>;

  @Input() selectedCurrency: SelectedCurrency
  @Input() currencyList: CurrencyDetails[];

  @Output() selectedCurrencyEvent: EventEmitter<SelectedCurrency> = new EventEmitter<SelectedCurrency>();
  public shown = 'always';

  constructor() { }

  ngOnInit() {
    this.scrollEvents = new EventEmitter<SlimScrollEvent>();
    this.opts = {
      position: 'right',
      barBackground: '#C9C9C9',
      barOpacity: '0.8',
      barWidth: '5',
      barBorderRadius: '20',
      barMargin: '0',
      gridBackground: '#D9D9D9',
      gridOpacity: '1',
      gridWidth: '2',
      gridBorderRadius: '20',
      gridMargin: '0',
      alwaysVisible: true,
    }
  }


  currencyParser(obj) {
    return JSON.parse(obj).CountryName;
  }

  async currencyFilter(selectedCurrency: CurrencyDetails, index: number) {

    // this.currencyList[index].isActive = true
    // const curLenght: number = this.currencyList.length
    // for (let i = 0; i < curLenght; i++) {
    //   this.currencyList[i].isActive = false
    // }

    let newSelect: SelectedCurrency = {
      sortedCountryName: selectedCurrency.shortName,
      sortedCountryFlag: selectedCurrency.imageName.toLowerCase(),
      sortedCurrencyID: selectedCurrency.id,
      sortedCountryId: JSON.parse(selectedCurrency.desc).CountryID
    }

    this.selectedCurrency = newSelect
    this.selectedCurrencyEvent.emit(this.selectedCurrency)
  }

}

export interface SelectedCurrency {
  sortedCurrencyID: number
  sortedCountryName: string
  sortedCountryFlag: string
  sortedCountryId
}
