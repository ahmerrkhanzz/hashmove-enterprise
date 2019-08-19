import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { getGreyIcon, getSearchCriteria, getTimeStr, removeDuplicates, HashStorage } from "../../../constants/globalfunctions";
import { TrackingMonitoring, Polyline, QualityMonitorGraphData, ViewBookingDetails, QaualitMonitorResp, QualityMonitoringAlertData } from '../../../interfaces/view-booking.interface';
import { SearchCriteria } from '../../../interfaces/searchCriteria';

@Component({
  selector: 'app-tracking-monitoring',
  templateUrl: './tracking-monitoring.component.html',
  styleUrls: ['./tracking-monitoring.component.scss']
})
export class TrackingMonitoringComponent implements OnInit, OnChanges, OnDestroy {

  @Input() data: ViewBookingDetails
  @Input() trackingData: TrackingMonitoring
  @Input() monitorData: QaualitMonitorResp
  @Input() isTracking: boolean
  @Input() isMonitoring: boolean
  @Input() isContDtl: boolean
  @Input() shouldTrackingOpen: boolean
  @Output() containerCallback = new EventEmitter<any>()
  container: QualityMonitoringAlertData

  pastRoutes: Array<Polyline> = []
  futureRoutes: Array<Polyline> = []
  currentLocation: Polyline
  containerList: QualityMonitoringAlertData[] = []

  public viewDetailStatus: boolean = false;
  searchCriteria: SearchCriteria

  constructor() { }

  ngOnInit() {
    this.searchCriteria = JSON.parse(this.data.JsonSearchCriteria)
    HashStorage.setItem('curr_mode', this.data.ShippingModeCode);
  }

  ngOnChanges() {
    if (this.trackingData) {
      this.setTracking()
    }
  }

  setTracking() {

  }


  getIcon($mode: string) {
    return getGreyIcon($mode)
  }

  onContainerClick($event: QualityMonitoringAlertData) {
    const { ContainerNo } = $event
    this.container = $event
    const { AlertData } = this.monitorData

    const filContainers = AlertData.filter(cont => cont.ContainerNo === ContainerNo)
    this.containerList = filContainers
    this.containerCallback.emit($event)
  }

  viewDetail($event: any) {
    this.viewDetailStatus = !this.viewDetailStatus;
  }


  getFlightTime(time: number) {
    return getTimeStr(time)
  }

  ngOnDestroy() {
    try {
      HashStorage.removeItem('curr_mode')
    } catch (error) { }
  }

}
