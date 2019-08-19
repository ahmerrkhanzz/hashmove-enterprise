import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: "app-confirm-switch-containers",
  templateUrl: "./confirm-switch-containers.component.html",
  styleUrls: ["./confirm-switch-containers.component.scss"]
})
export class ConfirmSwitchContainersComponent implements OnInit {
  constructor(private _activeModal: NgbActiveModal) {}

  ngOnInit() {}

  closeModal() {
    this._activeModal.close(false);
  }
  onConfirmClick(event) {
    event.stopPropagation();
    this._activeModal.close(true);
  }
}
