import { AbstractControl, ValidatorFn, FormControl } from '@angular/forms';
import { BookingDetails, PriceDetail, SaveBookingObject } from '../interfaces/bookingDetails';
import { CurrencyDetails, ExchangeRate, Rate, MasterCurrency } from '../interfaces/currencyDetails';
import { SearchResult, ProvidersSearchResult } from '../interfaces/searchResult';
import { Base64 } from 'js-base64';
import { Injectable } from '@angular/core';
import { baseExternalAssets } from './base.url';
import { SearchCriteria, SearchCriteriaContainerDetail } from '../interfaces/searchCriteria';

import * as moment from 'moment'

declare function escape(string: string): string;
declare function unescape(string: string): string;

export function isJSON(str) {

  if (typeof (str) !== 'string') {
    return false;
  }
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}
// date formater by simple Date
export const StringFormat = (value: Date): string => {
  if (value !== null) {
    let stringDate = '';
    const d = value;
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
    ];
    stringDate += d.getDate() + ' '
    stringDate += MONTH_NAMES[d.getMonth()] + ', ';
    stringDate += d.getFullYear();
    return stringDate;

  } else {
    return '';
  }
}

export async function loading(display) {
  setTimeout(() => {
    let loader = document.getElementsByClassName("overlay")[0] as HTMLElement;
    if (display) {
      loader.classList.add('overlay-bg');
      loader.style.display = "block";
    }
    else if (!display) {
      loader.classList.remove('overlay-bg');
      loader.style.display = "none";
    }
  }, 0);
}

//THIS IS GLOBAL FUNCTION USE FOR SORTING OF ANY OBJECT DATA
export const compareValues = (key: string, order = 'asc') => {
  return function (a: any, b: any) {
    if (!a.hasOwnProperty(key) ||
      !b.hasOwnProperty(key)) {
      return 0;
    }

    const varA = (typeof a[key] === 'string') ?
      a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string') ?
      b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order == 'desc') ?
        (comparison * -1) : comparison
    );
  };
}
export const removeDuplicates = (myArr, prop) => {
  return myArr.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
}
export const EMAIL_REGEX: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
export const URL_REGEX: RegExp = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
//  /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/
export function CustomValidator(control: AbstractControl) {
  if (this.corporateUser) {
    let companyRegexp: RegExp = /^(?=.*?[a-zA-Z])[^.]+$/;
    if (!control.value) {
      return {
        required: true
      }
    }

    else if (control.value.length < 3 && control.value) {
      if (!companyRegexp.test(control.value)) {
        return {
          pattern: true
        }
      }
      else {
        return {
          minlength: true
        }
      }
    }
    else if (control.value.length > 50 && control.value) {
      if (!companyRegexp.test(control.value)) {
        return {
          pattern: true
        }
      }
      else {
        return {
          maxlength: true
        }
      }

    }
    else {
      return false
    }

  }

};

export const ValidateEmail = (email: string): boolean => {

  let arr = email.split('@')
  let first = arr[0]
  let second = arr[1].split('.')[0]

  if (first.length > 64) {
    return false
  }


  if (second.length > 255) {
    return false
  }

  return true
}


let LocalHashStorage: Storage;
try {
  LocalHashStorage = localStorage;
} catch (e) {
  // Access denied :-(
}
export const HashStorage = LocalHashStorage

export const kFormatter = (labelValue: number) => {
  const currControl = new CurrencyControl()
  let strVal = ' '
  if (Number(labelValue) > 1000) {
    strVal = Math.abs(Number(labelValue)) >= 1.0e+9 ? currControl.applyRoundByDecimal(((Number(labelValue)) / 1.0e+9), 0).toLocaleString() + "B" : currControl.applyRoundByDecimal(Number(labelValue), 0) >= 1.0e+6
      ? ((currControl.applyRoundByDecimal(Number(labelValue), 0) / 1.0e+6)).toLocaleString() + "M" : currControl.applyRoundByDecimal(Number(labelValue), 0) >= 1.0e+3
        ? ((currControl.applyRoundByDecimal(Number(labelValue), 0) / 1.0e+3)).toLocaleString() + "K" : (currControl.applyRoundByDecimal(Number(labelValue), 0)).toLocaleString();
  } else {
    strVal = Number(labelValue).toLocaleString()
  }
  return strVal
}


export const feet2String = (num) => {

  let decVal = '' + num + ''


  if (decVal === '') {
    return "0'"
  }

  let arr = decVal.split('.')

  if (arr.length > 1) {
    let feet = Math.floor(num)
    let inch = Math.round((num - feet) * 12)

    if (inch >= 12) {
      return ((feet + 1) + `'`)
    }
    return (Math.floor(num) + `'` + inch + `"`);
  } else {
    return (num + `'`);
  }
}


declare function unescape(s: string): string;
declare function escape(s: string): string;

let tea_password = 'hashmove-07'
export const encrypt = (plaintext, password) => {
  var v = new Array(2), k = new Array(4), s = "", i;

  plaintext = escape(plaintext);  // use escape() so only have single-byte chars to encode

  // build key directly from 1st 16 chars of password
  for (let i = 0; i < 4; i++) k[i] = Str4ToLong(password.slice(i * 4, (i + 1) * 4));

  for (i = 0; i < plaintext.length; i += 8) {  // encode plaintext into s in 64-bit (8 char) blocks
    v[0] = Str4ToLong(plaintext.slice(i, i + 4));  // ... note this is 'electronic codebook' mode
    v[1] = Str4ToLong(plaintext.slice(i + 4, i + 8));
    code(v, k);
    s += LongToStr4(v[0]) + LongToStr4(v[1]);
  }

  return escCtrlCh(s);
  // note: if plaintext or password are passed as string objects, rather than strings, this
  // function will throw an 'Object doesn't support this property or method' error
}
// use (16 chars of) 'password' to decrypt 'ciphertext' with xTEA
export const decrypt = (ciphertext, password) => {
  var v = new Array(2), k = new Array(4), s = "", i;

  for (let i = 0; i < 4; i++) k[i] = Str4ToLong(password.slice(i * 4, (i + 1) * 4));

  ciphertext = unescCtrlCh(ciphertext);
  for (i = 0; i < ciphertext.length; i += 8) {  // decode ciphertext into s in 64-bit (8 char) blocks
    v[0] = Str4ToLong(ciphertext.slice(i, i + 4));
    v[1] = Str4ToLong(ciphertext.slice(i + 4, i + 8));
    decode(v, k);
    s += LongToStr4(v[0]) + LongToStr4(v[1]);
  }

  // strip trailing null chars resulting from filling 4-char blocks:
  s = s.replace(/\0+$/, '');

  return unescape(s);
}

function code(v, k) {
  // Extended TEA: this is the 1997 revised version of Needham & Wheeler's algorithm
  // params: v[2] 64-bit value block; k[4] 128-bit key
  var y = v[0], z = v[1];
  var delta = 0x9E3779B9, limit = delta * 32, sum = 0;

  while (sum != limit) {
    y += (z << 4 ^ z >>> 5) + z ^ sum + k[sum & 3];
    sum += delta;
    z += (y << 4 ^ y >>> 5) + y ^ sum + k[sum >>> 11 & 3];
    // note: unsigned right-shift '>>>' is used in place of original '>>', due to lack
    // of 'unsigned' type declaration in JavaScript (thanks to Karsten Kraus for this)
  }
  v[0] = y; v[1] = z;
}
function decode(v, k) {
  var y = v[0], z = v[1];
  var delta = 0x9E3779B9, sum = delta * 32;

  while (sum != 0) {
    z -= (y << 4 ^ y >>> 5) + y ^ sum + k[sum >>> 11 & 3];
    sum -= delta;
    y -= (z << 4 ^ z >>> 5) + z ^ sum + k[sum & 3];
  }
  v[0] = y; v[1] = z;
}
// supporting functions
function Str4ToLong(s) {  // convert 4 chars of s to a numeric =>long
  var v = 0;
  for (var i = 0; i < 4; i++) v |= s.charCodeAt(i) << i * 8;
  return isNaN(v) ? 0 : v;
}
function LongToStr4(v) {  // convert a numeric long to 4 char =>string
  var s = String.fromCharCode(v & 0xFF, v >> 8 & 0xFF, v >> 16 & 0xFF, v >> 24 & 0xFF);
  return s;
}
function escCtrlCh(str) {  // escape control chars which might cause problems with encrypted =>texts
  return str.replace(/[\0\t\n\v\f\r\xa0'"!]/g, function (c) { return '!' + c.charCodeAt(0) + '!'; });
}
function unescCtrlCh(str) {  // unescape potentially problematic nulls and control =>characters
  return str.replace(/!\d\d?\d?!/g, function (c) { return String.fromCharCode(c.slice(1, -1)); });
}


export class Tea {
  static getItem(itemName: string): string | null {
    if (HashStorage.getItem(itemName)) {
      let item = HashStorage.getItem(itemName)
      // return decrypt(item, tea_password)
      return Base64.decode(item)
    } else {
      return null
    }

  }

  static setItem(key: string, value: string): void {
    // let encryptedData = encrypt(value, tea_password)
    let encryptedData = Base64.encode(value)
    HashStorage.setItem(key, encryptedData)
  }
}
export const createSaveObject = (userItem, $orderSummary: any, bookingStatus: string, $isSpecial?: boolean, $specialDesc?: string): any => {
  let orderSummary: any = cloneObject($orderSummary)
  let ContDetails = []
  try {
    ContDetails = generateContDetails(orderSummary, FillingMode.OrderSummary_To_BookingDetails)
  } catch (error) {
    ContDetails = []
  }
  const userLocation = {
    country: localStorage.getItem('country')
  }

  let priceList: Array<PriceDetail> = cloneObject(orderSummary.BookingPriceDetail)
  try {
    if (orderSummary.ImpExpCharges2Remove && orderSummary.ImpExpCharges2Remove.length > 0) {
      const { ImpExpCharges2Remove } = orderSummary
      ImpExpCharges2Remove.forEach($charge => {
        if ($charge.state) {
          // priceList = priceList.filter(element => !(element.SurchargeID === $charge.chargeID && element.Imp_Exp.toLowerCase() === $charge.chargeType));
          const newList = priceList.filter(element => !(element.SurchargeCode === $charge.chargeID && element.Imp_Exp.toLowerCase() === $charge.chargeType));
          priceList = newList
        }
      });
    }
  } catch (error) {
    console.log(error);
  }

  orderSummary.BookingPriceDetail = cloneObject(priceList)
  console.log(priceList);
  console.log(orderSummary);
  if (orderSummary.isExcludeExp || orderSummary.isExcludeImp) {
    if (orderSummary.isExcludeExp && !orderSummary.isExcludeImp) {
      orderSummary.BookingPriceDetail = orderSummary.BookingPriceDetail.filter((element: any) => element.Imp_Exp !== 'EXPORT');
    }
    if (orderSummary.isExcludeImp && !orderSummary.isExcludeExp) {
      orderSummary.BookingPriceDetail = orderSummary.BookingPriceDetail.filter((element: any) => element.Imp_Exp !== 'IMPORT');
    }
    if (orderSummary.isExcludeExp && orderSummary.isExcludeImp) {
      orderSummary.BookingPriceDetail = orderSummary.BookingPriceDetail.filter((element: any) => element.Imp_Exp !== 'IMPORT' && element.Imp_Exp !== 'EXPORT');
    }
  }
  // removed unchecked additional options
  priceList.forEach((e) => {
    if (e.SurchargeType === 'VASV' && !(e.SurchargeCode === 'INSR' || e.SurchargeCode === 'TRCK' || e.SurchargeCode === 'QLTY')) {
      const idx = priceList.indexOf(e);
      priceList.splice(idx, 1)
    }
  });

  let parsedJsonParametersOfSensor: any;
  if (orderSummary.JsonParametersOfSensor) {
    parsedJsonParametersOfSensor = JSON.parse(orderSummary.JsonParametersOfSensor)
    for (let i = 0; i <= parsedJsonParametersOfSensor.length - 1; i++) {
      parsedJsonParametersOfSensor[i].SerialID = i
    }
  }

  let searchCriteria: any = JSON.parse(HashStorage.getItem("searchCriteria"));
  const { pickupPortType, deliveryPortType } = searchCriteria
  const movementType: string = getMovementType(pickupPortType, deliveryPortType)
  let prepareSaveBookingObj = {}
  if (searchCriteria.searchMode !== 'warehouse-lcl') {
    let billingDataWhole: any = priceList.filter((e) => e.TransMode === 'Write');
    prepareSaveBookingObj = {
      BookingID: orderSummary.BookingID,
      UserID: userItem.UserID,
      BookingSource: "HashMove",
      BookingStatus: bookingStatus,  //Confirmed or Draft
      MovementType: movementType,
      ShippingCatID: searchCriteria.shippingCatID,
      ShippingSubCatID: searchCriteria.shippingSubCatID,
      ShippingModeID: searchCriteria.shippingModeID,
      JsonParametersOfSensor: (parsedJsonParametersOfSensor) ? JSON.stringify(parsedJsonParametersOfSensor) : "",
      JsonSearchCriteria: (orderSummary.BookingID === -1 ? JSON.stringify(searchCriteria) : null),
      CarrierID: orderSummary.CarrierID || null,
      CarrierImage: orderSummary.CarrierImage || '',
      CarrierName: orderSummary.CarrierName || '',
      ProviderID: orderSummary.ProviderID,
      ProviderImage: orderSummary.ProviderImage,
      ProviderName: orderSummary.ProviderName,
      PolID: orderSummary.PolID,
      PodID: orderSummary.PodID,
      PolName: searchCriteria.pickupPortCode,
      PodName: searchCriteria.deliveryPortCode,
      EtdUtc: (orderSummary.EtdUtc) ? orderSummary.EtdUtc : ((searchCriteria.searchMode === 'truck-ftl' || searchCriteria.searchMode === 'sea-lcl') ? searchCriteria.pickupDate : null),
      EtdLcl: (orderSummary.EtdLcl) ? orderSummary.EtdLcl : ((searchCriteria.searchMode === 'truck-ftl' || searchCriteria.searchMode === 'sea-lcl') ? searchCriteria.pickupDate : null),
      EtaUtc: (orderSummary.EtaUtc) ? orderSummary.EtaUtc : ((searchCriteria.searchMode === 'truck-ftl' || searchCriteria.searchMode === 'sea-lcl') ? searchCriteria.pickupDate : null),
      EtaLcl: (orderSummary.EtaLcl) ? orderSummary.EtaLcl : ((searchCriteria.searchMode === 'truck-ftl' || searchCriteria.searchMode === 'sea-lcl') ? searchCriteria.pickupDate : null),
      PortCutOffUtc: (orderSummary.PortCutOffUtc) ? orderSummary.PortCutOffUtc : ((searchCriteria.searchMode === 'truck-ftl' || searchCriteria.searchMode === 'sea-lcl') ? searchCriteria.pickupDate : null),
      PortCutOffLcl: (orderSummary.PortCutOffLcl) ? orderSummary.PortCutOffLcl : ((searchCriteria.searchMode === 'truck-ftl' || searchCriteria.searchMode === 'sea-lcl') ? searchCriteria.pickupDate : null),
      TransitTime: orderSummary.TransitTime || null,
      ContainerLoad: searchCriteria.containerLoad,
      FreeTimeAtPort: orderSummary.FreeTimeAtPort || 0,
      IsInsured: orderSummary.IsInsured,
      IsInsuranceProvider: orderSummary.IsInsuranceProvider,
      InsuredGoodsPrice: orderSummary.InsuredGoodsPrice,
      InsuredGoodsCurrencyID: orderSummary.InsuredGoodsCurrencyID,
      InsuredGoodsCurrencyCode: orderSummary.InsuredGoodsCurrencyCode,
      IsInsuredGoodsBrandNew: (!orderSummary.IsInsuredGoodsBrandNew) ? false : orderSummary.IsInsuredGoodsBrandNew,
      InsuredGoodsProviderID: orderSummary.InsuredGoodsProviderID,
      InsuredStatus: orderSummary.InsuredStatus,
      IsAnyRestriction: (!orderSummary.IsAnyRestriction) ? false : orderSummary.IsAnyRestriction,
      PolModeOfTrans: orderSummary.PolModeOfTrans,
      PodModeOfTrans: orderSummary.PodModeOfTrans,
      VesselCode: orderSummary.VesselCode || '',
      VesselName: orderSummary.VesselName || '',
      VoyageRefNum: orderSummary.VoyageRefNum || '',
      CreatedBy: userItem.LoginID,
      ModifiedBy: "",
      IDlist: orderSummary.IDlist,
      IDListDetail: orderSummary.IDListDetail,
      InsuredGoodsBaseCurrPrice: orderSummary.InsuredGoodsBaseCurrPrice,
      InsuredGoodsBaseCurrencyID: orderSummary.InsuredGoodsBaseCurrencyID,
      InsuredGoodsBaseCurrencyCode: orderSummary.InsuredGoodsBaseCurrencyCode,
      InsuredGoodsActualPrice: orderSummary.InsuredGoodsActualPrice,
      InsuredGoodsExchangeRate: (!orderSummary.InsuredGoodsExchangeRate) ? 0 : orderSummary.InsuredGoodsExchangeRate,
      BookingPriceDetail: priceList,
      BookingContainerTypeDetail: ContDetails,
      BookingSurChargeDetail: billingDataWhole,
      BookingEnquiryDetail: orderSummary.BookingEnquiryDetail || [],
      Payment: null,
      JsonBookingLocation: JSON.stringify(userLocation),
      BookingAcknowledgment: orderSummary.BookingAcknowledgment,
      BookingDesc: orderSummary.BookingDesc,
      IncoID: orderSummary.IncoID,
      isExcludeImp: orderSummary.isExcludeImp,
      isExcludeExp: orderSummary.isExcludeExp,
      IsSpecialRequest: ($isSpecial) ? $isSpecial : false,
      SpecialRequestDesc: ($specialDesc) ? $specialDesc : '',
      IsNvocc: (orderSummary.IsNvocc) ? orderSummary.IsNvocc : null,
      chargeableWeight: (searchCriteria.chargeableWeight) ? searchCriteria.chargeableWeight : null,
      pickupDate: (searchCriteria.pickupDate) ? searchCriteria.pickupDate : null,
      pickupDateTo: (searchCriteria.pickupDateTo) ? searchCriteria.pickupDateTo : null
    }
  } else if (searchCriteria.searchMode === 'warehouse-lcl') {
    let insuranceArr = priceList.filter(e => e.SurchargeCode === 'INSR')
    let TaxArr = priceList.filter(e => e.SurchargeCode === 'TAX')
    let QalityArr = priceList.filter(e => e.SurchargeCode === 'QLTY')
    priceList.forEach(e => {
      e.PriceBasis = e.SurchargeBasis
    })
    let billingDataWhole = []
    if (orderSummary.BookingID === -1) {
      billingDataWhole = orderSummary.BookingSurChargeDetail.concat(insuranceArr, TaxArr, QalityArr);
    } else {
      billingDataWhole = priceList;
    }

    prepareSaveBookingObj = {
      BookingID: orderSummary.BookingID,
      HashMoveBookingNum: null,
      HashMoveTmpBookingNum: null,
      HashMoveBookingDate: null,
      UserID: userItem.UserID,
      BookingSource: "HashMove",
      BookingStatus: bookingStatus,
      ShippingModeID: searchCriteria.ShippingModeID,
      ShippingCatID: searchCriteria.ShippingCatID,
      ShippingSubCatID: searchCriteria.ShippingSubCatID,
      ProviderID: orderSummary.ProviderID,
      ProviderName: orderSummary.ProviderName,
      ProviderImage: orderSummary.ProviderImage,
      WHID: orderSummary.WHID,
      StoredFromUtc: orderSummary.StoredFromUtc,
      StoredFromLcl: orderSummary.StoredFromLcl,
      StoredUntilUtc: orderSummary.StoredUntilUtc,
      StoredUntilLcl: orderSummary.StoredUntilLcl,
      IsInsured: orderSummary.IsInsured,
      JsonParametersOfSensor: (parsedJsonParametersOfSensor) ? JSON.stringify(parsedJsonParametersOfSensor) : "",
      InsuredGoodsPrice: orderSummary.InsuredGoodsPrice,
      InsuredGoodsCurrencyID: orderSummary.InsuredGoodsCurrencyID,
      IsInsuredGoodsBrandNew: orderSummary.IsInsuredGoodsBrandNew,
      InsuredGoodsProviderID: orderSummary.InsuredGoodsProviderID,
      InsuredStatus: orderSummary.InsuredStatus,
      IsInsuranceProvider: orderSummary.IsInsuranceProvider,
      InsuredGoodsBaseCurrencyID: orderSummary.InsuredGoodsBaseCurrencyID,
      InsuredGoodsBaseCurrPrice: orderSummary.InsuredGoodsBaseCurrPrice,
      InsuredGoodsActualPrice: orderSummary.InsuredGoodsActualPrice,
      InsuredGoodsExchangeRate: orderSummary.InsuredGoodsExchangeRate,
      CommodityType: orderSummary.CommodityType,
      JsonSearchCriteria: orderSummary.JsonSearchCriteria,
      IDlist: orderSummary.IDlist,
      BookingJsonDetail: orderSummary.BookingJsonDetail,
      ActualScheduleDetail: orderSummary.ActualScheduleDetail,
      ActualSchedulePriceDetail: orderSummary.ActualSchedulePriceDetail,
      BookingSurChargeDetail: billingDataWhole,
      BookingPriceDetail: priceList,
      BookingEnquiryDetail: orderSummary.BookingEnquiryDetail,
      BookingStatusDetail: orderSummary.BookingStatusDetail,
      Payment: orderSummary.Payment,
      CreatedBy: userItem.LoginID,
      JsonBookingLocation: JSON.stringify(userLocation),
      BookingAcknowledgment: orderSummary.BookingAcknowledgment,
      BookingDesc: orderSummary.BookingDesc,
      IncoID: orderSummary.IncoID,
      isExcludeImp: orderSummary.isExcludeImp,
      isExcludeExp: orderSummary.isExcludeExp,
      IsNvocc: (orderSummary.IsNvocc) ? orderSummary.IsNvocc : null
    }
  }
  HashStorage.removeItem('taxData')
  return prepareSaveBookingObj
}


export enum FillingMode {
  OrderSummary_To_BookingDetails,
  BookingDetails_To_OrderSummary
}

export const generateContDetails = (orderSummary: BookingDetails, fillMode: FillingMode) => {
  let tempArr = []

  let tempArr2: any[] = orderSummary.BookingContainerDetail

  if (orderSummary.ContainerLoad === 'FCL' || orderSummary.ContainerLoad === 'FTL') {
    if (fillMode == FillingMode.BookingDetails_To_OrderSummary) {
      tempArr2.forEach(elem => {
        let temp = {
          contSpecID: elem.ContainerSpecID,
          contRequestedQty: elem.BookingContTypeQty,
          contRequestedCBM: 0,
          contRequestedWeight: 0

        }
        tempArr.push(temp)
      })
    } else {
      if (tempArr2[0].contSpecID) {
        tempArr2.forEach(elem => {
          let temp = {
            ContainerSpecID: elem.contSpecID,
            BookingContTypeQty: elem.contRequestedQty,
            PackageCBM: 0,
            PackageWeight: 0
          }
          tempArr.push(temp)
        })
      } else {
        tempArr = tempArr2
      }
    }
  } else if (orderSummary.ContainerLoad === 'LCL') {
    if (fillMode == FillingMode.BookingDetails_To_OrderSummary) {
      tempArr2.forEach(elem => {
        let temp = {
          contSpecID: elem.ContainerSpecID,
          contRequestedQty: 0,
          contRequestedCBM: elem.BookingPkgTypeCBM,
          contRequestedWeight: 0
        }
        tempArr.push(temp)
      })
    } else {
      if (tempArr2[0].contSpecID) {
        tempArr2.forEach(elem => {
          let temp = {
            ContainerSpecID: elem.contSpecID,
            BookingContTypeQty: 0,
            PackageCBM: elem.BookingPkgTypeCBM,
            PackageWeight: 0
          }
          tempArr.push(temp)
        })
      } else {
        tempArr = tempArr2
      }
    }
  }


  return tempArr
}

export function patternValidator(regexp: RegExp): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const value = control.value;
    if (value === '') {
      return null;
    }
    return !regexp.test(value) ? { 'patternInvalid': { regexp } } : null;
  };
}

export function matchOtherValidator(otherControlName: string) {

  let thisControl: FormControl;
  let otherControl: FormControl;

  return function matchOtherValidate(control: FormControl) {

    if (!control.parent) {
      return null;
    }

    // Initializing the validator.
    if (!thisControl) {
      thisControl = control;
      otherControl = control.parent.get(otherControlName) as FormControl;
      if (!otherControl) {
        throw new Error('matchOtherValidator(): other control is not found in parent group');
      }
      otherControl.valueChanges.subscribe(() => {
        thisControl.updateValueAndValidity();
      });
    }

    if (!otherControl) {
      return null;
    }

    if (otherControl.value !== thisControl.value) {
      return {
        matchOther: true
      };
    }

    return null;

  }

}

// export const getBrowserLocation = (_http) => {
//   _http.get('https://api.teletext.io/api/v1/geo-ip').subscribe((res: any) => {
//     let countryCode = res.alpha2;
//     return countryCode;
//   });
// }


let currentLocCode: string = 'ae'


export const cloneObject = (obj: any): any => {
  let newObj = JSON.parse(JSON.stringify(obj))
  return newObj
}

export const getDefaultCountryCode = (): string => {
  return currentLocCode
}

export const setDefaultCountryCode = (newCode) => {
  currentLocCode = newCode
}


export enum ImageSource {
  FROM_SERVER,
  FROM_ASSETS
}

export enum ImageRequiredSize {
  original,
  _96x96,
  _80x80,
  _48x48,
  _32x32,
  _24x24,
  _16x16,
}



/** Gets url path for the specified image on the server
  * @param fileSource fileSource
  * @param fileName fileName
  * @param reqSize reqSize
*/
export function getImagePath(fileSource: ImageSource, fileName: string, reqSize: ImageRequiredSize): string {

  let url = ''
  if (fileSource === ImageSource.FROM_ASSETS) {

  }

  if (fileSource === ImageSource.FROM_SERVER) {
    try {
      if (reqSize === ImageRequiredSize.original) {
        url = baseExternalAssets + '/' + fileName
      } else if (reqSize === ImageRequiredSize._96x96) {
        url = baseExternalAssets + '/' + fileName.replace("original", "96x96")
      } else if (reqSize === ImageRequiredSize._80x80) {
        url = baseExternalAssets + '/' + fileName.replace("original", "80x80")
      } else if (reqSize === ImageRequiredSize._48x48) {
        url = baseExternalAssets + '/' + fileName.replace("original", "48x48")
      } else if (reqSize === ImageRequiredSize._32x32) {
        url = baseExternalAssets + '/' + fileName.replace("original", "32x32")
      } else if (reqSize === ImageRequiredSize._24x24) {
        url = baseExternalAssets + '/' + fileName.replace("original", "24x24")
      } else if (reqSize === ImageRequiredSize._16x16) {
        url = baseExternalAssets + '/' + fileName.replace("original", "16x16")
      }
    } catch (error) {
      url = baseExternalAssets + '/' + fileName
    }
  }

  return url
}

export const lastElementsOfArr = (arr, toGet: number) => {
  return arr.slice(Math.max(arr.length - toGet, 0))
}

export const startElementsOfArr = (arr, toGet: number) => {
  return arr.slice(0, toGet)
}

export const removeDuplicateCurrencies = (currencyFlags: CurrencyDetails[]) => {

  let euros = currencyFlags.filter(element => element.code === 'EUR')
  let franc = currencyFlags.filter(element => element.code === 'XOF')
  let franc2 = currencyFlags.filter(element => element.code === 'XAF')
  let restCurr = currencyFlags.filter(element => element.code !== 'EUR' && element.code !== 'XOF' && element.code !== 'XAF')

  let newCurrencyList = restCurr.concat(euros[0], franc[0], franc2[0]);

  return newCurrencyList
}

//botfield should be number
export const doubleSorter = (dataArray: Array<any>, fieldOne: string, fieldTwo: string) => {

  const newDataObject: Array<any> = cloneObject(dataArray)

  newDataObject.sort(function (x, y) {
    var n = x[fieldOne] - y[fieldTwo];
    if (n != 0) {
      return n;
    }
    return x[fieldOne] - y[fieldTwo];
  });

  return newDataObject
}

export const getDuplicateValues = (sortedArray: Array<any>) => {
  let results: any[];
  const sortedArrayLenght: number = sortedArray.length
  for (let i = 0; i < sortedArrayLenght - 1; i++) {
    if (sortedArray[i + 1] == sortedArray[i]) {
      results.push(sortedArray[i]);
    }
  }
  return results
}
export const preloadImages = (imgs: any) => {
  let images = [];
  for (var i = 0; i < imgs.length; i++) {
    images[i] = new Image();
    images[i].src = imgs[i];
  }
}

// let x = ["http://domain.tld/gallery/image-001.jpg",
//   "http://domain.tld/gallery/image-002.jpg",
//   "http://domain.tld/gallery/image-003.jpg"]
//-- usage --//
// preload(x)

export const encryptBookingID = (bookingId: number, userId?: any, shippingModeCode?: string, guest?: string): string => {
  let toEncrypt: string
  if (guest) {
    toEncrypt = bookingId + '|' + userId + '|' + shippingModeCode + '|' + guest
  } else {
    toEncrypt = bookingId + '|' + userId + '|' + shippingModeCode
  }
  const toSend: string = Base64.encode(toEncrypt)
  return toSend
}
export const getTimeStr = (minutes: number): string => {
  const decHour = Math.floor(minutes / 60)
  const modMin = (minutes % 60)
  const strTime: string = decHour + 'h ' + modMin + 'm'
  return strTime
}

export function validateName(name: string): string {
  let newString = ''
  const arr = name.split(' ')

  const totalLengt = arr.length
  for (let i = 0; i < totalLengt; i++) {
    const nextIndex = i + 1
    if (nextIndex < totalLengt && arr[nextIndex].length > 0) {
      newString = newString.concat(arr[i] + ' ')
    } else {
      newString = newString.concat(arr[i])
    }
  }

  return newString
}

export function getTotalContainerCount(searchCriteria: SearchCriteria) {
  let totalCount: number = 0
  const { SearchCriteriaContainerDetail } = searchCriteria
  SearchCriteriaContainerDetail.forEach(contDtl => {
    totalCount += contDtl.contRequestedQty
  });
  return totalCount
}

export function getTotalContainerCBM(searchCriteria: SearchCriteria) {
  return searchCriteria.totalShipmentCMB
}

export function getTotalContainerWeight(searchCriteria: SearchCriteria) {
  return searchCriteria.totalVolumetricWeight
}

/** Call this function to get the counter of selected Container/Pallets Etc from FCL/LCL/LCL-Air
  * @param userContainerList The containerList in the searchCriteria
  * @param containerSpecCode The Container/Unit Code for the selected Container/Unit Type from the container List
*/
export function getContainersByType(userContainerList: Array<SearchCriteriaContainerDetail>, containerSpecCode: string): number {
  let count = 0

  const unitList = userContainerList.filter(cont => cont.containerCode === containerSpecCode)
  unitList.forEach(pallet => {
    count += pallet.contRequestedQty
  })
  return count
}


/** Call this function to get the Movement Type in FCL/LCL/LCL-Air/GROUND/ETC
  * @param pickupPortType pickup transport mode
  * @param deliveryPortType delivery transport mode
*/
export function getMovementType(pickupPortType, deliveryPortType) {
  let portType = 'PortToPort'

  let strPick = 'Port'
  let strDrop = 'Port'


  switch (pickupPortType) {
    case 'AIR':
      strPick = 'Airport'
      break
    case 'GROUND':
      strPick = 'Ground'
      break
    case 'SEA':
      strPick = 'Port'
      break
    default:
      strPick = 'Port'
      break
  }

  switch (deliveryPortType) {
    case 'AIR':
      strDrop = 'Airport'
      break
    case 'GROUND':
      strDrop = 'Ground'
      break
    case 'SEA':
      strDrop = 'Port'
      break
    default:
      strDrop = 'Port'
      break
  }

  portType = strPick + 'To' + strDrop
  return portType
}

/** Gets the specified marker icon for w.r.t transport Mode
  * @param transMode Transport Mode
*/
export function getMarkerIcon(transMode) {
  let modeIcon = 'icon_pin_location.svg'
  switch (transMode) {
    case 'AIR':
      modeIcon = 'ic_air.svg'
      break;
    case 'LOCATION':
      modeIcon = 'ic_location.svg'
      break;
    case 'SEA':
      modeIcon = 'ic_ship.svg'
      break;
    case 'GROUND':
      modeIcon = 'ic_truck.svg'
      break;
    case 'WAREHOUSE':
      modeIcon = 'ic_warehouse.svg'
      break;
    default:
      modeIcon = 'icon_pin_location.svg'
      break;
  }
  return modeIcon
}

/** Gets the specified normal grey icon for w.r.t transport Mode
  * @param transMode Transport Mode
*/

export function getGreyIcon(transMode) {
  let modeIcon = 'icon_pin_location.svg'
  switch (transMode) {
    case 'AIR':
      modeIcon = 'air-lcl-grey.svg'
      break;
    case 'LOCATION':
      modeIcon = 'Icons_Location_light_grey.svg'
      break;
    case 'SEA':
      modeIcon = 'icons_cargo_ship_grey.svg'
      break;
    case 'GROUND':
      modeIcon = 'icons_cargo_truck_grey.svg'
      break;
    default:
      modeIcon = 'Icons_Location_mid_grey.svg'
      break;
  }
  return modeIcon

}

/** Gets the specified animated grey icon for w.r.t transport Mode
  * @param transMode Transport Mode
*/

export function getAnimatedGreyIcon(transMode) {
  let x = '../../'
  let modeIcon
  switch (transMode) {
    case 'AIR':
      modeIcon = `
      <svg id="9da47147-2af0-4541-9126-fe489cb71022" class="ship-animate flag-animation" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24">
        <defs>
          <style>
            .\37 14c9074-16c5-4f8a-8fba-4219870be0a1 {
              fill: #738593;
            }
          </style>
        </defs>
        <g id="4770d30b-5f7a-489b-b03f-e33ae4f209ee" data-name="plane">
          <path id="e028be17-d5a5-4255-9439-886e15d376f8" data-name="&lt;Path&gt;" class="714c9074-16c5-4f8a-8fba-4219870be0a1"
            d="M21.5,14H3.051a3,3,0,0,1-1.872-.656L0,12.4V10H21.5A2.292,2.292,0,0,1,24,12h0A2.292,2.292,0,0,1,21.5,14Z" />
          <polygon id="c0ae1538-9799-4465-bf1f-29ca5182e666" data-name="&lt;Path&gt;" class="714c9074-16c5-4f8a-8fba-4219870be0a1"
            points="5 11 0 11 0 7 2.474 7 5 11" />
          <g id="c44fbcaf-c122-4795-b609-52d2b77a1d55" data-name="&lt;Group&gt;">
            <polygon id="e514b53e-fa4f-4fa8-9244-c9ea5fd16ce8" data-name="&lt;Path&gt;" class="714c9074-16c5-4f8a-8fba-4219870be0a1"
              points="9.444 14 16.381 14 18 12 10.714 3 7 3 10.143 12 9.444 14" />
            <polygon id="54171f07-8ed6-44b5-9571-7bbf36f3d3c3" data-name="&lt;Path&gt;" class="714c9074-16c5-4f8a-8fba-4219870be0a1"
              points="8.746 16 7 21 10.714 21 14.762 16 8.746 16" />
          </g>
        </g>
      </svg>`
      break;
    case 'LOCATION':
      modeIcon = `
      <svg id="2968af2a-21f9-4f5b-8d14-9319a586596e" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 16" class="icon-size-20 animated wobble icon-location">
        <defs>
        <style>
          .fill-color {
            fill: #b9c2c8;
          }
        </style>
        </defs>
        <path class="fill-color" d="M6.5,0A6.622,6.622,0,0,0,0,6.737C0,10.458,6.5,16,6.5,16S13,10.458,13,6.737A6.622,6.622,0,0,0,6.5,0Zm0,8a2,2,0,1,1,2-2A2,2,0,0,1,6.5,8Z"/>
      </svg>`

      break;
    case 'SEA':
      modeIcon = `
      <svg class="ship-animate" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <g data-name="ship2">
          <path data-name="&lt;Path&gt;" class="path-ship" d="M18.4,21H5.262a3,3,0,0,1-2.1-.862L0,17.029.042,15H24l-3.1,4.662A3,3,0,0,1,18.4,21Z" />
          <rect data-name="&lt;Rectangle&gt;" class="rect-1" x="2" y="11" width="6" height="3" />
          <rect data-name="&lt;Rectangle&gt;" class="rect-2" x="9" y="11" width="6" height="3" />
          <rect data-name="&lt;Rectangle&gt;" class="rect-5" x="9" y="7" width="6" height="3" />
          <rect data-name="&lt;Rectangle&gt;" class="rect-3" x="16" y="11" width="6" height="3" />
          <rect data-name="&lt;Rectangle&gt;" class="rect-4" x="2" y="7" width="6" height="3" />
          <rect data-name="&lt;Rectangle&gt;" class="rect-6" x="9" y="3" width="6" height="3" />
        </g>
      </svg>`
      break;
    case 'GROUND':
      modeIcon = `
        <svg id="f7905435-1486-49b3-baf9-4dca76d453f9" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="moveRightToLeft">
          <defs>
          <style>
            .a2024788-efba-4438-b0be-f26b285b4fd6 {
              fill: #b9c2c9;
            }
          </style>
          </defs>
           <g id="d1bd0fc5-aee7-4161-bcfc-9917552a4e20" data-name="truck">
            <path id="3b886d42-d469-4fa8-a176-d1a6f9535320" data-name="&lt;Path&gt;" class="a2024788-efba-4438-b0be-f26b285b4fd6" d="M21.5,14h-2c0-4-2.5-6.5-6.5-6.5v-2A8.138,8.138,0,0,1,21.5,14Z"/>
            <g id="dece99b0-ccfe-46cd-9e08-09c04af070eb" data-name="&lt;Group&gt;">
              <path id="1e109160-3fc6-427d-a960-9408ecfded4d" data-name="&lt;Compound Path&gt;" class="a2024788-efba-4438-b0be-f26b285b4fd6" d="M6,16a3.5,3.5,0,1,0,3.5,3.5A3.5,3.5,0,0,0,6,16Zm0,5.25A1.75,1.75,0,1,1,7.75,19.5,1.75,1.75,0,0,1,6,21.25Z"/>
            </g>
            <g id="0a8baa5b-ca15-44f3-b7a0-e022331802c0" data-name="&lt;Group&gt;">
              <g id="c0230789-57cf-47bc-a80f-830d7c300074" data-name="&lt;Group&gt;">
                <path id="b3ca8f69-77be-4bef-880a-c916143eb129" data-name="&lt;Path&gt;" class="a2024788-efba-4438-b0be-f26b285b4fd6" d="M14,3H3.24A3.24,3.24,0,0,0,0,6.24V19H4.331a1.739,1.739,0,0,1,3.337,0H14Z"/>
              </g>
            </g>
            <g id="e2c8b36e-a3d6-4f64-aece-7314231b6800" data-name="&lt;Group&gt;">
              <path id="ab7af316-2d2b-4ee2-8291-e72c5310f1ec" data-name="&lt;Compound Path&gt;" class="a2024788-efba-4438-b0be-f26b285b4fd6" d="M18,16a3.5,3.5,0,1,0,3.5,3.5A3.5,3.5,0,0,0,18,16Zm0,5.25a1.75,1.75,0,1,1,1.75-1.75A1.75,1.75,0,0,1,18,21.25Z"/>
            </g>
            <g id="589008c7-8e5d-4302-9187-3d291cab846d" data-name="&lt;Group&gt;">
              <path id="08fec5ba-4e9f-4b7f-b673-94d24fdb6a92" data-name="&lt;Compound Path&gt;" class="a2024788-efba-4438-b0be-f26b285b4fd6" d="M22,14v3H20.793a3.746,3.746,0,0,0-5.587,0H13.735l-.429-3H22m2-2H11l1,7h4.331a1.739,1.739,0,0,1,3.337,0H24V12Z"/>
            </g>
          </g>
        </svg>`
      break;
    default:
      modeIcon = `
         <svg id="2968af2a-21f9-4f5b-8d14-9319a586596e" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 16" class="icon-size-20">
          <defs>
          <style>
            .fill-color {
              fill: #b9c2c8;
            }
          </style>
          </defs>
          <path class="fill-color" d="M6.5,0A6.622,6.622,0,0,0,0,6.737C0,10.458,6.5,16,6.5,16S13,10.458,13,6.737A6.622,6.622,0,0,0,6.5,0Zm0,8a2,2,0,1,1,2-2A2,2,0,0,1,6.5,8Z"/>
        </svg>`
      break;
  }
  return modeIcon

}



/** Gets the difference in days, month or year between two dates
  * @param  firstDate First Date
  * @param secDate Second Date
  * @param mode difference mode e.g: 'days', 'months' or 'years'
*/
export function getDateDiff(firstDate: string, secDate: string, mode: any, format: string) {
  const a = moment(firstDate, format);
  const b = moment(secDate, format);
  const test = a.diff(b, mode);
  return test + 1;
}

export function getProviderImage(strJsonPath: string) {
  let jsonStr: any = null

  try {
    jsonStr = JSON.parse(strJsonPath)[0].ProviderLogo
  } catch (error) {
    jsonStr = ""
  }

  return jsonStr
}

export interface ProviderImageData {
  ProviderLogo: string
}

import * as AesCryrpto from 'aes-js'
import { Buffer } from 'buffer'
import aes from 'js-crypto-aes';
import { MonthDateModel } from '../components/user/view-booking-detail/view-booking.component';
import { CurrencyControl } from '../shared/currency/currency.injectable';
import { WarehouseSearchResult } from '../interfaces/warehouse.interface';
import { LoginUser } from '../interfaces/user.interface';

export function unpad(padded) {
  return padded.subarray(0, padded.byteLength - padded[padded.byteLength - 1]);
}

const keybytes = AesCryrpto.utils.utf8.toBytes('8080808080808080');



export function encryptStringAES({ d1, d2, d3 }: AESModel): AESModel {
  const iv = AesCryrpto.utils.utf8.toBytes(d1); //Dynamic key from object as d1
  const textBytes = AesCryrpto.utils.utf8.toBytes(d2);
  let encrypted
  try {
    const aesCbc = new AesCryrpto.ModeOfOperation.cbc(keybytes, iv);
    const enc = aesCbc.encrypt(pad(textBytes))
    encrypted = Buffer.from(enc).toString('base64')
  } catch (err) {
  }
  return { d1, d2: encrypted, d3 }
}

export function decryptStringAES({ d1, d2, d3 }: AESModel) {
  const iv = AesCryrpto.utils.utf8.toBytes(d1); //Dynamic key from object as d1
  const encrypted = Buffer.from(d2, 'base64');
  // const decrypted = await aes.decrypt(encrypted, keybytes, { name: 'AES-CBC', iv })
  const aesCbc = new AesCryrpto.ModeOfOperation.cbc(keybytes, iv);
  const decrypted = aesCbc.decrypt(encrypted)
  const unpaddedData = unpad(decrypted)
  const decryptedText = AesCryrpto.utils.utf8.fromBytes(unpaddedData);
  return decryptedText
}

export interface AESModel {
  d1: string;
  d2: string;
  d3: string;
}

export function getWarehouseBookingDates(cutOffDate): Array<MonthDateModel> {
  const beginDate = moment(cutOffDate).subtract(6, 'days').format()
  let dateArray = [];
  let startDate = moment(beginDate);
  let stopDate = moment(cutOffDate);
  while (startDate <= stopDate) {

    let isActive = true

    if (moment().diff(startDate, 'days') > 0) {
      isActive = false
    }

    const obj: MonthDateModel = {
      isActive: isActive,
      isSelected: false,
      pickupDate: moment(startDate).format('YYYY-MM-DD'),
    }
    dateArray.push(obj)
    startDate = moment(startDate).add(1, 'days');
  }
  return dateArray;
}


export function isUserLogin(): boolean {
  const user = JSON.parse(Tea.getItem('loginUser'))
  if (!user) {
    return false
  }
  if (user && user.IsLogedOut) {
    return false
  }

  if (user && !user.IsLogedOut) {
    return true
  }
}

export function pad(plaintext) {
  const padding = PADDING[(plaintext.byteLength % 16) || 0];
  const result = new Uint8Array(plaintext.byteLength + padding.length);
  result.set(plaintext);
  result.set(padding, plaintext.byteLength);
  return result;
}

// pre-define the padding values
const PADDING = [
  [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
  [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
  [14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14],
  [13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13],
  [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
  [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11],
  [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
  [9, 9, 9, 9, 9, 9, 9, 9, 9],
  [8, 8, 8, 8, 8, 8, 8, 8],
  [7, 7, 7, 7, 7, 7, 7],
  [6, 6, 6, 6, 6, 6],
  [5, 5, 5, 5, 5],
  [4, 4, 4, 4],
  [3, 3, 3],
  [2, 2],
  [1]
];


export function checkDuplicateInObject($propName, $inputArray: Array<any>): DuplicateResp {
  let seenDuplicate = false, testObject = {};
  let dupItem: Array<any> = []

  $inputArray.map((item) => {
    const itemPropertyName = item[$propName];
    if (itemPropertyName in testObject) {
      testObject[itemPropertyName].duplicate = true;
      item.duplicate = true;
      seenDuplicate = true;
      if (!(dupItem.includes(item[$propName]))) {
        dupItem.push(item[$propName])
      }
    }
    else {
      testObject[itemPropertyName] = item;
      // delete item.duplicate;
    }
  });

  return { res: seenDuplicate, payload: dupItem };
}

export function checkDuplicateLatLng($propA, $propB, $inputArray): DuplicateResp {
  let seenDuplicate = false, testObject = {};
  let dupItem = null

  $inputArray.map((item) => {
    const itemPropA = item[$propA];
    const itemPropB = item[$propB];
    if (itemPropA in testObject && itemPropB in testObject) {
      testObject[itemPropA].duplicate = true;
      // testObject[itemPropB].duplicate = true;
      item.duplicate = true;
      seenDuplicate = true;
      dupItem = item
    }
    else {
      testObject[$propA] = item;
      delete item.duplicate;
    }
  });

  return { res: seenDuplicate, payload: dupItem };
}

export function isInArray(value, array: Array<any>): boolean {
  return array.indexOf(value) > -1;
}

export interface DuplicateResp {
  res: boolean;
  payload: Array<any>;
}

export function getSearchCriteria(): SearchCriteria {
  return JSON.parse(HashStorage.getItem("searchCriteria"));
}

export function setSearchCriteria(obj) {
  HashStorage.setItem("searchCriteria", JSON.stringify(obj));
}


export function getLoggedUserData(): LoginUser {
  try {
    return JSON.parse(Tea.getItem("loginUser"));
  } catch (error) {
    return null
  }
}

export function filterByType(value, keys: string, term: string) {
  if (!term) return value;
  return (value || []).filter((item) => keys.split(',').some(key => item.hasOwnProperty(key) && new RegExp(term, 'gi').test(item[key])));
}

/** Gets the specified simple blue icon for w.r.t transport Mode
  * @param transMode Transport Mode
*/
export function getBlueModeIcon(transMode: string) {
  let modeIcon = 'icon_ship.svg'
  switch (transMode) {
    case 'AIR':
      modeIcon = 'icon_plane.svg'
      break;
    case 'SEA':
      modeIcon = 'icon_ship.svg'
      break;
    case 'TRUCK':
      modeIcon = 'icons_cargo_truck_grey_dark.svg'
      break;
    case 'WAREHOUSE':
      modeIcon = 'Icons_Warehousing_Grey.svg'
      break;
    default:
      modeIcon = 'icon_ship.svg'
      break;
  }
  return modeIcon
}

// Object Keys Changes
export function changeCase(o, toCase) {
  var newO, origKey, newKey, value
  if (o instanceof Array) {
    return o.map(function (value) {
      if (typeof value === "object") {
        value = this.toCamel(value)
      }
      return value
    })
  } else {
    newO = {}
    for (origKey in o) {
      if (o.hasOwnProperty(origKey)) {
        if (toCase === 'camel') {
          newKey = (origKey.charAt(0).toLowerCase() + origKey.slice(1) || origKey).toString()
        } else if ('pascal') {
          newKey = (origKey.charAt(0).toUpperCase() + origKey.slice(1) || origKey).toString()
        }

        value = o[origKey]
        if (value instanceof Array || (value !== null && value.constructor === Object)) {
          value = this.toCamel(value)
        }
        newO[newKey] = value
      }
    }
  }
  return newO
}

export const DEFAULT_EMPTY_GRAPH: any = {
  color: ['#02bdb6', '#8472d5'],
  title: { text: 'No Data to Show', x: 'center', y: 'center' },
  tooltip: {
    trigger: 'axis',
    // formatter: '{b} <br> {c} ({d}%)',
    axisPointer: {
      type: 'shadow'
    },
    backgroundColor: ['rgba(255,255,255,1)'],
    padding: [20, 24],
    extraCssText: 'box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.2);',
    textStyle: {
      color: '#2b2b2b', //#738593
      decoration: 'none',
      fontFamily: 'Proxima Nova, sans-serif',
      fontSize: 16,
      //fontStyle: 'italic',
      //fontWeight: 'bold'
    }
  },
  legend: {
    data: [] //Hamza
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      data: [], //Hamza
      axisTick: {
        alignWithLabel: true
      }
    }
  ],
  yAxis: [
    {
      type: 'value',
      // type: 'category',
      // data: ['0', '1k', '2M', '4M', '10M']
    }
  ],
  series: [
    {
      name: '',
      type: 'bar',
      barGap: 0.1,
      barWidth: 10,
      itemStyle: {
        normal: {
          barBorderRadius: 15,
        }
      },
      data: [] //Hamza
    },
  ]
}
