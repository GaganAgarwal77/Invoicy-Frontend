import { ProductLine, Invoice } from './types'

export const initialProductLine: ProductLine = {
  desc: '',
  qty: '1',
  price: '0.00',
}

export const initialInvoice: Invoice = {
  clientId:'',
  companyId:'1',
  companyName: '',
  companyAddr: '',
  email: '',
  clientName: '',
  clientAddr: '',
  clientEmail: '',
  invoiceId: '1',
  invoiceDate: '2023-04-15',
  dueDate: '2023-05-25',
  productLines: [
    {
      desc: 'Item 1',
      qty: '2',
      price: '10.00',
    }
  ],
  advancePercent: '50',
  note: 'It was great doing business with you.',
  totalAmount: '18.00',
  dueAmount: '18.00',
  discount: '20',
  tax: '10',
  method: "UPI",
  network: "Razorpay",

  workCompleted:"false",
  isSettled: "false",
  uploadDocURI: "www.google.com"
}
