import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute } from "@angular/router";
import { NgbModal, NgbAccordion, NgbPanelChangeEvent, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { loading, getImagePath, ImageSource, ImageRequiredSize, Tea, cloneObject, compareValues, removeDuplicates, getTimeStr, getGreyIcon, getProviderImage, getWarehouseBookingDates, getBlueModeIcon, isJSON, EMAIL_REGEX, encryptBookingID, HashStorage } from "../../../constants/globalfunctions";
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../user-service';
import { OptionalBillingComponent } from '../../../shared/optional-billing/optional-billing.component';
import { DataService } from '../../../services/commonservice/data.service';
import { BookingService } from '../../booking-process/booking.service';
import { UploadComponent } from '../../../shared/dialogues/upload-component/upload-component';
import { ViewBookingDetails, BookingDocumentDetail, LineMarker, RouteInfo, BookingRouteMapInfo, UpdateLoadPickupDate, TrackingMonitoring, QualityMonitorGraphData, QaualitMonitorResp, QualityMonitoringAlertData } from '../../../interfaces/view-booking.interface';
import { baseExternalAssets } from '../../../constants/base.url';
import { ShareshippingComponent } from '../../../shared/dialogues/shareshipping/shareshipping.component';
import { NguCarouselConfig } from '@ngu/carousel';
import { JsonResponse } from '../../../interfaces/JsonResponse';
import { ConfirmDialogComponent } from '../../../shared/dialogues/confirm-dialog/confirm-dialog.component';
import * as echarts from 'echarts'
import { CancelBookingDialogComponent } from '../../../shared/dialogues/cancel-booking-dialog/confirm-booking-dialog.component';
import { AppComponent } from '../../../app.component';
import { untilDestroyed } from 'ngx-take-until-destroy'
import { UserDocument, DocumentFile, MetaInfoKeysDetail } from '../../../interfaces/document.interface';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginUser } from '../../../interfaces/user.interface';
import *  as moment from 'moment';
import { DropDownService } from '../../../services/dropdownservice/dropdown.service';
import { ContainerInfoComponent } from '../../../shared/dialogues/container-info/container-info.component';
import { GuestService } from '../../../shared/setup/jwt.injectable';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-view-booking',
  templateUrl: './view-booking.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./view-booking.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ transform: 'translateY(-10%)', opacity: 0 }),
          animate('400ms', style({ transform: 'translateY(0)', opacity: 1 }))
        ]),
        transition(':leave', [
          style({ transform: 'translateY(0)', opacity: 1 }),
          animate('400ms', style({ transform: 'translateY(-10%)', opacity: 0 }))
        ])
      ]
    )
  ],
})
export class ViewBookingComponent implements OnInit, OnDestroy {
  public readMoreClass = false;
  public ShippingOrgInforeadMoreClass = false;
  public JsonAgentOrgInfoReadMoreClass = false;
  public JsonAgentDestInfoReadMoreClass = false;
  public vendorAboutBtn: any = "Read More";
  public ShippingOrgInfoBtn: any = "Read More";
  public JsonAgentOrgInfoBtn: any = "Read More";
  public JsonAgentDestInfoBtn: any = "Read More";

  public bookingDetails: ViewBookingDetails;
  public paramSubscriber: any;
  public HelpDataLoaded: boolean;
  public ProviderEmails: any[];
  public ProviderPhones: any[];
  public helpSupport; any;
  public originDocList: BookingDocumentDetail[] = []
  public destinDocList: BookingDocumentDetail[] = []
  public currentBookingId: number
  public miniMap: LineMarker
  public FlightNo: string = ''
  public AirCraftInfo: string = ''
  public distinctFlightNo: Array<RouteInfo>
  public distinctAirCraftInfo: Array<RouteInfo>
  public searchCriteria: any;

  public showMap: boolean = false
  public isTruck: boolean = false
  public showWarehouseMap: boolean = false
  public userCountry: any;
  public showDtlMap: boolean = false
  public wareMiniMapData = {
    WHLatitude: 0,
    WHLongitude: 0
  }


  public carouselOne: NguCarouselConfig = {
    grid: { xs: 2, sm: 3, md: 6, lg: 6, all: 0 },
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

  public dateList: Array<MonthDateModel> = []
  public lastSelectedIndex: number = -1
  public selectedDate: MonthDateModel
  public pickupTime = {
    hour: 0,
    minute: 0
  };
  public loadPickupDate: string
  public arrowChange = false;
  public searchMode

  options: any;

  public lpdate: string = '1900-01-01'
  public lpHr: string = '00'
  public lpMin: string = '00'


  optionHalfPie1 = {
    title: {
      //text: 'First',
      subtext: '100%',
      x: '50%',
      y: '33.5%',
      textAlign: "center",
      textStyle: {
        fontWeight: 'normal',
        fontSize: 24
      },
      subtextStyle: {
        fontWeight: 'bold',
        fontSize: 24,
        color: '#2b2b2b'
      }
    },
    series: [{
      name: ' ',
      type: 'pie',
      radius: ['50%', '70%'],
      startAngle: 180,
      color: [new echarts.graphic.LinearGradient(0, 0, 0, 2, [{
        offset: 0,
        color: '#00a2ff'
      }, {
        offset: 1,
        color: '#70ffac'
      }]), "transparent"],
      hoverAnimation: true,
      legendHoverLink: false,
      itemStyle: {
        normal: {
          borderColor: "transparent",
          borderWidth: "20"
        },
        emphasis: {
          borderColor: "transparent",
          borderWidth: "20"
        }
      },
      z: 10,
      labelLine: {
        normal: {
          show: false
        }
      },
      data: [{
        value: 50
      }, {
        value: 50
      }]
    }, {
      name: '',
      type: 'pie',
      radius: ['50%', '70%'],
      startAngle: 180,
      color: ["lightgray", "transparent"],
      labelLine: {
        normal: {
          show: false
        }
      },
      data: [{
        value: 50
      }, {
        value: 50
      }]
    }

    ]
  };
  optionHalfPie2 = {
    title: {
      //text: 'AAA',
      subtext: '100%',
      x: '50%',
      y: '33.5%',
      textAlign: "center",
      textStyle: {
        fontWeight: 'normal',
        fontSize: 24
      },
      subtextStyle: {
        fontWeight: 'bold',
        fontSize: 24,
        color: '#2b2b2b'
      }
    },
    series: [{
      name: ' ',
      type: 'pie',
      radius: ['50%', '70%'],
      startAngle: 180,
      color: [new echarts.graphic.LinearGradient(0, 0, 0, 2, [{
        offset: 0,
        color: '#00a2ff'
      }, {
        offset: 1,
        color: '#70ffac'
      }]), "transparent"],
      hoverAnimation: true,
      legendHoverLink: false,
      itemStyle: {
        normal: {
          borderColor: "transparent",
          borderWidth: "20"
        },
        emphasis: {
          borderColor: "transparent",
          borderWidth: "20"
        }
      },
      z: 10,
      labelLine: {
        normal: {
          show: false
        }
      },
      data: [{
        value: 50
      }, {
        value: 50
      }]
    }, {
      name: '',
      type: 'pie',
      radius: ['50%', '70%'],
      startAngle: 180,
      color: ["lightgray", "transparent"],
      labelLine: {
        normal: {
          show: false
        }
      },
      data: [{
        value: 50
      }, {
        value: 50
      }]
    }

    ]
  };
  optionHalfPie3 = {
    title: {
      //text: 'AAA',
      subtext: '100%',
      x: '50%',
      y: '33.5%',
      textAlign: "center",
      textStyle: {
        fontWeight: 'normal',
        fontSize: 24
      },
      subtextStyle: {
        fontWeight: 'bold',
        fontSize: 24,
        color: '#2b2b2b'
      }
    },
    series: [{
      name: ' ',
      type: 'pie',
      radius: ['50%', '70%'],
      startAngle: 180,
      color: [new echarts.graphic.LinearGradient(0, 0, 0, 2, [{
        offset: 0,
        color: '#00a2ff'
      }, {
        offset: 1,
        color: '#70ffac'
      }]), "transparent"],
      hoverAnimation: true,
      legendHoverLink: false,
      itemStyle: {
        normal: {
          borderColor: "transparent",
          borderWidth: "20"
        },
        emphasis: {
          borderColor: "transparent",
          borderWidth: "20"
        }
      },
      z: 10,
      labelLine: {
        normal: {
          show: false
        }
      },
      data: [{
        value: 50
      }, {
        value: 50
      }]
    }, {
      name: '',
      type: 'pie',
      radius: ['50%', '70%'],
      startAngle: 180,
      color: ["lightgray", "transparent"],
      labelLine: {
        normal: {
          show: false
        }
      },
      data: [{
        value: 50
      }, {
        value: 50
      }]
    }

    ]
  };
  optionHalfPie4 = {
    title: {
      // text: 'First',
      subtext: '100%',
      x: '50%',
      y: '33.5%',
      textAlign: "center",
      textStyle: {
        fontWeight: 'normal',
        fontSize: 24
      },
      subtextStyle: {
        fontWeight: 'bold',
        fontSize: 24,
        color: '#2b2b2b'
      }
    },
    series: [{
      name: ' ',
      type: 'pie',
      radius: ['50%', '70%'],
      startAngle: 180,
      color: [new echarts.graphic.LinearGradient(0, 0, 0, 2, [{
        offset: 0,
        color: '#00a2ff'
      }, {
        offset: 1,
        color: '#70ffac'
      }]), "transparent"],
      hoverAnimation: true,//false
      legendHoverLink: false,
      itemStyle: {
        normal: {
          borderColor: "transparent",
          borderWidth: "20"
        },
        emphasis: {
          borderColor: "transparent",
          borderWidth: "20"
        }
      },
      z: 10,
      labelLine: {
        normal: {
          show: false
        }
      },
      data: [{
        value: 50
      }, {
        value: 50
      }]
    }, {
      name: '',
      type: 'pie',
      radius: ['50%', '70%'],
      startAngle: 180,
      color: ["gray", "transparent"],
      labelLine: {
        normal: {
          show: false
        }
      },
      data: [{
        value: 50
      }, {
        value: 50
      }]
    }

    ]
  };

  optionPerformance = {
    backgroundColor: '#fff',
    title: {
      text: 'Performance',
      show: false,
      textStyle: {
        fontWeight: 'normal',
        fontSize: 16,
        color: '#333'
      },
      left: '6%'
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,1)',
      padding: [14, 24],
      extraCssText: 'box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.2);',
      axisPointer: {
        lineStyle: {
          color: '#2b2b2b', //#738593
          decoration: 'none',
          fontFamily: 'Proxima Nova, sans-serif',
          fontSize: 16,
        }
      },
      textStyle: {
        color: '#2b2b2b',
        fontFamily: 'Proxima Nova, sans-serif',
        fontSize: 16,
      }
    },
    legend: {
      icon: 'rect',
      itemWidth: 14,
      itemHeight: 5,
      itemGap: 13,
      data: ['Temperature', 'Humidty'],
      right: 'center',
      textStyle: {
        fontSize: 12,
        color: '#333'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: ['rgba(229, 229, 229)'],//#ccc
        }
      },
      axisLabel: {
        margin: 25,
        textStyle: {
          fontFamily: 'Proxima Nova, sans-serif',
          fontSize: 12,
          color: ['rgba(85, 85, 85)'],//#999
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: ['rgba(229, 229, 229)'],//#ccc
          type: 'solid'
        }
      },
      data: ['25 Mar', '26 Mar', '27 Mar', '28 Mar', '29 Mar', '30 Mar', '31 Mar', '1 Apr', '2 Mar', '3 Mar', '4 Mar', '5 Mar', '6 Mar']
    }],
    yAxis: [{
      type: 'value',
      name: '',
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: '#fff'
        }
      },
      axisLabel: {
        margin: 20,
        textStyle: {
          fontFamily: 'Proxima Nova, sans-serif',
          fontSize: 12,
          color: ['rgba(85, 85, 85)'],//#999
        }
      },
      splitLine: {
        lineStyle: {
          type: 'solid',
          color: ['rgba(229, 229, 229)'],//#ccc
        }
      }
    }],
    series: [{
      name: 'Temperature',
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 2,
      showSymbol: true,
      lineStyle: {
        normal: {
          width: 1
        }
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(81, 123, 189, 0.2)'
          }, {
            offset: 1,
            color: 'rgba(81, 123, 189, 0)'
          }], false),
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 10
        }
      },
      itemStyle: {
        normal: {
          color: 'rgb(81, 123, 189)',
          borderColor: 'rgba(81, 123, 189,0.2)',
          borderWidth: 12

        }
      },
      data: [120, 110, 145, 122, 165, 150, 88, 98, 115, 162, 165, 150, 110]
    },
    {
      name: 'Humidty',
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 2,
      showSymbol: true,
      lineStyle: {
        normal: {
          width: 1
        }
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(240, 81, 124, 0.2)'
          }, {
            offset: 1,
            color: 'rgba(240, 81, 124, 0)'
          }], false),
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 10
        }
      },
      itemStyle: {
        normal: {
          color: 'rgb(240, 81, 124)',
          borderColor: 'rgba(240, 81, 124,0.2)',
          borderWidth: 12

        }
      },
      data: [80, 90, 115, 112, 145, 160, 140, 85, 110, 91, 185, 170, 175]
    },]
  };

  optionTemperature = {
    backgroundColor: '#fff',
    title: {
      text: 'Temperature',
      show: false,
      textStyle: {
        fontWeight: 'normal',
        fontSize: 16,
        color: '#333'
      },
      left: '6%'
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,1)',
      padding: [14, 24],
      extraCssText: 'box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.2);',
      axisPointer: {
        lineStyle: {
          color: '#2b2b2b', //#738593
          decoration: 'none',
          fontFamily: 'Proxima Nova, sans-serif',
          fontSize: 16,
        }
      },
      textStyle: {
        color: '#2b2b2b',
        fontFamily: 'Proxima Nova, sans-serif',
        fontSize: 16,
      }
    },
    legend: {
      icon: 'rect',
      itemWidth: 14,
      itemHeight: 5,
      itemGap: 13,
      data: ['Temperature'],
      right: 'center',
      textStyle: {
        fontSize: 12,
        color: '#333'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: ['rgba(229, 229, 229)'],//#ccc
        }
      },
      axisLabel: {
        margin: 25,
        textStyle: {
          fontFamily: 'Proxima Nova, sans-serif',
          fontSize: 12,
          color: ['rgba(85, 85, 85)'],//#999
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: ['rgba(229, 229, 229)'],//#ccc
          type: 'solid'
        }
      },
      data: ['25 Mar', '26 Mar', '27 Mar', '28 Mar', '29 Mar', '30 Mar', '31 Mar', '1 Apr', '2 Mar', '3 Mar', '4 Mar', '5 Mar', '6 Mar']
    }],
    yAxis: [{
      type: 'value',
      name: '',
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: '#fff'
        }
      },
      axisLabel: {
        margin: 20,
        textStyle: {
          fontFamily: 'Proxima Nova, sans-serif',
          fontSize: 12,
          color: ['rgba(85, 85, 85)'],//#999
        }
      },
      splitLine: {
        lineStyle: {
          type: 'solid',
          color: ['rgba(229, 229, 229)'],//#ccc
        }
      }
    }],
    series: [{
      name: 'Temperature',
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 2,
      showSymbol: true,
      lineStyle: {
        normal: {
          width: 1
        }
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(81, 123, 189, 0.2)'
          }, {
            offset: 1,
            color: 'rgba(81, 123, 189, 0)'
          }], false),
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 10
        }
      },
      itemStyle: {
        normal: {
          color: 'rgb(81, 123, 189)',
          borderColor: 'rgba(81, 123, 189,0.2)',
          borderWidth: 12

        }
      },
      data: [120, 110, 145, 122, 165, 150, 120, 110, 145, 122, 165, 150, 110],
      // markLine: {
      //   data: [
      //     { type: 'average', name: 'sample' }
      //   ]
      // }

      markLine: {
        symbol: ['none'],
        clickable: true,
        itemStyle: {
          normal: {
            label: { show: true },
            color: 'rgb(2, 189, 182)',
            type: 'solid',
            width: 4
          }
        },
        data: [{ xAxis: 0, yAxis: 100 }, { xAxis: 0, yAxis: 150 }]
        //data: [{ type: 'average', name: 'Media', }, { xAxis: 0, yAxis: 100 }, { xAxis: 0, yAxis: 150 }]
      }


    },]
  };
  optionHumidty = {
    backgroundColor: '#fff',
    title: {
      text: 'Temperature',
      show: false,
      textStyle: {
        fontFamily: 'Proxima Nova, sans-serif',
        fontWeight: 'normal',
        fontSize: 16,
        color: '#333'
      },
      left: '6%'
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,1)',
      padding: [14, 24],
      extraCssText: 'box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.2);',
      axisPointer: {
        lineStyle: {
          color: '#2b2b2b', //#738593
          decoration: 'none',
          fontFamily: 'Proxima Nova, sans-serif',
          fontSize: 16,
        }
      },
      textStyle: {
        color: '#2b2b2b',
        fontFamily: 'Proxima Nova, sans-serif',
        fontSize: 16,
      }
    },
    legend: {
      icon: 'rect',
      itemWidth: 14,
      itemHeight: 5,
      itemGap: 13,
      data: ['Humidty'],
      right: 'center',
      textStyle: {
        fontFamily: 'Proxima Nova, sans-serif',
        fontSize: 12,
        color: '#333'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: 'rgba(229, 229, 229)' //#ccc
        }
      },
      axisLabel: {
        margin: 25,
        textStyle: {
          fontFamily: 'Proxima Nova, sans-serif',
          fontSize: 12,
          color: ['rgba(85, 85, 85)'],//#999
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: ['rgba(229, 229, 229)'],//#ccc
          type: 'solid'
        }
      },
      data: ['25 Mar', '26 Mar', '27 Mar', '28 Mar', '29 Mar', '30 Mar', '31 Mar', '1 Apr', '2 Mar', '3 Mar', '4 Mar', '5 Mar', '6 Mar']
    }],
    yAxis: [{
      type: 'value',
      name: '',
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: '#fff'
        }
      },
      axisLabel: {
        margin: 20,
        textStyle: {
          fontFamily: 'Proxima Nova, sans-serif',
          fontSize: 12,
          color: ['rgba(85, 85, 85)'],//#999
        }
      },
      splitLine: {
        lineStyle: {
          type: 'solid',
          color: ['rgba(229, 229, 229)'],//#ccc
        }
      }
    }],
    series: [{
      name: 'Humidty',
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 2,
      showSymbol: true,
      lineStyle: {
        normal: {
          width: 1
        }
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(240, 81, 124, 0.2)'
          }, {
            offset: 1,
            color: 'rgba(240, 81, 124, 0)'
          }], false),
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 10
        }
      },
      itemStyle: {
        normal: {
          color: 'rgb(240, 81, 124)',
          borderColor: 'rgba(240, 81, 124,0.2)',
          borderWidth: 12

        }
      },
      data: [120, 110, 145, 122, 165, 150, 120, 110, 145, 122, 165, 150, 110],
      markLine: {
        symbol: ['none'],
        clickable: true,
        itemStyle: {
          normal: {
            label: { show: true },
            color: 'rgb(2, 189, 182)',
            type: 'solid',
            width: 4
          }
        },
        data: [{ xAxis: 0, yAxis: 120 }, { xAxis: 0, yAxis: 160 }]
      }
    },]
  }

  public shouldOpenPanel: boolean = true
  public isTracking: boolean = false
  public isContDtl: boolean = true
  public containerNumber: QualityMonitoringAlertData

  public isTrackingOnBooking: boolean = false
  public isMonitoringOnBooking: boolean = false

  public SupInfoFormOrigin: any;
  public SupInfoFormDest: any;
  // togglers
  public editSupOrgToggler: boolean = false
  public editSupDestToggler: boolean = false

  public supDestphoneCode: string;
  public supFlagImgDest: string;
  public supDestCountryId: string;
  public supOrgphoneCode: string;
  public supFlagImgOrg: string;
  public supOrgCountryId: string;
  public countryList: any[] = [];
  shouldMapOpen: boolean = true
  public isGuestLogin: boolean = false
  public objectRights: any
  public documentsRights: any = { ObjCode: "UD", ObjName: "UploadDocument", ObjRights: "RW" }
  public shipperInfoRights: any = { ObjCode: "SI", ObjName: "ShipperInformation", ObjRights: "RW" }
  public guestBookingKey: any
  public invoiceRights: any = { ObjCode: "VI", ObjName: "ViewInvoice", ObjRights: "R" }


  constructor(
    private _modalService: NgbModal,
    private _toastr: ToastrService,
    private _userService: UserService,
    private _router: ActivatedRoute,
    private _dataService: DataService,
    private bookingService: BookingService,
    private _dropdownservice: DropDownService,
    private _jwtService: GuestService
  ) { }

  async ngOnInit() {
    let url = window.location.href
    let x = url.split('booking-detail')
    let d3key = x[1].split('/')
    if (d3key.length > 2) {
      console.log(d3key)
      const res = await this._jwtService.sessionRefresh(d3key[2])
      this.isGuestLogin = true
      this.objectRights = JSON.parse(HashStorage.getItem('objectRights'))
      if (this.objectRights) {
        this.objectRights.JsonObjectRights.forEach(element => {
          if (element.ObjCode === 'UD') {
            this.documentsRights = element
          }
          if (element.ObjCode === 'SI') {
            this.shipperInfoRights = element
          }
          if (element.ObjCode === 'VI') {
            this.invoiceRights = element
          }
        });
      }

    }

    this.setgraphdata()
    this.setInit()
    this.getParams();
    this._dropdownservice.getCountry().subscribe((res: any) => {
      let List: any = res;
      List.map(obj => {
        obj.desc = JSON.parse(obj.desc);
      });
      this.countryList = List;
      this.getParams();
    }, error => {
      this.getParams();
    })
    this.bookingService.getHelpSupport(true).subscribe((res: any) => {
      if (res.returnId > 0) {
        this.helpSupport = JSON.parse(res.returnText)
        this.HelpDataLoaded = true
      }
    })

    this.SupInfoFormOrigin = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern(/[a-zA-Z-][a-zA-Z -]*$/), Validators.minLength(2), Validators.maxLength(100)]),
      address: new FormControl(null, [Validators.required, Validators.maxLength(200), Validators.minLength(10), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      email: new FormControl(null, [
        Validators.required,
        Validators.pattern(EMAIL_REGEX),
        Validators.maxLength(320)
      ]),
      contact: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(13)]),
    });
    this.SupInfoFormDest = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern(/[a-zA-Z-][a-zA-Z -]*$/), Validators.minLength(2), Validators.maxLength(100)]),
      address: new FormControl(null, [Validators.required, Validators.maxLength(200), Validators.minLength(10), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      email: new FormControl(null, [
        Validators.required,
        Validators.pattern(EMAIL_REGEX),
        Validators.maxLength(320)
      ]),
      contact: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(13)]),
    });
  }

  getParams() {
    this.paramSubscriber = this._router.params.subscribe(params => {
      let bookingId = params['id']; // (+) converts string 'id' to a number
      (this.isGuestLogin) ? this.guestBookingKey = bookingId : null
      if (bookingId) {
        this.getBookingDetail(bookingId);
      }
    });
  }

  getBookingDetail(bookingId) {
    loading(true);
    const userInfo = JSON.parse(Tea.getItem('loginUser'))
    this._userService.getBookingDetails(bookingId).pipe(untilDestroyed(this)).subscribe((res: any) => {
      loading(false);
      if (res.returnId > 0) {
        this.bookingDetails = JSON.parse(res.returnText);
        if (this.bookingDetails.BookingContainerDetail) {
          this.bookingDetails.BookingContainerDetail.forEach(e => {
            e.parsedJsonContainerInfo = JSON.parse(e.JsonContainerInfo)
          })
        }
        this.searchCriteria = JSON.parse(this.bookingDetails.JsonSearchCriteria)
        const countryData = JSON.parse(this.bookingDetails.JsonBookingLocation)
        const { EtdUtc, ShippingModeCode } = this.bookingDetails


        try {
          if (ShippingModeCode !== 'WAREHOUSE') {
            if (this.bookingDetails.JsonShippingDestInfo && isJSON(this.bookingDetails.JsonShippingDestInfo)) {
              this.bookingDetails.JsonShippingDestInfo = JSON.parse(this.bookingDetails.JsonShippingDestInfo);
              this.editSupDestToggler = true;
            }
            else if (!this.bookingDetails.JsonShippingDestInfo) {
              let object = this.countryList.find(obj => obj.title == this.bookingDetails.PodCountry);
              this.supFlagImgDest = object.code;
              let description = object.desc;
              this.supDestphoneCode = description[0].CountryPhoneCode;
              this.supDestCountryId = object.id

            }
            if (this.bookingDetails.JsonShippingOrgInfo && isJSON(this.bookingDetails.JsonShippingOrgInfo)) {
              this.bookingDetails.JsonShippingOrgInfo = JSON.parse(this.bookingDetails.JsonShippingOrgInfo)
              this.editSupOrgToggler = true;
            }
            else if (!this.bookingDetails.JsonShippingOrgInfo) {
              let object = this.countryList.find(obj => obj.title == this.bookingDetails.PolCountry);
              this.supFlagImgOrg = object.code;
              let description = object.desc;
              this.supOrgphoneCode = description[0].CountryPhoneCode;
              this.supOrgCountryId = object.id

            }
            if (this.bookingDetails.JsonAgentOrgInfo && isJSON(this.bookingDetails.JsonAgentOrgInfo)) {
              this.bookingDetails.JsonAgentOrgInfo = JSON.parse(this.bookingDetails.JsonAgentOrgInfo);
            }
            if (this.bookingDetails.JsonAgentDestInfo && isJSON(this.bookingDetails.JsonAgentDestInfo)) {
              this.bookingDetails.JsonAgentDestInfo = JSON.parse(this.bookingDetails.JsonAgentDestInfo);
            }
          }
        } catch { }

        if (countryData) {
          this.userCountry = countryData
        } else {
          this.userCountry = {
            country: ''
          }
        }

        let date2Process: string = ''

        if (ShippingModeCode.toUpperCase() !== 'WAREHOUSE') {
          date2Process = EtdUtc
        } else if (ShippingModeCode.toUpperCase() === 'WAREHOUSE') {
          date2Process = this.bookingDetails.StoredFromLcl
        }
        this.dateList = getWarehouseBookingDates(date2Process)
        if (this.bookingDetails.LoadPickupDate) {

          this.loadPickupDate = this.bookingDetails.LoadPickupDate
          this.setLoadPickupDate(this.loadPickupDate)

        }

        const { BookingContainerDetail } = this.bookingDetails
        if (BookingContainerDetail && BookingContainerDetail.length) {
          BookingContainerDetail.forEach(container => {
            if (container.IsTrackingRequired) {
              this.isTrackingOnBooking = true;
              this.isMonitoringOnBooking = true;
            }
            if (container.IsQualityMonitoringRequired) {
              this.isMonitoringOnBooking = true;
              this.isTrackingOnBooking = true;
            }
          })
        }

        this.bookingDetails.ProviderDisplayImage = getImagePath(ImageSource.FROM_SERVER, this.bookingDetails.ProviderImage, ImageRequiredSize._48x48)
        this.bookingDetails.CarrierDisplayImage = getImagePath(ImageSource.FROM_SERVER, this.bookingDetails.CarrierImage, ImageRequiredSize._48x48)
        try {
          this.ProviderEmails = this.bookingDetails.ProviderEmail.split(';');
          this.ProviderPhones = this.bookingDetails.ProviderPhone.split(';');
        } catch (error) {

        }
        const { PodCode, PolCode } = this.bookingDetails
        const { BookingDocumentDetail, BookingRouteMapInfo } = this.bookingDetails
        this.bookingDetails.PolImage = PolCode.split(' ')[0].toLowerCase()
        this.bookingDetails.PodImage = PodCode.split(' ')[0].toLowerCase()

        if (this.bookingDetails.ShippingModeCode.toLowerCase() === 'truck') {
          this.isTruck = true
        }

        if (BookingDocumentDetail && BookingDocumentDetail.length > 0) {

          const add_docs_cust: any = BookingDocumentDetail.filter(doc => doc.BusinessLogic === 'BOOKING_ADD_DOC' && doc.DocumentSubProcess !== 'PROVIDER')[0]
          // const add_docs_prov: any = BookingDocumentDetail.filter(doc => doc.BusinessLogic === 'BOOKING_ADD_DOC' && doc.DocumentSubProcess === 'PROVIDER')[0]

          const adDocCustomers: any = BookingDocumentDetail.filter(doc => doc.BusinessLogic === 'BOOKING_ADD_DOC' && doc.DocumentSubProcess !== 'PROVIDER' && doc.DocumentID > 0) as any
          adDocCustomers.forEach(doc => {
            doc.ShowUpload = false;
            doc.DateModel = ''
          })
          this.additionalDocumentsCustomers = adDocCustomers

          const adDocProviders: any = BookingDocumentDetail.filter(doc => doc.BusinessLogic === 'BOOKING_ADD_DOC' && doc.DocumentSubProcess === 'PROVIDER' && doc.DocumentID > 0) as any
          adDocProviders.forEach(doc => {
            doc.ShowUpload = false;
            doc.DateModel = ''
          })
          this.additionalDocumentsProviders = adDocProviders

          this.add_docs_cust = add_docs_cust
          // this.add_docs_prov = add_docs_prov
          try {
            this.resetAccordian()
          } catch (error) {

          }

          this.originDocList = BookingDocumentDetail.filter((e) => e.DocumentSubProcess === 'ORIGIN');
          this.destinDocList = BookingDocumentDetail.filter((e) => e.DocumentSubProcess === 'DESTINATION');

          const destDocClone: BookingDocumentDetail[] = cloneObject(this.destinDocList)
          this.destinDocList = destDocClone.sort(compareValues('IsUploadable', "asc"));
        }
        if (BookingRouteMapInfo) {
          this.showDtlMap = true
          this.showMap = true

          BookingRouteMapInfo.RouteInfo.forEach(route => {
            if (!route.Latitude || !route.Longitude) {
              this.shouldMapOpen = false
              // return
            }
          })

          if (this.bookingDetails.ShippingModeCode === 'AIR') {
            this.setAirCraftInfo(BookingRouteMapInfo)
          }
          try {
            const polFiltered = BookingRouteMapInfo.RouteInfo.filter((e) => e.PortCode === this.bookingDetails.PolCode)[0];
            this.bookingDetails.PolLatitude = (polFiltered.Latitude) ? polFiltered.Latitude : 0;
            this.bookingDetails.PolLongitude = (polFiltered.Longitude) ? polFiltered.Longitude : 0;


            const podFiltered = BookingRouteMapInfo.RouteInfo.filter((e) => e.PortCode === this.bookingDetails.PodCode)[0];
            this.bookingDetails.PodLatitude = (podFiltered.Latitude) ? podFiltered.Latitude : 0;
            this.bookingDetails.PodLongitude = (podFiltered.Longitude) ? podFiltered.Longitude : 0;

            const { PolLatitude, PolLongitude, PolModeOfTrans, PodLatitude, PodLongitude, PodModeOfTrans } = this.bookingDetails

            this.miniMap = {
              LatitudeA: (PolLatitude) ? PolLatitude : 0,
              LongitudeA: (PolLongitude) ? PolLongitude : 0,
              transPortModeA: PolModeOfTrans,
              LatitudeB: (PodLatitude) ? PodLatitude : 0,
              LongitudeB: (PodLongitude) ? PodLongitude : 0,
              transPortModeB: PodModeOfTrans,
            }
          } catch (err) {
          }
        } else if (this.bookingDetails.WHLatitude && this.bookingDetails.WHLongitude) {
          this.showWarehouseMap = true
          const { WHLatitude, WHLongitude } = this.bookingDetails
          this.wareMiniMapData = {
            WHLatitude: (WHLatitude) ? WHLatitude : 0,
            WHLongitude: (WHLongitude) ? WHLongitude : 0
          }
        } else if (this.bookingDetails.PolLatitude && this.bookingDetails.PolLongitude && this.bookingDetails.PodLatitude && this.bookingDetails.PodLongitude) {
          this.showMap = true
          const { PolLatitude, PolLongitude, PolModeOfTrans, PodLatitude, PodLongitude, PodModeOfTrans } = this.bookingDetails
          this.miniMap = {
            LatitudeA: (PolLatitude) ? PolLatitude : 0,
            LongitudeA: (PolLongitude) ? PolLongitude : 0,
            transPortModeA: PolModeOfTrans,
            LatitudeB: (PodLatitude) ? PodLatitude : 0,
            LongitudeB: (PodLongitude) ? PodLongitude : 0,
            transPortModeB: PodModeOfTrans,
          }
        }
      } else {
        this._toastr.error('Unable to find this booking. Please check the link and try again', 'Failed to Fetch Data')
      }
    }, (err: HttpErrorResponse) => {
      loading(false);
    })
  }


  viewInvoice() {
    const { bookingDetails } = this
    this._dataService.setBookingsData(bookingDetails);
    const modalRef = this._modalService.open(OptionalBillingComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.closeIcon = true;
    setTimeout(() => {
    }, 0);
  }




  printDetail() {
    let doc = window as any;
    doc.print()
  }

  @ViewChild("acc1") acc1: NgbAccordion;

  uploadDoc(doc: BookingDocumentDetail, type?: string) {
    const modalRef = this._modalService.open(UploadComponent, { size: 'lg', centered: true, windowClass: 'small-modal', backdrop: 'static' })
    if (type === 'reupload') {
      if (doc.DocumentLastStatus.toLowerCase() === 'approved') {
        doc.DocumentLastStatus = 'RESET'
      } else {
        doc.DocumentLastStatus = 'RE-UPLOAD'
      }
    }

    try {
      this.acc1.collapseAll()
    } catch { }

    doc.BookingID = this.bookingDetails.BookingID
    modalRef.componentInstance.passedData = doc
    modalRef.componentInstance.bookingData = this.bookingDetails
    modalRef.result.then((result) => {
      if (result === 'success') {
        if (this.isGuestLogin) {
          this.getBookingDetail(this.guestBookingKey)
        } else {
          this.getBookingDetail(this.currentBookingId)
        }
      }
    })
  }

  downloadAction($doc: BookingDocumentDetail) {
    if ($doc.DocumentFileName && $doc.DocumentFileName.length > 0 && $doc.IsDownloadable) {
      if ($doc.DocumentFileName.startsWith("[{")) {
        let document = JSON.parse($doc.DocumentFileName)
        window.open(baseExternalAssets + document[0].DocumentFile, '_blank');
      } else {
        window.open(baseExternalAssets + $doc.DocumentFileName, '_blank');
      }
    }
  }

  getTimeFlight(minute) {
    return getTimeStr(minute)
  }

  public safeBookingId
  shareShippingInfo(Carrier, Provider) {
    let url = window.location.href
    let splittedURL = url.split('/user')
    const newUrl = splittedURL[0] + '' + splittedURL[1]
    let finalURL: string
    this.safeBookingId = encryptBookingID(this.bookingDetails.BookingID, this.loginUser.UserID, this.bookingDetails.ShippingModeCode, 'GUEST')
    let shareURL = HashStorage.getItem('jwtOrigin') + '/booking-detail/' + this.safeBookingId
    this._userService.getGuestUserKey(this.loginUser.UserID).pipe(untilDestroyed(this)).subscribe((res: any) => {
      HashStorage.setItem('d3Key', res.returnText)
      let finalURL = shareURL + '/' + res.returnText
      const modalRef = this._modalService.open(ShareshippingComponent, {
        size: 'lg',
        centered: true,
        windowClass: 'small-modal',
        backdrop: 'static',
        keyboard: false
      });
      modalRef.componentInstance.shareObjectInfo = {
        carrier: Carrier,
        provider: Provider,
        url: finalURL
      }
      setTimeout(() => {
        if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
          document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
        }
      }, 0);
    }, (err: any) => {
    })

  }

  getIcon($mode: string) {
    return getGreyIcon($mode)
  }

  setAirCraftInfo(BookingRouteMapInfo: BookingRouteMapInfo) {
    const distFlightArr: Array<RouteInfo> = removeDuplicates(BookingRouteMapInfo.RouteInfo, "FlightNo")
    const distinctFlightNo: Array<RouteInfo> = distFlightArr.filter(flight => flight.FlightNo && flight.FlightNo.length > 0)
    const distinctAirCraftInfo: Array<RouteInfo> = []
    const { RouteInfo } = BookingRouteMapInfo
    distinctFlightNo.forEach(flight => {
      RouteInfo.forEach(route => {
        if (flight.FlightNo === route.FlightNo) {
          if (route.AirCraftInfo === null) {
            route.AirCraftInfo = 'N/A'
          }
          const objExists = distinctAirCraftInfo.find(craft => craft.AirCraftInfo === route.AirCraftInfo)
          if (!objExists) {
            distinctAirCraftInfo.push(route)
          }
        }
      })
    })
    this.distinctFlightNo = distinctFlightNo
    this.distinctAirCraftInfo = distinctAirCraftInfo

  }


  getUIImage($image: string, isProvider: boolean) {
    // if (isProvider) {
    //   const providerImage = getProviderImage($image)
    //   return getImagePath(ImageSource.FROM_SERVER, providerImage, ImageRequiredSize.original)
    // } else {
    //   return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
    // }

    if (isProvider) {
      const providerImage = getProviderImage($image)
      return getImagePath(ImageSource.FROM_SERVER, providerImage, ImageRequiredSize.original)
    } else {
      if (isJSON($image)) {
        const providerImage = JSON.parse($image)
        return baseExternalAssets + '/' + providerImage[0].DocumentFile
      } else {
        return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
      }
      // return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
    }
  }



  onDateSelect($item: MonthDateModel, $index: number) {

    if (!this.dateList[$index].isActive) {
      return
    }

    if (this.lastSelectedIndex === -1) {
      this.dateList.forEach(date => {
        date.isSelected = false
      })
    } else {
      if (this.lastSelectedIndex !== -1) {
        this.dateList[this.lastSelectedIndex].isSelected = false
      }
    }

    if (!this.dateList[$index].isSelected) {
      this.lastSelectedIndex = -1
    } else {
      this.lastSelectedIndex = $index
    }
    this.dateList[$index].isSelected = !this.dateList[$index].isSelected
    this.selectedDate = this.dateList[$index]
  }

  updateBooking($action: string, $event, $acc: NgbAccordion) {
    const { selectedDate, pickupTime } = this

    if (selectedDate) {
      const { hour, minute } = pickupTime
      const { pickupDate } = selectedDate
      const dateString = pickupDate + 'T' + this.leadingZero(hour) + ':' + this.leadingZero(minute) + ':00'
      const { BookingID, ShippingModeCode } = this.bookingDetails
      const userInfo = JSON.parse(Tea.getItem('loginUser'))
      const toSend: UpdateLoadPickupDate = {
        bookingID: BookingID,
        bookingType: ShippingModeCode,
        loginUserID: userInfo.LoginID,
        loadPickupDate: dateString,
        isCancelLoadPickup: ($action === 'discard') ? true : false
      }

      if ($action === 'update') {
        this.loadPickupService(toSend, $action, dateString, $acc)
      } else {
        const modalRef = this._modalService.open(ConfirmDialogComponent, {
          size: 'lg',
          centered: true,
          windowClass: 'small-modal',
          backdrop: 'static',
          keyboard: false
        });
        modalRef.componentInstance.messageData = {
          messageTitle: 'Confirm Cancel',
          messageContent: 'Are you sure you want to delete your pickup schedule?',
          data: {},
          buttonTitle: 'Yes, I want to delete my pickup schedule'
        }
        modalRef.result.then((result: string) => {
          this.shouldOpenPanel = true
          if (result === 'confirm') {
            this.loadPickupService(toSend, $action, dateString, $acc)
          }
        })

        setTimeout(() => {
          if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
            document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
          }
        }, 0);
      }



    } else {
      this._toastr.warning('Please select load pickup date', 'Schedule Load Pickup')
    }
  }

  setLoadPickupDate($loadPickupDate: string) {
    if ($loadPickupDate) {
      const lpdArr: Array<string> = $loadPickupDate.split('T')
      if (lpdArr && lpdArr.length > 1) {
        this.lpdate = lpdArr[0]
        const lpTimeArr: Array<string> = lpdArr[1].split(':')
        if (lpTimeArr && lpTimeArr.length > 1) {
          this.lpHr = lpTimeArr[0]
          this.lpMin = lpTimeArr[1]
        }
      }

      if (this.lpdate) {
        this.dateList.map(date => {
          if (date.pickupDate === this.lpdate) {
            date.isSelected = true
            this.selectedDate = {
              isActive: true,
              isSelected: true,
              pickupDate: this.lpdate
            }
          }
        })
      }
      if (this.lpHr) {
        this.pickupTime.hour = parseInt(this.lpHr)
        this.pickupTime.minute = parseInt(this.lpMin)
      }
    } else {
      this.loadPickupDate = null
      this.lpdate = '1900-01-01'
      this.lpHr = '00'
      this.lpMin = '00'
      this.selectedDate = null
      this.dateList.forEach(date => date.isSelected = false)
      this.pickupTime = {
        hour: 0,
        minute: 0
      }
    }
  }

  loadPickupService(toSend, $action, dateString, $acc: NgbAccordion) {
    this.bookingService.updateLoadPickupDate(toSend).subscribe((resp: JsonResponse) => {
      const { returnId, returnText } = resp
      if (returnId === 1) {
        this._toastr.success(returnText, 'Success')
        if ($action === 'update') {
          $acc.toggle('acc-load-pickup')
          this.loadPickupDate = dateString
        } else {
          this.setLoadPickupDate(null)
        }
        $acc.collapseAll()
      } else {
        this.setLoadPickupDate(null)
      }
    }, (error) => {
    })
  }

  leadingZero(num: number): string {
    if (num < 10) {
      return '0' + num
    }
    return num + ''
  }

  accChange($event: NgbPanelChangeEvent) {
    const { shouldOpenPanel } = this
    if ($event.panelId === 'acc-load-pickup' && shouldOpenPanel) {
      this.arrowChange = !this.arrowChange;
    } else {
      $event.preventDefault();
    }
  }
  setgraphdata() {
    const xAxisData = [];
    const data1 = [];
    const data2 = [];

    for (let i = 0; i < 100; i++) {
      xAxisData.push('category' + i);
      data1.push((Math.sin(i / 5) * (i / 5 - 10) + i / 6) * 5);
      data2.push((Math.cos(i / 5) * (i / 5 - 10) + i / 6) * 5);
    }

    this.options = {
      legend: {
        data: ['bar', 'bar2'],
        align: 'left'
      },
      tooltip: {},
      xAxis: {
        data: xAxisData,
        silent: false,
        splitLine: {
          show: false
        }
      },
      yAxis: {
      },
      series: [{
        name: 'bar',
        type: 'bar',
        data: data1,
        animationDelay: function (idx) {
          return idx * 10;
        }
      }, {
        name: 'bar2',
        type: 'bar',
        data: data2,
        animationDelay: function (idx) {
          return idx * 10 + 100;
        }
      }],
      animationEasing: 'elasticOut',
      animationDelayUpdate: function (idx) {
        return idx * 5;
      }
    };
  }

  onDiscardClick($acc: NgbAccordion) {
  }

  openCancelModal() {
    const modalRef = this._modalService.open(CancelBookingDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'medium-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.cancelData = {
      type: 'cancel',
      booking: this.bookingDetails
    };
    modalRef.result.then((result) => {
      if (result) {

        if (typeof result === 'object') {
          this.bookingDetails.BookingStatus = result.bookingStatus;
          this.bookingDetails.ShippingStatus = result.shippingStatus
        }
      }
    });
  }
  public trackingData: TrackingMonitoring
  public qualityMonitorData: QaualitMonitorResp

  //view booking
  changeView($type: string) {
    switch ($type) {
      case 'track':
        if (!this.shouldMapOpen) {
          this._toastr.warning('Tracking Cordinates Mismatched')
        }
        if (!this.isMonitoringOnBooking && !this.isTrackingOnBooking && !this.bookingDetails.EtdUtc) {
          this._toastr.warning('No data available for this Booking')
          return
        }
        loading(true)
        const { currentBookingId } = this

        // if (this.isTrackingOnBooking) {
        if (this.searchCriteria.searchMode !== 'truck-ftl') {
          this.bookingService.getTrackingInformation(currentBookingId).subscribe((res: JsonResponse) => {
            const { returnId, returnText } = res
            loading(false)
            if (returnId > 0) {
              this.trackingData = JSON.parse(returnText)
            } else {
              this._toastr.error(returnText, 'Error')
              this.trackingData = {
                ContainerDetails: [],
                EtaDetails: {
                  EtaLcl: '',
                  EtaUtc: '',
                  Status: ''
                },
                Polylines: [],
                RouteInformation: '',
                VesselInfo: {
                  VesselName: '',
                  VesselType: '',
                  VesselFlag: '',
                  VesselPhotos: [],
                }
              }
            }
            this.isTracking = true;
            this.isContDtl = false
          }, (error: HttpErrorResponse) => {
            this._toastr.error(error.message, 'Error')
            loading(false)
            this.trackingData = {
              ContainerDetails: [],
              EtaDetails: {
                EtaLcl: '',
                EtaUtc: '',
                Status: ''
              },
              Polylines: [],
              RouteInformation: '',
              VesselInfo: {
                VesselName: '',
                VesselType: '',
                VesselFlag: '',
                VesselPhotos: [],
              }
            }
            this.isTracking = true;
            this.isContDtl = false
          })
        }


        if (this.isMonitoringOnBooking || this.isTrackingOnBooking) {
          this.bookingService.getQualityMonitoringInformation(currentBookingId).subscribe((res: JsonResponse) => {
            loading(false)
            const { returnId, returnText } = res
            if (returnId > 0) {
              this.qualityMonitorData = JSON.parse(returnText)
            } else {
              this._toastr.error(returnText, 'Error')
              this.qualityMonitorData = {
                AlertData: [],
                MonitoringData: [],
                ProgressIndicators: []
              }
            }
            this.isTracking = true;
            this.isContDtl = false
          }, (error: HttpErrorResponse) => {
            loading(false)
            this._toastr.error(error.message, 'Error')
            this.qualityMonitorData = {
              AlertData: [],
              MonitoringData: [],
              ProgressIndicators: []
            }
            this.isTracking = true;
            this.isContDtl = false
          })
        }

        break;
      case 'view':
        this.isTracking = false
        this.isContDtl = false
        break;
      case 'container':
        this.isTracking = true;
        this.isContDtl = true
        break;
      default:
        break;
    }
  }
  //view booking end

  trackContrCallback($event: QualityMonitoringAlertData) {

    this.isTracking = true;
    this.isContDtl = true
    this.containerNumber = $event
    AppComponent.SCROLL_REF_MAIN.scrollYTo(0, 20);
  }

  getIconByMode($mode: string) {
    return getBlueModeIcon($mode)
  }

  ngOnDestroy() {
    try {
      this._dataService.setBookingsData(null)
      this.paramSubscriber.unsubscribe();
    } catch (error) { }
  }

  // Document Work

  public displayMonths = 1;
  public navigation = 'select';
  public showWeekNumbers = false;
  public outsideDays = 'visible';
  public uploadToggleBTn = true;
  public uploadToggleBTn2 = true;
  public uploadToggleBTn3 = true;
  public currentDocObject: UserDocument

  //Document Upload Stuff
  // public fileIsOver: boolean = false;
  // public tradeFile: DocumentFile
  // public optionss = {
  //   readAs: 'DataURL'
  // };

  public uploadForm: FormGroup
  public dateModel: NgbDateStruct
  public minDate
  public loading: boolean;
  public loginUser: LoginUser
  public additionalDocumentsCustomers: UserDocument[] = []
  public additionalDocumentsProviders: UserDocument[] = []

  public add_docs_cust: UserDocument
  public add_docs_prov: UserDocument

  setInit() {
    try {
      this.loginUser = JSON.parse(Tea.getItem('loginUser'))
      let date = new Date();
      this.resetAccordian()

      this.minDate = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      };
    } catch (error) { }
  }


  customDragCheck($fileEvent: DocumentFile) {
    let selectedFile: DocumentFile = $fileEvent
    // let docCopy = cloneObject(this.currentDocObject)
    this.currentDocObject.DocumentName = selectedFile.fileName
    this.currentDocObject.DocumentFileContent = selectedFile.fileBaseString
    this.currentDocObject.DocumentUploadedFileType = selectedFile.fileType
    // this.currentDocObject = docCopy

  }



  fileSelectFailedEvent($message: string) {
    this._toastr.error($message, 'Error')
  }


  onDocumentClick($newDocument: UserDocument, index: number) {
    let newDoc: UserDocument = $newDocument
    this.currentDocObject = $newDocument
    newDoc.MetaInfoKeysDetail.forEach((element: MetaInfoKeysDetail) => {
      if (element.DataType.toLowerCase() === 'datetime') {
        if (element.KeyValue) {
          element.DateModel = this.generateDateStructure(element.KeyValue)
        }
      }
    })
    this.resetAccordian(index, 'customer')
  }
  generateDateStructure(strDate: string): NgbDateStruct {
    let arr: Array<string> = strDate.split('/');
    let dateModel: NgbDateStruct = {
      day: parseInt(arr[1]),
      month: parseInt(arr[0]),
      year: parseInt(arr[2])
    }
    return dateModel
  }
  progress: number = 0

  uploadDocument(acc: any, acc_name: string, index: number, type) {
    this.loading = true
    loading(true)
    let toSend: UserDocument = cloneObject(this.currentDocObject)
    let docName: string = ''
    try {
      docName = toSend.MetaInfoKeysDetail.filter(meta => meta.KeyName === 'DOCNAME')[0].KeyValue
    } catch (error) {
      docName = 'ADD-DOC'
    }
    toSend.DocumentName = docName


    if (!toSend.DocumentFileContent && !toSend.DocumentFileName) {
      this._toastr.error('Please select a file to upload', 'Invalid Operation')
      this.loading = false
      loading(false)
      return
    }

    let emptyFieldFlag: boolean = false
    let hasInvalidLength: boolean = false
    let invalidLength: any
    let emptyFieldName: string = ''


    toSend.MetaInfoKeysDetail.forEach((element: MetaInfoKeysDetail) => {
      if (element.IsMandatory && !element.KeyValue) {
        emptyFieldFlag = true
        emptyFieldName = element.KeyNameDesc
        return;
      }

      if (element.IsMandatory && element.KeyValue && element.KeyValue.length > element.FieldLength) {
        hasInvalidLength = true
        invalidLength = element.FieldLength
        emptyFieldName = element.KeyNameDesc
        return;
      }
    })

    if (hasInvalidLength) {
      this._toastr.error(`${emptyFieldName} field is empty`, 'Invalid Operation')
      this.loading = false
      loading(false)
      return
    }

    if (emptyFieldFlag) {
      this._toastr.error(`${emptyFieldName} field length should be less or equal to 50 charaters`, 'Invalid Operation')
      this.loading = false
      loading(false)
      return
    }

    toSend.DocumentID = (toSend.DocumentID) ? toSend.DocumentID : -1;
    toSend.UserID = this.loginUser.UserID

    for (let ind = 0; ind < this.additionalDocumentsCustomers.length; ind++) {
      if (ind === index) {
        this.additionalDocumentsCustomers[index].ShowUpload = false
      }

    }

    // const uploadReq = new HttpRequest('POST', baseApi + `Document/Post`, toSend, {
    //   reportProgress: true,
    // });

    // this._http.request(uploadReq).subscribe(event => {
    //   if (event.type === HttpEventType.UploadProgress)
    //     this.progress = Math.round(100 * event.loaded / event.total);
    //   else if (event.type === HttpEventType.Response)
    //     loading(false)
    // });

    if (toSend.DocumentID > 0 && toSend.DocumentFileName) {
      // toSend.DocumentLastStatus = 'RESET'
      if (toSend.DocumentLastStatus.toLowerCase() === 'approved') {
        toSend.DocumentLastStatus = 'RESET'
      } else {
        toSend.DocumentLastStatus = 'RE-UPLOAD'
      }
    } else {
      toSend.DocumentLastStatus = 'DRAFT'
    }

    this._userService.saveUserDocument(toSend).subscribe((res: JsonResponse) => {
      if (res.returnId > 0) {
        this.loading = false
        loading(false)
        try {
          acc.collapseAll()
        } catch (error) {

        }

        // setTimeout(() => {
        //   acc.toggle(acc_name + index)
        // }, 0);
        // this.resetAccordian()
        if (this.isGuestLogin) {
          this.getBookingDetail(this.guestBookingKey)
        } else {
          this.getBookingDetail(this.currentBookingId)
        }
        if (toSend.DocumentID > 0) {
          this._toastr.success('Document Updated Successfully', res.returnStatus)
        } else {
          this._toastr.success('Document Saved Successfully', res.returnStatus)
        }
        // this.refetchUserDocsData(toSend.UserID, type)
      } else {
        this.loading = false
        loading(false)
        this._toastr.error(res.returnStatus)
      }
    }, (err: HttpErrorResponse) => {
      this.loading = false
      loading(false)
      this._toastr.error('An unexpected error occurred. Please try again later.', 'Failed')
    })
  }

  onKeyPress($event, index: number, length: number) {
    return true;
    if ($event.target.value.length > length) {
      return
    }

    let selectedValue = $event.target.value
    if ($event.target.value) {
      this.currentDocObject.MetaInfoKeysDetail[index].KeyValue = selectedValue
    }
  }

  dateChangeEvent($event: NgbDateStruct, index: number) {
    let selectedDate = new Date($event.year, $event.month - 1, $event.day);
    let formattedDate = moment(selectedDate).format('L');
    this.currentDocObject.MetaInfoKeysDetail[index].KeyValue = formattedDate
  }

  acDownloadAction($url: string, acc: any, acc_name: string, index: number, type: string) {
    if ($url && $url.length > 0) {
      if ($url.startsWith("[{")) {
        let document = JSON.parse($url)
        window.open(baseExternalAssets + document[0].DocumentFile, '_blank');
      } else {
        window.open(baseExternalAssets + $url, '_blank');
      }
      // window.open(baseExternalAssets + $url, '_blank');
      acc.toggle(acc_name + index)
      this.resetAccordian(index, type)
    }
  }

  async resetAccordian(index?: number, type?: string) {
    if (index) {
      if (type === 'customer') {
        this.additionalDocumentsCustomers[index].ShowUpload = !this.additionalDocumentsCustomers[index].ShowUpload
      } else {
        this.additionalDocumentsProviders[index].ShowUpload = !this.additionalDocumentsProviders[index].ShowUpload
      }
    }
    for (let i = 0; i < this.additionalDocumentsCustomers.length; i++) {
      if (i !== index) {
        this.additionalDocumentsCustomers[i].ShowUpload = false
      }
    }
    for (let i = 0; i < this.additionalDocumentsProviders.length; i++) {
      if (i !== index) {
        this.additionalDocumentsProviders[i].ShowUpload = false
      }
    }
  }

  addDocument($type: string) {
    if (this.bookingDetails.BookingStatus.toLowerCase() === 'cancelled') {
      return
    }
    if ($type === 'customer') {
      const { add_docs_cust, additionalDocumentsCustomers } = this
      const _existDoc = additionalDocumentsCustomers.filter(doc => doc.DocumentID === -1)
      if (_existDoc && _existDoc.length > 0) {
        return;
      }
      let _cpy_add_docs_cust = cloneObject(add_docs_cust)
      _cpy_add_docs_cust.DocumentID = -1
      _cpy_add_docs_cust.DocumentName = 'ADDITIONAL DOCUMENT'
      _cpy_add_docs_cust.DocumentTypeDesc = 'ADDITIONAL DOCUMENT'
      _cpy_add_docs_cust.DocumentTypeName = null
      _cpy_add_docs_cust.DocumentStausRemarks = ''
      _cpy_add_docs_cust.DocumentUploadDate = ''
      _cpy_add_docs_cust.DocumentFileName = null
      _cpy_add_docs_cust.IsDownloadable = false
      _cpy_add_docs_cust.DocumentUploadedFileType = null
      _cpy_add_docs_cust.DocumentLastStatus = ''
      _cpy_add_docs_cust.ReasonID = null

      try {
        _cpy_add_docs_cust.MetaInfoKeysDetail.forEach(inp => {
          inp.KeyValue = ''
        })
      } catch (error) {

      }
      _cpy_add_docs_cust.BookingID = this.bookingDetails.BookingID
      this.additionalDocumentsCustomers.push(_cpy_add_docs_cust)
    }
  }

  onDocInputChange($event: any) {

  }

  setSupOrgInfo() {
    this.editSupOrgToggler = false;
    if (this.bookingDetails.JsonShippingOrgInfo.Name) {
      this.SupInfoFormOrigin.controls['name'].setValue(this.bookingDetails.JsonShippingOrgInfo.Name);
    }
    if (this.bookingDetails.JsonShippingOrgInfo.Email) {
      this.SupInfoFormOrigin.controls['email'].setValue(this.bookingDetails.JsonShippingOrgInfo.Email);
    }
    if (this.bookingDetails.JsonShippingOrgInfo.Address) {
      this.SupInfoFormOrigin.controls['address'].setValue(this.bookingDetails.JsonShippingOrgInfo.Address);
    }
    if (this.bookingDetails.JsonShippingOrgInfo.PhoneNumber) {
      this.SupInfoFormOrigin.controls['contact'].setValue(this.bookingDetails.JsonShippingOrgInfo.PhoneNumber);
    }
    if (this.bookingDetails.JsonShippingOrgInfo.PhoneCountryID) {
      let object = this.countryList.find(obj => obj.id == this.bookingDetails.JsonShippingOrgInfo.PhoneCountryID);
      this.supFlagImgOrg = object.code;
      let description = object.desc;
      this.supOrgphoneCode = description[0].CountryPhoneCode;
      this.supOrgCountryId = object.id
    }
  }
  setSupDestInfo() {
    this.editSupDestToggler = false;
    if (this.bookingDetails.JsonShippingDestInfo.Name) {
      this.SupInfoFormDest.controls['name'].setValue(this.bookingDetails.JsonShippingDestInfo.Name);
    }
    if (this.bookingDetails.JsonShippingDestInfo.Email) {
      this.SupInfoFormDest.controls['email'].setValue(this.bookingDetails.JsonShippingDestInfo.Email);
    }
    if (this.bookingDetails.JsonShippingDestInfo.Address) {
      this.SupInfoFormDest.controls['address'].setValue(this.bookingDetails.JsonShippingDestInfo.Address);
    }
    if (this.bookingDetails.JsonShippingDestInfo.PhoneNumber) {
      this.SupInfoFormDest.controls['contact'].setValue(this.bookingDetails.JsonShippingDestInfo.PhoneNumber);
    }
    if (this.bookingDetails.JsonShippingDestInfo.PhoneCountryID) {
      let object = this.countryList.find(obj => obj.id == this.bookingDetails.JsonShippingDestInfo.PhoneCountryID);
      this.supFlagImgDest = object.code;
      let description = object.desc;
      this.supDestphoneCode = description[0].CountryPhoneCode;
      this.supDestCountryId = object.id
    }
  }

  updateSupInfoOrig() {

    if (this.SupInfoFormOrigin.invalid) {
      return;
    }

    const userInfo = JSON.parse(Tea.getItem('loginUser'))
    let obj = {
      BookingNature: (this.bookingDetails.ShippingModeCode == "WAREHOUSE") ? 'WH' : "SEA",
      BookingID: this.bookingDetails.BookingID,
      LoginUserID: userInfo.LoginID,
      PortNature: 'Origin',
      ContactInfoFor: 'Supplier',
      BookingSupDistInfo: {
        BookingID: this.bookingDetails.BookingID,
        Name: this.SupInfoFormOrigin.value.name,
        Address: this.SupInfoFormOrigin.value.address,
        Email: this.SupInfoFormOrigin.value.email,
        PhoneNumber: this.SupInfoFormOrigin.value.contact,
        PhoneCountryCode: this.supOrgphoneCode,
        PhoneCountryID: this.supOrgCountryId,
        InfoFor: "Supplier"
      }
    }
    this._userService.updateSupInfo(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toastr.success('Supplier information is updated', '');
        this.editSupOrgToggler = true;
        if (res.returnText && isJSON(res.returnText)) {
          this.bookingDetails.JsonShippingOrgInfo = JSON.parse(res.returnText);
        }
      }
    })

  }

  updateSupInfoDest() {

    if (this.SupInfoFormDest.invalid) {
      return;
    }

    const userInfo = JSON.parse(Tea.getItem('loginUser'))
    let obj = {
      BookingNature: (this.bookingDetails.ShippingModeCode == "WAREHOUSE") ? 'WH' : "SEA",
      BookingID: this.bookingDetails.BookingID,
      LoginUserID: userInfo.LoginID,
      PortNature: 'Destination',
      ContactInfoFor: 'Supplier',
      BookingSupDistInfo: {
        BookingID: this.bookingDetails.BookingID,
        Name: this.SupInfoFormDest.value.name,
        Address: this.SupInfoFormDest.value.address,
        Email: this.SupInfoFormDest.value.email,
        PhoneNumber: this.SupInfoFormDest.value.contact,
        PhoneCountryCode: this.supDestphoneCode,
        PhoneCountryID: this.supDestCountryId,
        InfoFor: "Supplier"
      }
    }
    this._userService.updateSupInfo(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toastr.success('Supplier information is updated', '');
        this.editSupDestToggler = true;
        if (res.returnText && isJSON(res.returnText)) {
          this.bookingDetails.JsonShippingDestInfo = JSON.parse(res.returnText);
        }
      }
    })
  }
  selectPhoneCode(list, type) {
    if (type == 'origin') {
      this.supFlagImgOrg = list.code;
      let description = list.desc;
      this.supOrgphoneCode = description[0].CountryPhoneCode;
      this.supOrgCountryId = list.id
    }
    else if (type == 'destination') {
      this.supFlagImgDest = list.code;
      let description = list.desc;
      this.supDestphoneCode = description[0].CountryPhoneCode;
      this.supDestCountryId = list.id
    }
  }

  readMore() {
    this.readMoreClass = !this.readMoreClass;
    if (this.readMoreClass)
      this.vendorAboutBtn = 'Read Less'
    else
      this.vendorAboutBtn = 'Read More'
  }
  ShippingOrgInforeadMore() {
    this.ShippingOrgInforeadMoreClass = !this.ShippingOrgInforeadMoreClass;
    if (this.ShippingOrgInforeadMoreClass)
      this.ShippingOrgInfoBtn = 'Read Less'
    else
      this.ShippingOrgInfoBtn = 'Read More'
  }
  JsonAgentOrgInfoReadMore() {
    this.JsonAgentOrgInfoReadMoreClass = !this.JsonAgentOrgInfoReadMoreClass;
    if (this.JsonAgentOrgInfoReadMoreClass)
      this.JsonAgentOrgInfoBtn = 'Read Less'
    else
      this.JsonAgentOrgInfoBtn = 'Read More'
  }
  JsonAgentDestInfoReadMore() {
    this.JsonAgentDestInfoReadMoreClass = !this.JsonAgentDestInfoReadMoreClass;
    if (this.JsonAgentDestInfoReadMoreClass)
      this.JsonAgentDestInfoBtn = 'Read Less'
    else
      this.JsonAgentDestInfoBtn = 'Read More'
  }

  textValidation(event) {
    try {
      const pattern = /[a-zA-Z-][a-zA-Z -]*$/;
      const inputChar = String.fromCharCode(event.charCode);
      if (!pattern.test(inputChar)) {

        if (event.charCode == 0) {
          return true;
        }

        if (event.target.value) {
          const end = event.target.selectionEnd;
          if ((event.which == 32 || event.keyCode == 32) && (event.target.value[end - 1] == " " || event.target.value[end] == " ")) {
            event.preventDefault();
            return false;
          }
        }
        else {
          event.preventDefault();
          return false;
        }
      } else {
        return true;
      }
    } catch (error) {
      return false
    }

  }

  NumberValid(evt) {
    let charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 37 && charCode != 39 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }

  //Form Validation Work
  sup_origin_name_error: boolean = false
  sup_origin_address_error: boolean = false
  sup_origin_contact_error: boolean = false
  sup_origin_email_error: boolean = false

  sup_dest_name_error: boolean = false
  sup_dest_address_error: boolean = false
  sup_dest_contact_error: boolean = false
  sup_dest_email_error: boolean = false

  errorMessages($from: string) {
    if ($from === 'origin') {
      if (this.SupInfoFormOrigin.controls.name.status === "INVALID" && this.SupInfoFormOrigin.controls.name.touched) {
        this.sup_origin_name_error = true;
      }
      if (this.SupInfoFormOrigin.controls.address.status === "INVALID" && this.SupInfoFormOrigin.controls.address.touched) {
        this.sup_origin_address_error = true;
      }
      if (this.SupInfoFormOrigin.controls.contact.status === "INVALID" && this.SupInfoFormOrigin.controls.contact.touched) {
        this.sup_origin_contact_error = true;
      }
      if (this.SupInfoFormOrigin.controls.email.status === "INVALID" && this.SupInfoFormOrigin.controls.email.touched) {
        this.sup_origin_email_error = true;
      }
    } else {
      if (this.SupInfoFormDest.controls.name.status === "INVALID" && this.SupInfoFormDest.controls.name.touched) {
        this.sup_dest_name_error = true;
      }
      if (this.SupInfoFormDest.controls.address.status === "INVALID" && this.SupInfoFormDest.controls.address.touched) {
        this.sup_dest_address_error = true;
      }
      if (this.SupInfoFormDest.controls.contact.status === "INVALID" && this.SupInfoFormDest.controls.contact.touched) {
        this.sup_dest_contact_error = true;
      }
      if (this.SupInfoFormDest.controls.email.status === "INVALID" && this.SupInfoFormDest.controls.email.touched) {
        this.sup_dest_email_error = true;
      }
    }
  }


  resetForm($type: string) {
    if ($type === 'origin') {
      this.SupInfoFormOrigin.reset()

      this.sup_origin_name_error = false
      this.sup_origin_address_error = false
      this.sup_origin_contact_error = false
      this.sup_origin_email_error = false
    } else if ('destin') {
      this.SupInfoFormDest.reset()

      this.sup_dest_name_error = false
      this.sup_dest_address_error = false
      this.sup_dest_contact_error = false
      this.sup_dest_email_error = false
    }
  }

  //Toogle work

  originToggle: boolean = false
  originToggleClass: string = 'Hide'

  destinToggle: boolean = false
  destinToggleClass: string = 'Hide'

  toggleInfoSection($type: string) {
    if ($type === 'origin') {
      this.originToggle = !this.originToggle;
      this.originToggleClass = (!this.originToggle) ? "Hide" : "Show";
    } else if ($type === 'destin') {
      this.destinToggle = !this.destinToggle;
      this.destinToggleClass = (!this.destinToggle) ? "Hide" : "Show";
    }

  }


  /**
   *
   * VIEW CONTAINER DETAILS
   * @memberof ViewBookingComponent
   */
  openAddContainer() {
    const modalRef = this._modalService.open(ContainerInfoComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'large-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.containerDetails = this.bookingDetails;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }

}

export interface MonthDateModel {
  isActive: boolean;
  isSelected: boolean;
  pickupDate: string;
}
