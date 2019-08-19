import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { DataService } from '../../services/commonservice/data.service';
import { HashStorage, getProviderImage, ImageSource, ImageRequiredSize, getImagePath, loading, Tea } from '../../constants/globalfunctions';
import { ShippingArray } from '../../interfaces/shipping.interface';
import { PagesService } from '../pages.service';
import { HttpErrorResponse } from '@angular/common/http';
import { VendorProfileService } from './vendor-profile.service'
import { ActivatedRoute, Router } from '@angular/router';
import { ShippingService } from '../main/shipping/shipping.service';
import { ToastrService } from 'ngx-toastr';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'app-vendor-profile',
  templateUrl: './vendor-profile.component.html',
  styleUrls: ['./vendor-profile.component.scss']
})
export class VendorProfileComponent implements OnInit, OnDestroy {
  public showSearchComponent: boolean = false;
  public mainImages
  public subImages
  public subSubImages
  public containers
  public providerResponse: any;
  public providerReviews: any;
  public responseObj: any = {}
  public searchCriteria: any;
  public showSearchHeader: boolean = false;
  public userItem:any = {};

  constructor(
    private renderer: Renderer2,
    private _router: Router,
    private _dataService: DataService,
    private _pagesService: PagesService,
    private _vendorService: VendorProfileService,
    private _shippingService: ShippingService,
    private route: ActivatedRoute,
    private _toast: ToastrService
  ) {
    this.route.params.pipe(untilDestroyed(this)).subscribe(params => {
      let param = parseInt(params.id);
      HashStorage.setItem('partnerId', params.id)
      this.getProviderInfo(params.id);
      this.getProviderReviews(param)
    });
  }

  ngOnInit() {
    this.renderer.addClass(document.body, 'bg-grey');
    this.renderer.removeClass(document.body, 'bg-white');
    this.renderer.removeClass(document.body, 'bg-lock-grey');
    this.userItem = JSON.parse(Tea.getItem("loginUser"));
    this.getShippingDetails();
    this.getPortDetails();
    this._dataService.closeBookingModal.pipe(untilDestroyed(this)).subscribe(res => {
      if (res) {
        this.showSearchHeader = true;
      }
    })
  }

  getShippingDetails() {
    if (HashStorage) {
      this.searchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'))
      this._pagesService.getShippingData(this.userItem.CustomerID, this.userItem.CustomerType).pipe(untilDestroyed(this)).subscribe((res: any) => {
        this.setShippingCriteria(res)
      }, (err: HttpErrorResponse) => {
      })
    }
  }

  getPortDetails() {
    loading(true)
    this._shippingService.getPortsData().pipe(untilDestroyed(this)).subscribe((res: any) => {
      loading(false)
      HashStorage.setItem('shippingPortDetails', JSON.stringify(res));
    }, (err: HttpErrorResponse) => {
    })
  }

  setShippingCriteria(res) {
    let result = JSON.parse(res.returnText);
    if (res.returnId === 1) {
      HashStorage.setItem('shippingCategories', JSON.stringify(result));
      try {
        this.setImages(result)
      } catch (error) {
      }
    }
  }

  async setImages(shipArray: ShippingArray[]) {
    let newMain = []
    let newSubImages = []
    let newSubSubImages = []
    let newContainers = []

    shipArray.forEach(ship => {
      newMain.push(ship.ShippingModeImage)
    })
    shipArray.forEach(ship => {
      if (ship.ShippingCriteriaCat && ship.ShippingCriteriaCat.length > 0) {
        ship.ShippingCriteriaCat.forEach(sub => {
          if (sub.ShippingCatImage) {
            newSubImages.push(sub.ShippingCatImage)
          } else {
            newSubImages.push('GeneralCargo.png')
          }
        })
      }
    })
    shipArray.forEach(ship => {
      if (ship.ShippingCriteriaCat && ship.ShippingCriteriaCat.length > 0) {
        ship.ShippingCriteriaCat.forEach(sub => {
          if (sub.ShippingCriteriaSubCat && sub.ShippingCriteriaSubCat.length > 0) {
            sub.ShippingCriteriaSubCat.forEach(subSub => {
              if (subSub.ShippingSubCatImage) {
                newSubSubImages.push(subSub.ShippingSubCatImage)
              } else {
                newSubSubImages.push('GeneralCargo.png')
              }
            })
          }
        })
      }
    })

    shipArray.forEach(ship => {
      if (ship.ShippingCriteriaCat && ship.ShippingCriteriaCat.length > 0) {
        ship.ShippingCriteriaCat.forEach(sub => {
          if (sub.ShippingCriteriaSubCat && sub.ShippingCriteriaSubCat.length > 0) {
            sub.ShippingCriteriaSubCat.forEach(subSub => {
              if (subSub.Containers && subSub.Containers.length > 0) {
                subSub.Containers.forEach(container => {
                  newContainers.push(container.ContainerSpecImage)
                })
              }
            })
          }
        })
      }
    })
    this.mainImages = newMain
    this.subImages = newSubImages
    this.subSubImages = newSubSubImages
    this.containers = newContainers
  }

  getProviderInfo(id) {
    this._vendorService.getProviderDetails(id).pipe(untilDestroyed(this)).subscribe((res: any) => {
      if (res.returnId > 0) {
        this.responseObj = res;
        this.providerResponse = this.responseObj.returnObject
        HashStorage.setItem('selectedProvider', JSON.stringify(this.providerResponse));
      } else {
        this._router.navigate(['home'])
        this._toast.info(res.returnText, 'Info')
      }
    }, err => {
    })
  }

  getProviderReviews(id) {
    this._vendorService.getProviderReviews(id).pipe(untilDestroyed(this)).subscribe(res => {
      this.responseObj = res;
      this.providerReviews = this.responseObj.returnObject;
    }, (err: HttpErrorResponse) => {
      const { message } = err
      console.log('cannot fetch provider reviews:', message);
    })
  }

  ngOnDestroy() {
    try {
      HashStorage.removeItem('partnerURL')
    } catch (error) { }
  }

}
