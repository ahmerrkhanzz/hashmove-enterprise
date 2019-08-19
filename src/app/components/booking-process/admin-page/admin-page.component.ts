import { Component, OnInit, Renderer2, ViewChild, OnDestroy, NgZone, ElementRef } from '@angular/core';
import { PolygonData } from '../../../interfaces/poly.interface';
import { AdminService } from './admin-page.service';
// import { } from "@types/googlemaps"; // for angular 5
import { } from "googlemaps"; // for angular 7
import { DropDownService } from '../../../services/dropdownservice/dropdown.service';
import { HttpErrorResponse } from '@angular/common/http';
import { City } from '../../../interfaces/warehousing';
import { Observable, of } from 'rxjs';
import { Country } from '../../../interfaces/dropdown';
import { ToastrService } from 'ngx-toastr';
import { JsonResponse } from '../../../interfaces/JsonResponse';
import { loading } from '../../../constants/globalfunctions';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit, OnDestroy {

  public polygonArray: Array<PolygonData> = [];

  @ViewChild("polyMap") polyMap: ElementRef;
  @ViewChild("cityInput") cityInput: ElementRef;
  map: google.maps.Map;
  // markers = [];
  rectangle;
  myPolygon;

  disableControls = false
  autocomplete: any
  cityList: Array<City> = []
  city: City = {
    title: "",
    imageName: "",
    desc: '',
    id: null
  };

  currentPolyGon: PolygonData = {
    cityID: null,
    countryID: null,
    gLocCode: null,
    gLocID: null,
    gLocName: null,
    gLocShortName: null,
    modeOfTrans: null,
    polygonPointsText: null,
    searchTags: null,
  }
  isCityEntered: boolean = false
  isPlaced: boolean = false
  gLocName: string = ''
  gLocCode: string = ''
  input: HTMLInputElement


  constructor(
    private renderer: Renderer2,
    private _adminService: AdminService,
    private _dropDownService: DropDownService,
    private ngZone: NgZone,
    private _toastr: ToastrService
  ) { }

  async ngOnInit() {
    this.getCities()
    this.renderer.addClass(document.body, 'bg-grey');
    this.renderer.removeClass(document.body, 'bg-white');
    this.renderer.removeClass(document.body, 'bg-lock-grey');

    await this.fetchPolygons()
    this.initMap()
  }

  async fetchPolygons() {
    try {
      const res: any = await this._adminService.getPolygons().toPromise()
      this.polygonArray = res
    } catch (err) {
    }
  }


  async initMap() {
    await this.setMapState(25.0667638, 55.1337545, 12)
    this.input = document.getElementById('pac-input') as any


    this.autocomplete = new google.maps.places.Autocomplete(this.input);
    // this.autocomplete.setTypes(['address', 'establishment', 'geocode'])
    // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.
    this.autocomplete.bindTo('bounds', this.map);

    //idh ajao
    // this.map.addListener('click', function () {
    //   if (this.prev_infowindow) {
    //     this.prev_infowindow.close();
    //   }
    //   this.prev_infowindow = infowindow
    // });

    // Set the data fields to return when the user selects a place.
    this.autocomplete.setFields(['address_components', 'geometry', 'icon', 'name']);
    this.autocomplete.setTypes(['establishment']);

    this.autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place = this.autocomplete.getPlace();
        if (place.geometry === undefined || place.geometry === null) {
          return;
        }
        if (!place.geometry) {
          // User entered the name of a Place that was not suggested and
          // pressed the Enter key, or the Place Details request failed.
          window.alert("No details available for input: '" + place.name + "'");
          return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
          this.map.fitBounds(place.geometry.viewport);
        } else {
          this.map.setCenter(place.geometry.location);
          this.map.setZoom(17);  // Why 17? Because it looks good.
        }

        this.PlaceTriangle()
      })
    });
    // Sets a listener on a radio button to change the filter type on Places
    // Autocomplete.



    // this.setupClickListener('changetype-all', []);
    // this.setupClickListener('changetype-address', ['address']);

    // this.DrawActivePolygons(this.polygonArray);
  }

  async setMapState(lat: number, lng: number, zoomLvl) {
    let mapProp: any = {
      center: new google.maps.LatLng(lat, lng),
      // center: new google.maps.LatLng(25.0667638, 55.1337545),
      zoom: zoomLvl,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: this.disableControls ? true : true,
      zoomControl: this.disableControls ? false : true,
      gestureHandling: this.disableControls ? 'none' : ""
    };

    this.map = await new google.maps.Map(
      this.polyMap.nativeElement,
      mapProp
    );
  }

  getCities() {
    this._dropDownService.getCity().subscribe((res: any) => {
      this.cityList = res;
    }, (err: HttpErrorResponse) => {
    })
  }

  savePolygon() {

    //   cityID: null,
    // countryID: null,
    // gLocCode: null,
    // gLocID: null,
    // gLocName: null,
    // gLocShortName: null,
    // modeOfTrans: null,
    // polygonPointsText: null,
    // searchTags: null,

    if (!this.gLocCode || !this.gLocName) {
      this._toastr.warning('Please fill location Data to save Location', 'Insufficient Details')
      return
    }

    loading(true)

    this.getPolygonCoords()

    this.currentPolyGon.gLocID = -1
    this.currentPolyGon.cityID = this.city.id
    this.currentPolyGon.countryID = this.country.CountryID
    this.currentPolyGon.gLocCode = this.country.CountryCode + ' ' + this.gLocCode
    this.currentPolyGon.gLocName = this.gLocName
    this.currentPolyGon.gLocShortName = this.gLocName
    this.currentPolyGon.modeOfTrans = 'GROUND'
    this.currentPolyGon.searchTags = 'Some Country'

    this._adminService.setPolygons(this.currentPolyGon).subscribe(async (res: JsonResponse) => {
      const { returnId, returnStatus, returnText } = res
      loading(false)
      if (returnId > 0) {
        this.resetInputs()
        if (this.city && this.city.id > 0 && this.country && this.country.CountryID > 0) {
          await this.fetchPolygons()
          this.setPolygons()
        }
        this._toastr.success(returnStatus, 'Success')
      } else {
        this._toastr.error(returnText, 'Failed')
      }


    }, (err: HttpErrorResponse) => {
      loading(false)
      this._toastr.error(err.message, 'Failed')
    })
  }

  setupClickListener(id, types) {
    this.autocomplete.setTypes(types);
  }

  resetInputs() {


    this.input.value = ''

    this.gLocCode = ''
    this.gLocName = ''
    this.isCityEntered = false
    this.isPlaced = false



    this.currentPolyGon = {
      cityID: null,
      countryID: null,
      gLocCode: null,
      gLocID: null,
      gLocName: null,
      gLocShortName: null,
      modeOfTrans: null,
      polygonPointsText: null,
      searchTags: null,
    }

  }

  resetCityCountry() {
    this.cityInput.nativeElement.value = ''

    this.city = {
      title: "",
      imageName: "",
      desc: '',
      id: null
    };

    this.country = {
      CountryCode: '',
      CountryID: null,
      CountryPhoneCode: '',
      CountryName: ''
    }
  }

  getPolygonCoords() {
    let len = this.myPolygon.getPath().getLength();
    let htmlStr = "POLYGON((";
    let firstLatLng: string = ''
    for (let i = 0; i < len; i++) {
      let coordinates = this.myPolygon.getPath().getAt(i).toUrlValue(5);
      let corArr = coordinates.split(',')
      coordinates = corArr[1] + ' ' + corArr[0] + ','
      if (i === 0) { firstLatLng = coordinates }
      htmlStr += coordinates;
    }
    htmlStr += firstLatLng.replace(',', '') + "))";
    this.currentPolyGon.polygonPointsText = htmlStr
  }

  PlaceTriangle() {
    const { value } = this.input

    if (!this.city.id || this.city.id < 0 || !this.country.CountryID || this.country.CountryID < 0 || !value) {
      this._toastr.warning('Select city and Address first', 'Incomplete Action')
      return
    }

    let mylat = this.map.getCenter().lat();
    let mylng = this.map.getCenter().lng();
    // Polygon Coordinates
    let triangleCoords = [
      new google.maps.LatLng(mylat, mylng),
      new google.maps.LatLng(mylat + 0.001, mylng + 0.004),
      new google.maps.LatLng(mylat + 0.002, mylng + 0.003)
    ];
    // Styling & Controls
    this.myPolygon = new google.maps.Polygon({
      paths: triangleCoords,
      draggable: true, // turn off if it gets annoying
      editable: true,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35
    });

    this.myPolygon.setMap(this.map);
    this.isPlaced = true
    // attachPolygonInfoWindow(myPolygon)

  }
  attachPolygonInfoWindow(polygon, polygoname) {
    let infoWindow = new google.maps.InfoWindow();
    google.maps.event.addListener(polygon, 'mouseover', (e) => {
      infoWindow.setContent(polygoname);
      let latLng = e.latLng;
      infoWindow.setPosition(latLng);
      infoWindow.open(this.map);
    });
    google.maps.event.addListener(polygon, 'mouseout', (e) => {
      infoWindow.close()
    });
  }
  DrawActivePolygons(polygonArray) {
    let i: any = 0
    for (i in polygonArray) {
      if (polygonArray[i].polygonPointsText) {
        let GroundLocation = polygonArray[i];
        let GroundLocationName = GroundLocation.gLocName;
        let GroundLocationPolygon = GroundLocation.polygonPointsText;
        GroundLocationPolygon = GroundLocationPolygon.replace("POLYGON((", "")
        GroundLocationPolygon = GroundLocationPolygon.replace("))", "")
        let GroundLocationarraySplit = GroundLocationPolygon.split(',')

        let GroundLocationPolygonCoordinates = [];
        let j: any = 0
        for (j in GroundLocationarraySplit) {
          let LatLongString = GroundLocationarraySplit[j];
          let LatLongStringArray: any = LatLongString.split(" ");
          let myLatLng_ = new google.maps.LatLng(LatLongStringArray[1], LatLongStringArray[0]);

          GroundLocationPolygonCoordinates.push(myLatLng_)

        }
        let newmyPolygon = new google.maps.Polygon({
          paths: GroundLocationPolygonCoordinates,
          draggable: false, // turn off if it gets annoying
          editable: false,
          strokeColor: '#FFFFF',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FFF00',
          fillOpacity: 0.35
        });
        newmyPolygon.setMap(this.map);
        this.attachPolygonInfoWindow(newmyPolygon, GroundLocationName)
      }
    }
  }
  PlaceBoundingBox() {

    let mylat = this.map.getCenter().lat();
    let mylng = this.map.getCenter().lng();
    let bounds_ = [
      new google.maps.LatLng(mylat, mylng),
      new google.maps.LatLng(mylat + 0.01, mylng + 0.01),
      new google.maps.LatLng(mylat + 0.02, mylng + 0.02)
    ];

    const polyData: any = {
      bounds: bounds_,
      editable: true,
      draggable: true
    }

    this.rectangle = new google.maps.Polygon(polyData);
    this.rectangle.setMap(this.map);
    this.rectangle.addListener('click', this.showNewRect);

  }
  showNewRect(event) {
    let ne = this.rectangle.getBounds().getNorthEast();
    let sw = this.rectangle.getBounds().getSouthWest();

    let contentString =
      'New north-east corner: ' + ne.lat() + ', ' + ne.lng() +
      'New south-west corner: ' + sw.lat() + ', ' + sw.lng();

    // Set the info window's content and position.
    alert(contentString)
  }
  // setMapOnAll() {
  //   for (let i = 0; i < this.markers.length; i++) {
  //     this.markers[i].setMap(this.map);
  //   }
  // }

  onCityChange($event) {
  }

  isCitySearching: boolean = false
  hasCitySearchFailed: boolean = false
  hasCitySearchSuccess: boolean = false

  search2 = (text$: Observable<string>) =>
    text$
      .debounceTime(300) //debounce time
      .distinctUntilChanged()
      .do(() => { this.isCitySearching = true; this.hasCitySearchFailed = false; this.hasCitySearchSuccess = false; }) // do any action while the user is typing
      .switchMap(term => {
        let some = of([]); //  Initialize the object to return
        if (term && term.length >= 3) { //search only if item are more than three
          some = this._dropDownService.getFilteredCity(term)
            .do((res) => { this.isCitySearching = false; this.hasCitySearchSuccess = true; return res; })
            .catch(() => { this.isCitySearching = false; this.hasCitySearchFailed = true; return []; })
        } else { this.isCitySearching = false; some = of([]); }
        return some;
      })
      .do((res) => { this.isCitySearching = false; return res; })
      .catch(() => { this.isCitySearching = false; return of([]); }); // final server list

  country: Country

  formatter = (x: { title: string; desc: string; imageName: string; id: number }) => {
    this.city.imageName = x.imageName;
    this.city.title = x.title;
    this.city.desc = x.desc;
    this.city.id = x.id

    this.country = JSON.parse(x.desc)[0]
    const { CountryCode } = this.country

    this.autocomplete.setComponentRestrictions({ 'country': CountryCode.toLowerCase() });

    this.setPolygons()

    return x.title;
  };

  setPolygons() {
    const { polygonArray, city, country } = this
    const filteredPoly = polygonArray.filter(poly => poly.countryID === country.CountryID)
    const countryName = this.country.CountryName.toLowerCase()

    const cityName = city.title.toLowerCase()

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': `${cityName}, ${countryName}` }, async (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        const lat = results[0].geometry.location.lat()
        const lng = results[0].geometry.location.lng()
        await this.setMapState(lat, lng, 12)
        this.DrawActivePolygons(filteredPoly);
        this.isCityEntered = true
      } else {
      }
    })
  }


  onUndo() {
    // this.setMapState()
    this.resetCityCountry()
    this.resetInputs()

    if (this.myPolygon) {
      this.myPolygon.setMap(null);
    }
    this.isPlaced = false
  }

  ngOnDestroy() { }

}








