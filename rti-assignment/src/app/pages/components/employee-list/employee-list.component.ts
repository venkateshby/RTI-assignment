import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EmployeeService } from 'src/app/shared/services/employee/employee.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent implements OnInit {
  employees$ = new BehaviorSubject<any[]>([]);
  showDialog: boolean = false;
  employeeId: number = 1;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    this.loadEmployees();
  }

  showDeleteDialog(id: number) {
    this.showDialog = true;
    this.employeeId = id;
  }

  loadEmployees() {
    this.employeeService
      .listEmployees()
      .then((employees) => {
        this.employees$.next(employees);
        // Do whatever you want with the list of employees
      })
      .catch((error) => {
        console.error('Error listing employees:', error);
      });
  }

  confirmDelete() {
    this.showDialog = false;
    this.employeeService
      .delete(this.employeeId)
      .then(() => {
        this.loadEmployees(); // Refresh the list of employees
      })
      .catch((error) => {
        console.error('Error deleting employee:', error);
      });
  }
}
