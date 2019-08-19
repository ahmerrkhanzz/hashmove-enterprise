import { Component, OnInit, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DataService } from '../../../services/commonservice/data.service';
import { CancelDialogContent, ConfirmDialogContent } from '../../../interfaces/cancel-dialog';
import { UserService } from '../../../components/user/user-service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { PlatformLocation } from '@angular/common';
import { HashStorage } from '../../../constants/globalfunctions';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {

  @Input() messageData: ConfirmDialogContent = {
    messageTitle: 'Confirm',
    messageContent: 'Are you sure you want to cofirm?',
    data: {},
    buttonTitle: 'Yes'
  }

  isRouting: boolean = false

  constructor(
    private _activeModal: NgbActiveModal,
    private _dataService: DataService,
    private toastr: ToastrService,
    private location: PlatformLocation
  ) {
    // location.onPopState(() => this.closeModal('close'));
  }

  ngOnInit() {
    this.isRouting = false
  }

  closeModal($action: string) {
    if (this.isRouting) {
      return
    }
    this._activeModal.close($action);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }

  onConfirmClick($action: string) {
    this.closeModal($action)
  }

}


