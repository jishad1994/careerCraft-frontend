import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AdminService } from '../../../services/admin/admin.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
@Component({
  selector: 'app-reusable-table',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './reusable-table.component.html',
  styleUrl: './reusable-table.component.css',
})
export class ReusableTableComponent {
  searchControl = new FormControl('');

  @Input() heading: string = '';
  @Input() displayedColumns: string[] = [];
  @Input() data: any[] = [];

  @Input() page = 1;
  @Input() totalPages = 1;

  @Output() view = new EventEmitter<any>();
  @Output() toggleBlock = new EventEmitter<any>();
  @Output() verify = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  changePage(newPage: number) {
    this.pageChange.emit(newPage);
  }

  constructor(private _adminService: AdminService) {
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((value) => {
        this.searchChange.emit(value || '');
      });
  }
}
