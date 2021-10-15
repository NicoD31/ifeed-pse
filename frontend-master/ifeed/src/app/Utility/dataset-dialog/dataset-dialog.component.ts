import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-dataset-dialog',
  templateUrl: './dataset-dialog.component.html',
  styleUrls: ['./dataset-dialog.component.css']
})
export class DatasetDialogComponent {

  /**
   * Contructor for CreateDialogComponent.
   *
   * @param dialogRef used to pass data to the component which opened the dialog.
   * @param data used to recieve data from the component which opened the dialog.
   */
  constructor(private dialogRef: MatDialogRef<DatasetDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  /**
   * Sends a signal to the component, to nagivate to the SetupOverview.
   */
  public continue() {
    this.dialogRef.close(true);
  }
}
