export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'date' | 'image';
  sortable?: boolean;
  width?: string;
  transform?: (value: any, row?: any) => string;
}

export interface TableAction {
  type: 'view' | 'block' | 'unblock' | string;
  label: string;
  icon?: string;
  class?: string;
  show?: (row: any) => boolean;
}
