import { Injectable } from '@angular/core';
import { DropDownService } from '../../services/dropdownservice/dropdown.service';
import { CurrencyDetails, Rate } from '../../interfaces/currencyDetails';
import { removeDuplicateCurrencies, Tea, HashStorage, getDefaultCountryCode } from '../../constants/globalfunctions';
import { CurrencyControl } from '../currency/currency.injectable';

@Injectable()
export class SetupService {

  constructor(
    private _dropDownService: DropDownService,
    private _currencyControl: CurrencyControl
  ) { }


  async setBaseCurrencyConfig() {

    let res: any = await this._dropDownService.getCurrency().toPromise()
    let currencyList: CurrencyDetails[] = res

    currencyList = removeDuplicateCurrencies(currencyList)
    this._currencyControl.setCurrencyList(currencyList)

    let userData = JSON.parse(Tea.getItem('loginUser'))

    if (userData && !userData.IsLogedOut && ((userData.CurrencyID && userData.CurrencyID > 0) && (userData.CurrencyOwnCountryID && userData.CurrencyOwnCountryID > 0))) {
      let currData: CurrencyDetails[]
      // currData = currencyList.filter(curr => curr.id === userData.CurrencyID && JSON.parse(curr.desc).CountryID === userData.CurrencyOwnCountryID)
      currData = currencyList.filter(curr => curr.id === userData.CurrencyID)
      this._currencyControl.setCurrencyID(userData.CurrencyID)
      this._currencyControl.setCurrencyCode(currData[0].code)
      this._currencyControl.setToCountryID(JSON.parse(currData[0].desc).CountryID)

      let exchangeRes: any = await this._dropDownService.getExchangeRateList(this._currencyControl.getBaseCurrencyID()).toPromise()
      this._currencyControl.setExchangeRateList(exchangeRes.returnObject)
      let exchnageRate: Rate = exchangeRes.returnObject.rates.filter(rate => rate.currencyID === this._currencyControl.getCurrencyID())[0]
      this._currencyControl.setExchangeRate(exchnageRate.rate)
      if (!HashStorage.getItem('CURR_MASTER')) {
        HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
      }
      let masterCurrency = JSON.parse(HashStorage.getItem('CURR_MASTER'))
      this._currencyControl.setMasterCurrency(masterCurrency)
    } else {
      let currData: CurrencyDetails[] = currencyList.filter(curr => JSON.parse(curr.desc).CountryCode.toLowerCase() === getDefaultCountryCode().toLowerCase())
      this._currencyControl.setCurrencyID(currData[0].id)
      this._currencyControl.setCurrencyCode(currData[0].code)
      this._currencyControl.setToCountryID(JSON.parse(currData[0].desc).CountryID)

      let exchangeRes: any = await this._dropDownService.getExchangeRateList(this._currencyControl.getBaseCurrencyID()).toPromise()
      this._currencyControl.setExchangeRateList(exchangeRes.returnObject)
      let exchnageRate: Rate = exchangeRes.returnObject.rates.filter(rate => rate.currencyID === this._currencyControl.getCurrencyID())[0]
      this._currencyControl.setExchangeRate(exchnageRate.rate)
      if (!HashStorage.getItem('CURR_MASTER')) {
        HashStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
      }

      let masterCurrency = JSON.parse(HashStorage.getItem('CURR_MASTER'))
      this._currencyControl.setMasterCurrency(masterCurrency)
    }
    return 'done'
  }

  setCurrency2Location() {
    try {
      const currencyList = this._currencyControl.getCurrencyList()
      const countryCode = getDefaultCountryCode()
      let currData: CurrencyDetails[] = currencyList.filter(curr => JSON.parse(curr.desc).CountryCode.toLowerCase() === countryCode.toLowerCase())
      this._currencyControl.setCurrencyID(currData[0].id)
      this._currencyControl.setCurrencyCode(currData[0].code)
      this._currencyControl.setToCountryID(JSON.parse(currData[0].desc).CountryID)
    } catch (error) { }
  }

}
