import { Injectable } from "@angular/core";
import { MasterCurrency, CurrencyDetails, ExchangeRate, Rate } from "../../interfaces/currencyDetails";
import { SearchResult, ProvidersSearchResult } from "../../interfaces/searchResult";
import { PriceDetail, SaveBookingObject } from "../../interfaces/bookingDetails";
import { HashStorage } from "../../constants/globalfunctions";
import { SearchCriteria } from "../../interfaces/searchCriteria";

@Injectable()
export class CurrencyControl {


    private MASTER_CURRENCY: MasterCurrency = {
        fromCurrencyCode: 'AED',
        fromCurrencyID: 101,
        rate: 1,
        toCurrencyCode: 'AED',
        toCurrencyID: 101,
        toCountryID: 101
    }

    private GLOBAL_DECIMAL_PLACES: number = 2
    private CURRENCY_LIST: CurrencyDetails[]
    private EXCHANGE_RATE_LIST: ExchangeRate

    setCurrencyList(currencyList: CurrencyDetails[]) {
        this.CURRENCY_LIST = currencyList
    }

    getCurrencyList(): CurrencyDetails[] {
        return this.CURRENCY_LIST
    }

    setCurrencyID(currencyId: number) {
        this.MASTER_CURRENCY.toCurrencyID = currencyId
        HashStorage.setItem('CURR_MASTER', JSON.stringify(this.getMasterCurrency()))
    }

    getCurrencyID(): number {
        return this.MASTER_CURRENCY.toCurrencyID
    }
    setBaseCurrencyID(currencyId: number) {
        this.MASTER_CURRENCY.fromCurrencyID = currencyId
        HashStorage.setItem('CURR_MASTER', JSON.stringify(this.getMasterCurrency()))
    }

    getBaseCurrencyID(): number {
        return this.MASTER_CURRENCY.fromCurrencyID
    }
    setBaseCurrencyCode(currencyCode: string) {
        this.MASTER_CURRENCY.fromCurrencyCode = currencyCode
        HashStorage.setItem('CURR_MASTER', JSON.stringify(this.getMasterCurrency()))
    }

    getBaseCurrencyCode(): string {
        return this.MASTER_CURRENCY.fromCurrencyCode
    }
    setCurrencyCode(currencyCode: string) {
        this.MASTER_CURRENCY.toCurrencyCode = currencyCode
        HashStorage.setItem('CURR_MASTER', JSON.stringify(this.getMasterCurrency()))
    }

    getCurrencyCode(): string {
        return this.MASTER_CURRENCY.toCurrencyCode
    }
    setExchangeRate(exRate: number) {
        this.MASTER_CURRENCY.rate = exRate
        HashStorage.setItem('CURR_MASTER', JSON.stringify(this.getMasterCurrency()))
    }

    getExchangeRate(): number {
        return this.MASTER_CURRENCY.rate
    }
    setToCountryID(countryID: number) {
        this.MASTER_CURRENCY.toCountryID = countryID
        HashStorage.setItem('CURR_MASTER', JSON.stringify(this.getMasterCurrency()))
    }

    getToCountryID(): number {
        return this.MASTER_CURRENCY.toCountryID
    }

    setExchangeRateList(rateList: ExchangeRate) {
        this.EXCHANGE_RATE_LIST = rateList
    }

    getExchangeRateList(): ExchangeRate {
        return this.EXCHANGE_RATE_LIST
    }

    setMasterCurrency(masterCurr: MasterCurrency) {
        this.MASTER_CURRENCY = masterCurr
    }

    getMasterCurrency(): MasterCurrency {
        return this.MASTER_CURRENCY
    }


    getGlobalDecimal(): number {
        return this.GLOBAL_DECIMAL_PLACES
    }

    applyCurrencyRateOnSearchResult(selectedCurrencyID: number, exchangeData: ExchangeRate, searchResult: SearchResult[], providersSearchResult: any[]): SearchResult[] | ProvidersSearchResult[] {

        let exchnageRate: Rate = exchangeData.rates.filter(rate => rate.currencyID === selectedCurrencyID)[0]
        console.log('exchnageRate:', exchnageRate);
        this.setExchangeRate(exchnageRate.rate)

        const searchMode: string = JSON.parse(HashStorage.getItem('searchCriteria')).searchMode

        let flag = false
        try {
            if (searchResult) {
                searchResult.forEach(sResult => {

                    // if (sResult.CarrierImage) {
                    //   sResult.CarrierDisplayImage = getImagePath(ImageSource.FROM_SERVER, sResult.CarrierImage, ImageRequiredSize.original)
                    // }

                    // if (sResult.ProviderImage) {
                    //   sResult.ProviderDisplayImage = getImagePath(ImageSource.FROM_SERVER, sResult.ProviderImage, ImageRequiredSize.original)
                    // }


                    if (!flag) {
                        flag = true
                        this.MASTER_CURRENCY.rate = exchnageRate.rate
                    }

                    if (exchnageRate.rate > 0) {

                        sResult.ExchangeRate = exchnageRate.rate
                        sResult.CurrencyID = selectedCurrencyID
                        sResult.CurrencyCode = exchnageRate.currencyCode
                        sResult.ActualMaxTotalPrice = sResult.BaseMaxTotalPrice * exchnageRate.rate;
                        sResult.ActualMinTotalPrice = sResult.BaseMinTotalPrice * exchnageRate.rate;
                        if (sResult.BaseTotalPrice) {
                            sResult.ActualTotalPrice = sResult.BaseTotalPrice * exchnageRate.rate;
                            sResult.TotalPrice = this.applyRoundByDecimal((sResult.BaseTotalPrice * this.MASTER_CURRENCY.rate), this.GLOBAL_DECIMAL_PLACES)
                        }
                        sResult.MaxTotalPrice = this.applyRoundByDecimal(sResult.ActualMaxTotalPrice, this.GLOBAL_DECIMAL_PLACES)
                        sResult.MinTotalPrice = this.applyRoundByDecimal(sResult.ActualMinTotalPrice, this.GLOBAL_DECIMAL_PLACES)
                    }
                })

                return searchResult
            } else {
                providersSearchResult.forEach(prResult => {
                    if (exchnageRate.rate > 0) {

                        if (!flag) {
                            flag = true
                            this.MASTER_CURRENCY.rate = exchnageRate.rate
                        }
                        if (searchMode === 'warehouse-lcl') {
                            prResult.WHLatLng = prResult.WHLatitude + ',' + prResult.WHLongitude
                        }
                        prResult.ExchangeRate = exchnageRate.rate
                        prResult.CurrencyID = selectedCurrencyID
                        prResult.CurrencyCode = exchnageRate.currencyCode
                        prResult.ActualMaxTotalPrice = prResult.BaseMaxTotalPrice * exchnageRate.rate;
                        prResult.ActualMinTotalPrice = prResult.BaseMinTotalPrice * exchnageRate.rate;
                        if (prResult.BaseTotalPrice) {
                            prResult.ActualTotalPrice = prResult.BaseTotalPrice * exchnageRate.rate;
                            prResult.TotalPrice = this.applyRoundByDecimal((prResult.BaseTotalPrice * this.MASTER_CURRENCY.rate), this.GLOBAL_DECIMAL_PLACES)
                        }
                        prResult.MaxTotalPrice = this.applyRoundByDecimal(prResult.ActualMaxTotalPrice, this.GLOBAL_DECIMAL_PLACES)
                        prResult.MinTotalPrice = this.applyRoundByDecimal(prResult.ActualMinTotalPrice, this.GLOBAL_DECIMAL_PLACES)
                        prResult.ActualDiscountPrice = prResult.BaseDiscountPrice * exchnageRate.rate;
                        prResult.DiscountPrice = this.applyRoundByDecimal(prResult.ActualDiscountPrice, this.GLOBAL_DECIMAL_PLACES);
                    }

                })

                return providersSearchResult
            }
        } catch (error) {
        }
    }

    getPriceToBase(amount: number, isRoudningTrue): number {
        let newAmount: number = 0
        if (isRoudningTrue) {
            newAmount = amount / this.MASTER_CURRENCY.rate;
            newAmount = this.applyRoundByDecimal(newAmount, this.GLOBAL_DECIMAL_PLACES);
        } else {
            newAmount = amount / this.MASTER_CURRENCY.rate;
        }
        return newAmount
    }

    applyCurrencyRateOnBookingPriceDetails(priceDetail: PriceDetail[]): PriceDetail[] {
        priceDetail.forEach((priceDtl) => {
            priceDtl.CurrencyID = this.MASTER_CURRENCY.toCurrencyID
            priceDtl.CurrencyCode = this.MASTER_CURRENCY.toCurrencyCode
            priceDtl.TotalAmount = this.applyRoundByDecimal((priceDtl.BaseCurrTotalAmount * this.MASTER_CURRENCY.rate), this.GLOBAL_DECIMAL_PLACES)
            priceDtl.IndividualPrice = this.applyRoundByDecimal((priceDtl.BaseCurrIndividualPrice * this.MASTER_CURRENCY.rate), this.GLOBAL_DECIMAL_PLACES)
            priceDtl.ActualTotalAmount = priceDtl.ActualTotalAmount * this.MASTER_CURRENCY.rate
            priceDtl.ActualIndividualPrice = priceDtl.ActualIndividualPrice * this.MASTER_CURRENCY.rate
            priceDtl.ExchangeRate = this.MASTER_CURRENCY.rate
            priceDtl.ActualPrice = priceDtl.ActualPrice * this.MASTER_CURRENCY.rate
            priceDtl.Price = this.applyRoundByDecimal((priceDtl.BaseCurrPrice * this.MASTER_CURRENCY.rate), this.GLOBAL_DECIMAL_PLACES)
        })

        return priceDetail
    }

    applyRoundByDecimal(amount: number, decimalPlaces: number): number {
        let newAmount = Number(parseFloat(amount + '').toFixed(decimalPlaces));
        return newAmount
    }

    getSaveObjectByLatestRates(saveObject: SaveBookingObject, exchnageData: ExchangeRate): SaveBookingObject {
        let exchnageRate: Rate = exchnageData.rates.filter(rate => rate.currencyID === this.getCurrencyID())[0]
        this.setExchangeRate(exchnageRate.rate)
        let newSaveObject: SaveBookingObject = saveObject
        newSaveObject.InsuredGoodsActualPrice = saveObject.InsuredGoodsBaseCurrPrice * this.getExchangeRate()
        newSaveObject.InsuredGoodsPrice = this.applyRoundByDecimal(saveObject.InsuredGoodsBaseCurrPrice * this.getExchangeRate(), this.getGlobalDecimal())
        newSaveObject.BookingPriceDetail.forEach(priceDtl => {
            if (priceDtl.SurchargeType.toLowerCase() !== 'vasv') {
                priceDtl.ActualIndividualPrice = priceDtl.BaseCurrIndividualPrice * this.getExchangeRate()
                priceDtl.IndividualPrice = this.applyRoundByDecimal(priceDtl.ActualIndividualPrice, this.getGlobalDecimal())

                priceDtl.ActualTotalAmount = priceDtl.BaseCurrTotalAmount * this.getExchangeRate()
                priceDtl.TotalAmount = this.applyRoundByDecimal(priceDtl.ActualTotalAmount, this.getGlobalDecimal())
            }
        })


        newSaveObject.BookingSurChargeDetail.forEach(surcharge => {
            surcharge.ActualIndividualPrice = surcharge.BaseCurrIndividualPrice * this.getExchangeRate()
            surcharge.IndividualPrice = this.applyRoundByDecimal(surcharge.ActualIndividualPrice, this.getGlobalDecimal())
            surcharge.ActualTotalAmount = surcharge.BaseCurrTotalAmount * this.getExchangeRate()
            surcharge.TotalAmount = this.applyRoundByDecimal(surcharge.ActualTotalAmount, this.getGlobalDecimal())

        });


        newSaveObject.InsuredGoodsExchangeRate = this.getExchangeRate()

        return newSaveObject
    }

    getNewPrice(basePrice: number, exchangeRate: number) {
        let newRate = basePrice * exchangeRate;
        return newRate
    }

    static GENERATE_TAX_OBJECT(BookingSurChargeDetail, WHJsonData) {
        let taxObj: any = {} as any
        try {
            let taxedTotalAmount: number = 0;
            let taxesBaseTotalAmount: number = 0;
            if (WHJsonData.TaxValue > 0) {
                BookingSurChargeDetail.forEach(e => {
                    taxedTotalAmount += (e.TotalAmount * WHJsonData.TaxValue) / 100
                    taxesBaseTotalAmount += (e.BaseCurrTotalAmount * WHJsonData.TaxValue) / 100
                })
            }
            taxObj = {
                SurchargeType: WHJsonData.TaxType,
                SurchargeID: WHJsonData.TaxID,
                SurchargeCode: WHJsonData.TaxCode,
                SurchargeName: WHJsonData.TaxName,
                Price: WHJsonData.TaxValue,
                TotalAmount: taxedTotalAmount,
                CurrencyID: BookingSurChargeDetail[0].CurrencyID,
                CurrencyCode: BookingSurChargeDetail[0].CurrencyCode,
                BaseCurrPrice: WHJsonData.TaxValue,
                BaseCurrencyID: BookingSurChargeDetail[0].BaseCurrencyID,
                BaseCurrencyCode: BookingSurChargeDetail[0].BaseCurrencyCode,
                BaseCurrTotalAmount: taxesBaseTotalAmount,
                PriceBasis: WHJsonData.TaxBasis,
                ActualPrice: WHJsonData.TaxValue,
                ActualTotalAmount: taxedTotalAmount,
                ExchangeRate: BookingSurChargeDetail[0].ExchangeRate,
                CreatedBy: null
            }
        } catch (error) {
            console.log(error)
        }
        return taxObj
    }
}
