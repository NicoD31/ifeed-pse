import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-deletion-dialog',
  templateUrl: './deletion-dialog.component.html',
  styleUrls: ['./deletion-dialog.component.css']
})
/**
 * This component is serving as a Dialog Window, when an Admin decides to delete a Setup/Session/Person/Dataset.
 */
export class DeletionDialogComponent {

  /**
   * Contructor for DeletionDialogComponent.
   *
   * @param dialogRef used to pass data to the component which opened the dialog.
   * @param data used to recieve data from the component which opened the dialog.
   */
  public constructor(private dialogRef: MatDialogRef<DeletionDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  /**
   * Sends a signal to the component to cancel the deletion.
   */
  public cancel() {
    this.dialogRef.close(false);
  }

  /**
   * Sends a signal to the component to delete the Setup/Session/Person/Dataset.
   */
  public delete() {
    this.dialogRef.close(true);
  }
}
