import { Component, OnInit, ViewEncapsulation, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3'
import 'topojson'
import * as DataMaps from 'datamaps/dist/datamaps.world'
import { cloneObject, kFormatter } from '../../constants/globalfunctions';
import { CurrencyControl } from '../currency/currency.injectable';

@Component({
  selector: 'hashmove-data-map',
  templateUrl: './data-map.component.html',
  styleUrls: ['./data-map.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DataMapsComponent implements OnInit, OnChanges {

  @Input() data: Array<RepMapData> = []
  @Input() currencyCode: string = 'AED'
  mapList = []

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      this.setMapData()
    }
  }

  setMapData() {
    const { data } = this
    this.mapList = []
    data.forEach(map => {
      const template: MapTemplate = {
        latitude: map.lat,
        longitude: map.lng,
        name: map.key,
        radius: 8,
        fillKey: 'DEF_BUB',
        totalAmount: map.totalAmount
      }
      this.mapList.push(template)
    })
    let mapElement = document.getElementById('data-map-cont')
    mapElement.innerHTML = '';
    var bombMap = new DataMaps({
      element: mapElement,
      projection: 'mercator',
      fills: {
        defaultFill: '#e7e8ed',
        DEF_BUB: '#00a2df'
      },
      // height: 600,
      // width: 700,
      responsive: true,
      geographyConfig: {
        popupOnHover: false,
        highlightOnHover: false
      },
      bubblesConfig: {
        borderColor: '#FFFFFF',
        highlightFillColor: '#00a2df',
        highlightBorderColor: 'rgba(255,255,255,1)',
      },
    });
    const currControl = new CurrencyControl()

    bombMap.bubbles(this.mapList, {
      popupTemplate: (geography, data: MapTemplate) => {
        const { name } = data
        return [
          `<div class="hoverInfo region-box">` +
          `<p style="font-size:1.125rem;font-family:'pragmatica',sans-serif;font-weight:500;color:#2b2b2b;margin:0px !important;line-height:0.9;margin-top:12px !important;">${name}</p><br/>` +
          `<p style="font-size:0.875rem;font-family:'proxima-nova', sans-serif;font-weight:600;color:#738593;text-transform:uppercase;margin-top:30px;margin:0px !important;">Total Spend</p>` +
          `<p style="font-size:0.875rem;font-family:'pragmatica',sans-serif;font-weight:500;color:#2b2b2b;text-transform:uppercase;margin:0px !important;margin-top:8px !important;line-height:0.5;">${this.currencyCode}</p>` +
          `<strong style="font-size:1.375rem;font-family:'pragmatica',sans-serif;font-weight:500;color:#2b2b2b;text-transform:uppercase;margin:0px !important;">${currControl.applyRoundByDecimal(data.totalAmount, 0).toLocaleString()}</strong></div>`
        ].join('');
        // return [`<div style="background-color:'white !important">Country :${name}`].join('');
      }
    });
    // const map = new DataMaps({ element: document.getElementById('data-map-cont') });
  }



}

export interface RepMapData {
  impExp: any;
  key: any;
  lat: number;
  lng: number;
  totalAmount?: number;
}

export interface MapTemplate {
  name?: any;
  radius?: number;
  latitude?: number;
  longitude?: number;
  defaultFillColor?: any;
  fillKey?: string;
  totalAmount?: number;
}
