import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { SearchResult } from '../../../interfaces/searchResult';
import { BookingService } from '../booking.service';
import { IHelpSupport } from '../../../interfaces/order-summary';
import { Router } from '@angular/router';
import { HashStorage, Tea, encryptBookingID, getTotalContainerWeight } from '../../../constants/globalfunctions';
import { BookingDetails } from '../../../interfaces/bookingDetails';
import { PlatformLocation } from '@angular/common';
import { DataService } from '../../../services/commonservice/data.service';
import { SearchCriteria } from '../../../interfaces/searchCriteria';


@Component({
  selector: 'app-thankyou-page',
  templateUrl: './thankyou-page.component.html',
  styleUrls: ['./thankyou-page.component.scss']
})
export class ThankyouPageComponent implements OnInit, OnDestroy {

  public orderSummary: BookingDetails;
  public searchCriteria: any;
  helpSupport: IHelpSupport;
  public bookingRef;
  resp: any
  HelpDataLoaded: boolean = false
  public showThankYouPage: boolean = false;
  public firstName: string;
  public lastName: string;
  public totalCBM: number = 0
  public totalWeight: number = 0
  TransportMode = ''


  prefferdLogos =
    [
      {
        ImageUrl: '../../../../assets/images/logos/shippping-lines/CmaCgm.png'
      },
      {
        ImageUrl: '../../../../assets/images/logos/shippping-lines/COSCO.png'
      },
      {
        ImageUrl: '../../../../assets/images/logos/shippping-lines/EverGreen.png'
      }
    ];


  public showTick = false;
  public containersQty: number;
  public warehouseData: any;
  public dateToShow: string;


  constructor(
    private bookingService: BookingService,
    private _router: Router,
    private location: PlatformLocation,
    private renderer: Renderer2,
    private _dataService: DataService

  ) {
    location.onPopState(() => {
      localStorage.removeItem('searchCriteria');
      localStorage.removeItem('searchResult');
      localStorage.removeItem('selectedCarrier');
      localStorage.removeItem('bookingInfo');
      try {
        localStorage.removeItem('insuranceProviders');
      } catch (error) { }
      this._dataService.setBookingsData(null)
    });
  }

  ngOnInit() {
    this.renderer.addClass(document.body, 'bg-grey');
    this.renderer.removeClass(document.body, 'bg-white');
    this.renderer.removeClass(document.body, 'bg-lock-grey');
    localStorage.removeItem('taxObj')
    this.setDepartureDate()
    this.searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))
    this.TransportMode = this.searchCriteria.TransportMode
    if (HashStorage) {
      this.orderSummary = this._dataService.getBookingData()
      this.getSearchCriteria();
      this.bookingRef = JSON.parse(localStorage.getItem('bookinRef'));
      let loginInfo = JSON.parse(Tea.getItem('loginUser'));
      this.firstName = loginInfo.FirstName;
      this.lastName = loginInfo.LastName;
    }

    const { containerLoad, searchMode, totalChargeableWeight } = this.searchCriteria
    if (searchMode !== 'warehouse-lcl') {
      if (containerLoad.toLowerCase() === 'lcl') {
        this.searchCriteria.SearchCriteriaContainerDetail.forEach(container => {
          const { contRequestedCBM, } = container
          if (contRequestedCBM) {
            this.totalCBM += container.contRequestedCBM
          }
        })
        // this.totalCBM = Math.ceil(this.totalCBM)
        const { totalShipmentCMB } = this.searchCriteria
        this.totalCBM = totalShipmentCMB

        if (searchMode === 'air-lcl') {
          this.totalWeight = totalChargeableWeight
        }
      }
    }


    this.bookingService.getHelpSupport(true).subscribe(res => {
      this.resp = res
      if (this.resp.returnId > 0) {
        this.helpSupport = JSON.parse(this.resp.returnText)
        this.HelpDataLoaded = true
      }
    })
  }

  ngOnDestroy() {
    localStorage.removeItem('searchCriteria');
    localStorage.removeItem('selectedCarrier');
    localStorage.removeItem('providerSearchCriteria');
    try {
      localStorage.removeItem('bookinRef');
    } catch (error) { }
  }

  getSearchCriteria() {
    try {
      if (this.orderSummary.ContainerLoad === 'LCL' && this.orderSummary.ShippingModeCode !== 'AIR') {
        this.orderSummary.BookingContainerDetail.forEach(obj => {
          this.containersQty += Number(obj.BookingPkgTypeCBM)
        })
      }
    } catch (error) {
      this.containersQty = 0
    }
  }

  tickToggle() {
    this.showTick = !this.showTick;
  }

  viewBookingDetails(bookingRefID, userId, transModeCode) {
    const safeBookingId = encryptBookingID(bookingRefID, userId, transModeCode)
    this._router.navigate(['/user/booking-detail', safeBookingId]);
  }

  setDepartureDate() {
    // if (this.searchCriteria.containerLoad.toLowerCase() === 'lcl' && transportMode.includes('sea')) {
    //   this.dateToShow = this.this.searchCriteria.pickupDate
    // } else {
    //   this.dateToShow = bookingDetails.EtaLcl
    // }

  }


}
