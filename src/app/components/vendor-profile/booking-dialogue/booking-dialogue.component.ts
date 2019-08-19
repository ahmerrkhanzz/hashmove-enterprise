import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../../services/commonservice/data.service';
import { PlatformLocation } from '@angular/common';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'app-booking-dialogue',
  templateUrl: './booking-dialogue.component.html',
  styleUrls: ['./booking-dialogue.component.scss']
})
export class BookingDialogueComponent implements OnInit, OnDestroy {
  @Input() type: any;
  public modalReference: any;
  constructor(
    public _activeModal: NgbActiveModal,
    private _dataService: DataService,
    private location: PlatformLocation
  ) {
    location.onPopState(() => this.closeModal());
  }

  ngOnInit() {
    this._dataService.closeBookingModal.pipe(untilDestroyed(this)).subscribe((res) => {
      if (res) {
        this._activeModal.close();
        this._dataService.closeBookingModal.next(false)
      }
    })
  }

  closeModal() {
    this._activeModal.close();
  }

  ngOnDestroy() {
    // this._dataService.closeBookingModal.unsubscribe()
  }
  
}
