import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnDestroy } from "@angular/core";
import { } from "googlemaps"; // for angular 7
// declare var google: any;
// import { } from "@types/googlemaps";  // for angular 5
// declare const google: any;
import Map = google.maps.Map;
import LatLng = google.maps.LatLng;
import LatLngBounds = google.maps.LatLngBounds;
import Marker = google.maps.Marker;
import Point = google.maps.Point;
import { DataService } from "../../services/commonservice/data.service";
import {
  BookingList,
  BookingRoutePorts,
  MarkerInfo
} from "../../interfaces/user-dashboard";
import {
  removeDuplicates,
  getMarkerIcon,
  HashStorage,
  getDateDiff,
  getImagePath,
  ImageSource,
  ImageRequiredSize,
  kFormatter,
  getProviderImage,
  isInArray,
  checkDuplicateInObject,
  checkDuplicateLatLng,
  cloneObject
} from "../../constants/globalfunctions";
import {
  BookingRouteMapInfo,
  LineMarker,
  TrackingMonitoring,
  Polyline,
  ContainerDetail
} from "../../interfaces/view-booking.interface";
import * as JQ from 'jquery'
import { WarehouseSearchResult, WareDocumentData } from "../../interfaces/warehouse.interface";
import { WarehouseSearchCriteria } from "../../interfaces/warehousing";
import * as moment from 'moment'
import { CurrencyControl } from "../currency/currency.injectable";
import './markerclusterer';
import { untilDestroyed } from "ngx-take-until-destroy";
import { ContainerMarker } from "../../components/user/view-booking-detail/tracking-overview/tracking-overview.component";




@Component({
  selector: "hashmove-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"]
})
export class HashmoveMap implements OnInit, OnDestroy {
  public map: google.maps.Map;
  public latitude: number;
  public longitude: number;
  // public routeList = []
  // public routeList: MapMarker[]
  public iconBase = "https://maps.google.com/mapfiles/kml/shapes/";
  public selectedMarkerType: string = "parking_lot_maps.png";
  public evenOdd: number = 0;
  private colors: Array<string> = [
    "#1caae3", //original
    "#80bfff", //light blue
    "#1affb2", // light green
    "#33cc33", // green
    "#ff5050" // orange
  ];
  public currentInfoWindow: any

  nItems = 0;
  iCurrentSlide = 1;
  iNextSlide = 2;
  iSlideInterval = 3; // in seconds
  looper = null;


  @ViewChild("gmap")
  gmapElement: any;
  @Input()
  windowHeight: string = "400px";
  @Input()
  disableControls: boolean = false;
  @Input()
  enableDataService: boolean = true;
  @Input()
  isViewBookingData: boolean;
  @Input()
  bookingRouteMapInfo: BookingRouteMapInfo;
  @Input()
  isPickUpDest: boolean;
  @Input()
  miniMapData: LineMarker;
  @Input()
  isWareHouseMap: boolean;
  @Input()
  wareSearchResult: Array<WarehouseSearchResult>;
  @Input()
  isWareHouseMiniMap: boolean;
  @Input()
  wareHouseMiniMapData: any;
  @Input()
  isTracking: boolean;
  @Input()
  trackingData: TrackingMonitoring
  @Input()
  isSingleContainer: boolean;
  @Input()
  singleContData: ContainerMarker


  // wareSearchResult

  @Output() onWarehouseClick = new EventEmitter<WarehouseEmitModel>();
  @Output() onGalleryClick = new EventEmitter<WarehouseSearchResult>();

  markerClickHandler = ($payload, $action) => {
    return (event) => {
      console.log('action:', $action);
      console.log('payload:', $payload);
      this.onWarehouseClick.emit({ searchResult: $payload, type: $action })
    }
  };

  constructor(
    private _dataService: DataService,
    private _currencyControl: CurrencyControl
  ) { }

  ngOnInit() {
    this.setMap();
    // this.wareHouseCardTooltip();
    if (this.enableDataService) {
      this._dataService.resetMapMarkers.pipe(untilDestroyed(this)).subscribe(res => {
        if (res) {
          this.setNewMap();
        }
      });
      this._dataService.newMapMarkerList.pipe(untilDestroyed(this)).subscribe(
        async (state: Array<BookingList>) => {
          if (state) {
            await this.setNewMap();
            let filterBookings = state.filter(e => (
              (e.ContainerLoad === 'FCL' && (e.PolModeOfTrans === 'SEA' || e.PodModeOfTrans === 'SEA')) ||
              (e.ContainerLoad === 'FCL' && (e.PolModeOfTrans === 'GROUND' || e.PodModeOfTrans === 'GROUND')) ||
              (e.ContainerLoad === 'LCL' && (e.PolModeOfTrans === 'AIR' || e.PodModeOfTrans === 'AIR')) ||
              (e.ContainerLoad === 'LCL' && (e.PolModeOfTrans === 'GROUND' || e.PolModeOfTrans === 'GROUND')) ||
              (e.ShippingModeCode === 'WAREHOUSE') ||
              (e.ShippingModeCode === 'TRUCK')
            ))
            this.setCurveLine(filterBookings);
          }
        }
      );
    }
    if (this.isViewBookingData && !this.isTracking) {
      this.setViewBookingRoutes();
    }
    if (this.isViewBookingData && this.isTracking) {
      this.setViewTrackingRoutes();
    }

    if (this.isPickUpDest) {
      this.setPickUpDestData();
    }

    if (this.isWareHouseMap) {
      this._dataService.obsWarehouseMap.pipe(untilDestroyed(this)).subscribe(state => {
        if (state) {
          this.setWareHouseData()
        }
      })
      this.setWareHouseData()
    }

    if (this.isWareHouseMiniMap) {
      this.setWarehouseMiniMap()
    }

    if (this.isSingleContainer && this.singleContData) {
      if (this.singleContData) {
        this.setContainerMapData()
      }
    }
  }

  gest: any = "none";

  async setMap() {
    await this.setNewMap();
    // this.setList()
    // this.setCurveLine()
  }

  async setNewMap() {
    let mapProp = {
      center: new google.maps.LatLng(23.999898, 68.715682),
      zoom: 4,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: this.disableControls ? true : true,
      zoomControl: this.disableControls ? false : true,
      gestureHandling: this.disableControls ? this.gest : ""
    };
    this.map = await new google.maps.Map(
      this.gmapElement.nativeElement,
      mapProp
    );
  }

  setCurveLine(currentBookings?: Array<BookingList>) {
    if (currentBookings && currentBookings.length > 0) {
      const distinctPorts: MarkerInfo[] = this.getDistinctPorts(
        currentBookings
      );

      const totalRoutes: number = currentBookings.length;
      if (totalRoutes && totalRoutes > 0) {
        let bounds = new LatLngBounds();
        // const bookingLength = bookingList.length

        for (let i = 0; i < totalRoutes; i++) {

          const { ShippingModeCode } = currentBookings[i]
          if (ShippingModeCode === 'WAREHOUSE' && currentBookings[i].WHGLocCode) {

            const { WHLatitude, WHLongitude, WHGLocCode } = currentBookings[i]

            const posPortData: MarkerInfo = distinctPorts.find(
              elem =>
                elem.PortCode.toLowerCase() === WHGLocCode.toLowerCase()
            );

            this.addMarker(
              this._currencyControl.applyRoundByDecimal(WHLatitude, 8),
              this._currencyControl.applyRoundByDecimal(WHLongitude, 8),
              posPortData,
              ShippingModeCode
            );

            let pos = new LatLng(
              this._currencyControl.applyRoundByDecimal(WHLatitude, 8),
              this._currencyControl.applyRoundByDecimal(WHLongitude, 8),
            );
            bounds.extend(pos);

          }

          if (ShippingModeCode !== 'WAREHOUSE' && (currentBookings[i].BookingRoutePorts && currentBookings[i].BookingRoutePorts.length > 0)) {
            const randomNumber = Math.floor(Math.random() * 5);
            const randomColor: string = this.colors[randomNumber];
            const bookingRoutePorts = currentBookings[i].BookingRoutePorts;
            const routeLength: number = bookingRoutePorts.length;
            for (let j = 0; j < routeLength; j++) {
              try {
                const bookPort: BookingRoutePorts = bookingRoutePorts[j];
                const { PolLatitude, PolLongitude, PodLatitude, PodLongitude, PolType, PodType } = bookPort
                const isValidMarker: boolean =
                  (parseInt(PolLatitude.toString()) && parseInt(PolLatitude.toString()) > 0) &&
                  (parseInt(PolLongitude.toString()) && parseInt(PolLongitude.toString()) > 0) &&
                  (parseInt(PodLatitude.toString()) && parseInt(PodLatitude.toString()) > 0) &&
                  (parseInt(PodLongitude.toString()) && parseInt(PodLongitude.toString()) > 0);
                if (isValidMarker) {
                  const polPortData: MarkerInfo = distinctPorts.find(
                    elem =>
                      elem.PortCode.toLowerCase() === bookPort.PolCode.toLowerCase()
                  );
                  const podPortData: MarkerInfo = distinctPorts.find(
                    elem =>
                      elem.PortCode.toLowerCase() === bookPort.PodCode.toLowerCase()
                  );

                  this.addMarker(
                    this._currencyControl.applyRoundByDecimal(PolLatitude, 8),
                    this._currencyControl.applyRoundByDecimal(PolLongitude, 8),
                    polPortData,
                    PolType
                  );
                  this.addMarker(
                    this._currencyControl.applyRoundByDecimal(PodLatitude, 8),
                    this._currencyControl.applyRoundByDecimal(PodLongitude, 8),
                    podPortData,
                    PodType
                  );
                  let pol = new LatLng(
                    this._currencyControl.applyRoundByDecimal(PolLatitude, 8),
                    this._currencyControl.applyRoundByDecimal(PolLongitude, 8)
                  );
                  let pod = new LatLng(
                    this._currencyControl.applyRoundByDecimal(PodLatitude, 8),
                    this._currencyControl.applyRoundByDecimal(PodLongitude, 8)
                  );
                  bounds.extend(pol);
                  bounds.extend(pod);
                  this.drawDashedLine(
                    this._currencyControl.applyRoundByDecimal(PolLatitude, 8),
                    this._currencyControl.applyRoundByDecimal(PolLongitude, 8),
                    this._currencyControl.applyRoundByDecimal(PodLatitude, 8),
                    this._currencyControl.applyRoundByDecimal(PodLongitude, 8),
                    randomColor
                  );
                }
              } catch (error) {
                console.warn(error);
              }
            }
          }
        }
        this.map.fitBounds(bounds); //can be
      }
    }
  }

  getDistinctPorts(currentBookings: Array<BookingList>): Array<MarkerInfo> {
    const allPorts: MarkerInfo[] = [];
    currentBookings.forEach(booking => {
      if (
        ((booking.ContainerLoad === 'FCL' && (booking.PolModeOfTrans === 'SEA' || booking.PodModeOfTrans === 'SEA')) ||
          (booking.ContainerLoad === 'FCL' && (booking.PolModeOfTrans === 'GROUND' || booking.PodModeOfTrans === 'GROUND')) ||
          (booking.ContainerLoad === 'LCL' && (booking.PolModeOfTrans === 'AIR' || booking.PodModeOfTrans === 'AIR')) ||
          (booking.ContainerLoad === 'LCL' && (booking.PolModeOfTrans === 'GROUND' || booking.PolModeOfTrans === 'GROUND')) ||
          (booking.ContainerLoad === 'FTL')) && (booking.BookingRoutePorts && booking.BookingRoutePorts.length > 0)
      ) {
        booking.BookingRoutePorts.forEach(route => {
          const pod: MarkerInfo = {
            PortName: route.PodName,
            PortCode: route.PodCode,
            BookingData: {
              BookingID: [route.BookingID],
              HashMoveBookingNum: [booking.HashMoveBookingNum]
            }
          };
          const pol: MarkerInfo = {
            PortName: route.PolName,
            PortCode: route.PolCode,
            BookingData: {
              BookingID: [route.BookingID],
              HashMoveBookingNum: [booking.HashMoveBookingNum]
            }
          };
          allPorts.push(pod);
          allPorts.push(pol);
        });
      }

      if (booking.ShippingModeCode === 'WAREHOUSE' && booking.WHGLocCode) {
        const pos: MarkerInfo = {
          PortName: booking.WHName,
          PortCode: booking.WHGLocCode,
          BookingData: {
            BookingID: [booking.BookingID],
            HashMoveBookingNum: [booking.HashMoveBookingNum]
          }
        };
        allPorts.push(pos);
      }
    });

    const distinctPorts: MarkerInfo[] = removeDuplicates(allPorts, "PortCode");


    for (let i = 0; i < distinctPorts.length; i++) {
      for (let j = 0; j < allPorts.length; j++) {
        const alPort: MarkerInfo = allPorts[j];

        if (
          distinctPorts[i].PortCode.toLowerCase() ===
          alPort.PortCode.toLowerCase()
        ) {
          if (
            !distinctPorts[i].BookingData.HashMoveBookingNum.includes(
              alPort.BookingData.HashMoveBookingNum[0]
            )
          ) {
            distinctPorts[i].BookingData.HashMoveBookingNum.push(
              alPort.BookingData.HashMoveBookingNum[0]
            );
            distinctPorts[i].BookingData.BookingID.push(
              alPort.BookingData.BookingID[0]
            );
          }
        }
      }
    }

    return distinctPorts;
  }

  drawDashedLine(lat1, long1, lat2, long2, randomColor: string) {

    let lineSymbol = {
      path: "M 0,-1 0,1",
      strokeOpacity: 1,
      scale: 2
    };

    let Line = new google.maps.Polyline({
      path: [{ lat: lat1, lng: long1 }, { lat: lat2, lng: long2 }],
      geodesic: true,
      strokeOpacity: 0.0,
      icons: [
        {
          icon: lineSymbol,
          offset: "0",
          repeat: "10px"
        }
      ],
      // strokeColor: '#' + Math.floor((Math.random() * 10)) + 'caae' + Math.floor((Math.random() * 10))
      strokeColor: randomColor
    });

    Line.setMap(this.map);
    return Line;
  }

  addCurvedLine(markerP1, markerP2) {
    let lineLength = google.maps.geometry.spherical.computeDistanceBetween(
      markerP1.getPosition(),
      markerP2.getPosition()
    );
    let lineHeading = google.maps.geometry.spherical.computeHeading(
      markerP1.getPosition(),
      markerP2.getPosition()
    );
    let markerA = new google.maps.Marker({
      position: google.maps.geometry.spherical.computeOffset(
        markerP1.getPosition(),
        lineLength / 3,
        lineHeading - 60
      ),
      map: this.map,
      icon: {
        url: "",
        size: new google.maps.Size(7, 7),
        anchor: new google.maps.Point(3.5, 3.5)
      }
    });
    let markerB = new google.maps.Marker({
      position: google.maps.geometry.spherical.computeOffset(
        markerP2.getPosition(),
        lineLength / 3,
        -lineHeading + 120
      ),
      icon: {
        url: "",
        size: new google.maps.Size(7, 7),
        anchor: new google.maps.Point(3.5, 3.5)
      },
      map: this.map
    });

    let curvedLine = GmapsCubicBezier(
      markerP1.getPosition(),
      markerA.getPosition(),
      markerB.getPosition(),
      markerP2.getPosition(),
      0.01,
      this.map
    );
  }

  setCenter(latitude: number, longitude: number) {
    this.map.setCenter(new google.maps.LatLng(latitude, longitude));

    let location = new google.maps.LatLng(latitude, longitude);

    let marker = new google.maps.Marker({
      position: location,
      map: this.map,
      title: "Got you!"
    });

    marker.addListener("click", () => {
      alert("Marker's Title: " + marker.getTitle());
    });
  }

  getHmList(hmCodeList: Array<string>) {
    let someArr = [];
    hmCodeList.forEach(hmcode => {
      let str: string = `
                <div style="width:100% !important;margin-bottom:8px;margin-top:8px">
                    <a href="javascript:;" style=";font-size: 13px;color:#2b2b2b;font-weight: 600;text-transform:uppercase;margin-top:5px;">${hmcode}</a>
                </div>
            `;
      someArr.push(str);
    });
    let some: string = "";
    someArr.forEach(elem => {
      some = some + elem;
    });
    return some;
  }

  async addMarker(
    latitude: number,
    longitude: number,
    portDetails: MarkerInfo,
    $transMode?: string
  ) {
    const markericon = getMarkerIcon($transMode)

    const icon = {
      url: `../../../assets/images/icons/${markericon}`, // url
      scaledSize: new google.maps.Size(38, 38), // scaled size
    };

    const markerDiv = `
            <div class="booking-map-tooltip">
                <strong style="color:#00a2df;font-size:16px;font-family:'proxima-nova';sans-serif;text-transform: uppercase;font-weight: 500;overflow-y:hidden">${
      portDetails.PortName
      }</strong>
                <div style="">
                    ${this.getHmList(
        portDetails.BookingData.HashMoveBookingNum
      )}
                </div>
            </div>
        `;

    let location = new google.maps.LatLng(latitude, longitude);
    let marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: icon,

      // title: (markerDiv)
    });

    let infowindow = new google.maps.InfoWindow({
      content: `
                <div class="booking-map-tooltip-main">
                    <div>${markerDiv}</div>
                </div>
            `
    });

    marker.addListener("click", () => {
      infowindow.open(this.gmapElement, marker);
    });
    // marker.addListener('mouseover', () => {
    //     infowindow.open(this.gmapElement, marker)
    // });
    // marker.addListener('mouseout', () => {
    //     infowindow.close()
    // });

    // google.maps.event.addListener(marker, 'mouseover', function (e) {
    //     e.mb.target.removeAttribute('title');
    // }

    // setMapType(mapTypeId: string) {
    //   this.map.setMapTypeId(mapTypeId)
    // }
  }

  async addMarkerSimple(
    $latitude: number,
    $longitude: number,
    portName?: string,
    $desc?: string,
    $transMode?: string
  ) {
    const markerDiv = `
            <div>
                <strong style="color:#00a2df;font-size:16px;font-family:'proxima-nova';sans-serif;text-transform: uppercase;font-weight: 500;overflow-y:hidden">${portName}</strong>
                <div style="max-height:120px;width:150px;overflow-y:auto;line-height:1.5;font-size:12px">
                    ${$desc}
                </div>
            </div>
        `;


    const markericon = getMarkerIcon($transMode)

    const icon = {
      url: `../../../assets/images/icons/${markericon}`, // url
      scaledSize: new google.maps.Size(38, 38), // scaled size
    };

    const location = new google.maps.LatLng($latitude, $longitude);
    const marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: icon
      // title: (markerDiv)
    });

    const infowindow = new google.maps.InfoWindow({
      content: `
                <div>
                    <div>${markerDiv}</div>
                </div>
            `
    });

    marker.addListener("click", () => {
      infowindow.open(this.gmapElement, marker);
    });
  }

  async addMarkerMini($latitude: number, $longitude: number, $icon?: string) {

    const markericon = getMarkerIcon($icon)

    const icon = {
      url: `../../../assets/images/icons/${markericon}`, // url
      scaledSize: new google.maps.Size(35, 35), // scaled size
    };

    let location = new google.maps.LatLng($latitude, $longitude);
    let marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: icon
    });
  }
  async addMarkerMini2($latitude: number, $longitude: number, $iconType: string, $desc: string, $portName: string) {

    const markericon = ($iconType === 'dest') ? 'icon_destination_location_anim.svg' : 'icon_origin_location_anim.svg'


    const icon = {
      url: `../../../assets/images/icons/${markericon}`, // url
      scaledSize: new google.maps.Size(30, 30), // scaled size
    };
    const markerDiv = `
            <div>
                <strong style="color:#00a2df;font-size:16px;font-family:'proxima-nova';sans-serif;text-transform: uppercase;font-weight: 500;overflow-y:hidden">${$portName}</strong>
                <div style="max-height:120px;width:150px;overflow-y:auto;line-height:1.5;font-size:12px">
                    ${$desc}
                </div>
            </div>
        `;

    let location = new google.maps.LatLng($latitude, $longitude);
    let marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: icon
    });

    const infowindow = new google.maps.InfoWindow({
      content: `
                <div>
                    <div>${markerDiv}</div>
                </div>
            `
    });

    marker.addListener("click", () => {
      infowindow.open(this.gmapElement, marker);
    });
  }

  async setViewBookingRoutes() {
    if (!this.bookingRouteMapInfo) {
      return;
    }

    await this.setNewMap();

    const { RouteInfo } = this.bookingRouteMapInfo;
    let bounds = new LatLngBounds();
    const routeLength: number = RouteInfo.length;

    for (let i = 0; i < routeLength; i++) {
      const route = RouteInfo[i];
      const { Latitude, Longitude, RouteDesc, PortName } = route;

      const roundedLat: number = this._currencyControl.applyRoundByDecimal(
        Latitude,
        8
      );
      const roundedLong: number = this._currencyControl.applyRoundByDecimal(
        Longitude,
        8
      );

      this.addMarkerSimple(roundedLat, roundedLong, PortName, RouteDesc, route.ModeOfTrans);
      let position = new LatLng(roundedLat, roundedLong);
      bounds.extend(position);

      if (i + 1 < routeLength) {
        const route2 = RouteInfo[i + 1];

        const roundedLat2 = this._currencyControl.applyRoundByDecimal(
          route2.Latitude,
          8
        );
        const roundedLong2 = this._currencyControl.applyRoundByDecimal(
          route2.Longitude,
          8
        );
        const PortName2 = route2.PortName;
        const RouteDesc2 = route2.RouteDesc;

        this.addMarkerSimple(roundedLat2, roundedLong2, PortName2, RouteDesc2, route2.ModeOfTrans);
        let position = new LatLng(roundedLat2, roundedLong2);
        bounds.extend(position);

        this.drawDashedLine(
          roundedLat,
          roundedLong, // point A
          roundedLat2,
          roundedLong2, // point B
          this.colors[0]
        );
      }
    }
    this.map.fitBounds(bounds); //can be
  }

  pastRoutes: Array<Polyline> = []
  futureRoutes: Array<Polyline> = []
  currentLocation: Polyline

  async setViewTrackingRoutes() {
    if (!this.trackingData) {
      return;
    }

    await this.setNewMap();
    const { Polylines } = this.trackingData

    this.pastRoutes = Polylines.filter(route => route.IsHistory === true)
    this.futureRoutes = Polylines.filter(route => route.IsHistory === false)
    try {
      this.currentLocation = Polylines.filter(route => route.IsCurrloc === true)[0]
    } catch (error) {
      console.warn('current location not provided:', error)
    }



    let bounds = new LatLngBounds();

    const { pastRoutes, futureRoutes, currentLocation } = this


    const origin: Polyline = pastRoutes.filter(port => port.PolylineStatus && port.PolylineStatus.toLowerCase() === 'origin')[0]
    const pastConnPort: Array<Polyline> = pastRoutes.filter(port => port.PolylineStatus && port.PolylineStatus.toLowerCase() === 'connecting')
    const roundFunc = this._currencyControl.applyRoundByDecimal

    //Setting Origin
    try {
      this.addMarkerMini2(roundFunc(origin.lat, 8), roundFunc(origin.lng, 8), 'curr', origin.PortCode, origin.PortName)
      let position = new LatLng(roundFunc(origin.lat, 8), roundFunc(origin.lng, 8));
      bounds.extend(position);
    } catch (error) {
      console.warn('No origin in the data:', error)
    }
    //Setting Origin

    // Setting Past Routes
    try {
      this.addSliderMarker(roundFunc(currentLocation.lat, 8), roundFunc(currentLocation.lng, 8), 'a' + 0)
      pastRoutes.forEach(_port => {
        if (_port.IsPort || _port.IsGround) {
          this.addMarkerMini2(roundFunc(_port.lat, 8), roundFunc(_port.lng, 8), 'curr', _port.PortCode, _port.PortName)
          let position = new LatLng(roundFunc(_port.lat, 8), roundFunc(_port.lng, 8));
          bounds.extend(position);
        }
      })

      pastConnPort.forEach(port => {
        this.addMarkerMini2(roundFunc(port.lat, 8), roundFunc(port.lng, 8), 'curr', port.PortCode, port.PortName)
      });
    } catch (error) {
      console.warn('Past Routes data error:', error)
    }
    // Setting Past Routes

    // Setting Future Routes

    try {
      futureRoutes.forEach(_port => {
        if (_port.IsPort || _port.IsGround) {
          this.addMarkerMini2(roundFunc(_port.lat, 8), roundFunc(_port.lng, 8), 'dest', _port.PortCode, _port.PortName)
          let position = new LatLng(roundFunc(_port.lat, 8), roundFunc(_port.lng, 8));
          bounds.extend(position);
        }
      })
    } catch (error) {
      console.warn('future route data issue:', error)
    }
    // Setting Future Routes

    try {

      pastRoutes.push(currentLocation)

      // const currentIndex: number = futureRoutes.findIndex(route => route.lat === currentLocation.lat);

      // this.futureRoutes.splice(currentIndex, 1);
      // this.futureRoutes.push(currentLocation)

      const simPast = []
      const simFut = []

      pastRoutes.forEach(route => {
        const { lat, lng } = route
        simPast.push({
          lat,
          lng
        })
      })

      futureRoutes.forEach(route => {
        const { lat, lng } = route
        simFut.push({
          lat,
          lng
        })
      })


      const lineSymbol = {
        path: 'M 0,-1 0,1',
        strokeOpacity: 1,
        scale: 3.5
      };

      const line = new google.maps.Polyline({
        path: simPast,
        draggable: false,
        editable: false,
        strokeOpacity: 2,
        strokeColor: '#1caae3',
        // strokeWeight: 2,
        icons: [{
          // icon: lineSymbol2,
          offset: '100%'
        }],
        map: this.map
      });

      const line2 = new google.maps.Polyline({
        path: simFut,
        draggable: false,
        editable: false,
        strokeOpacity: 0,
        strokeColor: '#1caae3',
        icons: [{
          icon: lineSymbol,
          offset: '100%',
          repeat: '20px'
        }],
        map: this.map
      });

      this.map.fitBounds(bounds)
    } catch (error) {
      console.warn(error)
    }

  }

  async setPickUpDestData() {
    await this.setNewMap();
    try {
      let bounds = new LatLngBounds();

      const { LatitudeA, LongitudeA, LatitudeB, LongitudeB, transPortModeA, transPortModeB } = this.miniMapData;

      const roundedLat: number = this._currencyControl.applyRoundByDecimal(
        LatitudeA,
        8
      );
      const roundedLong: number = this._currencyControl.applyRoundByDecimal(
        LongitudeA,
        8
      );
      const roundedLat2 = this._currencyControl.applyRoundByDecimal(LatitudeB, 8);
      const roundedLong2 = this._currencyControl.applyRoundByDecimal(LongitudeB, 8);


      this.addMarkerMini(roundedLat, roundedLong, transPortModeA);
      this.addMarkerMini(roundedLat2, roundedLong2, transPortModeB);

      const position1 = new LatLng(roundedLat, roundedLong);
      const position2 = new LatLng(roundedLat2, roundedLong2);
      bounds.extend(position1);
      bounds.extend(position2);

      this.drawDashedLine(
        roundedLat,
        roundedLong, // point A
        roundedLat2,
        roundedLong2, // point B
        this.colors[0]
      );

      this.map.fitBounds(bounds); //can be
    } catch (err) {
    }
  }

  public warehouseMarkers = []
  async setWareHouseData() {
    this.galleryListeners = []
    this.shareListeners = []
    this.bookingListeners = []
    this.videoListerner = []
    this.multicardCount = 0
    if (!this.wareSearchResult) {
      return;
    }

    await this.setNewMap();
    const { wareSearchResult } = this
    let bounds = new LatLngBounds();
    let searchResult = wareSearchResult

    const duplicateArray: Array<WarehouseSearchResult> = this.checkWarehouseArray(wareSearchResult)

    if (duplicateArray && duplicateArray.length > 0) {
      duplicateArray.forEach(dup => {
        const newWareSearch: Array<WarehouseSearchResult> = []
        const { WHLatitude } = dup[0]
        wareSearchResult.forEach(res_main => {
          if (res_main.WHLatitude !== WHLatitude) {
            newWareSearch.push(res_main)
          }
        })
        searchResult = newWareSearch
      })
    }

    let totalMarkers: number = 0

    try {
      totalMarkers = duplicateArray.length + searchResult.length
    } catch (error) {
      totalMarkers = searchResult.length
    }


    const routeLength = searchResult.length

    for (let i = 0; i < routeLength; i++) {
      const route = searchResult[i];
      const { WHLatitude, WHLongitude } = route;
      const roundedLat: number = this._currencyControl.applyRoundByDecimal(WHLatitude, 8);
      const roundedLong: number = this._currencyControl.applyRoundByDecimal(WHLongitude, 8);
      this.addWarehouseMarker(roundedLat, roundedLong, i, route, 'a');
      let position = new LatLng(roundedLat, roundedLong);
      bounds.extend(position);
    }


    if (duplicateArray && duplicateArray.length > 0) {

      for (let index = 0; index < duplicateArray.length; index++) {
        const dup: any = duplicateArray[index];
        const route = dup[0];
        const { WHLatitude, WHLongitude } = route;
        const roundedLat: number = this._currencyControl.applyRoundByDecimal(WHLatitude, 8);
        const roundedLong: number = this._currencyControl.applyRoundByDecimal(WHLongitude, 8);
        this.addWarehouseMultiMarker(roundedLat, roundedLong, dup, `b${index}`);
        let position = new LatLng(roundedLat, roundedLong);
        bounds.extend(position);
      }
    }

    if (totalMarkers === 1) {
      this.map.setCenter(bounds.getCenter());
      this.map.setZoom(14);
    } else {
      this.map.fitBounds(bounds)
    }
    this._dataService.setmapWarehouseId(-1)
  }

  checkWarehouseArray(searchResult: Array<WarehouseSearchResult>) {

    const dupObjA = checkDuplicateInObject('WHLatLng', searchResult)

    let returnArr = []
    const { res, payload } = dupObjA
    const groups = []
    if (res) {
      payload.forEach(element => {
        const filteredArray: Array<WarehouseSearchResult> = searchResult.filter(res => res.WHLatLng === element)
        groups.push(filteredArray)
      })

      returnArr = groups
    }
    return returnArr
  }

  private prev_infowindow: any
  private car_LeftListeners: Array<any> = []
  private car_RightListeners: Array<any> = []

  private galleryListeners: Array<any> = []
  private shareListeners: Array<any> = []
  private bookingListeners: Array<any> = []
  private videoListerner: Array<string> = []


  async addWarehouseMarker(
    $latitude: number,
    $longitude: number,
    $ind: any,
    $searchCard: WarehouseSearchResult,
    $tag: string,
  ) {

    const $index = $ind + $tag


    const markericon = this.getWarehouseMarkerIcon($searchCard)

    const location = new google.maps.LatLng($latitude, $longitude);
    const marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(markericon),
        scaledSize: new google.maps.Size(80, 40),
      },
    });


    const $cardDiv = this.getWarehouseCard($searchCard, $index)
    const shareId: string = 'wareMarkerShare_' + $index
    const newGalleryId: string = 'wareGallery_' + $index
    const videoGalleryId: string = 'videoGalleryId_' + $index
    const proceedId: string = '_wareProceed' + $index

    const infowindow = new google.maps.InfoWindow({
      content: `<div>${$cardDiv}</div>`,
    })
    this.prev_infowindow = infowindow

    this.map.addListener('click', function () {
      if (this.prev_infowindow) {
        this.prev_infowindow.close();
      }
      this.prev_infowindow = infowindow
    });

    marker.addListener("mouseover", () => {
      if (this.prev_infowindow) {
        this.prev_infowindow.close();
      }

      this.prev_infowindow = infowindow;
      const { gmapElement } = this
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (this.currentInfoWindow) {
            this.currentInfoWindow.close();
          }
          this.currentInfoWindow = infowindow;
          infowindow.open(gmapElement, marker)
          resolve('foo');
        }, 0);
      }).then(() => {

        //for loop start
        setTimeout(() => {
          if (!isInArray(shareId, this.galleryListeners)) {
            const docElshareId = document.getElementById(shareId)
            try {
              docElshareId.addEventListener('click', this.markerClickHandler($searchCard, 'share'), false)
              this.galleryListeners.push(shareId)
            } catch (error) { }
          }

          if (!isInArray(proceedId, this.shareListeners)) {
            const docElproceedId = document.getElementById(proceedId)
            try {
              docElproceedId.addEventListener('click', this.markerClickHandler($searchCard, 'proceed'), false)
              this.shareListeners.push(proceedId)
            } catch (error) { }
          }

          if (!isInArray(newGalleryId, this.bookingListeners)) {
            const docElnewGalleryId = document.getElementById(newGalleryId)
            try {
              docElnewGalleryId.addEventListener('click', this.markerClickHandler($searchCard, 'gallery'), false)
              this.bookingListeners.push(newGalleryId)
            } catch (error) { }
          }
          if (!isInArray(videoGalleryId, this.videoListerner)) {
            const docElvideoGalleryId = document.getElementById(videoGalleryId)
            try {
              docElvideoGalleryId.addEventListener('click', this.markerClickHandler($searchCard, 'video'), false)
              this.bookingListeners.push(videoGalleryId)
            } catch (error) { }
          }
        }, 0);
        //for loop end

        JQ('.gm-style-iw').add().addClass('some-class');
      })
    });
    if (this._dataService.getmapWarehouseId() === $searchCard.WHID) {
      google.maps.event.trigger(marker, 'mouseover')
    }
    this.warehouseMarkers.push(marker)
  }



  private multicardCount: number = 0

  async addWarehouseMultiMarker(
    $latitude: number,
    $longitude: number,
    $searchCardArr: Array<WarehouseSearchResult>,
    $tag: string,
  ) {

    // this.multicardCount++

    const markericon = this.getWarehouseMarkerIcon($searchCardArr[0])
    const location = new google.maps.LatLng($latitude, $longitude);

    const marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(markericon),
        scaledSize: new google.maps.Size(80, 40),
      },
    });


    // const $cardDivArr =

    const multicardList: Array<string> = []


    const car_leftId: string = 'car_left' + this.multicardCount + $tag
    const car_rightId: string = 'car_right' + this.multicardCount + $tag

    const cardLenght: number = $searchCardArr.length

    for (let index = 0; index < cardLenght; index++) {
      const $searchCard = $searchCardArr[index];
      const $index: string = index + $tag
      const $cardDiv = this.getWarehouseCard($searchCard, $index)
      multicardList.push($cardDiv)
    }


    const multiCardLi = this.getMultiCardDiv(multicardList, $tag)

    const multiWindow = `
        <div class="info-master">
          <div class="carousel-container">
            <div class="carousel">
             ${multiCardLi}
            </div>
            <div class="carousel-controls">
              <button id="${car_leftId}" class="left"><i class="fa fa-angle-left"></i></button>
              <button id="${car_rightId}" class="right pull-right"> <i class="fa fa-angle-right"></i></button>
            </div>
          </div>
        </div>
    `

    const infowindow = new google.maps.InfoWindow({
      content: `<div>${multiWindow}</div>`,
    })
    this.prev_infowindow = infowindow

    this.map.addListener('click', function () {
      if (this.prev_infowindow) {
        this.prev_infowindow.close();
      }
      this.prev_infowindow = infowindow
    });

    marker.addListener("mouseover", () => {
      if (this.prev_infowindow) {
        this.prev_infowindow.close();
      }

      this.prev_infowindow = infowindow;
      const { gmapElement } = this
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (this.currentInfoWindow) {
            this.currentInfoWindow.close();
          }
          this.currentInfoWindow = infowindow;
          infowindow.open(gmapElement, marker)
          resolve('foo');
        }, 0);
      }).then(() => {
        setTimeout(() => {
          let item2Select: number = 1
          const whId = this._dataService.getmapWarehouseId()

          for (let index = 0; index < $searchCardArr.length; index++) {
            const $searchCard = $searchCardArr[index];

            const shareId: string = 'wareMarkerShare_' + index + $tag
            const newGalleryId: string = 'wareGallery_' + index + $tag
            const videoGalleryId: string = 'videoGalleryId_' + index + $tag
            const proceedId: string = '_wareProceed' + index + $tag

            if (whId === $searchCard.WHID) {
              item2Select = index + 1
            }

            setTimeout(() => {
              if (!isInArray(shareId, this.galleryListeners)) {
                const docElshareId = document.getElementById(shareId)
                try {
                  docElshareId.addEventListener('click', this.markerClickHandler($searchCard, 'share'), false)
                  this.galleryListeners.push(shareId)
                } catch (error) { }
              }

              if (!isInArray(proceedId, this.shareListeners)) {
                const docElproceedId = document.getElementById(proceedId)
                try {
                  docElproceedId.addEventListener('click', this.markerClickHandler($searchCard, 'proceed'), false)
                  this.shareListeners.push(proceedId)
                } catch (error) { }
              }

              if (!isInArray(newGalleryId, this.bookingListeners)) {
                const docElnewGalleryId = document.getElementById(newGalleryId)
                try {
                  docElnewGalleryId.addEventListener('click', this.markerClickHandler($searchCard, 'gallery'), false)
                  this.bookingListeners.push(newGalleryId)
                } catch (error) { }
              }

              if (!isInArray(videoGalleryId, this.videoListerner)) {
                const docElvideoGalleryId = document.getElementById(videoGalleryId)
                try {
                  docElvideoGalleryId.addEventListener('click', this.markerClickHandler($searchCard, 'video'), false)
                  this.videoListerner.push(videoGalleryId)
                } catch (error) { }
              }
            }, 0);
          }

          JQ(`.carousel #item${item2Select}${$tag}`).siblings().hide()
          JQ(`.carousel #item${item2Select}${$tag}`).show();
          this.startSlider($tag);
          try {
            if (!isInArray(car_leftId, this.car_LeftListeners)) {
              const _car_leftId = document.getElementById(car_leftId)
              _car_leftId.addEventListener('click', () => {
                this.showSlide(true, $tag);
                return false;
              }, false)
              this.car_LeftListeners.push(car_leftId)
            }
            if (!isInArray(car_rightId, this.car_RightListeners)) {
              const _car_rightId = document.getElementById(car_rightId)
              _car_rightId.addEventListener('click', () => {
                this.showSlide(false, $tag);
                return false;
              }, false)
              this.car_RightListeners.push(car_rightId)
            }
          } catch (error) { }
          JQ('.gm-style-iw').add().addClass('some-class');
        }, 0);
      })
    });

    const whId = this._dataService.getmapWarehouseId()
    let isMarkerIncluded: boolean = false
    $searchCardArr.forEach(wh => {
      if (wh.WHID === whId) {
        isMarkerIncluded = true
      }
    })

    if (isMarkerIncluded) {
      google.maps.event.trigger(marker, 'mouseover')
    }

    this.warehouseMarkers.push(marker)
  }


  getContainerCard(containerList: Array<ContainerDetail>): Array<string> {

    let finContList: Array<string> = []
    containerList.forEach(container => {
      const cardDiv = `
          <div class="d-flex flex-column">
        <div class="container-icon animated fadeInRight">
          <img src="../../../assets/images/icons/${container.ContainerImage}">
        </div>
        <label class="container-no-heading animated fadeInRightBig">
          Container No.
        </label>
        <p class="number animated fadeInLeftBig">${container.ContainerNo}</p>
        <p class="size mt-2 text-center animated fadeInUpBig">${container.ContainerShortName}</p>
      </div>
      `

      finContList.push(cardDiv)

    })

    return finContList

  }


  async addSliderMarker(
    $latitude: number,
    $longitude: number,
    $tag: string,
  ) {
    try {

      const location = new google.maps.LatLng($latitude, $longitude);

      const icon = {
        url: `../../../assets/images/icons/ic_curr_anim_new.svg`,
        scaledSize: new google.maps.Size(35, 35),
      };

      const marker = new google.maps.Marker({
        icon,
        position: location,
        map: this.map
      });

      // this.trackingData.ContainerDetails = [{
      //   ContainerImage: '',
      //   ContainerNo: "",
      //   ContainerShortName: "",
      //   ContainerSpecCode: "",
      //   ContainerSpecDesc: "",
      //   IsQualityMonitoringRequired: false,
      //   IsTrackingRequired: false
      // }, {
      //   ContainerImage: '',
      //   ContainerNo: "",
      //   ContainerShortName: "",
      //   ContainerSpecCode: "",
      //   ContainerSpecDesc: "",
      //   IsQualityMonitoringRequired: false,
      //   IsTrackingRequired: false
      // }]


      const multicardList = this.getContainerCard(this.trackingData.ContainerDetails)
      const totalContainers = this.trackingData.ContainerDetails.length

      const spanId = 'spanId' + $tag
      const car_leftId: string = 'car_left' + this.multicardCount + $tag
      const car_rightId: string = 'car_right' + this.multicardCount + $tag

      const multiCardLi = this.getMultiContainerDiv(multicardList, $tag)

      //This part is the  containers
      const multiWindow = `
    <div class="ship-info-card">
      <div class="card">
        <img src="${getImagePath(ImageSource.FROM_SERVER, this.trackingData.VesselInfo.VesselPhotos[0].DocumentFileName, ImageRequiredSize.original)}" alt="" class="w-100">
        <div class="card-body">
          <div class="d-flex containers-detail">
            <img src="../../../../assets/images/icons/flags/1x1/${this.trackingData.VesselInfo.VesselFlag.toLowerCase()}.svg" alt="" class="containers-detail-country-icon mr-3 mt-1">
            <div class="d-block">
              <blockquote class="containers-detail-title">${this.trackingData.VesselInfo.VesselName}</blockquote>
              <p class="containers-detail-name">${this.trackingData.VesselInfo.VesselType} Ship</p>
            </div>
          </div>
          <div class="info-master">
            <div class="carousel-container">
            <p class="container-quantity"><span id="${spanId}">${this.iCurrentSlide}</span> of ${totalContainers} containers</p>
              <div class="carousel">
              ${multiCardLi}
              </div>
              <div class="carousel-controls">
                <button id="${car_leftId}" class="left"><i class="fa fa-angle-left"></i></button>
                <button id="${car_rightId}" class="right pull-right"> <i class="fa fa-angle-right"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`

      if (totalContainers <= 1) {
        jQuery(`#${car_leftId}`).hide()
        jQuery(`#${car_rightId}`).hide()
      }

      const infowindow = new google.maps.InfoWindow({
        content: `<div>${multiWindow}</div>`,
      })

      this.prev_infowindow = infowindow

      this.map.addListener('click', function () {
        if (this.prev_infowindow) {
          this.prev_infowindow.close();
        }
        this.prev_infowindow = infowindow
      });

      marker.addListener("mouseover", () => {
        if (this.prev_infowindow) {
          this.prev_infowindow.close();
        }

        this.prev_infowindow = infowindow;
        const { gmapElement } = this
        new Promise((resolve, reject) => {
          setTimeout(() => {
            if (this.currentInfoWindow) {
              this.currentInfoWindow.close();
            }
            this.currentInfoWindow = infowindow;
            infowindow.open(gmapElement, marker)
            resolve('foo');
          }, 0);
        }).then(() => {
          setTimeout(() => {
            let item2Select: number = 1

            JQ(`.carousel #item${item2Select}${$tag}`).siblings().hide()
            JQ(`.carousel #item${item2Select}${$tag}`).show();
            this.startSlider($tag);
            try {
              if (!isInArray(car_leftId, this.car_LeftListeners)) {
                const _car_leftId = document.getElementById(car_leftId)
                _car_leftId.addEventListener('click', () => {
                  this.showSlide(true, $tag);
                  document.getElementById(spanId).innerHTML = this.iCurrentSlide.toString()
                  return false;
                }, false)
                this.car_LeftListeners.push(car_leftId)
              }
              if (!isInArray(car_rightId, this.car_RightListeners)) {
                const _car_rightId = document.getElementById(car_rightId)
                _car_rightId.addEventListener('click', () => {
                  this.showSlide(false, $tag);
                  document.getElementById(spanId).innerHTML = this.iCurrentSlide.toString()
                  return false;
                }, false)
                this.car_RightListeners.push(car_rightId)
              }
            } catch (error) {

            }
            // changing animation class on click
            const animateTarget = document.querySelectorAll('.ship-info-card .carousel-item .container-icon');
            const animateTarget2 = document.querySelectorAll('.ship-info-card .carousel-item .container-no-heading');
            const animateTarget3 = document.querySelectorAll('.ship-info-card .carousel-item .number');

            JQ('button#car_left0a0').click(function () {
              JQ(animateTarget).removeClass('animated fadeInRight');
              JQ(animateTarget2).removeClass('animated fadeInRightBig');
              JQ(animateTarget3).removeClass('animated fadeInLeftBig');
              JQ(animateTarget).addClass('animated fadeInLeft');
              JQ(animateTarget2).addClass('animated fadeInLeftBig');
              JQ(animateTarget3).addClass('animated fadeInRightBig');
            });
            JQ('button#car_right0a0').click(function () {
              JQ(animateTarget).removeClass('animated fadeInLeft');
              JQ(animateTarget2).removeClass('animated fadeInLeftBig');
              JQ(animateTarget3).removeClass('animated fadeInRightBig');
              JQ(animateTarget).addClass('animated fadeInRight');
              JQ(animateTarget2).addClass('animated fadeInRightBig');
              JQ(animateTarget3).addClass('animated fadeInLeftBig');
            });
            // Increasing height of card
            const windowLocation = window.location.pathname;
            if (windowLocation.includes('booking-detail')) {
              JQ('.ship-info-card').parent().parent().parent().parent().add().addClass('google-map-ship-card');
              JQ('.ship-info-card').parent().parent().parent().parent().parent().add().addClass('ship-info-card-main');
            }
            JQ('.gm-style-iw').add().addClass('some-class');
          }, 0);
        })
      });
    } catch (error) {
    }
  }


  getMultiContainerDiv($multiList: Array<string>, $tag): string {
    ///This part is only for Image slider
    let someArr = [];
    const multiLenght = $multiList.length
    for (let index = 0; index < multiLenght; index++) {
      this.multicardCount++
      const card = $multiList[index];
      let str: string = `
        <div id="item${(index + 1) + '' + $tag}" class="carousel-item">
          <div clas="d-block">
            ${card}
          </div>
          <!-- <span style="font-weight:600;position: absolute">${(index + 1)}/${multiLenght}</span>-->
        </div>
      `;
      someArr.push(str);
    }
    let some: string = "";
    someArr.forEach(elem => {
      some = some + elem;
    });
    return some;
  }
  getMultiCardDiv($multiList: Array<string>, $tag): string {
    let someArr = [];
    const multiLenght = $multiList.length
    for (let index = 0; index < multiLenght; index++) {
      this.multicardCount++
      const card = $multiList[index];
      let str: string = `
        <div id="item${(index + 1) + '' + $tag}" class="carousel-item">
          <span style="font-weight:600;position: absolute">${(index + 1)}/${multiLenght}</span>
          ${card}
        </div>
      `;
      someArr.push(str);
    }
    let some: string = "";
    someArr.forEach(elem => {
      some = some + elem;
    });
    return some;
  }

  getWarehouseMarkerIcon($searchCard) {

    const currControl = new CurrencyControl()

    const markericon = [
      `<?xml version="1.0" encoding="utf-8"?>`,
      `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"`,
      `viewBox="0 0 130 54.6" style="enable-background:new 0 0 130 54.6;" xml:space="preserve">`,
      `<style type="text/css">`,
      '@import url("https://use.typekit.net/gwn1jtf.css");',
      `.st0{fill:#FFFFFF;}`,
      `.st1{fill:#14AAE1;}`,
      '.price{font-family:"pragmatica",sans-serif;text-align:center;}',
      `</style>`,
      `<g>`,
      `<path class="st0" d="M124.3,0H5.7C2.6,0,0,2.1,0,4.6v35c0,2.6,2.6,4.6,5.7,4.7h46.4L65,54.6l12.7-10.4h46.5c3.1,0,5.7-2.1,5.7-4.6`,
      `V4.6C130,2,127.4,0,124.3,0z M127.7,39.6c0,1.6-1.6,2.7-3.4,2.7H76.8L65,52l-11.8-9.6L5.7,42.3c-1.8,0-3.4-1.3-3.4-2.7v-35`,
      `c0-1.4,1.6-2.6,3.4-2.7h118.6c1.8,0,3.4,1.3,3.4,2.7V39.6z"/>`,
      `<path class="st1" d="M124.3,1.8H5.7C3.9,2,2.3,3.1,2.3,4.6v35c0,1.4,1.6,2.7,3.4,2.7l47.4,0.1L65,52l11.8-9.6h47.4`,
      `c1.8,0,3.4-1.2,3.4-2.7V4.6C127.7,3.1,126.1,1.8,124.3,1.8z"/>`,
      `<text x="4" y="22" fill="#fff" font-size="18px" font-weight="600" class="price" transform="translate(7,7)">${$searchCard.CurrencyCode} ${kFormatter(currControl.applyRoundByDecimal($searchCard.TotalPrice, 2))}</text>`,
      `</g>`,
      `</svg>`
    ].join('\n');
    return markericon
  }

  getWarehouseCard($searchCard, $index) {

    let searchDocs: string = 'null'
    try {
      searchDocs = JSON.parse($searchCard.WHMedia)[0].DocumentFile
    } catch (error) { }
    const searchCriteria: WarehouseSearchCriteria = JSON.parse(HashStorage.getItem('searchCriteria'));
    const { StoreUntill, StoreFrom, searchBy, storageType } = searchCriteria
    const newDiff = getDateDiff(StoreUntill, StoreFrom, 'days', "MM-DD-YYYY")
    const carrierImage: string = getImagePath(ImageSource.FROM_SERVER, searchDocs, ImageRequiredSize.original)
    const providerImage = getImagePath(ImageSource.FROM_SERVER, getProviderImage($searchCard.ProviderImage), ImageRequiredSize.original)

    let strCurrentDay = moment(new Date()).format('dddd')
    let strTime = 'Closed'


    // $searchCard.WHParsedTiming.forEach(timing => {
    //   if (timing.DayName.toLowerCase() === strCurrentDay.toLowerCase()) {
    //     if (timing.OpeningTime && timing.OpeningTime && !timing.IsClosed) {
    //       strTime = timing.OpeningTime + ' to ' + timing.ClosingTime
    //     }
    //   }
    // })
    let hasVideo: number = 0
    try {
      const parseMedia = JSON.parse($searchCard.WHMedia)
      hasVideo = parseMedia.filter(doc => doc.DocumentUploadedFileType.toLowerCase() === 'mp4').length
    } catch (error) {
    }

    const $cardDiv = `
      <div class="google-map-card animated fadeIn">

    <div class="card p-0 border-0 pt-0">

        <div class="google-map-card-video-section mt-0 border">
            <div class="logo pointer">
                <img id="wareGallery_${$index}" src="${carrierImage}" alt="">
                <div class="gallery-section">
                    <div class="gallery-section-item d-flex justify-content-center align-items-center">
                        <img src="../../../../assets/images/icons/icon_pictures.svg" alt="" class="icon-size-14 mr-1">
                        ${
      $searchCard.WHParsedMedia &&
        $searchCard.WHParsedMedia.length
        ? $searchCard.WHParsedMedia.length
        : 0
      }
                    </div>
                    <div class="video-icon" style="display:${
      hasVideo && hasVideo > 0 ? "flex" : "none"
      }" id="videoGalleryId_${$index}">
                      <a href="javascript:;" > <i class="fa fa-play"></i> </a>
                    </div>
                </div>


            </div>
        </div>
        <div class="card-body pt-0">
            <span style="display:${
      $searchCard.DiscountPrice ? "block" : "none"
      }" class="badge hashmove-badge-secondary quantity-off">10%
                OFF</span>
            <div class="row">
                <div class="col-9 mt-0 seperator-l pr-0">
                    <h5 class="card-title mb-2 d-flex justify-content-between">
                        ${$searchCard.WHName}
                        <div class="provider-icon">
                            <img alt="" src="${providerImage}">
                        </div>
                    </h5>
                    <ul class="list-group mt-2 flex-inherit">
                        <li class="list-group-item mr-2">
                            <img src="../../../../assets/images/icons/Icons_Location-grey.svg" alt="icon" class="icon-size-16 mr-2">
                            ${$searchCard.WHAddress}
                            <br/>
                        </li>
                        <li class="list-group-item mr-2">
                            <img src="../../../../assets/images/icons/icon_grid.svg" alt="icon" class="icon-size-16 mr-2">
                            ${this._currencyControl.applyRoundByDecimal($searchCard.WHAreaInSQFT, 2)}&nbsp;<span>${this.getUnit(searchBy, storageType)}</span>
                            <br/>
                        </li>
                    </ul>
                    <p style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;max-width: 360px;">${
      $searchCard.WHDesc
      }</p>
                    <ul class="list-group flex-row mt-3">
                    <li class="list-group-item ml-1" style="display:${
      $searchCard.IsBondedWarehouse ? "flex" : "none"
      }">
                        <img src="../../../../assets/images/icons/Icons_Warehousing_green.svg" alt="" class="icon-size-16">
                    </li>
                    <li class="list-group-item ml-1" style="display:${
      $searchCard.IsTransportAvailable ? "flex" : "none"
      }">
                        <img src="../../../../assets/images/icons/Icons_Cargo Truck_orange.svg" alt="" class="icon-size-16">
                    </li>
                  </ul>
                </div>
                <div class="col-3 mt-0 p-0 pl-3">
                    <div class="warehousing-content">
                        <label class="card-text country-code">
                            ${$searchCard.CurrencyCode}
                        </label>
                        <div class="text-truncate">
                            <strong id="HoverTarget${$index}" class="card-text country-price" data-toggle="tooltip" data-placement="top">
                                 ${$searchCard.TotalPrice.toLocaleString()}
                            </strong>
                            <div id="CustomToolTip${$index}" class="defaultTooltop">
                              ${$searchCard.TotalPrice.toLocaleString()}
                            </div>
                        </div>
                        <small class="font-italic mt-1">${
      newDiff && newDiff > 0
        ? `Price for ${newDiff} days`
        : searchCriteria.minimumLeaseTerm < 12
          ? "Monthly"
          : "Yearly"
      }</small>
                    </div>
                    <br/>
                    <br/>
                    <button id="_wareProceed${$index}" class="btn btn-primary book-btn hvr-sweep-to-right ng-star-inserted text-uppercase w-100 mt-2">Proceed</button>
                </div>
            </div>
        </div>
    </div>
    </div>
    `;

    // setTimeout(() => {

    //       JQ(`#CustomToolTip${$index}`).hide();

    //       JQ(`#HoverTarget${$index}`).mouseover(() => {

    //         JQ(`#CustomToolTip${$index}`).show();
    //       });

    //       JQ(`#HoverTarget${$index}`).mouseleave(() => {
    //         JQ(`#CustomToolTip${$index}`).hide();
    //       });
    // }, 1000);



    // const customTooltip = document.querySelector("CustomToolTip");
    // const HvrTrgt = document.querySelector("#HoverTarget");

    // HvrTrgt.addEventListener("click", function() {
    //   alert('test')
    // });


    return $cardDiv
  }

  getUnit(searchBy: string, storageType: string) {
    if ((searchBy === 'by_unit' || searchBy === 'by_vol_weight') && storageType === 'shared') {
      return `CBM`
    } else {
      return `ft<sup>2</sup>`
    }
  }


  startSlider($tag) {
    this.nItems = JQ('.carousel .carousel-item').length
  }

  showSlide(isPrev, $tag) {
    window.clearInterval(this.looper);
    var iNewSlide = 0;
    if (isPrev) {
      iNewSlide = --this.iCurrentSlide;
      if (iNewSlide < 1)
        iNewSlide = this.nItems;
      JQ('.carousel #item' + iNewSlide + $tag).siblings().hide()
      JQ('.carousel #item' + iNewSlide + $tag).show();
    }
    else {
      iNewSlide = ++this.iCurrentSlide;
      if (iNewSlide > this.nItems)
        iNewSlide = 1;
      JQ('.carousel #item' + iNewSlide + $tag).siblings().hide()
      JQ('.carousel #item' + iNewSlide + $tag).show();
    }
    // if (iNewSlide > this.nItems)
    //   iNewSlide = 1;
    // else if (iNewSlide < 1)
    //   iNewSlide = this.nItems;
    this.iCurrentSlide = iNewSlide;
    this.iNextSlide = iNewSlide + 1;
  }

  async setWarehouseMiniMap() {
    await this.setNewMap();
    try {
      const bounds = new LatLngBounds();

      const { WHLatitude, WHLongitude } = this.wareHouseMiniMapData;

      const roundedLat: number = this._currencyControl.applyRoundByDecimal(
        WHLatitude,
        8
      );
      const roundedLong: number = this._currencyControl.applyRoundByDecimal(
        WHLongitude,
        8
      );
      this.addMarkerMini(roundedLat, roundedLong)

      const position1 = new LatLng(roundedLat, roundedLong);
      bounds.extend(position1);
      // this.map.fitBounds(bounds); //can be
      this.map.setCenter(bounds.getCenter());
      this.map.setZoom(14);
    } catch (err) {
    }
  }

  async setContainerMapData() {
    await this.setNewMap()
    try {
      const { lat, lng, mode } = this.singleContData
      let bounds = new LatLngBounds();
      if (lat > 0 && lng > 0) {

        let pos = new LatLng(
          this._currencyControl.applyRoundByDecimal(lat, 8),
          this._currencyControl.applyRoundByDecimal(lng, 8),
        );
        this.addMarkerMini(lat, lng, mode)
        bounds.extend(pos);
        this.map.setCenter(bounds.getCenter());
        this.map.setZoom(14);
      }
    } catch (error) {
      console.warn(error)
    }
  }
  ngOnDestroy() { }
}

const GmapsCubicBezier = (
  latlong1,
  latlong2,
  latlong3,
  latlong4,
  resolution,
  map
) => {
  let lat1 = latlong1.lat();
  let long1 = latlong1.lng();
  let lat2 = latlong2.lat();
  let long2 = latlong2.lng();
  let lat3 = latlong3.lat();
  let long3 = latlong3.lng();
  let lat4 = latlong4.lat();
  let long4 = latlong4.lng();

  let points = [];

  for (let it = 0; it <= 1; it += resolution) {
    points.push(
      mapUtils.getBezier(
        {
          x: lat1,
          y: long1
        },
        {
          x: lat2,
          y: long2
        },
        {
          x: lat3,
          y: long3
        },
        {
          x: lat4,
          y: long4
        },
        it
      )
    );
  }
  let path = [];
  for (let i = 0; i < points.length - 1; i++) {
    path.push(new google.maps.LatLng(points[i].x, points[i].y));
    path.push(new google.maps.LatLng(points[i + 1].x, points[i + 1].y, false));
  }

  let Line = new google.maps.Polyline({
    path: path,
    geodesic: true,
    strokeOpacity: 0.0,
    icons: [
      {
        icon: {
          path: "M 0,-1 0,1",
          strokeOpacity: 1,
          scale: 4
        },
        offset: "0",
        repeat: "20px"
      }
    ],
    strokeColor:
      "#" +
      Math.floor(Math.random() * 10) +
      "caae" +
      Math.floor(Math.random() * 10)
  });

  Line.setMap(map);

  return Line;
};

const mapUtils = {
  B1: t => {
    return t * t * t;
  },
  B2: t => {
    return 3 * t * t * (1 - t);
  },
  B3: t => {
    return 3 * t * (1 - t) * (1 - t);
  },
  B4: t => {
    return (1 - t) * (1 - t) * (1 - t);
  },
  getBezier: (C1, C2, C3, C4, percent) => {
    let pos = {
      x: 0,
      y: 0
    };
    pos.x =
      C1.x * mapUtils.B1(percent) +
      C2.x * mapUtils.B2(percent) +
      C3.x * mapUtils.B3(percent) +
      C4.x * mapUtils.B4(percent);
    pos.y =
      C1.y * mapUtils.B1(percent) +
      C2.y * mapUtils.B2(percent) +
      C3.y * mapUtils.B3(percent) +
      C4.y * mapUtils.B4(percent);
    return pos;
  }
};

export interface WarehouseEmitModel {
  searchResult?: WarehouseSearchResult;
  type?: string
}

export interface WhMarkerAction {
  marker: any;
  id: number
}

