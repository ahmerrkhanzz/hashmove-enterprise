import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-video-dialog',
  templateUrl: './video-dialog.component.html',
  styleUrls: ['./video-dialog.component.scss']
})
export class VideoDialogComponent implements OnInit {
  @Input() videoURL: string;
  constructor(
    public _activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
  }

  close() {
    this._activeModal.close()
  }

}
