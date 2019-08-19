import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { UspSectionService } from './usp-section.service';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';

@Component({
  selector: 'app-usp-section',
  templateUrl: './usp-section.component.html',
  styleUrls: ['./usp-section.component.scss'],
})
export class UspSectionComponent implements OnInit {
  public carouselOne: NguCarouselConfig;
  public showVideo: boolean = false;
  public index: number;
  public uspList: Array<UspSection> = [];
  public relatedVideo;
  constructor(private _uspService: UspSectionService) { }

  ngOnInit() {
    this.getUSPList();
    this.carouselOne = {
      grid: { xs: 1, sm: 2, md: 4, lg: 4, all: 0 },
      slide: 1,
      speed: 400,
      interval: { timing: 1000 },
      point: {
        visible: true
      },
      load: 2,
      touch: true,
      loop: false,
    }
  }

  toggleVideo(idx, dir) {
    if (typeof (idx) == 'number' && this.relatedVideo == idx) {
      this.showVideo = !this.showVideo;
      this.relatedVideo = idx;
    }
    else if (typeof (idx) == 'number' && this.relatedVideo != idx) {
      this.showVideo = true;
      this.relatedVideo = idx;
      document.getElementsByClassName('we-do-section')[0].getElementsByClassName( 'row' )[0].classList.add('video-open')
    }
    else {
      this.showVideo = true;
      document.getElementsByClassName('we-do-section')[0].getElementsByClassName( 'row' )[0].classList.add('video-open')
    }
    if (dir === 'right') {
      document.getElementById('usp').classList.add('border-control-left')
      document.getElementById('usp').classList.remove('border-control-right')
    } else if (dir === 'left') {
      document.getElementById('usp').classList.add('border-control-right')
      document.getElementById('usp').classList.remove('border-control-left')
    }

  }

  getUSPList() {
    this._uspService.getUsps().subscribe((res: any) => {
      this.uspList = res;
    });
  }

  CloseUspMenu() {
    this.showVideo = false;
  }

}

export interface UspSection {
  codeType: string;
  codeVal: string;
  codeValDesc: string;
  codeValID: number;
  codeValLink?: any;
  codeValNextVal?: any;
  codeValPreVal?: any;
  codeValShortDesc: string;
  createdBy: string;
  createdDateTime: Date;
  isActive: boolean;
  isDelete: boolean;
  languageID: number;
  modifiedBy: string;
  modifiedDateTime: Date;
  sortingOrder: number;
}