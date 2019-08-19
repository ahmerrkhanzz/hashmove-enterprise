import { Component, OnInit, Input, Renderer2, ElementRef, Provider, ViewChild } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EMAIL_REGEX, ValidateEmail, Tea, HashStorage, getSearchCriteria } from '../../../constants/globalfunctions';
import { SearchResultService } from '../../../components/search-results/fcl-search/fcl-search.service';
// import { ShareShippingInfo } from '../../../interfaces/share-shipping-info';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ToastrService } from 'ngx-toastr';
import { SearchResult } from '../../../interfaces/searchResult';
import { SearchCriteria } from '../../../interfaces/searchCriteria';
import { Router } from '@angular/router';




@Component({
  selector: 'app-shareshipping',
  templateUrl: './shareshipping.component.html',
  styleUrls: ['./shareshipping.component.scss']
})
export class ShareshippingComponent implements OnInit {

  @Input() shareObjectInfo: any;
  @ViewChild('shareURL') shareURL: ElementRef
  public fromVendor: boolean = false;
  private PolCode: string = ''
  private PodCode: string = ''
  public info: any;
  shareDetailForm;
  loginUser;
  toemailError;
  fromemailError;
  noteError;
  subjectError;
  loading;
  public selectedProvider: any = {};
  constructor(
    private _activeModal: NgbActiveModal,
    private _renderer: Renderer2,
    private el: ElementRef,
    private _toast: ToastrService,
    private _searchResult: SearchResultService,
    private location: PlatformLocation,
    private _router: Router
  ) {
    location.onPopState(() => this.closeModal());
  }
  ngOnInit() {
    this.loginUser = JSON.parse(Tea.getItem('loginUser'));
    // this.selectedProvider = JSON.parse(HashStorage.getItem('selectedProvider'))
    // this.shareDetailForm = new FormGroup({
    //   toEmail: new FormControl(null, [
    //     Validators.required,
    //     Validators.pattern(EMAIL_REGEX),
    //     Validators.maxLength(320)
    //   ]),
    //   fromEmail: new FormControl(null, [
    //     Validators.required,
    //     Validators.pattern(EMAIL_REGEX),
    //     Validators.maxLength(320)
    //   ]),
    //   subject: new FormControl('', [Validators.required, Validators.maxLength(200)]),
    //   note: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
    // });
    // if (this.shareObjectInfo.provider.vendor) {
    //   this.fromVendor = true;
    // } else {
    //   this.fromVendor = false;
    //   this.setPolPodCode()
    // }


    // if (this.loginUser && !this.loginUser.IsLogedOut && this.loginUser.UserID) {

    //   var input = this.el.nativeElement.querySelector('input.fromEmail');
    //   this._renderer.setAttribute(input, 'readonly', 'true');
    //   if (this._router.url.includes('partner')) {
    //     this.info = "Partner URL: " + this.shareObjectInfo.provider.baseURL;
    //   } else if (this.fromVendor) {
    //     let url: string;
    //     if (this.shareObjectInfo.provider.baseURL.includes('fcl-search')) {
    //       url = this.shareObjectInfo.provider.baseURL.split('fcl-search/shipping-lines')
    //     } else if (this.shareObjectInfo.provider.baseURL.includes('air')) {
    //       url = this.shareObjectInfo.provider.baseURL.split('air/air-lines')
    //     }
    //     this.info = "Partner URL: " + url[0] + "partner/" + this.selectedProvider.ProfileID;
    //   } else {
    //     const { searchMode } = getSearchCriteria()
    //     if (this.shareObjectInfo.carrier.hasOwnProperty('BookingPriceDetail')) {
    //       this.info = "HashMove: Booking details for " + this.PolCode + " -> " + this.PodCode + " by " + this.loginUser.FirstName + " " + this.loginUser.LastName;
    //     } else if (searchMode === 'warehouse-lcl') {
    //       this.info = "HashMove: Warehouse prices for " + this.shareObjectInfo.provider.ProviderName + " by " + this.loginUser.FirstName + " " + this.loginUser.LastName;
    //     } else {
    //       this.info = "HashMove: Freight prices for " + this.PolCode + " -> " + this.PodCode + " by " + this.loginUser.FirstName + " " + this.loginUser.LastName;
    //     }
    //   }

    //   this.shareDetailForm.controls.fromEmail.value = this.loginUser.PrimaryEmail;
    //   this.shareDetailForm.controls.subject.value = this.info;
    //   this.shareDetailForm.controls.note.value = this.info;
    // }
    // else if (!this.loginUser || (this.loginUser && this.loginUser.IsLogedOut)) {
    //   if (this._router.url.includes('partner')) {
    //     this.info = "Partner URL: " + this.shareObjectInfo.provider.baseURL;
    //   } else if (this.fromVendor) {
    //     let url: string;
    //     if (this.shareObjectInfo.provider.baseURL.includes('fcl-search')) {
    //       url = this.shareObjectInfo.provider.baseURL.split('fcl-search/shipping-lines')
    //     } else if (this.shareObjectInfo.provider.baseURL.includes('air')) {
    //       url = this.shareObjectInfo.provider.baseURL.split('air/air-lines')
    //     }
    //     this.info = "Partner URL: " + url[0] + "partner/" + this.selectedProvider.ProfileID;
    //   } else {
    //     const { searchMode } = getSearchCriteria()
    //     if (this.shareObjectInfo.carrier.hasOwnProperty('BookingPriceDetail')) {
    //       this.info = "HashMove: Booking details for " + this.PolCode + " -> " + this.PodCode
    //     } else if (this.shareObjectInfo.provider && this.shareObjectInfo.provider.ProviderName && searchMode === 'warehouse-lcl') {
    //       this.info = "HashMove: Warehouse prices for " + this.shareObjectInfo.provider.ProviderName
    //     } else {
    //       this.info = "HashMove: Freight prices for " + this.PolCode + " -> " + this.PodCode
    //     }
    //   }

    //   this.shareDetailForm.controls.subject.value = this.info;
    //   this.shareDetailForm.controls.note.value = this.info;
    // }
  }
  // errorMessages() {
  //   if (this.shareDetailForm.controls.toEmail.status == "INVALID" && this.shareDetailForm.controls.toEmail.touched) {
  //     this.toemailError = true;
  //   }
  //   if (this.shareDetailForm.controls.fromEmail.status == "INVALID" && this.shareDetailForm.controls.fromEmail.touched) {
  //     this.fromemailError = true;
  //   }

  //   if (this.shareDetailForm.controls.subject.status == "INVALID" && this.shareDetailForm.controls.subject.touched) {
  //     this.subjectError = true;
  //   }
  //   if (this.shareDetailForm.controls.note.status == "INVALID" && this.shareDetailForm.controls.note.touched) {
  //     this.noteError = true;
  //   }



  // }
  // closeModal() {
  //   this._activeModal.close();
  //   document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  // }
  // shareInfo(data) {
  //   const { shareObjectInfo } = this
  //   this.loading = true;
  //   let validToemail: boolean = ValidateEmail(data.toEmail);
  //   let validFromemail: boolean = ValidateEmail(data.fromEmail);
  //   if (this.shareDetailForm.invalid) {
  //     this.loading = false;
  //     return;
  //   }
  //   else if (!validToemail) {
  //     this.loading = false;
  //     this._toast.warning('Invalid email entered.', 'Failed')
  //     return
  //   }
  //   else if (!validFromemail) {
  //     this.loading = false;
  //     this._toast.warning('Invalid email entered.', 'Failed')
  //     return
  //   }
  //   let obj: any = {}
  //   if (this._router.url.includes('partner')) {
  //     obj = {
  //       ToEmail: data.toEmail,
  //       ccEmail: '',
  //       FromEmail: data.fromEmail,
  //       LoginID: (this.loginUser && this.loginUser.UserID && !this.loginUser.IsLogedOut) ? this.loginUser.LoginID : "",
  //       FirstName: (this.loginUser && this.loginUser.UserID && !this.loginUser.IsLogedOut) ? this.loginUser.FirstName : "",
  //       LastName: (this.loginUser && this.loginUser.UserID && !this.loginUser.IsLogedOut) ? this.loginUser.LastName : "",
  //       Subject: data.subject,
  //       Note: data.note,
  //     }
  //     this._searchResult.sharePartnerShippingInfo(obj).subscribe((res: any) => {
  //       this.loading = false;
  //       if (res.returnStatus == "Error") {
  //         this._toast.error(res.returnText, 'Error');
  //       }
  //       else if (res.returnStatus == "Success") {
  //         this._toast.success("Profile link shared successfully.", 'Success');
  //         this.shareDetailForm.reset();
  //         this.closeModal();
  //       }
  //     }, (err: HttpErrorResponse) => {
  //       this.loading = false;

  //     })
  //   } else {
  //     obj = {
  //       ToEmail: data.toEmail,
  //       FromEmail: data.fromEmail,
  //       LoginID: (this.loginUser && this.loginUser.UserID && !this.loginUser.IsLogedOut) ? this.loginUser.LoginID : "",
  //       FirstName: (this.loginUser && this.loginUser.UserID && !this.loginUser.IsLogedOut) ? this.loginUser.FirstName : "",
  //       LastName: (this.loginUser && this.loginUser.UserID && !this.loginUser.IsLogedOut) ? this.loginUser.LastName : "",
  //       Subject: data.subject,
  //       Note: data.note,
  //       CarrierDetails: (this.shareObjectInfo.carrier) ? this.shareObjectInfo.carrier : {},
  //       ProviderDetails: {},
  //       lclPriceDetails: (this.shareObjectInfo.lclPriceDetails) ? this.shareObjectInfo.lclPriceDetails : null,
  //     }
  //     if (this.shareObjectInfo.ContainerLoadType && this.shareObjectInfo.ShippingMode) {
  //       obj.ContainerLoadType = this.shareObjectInfo.ContainerLoadType
  //       obj.ShippingMode = this.shareObjectInfo.ShippingMode
  //     }
  //     if (this.shareObjectInfo.ContainerDetails) {
  //       obj.ContainerDetails = this.shareObjectInfo.ContainerDetails
  //     }

  //     if (this.shareObjectInfo.provider) {
  //       if (!this.shareObjectInfo.provider.ProviderInsurancePercent) this.shareObjectInfo.provider.ProviderInsurancePercent = 0;
  //       if (!this.shareObjectInfo.provider.ProviderBusYear) this.shareObjectInfo.provider.ProviderBusYear = 0;
  //       obj.ProviderDetails = this.shareObjectInfo.provider;
  //     }
  //     this._searchResult.shareShippingInfo(obj).subscribe((res: any) => {
  //       this.loading = false;
  //       if (res.returnStatus == "Error") {
  //         this._toast.error(res.returnText);
  //       }
  //       else if (res.returnStatus == "Success") {
  //         this._toast.success("Details shared successfully.");
  //         this.shareDetailForm.reset();
  //         this.closeModal();
  //       }
  //     }, (err: HttpErrorResponse) => {
  //       this.loading = false;

  //     })
  //   }
  // }

  // setPolPodCode() {
  //   const searchCriteria: SearchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'));
  //   const { pickupPortCode, pickupPortName, pickupPortType, deliveryPortCode, deliveryPortName, deliveryPortType } = searchCriteria
  //   if (pickupPortType === 'GROUND') {
  //     this.PolCode = pickupPortName
  //   } else {
  //     this.PolCode = pickupPortCode
  //   }

  //   if (deliveryPortType === 'GROUND') {
  //     this.PodCode = deliveryPortName
  //   } else {
  //     this.PodCode = deliveryPortCode
  //   }

  // }

  closeModal() {
    this._activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }

  public copyBtnText:string = 'Copy URL'
  copyURL(inputElement) {
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    this.copyBtnText = 'URL Copied!'
    setTimeout(() => {
      this.copyBtnText = 'Copy URL'
    }, 1000);
  }
}
