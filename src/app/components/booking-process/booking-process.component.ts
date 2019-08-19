import { Component, OnInit, AfterViewInit, ViewEncapsulation, Renderer2, ChangeDetectorRef } from '@angular/core';
import { HashStorage } from '../../constants/globalfunctions';
import { Router } from '@angular/router';
import { PreviousRouteService } from '../../services/commonservice/previous-route.service';
import { DataService } from '../../services/commonservice/data.service';
import { SearchCriteria } from '../../interfaces/searchCriteria';
import { ProviderVAS } from '../../interfaces/order-summary';
import { BookingService } from './booking.service';
import { BookingDetails } from '../../interfaces/bookingDetails';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { JsonResponse } from '../../interfaces/JsonResponse';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-booking-process',
  templateUrl: './booking-process.component.html',
  styleUrls: ['./booking-process.component.scss'],
  // encapsulation: ViewEncapsulation.None,
})
export class BookingProcessComponent implements OnInit {
  public IsInsured: boolean = false;
  public hidebooking = true;
  public previousRoute: string;
  public bookingInfo;
  public previousTab: string;

  public selectedTab: string;
  public activeOptional: string;
  parentMessage = "message from parent";
  public activeIdString = 'tab-optional-services'
  public searchCriteria: SearchCriteria;
  public providerVasList: Array<ProviderVAS>
  public orderSummary: BookingDetails;

  public disableTrackingTab: boolean = true
  public disableOptionalTab: boolean = true
  public disabledDepartTab: boolean = true;
  public disablePaymentTab: boolean = true
  public showDepartureTab = true;


  constructor(
    private renderer: Renderer2,
    private _router: Router,
    private _previousRouteService: PreviousRouteService,
    private cdRef: ChangeDetectorRef,
    private _dataService: DataService,
  ) {
  }

  ngOnInit() {
    this.disablePaymentTab = true
    if (!HashStorage) {
      this._router.navigate(['enable-cookies']);
      return
    }
    this.searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'));
    this.renderer.addClass(document.body, 'bg-grey');
    this.renderer.removeClass(document.body, 'bg-white');
    this.renderer.removeClass(document.body, 'bg-lock-grey');
    this.disableTrackingTab = false

    if (this.searchCriteria.searchMode === 'sea-lcl' || this.searchCriteria.searchMode === 'warehouse-lcl') {
      this.showDepartureTab = true;
    }
    // this.bookingInfo = JSON.parse(HashStorage.getItem('bookingInfo'));
    this.bookingInfo = this._dataService.getBookingData()
    if (this.searchCriteria.searchMode === 'air-lcl') {
      this.tabChange('tab-optional-services')
    } else {
      this.activeIdString = 'tab-tracking';
    }
  }


  receiveMessage($event) {
    this.hidebooking = !this.hidebooking;
  }

  receiveInsured(event) {
    this.IsInsured = event;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  receiveOptional(event) {
    let elem = document.getElementById('tab-departure-date');
    this.selectedTab = event;
    if (event === 'optional') {
      this.activeIdString = 'tab-optional-services';
      this.disableOptionalTab = false
    } else if (event === 'departure-tab') {
      this.activeIdString = 'tab-departure-date';
      this.disabledDepartTab = false
    } else if (event === 'tab-billing') {
      this.activeIdString = 'tab-billing';
      this.disablePaymentTab = false;
    }
  }

  receiveDeparture() {
    // this.activeIdString = 'tab-optional-services';
  }

  onTabChange($change: NgbTabChangeEvent) {
    const { nextId } = $change
    this.tabChange(nextId)
  }

  tabChange(id: string) {
    if (id === 'tab-departure-date') {
      this.resetTabClass(id)
      this.activeIdString = id
    } else if (id === 'tab-optional-services') {
      this.resetTabClass(id)
      this.activeIdString = id
    } else if (id === 'tab-billing') {
      this.resetTabClass(id)
      this.activeIdString = id
    } else if (id === 'tab-tracking') {
      this.resetTabClass(id)
      this.activeIdString = id
    }
  }

  resetTabClass($tab_id: string) {
    if ($tab_id === 'tab-tracking') {
      this.disableTrackingTab = false
      this.disableOptionalTab = true
      this.disabledDepartTab = true
      this.disablePaymentTab = true
    }

    if ($tab_id === 'tab-optional-services') {
      this.disableTrackingTab = false
      this.disableOptionalTab = false
      this.disabledDepartTab = true
      this.disablePaymentTab = true
    }

    if ($tab_id === 'tab-departure-date') {
      this.disableTrackingTab = false
      this.disableOptionalTab = false
      this.disabledDepartTab = false
      this.disablePaymentTab = true
    }

    if ($tab_id === 'tab-billing') {
      this.disableTrackingTab = false
      this.disableOptionalTab = false
      this.disabledDepartTab = false
      this.disablePaymentTab = false
    }

  }

  updateProviderVASList($pVasList) {
    if ($pVasList) {
      this.providerVasList = $pVasList
    }
  }

}
