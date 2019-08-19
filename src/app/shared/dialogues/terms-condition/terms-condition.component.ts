import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DataService } from '../../../services/commonservice/data.service';
import { ConfirmDialogContent } from '../../../interfaces/cancel-dialog';
import { ToastrService } from 'ngx-toastr';
import { PlatformLocation } from '@angular/common';
import { HashStorage } from '../../../constants/globalfunctions';
import { NgScrollbar } from 'ngx-scrollbar';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-terms-condition',
  templateUrl: './terms-condition.component.html',
  styleUrls: ['./terms-condition.component.scss']
})
export class TermsConditDialogComponent implements OnInit {
  @ViewChild(NgScrollbar) scrollRef: NgScrollbar;
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
    private location: PlatformLocation,
    private _router: Router
  ) {
    // location.onPopState(() => this.closeModal('close'));
  }

  ngOnInit() {
    this.isRouting = false
    this.scrollRef.scrollYTo(0, 20);
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


