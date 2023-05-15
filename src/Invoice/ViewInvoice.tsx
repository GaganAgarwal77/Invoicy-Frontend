import React, { FC } from 'react'
import { PDFViewer } from '@react-pdf/renderer'
import InvoicePage from './InvoicePage'
interface Props {
  location: any
}


const convertData:any = (input:any)=>{
  const discount = input.items[0].discount;
  const tax = input.items[0].tax;
  input.items.forEach((item:any) => {
    item['price'] = item.price
    item['desc'] = item.description
    item['qty'] = item.quantity
    delete item['discount'];
    delete item['tax'];
  })
  const invoice = {
    ...input,
    invoiceId: input.id,
    companyName: input.companyName,
    companyAddr: input.user,
    companyId: input.user,
    email: input.companyEmail,
    clientName: input.clientName,
    clientAddr: input.client,
    clientId: input.client,
    clientemail: input.clientEmail,
    productLines: input.items,
    discount: discount,
    tax: tax,
  }
  delete invoice['payment']
  delete invoice['company']
  delete invoice['client']
  delete invoice['items']
  invoice['totalAmount'] = invoice.totalAmount
  invoice['dueAmount'] = invoice.dueAmount
  return invoice;
}

const ViewInvoice: FC<Props> = (props) => {
  let data = convertData(props.location.state.invoice);
  return (
      <div >
        <PDFViewer style={{marginLeft:"25%",width:"50%",height:"140vh"}}>
            <InvoicePage pdfMode={true} data={data} />
        </PDFViewer>
        </div>
  )
}

export default ViewInvoice
