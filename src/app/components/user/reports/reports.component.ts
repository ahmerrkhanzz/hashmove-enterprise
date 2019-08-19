import { Component, OnInit } from '@angular/core';
import { UserBarGraph, UserRegionBarGraph, UserPieChart, UserBarGraphDash, UserRegionBarGraphDash, UserPieChartDash, UserGraphData, CodeValMst } from './resports.interface';
import { BookingList, UserDashboardData } from '../../../interfaces/user-dashboard';
import { DataService } from '../../../services/commonservice/data.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import * as echarts from 'echarts'
import { DropDownService } from '../../../services/dropdownservice/dropdown.service';
import { UserService } from '../user-service';
import { LoginUser } from '../../../interfaces/user.interface';
import { getLoggedUserData, cloneObject, removeDuplicates, kFormatter, removeDuplicateCurrencies, compareValues, Tea, startElementsOfArr } from '../../../constants/globalfunctions';
import { JsonResponse } from '../../../interfaces/JsonResponse';
import { firstBy } from 'thenby';
import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyControl } from '../../../shared/currency/currency.injectable';
import { CurrencyDetails, ExchangeRate, Rate } from '../../../interfaces/currencyDetails';
import { SelectedCurrency } from '../../../shared/currency-dropdown/currency-dropdown.component';
import { currErrMsg } from '../../../shared/constants';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  preserveWhitespaces: true
})
export class ReportsComponent implements OnInit {

  public isDashDataLoaded: boolean = false
  public dashboardData: UserDashboardData;

  public bookingList: BookingList[]
  public currentBookings: BookingList[]

  public userGraphData: UserGraphData

  public userBarGraph: any;
  public userRegionBarGraph: any;
  public userPieChart: any;
  public optionHalfRound: any;
  public mapData: any
  theme: string

  imp_ExpType: string = 'export'
  reportPeriod: string = 'CURRENTMONTH'
  reportPeriodDesc: string = 'Current Month'

  periodList: Array<CodeValMst> = []


  // ========== Option Half Round ========== //
  public color = ['#02bdb6', '#02bdb5', '#8472d5', '#8472d6', '#435d77', '#435d72', '#00a2df', '#00a3df'];
  public dataStyle = {
    normal: {
      label: {
        show: false
      },
      labelLine: {
        show: false
      },
      shadowBlur: 40,
      borderWidth: 10,
      shadowColor: 'rgba(0, 0, 0, 0)'
    }
  };
  public placeHolderStyle = {
    normal: {
      color: '#f3f3f6',
      label: {
        show: false
      },
      labelLine: {
        show: false
      }
    },
    emphasis: {
      color: '#f3f3f6'
    }
  };
  constRadius = [82, 90] //dont change

  currencyList: any
  currCurrency: SelectedCurrency = {
    sortedCurrencyID: 101,
    sortedCountryFlag: 'ae',
    sortedCountryName: 'AED',
    sortedCountryId: 101
  }
  exchangeData: ExchangeRate
  exchnageRate: Rate = {
    currencyCode: 'AED',
    currencyID: 101,
    rate: 1
  }

  public isCurrVsPrev: boolean = false
  public isBarGraph: boolean = false
  public isRegionMap: boolean = false
  public isVas: boolean = false
  public isTypeCompare: boolean = false

  constructor(
    private _dataService: DataService,
    private _dropDownSrv: DropDownService,
    private _userService: UserService,
    private _currencyControl: CurrencyControl
  ) { }



  async ngOnInit() {

    this._dropDownSrv.getMstCodeVal('PERIOD').subscribe((resp: any) => {
      this.periodList = resp
    }, (err: HttpErrorResponse) => {
    })

    this._dataService.currentDashboardData.pipe(untilDestroyed(this)).subscribe((data: any) => {
      if (data !== null) {
        if (!this.isDashDataLoaded) {
          this.dashboardData = data;
          this.setUserData();
          this.isDashDataLoaded = true
        }
      }
    });

    try {
      await this.setCurrencyList()
    } catch (error) {
      console.warn('Currency not Set', error);

    }
    const { reportPeriod } = this
    this.setMasterGraph(reportPeriod)

  }



  async setCurrencyList() {
    const res: any = await this._dropDownSrv.getCurrency().toPromise()
    let currencyList = res;
    currencyList = removeDuplicateCurrencies(currencyList)
    currencyList.sort(compareValues('title', "asc"));
    this.currencyList = currencyList;
    await this.selectedCurrency();
  }



  async selectedCurrency() {

    const { CurrencyID } = getLoggedUserData()

    const seletedCurrency: CurrencyDetails = this.currencyList.find(obj => obj.id == CurrencyID)

    let currentCurrency: SelectedCurrency = {
      sortedCurrencyID: seletedCurrency.id,
      sortedCountryFlag: seletedCurrency.imageName.toLowerCase(),
      sortedCountryName: seletedCurrency.code,
      sortedCountryId: JSON.parse(seletedCurrency.desc).CountryID
    }

    this.currCurrency = currentCurrency
    const { currCurrency } = this
    const baseCurrencyID = this._currencyControl.getBaseCurrencyID();
    const res2: JsonResponse = await this._dropDownSrv.getExchangeRateList(baseCurrencyID).toPromise()
    this.exchangeData = res2.returnObject
    this.exchnageRate = this.exchangeData.rates.filter(rate => rate.currencyID === currCurrency.sortedCurrencyID)[0]
  }


  setMasterGraph($reportPeriod) {
    this.setgraphdata()
    const userData: LoginUser = getLoggedUserData()
    const { UserID } = userData

    this._userService.getUserGraphData(UserID, $reportPeriod).subscribe((resp: JsonResponse) => {
      const { returnId, returnObject } = resp
      if (returnId > 0) {
        this.userGraphData = returnObject

        const { userGraphData } = this
        this.setCurrentVsPrev()
        this.setBarGraphData(userGraphData)
        this.setPieChartData(userGraphData)
        this.setRegionChartData(userGraphData, true)
        const { vasComparisonGraph } = userGraphData
        setTimeout(() => {
          this.isRegionMap = false
        }, 0);
        this.setVasData(vasComparisonGraph)
        this.setRegionMapData(userGraphData, true)
        setTimeout(() => {
          this.isRegionMap = true
        }, 10);
      }
    })
  }

  setCurrentVsPrev() {

    setTimeout(() => {
      this.isCurrVsPrev = false
    }, 20);

    const { currentVsPrevious } = this.userGraphData
    const { exchnageRate, currCurrency } = this
    const { sortedCountryName } = currCurrency
    try {
      currentVsPrevious.forEach(bar => {
        const { totalAmount } = bar
        if (totalAmount === 0) {
          bar.amountComp = 0
        }
        bar.totalAmount = this._currencyControl.getNewPrice(totalAmount, exchnageRate.rate)
        bar.currencyCode = sortedCountryName
      })
    } catch (err) {
      const { title, text } = currErrMsg
    }

    setTimeout(() => {
      this.isCurrVsPrev = true
    }, 20);
  }

  async setBarGraphData(userGraphData: UserGraphData) {

    setTimeout(() => {
      this.isBarGraph = false
    }, 20);

    const { barGraph } = userGraphData

    if (barGraph.length === 0) {
      this.userBarGraph.title = { text: 'No Data to Show', x: 'center', y: 'center' }
      this.userBarGraph.color = []
      this.userBarGraph.legend.data = []
      this.userBarGraph.xAxis[0].data = []
      this.userBarGraph.series = []
      setTimeout(() => {
        this.isBarGraph = true
      }, 20);
      return
    }

    this.userBarGraph.title = {}
    const { exchnageRate } = this
    try {
      barGraph.forEach(bar => {
        const { totalCount } = bar
        bar.totalCount = this._currencyControl.getNewPrice(totalCount, exchnageRate.rate)
      })

    } catch (err) {
      const { title, text } = currErrMsg
    }



    const legendsList = getLegends(barGraph)
    const colorList = getColorList(legendsList)
    const axisData = getAxisData(barGraph)
    const seriesList = getSerieData(legendsList, barGraph)

    let copyOfBarGraph = cloneObject(this.userBarGraph)
    copyOfBarGraph.color = colorList
    copyOfBarGraph.legend.data = legendsList
    copyOfBarGraph.xAxis[0].data = axisData
    copyOfBarGraph.series = seriesList
    this.userBarGraph = copyOfBarGraph
    setTimeout(() => {
      this.isBarGraph = true
    }, 20);
  }

  setPieChartData(userGraphData: UserGraphData) {
    setTimeout(() => {
      this.isTypeCompare = false
    }, 20);

    if (userGraphData.pieChart.length === 0) {
      this.userPieChart.title = { text: 'No Data to Show', x: 'center', y: 'center' }
      this.userPieChart.series[0].data = []

      setTimeout(() => {
        this.isTypeCompare = true
      }, 20);
      return
    }
    this.userPieChart.title = {}
    const legendsList = extractColumn(userGraphData.pieChart, 'name')
    const colorList = getColorList(legendsList)
    this.userPieChart.color = colorList

    this.userPieChart.series[0].data = userGraphData.pieChart
    const pieClone = cloneObject(this.userPieChart)
    this.userPieChart = pieClone

    setTimeout(() => {
      this.isTypeCompare = true
    }, 20);
  }

  setUserData() {
    if (this.dashboardData.BookingDetails) {
      this.bookingList = this.dashboardData.BookingDetails;
      this.currentBookings = startElementsOfArr(this.bookingList, 5)
    }
  }

  setRegionChartData(userGraphData: UserGraphData, $setCurrency: boolean) {
    const newRegionGraphList: Array<any> = userGraphData.regionBarGraph

    if ($setCurrency) {
      try {
        const { rate } = this.exchnageRate
        newRegionGraphList.forEach(region => {
          const { amount } = region
          region.amount = this._currencyControl.getNewPrice(amount, rate)
        })
      } catch (error) { }
    }

    const regionGraphList: Array<any> = newRegionGraphList.filter(
      region => region.impExp.toLowerCase() === this.imp_ExpType
    )

    if (regionGraphList.length === 0) {
      this.userRegionBarGraph.title = { text: 'No Data to Show', x: 'center', y: 'center' }
      this.userRegionBarGraph.series[0].data = []
      this.userRegionBarGraph.yAxis.show = false
      this.userRegionBarGraph.xAxis.show = false
      return
    }



    this.userRegionBarGraph.yAxis.show = true
    this.userRegionBarGraph.xAxis.show = true
    this.userRegionBarGraph.title = {}
    const regionDict = extractColumn(regionGraphList, 'value')
    const regionData = extractColumn(regionGraphList, 'name')
    this.userRegionBarGraph.yAxis.data = regionData
    this.userRegionBarGraph.series[0].data = regionDict
    const regionBarClone = cloneObject(this.userRegionBarGraph)
    this.userRegionBarGraph = regionBarClone
  }

  setRegionMapData(userGraphData, $setCurrency: boolean) {
    const regionGraphList: Array<any> = userGraphData.regionMapGraph
    if ($setCurrency) {
      try {
        const { rate } = this.exchnageRate
        regionGraphList.forEach(region => {
          const { totalAmount } = region
          region.totalAmount = this._currencyControl.getNewPrice(totalAmount, rate)
        })
      } catch (error) {
        console.log(error);
      }
    }
    const filteredMapData: Array<any> = regionGraphList.filter(
      region => region.impExp.toLowerCase() === this.imp_ExpType
    )
    this.mapData = filteredMapData
  }

  setVasData(compData) {

    setTimeout(() => {
      this.isVas = false
    }, 20);

    const seriesTemplete = {
      name: 'Line 4',
      type: 'pie',
      clockWise: true,
      radius: [172, 180],
      center: ['50%', '50%'],
      itemStyle: this.dataStyle,
      hoverAnimation: true,
      startAngle: 270,
      label: {
        borderRadius: '10',
      },
      data: [
        {
          value: 55,
          name: 'D', //actual legend
          tooltip: {
            show: true
          },
          itemStyle: {
            normal: {
              // color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: '#f3f3f6',
              }, {
                offset: 1,
                color: '#f3f3f6'
              }])
            }
          }
        },
        {
          value: 45,
          name: '', //remaining legend
          tooltip: {
            show: false
          },
          itemStyle: this.placeHolderStyle
        },
      ]
    }

    if (compData.totalAmount === 0) {
      const halfPieClone: any = cloneObject(this.optionHalfRound)

      halfPieClone.title = { text: 'No Data to Show', x: 'center', y: 'center' }
      halfPieClone.series[0].data = []
      halfPieClone.series = []
      halfPieClone.legend.data = []
      halfPieClone.color = []
      this.optionHalfRound = cloneObject(halfPieClone)
      setTimeout(() => {
        this.isVas = true
      }, 20);
      return
    }

    this.optionHalfRound.title = {
      text: '100,000',
      subtext: `${this.currCurrency.sortedCountryName}`,
      x: 'center',
      y: 'center',
      textStyle: {
        fontWeight: 'bold',
        fontSize: 32,
        fontFamily: 'Proxima Nova, sans-serif',
        padding: [0, 0],
        color: "#2b2b2b",
      },
      subtextStyle: {
        fontWeight: 'bold',
        fontSize: 24,
        fontFamily: 'Proxima Nova, sans-serif',
        padding: [0, 0],
        color: "#e7e8ed",
      }
    }

    let defRadius = cloneObject(this.constRadius)
    let defRadiusDiff = getRadiusDiff(compData.vasComparisonDetail.length)
    const newSeries = []


    const { exchnageRate } = this
    compData.vasComparisonDetail.forEach(vas => {
      const newSerie = cloneObject(seriesTemplete)
      newSerie.radius = cloneObject(defRadius)
      const { totalAmount } = compData
      const { amount, key } = vas
      const remainingAmount = totalAmount - amount
      const dataColor = getColorByType(key.toLowerCase())

      const colorObj = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
        offset: 0,
        color: dataColor,
      }, {
        offset: 1,
        color: dataColor
      }])

      newSerie.name = key
      newSerie.data[0].value = this._currencyControl.applyRoundByDecimal(this._currencyControl.getNewPrice(amount, exchnageRate.rate), 2)
      newSerie.data[0].name = key
      newSerie.data[0].itemStyle.normal.color = colorObj
      newSerie.data[1].value = this._currencyControl.applyRoundByDecimal(this._currencyControl.getNewPrice(remainingAmount, exchnageRate.rate), 2)

      defRadius = getRadius(defRadiusDiff, defRadius)

      newSeries.push(newSerie)
    })
    const vasLegends = getVasLegends(compData)
    const vasColors = []

    vasLegends.forEach(legend => {
      const color = getColorByType(legend.toLowerCase())
      vasColors.push(color)
    })

    const { totalAmount } = compData
    const newTotalAmount = this._currencyControl.getNewPrice(totalAmount, exchnageRate.rate)
    const finnAmount = kFormatter(this._currencyControl.applyRoundByDecimal(newTotalAmount, 2))

    let halfPieClone = cloneObject(this.optionHalfRound)
    halfPieClone.title.text = finnAmount
    halfPieClone.series = newSeries
    halfPieClone.legend.data = vasLegends
    halfPieClone.color = vasColors

    this.optionHalfRound = halfPieClone

    setTimeout(() => {
      this.isVas = true
    }, 20);
  }

  setgraphdata() {
    // ========== Chart #1 Bar Chart ========== /
    this.userBarGraph = {
      color: ['#02bdb6', '#8472d5'],
      tooltip: {
        trigger: 'axis',
        // formatter: '{b} <br> {c} ({d}%)',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: ['rgba(255,255,255,1)'],
        padding: [20, 24],
        extraCssText: 'box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.2);',
        textStyle: {
          color: '#2b2b2b', //#738593
          decoration: 'none',
          fontFamily: 'Proxima Nova, sans-serif',
          fontSize: 16,
          //fontStyle: 'italic',
          //fontWeight: 'bold'
        }
      },
      legend: {
        data: ['Sea Frieght', 'Air Freight'] //Hamza
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'], //Hamza
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          // type: 'category',
          // data: ['0', '1k', '2M', '4M', '10M']
        }
      ],
      series: [
        {
          name: '',
          type: 'bar',
          barGap: 0.1,
          barWidth: 10,
          itemStyle: {
            normal: {
              barBorderRadius: 15,
            }
          },
          data: [] //Hamza
        },
      ]
    };
    // ========== Chart #3 UserRegionBarGraph (Volume%) ========== /
    this.userRegionBarGraph = {
      height: 340,
      color: ['#3398DB'],
      title: {
        // text: '各省数据合格率统计',
        //textStyle: {
        //    color: '#fff'
        //}
      },
      // tooltip: {
      //   trigger: 'axis',
      //   axisPointer: {
      //     type: 'shadow'
      //   },
      //   formatter: "{b} <br> 合格率: {c}%"
      // },
      /*legend: {
          data: [date]
      },*/
      grid: {
        left: '4%',
        right: '4%',
        bottom: '2%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        show: false,
        axisLine: {
          show: false,
          onZero: false,
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            type: "dotted",
            shadowBlur: -20
          }
        }
      },
      yAxis: {
        type: 'category',
        data: ['湖北省', '湖南省', '河南省', '安徽省', '浙江省', '山东省', '广东省'],
        axisLabel: {
          show: false,
        },
        axisTick: {
          show: false
        },
        axisLine: {
          show: false,
          onZero: false,
        },
      },
      series: [{
        type: 'bar',
        barWidth: 30,
        label: {
          align: 'right',
          normal: {
            show: true,
            formatter: '{b}',
            position: 'insideLeft',
            // formatter: function(v) {
            //     var val = v.data;
            //     if (val == 0) {
            //         return '';
            //     }
            //     return val;
            // },
            color: '#000'
          }
        },
        data: [22, 33, 44, 55, 66, 77, 88]
      }]
    };
    // ========== Chart #x Configurations ========== /
    this.userPieChart = {
      color: ['#02bdb6', '#8472d5', '#435d72', '#00a2df'],
      title: {
        x: 'left'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b} <br> ({d}%)',
        backgroundColor: 'rgba(255,255,255,1)',
        padding: [20, 24],
        extraCssText: 'box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.2);',
        textStyle: {
          color: '#2b2b2b', //#738593
          decoration: 'none',
          fontFamily: 'Proxima Nova, sans-serif',
          fontSize: 16,
          //fontStyle: 'italic',
          //fontWeight: 'bold'
        }

      },
      calculable: true,
      series: [
        {
          name: 'area',
          type: 'pie',
          radius: [30, 70],
          roseType: 'area',
          data: [
            { value: 33, name: 'Sea Freight' },
            { value: 26, name: 'Air Freight' },
            { value: 19, name: 'Ground Transport' },
            { value: 22, name: 'Warehousing' }
          ]
        }
      ]
    };
    // ========== Chart #x Configurations (Services Comparision) ========== /
    this.optionHalfRound = {
      color: [],
      backgroundColor: 'rgba(255, 255, 255, 1)',
      title: {
        text: '100,000',
        subtext: `${this.currCurrency.sortedCountryName}`,
        x: 'center',
        y: 'center',
        textStyle: {
          fontWeight: 'bold',
          fontSize: 32,
          fontFamily: 'Proxima Nova, sans-serif',
          padding: [0, 0],
          color: "#2b2b2b",
        },
        subtextStyle: {
          fontWeight: 'bold',
          fontSize: 24,
          fontFamily: 'Proxima Nova, sans-serif',
          padding: [0, 0],
          color: "#e7e8ed",
        }
      },
      tooltip: {
        trigger: 'item',
        show: true,
        // formatter: `Total Spend <br /> On {b} <br/> <sub>${this.currCurrency.sortedCountryName}</sub> <br/> <strong>{c}</strong>`,
        formatter: function (v) {
          let val = v.data;
          if (val == 0) {
            return '';
          }
          return val;
        },
        backgroundColor: 'rgba(255,255,255,1)',
        padding: [20, 24],
        extraCssText: 'box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.2);',
        textStyle: {
          color: '#2b2b2b', //#738593
          decoration: 'none',
          fontFamily: 'Proxima Nova, sans-serif',
          fontSize: 16,
          //fontStyle: 'italic',
          //fontWeight: 'bold'
        }
      },
      legend: {
        color: ["#02bdb6", "#8472d5", "#00a2df", "#435d77"],
        orient: 'vertical',
        // icon: 'circle',
        left: 'right',
        bottom: '20',
        itemGap: 15,
        data: ['A', 'B', 'C', 'D'],
        textStyle: {
          color: '#fft'
        }
      },
      series: [
        {
          name: 'Line 4',
          type: 'pie',
          clockWise: true,
          radius: [176, 186],
          center: ['50%', '50%'],
          itemStyle: this.dataStyle,
          hoverAnimation: true,
          startAngle: 270,
          label: {
            borderRadius: '10',
          },
          data: [{
            value: 55,
            name: 'D', //actual legend
            tooltip: {
              show: true
            },
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: this.color[6],
                }, {
                  offset: 1,
                  color: this.color[7]
                }])
              }
            }
          },
          {
            value: 45,
            name: '', //remaining legend
            tooltip: {
              show: false
            },
            itemStyle: this.placeHolderStyle
          },
          ]
        },
        {
          name: 'Line 4',
          type: 'pie',
          clockWise: true,
          radius: [152, 162],
          center: ['50%', '50%'],
          itemStyle: this.dataStyle,
          hoverAnimation: true,
          startAngle: 270,
          label: {
            borderRadius: '10',
          },
          data: [{
            value: 55,
            name: 'D', //actual legend
            tooltip: {
              show: true
            },
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: this.color[6],
                }, {
                  offset: 1,
                  color: this.color[7]
                }])
              }
            }
          },
          {
            value: 45,
            name: '', //remaining legend
            tooltip: {
              show: false
            },
            itemStyle: this.placeHolderStyle
          },
          ]
        },
        {
          name: 'Line 1',
          type: 'pie',
          clockWise: true,
          radius: [128, 138],
          center: ['50%', '50%'],
          itemStyle: this.dataStyle,
          hoverAnimation: true,
          startAngle: 270,
          label: {
            borderRadius: '5',
          },
          data: [{
            value: 55,
            name: 'C',
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: this.color[0]
                }, {
                  offset: 1,
                  color: this.color[1]
                }])
              }
            }
          },
          {
            value: 45,
            name: '',
            tooltip: {
              show: true
            },
            itemStyle: this.placeHolderStyle
          },
          ]
        },
        {
          name: 'Line 2',
          type: 'pie',
          clockWise: true,
          radius: [104, 114],
          center: ['50%', '50%'],
          itemStyle: this.dataStyle,
          hoverAnimation: true,
          startAngle: 270,
          data: [{
            value: 55,
            name: 'B',
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: this.color[2]
                }, {
                  offset: 1,
                  color: this.color[2]
                }])
              }
            }
          },
          {
            value: 45,
            name: '',
            tooltip: {
              show: false
            },
            itemStyle: this.placeHolderStyle
          },
          ]
        },
        {
          name: 'Line 3',
          type: 'pie',
          clockWise: true,
          radius: [82, 90],
          center: ['50%', '50%'],
          itemStyle: this.dataStyle,
          hoverAnimation: true,
          startAngle: 270,
          data: [{
            value: 55,
            name: 'A',
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: this.color[4]
                }, {
                  offset: 1,
                  color: this.color[4]
                }]),
              }
            }
          },
          {
            value: 45,
            name: '',
            tooltip: {
              show: false
            },
            itemStyle: this.placeHolderStyle
          },
          ]
        }
      ]
    };
  }

  onImp_Exp($change: string) {
    this.imp_ExpType = $change
    const { userGraphData } = this
    setTimeout(() => {
      this.isRegionMap = false
    }, 10);
    this.setRegionChartData(userGraphData, false)
    this.setRegionMapData(userGraphData, false)
    setTimeout(() => {
      this.isRegionMap = true
    }, 10);
  }

  onPeriodChange($period: string, $periodDesc: string) {
    this.reportPeriod = $period
    this.reportPeriodDesc = $periodDesc
    this.isCurrVsPrev = false
    this.isBarGraph = false
    this.isRegionMap = false
    this.isVas = false
    this.isTypeCompare = false
    this.setMasterGraph($period)
  }

  ngOnDestroy() {

  }

}

export function getColorByType(type: string) {
  const colors = [
    { type: 'warehousing', color: '#02bdb6' },
    { type: 'sea freight', color: '#8472d5' },
    { type: 'ground transport', color: '#435d77' },
    { type: 'air freight', color: '#00a2df' },
    { type: 'quality monitoring', color: '#8472d5' },
    { type: 'custom clearance', color: '#02bdb6' },
    { type: 'insurance', color: '#435d77' },
    { type: 'tracking', color: '#00a2df' },
  ]

  return colors.find(color => color.type === type).color
}

export function getRegionDictionary(list: Array<any>) {
  //New
  const regionDict = extractColumn(list, 'amount')
  return regionDict
}

export function extractColumn(arr, column) {
  return arr.map(x => x[column])
}

export function getLegends(list) {
  const data = removeDuplicates(list, "shippingModeCode")
  const legends = extractColumn(data, 'shippingModeCode')
  return legends
}

export function getColorList(legends) {
  const arrColor = legends.map(legend => getColorByType(legend.toLowerCase()))
  return arrColor
}

export function getAxisData(list) {
  const sorted = list.sort(
    firstBy(function (v1, v2) { return v1.sortingOrder - v2.sortingOrder; })
  );
  const data = removeDuplicates(sorted, "key")
  const axisData = extractColumn(data, 'key')
  return axisData
}

export function getRadius(radDiff, currRadius) {
  let newRad = currRadius

  newRad[0] = radDiff + newRad[0]
  newRad[1] = radDiff + newRad[1]
  return newRad
}


export function getSerieData(legendsList, barGraph) {

  const series = []
  legendsList.forEach(legend => {

    const sortedMode = barGraph.sort(
      firstBy(function (v1, v2) { return v1.sortingOrder - v2.sortingOrder; })
    );
    const currencyControl = new CurrencyControl()
    const filteredMode: Array<any> = sortedMode.filter(mode => mode.shippingModeCode.toLowerCase() === legend.toLowerCase())
    filteredMode.forEach(mode => mode.totalCount = currencyControl.applyRoundByDecimal(mode.totalCount, 1))
    const dataObject = extractColumn(filteredMode, 'totalCount')

    const serie = {
      name: legend,
      type: 'bar',
      barGap: 0.1,
      barWidth: 10,
      itemStyle: {
        normal: {
          barBorderRadius: 15,
        }
      },
      data: dataObject
    }
    series.push(serie)
  })
  return series
}

export function getRadiusDiff(totalModes) {
  let diff = 0
  try { diff = Math.floor(120 / totalModes) }
  catch (error) { diff = 30 }

  if (diff >= 30) {
    diff = 25
  }

  return diff
}

export function getVasLegends(list) {
  const data = removeDuplicates(list.vasComparisonDetail, "key")
  const legends = extractColumn(data, 'key')
  return legends
}
