import { DatePipe } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Calendar } from 'primeng/calendar';
import { EmployeeService } from 'src/app/shared/services/employee/employee.service';
import { EmployeeType } from '../add-employee/add-employee.component';

@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss'],
})
export class EditEmployeeComponent implements OnInit {
  editEmployeeForm: FormGroup;
  employeeTypes: any = Object.values(EmployeeType);
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  employeeId: string | null = '';
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
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.editEmployeeForm = this.fb.group({
      employeeName: [null, [Validators.required, Validators.maxLength(50)]],
      role: ['', [Validators.required]],
      fromDate: ['', [Validators.required]],
      toDate: [''],
    });
    this.employeeId = this.route.snapshot.paramMap.get('id')!;
    if (this.employeeId) {
      this.employeeService.getById(Number(this.employeeId)).then((employee) => {
        if (Object.keys(employee).length) {
          const formatStartDate = this.datePipe.transform(
            employee.employeeStartDate,
            'dd/MM/yyyy'
          );
          const formatEndDate = this.datePipe.transform(
            employee.employeeEndDate,
            'dd/MM/yyyy'
          );
          this.editEmployeeForm.patchValue({
            employeeName: employee.employeeName,
            role: employee.role,
            fromDate: formatStartDate,
            toDate: formatEndDate ? formatEndDate : '',
          });
        } else {
          console.log('Employee record is not present');
          this.router.navigate(['/employee']);
        }
      });
    } else {
      this.router.navigate(['/employee']);
    }
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
    this.editEmployeeForm.get('toDate')?.setValue(null);
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
      this.editEmployeeForm.get('fromDate')?.setValue(this.selectedStartDate);
      this.fromDateCalendar.overlayVisible = false;
    }
  }

  saveEndDate(): void {
    if (this.selectedEndDate) {
      this.editEmployeeForm.get('toDate')?.setValue(this.selectedEndDate);
      this.toDateCalendar.overlayVisible = false;
    } else {
      this.toDateCalendar.overlayVisible = false;
    }
  }

  endDateGreaterThanStartDateValidator() {
    const startDate = this.editEmployeeForm.get('fromDate');
    const endDate = this.editEmployeeForm.get('toDate')?.value;
    this.selectedStartDate = startDate?.value;
    this.selectedEndDate = endDate;

    if (startDate?.value && endDate && startDate?.value > endDate) {
      startDate?.setErrors({ pattern: true });
    } else if (startDate?.value && endDate && startDate?.value <= endDate) {
      if (startDate.errors && startDate.errors?.['pattern']) {
        const errors = { ...startDate.errors };
        delete errors?.['pattern'];
        startDate.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
  }

  parseDate(dateString: string): Date {
    const parts = dateString.split('/');
    return new Date(+parts[2], +parts[1] - 1, +parts[0]);
  }

  editEmployee() {
    if (this.editEmployeeForm.valid) {
      let employeeEndDate: string | null = null;
      let employeeStartDate: string | null = null;

      const { fromDate, toDate, ...formValues }: any = {
        ...this.editEmployeeForm.value,
      };
      if (typeof fromDate === 'string') {
        const startDate = this.parseDate(fromDate);
        employeeStartDate = this.datePipe.transform(startDate, 'd MMM, y');
      } else {
        employeeStartDate = this.datePipe.transform(fromDate, 'd MMM, y');
      }

      if (toDate) {
        if (typeof fromDate === 'string') {
          const endDate = this.parseDate(fromDate);
          employeeEndDate = this.datePipe.transform(endDate, 'd MMM, y');
        } else {
          employeeEndDate = this.datePipe.transform(toDate, 'd MMM, y');
        }
      }

      const updatedFormValues = {
        ...formValues,
        employeeStartDate,
        employeeEndDate,
        id: Number(this.employeeId),
      };

      this.employeeService
        .update(updatedFormValues)
        .then((id) => {
          console.log('Employee updated with ID:', id);
          this.router.navigate(['/employee']);
        })
        .catch((error) => {
          console.error('Error updating employee:', error);
        });
    }
  }

  cancel() {
    this.router.navigate(['/employee']);
  }
}
