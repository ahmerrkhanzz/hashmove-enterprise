import { Component, OnInit } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DataService } from '../../../services/commonservice/data.service';
import { Router } from '@angular/router';
import { UserDocument, DocumentFile } from '../../../interfaces/document.interface';
import { ToastrService } from 'ngx-toastr';
import { BookingDocumentDetail, ViewBookingDetails } from '../../../interfaces/view-booking.interface';
import { loading, cloneObject, Tea } from '../../../constants/globalfunctions';
import { JsonResponse } from '../../../interfaces/JsonResponse';
import { UserService } from '../../../components/user/user-service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserDashboardData } from '../../../interfaces/user-dashboard';

@Component({
  selector: 'app-upload-doc',
  templateUrl: './upload-component.html',
  styleUrls: ['./upload-component.scss']
})
export class UploadComponent implements OnInit {

  public currentDocObject: UserDocument
  passedData: BookingDocumentDetail;
  bookingData: ViewBookingDetails;
  public prevFileName: string
  public isSending: boolean = false


  constructor(
    private _dataService: DataService,
    private _router: Router,
    private _activeModal: NgbActiveModal,
    private location: PlatformLocation,
    private _toastr: ToastrService,
    private _userService: UserService
  ) {
    location.onPopState(() => this.closeModal('close'));
  }

  ngOnInit() {
    if (this.passedData.DocumentID && this.passedData.DocumentName) {
      this.prevFileName = this.passedData.DocumentName
    }
  }

  closeModal(toPass) {
    this._activeModal.close(toPass);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }

  async onConfirmClick() {
    if (this.isSending) {
      return
    }

    document.querySelector('.overlay').classList.add('loaderShow')
    setTimeout(() => {
      document.querySelector('.overlay').classList.remove('loaderShow')

    }, 1500);


    let toSend: BookingDocumentDetail = cloneObject(this.passedData)
    if (!this.currentDocObject || !this.currentDocObject.DocumentFileContent) {
      this.isSending = false
      this._toastr.error('Please select a file to upload', 'Invalid Operation')
      return false;
    }

    setTimeout(() => {
      this.isSending = true
    }, 0);

    let _CompanyName: string = ''

    try {
      const cmpy: UserDashboardData = this._dataService.getDashboardData();
      if (cmpy.CompanyName) {
        _CompanyName = cmpy.CompanyName
      } else {
        _CompanyName = ''
      }
    } catch (error) { }

    toSend.DocumentName = this.currentDocObject.DocumentName
    toSend.DocumentFileContent = this.currentDocObject.DocumentFileContent
    toSend.DocumentUploadedFileType = this.currentDocObject.DocumentUploadedFileType

    toSend.DocumentID = (toSend.DocumentID) ? toSend.DocumentID : -1;
    toSend.BookingID = this.passedData.BookingID
    let newObject: any
    try {
      newObject = {
        ...toSend,
        providerName: this.bookingData.ProviderName,
        emailTo: this.bookingData.ProviderEmail,
        phoneTo: this.bookingData.ProviderPhone,
        userName: this.bookingData.UserName,
        hashMoveBookingNum: this.bookingData.HashMoveBookingNum,
        userCompanyName: _CompanyName,
        userCountryPhoneCode: this.bookingData.ProviderCountryPhoneID
      }
    } catch (error) {
      newObject = toSend
    }

    this._userService.saveUserDocument(newObject).subscribe((res: JsonResponse) => {
      if (res.returnId > 0) {
        this.isSending = false
        if (toSend.DocumentID > 0) {
          this._toastr.success('Document Updated Successfully', res.returnStatus)
        } else {
          this._toastr.success('Document Saved Successfully', res.returnStatus)
        }
        this.closeModal('success');
      } else {
        this.isSending = false
        this._toastr.error(res.returnText, 'Error')
        event.stopPropagation();
        this.closeModal('error');
      }
    }, (err: HttpErrorResponse) => {
      this.isSending = false
      this.closeModal('error');
      this._toastr.error('An unexpected error occurred. Please try again later.', 'Failed')
    })
  }

  customDragCheck($fileEvent: DocumentFile) {
    let selectedFile: DocumentFile = $fileEvent
    const newDoc: any = {
      DocumentName: selectedFile.fileName,
      DocumentFileContent: selectedFile.fileBaseString,
      DocumentUploadedFileType: selectedFile.fileType
    }
    this.currentDocObject = newDoc
  }

  fileSelectFailedEvent($message: string) {
    this._toastr.error($message, 'Error')
  }


  onDocumentClick($newDocument: UserDocument, index: number) {
    const newDoc: UserDocument = $newDocument
    this.currentDocObject = newDoc
  }
}
