import { Component, OnInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { encryptBookingID, feet2String } from '../../../constants/globalfunctions';
import { UserService } from '../../../components/user/user-service';

@Component({
  selector: 'app-cargo-details',
  templateUrl: './cargo-details.component.html',
  styleUrls: ['./cargo-details.component.scss']
})
export class CargoDetailsComponent implements OnInit {
  @Input() data: any
  public containers:any[] = []
  constructor(public _activeModal: NgbActiveModal, private _usersService: UserService) {}



  close(){
    this._activeModal.close()
  }

  
  ngOnInit() {
    this.getContainerDetails()
  }

  getContainerDetails() {
    let id = encryptBookingID(this.data.BookingID, this.data.UserID, this.data.ShippingModeCode);
    this._usersService.getContainerDetails(id, 'CUSTOMER').subscribe((res: any) => {
      this.containers = res.returnObject
    }, (err) => {
      console.log(err)
    })
  }

  getContainerInfo(container) {
    let containerInfo = {
      containerSize: undefined,
      containerWeight: undefined
    };
    containerInfo.containerWeight = container.MaxGrossWeight;
    containerInfo.containerSize =
      feet2String(container.containerLength) +
      ` x ` +
      feet2String(container.containerWidth) +
      ` x ` +
      feet2String(container.containerHeight);
    return containerInfo;
  }

}
