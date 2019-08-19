import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { QualityMonitoringAlertData, QaualitMonitorResp } from '../../../interfaces/view-booking.interface';
import { removeDuplicates } from '../../../constants/globalfunctions';
import { PaginationInstance } from 'ngx-pagination';

@Component({
  selector: 'app-view-booking-table',
  templateUrl: './view-booking-table.component.html',
  styleUrls: ['./view-booking-table.component.scss']
})
export class ViewBookingTableComponent implements OnInit {

  @Input() type: string = 'a'
  @Output() onContainerDtlClicl = new EventEmitter<any>()
  @Input() monitorData: QaualitMonitorResp;
  containerList: Array<QualityMonitoringAlertData> = []

  @Input() secContainers: Array<QualityMonitoringAlertData> = []

  public config: PaginationInstance = {
    id: 'advanced2',
    itemsPerPage: 5,
    currentPage: 1
  };

  public labels: any = {
    previousLabel: '',
    nextLabel: '',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };


  constructor() { }

  ngOnInit() {
    if (this.type === 'a') {
      this.setA()
    } else {
      this.setB()
    }
  }

  setA() {
    if (this.monitorData && this.monitorData.AlertData) {
      const totalContainers = this.monitorData.AlertData
      const firstCopy = totalContainers.filter(cont => cont.GCoordinates && cont.GCoordinates.length > 0)
      const distinctContainers: Array<QualityMonitoringAlertData> = removeDuplicates(firstCopy, 'ContainerNo')

      distinctContainers.forEach(container => {

        //get coordinates
        if (!container.GCoordinates || (container.GCoordinates.length < 2)) {
          const coords = totalContainers.filter(cont => (cont.GCoordinates && cont.GCoordinates.length > 1))[0]
          if (coords && coords.GCoordinates && coords.GCoordinates.length > 0) {
            container.GCoordinates = coords.GCoordinates
          }
        }

        const contFilt = totalContainers.filter(tem => tem.ContainerNo === container.ContainerNo)
        const tempTotalCount = contFilt.reduce((a, b) => +a + +b.Temperature, 0);
        const avgTemp = tempTotalCount / contFilt.length
        container.TotalTemp = avgTemp
        container.TotalTempCount = contFilt.filter(cont => cont.Temperature !== null).length

        const humidTotalCount = contFilt.reduce((a, b) => +a + +b.Humidity, 0);
        const avgHumid = humidTotalCount / contFilt.length
        container.TotalHumid = avgHumid
        container.TotalHumidCount = contFilt.filter(cont => cont.Humidity !== null).length
      })

      this.containerList = distinctContainers
    }
  }

  setB() {

  }

  onDtlClick($containerNumber) {
    this.onContainerDtlClicl.emit($containerNumber)
  }

  getTotalPages(): number {
    const { type } = this
    if (type === 'a') {
      let temp: any = this.containerList
      try {
        return Math.ceil(temp.length / this.config.itemsPerPage)
      }
      catch (err) {
        return 0
      }
    } else {
      let temp: any = this.secContainers
      try {
        return Math.ceil(temp.length / this.config.itemsPerPage)
      }
      catch (err) {
        return 0
      }
    }
  }

  onPageChange(number: any) {
    this.config.currentPage = number;
  }


}
