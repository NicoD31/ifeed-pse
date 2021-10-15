import { Component, OnInit, Input } from '@angular/core';
import { PlotService } from '../../Services/plot.service';
import { EnumService } from '../../Services/enum.service';
import { UserIterationComponent } from '../Iteration/user-iteration/user-iteration.component';

@Component({
  selector: 'app-progressbar',
  templateUrl: './progressbar.component.html',
  styleUrls: ['./progressbar.component.css']
})
/**
  Component for displaying a progressbar, which shows heatmaps of previous iterations.
  The inputs for the two dimensional heatmaps array and the matches array are required.
  The heatmpas array also has to consist of json object which can be plottet into heatmpas by the plotService.
*/
export class ProgressbarComponent implements OnInit {

  // yellow
  public static readonly DIFFER: string = '#f2ff00';

  // blue
  public static readonly MATCH: string = '#0061ff';

  // grey
  public static readonly SAME: string = '#636363';

  /** the Heatmaps of the corresponding Session (required)*/
  @Input() heatmaps: string[][] = [];

  /** Whether the Userlabel matched the label of the OcalAPI (required)*/
  @Input() matches: boolean[][] = [];

  /** The history mode, which descides which parts of the progressbar are displayed (optional)*/
  @Input() mode: string;

  /** Whether to show the Heatmap or not */
  private visible: boolean;

  public getHeatmaps() {
    return this.heatmaps;
  }

  public isVisible(): boolean {
    return this.visible;
  }

  /**
    Generates a heatmap which is shown in the div 'plotJson'
    @param index index in the heatmaps array
  */
  public showHeatmap(index: number): boolean {
    if (!this.heatmaps || this.heatmaps.length === 0) {
      this.setVisible(false);
      return false;
    } else if (index === null || index === undefined || index < 0 || index >= this.heatmaps.length) {
      return false;
    } else {
      this.setVisible(true);
      let lastHeatmap = 0;
      for (let i = this.heatmaps[index].length - 1; i >= 0; i--) {
        if (this.heatmaps[index][i] !== UserIterationComponent.EMPTY) {
          lastHeatmap = i;
          break;
        }
      }
      this.plotService.makeHeatmapFromJSON(JSON.parse(this.heatmaps[index][lastHeatmap]));
      return true;
    }
  }
  /**
    Sets the value of the isVisible attribute
    @param visible the value to set isVisible to.
  */
  public setVisible(visible: boolean) {
    this.visible = (visible && this.mode === this.enumService.getHistoryModes()[2]['value']);
  }

  public setColors(index: number): string {
    if (index === null || index === undefined || !this.matches || this.matches.length <= index || index < 0) {
      return null;
    }
    if (this.mode === this.enumService.getHistoryModes()[0]['value']) {
      return ProgressbarComponent.SAME;
    }
    let same = 0;
    let diff = 0;
    for (let i = 0; i < this.matches[index].length; i++) {
      if (this.matches[index][i]) {
        same++;
      } else {
        diff++;
      }
    }
    if (same > diff) {
      return ProgressbarComponent.MATCH;
    } else if (same < diff) {
      return ProgressbarComponent.DIFFER;
    } else {
      return ProgressbarComponent.SAME;
    }
  }

  constructor(private plotService: PlotService, private enumService: EnumService) {
    this.mode = this.enumService.getHistoryModes()[2]['value'];
  }

  ngOnInit() {
    this.setVisible(this.heatmaps && this.heatmaps.length !== 0);
  }

}
