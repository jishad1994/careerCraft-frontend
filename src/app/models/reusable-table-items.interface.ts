
export interface TableColumn<T extends object = object> {
    key: keyof T & string;
    label: string;
    type?: "text" | "badge" | "date" | "image" | "custom";
    sortable?: boolean;
    width?: string;
    transform?: (value: unknown, row?: T) => string;
}

export interface TableAction<T extends object = object> {
    type: "view" | "block" | "unblock" | string;
    label: string;
    icon?: string;
    class?: string;
    show?: (row: T) => boolean;
}
