import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { VendorProfileService } from '../../../components/vendor-profile/vendor-profile.service'
import { Tea, HashStorage, loading } from '../../../constants/globalfunctions';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {

  public review: any;
  public reviewLimit: number = 500;
  userItem: any;
  constructor(
    private _activeModal: NgbActiveModal,
    private _toast: ToastrService,
    private _vendorService: VendorProfileService
  ) { }

  ngOnInit() {
  }

  close() {
    this._activeModal.close();
  }

  submitReview() {
    this.userItem = JSON.parse(Tea.getItem('loginUser'));
    const providerObj = JSON.parse(HashStorage.getItem('selectedProvider'))
    const providerID = providerObj.ProviderID
    if (!this.review) {
      this._toast.error('Review cannot be empty', 'Error')
    } else if (this.review.length <= 500) {
      let obj = {
        reviewID: -1,
        reviewText: this.review,
        userID: this.userItem.UserID,
        reviewerName: this.userItem.FirstName + ' ' + this.userItem.LastName,
        reviewerCountry: this.userItem.CountryName,
        reviewFor: 'Provider',
        reviewForID: providerID,
        createdBy: this.userItem.LoginID,
        modifiedBy: ''
      }
      loading(true)
      this._vendorService.postReview(obj).subscribe(res => {
        let responseObj: any = res;
        this._activeModal.close(obj);
        this._toast.success(responseObj.returnText, 'Success')
      }, err => {
      })
      this.review = '';
      loading(false)
    } else if (this.review.length > 500) {
      this._toast.error('Review should not exceed more than 500 letters.', 'Error')
    }
  }

  onKeyPress(event) {
    if (this.review) {
    }
  }

  onKeyDown() {
  }
}
