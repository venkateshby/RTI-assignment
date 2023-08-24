import { DatePipe } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Calendar } from 'primeng/calendar';
import { EmployeeService } from 'src/app/shared/services/employee/employee.service';

export enum EmployeeType {
  Product_Designer = 'Product Designer',
  Flutter_Developer = 'Flutter Developer',
  Angular_Developer = 'Angular Developer',
  Tester = 'Tester',
}

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss'],
})
export class AddEmployeeComponent implements OnInit {
  addEmployeeForm: FormGroup;
  employeeTypes: any = Object.values(EmployeeType);
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  isMobile = false;
  @ViewChild('toDateCalendar') toDateCalendar: Calendar;
  @ViewChild('fromDateCalendar') fromDateCalendar: Calendar;
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkIsMobile();
  }

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private datePipe: DatePipe,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.addEmployeeForm = this.fb.group({
      employeeName: [null, [Validators.required, Validators.maxLength(50)]],
      role: ['', [Validators.required]],
      fromDate: ['', [Validators.required]],
      toDate: [''],
    });
    this.checkIsMobile();
  }

  checkIsMobile(): void {
    if (this.toDateCalendar) {
      this.toDateCalendar.overlayVisible = false;
    }
    this.isMobile = window.innerWidth <= 480;
  }

  goToTodayForStartDate(): void {
    this.selectedStartDate = new Date();
  }

  goToTodayForEndDate(): void {
    this.selectedEndDate = new Date();
  }

  goToNextDay(dayOfWeek: number): void {
    const currentDate = new Date();
    const daysUntilNextDay = (dayOfWeek - currentDate.getDay() + 7) % 7;
    const nextDayDate = new Date(currentDate);
    nextDayDate.setDate(currentDate.getDate() + daysUntilNextDay);

    this.selectedStartDate = nextDayDate;
  }

  goToNextWeek(): void {
    const nextWeekDate = new Date();
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    this.selectedStartDate = nextWeekDate;
  }

  noDate() {
    this.addEmployeeForm.get('toDate')?.setValue(null);
    this.selectedEndDate = null;
  }

  cancelForStartDate(): void {
    this.fromDateCalendar.overlayVisible = false;
  }

  cancelForEndDate(): void {
    this.toDateCalendar.overlayVisible = false;
  }

  saveStartDate(): void {
    if (this.selectedStartDate) {
      this.addEmployeeForm.get('fromDate')?.setValue(this.selectedStartDate);
      this.fromDateCalendar.overlayVisible = false;
    }
  }

  saveEndDate(): void {
    if (this.selectedEndDate) {
      this.addEmployeeForm.get('toDate')?.setValue(this.selectedEndDate);
      this.toDateCalendar.overlayVisible = false;
    } else {
      this.toDateCalendar.overlayVisible = false;
    }
  }

  endDateGreaterThanStartDateValidator() {
    const startDate = this.addEmployeeForm.get('fromDate');
    const endDate = this.addEmployeeForm.get('toDate')?.value;
    this.selectedStartDate = startDate?.value;
    this.selectedEndDate = endDate;

    if (startDate?.value && endDate && startDate?.value > endDate) {
      startDate?.setErrors({ pattern: true });
    } else if (startDate?.value && endDate && startDate?.value <= endDate) {
      if (startDate.errors && startDate.errors?.['pattern']) {
        const errors = { ...startDate.errors };
        delete errors?.['pattern']; // Remove the custom pattern error
        startDate.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
  }

  addEmployee() {
    if (this.addEmployeeForm.valid) {
      let employeeEndDate: string | null = null;
      const { fromDate, toDate, ...formValues }: any = {
        ...this.addEmployeeForm.value,
      };
      const employeeStartDate = this.datePipe.transform(fromDate, 'd MMM, y');
      if (toDate) {
        employeeEndDate = this.datePipe.transform(toDate, 'd MMM, y');
      }

      const updatedFormValues = {
        ...formValues,
        employeeStartDate,
        employeeEndDate,
      };

      this.employeeService
        .add(updatedFormValues)
        .then((id) => {
          console.log('Employee added with ID:', id);
          this.router.navigate(['/employee']);
        })
        .catch((error) => {
          console.error('Error adding employee:', error);
        });
    }
  }

  cancel() {
    this.router.navigate(['/employee']);
  }
}
