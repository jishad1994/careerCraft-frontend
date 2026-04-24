import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { PaginationMeta } from '../../../models/api-response.model';
import {
  TableAction,
  TableColumn,
} from '../../../models/reusable-table-items.interface';

type PageItem = number | string;

@Component({
  selector: 'app-reusable-table',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './reusable-table.component.html',
  styleUrl: './reusable-table.component.css',
})
export class ReusableTableComponent  implements OnInit {
  @Input() title = 'Data Table';
  @Input() columns: TableColumn[] = [];
  @Input() data: unknown[] = [];
  @Input() actions: TableAction[] = [];
  @Input() pagination: PaginationMeta | null = null;
  @Input() loading = false;
  @Input() showSearch = true;
  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() actionClick = new EventEmitter<{ type: string; row: any }>();

  searchQuery = '';
  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((query) => {
        this.searchChange.emit(query);
      });
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  isPageNumber(page: PageItem) {
    return typeof page == 'number';
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onActionClick(type: string, row: any): void {
    this.actionClick.emit({ type, row });
  }

  getBadgeClass(value: unknown): string {
    const lowerValue = String(value).toLowerCase();
    if (lowerValue === 'active' || lowerValue === 'true') {
      return 'bg-green-100 text-green-800';
    } else if (
      lowerValue === 'inactive' ||
      lowerValue === 'false' ||
      lowerValue === 'blocked'
    ) {
      return 'bg-red-100 text-red-800';
    } else if (lowerValue === 'pending') {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-gray-100 text-gray-800';
  }

  getDefaultActionClass(type: string): string {
    switch (type) {
      case 'view':
        return 'border-blue-300 text-blue-700 hover:bg-blue-50';
      case 'block':
        return 'border-red-300 text-red-700 hover:bg-red-50';
      case 'unblock':
        return 'border-green-300 text-green-700 hover:bg-green-50';
      default:
        return 'border-gray-300 text-gray-700 hover:bg-gray-50';
    }
  }

  getIconPath(icon: string): string {
    const icons: Record<string, string> = {
      view: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
      block:
        'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
      unblock: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    };
    return icons[icon] || '';
  }

  getStartItem(): number {
    if (!this.pagination) return 0;
    return (this.pagination.page - 1) * this.pagination.limit + 1;
  }

  getEndItem(): number {
    if (!this.pagination) return 0;
    const end = this.pagination.page * this.pagination.limit;
    return Math.min(end, this.pagination.totalItems);
  }

  getPageNumbers(): (number | string)[] {
    if (!this.pagination || !this.pagination.totalPages) return [];

    const total = this.pagination.totalPages;
    const current = this.pagination.page;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current > 3) {
        pages.push('...');
      }

      for (
        let i = Math.max(2, current - 1);
        i <= Math.min(total - 1, current + 1);
        i++
      ) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push('...');
      }

      pages.push(total);
    }

    return pages;
  }
}
