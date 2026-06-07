export interface Invoice {
  _id: string;
  invoiceNumber: string;
  companyId: string;
  subscriptionId: string;
  paymentId: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  total: number;
  status: string;
  pdfUrl?: string;
  items: InvoiceItem[];
  companyDetails: CompanyDetails;
}
 
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}
 
export interface CompanyDetails {
  name: string;
  email: string;
  phone?: string;
  address?: {
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  gstin?: string;
}