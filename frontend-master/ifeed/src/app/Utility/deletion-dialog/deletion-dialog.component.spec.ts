import { TestBed, inject } from '@angular/core/testing';
import { DeletionDialogComponent } from './deletion-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatDialogModule } from '@angular/material';

class MockMatDialogRef {

}

class MockMatDialogData {

}

describe('DeletionDialogComponent', () => {
  let dialog: DeletionDialogComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DeletionDialogComponent,
        { provide: MatDialogRef, useClass: MockMatDialogRef },
        { provide: MAT_DIALOG_DATA, useClass: MockMatDialogData }
      ],
      imports: [MatDialogModule]
    });
    dialog = TestBed.get(DeletionDialogComponent);
  });

  // creating component
  it('should create DeletionDialogComponent', inject([DeletionDialogComponent], (deletionDialog: DeletionDialogComponent) => {
    expect(deletionDialog).toBeTruthy();
  }));
});
