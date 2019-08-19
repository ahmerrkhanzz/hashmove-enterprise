import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { BookingService } from '../booking.service';
import { ProviderVAS } from '../../../interfaces/order-summary';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { JsonResponse } from '../../../interfaces/JsonResponse';
import { BookingDetails, PriceDetail } from '../../../interfaces/bookingDetails';
import { DataService } from '../../../services/commonservice/data.service';
import { getTotalContainerCount, HashStorage, getTotalContainerWeight, getTotalContainerCBM, getContainersByType, encryptBookingID, ValidateEmail, loading, Tea, cloneObject } from '../../../constants/globalfunctions';
import { Rate, ExchangeRate, MasterCurrency } from '../../../interfaces/currencyDetails';
import { SearchCriteria } from '../../../interfaces/searchCriteria';
import { ShippingArray, ShippingCriteriaCat, ShippingCriteriaSubCat, Container } from '../../../interfaces/shipping.interface';
import { CurrencyControl } from '../../../shared/currency/currency.injectable';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { DropDownService } from '../../../services/dropdownservice/dropdown.service';
import { SearchResultService } from '../../search-results/fcl-search/fcl-search.service';
import { of, from, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { map } from 'rxjs/operators/map';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss']
})
export class TrackingComponent implements OnInit, OnDestroy {

  @Output() tabChangeEvent = new EventEmitter<string>();
  @Output() setProviderList2Parent = new EventEmitter<Array<ProviderVAS>>();
  @Input() providerVasList: ProviderVAS[]
  public searchCriteria: SearchCriteria
  public trackingVAS: ProviderVAS
  public qualityVAS: ProviderVAS
  public bookingInfo: BookingDetails;
  public masterCurrency: MasterCurrency
  public isTrackingEnabled: boolean = false
  public isQualityEnabled: boolean = false
  public trackingContainers: any = []
  public qualityContainers: any = []
  public totalContainersCount: any = []
  public currencyData: CurrencyData = {
    currencyId: 101,
    currencyCode: 'AED'
  }

  public trackingAmount: number = 0
  public indTrackingAmount: number = 0
  public baseTrackingAmount: number = 0
  public baseIndTrackingAmount: number = 0

  public qltyMonitAmount: number = 0
  public indQltyMonitAmount: number = 0
  public baseQltyMonitAmount: number = 0
  public baseIndQltyMonitAmount: number = 0

  public trackingChecked: boolean = false
  public qualityChecked: boolean = false
  public containerLabel: string = ''
  public newTrackQualityObj: PriceDetail
  public IOTParams: any = []
  public IOTActions: any = []
  public iotUserData: any = {
    email: [],
    sms: [],
  }
  public userEmail: any;
  public userPhone: number;
  public selectedAction: number = 1;
  public JsonParametersOfSensor;
  public showEmailDropdown: boolean = true;
  public showSMSDropdown: boolean = false;
  public countryList: any = []
  public cityList: any = []
  public countryPhoneCode;
  public countryID = 101;
  public city: any = {
    title: "Dubai, United Arab Emirates",
    imageName: "ae",
    desc:
      '[{"CountryID":101,"CountryCode":"AE","CountryName":"United Arab Emirates","CountryPhoneCode":"+971"}]'
  };
  public cityValidation;
  public cityValid;
  public select;
  public selectedImage;
  public countryPCode;
  public countryPhoneId;
  public emailDropdown: number = 1
  public smsDropdown: number = 2
  userInpContainers: number = 1
  isQalityChangeable: boolean = false

  modelChanged: Subject<number> = new Subject<number>();

  constructor(
    private _bookingService: BookingService,
    private _dataService: DataService,
    private _currencyControl: CurrencyControl,
    private _toast: ToastrService,
    private _dropdownservice: DropDownService,
    private _searchService: SearchResultService
  ) { }

  ngOnInit() {
    this.masterCurrency = this._currencyControl.getMasterCurrency()
    this.searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))
    this.saveButtonTriggerCheck()
    this.bookingInfo = this._dataService.getBookingData()

    this.modelChanged.pipe(
      debounceTime(300),
      distinctUntilChanged())
      .subscribe(number$ => {
        this.onContainerChange(number$, 'change')
      });

    if (this.bookingInfo.BookingID !== -1) {
      this.getPriceBreakDown()
    }
    if (this.bookingInfo.BookingID && this.bookingInfo.JsonParametersOfSensor && JSON.parse(this.bookingInfo.JsonParametersOfSensor).length > 0) {
      this.JsonParametersOfSensor = JSON.parse(this.bookingInfo.JsonParametersOfSensor)
      this.JsonParametersOfSensor[0].parametersGroup.forEach(element => {
        if (element.iotParameterType === 'QUALITY') {
          this.iotUserData.email = (element.parametersDetail[0].actionEmail ? element.parametersDetail[0].actionEmail.split(";") : [])
          this.iotUserData.sms = (element.parametersDetail[0].actionSMS ? element.parametersDetail[0].actionSMS.split(";") : [])
        }
      });

      if (this.iotUserData.sms.length && !this.iotUserData.email.length) {
        this.selectedAction = 2;
        this.showEmailDropdown = false
        this.showSMSDropdown = true
      }
      if (this.iotUserData.email.length && !this.iotUserData.sms.length) {
        this.selectedAction = 1;
        this.showEmailDropdown = true
        this.showSMSDropdown = false
      }

      if (this.iotUserData.email.length && this.iotUserData.sms.length) {
        this.showEmailDropdown = true
        this.showSMSDropdown = true
      }
    }
    this.checkIncaseOfExisiting()
    if (this.providerVasList && this.providerVasList.length > 0) {
      this.setCurrencyData()
      this.setTrackingAmounts()
    }
    this.setCurrencyData()
    this.setProviderVASList()
    this.getIOTParamsValues()
    this.getIOTSensorActions()
    this.setCityCountry()
    if (this.searchCriteria.searchMode !== 'warehouse-lcl' && this.searchCriteria.searchMode !== 'sea-lcl') {
      this.calculateTrakingQualityContainers()
    }
  }

  checkIncaseOfExisiting() {
    const { BookingPriceDetail } = this.bookingInfo
    BookingPriceDetail.forEach(priceDtl => {
      if (priceDtl.SurchargeCode === 'TRCK') {
        this.trackingChecked = true
      }
      if (priceDtl.SurchargeCode === 'QLTY') {
        this.qualityChecked = true
      }
    });
  }

  setProviderVASList() {
    loading(true)
    if (!this.providerVasList) {
      const strToSend = (this.searchCriteria.searchMode === 'warehouse-lcl') ? 'QLTY' : 'TRCK,QLTY';
      this._bookingService.getProviderVASList(strToSend, new Date().toUTCString(), this.bookingInfo.ProviderID).pipe(untilDestroyed(this)).subscribe((resp: JsonResponse) => {
        const { returnId, returnObject } = resp
        loading(false)
        if (returnId > 0 && returnObject) {
          this.providerVasList = returnObject
          this.setTrackingAmounts()
          this.setProviderList2Parent.emit(returnObject)
        } else {
          this.setProviderList2Parent.emit([])
        }
      }, (err) => {
        this.setProviderList2Parent.emit([])
      })
    }
    loading(false)
  }

  setCurrencyData() {
    const currencyCode = this._currencyControl.getCurrencyCode()
    const currencyId = this._currencyControl.getCurrencyID()

    //using javascript Object Patterns
    this.currencyData = {
      currencyCode,
      currencyId
    }
  }

  exchnageRate: Rate

  setTrackingAmounts() {


    if (this.searchCriteria.searchMode !== 'warehouse-lcl' && this.searchCriteria.searchMode !== 'sea-lcl') {
      this.setContainerLabel()
    }
    const { currencyId } = this.currencyData
    const exChangeData: ExchangeRate = this._currencyControl.getExchangeRateList()
    this.exchnageRate = exChangeData.rates.filter(rate => rate.currencyID === currencyId)[0]
    if (this.bookingInfo.BookingContainerDetail && this.bookingInfo.BookingContainerDetail.length > 0) {
      this.bookingInfo.BookingContainerDetail.forEach(containerDtl => {
        if (containerDtl.IsQualityMonitoringRequired === undefined) {
          containerDtl.IsQualityMonitoringRequired = false
        }
        if (containerDtl.IsQualityMonitoringRequired === undefined) {
          containerDtl.IsTrackingRequired = false
        }
      })
    }

    const { exchnageRate } = this

    this.providerVasList.forEach(vas => {
      if (vas.VASCode.toLowerCase() === 'trck') {

        let prvVas = vas.ProviderVASDetail.filter(vasDet => vasDet.ProviderID === this.bookingInfo.ProviderID)

        if (prvVas === undefined || prvVas.length === 0) {
          prvVas = vas.ProviderVASDetail.filter(vasDet => vasDet.ProviderType.toUpperCase() === "HASHMOVE")
        }

        prvVas.forEach(vasDet => {
          vasDet.Rate = this._currencyControl.getNewPrice(vasDet.BaseRate, exchnageRate.rate)
          this.baseIndTrackingAmount = vasDet.BaseRate
          this.indTrackingAmount = vasDet.Rate

          if (vas.VASBasis === 'PER_CONTAINER') {
            const totalCount: number = getTotalContainerCount(this.searchCriteria)
            this.trackingAmount = totalCount * vasDet.Rate
            this.baseTrackingAmount = totalCount * vasDet.BaseRate
          }

          if (vas.VASBasis === 'PER_CBM') {
            const totalCount: number = getTotalContainerCBM(this.searchCriteria)
            this.trackingAmount = totalCount * vasDet.Rate
            this.baseTrackingAmount = totalCount * vasDet.BaseRate
          }

          if (vas.VASBasis === 'PER_KG') {
            const totalCount: number = getTotalContainerWeight(this.searchCriteria)
            this.trackingAmount = totalCount * vasDet.Rate
            this.baseTrackingAmount = totalCount * vasDet.BaseRate
          }
        });
        this.trackingVAS = vas

      }
      if (vas.VASCode.toLowerCase() === 'qlty' && this.searchCriteria.searchMode !== 'warehouse-lcl') {
        vas = this.setQualityAmount(vas, exchnageRate)
      }
    });

    if (this.searchCriteria.searchMode === 'warehouse-lcl') {
      this.onContainerChange(1, 'init')
    }

  }

  setQualityAmount(vas: ProviderVAS, exchnageRate: Rate, userContCount?: number): ProviderVAS {
    let prvVas = vas.ProviderVASDetail.filter(vasDet => vasDet.ProviderID === this.bookingInfo.ProviderID)

    if (prvVas === undefined || prvVas.length === 0) {
      prvVas = vas.ProviderVASDetail.filter(vasDet => vasDet.ProviderType.toUpperCase() === "HASHMOVE")
    }

    prvVas.forEach(vasDet => {
      vasDet.Rate = this._currencyControl.getNewPrice(vasDet.BaseRate, exchnageRate.rate)

      this.baseIndQltyMonitAmount = vasDet.BaseRate
      this.indQltyMonitAmount = vasDet.Rate

      if (vas.VASBasis === 'PER_CONTAINER') {
        const totalCount: number = (userContCount && userContCount > 0) ? userContCount : getTotalContainerCount(this.searchCriteria)
        this.qltyMonitAmount = totalCount * vasDet.Rate
        this.baseQltyMonitAmount = totalCount * vasDet.BaseRate
      }

      if (vas.VASBasis === 'PER_CBM') {
        const totalCount: number = getTotalContainerCBM(this.searchCriteria)
        this.qltyMonitAmount = totalCount * vasDet.Rate
        this.baseQltyMonitAmount = totalCount * vasDet.BaseRate
      }

      if (vas.VASBasis === 'PER_KG') {
        const totalCount: number = getTotalContainerWeight(this.searchCriteria)
        this.qltyMonitAmount = totalCount * vasDet.Rate
        this.baseQltyMonitAmount = totalCount * vasDet.BaseRate
      }

    });
    this.qualityVAS = vas
    return vas
  }

  addTrackingQality($event: boolean, $type: string, $action?: string) {

    const isTracking: boolean = ($type === 'TRCK') ? true : false
    const isQality: boolean = ($type === 'QLTY') ? true : false
    if ($type === 'TRCK' && !$action) {
      this.trackingChecked = !this.trackingChecked
    } else if ($type === 'QLTY' && !$action) {
      this.qualityChecked = !this.qualityChecked
    }
    const { BookingPriceDetail, BookingContainerDetail } = this.bookingInfo
    if (BookingContainerDetail && (this.searchCriteria.searchMode !== 'warehouse-lcl' && this.searchCriteria.searchMode !== 'sea-lcl')) {
      BookingContainerDetail.forEach(containerDtl => {
        if (isTracking) {
          containerDtl.IsTrackingRequired = false
        }
        if (isQality) {
          containerDtl.IsQualityMonitoringRequired = false
        }
      });
    }
    if (!$event) {

      let newList = []

      if (isTracking) {
        newList = BookingPriceDetail.filter(priceDtl => priceDtl.SurchargeCode !== 'TRCK')
      }
      if (isQality) {
        newList = BookingPriceDetail.filter(priceDtl => priceDtl.SurchargeCode !== 'QLTY')
      }

      this.bookingInfo.BookingPriceDetail = newList
      try {
        this.bookingInfo.BookingContainerDetail = BookingContainerDetail
      } catch (error) { }

      this._dataService.setBookingsData(this.bookingInfo)
      return
    }

    const { trackingVAS, qualityVAS } = this

    if (isTracking) {
      this.newTrackQualityObj = {
        SurchargeType: trackingVAS.SurchargeType,
        SurchargeID: trackingVAS.VASID,
        SurchargeCode: trackingVAS.VASCode,
        SurchargeName: trackingVAS.VASName,
        SurchargeBasis: trackingVAS.VASBasis,
        ContainerSpecID: this.bookingInfo.BookingContainerDetail[0].ContainerSpecID,
        CurrencyID: this.masterCurrency.toCurrencyID, //Changing from Fixed to Dynamic
        CurrencyCode: this.masterCurrency.toCurrencyCode, //Changing from Fixed to Dynamic
        BaseCurrencyID: this.masterCurrency.fromCurrencyID, //Changing from Fixed to Dynamic
        BaseCurrencyCode: this.masterCurrency.fromCurrencyCode, //Changing from Fixed to Dynamic
        TotalAmount: this.trackingAmount,
        BaseCurrTotalAmount: this.baseTrackingAmount,
        IndividualPrice: this.indTrackingAmount,
        SortingOrder: 0,
        TransMode: 'Write',
        ShowInsurance: null,
        ActualIndividualPrice: this.indTrackingAmount,
        ActualTotalAmount: this.trackingAmount,
        BaseCurrIndividualPrice: this.baseIndTrackingAmount,
        ExchangeRate: this.masterCurrency.rate,
        // IsChecked :true
      }
    }

    if (isQality) {
      this.newTrackQualityObj = {
        SurchargeType: qualityVAS.SurchargeType,
        SurchargeID: qualityVAS.VASID,
        SurchargeCode: qualityVAS.VASCode,
        SurchargeName: qualityVAS.VASName,
        SurchargeBasis: qualityVAS.VASBasis,
        ContainerSpecID: (this.searchCriteria.searchMode === 'warehouse-lcl') ? 0 : this.bookingInfo.BookingContainerDetail[0].ContainerSpecID,
        CurrencyID: this.masterCurrency.toCurrencyID, //Changing from Fixed to Dynamic
        CurrencyCode: this.masterCurrency.toCurrencyCode, //Changing from Fixed to Dynamic
        BaseCurrencyID: this.masterCurrency.fromCurrencyID, //Changing from Fixed to Dynamic
        BaseCurrencyCode: this.masterCurrency.fromCurrencyCode, //Changing from Fixed to Dynamic
        TotalAmount: this.qltyMonitAmount,
        BaseCurrTotalAmount: this.baseQltyMonitAmount,
        IndividualPrice: this.indQltyMonitAmount,
        SortingOrder: 0,
        TransMode: 'Write',
        ShowInsurance: null,
        ActualIndividualPrice: this.indQltyMonitAmount,
        ActualTotalAmount: this.qltyMonitAmount,
        BaseCurrIndividualPrice: this.baseIndQltyMonitAmount,
        ExchangeRate: this.masterCurrency.rate,
        // IsChecked :true
      }
    }
    if (this.bookingInfo.BookingContainerDetail) {
      this.bookingInfo.BookingContainerDetail.forEach(containerDtl => {
        if (isTracking) {
          containerDtl.IsTrackingRequired = true
        }
        if (isQality) {
          containerDtl.IsQualityMonitoringRequired = true
        }
      });
    }

    this.bookingInfo.BookingPriceDetail.push(this.newTrackQualityObj)
    this._dataService.setBookingsData(this.bookingInfo)

  }

  navigateToTab() {
    if (this.qualityChecked || this.trackingChecked) {
      if (this.qualityChecked && this.searchCriteria.searchMode === 'warehouse-lcl') {
        if (!this.userInpContainers || this.userInpContainers === 0) {
          this._toast.info('Please add atleast one device', 'Info')
          return;
        }
      }
      this.submitIOTParams()
      if (this.IOTParamsValidated) {
        if (this.searchCriteria.searchMode === 'warehouse-lcl') {
          this.tabChangeEvent.emit('tab-departure-date')
        } else {
          this.tabChangeEvent.emit('tab-optional-services')
        }
      }
    } else {
      if (this.searchCriteria.searchMode === 'warehouse-lcl') {
        this.tabChangeEvent.emit('tab-departure-date')
      } else {
        this.tabChangeEvent.emit('tab-optional-services')
      }
    }
  }

  setContainerLabel() {
    const { searchCriteria } = this
    const totalContainerCount: number = (searchCriteria.searchMode === 'warehouse-lcl' || searchCriteria.searchMode === 'sea-lcl') ? 0 : getTotalContainerCount(searchCriteria)

    let strMsgLabel: string = ''

    if (searchCriteria.containerLoad.toLowerCase() === 'fcl' || searchCriteria.containerLoad.toLowerCase() === 'ftl') {
      const strContainer: string = (searchCriteria.containerLoad.toLowerCase() === 'fcl') ? 'container' : 'truck'
      strMsgLabel = `You've ${totalContainerCount} ${strContainer}${(totalContainerCount > 1) ? 's' : ''} in your order`
    } else {

      const { SearchCriteriaContainerDetail } = searchCriteria

      let shipArray: Array<ShippingArray> = JSON.parse(HashStorage.getItem('shippingCategories'))

      const arrShipMode = shipArray.filter(ship => ship.ShippingModeCode.toLowerCase() === searchCriteria.TransportMode.toLowerCase())[0]
      const arrShipCat: ShippingCriteriaCat = arrShipMode.ShippingCriteriaCat.filter(category => category.ShippingCatID === searchCriteria.shippingCatID)[0]
      const arrShipSubCat: ShippingCriteriaSubCat = arrShipCat.ShippingCriteriaSubCat.filter((subCat => subCat.ShippingSubCatID === searchCriteria.shippingSubCatID))[0]
      const containers: Array<Container> = arrShipSubCat.Containers.filter(container => container.ContainerLoadType === searchCriteria.containerLoad)


      containers.forEach(container => {
        const numUnit: number = getContainersByType(SearchCriteriaContainerDetail, container.ContainerSpecCode)
        if (numUnit > 0) {
          strMsgLabel = strMsgLabel + ` ${numUnit} ${container.ContainerSpecDesc},`
        }
      })

      if (strMsgLabel.lastIndexOf(',') >= 0) {
        strMsgLabel = strMsgLabel.substr(0, strMsgLabel.lastIndexOf(','))
      }
      strMsgLabel = strMsgLabel + ' in your shipment'
    }
    this.containerLabel = strMsgLabel
  }

  getPreviousRoute() {

    // searchMode = sea-fcl | sea-lcl | air-lcl
    let selectedProvider = JSON.parse(HashStorage.getItem('selectedProvider'))
    let strRoute: string = '/lcl-search/consolidators'
    const { searchMode, criteriaFrom } = this.searchCriteria
    if (searchMode === 'sea-fcl') {
      if (criteriaFrom === 'search') {
        strRoute = '/fcl-search/shipping-lines'
      } else {
        strRoute = '/partner/' + selectedProvider.ProfileID
      }
    }
    if (searchMode === 'sea-lcl') {
      if (criteriaFrom === 'search') {
        strRoute = '/lcl-search/consolidators'
      } else {
        strRoute = '/partner/' + selectedProvider.ProfileID
      }
    }
    if (searchMode === 'air-lcl') {
      if (criteriaFrom === 'search') {
        strRoute = '/air/air-lines'
      } else {
        strRoute = '/partner/' + selectedProvider.ProfileID
      }
    }
    if (searchMode === 'truck-ftl') {
      if (criteriaFrom === 'search') {
        strRoute = '/truck-search/consolidators'
      } else {
        strRoute = '/partner/' + selectedProvider.ProfileID
      }
    }
    if (searchMode === 'warehouse-lcl') {
      if (criteriaFrom === 'search') {
        strRoute = '/warehousing/warehousing-search'
      } else {
        strRoute = '/partner/' + selectedProvider.ProfileID
      }

    }

    return strRoute
  }


  /**
   * Function to get params list of IOT device
   *
   * @memberof TrackingComponent
   */
  getIOTParamsValues() {
    loading(true)
    const userData = JSON.parse(Tea.getItem('loginUser'));
    let userid = (userData ? userData.UserID : -1)
    const _transportMode = (this.searchCriteria.TransportMode) ? this.searchCriteria.TransportMode : '';
    const bookingIdToSend = (this.bookingInfo.BookingID > -1 && this.bookingInfo.JsonParametersOfSensor && JSON.parse(this.bookingInfo.JsonParametersOfSensor).length > 0) ? this.bookingInfo.BookingID : -1
    const excrypID = encryptBookingID(bookingIdToSend, userid, _transportMode)
    this._bookingService.getIOTParams(excrypID, 'SEA').subscribe((res: JsonResponse) => {
      loading(false)
      const { returnId, returnObject, returnText } = res
      if (returnId > 0) {
        this.IOTParams = returnObject
        this.IOTParams[0].parametersGroup.forEach(element => {
          element.isChecked = false;
          if (this.JsonParametersOfSensor) {
            this.JsonParametersOfSensor[0].parametersGroup.forEach(e => {
              if (element.iotGroupParamName === e.iotGroupParamName) {
                element.isChecked = e.isChecked;
                element.parametersDetail[0].minAlertValue = e.parametersDetail[0].minAlertValue
                element.parametersDetail[0].maxAlertValue = e.parametersDetail[0].maxAlertValue
                element.parametersDetail[0].maxAlertValue = e.parametersDetail[0].maxAlertValue
                element.parametersDetail[0].isChecked = e.parametersDetail[0].isChecked
                // element.parametersDetail[0].actionEmail = e.parametersDetail[0].actionEmail.split(";")
                // element.parametersDetail[0].actionSMS = e.parametersDetail[0].actionSMS.split(";")
              }
            });
          }
        });
      } else {
        this._toast.error(returnText, 'Error')
      }
    }, (err: HttpErrorResponse) => {
      loading(false)
    })
  }

  getIOTSensorActions() {
    this._bookingService.getIOTSensorActions().subscribe((res: any) => {
      this.IOTActions = res.returnObject
    }, (err: HttpErrorResponse) => {
    })
  }

  onActionSelection(actionID, type) {
    if (type === 'email') {
      this.showSMSDropdown = true;
      this.showEmailDropdown = false;
      this.iotUserData.email = []
      this.smsDropdown = 2
    } else if (type === 'sms') {
      this.iotUserData.sms = []
      this.showSMSDropdown = false;
      this.emailDropdown = 1
      this.showEmailDropdown = true;
    }
    actionID = parseInt(actionID.target.value)
    if (actionID === 2 && document.getElementById('sms')) {
      document.getElementById('sms').focus();
    } else if (actionID === 1 && document.getElementById('email')) {
      document.getElementById('email').focus();
    }
  }

  addAnotherAction(type) {
    if (this.showSMSDropdown) {
      this.showEmailDropdown = true
      this.emailDropdown = 1
    } else if (this.showEmailDropdown) {
      this.showSMSDropdown = true
      this.smsDropdown = 2
    }
  }

  onEmailEnter(type, event) {
    if ((event.keyCode === 32 || event.keyCode === 13) && (this.userEmail || this.userPhone)) {
      if (type === 'email') {
        let basicEmail: RegExp = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if (!basicEmail.test(this.userEmail)) {
          this._toast.error('Invalid email entered.', 'Error')
          return
        }
        let valid: boolean = ValidateEmail(this.userEmail);
        if (!valid) {
          this._toast.error('Invalid email entered.', 'Error')
          return
        }
        this.iotUserData.email.forEach(element => {
          if (element === this.userEmail) {
            let idx = this.iotUserData.email.indexOf(element)
            this.iotUserData.email.splice(idx, 1)
            this._toast.error('Email already added', 'Error')
          }
        });
        this.iotUserData.email.push(this.userEmail)
        this.userEmail = '';
      } else if (type === 'sms') {
        let numLength = this.userPhone.toString().length
        if (numLength < 9) {
          this._toast.error('Invalid number.', 'Error')
          return
        }
        let phone = this.countryPhoneCode + "" + this.userPhone
        this.iotUserData.sms.push(phone)
        this.userPhone = null;
      }
    }
  }

  emailFocusOut() {
    if (this.userEmail) {
      let basicEmail: RegExp = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      if (!basicEmail.test(this.userEmail)) {
        this._toast.error('Invalid email entered.', 'Error')
        return
      }
      let valid: boolean = ValidateEmail(this.userEmail);
      if (!valid) {
        this._toast.error('Invalid email entered.', 'Error')
        return
      }
      this.iotUserData.email.forEach(element => {
        if (element === this.userEmail) {
          let idx = this.iotUserData.email.indexOf(element)
          this.iotUserData.email.splice(idx, 1)
          this._toast.error('Email already added', 'Error')
        }
      });
      this.iotUserData.email.push(this.userEmail)
      this.userEmail = '';
    }
    if (this.userPhone) {
      let numLength = this.userPhone.toString().length
      if (numLength < 9) {
        this._toast.error('Invalid number.', 'Error')
        return
      }
      let phone = this.countryPhoneCode + "" + this.userPhone
      this.iotUserData.sms.push(phone)
      this.userPhone = null;
    }

  }

  removeChip(item, idx, type) {
    if (type === 'email') {
      this.iotUserData.email.splice(idx, 1)
    } else if (type === 'sms') {
      this.iotUserData.sms.splice(idx, 1)
    }
  }
  public IOTParamsValidated: boolean = true
  submitIOTParams() {
    if (this.qualityChecked) {
      this.emailFocusOut()
      const emailString = this.iotUserData.email.toString().replace(/,/g, ';')
      const smsString = this.iotUserData.sms.toString().replace(/,/g, ';')
      if (this.bookingInfo.BookingID !== -1) {
        this.IOTParams[0].parametersGroup.forEach(element => {
          if (element.parametersDetail[0].isChecked) {
            element.isChecked = true
          } else if (!element.parametersDetail[0].isChecked) {
            element.isChecked = false
          }
        });
      }

      const mainIOTParams = this.IOTParams[0].parametersGroup.filter(e => e.isChecked);

      let isValidated = true;
      mainIOTParams.forEach(element => {
        element.parametersDetail[0].actionEmail = emailString
        element.parametersDetail[0].actionSMS = smsString
        element.parametersDetail[0].actionSMSCountryCode = this.countryPhoneCode
        element.parametersDetail[0].actionCountryID = this.countryID
      });

      if (!this.valuesValidate()) {
        this.bookingInfo.JsonParametersOfSensor = ""
        this._dataService.setBookingsData(this.bookingInfo)
        this.IOTParamsValidated = false
        return;
      }

      if (mainIOTParams.length) {
        mainIOTParams.forEach(element => {
          element.parametersDetail.forEach(element => {
            if ((element.maxAlertValue !== null || element.maxAlertValue !== undefined) && (element.minAlertValue !== null || element.minAlertValue !== undefined) && (element.actionEmail || element.actionSMS)) {
              isValidated = false;
            }
            if ((typeof element.maxAlertValue !== 'number' || typeof element.minAlertValue !== 'number')) {
              this._toast.error('Please provide range values for selected parameters', 'Error')
              isValidated = true;
            }
            if ((element.maxAlertValue || element.minAlertValue) && (!this.iotUserData.email.length && !this.iotUserData.sms.length)) {
              this._toast.error('Please select atleast one action for quality monitoring', 'Error')
              isValidated = true;
            }
          });
        });
      } else if (!mainIOTParams.length) {
        this._toast.error('Please select atleast one parameter for quality monitoring', 'Error')
        isValidated = true
      } else if (!this.iotUserData.email && this.iotUserData.sms && !mainIOTParams.length) {
        this._toast.error('Please select atleast one action and parameter for quality monitoring', 'Error')
        isValidated = true
      }

      if (isValidated) {
        this.bookingInfo.JsonParametersOfSensor = ""
        this._dataService.setBookingsData(this.bookingInfo)
        this.IOTParamsValidated = false

        return false;
      }
      if (this.trackingChecked) {
        const tracking = this.IOTParams[0].parametersGroup.filter(e => e.iotParameterType === 'TRACKING')
        mainIOTParams.push(tracking[0])
      }

      let IOTParamsToSend = []
      if (this.searchCriteria.searchMode === 'warehouse-lcl' || this.searchCriteria.searchMode === 'sea-lcl') {
        for (let index = 0; index < this.userInpContainers; index++) {
          let obj = {
            contSpecID: 0,
            containerNo: (this.JsonParametersOfSensor ? this.JsonParametersOfSensor[0].containerNo : ''),
            parametersGroup: mainIOTParams,
            SerialID: 0
          }
          IOTParamsToSend.push(obj)
        }
      } else {
        this.bookingInfo.BookingContainerDetail.forEach(e => {
          const parsedIOTParams = JSON.parse(e.JsonContainerDetail);
          let _isQuality: boolean = false;
          try {
            _isQuality = parsedIOTParams[0].IsQualityApplicable
          } catch (error) {
            _isQuality = parsedIOTParams.IsQualityApplicable
          }
          if (_isQuality) {
            const obj = {
              contSpecID: e.ContainerSpecID,
              containerNo: (this.JsonParametersOfSensor ? this.JsonParametersOfSensor[0].containerNo : ''),
              parametersGroup: mainIOTParams,
              SerialID: 0
            }
            console.log(obj);
            for (let i = 0; i < e.BookingContTypeQty; i++) {
              IOTParamsToSend.push(obj)
            }
          }
        })
      }

      this.bookingInfo.JsonParametersOfSensor = JSON.stringify(IOTParamsToSend)
    } else if (this.trackingChecked) {
      const mainIOTParams = this.IOTParams[0].parametersGroup.filter(e => e.iotParameterType === 'TRACKING')

      const emailString = this.iotUserData.email.toString().replace(/,/g, ';')
      const smsString = this.iotUserData.sms.toString().replace(/,/g, ';')

      mainIOTParams.forEach(element => {
        const userData = JSON.parse(Tea.getItem('loginUser'));
        if (userData) {
          element.parametersDetail[0].actionEmail = userData.PrimaryEmail
          element.parametersDetail[0].actionSMS = userData.PrimaryPhone
          element.parametersDetail[0].actionSMSCountryCode = userData.CountryCode
          element.parametersDetail[0].actionCountryID = this.countryID
        } else {
          element.parametersDetail[0].actionEmail = emailString
          element.parametersDetail[0].actionSMS = smsString
          element.parametersDetail[0].actionSMSCountryCode = this.countryPhoneCode
          element.parametersDetail[0].actionCountryID = this.countryID
        }
      });


      let IOTParamsToSend = []
      this.bookingInfo.BookingContainerDetail.forEach(e => {
        const parsedIOTParams = JSON.parse(e.JsonContainerDetail);
        let _isTracking: boolean = false;
        try {
          _isTracking = parsedIOTParams[0].IsTrackingApplicable
        } catch (error) {
          _isTracking = parsedIOTParams.IsTrackingApplicable
        }
        if (_isTracking) {
          const obj = {
            contSpecID: e.ContainerSpecID,
            containerNo: (this.JsonParametersOfSensor ? this.JsonParametersOfSensor[0].containerNo : ''),
            parametersGroup: mainIOTParams,
            SerialID: 0
          }
          for (let i = 0; i < e.BookingContTypeQty; i++) {
            IOTParamsToSend.push(obj)
          }
        }

      })
      this.bookingInfo.JsonParametersOfSensor = JSON.stringify(IOTParamsToSend)
    }

    if (!this.qualityChecked && !this.trackingChecked) {

      this.bookingInfo.JsonParametersOfSensor = ""
    }

    this._dataService.setBookingsData(this.bookingInfo)
    this.IOTParamsValidated = true
  }

  valuesValidate() {
    let validated: boolean = true;
    const mainIOTParams = this.IOTParams[0].parametersGroup.filter(e => e.isChecked);
    if (mainIOTParams.length) {
      mainIOTParams.forEach(element => {
        element.parametersDetail.forEach(element => {
          if ((element.maxAlertValue !== null || element.maxAlertValue !== undefined) && (element.minAlertValue !== null || element.minAlertValue !== undefined) && (element.maxThershold !== null || element.maxThershold !== undefined) && (element.minThershold !== null || element.minThershold !== undefined)) {
            if ((element.minAlertValue < element.minThershold || element.minAlertValue > element.maxThershold) || (element.maxAlertValue < element.minThershold || element.maxAlertValue > element.maxThershold)) {
              validated = false;
              this._toast.error(element.iotParamNameDisplayName + ' values should be between ' + element.minThershold + ' to ' + element.maxThershold, 'Error')
            }
            if (element.maxAlertValue < element.minAlertValue) {
              validated = false;
              this._toast.error(element.iotParamNameDisplayName + ' max value should not be less than min value', 'Error')
            }
          }
        });
      });
    }
    return validated
  }

  flag(list, type) {
    this.cityValidation = false;
    this.cityValid = false;
    if (typeof list == "object" && list.title && type == "city") {
      let description = JSON.parse(list.desc);
      this.select = this.countryList.find(
        item => item.id === description[0].CountryID
      );

      this.countryPhoneCode = this.select.desc[0].CountryPhoneCode
      this.countryID = this.select.id;

    } else if (typeof list == "object" && list.title && type == "country") {
      this.selectedImage = list.code;
      let description = list.desc;
      this.countryPCode = description[0].CountryPhoneCode;
      this.countryPhoneCode = description[0].CountryPhoneCode;
      this.countryID = list.id;
      this.countryPhoneId = list.id;
    }
  }

  NumberValid(evt) {
    let charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 37 && charCode != 39 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }

  negetiveNumberValidation(evt, type, val) {
    let validated = false;
    const negetiveRegex: RegExp = /^-?[0-9]\d*(\.\d+)?$/
    if (negetiveRegex.test(val)) {
      validated = true;
    } else {
      validated = false;
    }
    return validated;
  }

  saveButtonTriggerCheck() {
    this._dataService.saveButtonTrigger.subscribe((res) => {
      if (res) {
        if (this.qualityChecked || this.trackingChecked) {
          this.bookingInfo = this._dataService.getBookingData()
          this.submitIOTParams()
        }
      }
    })
  }

  setCityCountry() {
    this._dropdownservice.getCountry().subscribe((res: any) => {
      let List: any = res;
      List.map(obj => {
        obj.desc = JSON.parse(obj.desc);
      });
      this.countryList = List;
      this.flag(this.city, "city");
    })
    // this._dropdownservice.getCity().subscribe((res) => {
    //   this.cityList = res;
    // })
  }

  async getPriceBreakDown() {
    let paramsObject: any[] = []
    if (this.searchCriteria.SearchCriteriaContainerDetail && this.searchCriteria.SearchCriteriaContainerDetail.length > 0) {
      paramsObject = this.searchCriteria.SearchCriteriaContainerDetail
      if (!this.searchCriteria.SearchCriteriaContainerDetail[0].contRequestedQty) {
        let conDetails: any[] = this.searchCriteria.SearchCriteriaContainerDetail
        paramsObject = []
        conDetails.forEach(elem => {
          let temp = {
            contSpecID: elem.ContainerSpecID,
            contRequestedQty: elem.BookingContTypeQty,
          }
          paramsObject.push(temp)
        })
      }
    }
    const { TransportMode, imp_Exp, containerLoad, pickupPortType, deliveryPortType, CustomerID, CustomerType } = this.searchCriteria
    const params = {
      imp_Exp,
      pickupPortType,
      deliveryPortType,
      customerID: CustomerID,
      customerType: CustomerType,
      PortJsonData: '[]',
      bookingReferenceIDs: this.bookingInfo.IDlist,
      shippingMode: TransportMode,
      SearchCriteriaContainerDetail: paramsObject
    };

    if (HashStorage) {
      try {
        let res: JsonResponse
        if (this.searchCriteria.searchMode.toLowerCase() === 'air-lcl' || this.searchCriteria.searchMode.toLowerCase() === 'sea-fcl') {
          res = await this._searchService.getPriceDetails(params).toPromise()
        } else if (this.searchCriteria.searchMode === 'truck-ftl') {
          res = await this._searchService.getTruckPriceDetails(params).toPromise()
        } else if (this.searchCriteria.searchMode === 'sea-lcl') {
          res = await this._searchService.getLCLPriceDetails(params).toPromise()
        }
        if (res.returnId === 1) {
          loading(false);
          if (JSON.parse(res.returnText).length > 0) {
            let priceDetaisl: PriceDetail[] = JSON.parse(res.returnText);
            priceDetaisl = this._currencyControl.applyCurrencyRateOnBookingPriceDetails(priceDetaisl)
          }
          // this.bookingInfo.BookingPriceDetail = priceDetaisl;
          // this._dataService.setBookingsData(this.bookingInfo)
          loading(false);
        } else {
          loading(false);
          this._toast.error(res.returnText, 'Failed');
        }
      } catch{
        loading(false);
      }
    }
  }

  public totalTrackingContainers
  public totalQualityContainers = 0;
  public combinedContainersCount = 0;
  calculateTrakingQualityContainers() {
    this.trackingContainers = this.searchCriteria.SearchCriteriaContainerDetail.filter(e => e.IsTrackingApplicable)
    this.qualityContainers = this.searchCriteria.SearchCriteriaContainerDetail.filter(e => e.IsQualityApplicable)
    if (this.qualityContainers > 0) {
      this.isQalityChangeable = true
    }
    let totalTrackingCont = []
    let totalQualityCont = []
    let allContainers = []
    if (this.trackingContainers.length) {
      this.trackingContainers.forEach(element => {
        totalTrackingCont.push(element.contRequestedQty);
      });
      this.totalTrackingContainers = totalTrackingCont.reduce((all, item) => {
        return all + item;
      });
    }

    if (this.qualityContainers.length) {
      this.qualityContainers.forEach(element => {
        totalQualityCont.push(element.contRequestedQty);
      });
      this.totalQualityContainers = totalQualityCont.reduce((all, item) => {
        return all + item;
      });
    }


    this.searchCriteria.SearchCriteriaContainerDetail.forEach(e => {
      allContainers.push(e.contRequestedQty)
    })
    this.combinedContainersCount = allContainers.reduce((all, item) => {
      return all + item;
    })
  }

  onContainerChange($event: number, from: string) {

    const { exchnageRate } = this
    if ($event && $event > 0) {
      this.isQalityChangeable = true
      this.providerVasList.forEach(vas => {
        this.setQualityAmount(vas, exchnageRate, $event)
      })
      if (from === 'change') {
        this.addTrackingQality(false, 'QLTY')
        this.addTrackingQality(true, 'QLTY')
      }
    } else {
      this.providerVasList.forEach(vas => {
        this.setQualityAmount(vas, exchnageRate, 1)
      })
      this.addTrackingQality(false, 'QLTY', 'nothing')
    }
  }

  onContainerInputChange($text: number) {
    if ($text && $text >= 1000 && (this.searchCriteria.searchMode === 'warehouse-lcl' || this.searchCriteria.searchMode === 'sea-lcl')) {
      this.userInpContainers = 1000
      $text = 1000
    }
    this.modelChanged.next($text);
  }


  onKeypress(event, name?) {
    let charCode = (event.which) ? event.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    if (event.target && event.target.valueAsNumber && event.target.valueAsNumber >= 1000) {
      return false
    }
  }


  ngOnDestroy() {

  }

}


interface CurrencyData {
  currencyCode: string;
  currencyId: number
}
