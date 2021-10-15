import { Injectable } from '@angular/core';
import * as Plotly from 'plotly.js/dist/plotly.js';
import { Config, Data, Layout } from 'plotly.js/dist/plotly.js';
import { BehaviorSubject } from 'rxjs';
import { StatisticsService } from './statistics.service';
import { EnumService } from './enum.service';

@Injectable({
  providedIn: 'root'
})

/**
 * Manages the plotting of graphics in Sessions to visualize feature data.
 */
export class PlotService {

  public static readonly IMAGE_SCALE = 4;
  /**
    Label for rthe xaxis of the line graphs.
  */
  public static readonly TIME = 'SensorDateTime';

  /**
    Options for configuring a plot.
  */
  public static readonly PLOT_OPTIONS = {
    scrollZoom: true,
    displaylogo: false,
    showLink: false,
    modeBarButtonsToRemove: ['toImage', 'sendDataToCloud', 'lasso2d', 'hoverClosestCartesian',
      'hoverCompareCartesian', 'toggleSpikelines', 'select2d']
  };

  /**
    Structure of the Linegraphplot-object used for plotly.
  */
  public static readonly LINEGRAPH = {
    type: 'scatter',
    x: [],
    y: [],
    mode: 'lines',
    name: '',
  };

  /**
    Layout for the linegraph plots.
  */
  public static readonly LINEGRAPH_LAYOUT = {
    title: {
      text: 'raw data',
    },
    legend: {
      y: 0.5,
      traceorder: 'reversed',
      font: {
        size: 16
      }
    },
    xaxis: {
      title: PlotService.TIME,
      tickangle: 10,
    },
  }


  private feedbackModes = this.enums.getFeedbackModes();

  private pointSource = new BehaviorSubject<number>(-1);
  public pointIndex = this.pointSource.asObservable();
  private subspace = [];
  private titles = [];
  private xInArray = [];
  private yInArray = [];
  private xOutArray = [];
  private yOutArray = [];
  private xSelected = [];
  private ySelected = [];
  private xHeatmap = [];
  private yHeatmap = [];
  private canSeeRawData: boolean;
  private readonly IMAGE = 'image';
  private readonly GRAPHING = 'timeline';

  private plotJson = JSON;

  lable = this.enums.getLabels();
  selectedPoint = [0, 0];
  /**
    The index of the lables array of the selected point
  */
  indexOfSelectedPoint = -1;

  layout = {
    title: {
      text: 'subspace',
      y: 0.95,
    },
    showlegend: true,
    legend: { x: 1, y: 0.5 },
    autosize: false,
    width: 600,
    height: 400,
    margin: { t: 1 },
    hovermode: 'closest',
    hoverdistance: 1,
    hoverinfo: 'x+y',
    bargap: 0,
    xaxis: {
      domain: [0, 0.85],
      showgrid: true,
      zeroline: true
    },
    yaxis: {
      domain: [0, 0.85],
      showgrid: true,
      zeroline: true
    }
  };


  constructor(private enums: EnumService, private statisticsService: StatisticsService) { }

  /**
   * Generates a heatmap using plotly.js. The heatmap is accesable in the html with: <div id="myDiv"></div>
   * @param dataset the dataset of which the plotted data is coming from.
   * @param setup the setup is needed to get the feedbackMode and weathor or not the user can see RawData
   * @param lables the lables so far
   * @param givenSubspace the subspace to plot
   * @param givenIndexOfSuggestedPoint the index of the first point
   * @param givenDistSubspace needed distances for the contourplot
   * @param givensubspaceGrids the subspaceGrids where the datapoints for the contour plot come from
   * @return an object representing the heatmap
   */
  generateHeatmap(dataset: any, setup: any, lables: String[], givenSubspace: number[], givenIndexOfSuggestedPoint: number,
    givenDistSubspace: number[], givensubspaceGrids: number[][]) {
    this.xHeatmap = [];
    this.yHeatmap = [];
    const rawData = [...dataset.rawData];
    const feedbackMode = setup.feedbackMode;
    this.subspace = [...givenSubspace];
    const indexOfSuggestedPoint = givenIndexOfSuggestedPoint;
    const distSubspace = [...givenDistSubspace];
    const type = dataset.typename;
    const subspaceGrids = [...givensubspaceGrids];
    const featureData = [...dataset.dataset.values];
    this.canSeeRawData = setup.rawData;
    this.titles = [...dataset['dataset']['titles']];
    this.subspace[0]--;
    this.subspace[1]--;
    let x = [];
    let y = [];
    for (let i = 0; i < featureData.length; i++) {
      x.push(featureData[i][this.subspace[0]]);
      y.push(featureData[i][this.subspace[1]]);
    }
    for (let j = 0; j < subspaceGrids.length; j++) {
      this.xHeatmap.push(subspaceGrids[j][0]);
      this.yHeatmap.push(subspaceGrids[j][1]);
    }
    this.layout = this.setAxisLabels(this.layout);
    switch (feedbackMode) {
      // system
      case this.feedbackModes[0]['value']: {
        const text = this.firstPointForUser(lables, x, y, indexOfSuggestedPoint);
        this.plotJson = this.makePlot(lables, x, y, false, text, rawData, distSubspace, type);
        break;
      }
      // user
      case this.feedbackModes[1]['value']: {
        this.setPlotData(lables, x, y);
        this.plotJson = this.makePlot(lables, x, y, true, '', rawData, distSubspace, type);
        break;
      }
      // hybrid
      case this.feedbackModes[2]['value']: {
        const text = this.firstPointForUser(lables, x, y, indexOfSuggestedPoint);
        this.plotJson = this.makePlot(lables, x, y, true, text, rawData, distSubspace, type);
        break;
      }
      default: {
        console.log('Invalid feedback mode');
        break;
      }
    }
    return this.plotJson;
  }


  /**
   * Generates a heatmap of the JSON object of a heatmap, the plot in then accesable in the html file via: <div id="plotJson"></div>
   * @params plotJson The JSON object of a plot
   */
  makeHeatmapFromJSON(plotJson: JSON) {
    Plotly.newPlot('plotJson', plotJson['data'], plotJson['layout'], { displayModeBar: false });
  }

  /**
    Updates the index of the selected point.
  */
  private setIndexOfSelectedPoint(index: number) {
    this.indexOfSelectedPoint = index;
    this.pointSource.next(index);
  }

  private setAxisLabels(layout: any) {
    let tmp = layout;
    tmp['xaxis']['title'] = this.titles[this.subspace[0]];
    tmp['yaxis']['title'] = this.titles[this.subspace[1]];
    return tmp;
  }

  /**
  * Sets the first point for the user and the data to plot and returns if the point is an outlier or inlier.
  */
  private firstPointForUser(lables: String[], x: number[], y: number[], indexOfFirst: number): String {
    this.setIndexOfSelectedPoint(indexOfFirst);
    this.setPlotData(lables, x, y);
    return lables[indexOfFirst];
  }

  /**
  * Gets the index of a point
  */
  private getIndex(point: number[], xData: number[], yData: number[]): number {
    for (let i = 0; i < xData.length; i++) {
      if (point[0] === xData[i] && point[1] === yData[i]) {
        return i;
      }
    }
    return null;
  }

  /**
  * Sets the data arrays that get plotted
  */
  private setPlotData(lables: String[], x: number[], y: number[]) {
    this.xSelected = [];
    this.ySelected = [];
    this.xInArray = [];
    this.yInArray = [];
    this.xOutArray = [];
    this.yOutArray = [];
    let i = 0;
    for (let val in lables) {
      if ((this.indexOfSelectedPoint > -1 || this.indexOfSelectedPoint != null) && this.indexOfSelectedPoint === i) {
        this.xSelected.push(x[i]);
        this.ySelected.push(y[i]);
      } else if (lables[val] === this.lable[1]['value']['final']) {
        this.xInArray.push(x[i]);
        this.yInArray.push(y[i]);
      } else if (lables[val] === this.lable[2]['value']['final']) {
        this.xOutArray.push(x[i]);
        this.yOutArray.push(y[i]);
      }
      i++;
    }
  }

  private setScatterType(xData: any, yData: any, nameData: String, pointColor: String, sizeData: number,
    lineColor: String, widthData: number, textData: String) {
    const point = {
      x: xData,
      y: yData,
      mode: 'markers',
      name: nameData,
      marker: {
        color: pointColor,
        size: sizeData,
        line: {
          color: lineColor,
          width: widthData
        }
      },
      text: textData,
      type: 'scatter'
    };
    return point;
  }

  private setContourType(xData: any, yData: any, zData: any, nameData: String, ncontoursData: number,
    colorscaleData: String, reversescaleData: boolean, showscaleData: boolean) {
    const contour = {
      x: xData,
      y: yData,
      z: zData,
      name: nameData,
      ncontours: ncontoursData,
      colorscale: colorscaleData,
      reversescale: reversescaleData,
      showscale: showscaleData,
      type: 'contour'
    };
    return contour;
  }

  /**
  * Sets configurations for the plot and then generates a plot
  */
  private makePlot(lables: String[], x: number[], y: number[], canClick: boolean, selectedText: String,
    rawData: JSON[], distSubspace: number[], type: string): JSON {
    const inlier = this.setScatterType(this.xInArray, this.yInArray, 'inlier', 'rgb(40,105,245)', 5, 'rgb(0, 0, 0)', 1, 'inlier');
    const outlier = this.setScatterType(this.xOutArray, this.yOutArray, 'outlier', 'rgb(255,104,40)', 5, 'rgb(0, 0, 0)', 1, 'outlier');
    const selected = this.setScatterType(this.xSelected, this.ySelected, 'selected', 'rgb(0,255,0)', 9, 'rgb(255, 0, 0)', 3, selectedText);

    const heatmap = this.setContourType(this.xHeatmap, this.yHeatmap, distSubspace, 'contour', 20, 'Hot', true, false);

    for (let i = 0; i < distSubspace.length; i++) {
      if (distSubspace[i] < 0) {
        distSubspace[i] = 0;
      }
    }

    const data = [heatmap, inlier, outlier, selected];
    this.plotJson['data'] = data;
    this.plotJson['layout'] = this.layout;

    const options = PlotService.PLOT_OPTIONS;
    Plotly.newPlot('myDiv', data, this.layout, options);

    Plotly.relayout('myDiv', {
      'xaxis.autorange': true,
      'yaxis.autorange': true
    });

    if (this.indexOfSelectedPoint !== -1 && this.canSeeRawData) {
      const visualizeData = rawData[this.indexOfSelectedPoint];
      this.visualizeRawData(type, visualizeData);
    }
    let myPlot: MyHTMLElement;
    myPlot = <MyHTMLElement>document.getElementById('myDiv');
    if (canClick) {
      this.clickPoint(myPlot, lables, x, y, rawData, distSubspace, type);
    }
    return this.plotJson;
  }

  /**
  * Defines the action happening when a data point is clicked
  */
  private clickPoint(myPlot: MyHTMLElement, lables: String[], x: number[], y: number[], rawData: JSON[],
    distSubspace: number[], type: string) {
    myPlot.on('plotly_click', data => {
      let selectedText = '';
      for (let i = 0; i < data.points.length; i++) {
        this.selectedPoint[0] = data.points[i].x;
        this.selectedPoint[1] = data.points[i].y;
      }
      selectedText = data.points[0].data.text;
      const tmpIndex = this.getIndex(this.selectedPoint, x, y);
      if (!tmpIndex) {
        this.selectedPoint = [];
      } else {
        this.setIndexOfSelectedPoint(tmpIndex);
        this.setPlotData(lables, x, y);
        this.makePlot(lables, x, y, true, selectedText, rawData, distSubspace, type);
        if (this.canSeeRawData) {
          const visualizeData = rawData[this.indexOfSelectedPoint];
          this.visualizeRawData(type, visualizeData);
        }
      }
    });
  }

  /**
    Visualizes the RawData depending on the type of the current dataset.
    @param type type of the dataset.
    @param data rawdata to be visualized.
  */
  private visualizeRawData(type: string, data: JSON) {
    switch (type) {
      case this.IMAGE: {
        this.generateImage(data['data']);
        break;
      }
      case this.GRAPHING: {
        this.generateGraph(data);
        break;
      }
    }
  }


  /**
    Generates a linegraph from the given data and plots it in the div RawData.
    @param data JSON containing numeric arrays a s attributes
  */
  private generateGraph(data: JSON) {
    let graphdata = [];
    let x = [];
    let layout = JSON.parse(JSON.stringify(PlotService.LINEGRAPH_LAYOUT));
    if (data[PlotService.TIME]) {
      for (let i = 0; i < data[PlotService.TIME].length; i++) {
        x.push(data[PlotService.TIME][i]);
      }
      layout.xaxis.tick0 = data[PlotService.TIME[0]];
      layout.xaxis.tickmode = 'array';
      let tickdelta = Math.floor(data[PlotService.TIME].length / 3);
      layout.xaxis.tickvals = [];
      for (let i = 0; i < 3; i++) {
        layout.xaxis.tickvals.push(data[PlotService.TIME][i * tickdelta]);
      }
      layout.xaxis.ticktext = [...layout.xaxis.tickvals];
    } else {
      for (let key in data) {
        for (let i = 0; i < data[key].length; i++) {
          x.push(i);
        }
        break;
      }
    }
    for (let key in data) {
      if (key === PlotService.TIME) {
        break;
      }
      let y = [];
      let trace = JSON.parse(JSON.stringify(PlotService.LINEGRAPH));
      for (let i = 0; i < data[key].length; i++) {
        y.push(data[key][i]);
      }
      trace.y = y;
      trace.x = x;
      trace.name = key;
      graphdata.push(trace);
    }
    Plotly.newPlot('RawData', graphdata, layout, PlotService.PLOT_OPTIONS);
  }


  /**
    Generates an image from the given array of grayscale values and plotis it on a canvas with id Image.
    @param data array of grayscale value, must have quadratic length.
   */
  private generateImage(data: number[]) {
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('Image');
    let context = canvas.getContext('2d');
    let size = Math.sqrt(data.length);
    canvas.width = size * PlotService.IMAGE_SCALE;
    canvas.height = size * PlotService.IMAGE_SCALE;
    let pixels = context.getImageData(0, 0, size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let i = (y * 4) * size + x * 4;
        let value = Math.floor(data[y * size + x] * 255);
        pixels.data[i] = value;
        pixels.data[i + 1] = value;
        pixels.data[i + 2] = value;
        pixels.data[i + 3] = 255;
      }

    }
    context.putImageData(pixels, 0, 0, 0, 0, pixels.width, pixels.height);
    /** Scaling up the Image */
    context.globalCompositeOperation = 'copy';
    context.drawImage(canvas, 0, 0, size, size, 0, 0, canvas.width, canvas.height);
  }

  /**
  * Generates a barchart for the comparison of two label arrays
  * @param userLable the label the user chose
  * @param compareLable the labels to copare to
  * @param name the plot is then accesabl in html with <div id="name"></div>
  */
  makeBarChart(userLable: String[], compareLable: String[], name: String) {
    let comparison: any;
    let sum: any;
    if (userLable && compareLable) {
      comparison = this.statisticsService.compareLabledData(userLable, compareLable);
      sum = (comparison[0] + comparison[1] + comparison[2] + comparison[3]);
    } else {
      return false;
    }
    const data = [
      {
        x: ['User disagreed with inlier', 'User disagreed with outlier', 'Accordance'],
        y: [comparison[0], comparison[1], (comparison[2] + comparison[3])],
        marker: {
          color: ['rgb(0,0,255)', 'rgb(250,218,94)', 'rgb(0,255,0)']
        },
        type: 'bar'
      }
    ];

    const layout = {
      title: 'Lable User vs. ' + name,
      showlegend: false,
      autosize: false,
      width: 500,
      height: 300,
      xaxis: {
        domain: [0, 0.85],
        fixedrange: true
      },
      yaxis: {
        domain: [0, 0.85],
        fixedrange: true
      }
    };

    Plotly.newPlot(name, data, layout, { displayModeBar: false });
    return true;
  }
}

class MyHTMLElement extends HTMLElement {
  on(text: String, data: any) { }
  getContext(text: String) { }
}
