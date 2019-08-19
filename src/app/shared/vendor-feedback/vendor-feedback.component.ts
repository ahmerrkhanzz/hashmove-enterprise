import { Component, OnInit, Renderer2, Input, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { VendorProfileService } from '../../components/vendor-profile/vendor-profile.service'
import { PagesService } from '../../components/pages.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DataService } from '../../services/commonservice/data.service';
import { HashStorage, Tea, loading } from '../../constants/globalfunctions';
import { LoginDialogComponent } from '../dialogues/login-dialog/login-dialog.component';
import { ReviewComponent } from '../dialogues/review/review.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { baseExternalAssets } from '../../constants/base.url';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';


@Component({
  selector: 'app-vendor-feedback',
  templateUrl: './vendor-feedback.component.html',
  styleUrls: ['./vendor-feedback.component.scss']
})
export class VendorFeedbackComponent implements OnInit, OnChanges {
  @Input() reviews: any;
  @Input() total: any;
  public reviewsArray: any = [];
  public carouselOne: NguCarouselConfig;
  public providerReviews: any;
  public responseObj: any = {}
  public userItem: any;
  public isAuthorizedUser: boolean = false;
  public userImagePath: string = '';


  constructor(
    private _vendorService: VendorProfileService,
    private _modalService: NgbModal,
    private _toast: ToastrService,
  ) { }

  ngOnInit() {
    setTimeout(() => {
      if (this.reviews && this.reviews.length) {
        this.setReviews()
      }
    }, 500);
    this.carouselOne = {
      grid: { xs: 1, sm: 3, md: 3, lg: 3, all: 0 },
      slide: 1,
      speed: 400,
      interval: { timing: 1000 },
      point: {
        visible: false
      },
      load: 2,
      touch: true,
      loop: false,
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.reviews) {
      this.setReviews()
    }
  }

  setReviews() {
    this.reviewsArray = this.reviews;
  }

  getUserImage(path) {
    return baseExternalAssets + path.replace('large', 'x-small');
  }
  submitReviewAction() {
    if (HashStorage) {
      this.userItem = JSON.parse(Tea.getItem('loginUser'));
      if (this.userItem && !this.userItem.IsLogedOut) {
        const providerObj = JSON.parse(HashStorage.getItem('selectedProvider'))
        const providerID = providerObj.ProviderID
        loading(true);
        this._vendorService.checkUserBooking(providerID, this.userItem.UserID).subscribe(res => {
          let responseObj: any = res;
          if (responseObj.returnId === 1) {
            this.isAuthorizedUser = true;
            loading(false);
            const modalRefReview = this._modalService.open(ReviewComponent, { size: 'lg', centered: true, });
            modalRefReview.result.then((result) => {
              if (result) {
                let reviewObj = {
                  ReviewerName: result.reviewerName,
                  CountryCode: this.userItem.CountryCode,
                  UserImage: this.userItem.UserImage,
                  ReviewText: result.reviewText
                }
                // this.reviews.unshift(reviewObj)
                this.reviewsArray.unshift(reviewObj)
                this.total.TotalReviews++;
              }
            });
          } else if (responseObj.returnId === 2) {
            loading(false);
            this._toast.info(responseObj.returnText, 'Info');
            this.isAuthorizedUser = false;
          }
        }, err => {
        })
      } else {
        const modalRef = this._modalService.open(LoginDialogComponent, { size: 'lg', centered: true, windowClass: 'small-modal' });
        modalRef.result.then((result) => {
          if (result) {
            this._toast.success('Logged in successfully.', 'Success');
          }
        });
      }
    }
  }
}
