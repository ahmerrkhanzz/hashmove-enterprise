import { Component, OnInit, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { BookingService } from '../booking.service';
import { CreditCard, PaymentMode } from '../../../interfaces/payment.interface';
import { Observable } from 'rxjs';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SaveBookingObject, BookingDetails, BookingPayment } from '../../../interfaces/bookingDetails';
import { createSaveObject, HashStorage, loading, Tea } from '../../../constants/globalfunctions';
import { DataService } from '../../../services/commonservice/data.service';
import { DropDownService } from '../../../services/dropdownservice/dropdown.service';
import { Router } from '@angular/router';
import { ExchangeRate, Rate } from '../../../interfaces/currencyDetails';
import * as moment from 'moment';
import { SearchCriteria } from '../../../interfaces/searchCriteria';
import { WareDocumentData } from '../../../interfaces/warehouse.interface';
import { baseExternalAssets } from '../../../constants/base.url';
import { CurrencyControl } from '../../../shared/currency/currency.injectable';

@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.scss'],
    encapsulation: ViewEncapsulation.None

})
export class PaymentComponent implements OnInit {

    @Output() tabChange = new EventEmitter<string>();
    public searchCriteria: any
    public paymentModes: PaymentMode[] = []
    public creditCards: CreditCard[] = []
    public monthList: Array<number> = Array(12).fill(0).map((x, i) => i + 1)
    public yearList: Array<number> = Array(50).fill(0).map((x, i) => i + new Date().getFullYear())

    public saveBookingObj: SaveBookingObject
    public orderSummary: any

    public selectedCard: string = 'gen-card.png'
    public selectedCardKey: string = ''
    public selectedCardCode: string = 'ANY'
    public selectedCardID: number = -1

    public creditFormValid: PaymentCardObject = {
        ccMonth: false,
        ccNumber: false,
        ccUserName: false,
        ccVerCode: false,
        ccYear: false,
    }

    public paymentObject: BookingPayment

    public creditForm: any
    _albums: any[];

    constructor(
        private _bookingService: BookingService,
        private _toastr: ToastrService,
        private _dataService: DataService,
        private _dropDownService: DropDownService,
        private _router: Router,
        private _currencyControl: CurrencyControl
    ) { }

    iban_no

    ngOnInit() {
        this.searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))
        Observable.forkJoin([
            this._bookingService.getPaymentMode(),
            this._bookingService.getCreditCardData()
        ]).subscribe((state: any) => {
            const paymentModeResp = state[0]
            const creditCardResp = state[1]
            this.paymentModes = paymentModeResp
            this.creditCards = creditCardResp
        })

        this.orderSummary = this._dataService.getBookingData()
        this.creditForm = new FormGroup({
            ccNumber: new FormControl("", [Validators.required, Validators.minLength(16), Validators.maxLength(19)]),
            ccVerCode: new FormControl("", [Validators.required, Validators.maxLength(3)]),
            ccMonth: new FormControl(0, [Validators.required, Validators.maxLength(2)]),
            ccYear: new FormControl(0, [Validators.required, Validators.maxLength(4)]),
            ccUserName: new FormControl("", [Validators.required, Validators.maxLength(70)]),
        })
        if (this.orderSummary.searchMode === 'warehouse-lcl' && this.orderSummary.BookingID !== -1) {
            const { ProviderName, ProviderImage, WHAddress } = this.orderSummary
            const { StoreFrom, StoreUntill, SQFT } = this.searchCriteria
            let WHDetails = JSON.parse(this.orderSummary.BookingJsonDetail)
            let WHMedia = JSON.parse(this.orderSummary.WHMedia)
            this._albums = []
            const docsArray: Array<WareDocumentData> = WHMedia
            docsArray.forEach(doc => {
                const album = {
                    src: baseExternalAssets + '/' + doc.DocumentFile,
                    caption: '&nbsp;',
                    thumb: baseExternalAssets + '/' + doc.DocumentFile
                };
                this._albums.push(album)
                WHMedia = this._albums;
            })
            let warehouseThankyouData: any = {
                bookedFrom: StoreFrom,
                bookedUntil: StoreUntill,
                space: SQFT,
                ProviderName: ProviderName,
                ProviderImage: ProviderImage,
                IsBondedWarehouse: false,
                IsTempratureControlled: true,
                IsTransportAvailable: false,
                WHParsedTiming: WHDetails.WHTimings,
                WHParsedMedia: WHMedia,
                WHAddress: WHAddress,
                WHAreaInSQFT: WHDetails.WHMaxSQFT,
                WHName : WHDetails.WHName
            };
            HashStorage.setItem('warehouseSearch', JSON.stringify(warehouseThankyouData))
        }
    }

    ccChange($val) {
        const self = this;
        if ($val) {
            let chIbn = $val.split(' ').join('');
            if (chIbn.length > 0) {
                chIbn = chIbn.match(new RegExp('.{1,4}', 'g')).join(' ');
            }
            this.iban_no = chIbn;
        } else {
            this.selectedCard = 'gen-card.png'
            this.selectedCardKey = ''
            this.selectedCardCode = 'ANY'
            this.selectedCardID = -1
        }
    }


    numberValid(evt) {
        let charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode != 37 && charCode != 39 && charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }

    makePayment({ value }) {

        const creditObject: PaymentCardObject = value
        const { ccMonth, ccNumber, ccUserName, ccVerCode, ccYear } = creditObject
        let isAllFieldsValid = true

        if (!this.creditFormValid.ccMonth) {
            // this._toastr.warning('Month is not Filled', 'Error')
            this.creditForm.controls['ccMonth'].markAsDirty();
            isAllFieldsValid = false
        }
        if (!this.creditFormValid.ccNumber) {
            // this._toastr.warning('Number is not Filled', 'Error')
            this.creditForm.controls['ccNumber'].markAsDirty();
            isAllFieldsValid = false
        }
        if (!this.creditFormValid.ccUserName) {
            // this._toastr.warning('UserName is not Filled', 'Error')
            this.creditForm.controls['ccUserName'].markAsDirty();
            isAllFieldsValid = false
        }
        if (!this.creditFormValid.ccVerCode) {
            // this._toastr.warning('VerCode is not Filled', 'Error')
            this.creditForm.controls['ccVerCode'].markAsDirty();
            isAllFieldsValid = false
        }
        if (!this.creditFormValid.ccYear) {
            // this._toastr.warning('Year is not Filled', 'Error')
            this.creditForm.controls['ccYear'].markAsDirty();
            isAllFieldsValid = false
        }

        if (!isAllFieldsValid) {
            return;
        }

        const userItem = JSON.parse(Tea.getItem('loginUser'));
        this.saveBookingObj = createSaveObject(userItem, this.orderSummary, 'Confirmed')

        const ccArray = ccNumber.split(' ')
        const ccArrayLenght = ccArray.length
        const lastForCCNumbers = ccArray[ccArrayLenght - 1]
        this._dropDownService.getExchangeRateList(this._currencyControl.getBaseCurrencyID()).subscribe((res: any) => {

            const paymentCurrencyID = 102 //fixed as for now: Dollar
            let exchangeData: ExchangeRate = res.returnObject
            this._currencyControl.setExchangeRateList(exchangeData)

            const dollarRates: Rate = exchangeData.rates.filter(rate => rate.currencyID === paymentCurrencyID)[0]

            const paymentActualAmount = this._currencyControl.getNewPrice(this.orderSummary.BaseCurrTotalAmount, dollarRates.rate)
            const paymentAmount = this._currencyControl.applyRoundByDecimal(paymentActualAmount, 2)
            const payment: BookingPayment = {
                PaymentID: 0,
                PaymentNum: null,
                BookingID: (this.orderSummary.BookingID) ? this.orderSummary.BookingID : -1,
                PaymentModeID: 1,
                CreditCardTypeID: this.selectedCardID,
                PaymentGatewayID: 1,
                CreditCardNumber: ccNumber,
                CardHolderName: ccUserName,
                ExpiryDate: ccMonth + '/' + ccYear,
                CVV: ccVerCode,
                CCLast4Digit: lastForCCNumbers,
                PaymentDateUtc: null,
                PaymentDateLcl: moment(Date.now()).format(),
                GatewayResponse: null,

                BookingCurrencyID: this.orderSummary.CurrencyID,
                BookingAmount: this.orderSummary.BookingTotalAmount,

                BaseCurrencyID: this.orderSummary.BaseCurrencyID,
                BaseBookingAmount: this.orderSummary.BaseCurrTotalAmount,
                BaseExchangeRate: this.orderSummary.ExchangeRate,
                BaseActualAmount: this.orderSummary.BaseCurrTotalAmount,

                PaymentCurrencyID: paymentCurrencyID,
                PaymentAmount: paymentAmount,
                PaymentExchangeRate: dollarRates.rate,
                PaymentActualAmount: paymentActualAmount,
                PaymentDesc: null,
                UserID: userItem.UserID,
                OtherReference1: null,
                OtherReference2: null,
                IsDelete: null,
                IsActive: null,
                CreatedBy: null,
                CreatedDateTime: null,
                ModifiedBy: null,
                ModifiedDateTime: null
            }

            let newSaveObject = this._currencyControl.getSaveObjectByLatestRates(this.saveBookingObj, res.returnObject)

            this.saveBookingObj = newSaveObject
            this.saveBookingObj.Payment = payment
            if (this.searchCriteria.searchMode !== 'warehouse-lcl') {
                this._bookingService.saveBooking(this.saveBookingObj).subscribe((res: any) => {
                    if (res.returnId > 0) {
                        // this._toast.success('Your booking is confirmed', 'Success');
                        this._toastr.info('Rates may have been updated since the booking was last saved.', 'Booking Successful');
                        HashStorage.removeItem('selectedDeal');
                        HashStorage.removeItem('CURR_MASTER')
                        HashStorage.setItem('bookinRef', res.returnText);
                        this._router.navigate(['/thankyou-booking'])
                        // this.messageEvent.emit(this.message);
                        loading(false);
                    } else {
                        loading(false);
                        this._toastr.error(res.returnText, 'Failed')
                    }
                }, (err) => {
                    loading(false);
                    this._toastr.error('An unexpected error occurred while saving your booking, Please try again later.', 'Failed');
                })
            } else if (this.searchCriteria.searchMode === 'warehouse-lcl') {
                this._bookingService.saveWarehouseBooking(this.saveBookingObj).subscribe((res: any) => {
                    if (res.returnId > 0) {
                        // this._toast.success('Your booking is confirmed', 'Success');
                        this._toastr.info('Rates may have been updated since the booking was last saved.', 'Booking Successful');
                        HashStorage.removeItem('selectedDeal');
                        HashStorage.removeItem('CURR_MASTER')
                        HashStorage.setItem('bookinRef', res.returnText);
                        this._router.navigate(['/thankyou-booking'])
                        // this.messageEvent.emit(this.message);
                        loading(false);
                    } else {
                        loading(false);
                        this._toastr.error(res.returnText, 'Failed')
                    }
                }, (err) => {
                    loading(false);
                    this._toastr.error('An unexpected error occurred while saving your booking, Please try again later.', 'Failed');
                })
            }
        })

    }


    inputFocusIn($from) {
        this.creditFormValid[$from] = true
    }

    inputFocusOut($from) {
        const formValue = this.creditForm.get($from).value
        if ($from === 'ccMonth') {
            if (formValue > 0) {
                this.creditFormValid.ccMonth = true
            } else {
                this.creditFormValid.ccMonth = false
            }
        }
        if ($from === 'ccYear') {
            if (formValue > 0) {
                this.creditFormValid.ccYear = true
            } else {
                this.creditFormValid.ccYear = false
            }
        }
        if ($from === 'ccNumber') {
            if (formValue) {
                let withoutSpace: string = formValue.replace(/ /g, '')
                if (withoutSpace.length && (withoutSpace.length >= 16 && withoutSpace.length <= 19)) {
                    this.creditFormValid.ccNumber = true
                } else {
                    this.creditFormValid.ccNumber = false
                }
            } else {
                this.creditFormValid.ccNumber = false
            }
        }
        if ($from === 'ccUserName') {

            if (formValue) {
                this.creditFormValid.ccUserName = true
            } else {
                this.creditFormValid.ccUserName = false
            }
        }
        if ($from === 'ccVerCode') {
            if (formValue.length === 3) {
                this.creditFormValid.ccVerCode = true
            } else {
                this.creditFormValid.ccVerCode = false
            }
        }
    }

    onMonthChangeEvent({ target }) {
        if (target.value) {
            const selectedMonth = target.value
            const currentMonth = new Date().getMonth() + 1
            if (selectedMonth < currentMonth) {
                const newYears = new Date().getFullYear() + 1
                this.yearList = Array(50).fill(0).map((x, i) => i + newYears)
            } else {
                this.yearList = Array(50).fill(0).map((x, i) => i + new Date().getFullYear())
            }
        }
    }
    // tab-optional - services
    backToReview() {
        if (this.searchCriteria.searchMode === 'sea-lcl' || this.searchCriteria.searchMode === 'warehouse-lcl') {
            this.tabChange.emit('tab-optional-services')
        } else {
            this.tabChange.emit('tab-departure-date')
        }
    }

    textValidation(event) {
        try {
            const pattern = /[a-zA-Z-][a-zA-Z -]*$/;
            const inputChar = String.fromCharCode(event.charCode);
            if (!pattern.test(inputChar)) {

                if (event.charCode == 0) {
                    return true;
                }

                if (event.target.value) {
                    const end = event.target.selectionEnd;
                    if ((event.which == 32 || event.keyCode == 32) && (event.target.value[end - 1] == " " || event.target.value[end] == " ")) {
                        event.preventDefault();
                        return false;
                    }
                }
                else {
                    event.preventDefault();
                    return false;
                }
            } else {
                return true;
            }
        } catch (error) {
            return false
        }

    }


    onCardChange = ($text: Observable<string>) =>
        $text
            .debounceTime(0)
            .map(
                input => {
                    if (input.length > 0) {
                        let cardSelected: boolean = false
                        this.creditCards.forEach(credit => {
                            if (credit.startWithKey === input.substring(0, 1)) {
                                this.selectedCard = credit.ccImage
                                this.selectedCardKey = credit.startWithKey
                                this.selectedCardCode = credit.creditCardTypeCode
                                this.selectedCardID = credit.creditCardTypeID
                                cardSelected = true
                            }
                        })

                        if (!cardSelected) {
                            this.selectedCard = 'gen-card.png'
                            this.selectedCardKey = input.substring(0, 1)
                            this.selectedCardCode = 'ANY'
                            this.selectedCardID = -1
                        }
                    }
                }
            );
}


export interface PaymentCardObject {
    ccNumber: any;
    ccVerCode: any;
    ccMonth: any;
    ccYear: any;
    ccUserName: any;
}
