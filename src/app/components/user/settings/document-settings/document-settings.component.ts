import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { DocumentFile, UserDocument, MetaInfoKeysDetail } from '../../../../interfaces/document.interface';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { cloneObject, Tea, loading } from '../../../../constants/globalfunctions';
import { NgbDateStruct, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { UserService } from '../../user-service';
import { JsonResponse } from '../../../../interfaces/JsonResponse';
import { HttpErrorResponse, HttpClient, HttpRequest, HttpEventType } from '@angular/common/http';
import { LoginUser } from '../../../../interfaces/user.interface';
import { DataService } from '../../../../services/commonservice/data.service';
import { baseExternalAssets, baseApi } from '../../../../constants/base.url';
import { NgbDateFRParserFormatter } from '../../../../constants/ngb-date-parser-formatter';

@Component({
  selector: 'app-document-settings',
  templateUrl: './document-settings.component.html',
  styleUrls: ['./document-settings.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter }],
   animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ transform: 'translateY(-10%)', opacity: 0 }),
          animate('300ms', style({ transform: 'translateY(0)', opacity: 1 }))
        ]),
        transition(':leave', [
          style({ transform: 'translateY(0)', opacity: 1 }),
          animate('300ms', style({ transform: 'translateY(-10%)', opacity: 0 }))
        ])
      ]
    )
  ],
})
export class DocumentSettingsComponent implements OnInit {


  public displayMonths = 1;
  public navigation = 'select';
  public showWeekNumbers = false;
  public outsideDays = 'visible';
  public uploadToggleBTn = true;
  public uploadToggleBTn2 = true;
  public uploadToggleBTn3 = true;
  public currentDocObject: UserDocument

  //Document Upload Stuff
  // public fileIsOver: boolean = false;
  // public tradeFile: DocumentFile
  // public optionss = {
  //   readAs: 'DataURL'
  // };

  public uploadForm: FormGroup
  public dateModel: NgbDateStruct
  public minDate
  public loading: boolean;


  @Input() userDocument: UserDocument[]

  constructor(
    private _toastr: ToastrService,
    private _userService: UserService,
    private _dataService: DataService,
    private _http: HttpClient
  ) { }

  public loginUser: LoginUser

  ngOnInit() {
    this.loginUser = JSON.parse(Tea.getItem('loginUser'))
    let date = new Date();
    this.resetAccordian()

    this.minDate = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }

  customDragCheck($fileEvent: DocumentFile) {
    let selectedFile: DocumentFile = $fileEvent
    this.currentDocObject.DocumentName = selectedFile.fileName
    this.currentDocObject.DocumentFileContent = selectedFile.fileBaseString
    this.currentDocObject.DocumentUploadedFileType = selectedFile.fileType
  }



  fileSelectFailedEvent($message: string) {
    this._toastr.error($message, 'Error')
  }


  onDocumentClick($newDocument: UserDocument, index: number) {
    let newDoc: UserDocument = $newDocument
    this.currentDocObject = $newDocument
    newDoc.MetaInfoKeysDetail.forEach((element: MetaInfoKeysDetail) => {
      if (element.DataType.toLowerCase() === 'datetime') {
        if (element.KeyValue) {
          element.DateModel = this.generateDateStructure(element.KeyValue)
        }
      }
    })
    this.resetAccordian(index)
  }
  generateDateStructure(strDate: string): NgbDateStruct {
    let arr: Array<string> = strDate.split('/');
    let dateModel: NgbDateStruct = {
      day: parseInt(arr[1]),
      month: parseInt(arr[0]),
      year: parseInt(arr[2])
    }
    return dateModel
  }
  progress: number = 0

  uploadDocument(acc: any, acc_name: string, index: number) {
    this.loading = true
    loading(true)
    let toSend: UserDocument = cloneObject(this.currentDocObject)

    if (!toSend.DocumentFileContent && !toSend.DocumentFileName) {
      this._toastr.error('Please select a file to upload', 'Invalid Operation')
      this.loading = false
      loading(false)
      return
    }

    let emptyFieldFlag: boolean = false
    let emptyFieldName: string = ''
    toSend.MetaInfoKeysDetail.forEach((element: MetaInfoKeysDetail) => {
      if (element.IsMandatory && !element.KeyValue) {
        emptyFieldFlag = true
        emptyFieldName = element.KeyNameDesc
        return;
      }
    })


    if (emptyFieldFlag) {
      this._toastr.error(`${emptyFieldName} field is empty`, 'Invalid Operation')
      this.loading = false
      loading(false)
      return
    }

    toSend.DocumentID = (toSend.DocumentID) ? toSend.DocumentID : -1;
    toSend.UserID = this.loginUser.UserID

    // const uploadReq = new HttpRequest('POST', baseApi + `Document/Post`, toSend, {
    //   reportProgress: true,
    // });

    // this._http.request(uploadReq).subscribe(event => {
    //   if (event.type === HttpEventType.UploadProgress)
    //     this.progress = Math.round(100 * event.loaded / event.total);
    //   else if (event.type === HttpEventType.Response)
    //     loading(false)
    // });

    if (toSend.DocumentID > 0 && toSend.DocumentFileName) {
      toSend.DocumentLastStatus = 'RESET'
    } else {
      toSend.DocumentLastStatus = ''
    }
    this._userService.saveUserDocument(toSend).subscribe((res: JsonResponse) => {
      if (res.returnId > 0) {
        this.loading = false
        loading(false)
        acc.toggle(acc_name + index)
        this.userDocument[index].ShowUpload = false
        if (toSend.DocumentID > 0) {
          this._toastr.success('Document Updated Successfully', res.returnStatus)
        } else {
          this._toastr.success('Document Saved Successfully', res.returnStatus)
        }
        this.refetchUserDocsData(toSend.UserID)
      } else {
        this.loading = false
        loading(false)
        this._toastr.error(res.returnStatus)
      }
    }, (err: HttpErrorResponse) => {
      this.loading = false
      loading(false)
      this._toastr.error('An unexpected error occurred. Please try again later.', 'Failed')
    })
  }

  refetchUserDocsData(userId: number) {
    this._userService.getUserDocument(userId).subscribe((res: any) => {
      if (res.returnId > 0) {
        this.userDocument = res.returnObject
        this._dataService.updateUserDocsData.next(res.returnObject)
      }
    }, (error: HttpErrorResponse) => {
    });
  }

  onKeyPress($event, index: number, length: number) {
    if ($event.target.value.length > length) {
      return
    }
    let selectedValue = $event.target.value
    if ($event.target.value) {
      this.currentDocObject.MetaInfoKeysDetail[index].KeyValue = selectedValue
    }
  }

  dateChangeEvent($event: NgbDateStruct, index: number) {
    let selectedDate = new Date($event.year, $event.month - 1, $event.day);
    let formattedDate = moment(selectedDate).format('L');
    this.currentDocObject.MetaInfoKeysDetail[index].KeyValue = formattedDate
  }

  downloadAction($url: string, acc: any, acc_name: string, index: number) {
    if ($url && $url.length > 0) {
      if ($url.startsWith("[{")) {
        let document = JSON.parse($url)
        window.open(baseExternalAssets + document[0].DocumentFile, '_blank');
      } else {
        window.open(baseExternalAssets + $url, '_blank');
      }
      // window.open(baseExternalAssets + $url, '_blank');
      acc.toggle(acc_name + index)
      this.resetAccordian(index)
    }
  }

  async resetAccordian(index?: number) {
    if (index) {
      this.userDocument[index].ShowUpload = !this.userDocument[index].ShowUpload
    }
    for (let i = 0; i < this.userDocument.length; i++) {
      if (i !== index) {
        this.userDocument[i].ShowUpload = false
      }
    }
  }
}