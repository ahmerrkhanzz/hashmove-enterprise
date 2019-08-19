//Root Objects

//ChartResponse
export interface UserGraphData {
  currentVsPrevious: CurrentVsPrevious[];
  barGraph: UserBarGraph[];
  pieChart: UserPieChart[];
  regionBarGraph: UserRegionBarGraph[];
  regionMapGraph: UserRegionMapGraph[];
  vasComparisonGraph: any
}
// UserRegionMapGraph

// Bar Chart
export interface UserBarGraphDash {
  color: Array<string>;
  tooltip: Tooltip;
  legend: Legend;
  grid: Grid;
  xAxis: Array<XAxis>;
  yAxis: Array<YAxis>;
  series: Array<SeriesBarChart>;
}


// Region Config Chart
export interface UserRegionBarGraphDash {
  dataset: Dataset;
  grid: Grid;
  xAxis: XAxis;
  yAxis: YAxis;
  visualMap: VisualMap;
  series: SeriesConfig[];
}

// User Pie Chart
export interface UserPieChartDash {
  color: string[];
  title: Title;
  tooltip: PieTooltip;
  calculable: boolean;
  series: Series[];
}

export interface AxisPointer {
  type: string;
}

export interface Tooltip {
  trigger: string;
  axisPointer: AxisPointer;
}

export interface Legend {
  data: Array<string>;
}

export interface Grid {
  left?: string;
  right?: string;
  bottom?: string;
  containLabel: boolean;
}

export interface AxisTick {
  alignWithLabel: boolean;
}

export interface XAxis {
  type?: string;
  data?: Array<string>;
  axisTick?: AxisTick;
  name?: string;
}

export interface YAxis {
  type: string;
}


export interface ItemStyle {
  normal: Normal;
}

export interface SeriesBarChart {
  name: string;
  type: string;
  barGap: number;
  barWidth: number;
  itemStyle: ItemStyle;
  data: Array<string>;
}

export interface Dataset {
  source: any[][];
}

export interface InRange {
  color: string[];
}

export interface VisualMap {
  orient: string;
  left: string;
  min: number;
  max: number;
  text: string[];
  dimension: number;
  inRange: InRange;
}

export interface Normal {
  show?: boolean;
  position?: string;
  barBorderRadius?: number;
}

export interface Label {
  normal: Normal;
}

export interface Encode {
  x: string;
  y: string;
}

export interface SeriesConfig {
  type: string;
  label: Label;
  encode: Encode;
}

export interface Title {
  x: string;
}

export interface PieTooltip {
  trigger: string;
  formatter: string;
}

export interface PieData {
  value: number;
  name: string;
}

export interface Series {
  name: string;
  type: string;
  radius: number[];
  roseType: string;
  data: PieData[];
}




export interface CurrentVsPrevious {
  currencyCode: string;
  title: string;
  totalAmount: number;
  totalBooking: number;
  countComp: number;
  amountComp: number;
}

export interface UserBarGraph {
  key: string;
  shippingModeCode: string;
  totalCount: number;
}

export interface UserPieChart {
  name: string;
  value: number;
}

export interface UserRegionBarGraph {
  name: string;
  value: number;
  impExp: string;
}

export interface UserRegionMapGraph {
  key: string;
  totalAmount: number;
  impExp: string;
}

export interface CodeValMst {
  codeValID: number;
  codeVal: string;
  codeValShortDesc: string;
  codeValDesc: string;
  codeValPreVal?: any;
  codeValNextVal?: any;
  languageID: number;
  codeType: string;
  isDelete: boolean;
  isActive: boolean;
  createdBy: string;
  createdDateTime: string;
  modifiedBy?: any;
  modifiedDateTime?: any;
  sortingOrder: number;
  codeValLink?: any;
}

export class CodeValMstModel implements CodeValMst {
  codeValID: number = -1
  codeVal: string = ''
  codeValShortDesc: string = ''
  codeValDesc: string = ''
  codeValPreVal?: any = ''
  codeValNextVal?: any = ''
  languageID: number = -1
  codeType: string = ''
  isDelete: boolean = false
  isActive: boolean = false
  createdBy: string = ''
  createdDateTime: string = ''
  modifiedBy?: any = ''
  modifiedDateTime?: any = ''
  sortingOrder: number = 0
  codeValLink?: any = ''
}
