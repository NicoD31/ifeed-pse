import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-create-dialog',
  templateUrl: './create-dialog.component.html',
  styleUrls: ['./create-dialog.component.css']
})

/**
 * Component to model the create session dialog.
 */
export class CreateDialogComponent {

  /**
   * Contructor for CreateDialogComponent.
   *
   * @param dialogRef used to pass data to the component which opened the dialog.
   * @param data used to recieve data from the component which opened the dialog.
   */
  public constructor(private dialogRef: MatDialogRef<CreateDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  /**
   * Sends a signal to the component to cancel the creation.
   */
  public cancel() {
    this.dialogRef.close(false);
  }

  /**
   * Sends a signal to the component, to nagivate to the SetupOverview.
   */
  public continue() {
    this.dialogRef.close(true);
  }
}
