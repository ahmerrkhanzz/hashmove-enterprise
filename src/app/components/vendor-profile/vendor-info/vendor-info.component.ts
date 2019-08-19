import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { BookingDialogueComponent } from '../booking-dialogue/booking-dialogue.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { getProviderImage, ImageRequiredSize, ImageSource, getImagePath, HashStorage } from '../../../constants/globalfunctions';
import { GeneralService } from '../../../shared/setup/general.injectable';
import { Router } from '@angular/router';
@Component({
  selector: 'app-vendor-info',
  templateUrl: './vendor-info.component.html',
  styleUrls: ['./vendor-info.component.scss']
})
export class VendorInfoComponent implements OnInit {
  @Input() info: any;
  @Input() type: string;
  public modalReference: any;
  public closeResult: string;
  public searchCriteria: any;
  public baseURL: string;
  public hasWarehouse: boolean = false
  constructor(
    private _modalService: NgbModal,
    private _generalService: GeneralService,
    private _router: Router,
  ) { }

  ngOnInit() {
    this.baseURL = location.href;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (typeof changes.info.currentValue === 'object') {
      if (changes.info.currentValue.LogisticServices) {
        changes.info.currentValue.LogisticServices.forEach(element => {
          if (element.LogServName === 'Warehousing') {
            this.hasWarehouse = true
          }
        });
      }
    }
  }

  openBooking(type: string) {
    const modalReference = this._modalService.open(BookingDialogueComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'booking-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalReference.componentInstance.type = type
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }

  getProviderImage($image: string) {
    const providerImage = getProviderImage($image)
    return getImagePath(ImageSource.FROM_SERVER, providerImage, ImageRequiredSize.original)
  }

  shareShippingInfo($carrier, $provider, $unq, totalDays?, page?) {
    $provider.baseURL = this.baseURL;
    if (page === 'search') {
      $provider.vendor = true;
    }
    this._generalService.shareLclShippingAction(null, null, $provider)
  }

}
