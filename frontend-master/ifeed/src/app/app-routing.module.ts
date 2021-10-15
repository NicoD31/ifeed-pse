import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './FrontPages/login/login.component';
import { AdminDatasetOverviewComponent } from './Dataset/admin-dataset-overview/admin-dataset-overview.component';
import { AdminMainOverviewComponent } from './FrontPages/admin-main-overview/admin-main-overview.component';
import { AdminSessionOverviewComponent } from './Session/Admin/admin-session-overview/admin-session-overview.component';
import { AdminSetupCreateComponent } from './Setup/admin-setup-create/admin-setup-create.component';
import { AdminSetupDetailComponent } from './Setup/admin-setup-detail/admin-setup-detail.component';
import { AdminSetupOverviewComponent } from './Setup/admin-setup-overview/admin-setup-overview.component';
import { AdminPersonCreateComponent } from './UserManagement/admin-person-create/admin-person-create.component';
import { AdminUserManagementComponent } from './UserManagement/admin-user-management/admin-user-management.component';
import { UserMainOverviewComponent } from './FrontPages/user-main-overview/user-main-overview.component';
import { UserIterationComponent } from './Session/Iteration/user-iteration/user-iteration.component';
import { SessionDetailComponent } from './Session/session-detail/session-detail.component';
import { AdminGuard } from './Utility/Guards/admin.guard';
import { UserGuard } from './Utility/Guards/user.guard';
import { MixedGuard } from './Utility/Guards/mixed.guard';
import { NotloggedGuard } from './Utility/Guards/notlogged.guard';
import { SessionIdGuard } from './Utility/Guards/sessionid.guard';


// The Routes which define the manouverability on the website
const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [NotloggedGuard] },
  { path: 'datasets', component: AdminDatasetOverviewComponent, canActivate: [AdminGuard] },
  { path: 'adminmain', component: AdminMainOverviewComponent, canActivate: [AdminGuard] },
  // :id is the id of the setup. If 0 a new setup will be created.
  { path: 'setup/create/:id', component: AdminSetupCreateComponent, canActivate: [AdminGuard] },
  // :id is the id of the setup, whichs details should be shown
  { path: 'setup/detail/:id', component: AdminSetupDetailComponent, canActivate: [AdminGuard] },
  { path: 'setup', component: AdminSetupOverviewComponent, canActivate: [AdminGuard] },
  { path: 'usermain', component: UserMainOverviewComponent, canActivate: [UserGuard] },
  { path: 'user/create', component: AdminPersonCreateComponent, canActivate: [AdminGuard] },
  { path: 'user', component: AdminUserManagementComponent, canActivate: [AdminGuard] },
  // :id is the id of a sessino whichs next iteration should be displayed
  { path: 'iterate/:id', component: UserIterationComponent, canActivate: [UserGuard, SessionIdGuard] },
  // :id is the id of the session whichs detail information should be displayed
  { path: 'session/detail/:id', component: SessionDetailComponent, canActivate: [MixedGuard, SessionIdGuard] },
  { path: 'session', component: AdminSessionOverviewComponent, canActivate: [AdminGuard] },
  // redirects every invalid access to the login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
