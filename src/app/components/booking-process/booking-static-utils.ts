import { Injectable } from "@angular/core";
import { HashStorage, Tea, loading, createSaveObject } from "../../constants/globalfunctions";
import { LoginDialogComponent } from "../../shared/dialogues/login-dialog/login-dialog.component";
import { ContainerDetail } from "../../interfaces/bookingDetails";
import { SearchCriteria } from "../../interfaces/searchCriteria";


@Injectable()
export class BookingStaticUtils {
    static async saveBookingAction(
        orderSummary,
        userItem,
        _cookieService,
        _dropDownService,
        _bookingService,
        strActiveTabId,
        searchCriteria,
        _toast,
        _currencyControl,
        _router,
        _modalService,
        isIot: boolean,
        isSpecial?,
        specialDesc?
    ): Promise<any> {

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    if (isIot) {
                        let validated = true;
                        const quality = orderSummary.BookingPriceDetail.filter(element => element.SurchargeType === 'VASV' && element.SurchargeCode === 'QLTY');
                        const tracking = orderSummary.BookingPriceDetail.filter(element => element.SurchargeType === 'VASV' && element.SurchargeCode === 'QLTY');

                        if (quality.length || tracking.length) {
                            if (!orderSummary.JsonParametersOfSensor) {
                                validated = false;
                            }
                        } else {
                            validated = true;
                        }
                        if (!validated) {
                            _toast.warning('Please enter a valid invoice value of your goods.', 'Error');
                            reject('Invalid Iot inputs');
                            return false;
                        }
                    }
                    if (HashStorage) {
                        userItem = JSON.parse(Tea.getItem('loginUser'));
                        if (orderSummary.IsInsured) {
                            if (orderSummary.InsuredStatus.toLowerCase() === 'enquiry' && searchCriteria.searchMode != 'warehouse-lcl') {
                                if (orderSummary.BookingID === -1) {
                                    if (!orderSummary.InsuredGoodsPrice || orderSummary.InsuredGoodsPrice < 0) {
                                        _toast.error('Please enter a valid invoice value of your goods.', 'Error');
                                        reject('Please enter a valid invoice value of your goods');
                                        return;
                                    }
                                    if (!orderSummary.BookingEnquiryDetail || orderSummary.BookingEnquiryDetail.length === 0) {
                                        _toast.error('Please select an insurance provider to send an enquiry to, or decline insurance.', 'Error');
                                        reject('Please enter a valid invoice value of your goods');
                                        return;
                                    }
                                } else if (orderSummary.BookingID > -1) {
                                    if (!orderSummary.InsuredGoodsPrice || orderSummary.InsuredGoodsPrice < 0) {
                                        _toast.error('Please enter a valid invoice value of your goods.', 'Error');
                                        reject('Please enter a valid invoice value of your goods');
                                        return;
                                    }
                                    if (!orderSummary.BookingEnquiryDetail || orderSummary.BookingEnquiryDetail.length === 0) {
                                        _toast.error('Please select an insurance provider to send an enquiry to, or decline insurance.', 'Error');
                                        reject('Please enter a valid invoice value of your goods');
                                        return;
                                    }
                                }
                            }
                        }

                        if (strActiveTabId !== 'tab-tracking' && orderSummary.IsInsured && orderSummary.InsuredGoodsPrice < 0) {
                            _toast.error('Invalid goods amount', 'Error');
                            reject('Please enter a valid invoice value of your goods');
                            return;
                        }
                        if (strActiveTabId !== 'tab-tracking' && orderSummary.IsInsured && !orderSummary.InsuredGoodsPrice) {
                            _toast.error('Please provide value of your goods', 'Error');
                            reject('Please enter a valid invoice value of your goods');
                            return;
                        }


                        // if (orderSummary.IsInsured && orderSummary.InsuredStatus === 'Enquiry' && orderSummary.InsuredGoodsPrice > 0 && orderSummary.BookingEnquiryDetail === null) {
                        //   _toast.error('Please select provider', 'Error');
                        //   return;
                        // }

                        // if (!(orderSummary.BookingID || orderSummary.BookingID === -1) && searchCriteria.searchMode === 'warehouse-lcl') {
                        //   this.setTaxData()
                        // }


                        orderSummary.BookingPriceDetail.forEach((e) => {
                            if (e.SurchargeType === 'VASV' && !(e.SurchargeCode === 'INSR' || e.SurchargeCode === 'TRCK' || e.SurchargeCode === 'QLTY')) {
                                let index = orderSummary.BookingPriceDetail.indexOf(e);
                                orderSummary.BookingPriceDetail.splice(index, 1)
                            }
                        });

                        if (userItem && !userItem.IsLogedOut) {
                            loading(true);
                            if (!userItem.IsVerified) {
                                loading(false);
                                _toast.warning('You need to verify your email address before making a booking.', 'Info');
                                reject('Please enter a valid invoice value of your goods');
                                return;
                            }
                            _cookieService.deleteCookies()
                            let saveBookingObj = createSaveObject(userItem, orderSummary, 'Draft', isSpecial, specialDesc);
                            _dropDownService.getExchangeRateList(_currencyControl.getBaseCurrencyID()).subscribe((res: any) => {
                                _currencyControl.setExchangeRateList(res.returnObject)
                                let newSaveObject = _currencyControl.getSaveObjectByLatestRates(saveBookingObj, res.returnObject)
                                saveBookingObj = newSaveObject
                                if (searchCriteria.searchMode !== 'warehouse-lcl') {
                                    _bookingService.saveBooking(newSaveObject).subscribe((res: any) => {
                                        if (res.returnId > 0) {
                                            localStorage.removeItem('searchCriteria');
                                            // localStorage.removeItem('searchResult');
                                            localStorage.removeItem('selectedCarrier');
                                            localStorage.removeItem('providerSearchCriteria');
                                            // localStorage.removeItem('bookingInfo');
                                            HashStorage.removeItem('CURR_MASTER');
                                            _router.navigate(['/user/dashboard']);
                                            // _toast.success('Your booking is saved successfully', 'Success');
                                            _toast.info('Rates may have been updated since the booking was last saved.', 'Info');
                                            loading(false);

                                        } else {
                                            loading(false);
                                            _toast.error('An unexpected error occurred while saving your booking, Please try again later.', 'Failed')
                                        }
                                        // HashStorage.removeItem('selectedDeal');
                                    }, (err) => {
                                        loading(false);
                                        _toast.error('An unexpected error occurred while saving your booking, Please try again later.', 'Failed')
                                    })
                                } else if (searchCriteria.searchMode === 'warehouse-lcl') {
                                    _bookingService.saveWarehouseBooking(newSaveObject).subscribe((res: any) => {
                                        if (res.returnId > 0) {
                                            localStorage.removeItem('searchCriteria');
                                            // localStorage.removeItem('searchResult');
                                            localStorage.removeItem('selectedCarrier');
                                            localStorage.removeItem('providerSearchCriteria');
                                            // localStorage.removeItem('bookingInfo');
                                            HashStorage.removeItem('CURR_MASTER');
                                            _router.navigate(['/user/dashboard']);
                                            // _toast.success('Your booking is saved successfully', 'Success');
                                            _toast.info('Rates may have been updated since the booking was last saved.', 'Info');
                                            loading(false);

                                        } else {
                                            loading(false);
                                            _toast.error('An unexpected error occurred while saving your booking, Please try again later.', 'Failed')
                                        }
                                        // HashStorage.removeItem('selectedDeal');
                                    }, (err) => {
                                        loading(false);
                                        _toast.error('An unexpected error occurred while saving your booking, Please try again later.', 'Failed')
                                    })
                                }
                            })
                        } else {
                            const modalRef = _modalService.open(LoginDialogComponent, { size: 'lg', centered: true, windowClass: 'small-modal' });
                            modalRef.result.then((result) => {
                                if (result) {
                                    _toast.success('Logged in successfully.', 'Success');
                                }
                            });
                        }
                    }
                    resolve('success')
                } catch (error) {
                    reject(error)
                }
            }, 0)
        })
    }

    static generateContainerDetails(searchCriteria: SearchCriteria): ContainerDetail[] {
        let tempCont: ContainerDetail;
        let contDtl: ContainerDetail[] = [];
        searchCriteria.SearchCriteriaContainerDetail.forEach(element => {
            if (searchCriteria.containerLoad === 'FCL' || searchCriteria.containerLoad === 'FTL') {
                tempCont = {
                    BookingContTypeQty: (element.contRequestedCBM) ? element.contRequestedCBM : element.contRequestedQty,
                    BookingPkgTypeCBM: 0,
                    BookingPkgTypeWeight: 0,
                    ContainerSpecID: element.contSpecID,
                    ContainerSpecCode: null,
                    ContainerSpecDesc: null,
                    PackageCBM: 0,
                    PackageWeight: 0,
                    volumetricWeight: 0,
                    IsTrackingRequired: false,
                    IsQualityMonitoringRequired: false,
                    JsonContainerDetail: JSON.stringify({
                        IsTrackingApplicable: element.IsTrackingApplicable,
                        IsQualityApplicable: element.IsQualityApplicable
                    })
                };
            } else if (searchCriteria.containerLoad === 'LCL') {
                let higherWeight = element.contRequestedCBM > element.volumetricWeight ? element.contRequestedCBM : element.volumetricWeight;
                tempCont = {
                    BookingContTypeQty: element.contRequestedQty,
                    BookingPkgTypeCBM: element.contRequestedCBM,
                    BookingPkgTypeWeight: higherWeight,
                    ContainerSpecID: element.contSpecID,
                    ContainerSpecCode: null,
                    ContainerSpecDesc: null,
                    PackageCBM: element.contRequestedCBM,
                    PackageWeight: higherWeight,
                    volumetricWeight: element.volumetricWeight,
                    IsQualityMonitoringRequired: false,
                    IsTrackingRequired: false,
                    JsonContainerDetail: JSON.stringify({
                        IsTrackingApplicable: element.IsTrackingApplicable,
                        IsQualityApplicable: element.IsQualityApplicable
                    })
                };
            }
            contDtl.push(tempCont);
        });
        return contDtl;
    }
}