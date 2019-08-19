import { Component, OnInit, Input } from '@angular/core';
import { getGreyIcon } from "../../../constants/globalfunctions";

@Component({
  selector: 'app-cont-track-mon',
  templateUrl: './cont-track-mon.component.html',
  styleUrls: ['./cont-track-mon.component.scss']
})
export class ContTrackMonComponent implements OnInit {

  @Input() data: any

  public containerDtl: ViewContainerDtl = {
    containerNumber: 'ST-40-A7478'
  }


  constructor() { }

  ngOnInit() {
  }


  getIcon($mode: string) {
    return getGreyIcon($mode)
  }


}

export interface ViewContainerDtl {
  containerNumber: string
}
