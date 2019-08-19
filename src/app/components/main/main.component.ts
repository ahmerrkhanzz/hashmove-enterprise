import { Component, OnInit, Renderer2, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { DataService } from '../../services/commonservice/data.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { HashStorage, loading, preloadImages, Tea } from '../../constants/globalfunctions';
import { UpdatePasswordComponent } from '../../shared/dialogues/update-password/update-password.component';
import { LoginDialogComponent } from '../../shared/dialogues/login-dialog/login-dialog.component'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagesService } from '../pages.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ShippingService } from './shipping/shipping.service';
import { ShippingArray } from '../../interfaces/shipping.interface';
import { UserService } from '../user/user-service';
import { PaginationInstance } from 'ngx-pagination';
import { getImagePath, ImageSource, ImageRequiredSize } from "../../constants/globalfunctions";
@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"]
})
export class MainComponent implements OnInit, AfterViewInit, OnDestroy {
  public shipping: boolean = false;
  public wareHousing: boolean = false;
  public track: boolean = false;
  public partner: boolean = false;
  public searchCriteria: any;

  public mapBookings = [
    {
      key: "United Arab Emirates",
      totalAmount: 80100,
      impExp: "EXPORT",
      lat: "23.424076",
      lng: "53.847818"
    }
  ];
  public pieChart = {
    color: ["#8472d5", "#00a2df"],
    title: {},
    tooltip: {
      trigger: "item",
      formatter: "{b} <br> ({d}%)",
      backgroundColor: "rgba(255,255,255,1)",
      padding: [20, 24],
      extraCssText: "box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.2);",
      textStyle: {
        color: "#2b2b2b",
        decoration: "none",
        fontFamily: "Proxima Nova, sans-serif",
        fontSize: 16
      }
    },
    calculable: true,
    series: [
      {
        name: "area",
        type: "pie",
        radius: [30, 70],
        roseType: "area",
        data: [
          { name: "SEA FREIGHT", value: 50 },
          { name: "AIR FREIGHT", value: 50 }
        ]
      }
    ]
  };
  public regions = {
    height: 340,
    color: ["#3398DB"],
    title: {},
    grid: { left: "4%", right: "4%", bottom: "2%", containLabel: true },
    xAxis: {
      type: "value",
      show: true,
      axisLine: { show: false, onZero: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { type: "dotted", shadowBlur: -20 } }
    },
    yAxis: {
      type: "category",
      data: ["UNITED ARAB EMIRATES"],
      axisLabel: { show: false },
      axisTick: { show: false },
      axisLine: { show: false, onZero: false },
      show: true
    },
    series: [
      {
        type: "bar",
        barWidth: 30,
        label: {
          align: "right",
          normal: {
            show: true,
            formatter: "{b}",
            position: "insideLeft",
            color: "#000"
          }
        },
        data: [50]
      }
    ]
  };

  constructor(
    private renderer: Renderer2,
    private dataService: DataService,
    private _router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private _location: Location,
    private _pagesService: PagesService,
    private _shippingService: ShippingService,
    private route: ActivatedRoute,
    private _userService: UserService
  ) { }

  @ViewChild("shipTab") shipTab: ElementRef;
  @ViewChild("warehouseTab") warehouseTab: ElementRef;
  @ViewChild("trackShipTab") trackShipTab: ElementRef;
  @ViewChild("partnerTab") partnerTab: ElementRef;

  //Pagination work
  public maxSize: number = 7;
  public directionLinks: boolean = true;
  public autoHide: boolean = false;
  public currentBookingConfig: PaginationInstance = {
    id: "advance",
    itemsPerPage: 5,
    currentPage: 1
  };

  public labels: any = {
    previousLabel: "",
    nextLabel: ""
  };
  public customerSettings: any;
  public userItem: any;

  ngOnInit() {
    HashStorage.removeItem("tempSearchCriteria");
    this.customerSettings = JSON.parse(HashStorage.getItem("customerSettings"));
    this.userItem = JSON.parse(Tea.getItem("loginUser"));
    this.getShippingDetails();
    this.getPortDetails();
    // this.getDashboardData(this.userItem.UserID)
    this.renderer.addClass(document.body, 'bg-white');
    this.renderer.removeClass(document.body, 'bg-grey');
    this.renderer.removeClass(document.body, 'bg-lock-grey');
    this.dataService.criteria.subscribe(state => {
      const { isMod, from } = state;
      if (from === "ship" && isMod) {
        this.shipping = !this.shipping;
      }
      if (from === "warehouse" && isMod) {
        this.wareHousing = !this.wareHousing;
      }
    });

    this._router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe((event: NavigationEnd) => {
        HashStorage.removeItem("tempSearchCriteria");
      });

    const externalLink = this.route.snapshot.queryParamMap.get("mode");
    if (externalLink) {
      if (
        externalLink === "shipping" ||
        externalLink === "air" ||
        externalLink === "truck"
      ) {
        this.dataService.tabCallFromDashboard = "shipTab";
      } else if (externalLink === "warehouse") {
        this.dataService.tabCallFromDashboard = "warehouseTab";
      }
      this.dataService.isTabCallTrue = true;
    }
  }

  getUIImage($image: string) {
    if (location.href.includes('home')) {
      return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original);
    } else {
      return ''
    }

  }

  /**
   * get all shipping data
   */
  getShippingDetails() {
    if (HashStorage) {
      this._pagesService
        .getShippingData(this.userItem.CustomerID, this.userItem.CustomerType)
        .subscribe(
          (res: any) => {
            this.setShippingCriteria(res);
          },
          (err: HttpErrorResponse) => { }
        );
    }
  }

  setShippingCriteria(res) {
    try {
      let result = JSON.parse(res.returnText);
      if (res.returnId === 1) {
        HashStorage.setItem("shippingCategories", JSON.stringify(result));
        this.setImages(result);
      }
    } catch (error) {
      console.warn(error);
    }
  }

  public mainImages;
  public subImages;
  public subSubImages;
  public containers;

  async setImages(shipArray: ShippingArray[]) {
    let newMain = [];
    let newSubImages = [];
    let newSubSubImages = [];
    let newContainers = [];

    shipArray.forEach(ship => {
      newMain.push(ship.ShippingModeImage);
    });
    shipArray.forEach(ship => {
      if (ship.ShippingCriteriaCat && ship.ShippingCriteriaCat.length > 0) {
        ship.ShippingCriteriaCat.forEach(sub => {
          if (sub.ShippingCatImage) {
            newSubImages.push(sub.ShippingCatImage);
          } else {
            newSubImages.push("GeneralCargo.png");
          }
        });
      }
    });
    shipArray.forEach(ship => {
      if (ship.ShippingCriteriaCat && ship.ShippingCriteriaCat.length > 0) {
        ship.ShippingCriteriaCat.forEach(sub => {
          if (
            sub.ShippingCriteriaSubCat &&
            sub.ShippingCriteriaSubCat.length > 0
          ) {
            sub.ShippingCriteriaSubCat.forEach(subSub => {
              if (subSub.ShippingSubCatImage) {
                newSubSubImages.push(subSub.ShippingSubCatImage);
              } else {
                newSubSubImages.push("GeneralCargo.png");
              }
            });
          }
        });
      }
    });

    shipArray.forEach(ship => {
      if (ship.ShippingCriteriaCat && ship.ShippingCriteriaCat.length > 0) {
        ship.ShippingCriteriaCat.forEach(sub => {
          if (
            sub.ShippingCriteriaSubCat &&
            sub.ShippingCriteriaSubCat.length > 0
          ) {
            sub.ShippingCriteriaSubCat.forEach(subSub => {
              if (subSub.Containers && subSub.Containers.length > 0) {
                subSub.Containers.forEach(container => {
                  newContainers.push(container.ContainerSpecImage);
                });
              }
            });
          }
        });
      }
    });
    this.mainImages = newMain;
    this.subImages = newSubImages;
    this.subSubImages = newSubSubImages;
    this.containers = newContainers;
  }
  getPortDetails() {
    if (HashStorage.getItem("shippingPortDetails")) {
      return;
    }
    loading(true);
    this._shippingService.getPortsData().subscribe(
      (res: any) => {
        loading(false);
        HashStorage.setItem("shippingPortDetails", JSON.stringify(res));
      },
      (err: HttpErrorResponse) => {
        loading(false);
      }
    );
  }

  CloseBoxes(event) {
    if (event.target.classList.contains("dropdown-item")) {
      event.stopPropagation();
    } else {
      let i;
      let count = event.currentTarget.parentElement.children;
      for (i = 0; i < count.length; i++) {
        if (count[i].classList.length > 1) {
          count[i].classList.remove("active");
        }
      }
      this.shipping = false;
      this.wareHousing = false;
      this.partner = false;
      this.track = false;
    }
  }

  tabOpen(tab, event) {
    if (HashStorage) {
      let i;
      let count;
      try {
        count = event.currentTarget.parentElement.children;
        for (i = 0; i < count.length; i++) {
          if (count[i].classList.length > 1) {
            count[i].classList.remove("active");
          }
        }
      } catch (error) { }
      if (tab == "shipping") {
        if (this.shipping == false) {
          this.dataService.modifySearch({ isMod: false, from: "ship" });
        }
        this.shipping = !this.shipping;
        this.wareHousing = false;
        this.partner = false;
        this.track = false;
        this.shipping
          ? event.currentTarget.classList.add("active")
          : event.currentTarget.classList.remove("active");
      } else if (tab == "warehousing") {
        this.wareHousing = !this.wareHousing;
        this.shipping = false;
        this.track = false;
        this.partner = false;
        this.wareHousing
          ? this.warehouseTab.nativeElement.classList.add("active")
          : this.warehouseTab.nativeElement.classList.remove("active");
      } else if (tab == "track") {
        this.track = !this.track;
        this.shipping = false;
        this.wareHousing = false;
        this.partner = false;
        this.track
          ? event.currentTarget.classList.add("active")
          : event.currentTarget.classList.remove("active");
      } else if (tab == "partner") {
        this.partner = !this.partner;
        this.shipping = false;
        this.wareHousing = false;
        this.track = false;
        this.partner
          ? event.currentTarget.classList.add("active")
          : event.currentTarget.classList.remove("active");
      }
    } else {
      if (!HashStorage) {
        this._router.navigate(["enable-cookies"]);
        return;
      }
    }
  }

  ngAfterViewInit() {
    if (this.dataService.isTabCallTrue) {
      setTimeout(() => {
        let tabName = this.dataService.tabCallFromDashboard;
        this.shipping = false;
        switch (tabName) {
          case "shipTab":
            this.shipTab.nativeElement.click();
            break;
          case "warehouseTab":
            this.warehouseTab.nativeElement.click();
            break;
          case "trackShipTab":
            this.trackShipTab.nativeElement.click();
            break;
          case "partnerTab":
            this.partnerTab.nativeElement.click();
            break;
          default:
            break;
        }
        this.dataService.isTabCallTrue = false;
      }, 500);
    }
    // if (this.activatedRoute.snapshot.queryParams.code) {
    //   this.updatePasswordModal();
    // }
    if (this.activatedRoute.snapshot.queryParams.login) {
      this.loginModal();
    }
  }

  updatePasswordModal() {
    this.modalService.open(UpdatePasswordComponent, {
      size: "lg",
      centered: true,
      windowClass: "small-modal",
      backdrop: "static",
      keyboard: false
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

  loginModal() {
    this._location.replaceState("home");
    HashStorage.removeItem("loginUser");
    this.dataService.reloadHeader.next(true);
    this.modalService.open(LoginDialogComponent, {
      size: "lg",
      centered: true,
      windowClass: "small-modal",
      backdrop: "static",
      keyboard: false
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

  // @HostListener('window:keyup.shift.w', ['$event'])
  // keyEvent(event: KeyboardEvent) {
  //   console.log(event);
  //   this.tabOpen('warehousing', null)
  // }

  /**
   *
   * ATCO CUSTOMER Dashboard Details
   * @param {number} userID
   * @memberof MainComponent
   */
  public dashboardData: any = [];
  public currentBookings: any[] = [];
  public loading: boolean = false;
  getDashboardData(userID) {
    this.loading = true;
    this._userService.getDashBoardData(userID).subscribe((res: any) => {
      this.dashboardData = JSON.parse(res.returnText);
      if (
        this.dashboardData &&
        this.dashboardData.BookingDetails &&
        this.dashboardData.BookingDetails.length
      ) {
        setTimeout(() => {
          this.currentBookings = this.dashboardData.BookingDetails.filter(
            x => x.BookingTab.toLowerCase() === "current"
          );
          this.loading = false;
        }, 0);
      }
      this.loading = false;
      // this._dataService.setDashboardData(this.dashboardData);
    });
  }

  onPageChange(number: any) {
    this.currentBookingConfig.currentPage = number;
  }

  getCurrentPages() {
    let temp: any = this.currentBookings;
    return Math.ceil(temp.length / this.currentBookingConfig.itemsPerPage);
  }

  ngOnDestroy() {
    HashStorage.removeItem("tempSearchCriteria");
  }
}
