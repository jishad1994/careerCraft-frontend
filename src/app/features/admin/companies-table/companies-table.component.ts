import { Component } from '@angular/core';
import { AdminService } from '../../../services/admin/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-companies-table',
  imports: [ReusableTableComponent],
  templateUrl: './companies-table.component.html',
  styleUrl: './companies-table.component.css',
})
export class CompaniesTableComponent {
  constructor(
    private _adminService: AdminService,
    private _snackBar: MatSnackBar
  ) {}

  heading: string = 'companies';
  users: any[] = [];
  userPage = 1;
  userTotalPages = 1;

  displayedColumns: string[] = [];

  async loadUsers(page: number) {
    this.userPage = page;

    this._adminService.getCompaniesPaginated(page).subscribe({
      next: (res) => {
        this.users = res.data;
        this.userTotalPages = Math.ceil(
          res.pagination.total / res.pagination.limit
        );
      },

      error: (error) => {
        this._snackBar.open('some error occured', 'close', { duration: 3000 });
      },
    });
  }

  async ngOnInit() {
    this.displayedColumns = ['name', 'email', 'role'];
    await this.loadUsers(this.userPage);
  }

  onView(item: any) {
    console.log('view', item);
  }

  onToggleBlock(item: any) {
    item.isBlocked = !item.isBlocked;
    this._adminService
      .blockOrUnblockCompany(String(item._id), item.isBlocked)
      .subscribe();

    console.log(item.isBlocked ? 'blocked' : 'unblocked', item);
  }

  onVerify(item: any) {
    console.log('verify', item);
  }

  onSearch(query: string) {
    this.userPage = 1;
    this._adminService.getCompanies(query).subscribe((res) => {
      this.users = res.companies;
    });
  }
}
