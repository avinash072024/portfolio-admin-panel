import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

// interface CalendarDay {
//   date: Date;
//   isCurrentMonth: boolean;
//   isToday: boolean;
//   isSelected: boolean;
// }

// Add 'isFuture' to your interface
interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isFuture: boolean; // <-- Add this
}

@Component({
  selector: 'app-custom-datepicker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-datepicker.component.html',
  styleUrl: './custom-datepicker.component.scss'
})
export class CustomDatepickerComponent implements OnInit {
  @Input() selectedDateString: string = '';
  @Output() dateChange = new EventEmitter<string>();

  isOpen = false;
  currentMonth: Date = new Date();
  selectedDate: Date | null = null;

  daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  calendarDays: CalendarDay[] = [];
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(private eRef: ElementRef) { }

  ngOnInit(): void {
    if (this.selectedDateString) {
      const parts = this.selectedDateString.split('-');
      if (parts.length === 3) {
        this.selectedDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        this.currentMonth = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);
      }
    } else {
      this.currentMonth = new Date();
      this.currentMonth.setDate(1);
    }
    this.generateCalendar();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      if (this.selectedDate) {
        this.currentMonth = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);
      } else {
        const today = new Date();
        this.currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      }
      this.generateCalendar();
    }
  }

  prevMonth(event: Event) {
    event.stopPropagation();
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(event: Event) {
    event.stopPropagation();
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }

  // selectDate(day: CalendarDay, event: Event) {
  //   event.stopPropagation();
  //   this.selectedDate = day.date;
  //   this.selectedDateString = this.formatDate(this.selectedDate);
  //   this.dateChange.emit(this.selectedDateString);
  //   this.isOpen = false;
  //   this.generateCalendar();
  // }

  selectDate(day: CalendarDay, event: Event) {
    event.stopPropagation();

    // Prevent selection if it's a future date
    if (day.isFuture) {
      return;
    }

    this.selectedDate = day.date;
    this.selectedDateString = this.formatDate(this.selectedDate);
    this.dateChange.emit(this.selectedDateString);
    this.isOpen = false;
    this.generateCalendar();
  }

  clearDate(event: Event) {
    event.stopPropagation();
    this.selectedDate = null;
    this.selectedDateString = '';
    this.dateChange.emit('');
    this.isOpen = false;
    this.generateCalendar();
  }

  generateCalendar() {
    this.calendarDays = [];
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Get the day of the week for the 1st of the month (0 = Sunday, 1 = Monday, ...)
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // Days from previous month to fill the first row
    const daysFromPrevMonth = firstDayOfWeek;
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }

    // Days of current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month, i);
      this.calendarDays.push(this.createCalendarDay(date, true));
    }

    // Days from next month to fill the remaining rows (up to 42 days = 6 weeks)
    const remainingDays = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }
  }

  // private createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
  //   const today = new Date();
  //   const isToday = date.getDate() === today.getDate() &&
  //     date.getMonth() === today.getMonth() &&
  //     date.getFullYear() === today.getFullYear();

  //   const isSelected = this.selectedDate !== null &&
  //     date.getDate() === this.selectedDate.getDate() &&
  //     date.getMonth() === this.selectedDate.getMonth() &&
  //     date.getFullYear() === this.selectedDate.getFullYear();

  //   return {
  //     date,
  //     isCurrentMonth,
  //     isToday,
  //     isSelected
  //   };
  // }

  private createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    // Clear hours for an accurate day-by-day comparison
    const compareToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const isToday = compareDate.getTime() === compareToday.getTime();

    // Check if the grid date is strictly after today
    const isFuture = compareDate.getTime() > compareToday.getTime();

    const isSelected = this.selectedDate !== null &&
      date.getDate() === this.selectedDate.getDate() &&
      date.getMonth() === this.selectedDate.getMonth() &&
      date.getFullYear() === this.selectedDate.getFullYear();

    return {
      date,
      isCurrentMonth,
      isToday,
      isSelected,
      isFuture // <-- Pass it here
    };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
