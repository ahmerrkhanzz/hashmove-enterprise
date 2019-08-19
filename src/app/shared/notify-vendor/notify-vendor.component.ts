import { Component, OnInit, OnDestroy } from '@angular/core';
import { HashStorage, loading, Tea } from '../../constants/globalfunctions';
import { SearchCriteria } from '../../interfaces/searchCriteria';
import { ShippingService } from '../../components/main/shipping/shipping.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notify-vendor',
  templateUrl: './notify-vendor.component.html',
  styleUrls: ['./notify-vendor.component.scss']
})
export class NotifyVendorComponent implements OnInit, OnDestroy {

  public searchCriteria: SearchCriteria
  public loginObj: any
  public showComponent: boolean = false
  constructor(
    private _shippingService: ShippingService,
    private _toast: ToastrService
  ) { }

  ngOnInit() {
    this.searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))
    this.loginObj = JSON.parse(Tea.getItem('loginUser'));
    console.log(HashStorage.getItem('preferredProviders'))
    const providers = JSON.parse(HashStorage.getItem('preferredProviders'))
    if (providers) {
      this.showComponent = true
    }
    console.log(this.loginObj)
  }


  /**
   *
   * SEND NOTIFICATION TO VENDOR
   * @memberof NotifyVendorComponent
   */
  notify() {
    loading(true);
    const { CustomerID, CustomerType, loggedID } = this.searchCriteria
    const { FirstName, LastName, UserCompanyName, PrimaryEmail } = this.loginObj
    let obj = {
      CustomerID: CustomerID,
      CustomerType: CustomerType,
      JSONSearchCriteria: JSON.stringify(this.searchCriteria),
      LoginUserID: loggedID,
      userName: FirstName + LastName,
      companyName: UserCompanyName,
      email: PrimaryEmail
    }
    this._shippingService.notifyCustomer(obj).pipe(untilDestroyed(this)).subscribe((res: any) => {
      loading(false);
      this._toast.success(res.returnText, 'Success')
    }, (err: any) => {
      loading(false);
    })
  }

  ngOnDestroy() {

  }

}
