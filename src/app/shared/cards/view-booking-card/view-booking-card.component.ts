import { Component, OnInit, Input } from '@angular/core';
import { HashStorage, getProviderImage, getImagePath, ImageSource, ImageRequiredSize, cloneObject } from '../../../constants/globalfunctions';
import { Lightbox } from 'ngx-lightbox';
import { ViewBooking } from '../../../interfaces/bookingDetails';
import { WareDocumentData } from '../../../interfaces/warehouse.interface';
import { baseExternalAssets } from '../../../constants/base.url';
import { WarehouseSearchCriteria } from '../../../interfaces/warehousing';

@Component({
  selector: "app-view-booking-card",
  templateUrl: "./view-booking-card.component.html",
  styleUrls: ["./view-booking-card.component.scss"]
})
export class ViewBookingCardComponent implements OnInit {
  @Input() booking: any;
  @Input() searchCriteria: WarehouseSearchCriteria;
  public data: ViewBooking;
  public today: any = {
    ClosingTime: "",
    DayName: "",
    IsClosed: false,
    OpeningTime: ""
  };

  public wareHouseDesc = '';
  public currentDay: number;
  public _albums: any[];

  constructor(private _lightbox: Lightbox) { }

  ngOnInit() {
    let todayDate = new Date();
    this.currentDay = todayDate.getDay();
    if (this.booking) {
      this.setData();
    } else {
      this.data = JSON.parse(HashStorage.getItem("warehouseSearch"));
    }
  }

  /**
   *
   * Get Images from server
   * @param {string} $image
   * @returns
   * @memberof ViewBookingCardComponent
   */
  getProviderImage($image: string) {
    const providerImage = getProviderImage($image);
    return getImagePath(
      ImageSource.FROM_SERVER,
      providerImage,
      ImageRequiredSize.original
    );
  }

  /**
   *
   * Open Lightbox Gallery
   * @param {number} index
   * @param {*} imageArray
   * @memberof ViewBookingCardComponent
   */
  open(index: number, imageArray): void {
    // open lightbox
    this._lightbox.open(imageArray, index);
  }

  /**
   *
   * Close Lightbox Gallery
   * @memberof ViewBookingCardComponent
   */
  close(): void {
    // close lightbox programmatically
    this._lightbox.close();
  }

  /**
   *
   * Setting Data for view booking
   * @memberof ViewBookingCardComponent
   */
  setData() {
    const {
      ProviderName,
      ProviderPhone,
      ProviderImage,
      ProviderEmail,
      WHMedia,
      WHAddress,
      WHName
    } = this.booking;

    let bookingsJSON = JSON.parse(this.booking.BookingJsonDetail);

    let ActualScheduleDetailJSON = JSON.parse(
      this.booking.ActualScheduleDetail
    );
    if (this.booking) {
      this.searchCriteria = JSON.parse(this.booking.JsonSearchCriteria);
      this.wareHouseDesc = bookingsJSON.WHDesc;
    }

    const {
      IsBondedWarehouse,
      IsTempratureControlled,
      IsTransportAvailable
    } = ActualScheduleDetailJSON;
    const { StoreFrom, StoreUntill, SQFT, searchBy, storageType, CBM, PLT } = this.searchCriteria;
    this._albums = [];
    if (WHMedia && JSON.parse(WHMedia)) {
      const docsArray: Array<WareDocumentData> = JSON.parse(WHMedia);
      docsArray.forEach(doc => {
        const album = {
          src: baseExternalAssets + "/" + doc.DocumentFile,
          caption: "&nbsp;",
          thumb: baseExternalAssets + "/" + doc.DocumentFile
        };
        this._albums.push(album);
      });
    }
    // let arr = []
    // let dayId = 1
    // const timingsArray = bookingsJSON.WHTimings
    // timingsArray.forEach(doc => {
    //   doc.id = dayId;
    //   arr.push(doc)
    //   bookingsJSON.WHParsedTiming = arr;
    //   dayId++
    // });
    const { WHMaxSQFT, WHParsedTiming } = bookingsJSON;

    this.data = {
      ProviderName: ProviderName,
      phone: ProviderPhone,
      ProviderImage: ProviderImage,
      email: ProviderEmail,
      WHParsedMedia: this._albums,
      WHAddress: WHAddress,
      WHAreaInSQFT: WHMaxSQFT,
      WHParsedTiming: WHParsedTiming,
      bookedFrom: StoreFrom,
      bookedUntil: StoreUntill,
      bookedSpace: ((searchBy === 'by_unit' || searchBy === 'by_vol_weight') && (storageType === 'shared' || storageType === 'dedicated')) ? CBM : (searchBy === 'by_area') ? SQFT : PLT,
      space: bookingsJSON.AvailableSQFT,
      IsBondedWarehouse: IsBondedWarehouse,
      IsTempratureControlled: IsTempratureControlled,
      IsTransportAvailable: IsTransportAvailable,
      WHName: WHName
    };

  }
}
