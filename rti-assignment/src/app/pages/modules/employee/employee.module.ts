import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { EmployeeRoutingModule } from './employee-routing.module';
import { EmployeeListComponent } from '../../components/employee-list/employee-list.component';
import { AddEmployeeComponent } from '../../components/add-employee/add-employee.component';
import { EditEmployeeComponent } from '../../components/edit-employee/edit-employee.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TopBarModule } from '../../../shared/modules/top-bar/top-bar.module';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [
    EmployeeListComponent,
    AddEmployeeComponent,
    EditEmployeeComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EmployeeRoutingModule,
    TopBarModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    DialogModule,
  ],
  providers: [DatePipe],
})
export class EmployeeModule {}
