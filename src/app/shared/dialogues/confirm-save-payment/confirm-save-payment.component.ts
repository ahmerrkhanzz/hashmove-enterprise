import { Component, OnInit } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DataService } from '../../../services/commonservice/data.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-confirm-save-payment',
  templateUrl: './confirm-save-payment.component.html',
  styleUrls: ['./confirm-save-payment.component.scss']
})
export class ConfirmSavePaymentComponent implements OnInit {

  constructor(
    private _dataService: DataService,
    private _router: Router,
    private _activeModal: NgbActiveModal,
    private location: PlatformLocation,
  ) {
    location.onPopState(() => this.closeModal('close'));
  }

  ngOnInit() {
  }

  closeModal(action) {
    this._activeModal.close(action);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }
  onConfirmClick(event) {
    event.stopPropagation();
    this.closeModal('confirm');
  }
}
