import { Component, OnInit } from '@angular/core';
import { SearchCriteria } from '../../../../interfaces/searchCriteria';
import { HashStorage } from '../../../../constants/globalfunctions';
import { DataService } from '../../../../services/commonservice/data.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { BookingDetails, PriceDetail } from '../../../../interfaces/bookingDetails';
import { CurrencyControl } from '../../../../shared/currency/currency.injectable';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss']
})
export class OrderSummaryComponent implements OnInit {

  public searchCriteria: SearchCriteria
  public containterQty: number = 0
  public selectedCarrier: any
  public bookingDetails: BookingDetails
  public isInsured: boolean = false
  public totalCBM: number = 0;
  public totalChargeableWeight: number = 0;
  public orderLabel: any = {
    label: 'Containers',
    unit: ''
  }

  public transportMode: string = 'SEA'
  public totalAmount: number = 0
  public dateToShow: string

  public isTracking: boolean = false
  public isQality: boolean = false

  constructor(
    private _dataService: DataService,
    private _currencyControl: CurrencyControl
  ) { }

  ngOnInit() {
    this._dataService.dataBookingsSource.subscribe(res => {
      if (res) {
        this.bookingDetails = res
        const { BookingContainerDetail } = this.bookingDetails
        const { IsInsured } = this.bookingDetails
        this.isInsured = IsInsured
        if (BookingContainerDetail) {
          BookingContainerDetail.forEach(containerDtl => {
            this.isTracking = containerDtl.IsTrackingRequired
            this.isQality = containerDtl.IsQualityMonitoringRequired
          });
        }
      }
    })

    this._dataService.totalBookingAmount.subscribe(res => {
      if (res) {
        this.totalAmount = res
      }
    })
    this.searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))
    this.selectedCarrier = JSON.parse(HashStorage.getItem('selectedCarrier'))
    this.transportMode = this.searchCriteria.SearchCriteriaTransportationDetail[0].modeOfTransportCode.toLowerCase()

    this.setDepartureDate()
    const { SearchCriteriaContainerDetail, searchMode } = this.searchCriteria
    if (SearchCriteriaContainerDetail && SearchCriteriaContainerDetail.length > 0) {
      SearchCriteriaContainerDetail.forEach(container => {
        if (this.bookingDetails.ContainerLoad.toLowerCase() === 'fcl' || searchMode === 'truck-ftl') {
          this.containterQty += container.contRequestedQty
          if (searchMode === 'truck-ftl') {
            this.orderLabel = {
              label: 'Trucks',
              unit: ''
            }
          }
        } else if (this.bookingDetails.ContainerLoad.toLowerCase() === 'lcl') {
          if (searchMode === 'air-lcl') {
            this.orderLabel = {
              label: 'Chargeable Weight',
              unit: 'KG'
            }
            let x: number = (container.contRequestedWeight > container.volumetricWeight) ? container.contRequestedWeight : container.volumetricWeight;
            x = this._currencyControl.applyRoundByDecimal(x, 2)
            this.totalChargeableWeight += x;
          } else if (searchMode === 'sea-lcl') {
            this.totalCBM += container.contRequestedCBM
            this.orderLabel = {
              label: 'Shipment Size',
              unit: 'CBM'
            }
            const { totalShipmentCMB } = this.searchCriteria
            // this.totalCBM = Math.ceil(this.totalCBM)
            this.totalCBM = totalShipmentCMB
          }
        }
      })
    } else if (this.searchCriteria.searchMode === 'air-lcl') {
      console.log('yolo');
      this.totalChargeableWeight = this.searchCriteria.chargeableWeight
      this.orderLabel = {
        label: 'Chargeable Weight',
        unit: 'KG'
      }
    }
  }


  setDepartureDate() {
    const { bookingDetails, searchCriteria, transportMode } = this
    const { searchMode } = this.searchCriteria

    if (searchMode === 'sea-lcl' || searchMode === 'truck-ftl') {
      this.dateToShow = searchCriteria.pickupDate
    } else {
      this.dateToShow = bookingDetails.EtdUtc
    }

  }

}

