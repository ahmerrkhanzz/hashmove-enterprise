import {
  Component,
  OnInit,
  SimpleChange,
  SimpleChanges,
  ViewEncapsulation,
  AfterViewInit,
  ChangeDetectorRef,
  AfterViewChecked
} from "@angular/core";
import { BookingList } from "../../../interfaces/user-dashboard";
import { BookingDetails } from "../../../interfaces/bookingDetails";
import { UserService } from "../user-service";
import { ToastrService } from "ngx-toastr";
import { NgbModal, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DataService } from "../../../services/commonservice/data.service";
import { Router, ActivatedRoute } from "@angular/router";
import { CancelBookingDialogComponent } from "../../../shared/dialogues/cancel-booking-dialog/confirm-booking-dialog.component";
import { Tea, encryptBookingID } from "../../../constants/globalfunctions";
import { PaginationInstance } from "ngx-pagination";
import { ConfirmBookingDialogComponent } from "../../../shared/dialogues/confirm-booking-dialog/confirm-booking-dialog.component";

@Component({
  selector: "app-bookings",
  templateUrl: "./bookings.component.html",
  styleUrls: ["./bookings.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class BookingsComponent implements OnInit, AfterViewInit, AfterViewChecked {

  loading: boolean = false;
  currentBookings: BookingList[];
  savedBookings: BookingList[];
  pastBookings: BookingList[];
  specialBookings: BookingList[] = [];

  bookingDetails: BookingDetails;
  resp: any;
  public dashboardData: any = [];
  public activeIdString: string = "tab-current"
  // tab-current
  // tab-saved
  // tab-special
  // tab-past



  public bookingList: BookingList[];

  private icons = {
    SEA: "icons_cargo_ship_grey.svg",
    DOOR: "Icons_Location.svg",
    LAND: "icons_cargo_truck_grey.svg",
    AIR: "icon_plane.svg",
    WAREHOUSE: "Icons_Warehousing_Grey.svg"
  };

  public isViewLoaded: boolean = false;

  // new search
  newSearch() {
    this._dataService.tabCallFromDashboard = 'shipTab'
    this._dataService.isTabCallTrue = true
    this._router.navigate(['home']);
  }

  //Pagination work
  public maxSize: number = 7;
  public directionLinks: boolean = true;
  public autoHide: boolean = false;
  public currentBookingConfig: PaginationInstance = {
    id: 'advance',
    itemsPerPage: 10,
    currentPage: 1
  };
  public savedBookingConfig: PaginationInstance = {
    id: 'advance',
    itemsPerPage: 10,
    currentPage: 1
  };
  public totalBookingConfig: PaginationInstance = {
    id: 'advance',
    itemsPerPage: 10,
    currentPage: 1
  };


  public labels: any = {
    previousLabel: '',
    nextLabel: '',
  };

  public isSettingData: boolean = true

  constructor(
    private _http: UserService,
    private _toast: ToastrService,
    private _modalService: NgbModal,
    private _activeModal: NgbActiveModal,

    private _dataService: DataService,
    private _router: Router,
    private _activeRoute: ActivatedRoute,
    private _cdr: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    const bookingList: SimpleChange = changes.bookingList;
    this.bookingList = bookingList.currentValue;
    this.setAllLists();
  }

  ngOnInit() {
    this.isViewLoaded = false;
    this.isSettingData = true
    // if (HashStorage.getItem("bookingList")) {
    //   this.bookingList = JSON.parse(HashStorage.getItem("bookingList"));
    //   if (this.bookingList && this.bookingList.length) {
    //     this.bookingList.reverse();
    //   }
    // }
    this._dataService.currentDashboardData.subscribe(data => {
      if (data !== null) {
        try {
          this.dashboardData = data;
          this.bookingList = this.dashboardData.BookingDetails;
          this.bookingList = this.bookingList;
          this.setAllLists();
        } catch (error) {
          this.isSettingData = false
        }
      }
    });
  }

  ngAfterViewInit() {
    this.isViewLoaded = true
    let value = this._dataService.currentBookingTab.getValue()
    if (value) {
      this.activeIdString = value
      this._dataService.currentBookingTab.next('tab-current')
    }
  }

  ngAfterViewChecked() {
    this._cdr.detectChanges();
  }

  setAllLists() {
    this.currentBookings = [];
    this.savedBookings = [];
    this.pastBookings = [];
    if (this.bookingList && this.bookingList.length > 0) {
      this.bookingList.map(booking => {
        booking.ContainerLoadTypeList = this.getContainerLoadTypeList(booking.ContainerLoadType)
      });
      try {
      this.setCurrentBookings()
      this.setPastBookings();
      this.setSavedBookings();
      this.setSpecialBookings();
      this.setTotalBookings();
      } catch (error) {
        setTimeout(() => {
          this.isSettingData = false
        }, 10);
      }
    } else {
      setTimeout(() => {
        this.isSettingData = false
      }, 10);
    }
  }

  getContainerLoadTypeList(containerLoadType: string) {
    let strCont: any = ''
    try {
      strCont = containerLoadType.split('|')
    } catch (error) {
      strCont = ''
    }
    return strCont
  }

  getImageForRoute(type: string) {
    if (type.toUpperCase() === "SEA") {
      return this.icons.SEA;
    } else if (type.toUpperCase() === "LAND") {
      return this.icons.LAND;
    } else if (type.toUpperCase() === "AIR") {
      return this.icons.AIR;
    } else if (type.toUpperCase() === "WAREHOUSE") {
      return this.icons.WAREHOUSE;
    } else if (type.toUpperCase() === "DOOR") {
      return this.icons.DOOR;
    }
  }

  getDashboardData(userID) {
    this._http.getDashBoardData(userID).subscribe(res => {
      this.resp = res;
      this.dashboardData = JSON.parse(this.resp.returnText);
      this._dataService.setDashboardData(this.dashboardData);
      if (this.dashboardData.BookingDetails && this.dashboardData.BookingDetails.length) {
        this.bookingList = this.dashboardData.BookingDetails;
        this.setAllLists();
      } else {
        this.bookingList = [];
      }
    });
  }

  viewBookingDetails(bookingId) {
    const safeBookingId = encryptBookingID(bookingId)
    this._router.navigate(['/user/booking-detail', safeBookingId]);
  }

  setCurrentBookings() {
    this.loading = true;
    if (this.bookingList && this.bookingList.length > 300) {
      setTimeout(() => {
        this.currentBookings = this.bookingList.filter(x => x.BookingTab.toLowerCase() === 'current');
        setTimeout(() => {
          this.isSettingData = false
        }, 10);
        this.setMapRoutes()
      }, 0);
      this.loading = false;
    } else if (
      this.bookingList &&
      this.bookingList.length > 0 &&
      this.bookingList.length <= 300
    ) {
      this.currentBookings = this.bookingList.filter(x => x.BookingTab.toLowerCase() === 'current');
      setTimeout(() => {
        this.isSettingData = false
      }, 10);
      this.setMapRoutes()
    }
  }

  setMapRoutes() {
    this.currentBookings.forEach(element => {
      let bookRoute: any = element.BookingRoutePorts
      try {
        element.BookingRoutePorts = JSON.parse(bookRoute)
      } catch (er) { }
    });

    this._dataService.newMapMarkerList.next(this.currentBookings)
  }

  setSavedBookings() {
    this.loading = true;
    if (this.bookingList && this.bookingList.length > 300) {
      setTimeout(() => {
        this.savedBookings = this.bookingList.filter(x => x.BookingTab.toLowerCase() === 'saved');
        this.loading = false;
      }, 0);
    } else if (
      this.bookingList &&
      this.bookingList.length > 0 &&
      this.bookingList.length <= 300
    ) {
      this.loading = true;
      this.savedBookings = this.bookingList.filter(x => x.BookingTab.toLowerCase() === 'saved');
      this.loading = false;
    }
  }

  setSpecialBookings() {
    this.loading = true;
    if (this.bookingList && this.bookingList.length > 300) {
      setTimeout(() => {
        this.specialBookings = this.bookingList.filter(x => x.BookingTab.toLowerCase() === 'specialrequest');
        this.loading = false;
      }, 0);
    } else if (
      this.bookingList &&
      this.bookingList.length > 0 &&
      this.bookingList.length <= 300
    ) {
      this.loading = true;
      this.specialBookings = this.bookingList.filter(x => x.BookingTab.toLowerCase() === 'specialrequest');
      this.loading = false;
    }
  }

  public totalBookings: any[] = []
  setTotalBookings() {
    this.loading = true;
    if (this.bookingList && this.bookingList.length > 300) {
      setTimeout(() => {
        this.totalBookings = this.bookingList.filter(
          x => x.BookingTab.toLowerCase() !== "specialrequest".toLowerCase()
        );
      }, 0);
      this.loading = false;
    } else if (
      this.bookingList &&
      this.bookingList.length > 0 &&
      this.bookingList.length <= 300
    ) {
      this.totalBookings = this.bookingList.filter(
        x => x.BookingTab.toLowerCase() !== "specialrequest".toLowerCase()
      );
    }
  }

  setPastBookings() {
    this.loading = true;
    if (this.bookingList && this.bookingList.length > 300) {
      setTimeout(() => {
        this.pastBookings = this.bookingList.filter(
          x => x.BookingTab.toLowerCase() === "past".toLowerCase()
        );
      }, 0);
      this.loading = false;
    } else if (
      this.bookingList &&
      this.bookingList.length > 0 &&
      this.bookingList.length <= 300
    ) {
      this.pastBookings = this.bookingList.filter(
        x => x.BookingTab.toLowerCase() === "past".toLowerCase()
      );
    }
  }

  continueBooking(bookingId) {
    const encBookingID = encryptBookingID(bookingId)
    this._activeModal.close();
    const modalRef = this._modalService.open(ConfirmBookingDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.bookingId = encBookingID
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);


  }

  discardSaveBooking(bookingId) {
    let userData = JSON.parse(Tea.getItem("loginUser"));

    let toSend = {
      loginUserID: userData.UserID,
      BookingID: bookingId
    };

    this._dataService.cancelBookingMsg = {
      messageTitle: "Discard Booking",
      messageContent: "Are you sure you want to discard the booking?",
      openedFrom: "/user/dashboard",
      buttonTitle: "Yes, I want to discard",
      data: toSend
    };
    const modalRef = this._modalService.open(CancelBookingDialogComponent, {
      size: "lg",
      backdrop: "static",
      centered: true,
      windowClass: "small-modal",
      keyboard: false
    });
    modalRef.result.then(result => {
      if (result) {
        let userItem = JSON.parse(Tea.getItem("loginUser"));
        this.getDashboardData(userItem.UserID);
      }
    });
    setTimeout(() => {
      if (
        document
          .getElementsByTagName("body")[0]
          .classList.contains("modal-open")
      ) {
        document.getElementsByTagName("html")[0].style.overflowY = "hidden";
      }
    }, 0);
  }

  onPageChange(number: any, type: string) {
    if (type === 'current') {
      this.currentBookingConfig.currentPage = number;
    } else if (type === 'saved') {
      this.savedBookingConfig.currentPage = number;
    } else if (type === 'total') {
      this.totalBookingConfig.currentPage = number;
    }
  }

  getCurrentPages() {
    let temp: any = this.currentBookings
    return Math.ceil(temp.length / this.currentBookingConfig.itemsPerPage)
  }

  getSavedPages() {
    let temp: any = this.savedBookings
    return Math.ceil(temp.length / this.savedBookingConfig.itemsPerPage)
  }

  getTotalPages() {
    let temp: any = this.bookingList
    return Math.ceil(temp.length / this.totalBookingConfig.itemsPerPage)
  }
  getTotalSpecialPages() {
    let temp: any = this.specialBookings
    return Math.ceil(temp.length / this.totalBookingConfig.itemsPerPage)
  }

  removeBooking($event: number) {
    if ($event > -1) {
      let userItem = JSON.parse(Tea.getItem("loginUser"));
      this.getDashboardData(userItem.UserID);
    }
  }
}
