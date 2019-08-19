import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-container-info',
  templateUrl: './container-info.component.html',
  styleUrls: ['./container-info.component.scss']
})
export class ContainerInfoComponent implements OnInit {

  @Input() containerDetails: any
  public totalCount: number = 0
  constructor(
    public _activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
    if (this.containerDetails.BookingContainerDetail.length > 1) {
      this.totalCount = this.containerDetails.BookingContainerDetail.reduce((a, b) => a.BookingContTypeQty + b.BookingContTypeQty)
    } else {
      this.totalCount = this.containerDetails.BookingContainerDetail[0].BookingContTypeQty
    }
  }

  close() {
    this._activeModal.close()
  }

  public isValidated: boolean = true
  saveContainer = () => {
    // let bookingContainers = []
    // this.isValidated = true
    // this.containerDetails.BookingContainerDetail.forEach(element => {
    //   element.JsonContainerInfo = JSON.stringify(element.parsedJsonContainerInfo)
    //   let obj = {
    //     containerSpecID: element.ContainerSpecID,
    //     jsonContainerInfo: element.JsonContainerInfo
    //   }
    //   bookingContainers.push(obj)
    // });
    // if (!this.isValidated) {
    //   return false;
    // }
    // let obj = {
    //   bookingID: this.containerDetails.BookingID,
    //   bookingContainers: [...bookingContainers]
    // }
    // this._viewBookingService.saveContainerDetails(obj).subscribe((res: any) => {
    //   this._toastr.warning('The container number must correspond to the ISO-Container Standard of 11 characters', 'Warning')
    //   this._activeModal.close()
    // }, (err: any) => {
    //   this._activeModal.close()
    // })
  }

}
