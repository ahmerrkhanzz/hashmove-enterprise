import { Component, OnInit } from '@angular/core';
import { getImagePath, ImageSource, ImageRequiredSize, HashStorage } from '../../constants/globalfunctions';
import { DataService } from '../../services/commonservice/data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UpdatePasswordComponent } from '../../shared/dialogues/update-password/update-password.component';
import { GuestService } from '../../shared/setup/jwt.injectable';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  public customerSettings: any = {}
  headingColor: string = '#ffffff'

  public isLogin: boolean = true

  constructor(
    private _dataSerive: DataService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.customerSettings = JSON.parse(HashStorage.getItem('customerSettings'))
    if (GuestService.GET_CUST_PROFILE_ID() === 'engro') {
      this.headingColor = '#3f5165'
    } else {
      this.headingColor = '#ffffff'
    }

    if (this._dataSerive.getUpdatePassCode() && this._dataSerive.getUpdatePassCode().length > 0) {
      this.updatePasswordModal()
    }
  }

  getUIImage($image: string) {
    return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
  }

  updatePasswordModal() {
    const modalRef = this.modalService.open(UpdatePasswordComponent, {
      size: "lg",
      centered: true,
      windowClass: "small-modal",
      backdrop: "static",
      keyboard: false
    });

    setTimeout(() => {
      if (
        document
          .getElementsByTagName("body")[0]
          .classList.contains("modal-open")
      ) {
        document.getElementsByTagName("html")[0].style.overflowY = "hidden";
      }
    }, 0);
  }

  compEventListener($event: string) {
    if ($event === 'f_pass') {
      this.isLogin = false
    } else if ($event === 'login') {
      this.isLogin = true
    }
  }

}
