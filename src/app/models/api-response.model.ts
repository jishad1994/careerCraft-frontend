export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
export interface ApiResponse<T, E = Record<string, string[]>> {
  success: boolean;
  message: string;
  data: T | null;
  pagination?: PaginationMeta;
  errors?: E | null;
  statusCode?: number;
}
