import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as echarts from 'echarts'
import { QualityMonitorGraphData, QaualitMonitorResp, QualityMonitoringAlertData } from '../../../../interfaces/view-booking.interface';
import { removeDuplicates, cloneObject, DEFAULT_EMPTY_GRAPH, HashStorage } from "../../../../constants/globalfunctions";
import { CurrencyControl } from '../../../../shared/currency/currency.injectable'
@Component({
  selector: 'app-tracking-overview',
  templateUrl: './tracking-overview.component.html',
  styleUrls: ['./tracking-overview.component.scss']
})
export class TrackingOverviewComponent implements OnInit, OnChanges {

  @Input() monitorData: QaualitMonitorResp
  @Input() isContDtl: boolean = false
  @Input() container: QualityMonitoringAlertData
  constainerList: Array<QualityMonitorGraphData> = []

  humidity: Array<QualityMonitorGraphData>
  temperature: Array<QualityMonitorGraphData>

  humidColor: string = ''
  tempColor: string = ''
  tempStatusName: string = ''
  humidStatusName: string = ''

  avgTemp: number = 0
  avgHumid: number = 0

  optionTemperature = {
    "backgroundColor": "#fff",
    "grid": {
      "bottom": "3%",
      "containLabel": true,
      "left": "3%",
      "right": "4%"
    },
    "legend": {
      "data": [
        "Temperature",
        "Humidity"
      ],
      "icon": "rect",
      "itemGap": 13,
      "itemHeight": 5,
      "itemWidth": 14,
      "right": "center",
      "textStyle": {
        "color": "#333",
        "fontSize": 12
      }
    },
    "series": [
      {
        "areaStyle": {
          "normal": {
            "color": {
              "colorStops": [
                {
                  "color": "rgba(81, 123, 189, 0.2)",
                  "offset": 0
                },
                {
                  "color": "rgba(81, 123, 189, 0)",
                  "offset": 1
                }
              ],
              "global": false,
              "type": "linear",
              "x": 0,
              "x2": 0,
              "y": 0,
              "y2": 1
            },
            "shadowBlur": 10,
            "shadowColor": "rgba(0, 0, 0, 0.1)"
          }
        },
        "data": [],
        "itemStyle": {
          "normal": {
            "borderColor": "rgba(81, 123, 189,0.2)",
            "borderWidth": 12,
            "color": "rgb(81, 123, 189)"
          }
        },
        "lineStyle": {
          "normal": {
            "width": 1
          }
        },
        "name": "Temperature",
        "showSymbol": true,
        "smooth": false,
        "symbol": "circle",
        "symbolSize": 2,
        "type": "line"
      },
      {
        "areaStyle": {
          "normal": {
            "color": {
              "colorStops": [
                {
                  "color": "rgba(240, 81, 124, 0.2)",
                  "offset": 0
                },
                {
                  "color": "rgba(240, 81, 124, 0)",
                  "offset": 1
                }
              ],
              "global": false,
              "type": "linear",
              "x": 0,
              "x2": 0,
              "y": 0,
              "y2": 1
            },
            "shadowBlur": 10,
            "shadowColor": "rgba(0, 0, 0, 0.1)"
          }
        },
        "data": [],
        "itemStyle": {
          "normal": {
            "borderColor": "rgba(240, 81, 124,0.2)",
            "borderWidth": 12,
            "color": "rgb(240, 81, 124)"
          }
        },
        "lineStyle": {
          "normal": {
            "width": 1
          }
        },
        "name": "Humidity",
        "showSymbol": true,
        "smooth": false,
        "symbol": "circle",
        "symbolSize": 2,
        "type": "line"
      }
    ],
    "title": {
      "left": "6%",
      "show": false,
      "text": "Performance",
      "textStyle": {
        "color": "#333",
        "fontSize": 16,
        "fontWeight": "normal"
      }
    },
    "tooltip": {
      "axisPointer": {
        "lineStyle": {
          "color": "#2b2b2b",
          "decoration": "none",
          "fontFamily": "Proxima Nova, sans-serif",
          "fontSize": 16
        }
      },
      "backgroundColor": "rgba(255,255,255,1)",
      "extraCssText": "box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.2);",
      "padding": [
        14,
        24
      ],
      "textStyle": {
        "color": "#2b2b2b",
        "fontFamily": "Proxima Nova, sans-serif",
        "fontSize": 16
      },
      "trigger": "axis"
    },
    "xAxis": [
      {
        "axisLabel": {
          "margin": 25,
          "textStyle": {
            "color": [
              "rgba(85, 85, 85)"
            ],
            "fontFamily": "Proxima Nova, sans-serif",
            "fontSize": 12
          }
        },
        "axisLine": {
          "lineStyle": {
            "color": [
              "rgba(229, 229, 229)"
            ]
          }
        },
        "boundaryGap": false,
        "data": [],
        "splitLine": {
          "lineStyle": {
            "color": [
              "rgba(229, 229, 229)"
            ],
            "type": "solid"
          },
          "show": true
        },
        "type": "category"
      }
    ],
    "yAxis": {
      "axisLabel": {
        "margin": 20,
        "textStyle": {
          "color": [
            "rgba(85, 85, 85)"
          ],
          "fontFamily": "Proxima Nova, sans-serif",
          "fontSize": 12
        }
      },
      "axisLine": {
        "lineStyle": {
          "color": "#fff"
        }
      },
      "axisTick": {
        "show": false
      },
      "name": "",
      "splitLine": {
        "lineStyle": {
          "color": [
            "rgba(229, 229, 229)"
          ],
          "type": "solid"
        }
      },
      "type": "value",
      "min": 0,
      "max": 100,
    }
  }

  optionTemperature2 = {
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
      selectedMode: false,
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
      data: []
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
      data: [],
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
  optionHumidty2 = {
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
      data: ['Humidity'],
      right: 'center',
      selectedMode: false,
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
      data: []
    }],
    yAxis: [{
      type: 'value',
      name: '',
      min: 0,
      max: 100,
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
      name: 'Humidity',
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
      data: [],
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
    }]
  }

  isHumidity: boolean = true
  isTemperature: boolean = true

  totalHumidAlertCount: number = 0
  totalHumidAlertPercent: number = 0
  totalTempAlertCount: number = 0
  totalTempAlertPercent: number = 0

  selectedOption: string = 'All Containers'

  containerMapData: ContainerMarker

  constructor(
    private _currencyControl: CurrencyControl
  ) { }

  ngOnInit() {
    const { monitorData } = this
    const { MonitoringData } = monitorData
    try {
      this.constainerList = removeDuplicates(MonitoringData, "ContainerNo");
    } catch (error) {
      console.warn(error)
    }

    this.setOverviewGraph(MonitoringData)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.container && changes.container.currentValue && changes.container && changes.isContDtl.currentValue === true) {
      const { ContainerNo } = this.container
      try {
        const { GCoordinates } = this.container
        const cordArr = GCoordinates.split(' ')

        const curr_mode = HashStorage.getItem('curr_mode')

        const containerData: ContainerMarker = {
          lat: parseFloat(cordArr[0]),
          lng: parseFloat(cordArr[1]),
          mode: (curr_mode === 'TRUCK') ? 'GROUND_ANIME' : curr_mode
        }
        this.containerMapData = containerData
      } catch (error) {
        console.warn(error)
      }
      this.onContainerClick(ContainerNo, 'cont', true, this.container)
    }
  }

  setOverviewGraph($monitorData, $container?: QualityMonitoringAlertData) {

    this.humidity = $monitorData.filter(data => data.IOTParamName.toLowerCase() === 'humidity')
    // const humidityAlerts = this.humidity.filter(hum => hum.EventType === 'alert')
    const humidATotalCount = this.humidity.reduce((a, b) => +a + +b.AlertCount, 0);
    const humidTotalCount = this.humidity.reduce((a, b) => +a + +b.TotalCount, 0);

    this.temperature = $monitorData.filter(data => data.IOTParamName.toLowerCase() === 'temperature')
    // const temperatureAlerts = this.temperature.filter(tem => tem.EventType === 'alert')
    const tempATotalCount = this.temperature.reduce((a, b) => +a + +b.AlertCount, 0);
    const tempTotalCount = this.temperature.reduce((a, b) => +a + +b.TotalCount, 0);

    this.totalHumidAlertCount = humidATotalCount
    this.totalTempAlertCount = tempATotalCount

    this.totalHumidAlertPercent = 100 - ((humidATotalCount / humidTotalCount) * 100)
    this.totalTempAlertPercent = 100 - ((tempATotalCount / tempTotalCount) * 100)

    const { ProgressIndicators } = this.monitorData
    ProgressIndicators.forEach(progress => {
      const { ProgressIndicatorMax, ProgressIndicatorMin, ProgressIndicatorName, ProgressIndicatorColor } = progress
      if (this.totalHumidAlertPercent >= ProgressIndicatorMin && this.totalHumidAlertPercent <= ProgressIndicatorMax) {
        this.humidStatusName = ProgressIndicatorName
        this.humidColor = ProgressIndicatorColor
        // switch (ProgressIndicatorName.toLowerCase()) {
        //   case 'excellent':
        //     this.humidColor = 'primary'
        //     break;
        //   case 'good':
        //     this.humidColor = 'secondary'
        //     break;
        //   case 'fair':
        //     this.humidColor = 'warning'
        //     break;
        //   case 'red':
        //     this.humidColor = 'danger'
        //     break;
        //   default:
        //     this.humidColor = 'secondary'
        //     break;
        // }

      }

      if (this.totalTempAlertPercent >= ProgressIndicatorMin && this.totalTempAlertPercent <= ProgressIndicatorMax) {
        this.tempStatusName = ProgressIndicatorName
        this.tempColor = ProgressIndicatorColor
        // switch (ProgressIndicatorName.toLowerCase()) {
        //   case 'excellent':
        //     this.tempColor = 'primary'
        //     break;
        //   case 'good':
        //     this.tempColor = 'secondary'
        //     break;
        //   case 'fair':
        //     this.tempColor = 'warning'
        //     break;
        //   case 'red':
        //     this.tempColor = 'danger'
        //     break;
        //   default:
        //     this.tempColor = 'secondary'
        //     break;
        // }

      }

      // secondary = green
      // warning = yellow
      // danger = red
      // primary = blue
      //Good
      // Fair
      // Red
      // Excellent
    })

    const simpHumidData = []
    const simpTempData = []

    const { humidity, temperature } = this

    const distinctCategories: Array<QualityMonitorGraphData> = removeDuplicates($monitorData, 'Key')
    const simpleCat = []
    distinctCategories.forEach(date => {

      const filtHumid = humidity.filter(humid => humid.Key === date.Key)
      const totalHumid = filtHumid.reduce((a, b) => +a + +b.IOTParamPerformancePercent, 0);
      const avgHumid = totalHumid / filtHumid.length
      simpHumidData.push(this._currencyControl.applyRoundByDecimal(avgHumid, 2))


      const filtTemp = temperature.filter(humid => humid.Key === date.Key)
      let totalTemp = 0
      if (this.isContDtl) {
        totalTemp = filtTemp.reduce((a, b) => +a + +b.IOTParamValue, 0);
      } else {
        totalTemp = filtTemp.reduce((a, b) => +a + +b.IOTParamPerformancePercent, 0);
      }
      const avgTemp = totalTemp / filtTemp.length
      simpTempData.push(this._currencyControl.applyRoundByDecimal(avgTemp, 2))

      // const avgHumid = humidity.

      simpleCat.push(date.Key)
    })

    if (!this.isContDtl) {
      let tempClone = cloneObject(this.optionTemperature)
      tempClone.xAxis[0].data = simpleCat
      if (simpleCat.length === 0) {
        this.optionTemperature = DEFAULT_EMPTY_GRAPH
        return
      }
      if (!this.isHumidity) {
        tempClone.series[1].data = []
      } else {
        tempClone.series[1].data = simpHumidData
      }
      if (!this.isTemperature) {
        tempClone.series[0].data = []
      } else {
        tempClone.series[0].data = simpTempData
      }
      this.optionTemperature = (tempClone)
    } else {

      if (simpleCat.length === 0) {
        this.optionTemperature2 = DEFAULT_EMPTY_GRAPH
        this.optionHumidty2 = DEFAULT_EMPTY_GRAPH
        return
      }


      let tempClone = cloneObject(this.optionTemperature2)
      tempClone.xAxis[0].data = simpleCat
      tempClone.series[0].data = simpTempData
      if ($container) {
        const { AlertMin, AlertMax } = $container
        const maxValue: number = Math.max(...simpTempData)
        if (AlertMax > maxValue) {
          tempClone.yAxis[0].max = AlertMax
        }
        tempClone.series[0].markLine.data = [{ xAxis: 0, yAxis: AlertMin }, { xAxis: 0, yAxis: AlertMax }]
      }
      this.optionTemperature2 = (tempClone)


      let humidClone = cloneObject(this.optionHumidty2)
      humidClone.xAxis[0].data = simpleCat
      humidClone.series[0].data = simpHumidData
      if ($container) {
        const { AlertMin, AlertMax } = $container
        const maxValue: number = Math.max(...simpHumidData)
        if (AlertMax > maxValue) {
          tempClone.yAxis[0].max = AlertMax
        }
        humidClone.series[0].markLine.data = [{ xAxis: 0, yAxis: AlertMin }, { xAxis: 0, yAxis: AlertMax }]
      }

      this.optionHumidty2 = (humidClone)

    }

  }

  onContainerClick($containerNum: string, $type: string, isCallback: boolean, $container?: QualityMonitoringAlertData) {

    if (!isCallback) {
      this.selectedOption = $containerNum
    }

    if ($type === 'cont') {
      const { MonitoringData } = this.monitorData
      const copyData: Array<any> = cloneObject(MonitoringData)
      const monitorData = copyData.filter(container => container.ContainerNo === $containerNum)

      this.setOverviewGraph(monitorData, $container)
    } else {
      const { MonitoringData } = this.monitorData
      this.setOverviewGraph(MonitoringData)
    }


  }


}

export interface ContainerMarker {
  lat: number;
  lng: number;
  mode: string;
}
