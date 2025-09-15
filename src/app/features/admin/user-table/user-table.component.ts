import { Component, OnDestroy } from '@angular/core';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { AdminService } from '../../../services/admin/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-user-table',
  imports: [ReusableTableComponent],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.css',
})
export class UserTableComponent implements OnDestroy {
  constructor(
    private _adminService: AdminService,
    private _snackBar: MatSnackBar
  ) {}

  heading: string = 'users';
  users: any[] = [];
  userPage = 1;
  userTotalPages = 1;

  displayedColumns: string[] = [];

  async loadUsers(page: number) {
    this.userPage = page;

    this._adminService.getUsersPaginated(page).subscribe({
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
    this.displayedColumns = ['firstName', 'lastName', 'email', 'role'];
    await this.loadUsers(this.userPage);
  }

  ngOnDestroy(): void {
    this;
  }

  onView(item: any) {
    console.log('view', item);
  }

  onToggleBlock(item: any) {
    item.isBlocked = !item.isBlocked;
    this._adminService
      .blockOrUnblockUser(String(item._id), item.isBlocked)
      .subscribe();
    console.log(item.isBlocked ? 'blocked' : 'unblocked', item);
  }

  onVerify(item: any) {
    console.log('verify', item);
  }

  onSearch(query: string) {
    this.userPage = 1;
    this._adminService.getUsers(query).subscribe((res) => {
      this.users = res.users;
    });
  }
}
