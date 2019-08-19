import { Component, OnInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HashStorage, encryptBookingID } from '../../../constants/globalfunctions';
import { BookingService } from '../../../components/booking-process/booking.service';

@Component({
  selector: 'app-price-logs',
  templateUrl: './price-logs.component.html',
  styleUrls: ['./price-logs.component.scss']
})
export class PriceLogsComponent implements OnInit {
  @Input() data: any;
  closeResult: string;
  public logs: any[] = []

  constructor(public _activeModal: NgbActiveModal, private _bookingService: BookingService) { }


  ngOnInit() {
    // if (this.data.logs.length) {
    //   this.logs = this.data.logs
    // } else {
    //   let id = encryptBookingID(this.data.booking.BookingID, this.data.booking.UserID, this.data.booking.ShippingModeCode)
    //   this._bookingService.getBookingSpecialLogs(id, 'USER').subscribe((res: any) => {
    //     console.log(res)
    //     this.logs = res.returnObject
    //   }, (err: any) => {
    //     console.log(err)
    //   })
    // }

    let id = encryptBookingID(this.data.booking.BookingID, this.data.booking.UserID, this.data.booking.ShippingModeCode)
    this._bookingService.getBookingSpecialLogs(id, 'USER').subscribe((res: any) => {
      console.log(res)
      this.logs = res.returnObject
    }, (err: any) => {
      console.log(err)
    })

  }

}
