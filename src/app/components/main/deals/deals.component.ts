import { Component, OnInit, Input } from '@angular/core';
import { CurrencyControl } from '../../../shared/currency/currency.injectable';
import { DataService } from '../../../services/commonservice/data.service';
import { HashStorage } from '../../../constants/globalfunctions';

@Component({
  selector: 'app-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.scss']
})


export class DealsComponent implements OnInit {
  @Input() page: string;
  public deals: any;
  public currencyCode: string;
  public currencyData: CurrencyChange
  public selectedProvider: any;


  constructor(
    public _dataService: DataService,
    private _currencyControl: CurrencyControl
  ) { }

  ngOnInit() {
    this.selectedProvider = JSON.parse(HashStorage.getItem('selectedProvider'))
    this.deals = [
      {
        pickup: 'Dubai, UAE',
        destination: 'London, UK',
        currency: this._currencyControl.getCurrencyCode(),
        price: 2000,
        basePrice: 2000,
        currencyCode: 'AED',
        baseCurrencyCode: 'AED',
        provider: '../../../../assets/images/logos/freight-reach.png',
        mode: 'sea',
        isNew: true,
        day: '23',
        hour: '10',
        min: '30',
        class: 'card-dubai',
        banner: '1',
      },
      {
        pickup: 'Shanghai, China',
        destination: 'Dubai, UAE',
        currency: this._currencyControl.getCurrencyCode(),
        price: 1800,
        basePrice: 1800,
        currencyCode: 'AED',
        baseCurrencyCode: 'AED',
        provider: 'x../../../../assets/images/logos/freight-forwarders/Emirates logo-2.svg',
        mode: 'air',
        isNew: false,
        day: '20',
        hour: '05',
        min: '00',
        class: 'card-china',
        banner: '2'
      },
      {
        pickup: 'Dubai, UAE',
        destination: 'Melbourne, Australia',
        currency: this._currencyControl.getCurrencyCode(),
        price: 3000,
        basePrice: 3000,
        currencyCode: 'AED',
        baseCurrencyCode: 'AED',
        provider: '../../../../assets/images/logos/freight-forwarders/AFS logistics.svg',
        mode: 'air',
        isNew: false,
        day: '23',
        hour: '07',
        min: '00',
        class: 'card-dubai2',
        banner: '3'
      },
      {
        pickup: 'Abu Dhabi, UAE',
        destination: 'Andorra, Europe',
        currency: this._currencyControl.getCurrencyCode(),
        price: 8000,
        basePrice: 8000,
        currencyCode: 'AED',
        baseCurrencyCode: 'AED',
        provider: '../../../../assets/images/logos/freight-forwarders/Wan Hai Lines.svg',
        mode: 'sea',
        isNew: false,
        day: '04',
        hour: '11',
        min: '30',
        class: 'card-abu-dhabi',
        banner: '4'
      },
      {
        pickup: 'Abu Dhabi, UAE',
        destination: 'Tokyo, Japan',
        currency: this._currencyControl.getCurrencyCode(),
        price: 5190,
        basePrice: 5190,
        currencyCode: 'AED',
        baseCurrencyCode: 'AED',
        provider: '../../../../assets/images/logos/freight-forwarders/Freight EX.svg',
        mode: 'air',
        isNew: false,
        day: '05',
        hour: '03',
        min: '00',
        class: 'card-srilanka',
        banner: '5'
      },
      {
        pickup: 'Abu Dhabi, UAE',
        destination: 'Vancouver, Canada',
        currency: this._currencyControl.getCurrencyCode(),
        price: 6190,
        basePrice: 6190,
        currencyCode: 'AED',
        baseCurrencyCode: 'AED',
        provider: '../../../../assets/images/logos/freight-forwarders/gsp.jpg',
        mode: 'sea',
        isNew: false,
        day: '07',
        hour: '04',
        min: '00',
        class: 'card-bangladesh',
        banner: '6'
      },
      {
        pickup: 'San Francisco, US',
        destination: 'Abu Dhabi, UAE',
        currency: this._currencyControl.getCurrencyCode(),
        price: 3250,
        basePrice: 3250,
        currencyCode: 'AED',
        baseCurrencyCode: 'AED',
        provider: '../../../../assets/images/logos/freight-forwarders/Apex Global.svg',
        mode: 'sea',
        isNew: false,
        day: '09',
        hour: '06',
        min: '00',
        class: 'card-us',
        banner: '7'
      }
    ]

    this.currencyData = this._dataService.userCurrencyCode.getValue();
    this.currencyCode = this.currencyData.code
    this._dataService.userCurrencyCode.subscribe(state => {
      if (state) {
        this.currencyData = state
        this.deals.forEach(element => {
          element.currency = this.currencyData.code
          element.price = this._currencyControl.applyRoundByDecimal(this._currencyControl.getNewPrice(element.basePrice, this.currencyData.rate), 0)
        });
      }
    });
  }


}


export interface CurrencyChange {
  code: string,
  rate: number,
}

