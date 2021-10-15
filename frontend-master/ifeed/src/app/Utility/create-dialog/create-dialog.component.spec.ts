import { TestBed, inject } from '@angular/core/testing';
import { CreateDialogComponent } from './create-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatDialogModule } from '@angular/material';

class MockMatDialogRef {

}

class MockMatDialogData {

}

describe('DeletionDialogComponent', () => {
  let dialog: CreateDialogComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CreateDialogComponent,
        { provide: MatDialogRef, useClass: MockMatDialogRef },
        { provide: MAT_DIALOG_DATA, useClass: MockMatDialogData }
      ],
      imports: [MatDialogModule]
    });
    dialog = TestBed.get(CreateDialogComponent);
  });

  // creating component
  it('should create CreateDialogComponent', inject([CreateDialogComponent], (createDialog: CreateDialogComponent) => {
    expect(createDialog).toBeTruthy();
  }));
});
