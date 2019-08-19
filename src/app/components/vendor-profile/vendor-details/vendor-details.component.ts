import { Component, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, ElementRef, Renderer, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Lightbox } from 'ngx-lightbox';
import { baseExternalAssets } from '../../../constants/base.url';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ISlimScrollOptions, SlimScrollEvent } from 'ngx-slimscroll';

@Component({
  selector: 'app-vendor-details',
  templateUrl: './vendor-details.component.html',
  styleUrls: ['./vendor-details.component.scss']
})
export class VendorDetailsComponent implements OnInit, OnChanges, AfterViewInit {
  opts: ISlimScrollOptions;
  scrollEvents: EventEmitter<SlimScrollEvent>;

  @Input() details: any;
  private _albums = [];
  private _albums2 = [];



  constructor(private _lightbox: Lightbox, private el: ElementRef) {
    this.setWindowWidth()
  }


  public readMoreClass = false;
  public vendorAboutBtn: any = "Read More";
  public activeTabId: string = "vendor-about";

  ngOnInit() {

    this.setGallery();
    this.scrollEvents = new EventEmitter<SlimScrollEvent>();
    this.opts = {
      position: 'right',
      barBackground: '#C9C9C9',
      barOpacity: '0.8',
      barWidth: '5',
      barBorderRadius: '20',
      barMargin: '0',
      gridBackground: '#D9D9D9',
      gridOpacity: '1',
      gridWidth: '2',
      gridBorderRadius: '20',
      gridMargin: '0',
      alwaysVisible: true,
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.details) {
      this.setGallery()
    }
    this.setWindowWidth()
  }

  ngAfterViewInit() {
    this.setWindowWidth()
  }

  setWindowWidth() {
    let vendorDetail = document.getElementById('detailsMain');
    let vendorDetailBtn = document.getElementById('detailsBtn');
    const vendorScrollBar = document.querySelector('.vendor-details ng-scrollbar-y');
    // const vendorScroll = document.querySelector('.vendor-details ng-scrollbar-y .ng-scrollbar-thumb');
    setTimeout(() => {
      try {
        $(vendorDetailBtn).hide();
        $(vendorDetail).addClass('unread');
        if ($(vendorDetail).text().length > 669 || $(vendorDetail).html().length > 669) {
          // $(vendorScroll).attr('style', 'height: 98.4727px;');
          vendorScrollBar.classList.add('ng-scrollbar-visible')
          $(vendorDetailBtn).show();
        }
        else {
          $(vendorDetail).removeClass('unread');
          $(vendorDetailBtn).hide();
        }
      }
      catch (error) { }
    }, 10);
  }

  setGallery() {
    if (!this.details) {
      return
    }
    setTimeout(() => {
      this.details.ProviderGalleryParsed = (this.details.ProviderGallery) ? JSON.parse(this.details.ProviderGallery) : [];
      this.details.AwdCrtfGalleryParsed = (this.details.AwdCrtfGallery) ? JSON.parse(this.details.AwdCrtfGallery) : [];
      this._albums = []
      this._albums2 = [];
      const docsArray = this.details.ProviderGalleryParsed
      const docsArray2 = this.details.AwdCrtfGalleryParsed
      docsArray.forEach(doc => {
        const album = {
          src: baseExternalAssets + '/' + doc.DocumentFile,
          caption: '&nbsp;',
          thumb: baseExternalAssets + '/' + doc.DocumentFile
        };
        this._albums.push(album)
        this.details.ProviderGalleryParsed = this._albums;
      })

      docsArray2.forEach(doc => {
        const album = {
          src: baseExternalAssets + '/' + doc.DocumentFile,
          caption: '&nbsp;',
          thumb: baseExternalAssets + '/' + doc.DocumentFile
        };
        this._albums2.push(album)
        this.details.AwdCrtfGalleryParsed = this._albums2;
      })
    }, 500);
  }

  open(index: number, imageArray): void {
    // open lightbox
    this._lightbox.open(imageArray, index);
  }

  close(): void {
    // close lightbox programmatically
    this._lightbox.close();
  }
  readMore() {
    this.readMoreClass = !this.readMoreClass;
    if (this.readMoreClass)
      this.vendorAboutBtn = 'Read Less'
    else
      this.vendorAboutBtn = 'Read More'
  }

  onTabChange($change: NgbTabChangeEvent) {
    const { nextId } = $change
    if (nextId === 'vendor-about') {
      setTimeout(() => {
        this.setWindowWidth()
      }, 0);
    } else {
    }
  }
}
