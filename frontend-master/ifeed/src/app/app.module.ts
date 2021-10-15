import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SessionDetailComponent } from './Session/session-detail/session-detail.component';
import { LoginComponent } from './FrontPages/login/login.component';
import { MenuComponent } from './FrontPages/menu/menu.component';
import { UserIterationComponent } from './Session/Iteration/user-iteration/user-iteration.component';
import { UserMainOverviewComponent } from './FrontPages/user-main-overview/user-main-overview.component';
import { AdminMainOverviewComponent } from './FrontPages/admin-main-overview/admin-main-overview.component';
import { AdminDatasetOverviewComponent } from './Dataset/admin-dataset-overview/admin-dataset-overview.component';
import { AdminSessionOverviewComponent } from './Session/Admin/admin-session-overview/admin-session-overview.component';
import { AdminSetupOverviewComponent } from './Setup/admin-setup-overview/admin-setup-overview.component';
import { AdminSetupCreateComponent } from './Setup/admin-setup-create/admin-setup-create.component';
import { AdminSetupDetailComponent } from './Setup/admin-setup-detail/admin-setup-detail.component';
import { AdminPersonCreateComponent } from './UserManagement/admin-person-create/admin-person-create.component';
import { AdminUserManagementComponent } from './UserManagement/admin-user-management/admin-user-management.component';
import { PersonService } from './Services/person.service';
import { EnumService } from './Services/enum.service';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlotlyModule } from 'angular-plotly.js';
import { ProgressBarModule } from 'angular-progress-bar';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ScrollingModule as ExperimentalScrollingModule } from '@angular/cdk-experimental/scrolling';
import { ProgressbarComponent } from './Session/progressbar/progressbar.component';
import { MatSelectModule } from '@angular/material/select';
import { DeletionDialogComponent } from './Utility/deletion-dialog/deletion-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CreateDialogComponent } from './Utility/create-dialog/create-dialog.component';
import { DatasetDialogComponent } from './Utility/dataset-dialog/dataset-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    SessionDetailComponent,
    LoginComponent,
    MenuComponent,
    UserIterationComponent,
    UserMainOverviewComponent,
    AdminMainOverviewComponent,
    AdminDatasetOverviewComponent,
    AdminSessionOverviewComponent,
    AdminSetupOverviewComponent,
    AdminSetupCreateComponent,
    AdminSetupDetailComponent,
    AdminPersonCreateComponent,
    AdminUserManagementComponent,
    ProgressbarComponent,
    DeletionDialogComponent,
    CreateDialogComponent,
    DatasetDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    PlotlyModule,
    ScrollingModule,
    ExperimentalScrollingModule,
    BrowserAnimationsModule,
    ProgressBarModule,
    ScrollingModule,
    ExperimentalScrollingModule,
    MatSelectModule,
    MatDialogModule,
    NgxSpinnerModule,
    MatTooltipModule,
    NgbModule.forRoot()
  ],
  entryComponents: [
    DeletionDialogComponent,
    CreateDialogComponent,
    DatasetDialogComponent
  ],
  providers: [PersonService, EnumService],
  bootstrap: [AppComponent]
})
export class AppModule { }
