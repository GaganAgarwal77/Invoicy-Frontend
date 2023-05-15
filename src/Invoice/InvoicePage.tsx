import React, { FC, useState, useEffect } from 'react'
import { Invoice, ProductLine } from './data/types'
import { initialInvoice, initialProductLine } from './data/initialData'
import EditableInput from './EditableInput'
import EditableSelect from './EditableSelect'
import EditableTextarea from './EditableTextarea'
import EditableCalendarInput from './EditableCalendarInput'
import { networkList, methodList } from './data/paymentList'
import Document from './Document'
import Page from './Page'
import View from './View'
import Text from './Text'
import { Font } from '@react-pdf/renderer'
import Download from './DownloadPDF'
import format from 'date-fns/format'
import { Text as PdfText } from '@react-pdf/renderer'
import '../assets/invoice-scss/main.scss'
import ApiService from '../services/ApiService'

Font.register({
  family: 'Nunito',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/nunito/v12/XRXV3I6Li01BKofINeaE.ttf' },
    { src: 'https://fonts.gstatic.com/s/nunito/v12/XRXW3I6Li01BKofA6sKUYevN.ttf', fontWeight: 600 },
  ],
})

interface Props {
  data?: Invoice
  pdfMode?: boolean
}

const InvoicePage: FC<Props> = ({ data, pdfMode }) => {
  const [invoice, setInvoice] = useState<Invoice>(data ? { ...data } : { ...initialInvoice })
  const [subTotal, setSubTotal] = useState<number>()
  const [saleTax, setSaleTax] = useState<number>()
  const [discount, setDiscount] = useState<number>()
  
  const [myClients, setMyClients] = useState<any[]>();
  const dateFormat = "yyyy-MM-dd"
  const invoiceDate = invoice.invoiceDate !== '' ? new Date(invoice.invoiceDate) : new Date()
  const invoiceDueDate =
    invoice.dueDate !== ''
      ? new Date(invoice.dueDate)
      : new Date(invoiceDate.valueOf())

  if (invoice.dueDate === '') {
    invoiceDueDate.setDate(invoiceDueDate.getDate() + 30)
  }

  const myAsyncFunction = async (): Promise<any> => {
    let allClients: any[] = [];
    let res1 = await ApiService.getAuth('/fetch-clients/', window.localStorage.getItem("token"));
    const clients = res1.data;
    console.log(clients)
    const companyId = window.localStorage.getItem("user_id");
    let res2 = await ApiService.getAuth(`/users/id/${companyId}/`, window.localStorage.getItem("token"));
    const company = res2.data;
    console.log(company)
    const newInvoice = { ...invoice }
    newInvoice.companyName = company.company_name;
    newInvoice.email = company.email;
    newInvoice.companyId = companyId || '';
    await clients.forEach( async (client: any) => {
      const clientID = client.client;
      let res2 = await ApiService.getAuth(`/users/id/${clientID}/`, window.localStorage.getItem("token"));
      const clientCompany = res2.data;
      const data = {
        value : client.client,
        text: client.client,
        id: client.client,
        "clientId" : client.client,
        "blocked" : client.blocked,
        "discount" : client.discount,
        "name" : clientCompany.company_name,
        "email": clientCompany.email,
        "username" : clientCompany.username,
    }
      allClients.push(data);
      newInvoice.clientAddr = '';
      newInvoice.clientId = data.clientId;
      newInvoice.discount = data.discount;
      newInvoice.clientName = data.name;
      newInvoice.clientEmail = data.email;
      newInvoice.companyAddr = '';
    });
    console.log(allClients, newInvoice)
    // console.log(newInvoice)
    setInvoice(newInvoice)
    setMyClients(allClients)
  }

  const handleChange = async (name: keyof Invoice, value: string | number) => {
    if (name !== 'productLines') {

      const newInvoice = { ...invoice }

      if (typeof value === 'string') {
        if(name === "clientId") {
          console.log(value)
          newInvoice[name] = value;
          const clientCompanyId = value;
          let res2 = await ApiService.getAuth(`/users/id/${clientCompanyId}/`, window.localStorage.getItem("token"));
          const clientCompany = res2.data;
          newInvoice["clientName"] = clientCompany.company_name;
          newInvoice["clientEmail"] = clientCompany.email;

          let length = myClients ? myClients.length : 0
          for(var i = 0; i < length; i++) {
            const id = myClients ? myClients[i].clientId : null;
            if(id == value) {
              newInvoice["discount"] = myClients ? myClients[i].discount : 0;
              newInvoice["clientId"] = myClients ? myClients[i].clientId : 0;
            }
          }          
        }
        if(name === "totalAmount"){
          newInvoice[name] = value;
          if(!pdfMode){ newInvoice["dueAmount"] = value; }
        }
        else{
          newInvoice[name] = value
        }
      }


      setInvoice(newInvoice)
  }
}

  const handleProductLineChange = (index: number, name: keyof ProductLine, value: string) => {
    const productLines = invoice.productLines.map((productLine, i) => {
      if (i === index) {
        const newProductLine = { ...productLine }

        if (name === 'desc') {
          newProductLine[name] = value
        } else {
          if (
            value[value.length - 1] === '.' ||
            (value[value.length - 1] === '0' && value.includes('.'))
          ) {
            newProductLine[name] = value
          } else {
            const n = parseFloat(value)

            newProductLine[name] = (n ? n : 0).toString()
          }
        }

        return newProductLine
      }

      return { ...productLine }
    })

    setInvoice({ ...invoice, productLines })
  }

  const handleRemove = (i: number) => {
    const productLines = invoice.productLines.filter((productLine, index) => index !== i)

    setInvoice({ ...invoice, productLines })
  }

  const handleAdd = () => {
    const productLines = [...invoice.productLines, { ...initialProductLine }]

    setInvoice({ ...invoice, productLines })
  }

  const calculateAmount = (quantity: string, rate: string) => {
    const quantityNumber = parseFloat(quantity)
    const rateNumber = parseFloat(rate)
    const amount = quantityNumber && rateNumber ? quantityNumber * rateNumber : 0

    return amount.toFixed(2)
  }
  useEffect (() => {
    if(!pdfMode) myAsyncFunction()
  },[])
  useEffect(() => {
    let subTotal = 0

    invoice.productLines.forEach((productLine) => {
      const quantityNumber = parseFloat(productLine.qty)
      const rateNumber = parseFloat(productLine.price)
      const amount = quantityNumber && rateNumber ? quantityNumber * rateNumber : 0

      subTotal += amount
    })

    setSubTotal(subTotal)
  }, [invoice.productLines])

  useEffect(() => {
    const match = parseFloat(invoice.tax)
    const taxRate = match ? match : 0
    const saleTax = subTotal ? (subTotal * taxRate / 100) : 0
    const discountRate = parseFloat(invoice.discount) ? parseFloat(invoice.discount) : 0
    const discount = subTotal ? ((subTotal * discountRate) / 100): 0
    const total = subTotal? subTotal + saleTax - discount : 0
    setSaleTax(saleTax)
    setDiscount(discount)
    handleChange('totalAmount',total.toString())
  }, [subTotal, invoice.tax,invoice.discount])



   const sendInvoice = async (): Promise<any> =>  {
    let data = {...invoice}

    let finalItems : any[] = []
    data.productLines.forEach((item:any) => {
        let itemData : any = {};
        itemData['description'] = item.desc
        itemData['quantity'] = item.qty
        itemData['price'] = item.price
        itemData['discount'] = data.discount
        itemData['tax'] = data.tax
        finalItems.push(itemData);
    })
    console.log(finalItems);
  let invoiceData =  {
    "client": data.clientId,
    "invoiceDate":data.invoiceDate,
    "dueDate": data.dueDate,
    "totalAmount": data.totalAmount,
    "advancePercent": data.advancePercent,
    "note": data.note,
    "items" :finalItems,
  }
  console.log(invoiceData);

  try{
  let result = await ApiService.postAuth("/add-invoice/", invoiceData, window.localStorage.getItem("token"));
  window.alert('Invoice Created')
  window.location.href = '/dashboard'
  }
  catch(e) {
    window.alert("Error...")
    console.log(e)
  }
  }

  return (
    <Document pdfMode={pdfMode}>
      <Page className="invoice-wrapper" pdfMode={pdfMode}>
        {!pdfMode && <Download data={invoice} />}

        <View className="flex" pdfMode={pdfMode}>
          <View className="w-50" pdfMode={pdfMode}>

            <EditableInput
              className="fs-20 bold"
              placeholder="Your Company"
              value={invoice.companyName}
              pdfMode={pdfMode}
            />

            <EditableInput
              placeholder="Email Address"
              value={invoice.email}
              
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-50" pdfMode={pdfMode}>        
            <EditableInput
              className="fs-45 right bold"
              placeholder="Invoice"
              value={"INVOICE"}
              pdfMode={pdfMode}
            />
          </View>
        </View>




        <View className="flex mt-40" pdfMode={pdfMode}>
          
          <View className="w-55" pdfMode={pdfMode}>
            
              {pdfMode ? (
              <PdfText style={{fontSize:'16px',fontWeight:'bold' }}>Bill To:</PdfText>
            ) : (
              <PdfText style={{fontSize:'16px',fontWeight:'bold'}}>Bill To:</PdfText>
            )}    
            {console.log(myClients, myClients?.map((client) => {return client.clientId}))}
            {pdfMode ? (
              <PdfText style={{fontSize:'10px'}}>{invoice.clientId}</PdfText>
            ) : (
                  <EditableSelect
                    placeholder="Your Client's ID"
                    options = {myClients}
                    value={invoice.clientId}
                    onChange={(value) => handleChange('clientId', value)}
                    pdfMode={pdfMode}
                    />            
            )}
            <EditableInput
              placeholder="Your Client's Name"
              value={invoice.clientName}
              pdfMode={pdfMode}
            />

            <EditableInput
              placeholder="Email Address"
              value={invoice.clientEmail}
              pdfMode={pdfMode}
            />
          </View>
          
          <View className="w-45" pdfMode={pdfMode}>
            
            <View className="flex mb-1" pdfMode={pdfMode}>
            <View className="w-40" pdfMode={pdfMode}>
              {pdfMode ? (
              <PdfText style={{fontSize:'14px',fontWeight:'bold' }}>Invoice#</PdfText>
            ) : (
              <PdfText style={{fontSize:'14px',fontWeight:'bold'}}>Invoice#</PdfText>
            )}    
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <EditableInput
                  placeholder="01"
                  value={invoice.invoiceId}
                  onChange={(value) => handleChange('invoiceId', value)}
                  pdfMode={pdfMode}
                />
              </View>
            </View>
            
            <View className="flex mb-1" pdfMode={pdfMode}>
            <View className="w-40" pdfMode={pdfMode}>
              {pdfMode ? (
              <PdfText style={{fontSize:'14px',fontWeight:'bold' }}>Invoice Date</PdfText>
            ) : (
              <PdfText style={{fontSize:'14px',fontWeight:'bold'}}>Invoice Date</PdfText>
            )}    
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <EditableCalendarInput
                  value={format(invoiceDate, dateFormat)}
                  selected={invoiceDate}
                  onChange={(date) =>
                    handleChange(
                      'invoiceDate',
                      date && !Array.isArray(date) ? format(date, dateFormat) : ''
                    )
                  }
                  pdfMode={pdfMode}
                />
              </View>
            </View>
            
            <View className="flex mb-1" pdfMode={pdfMode}>
            <View className="w-40" pdfMode={pdfMode}>
              {pdfMode ? (
              <PdfText style={{fontSize:'14px',fontWeight:'bold' }}>Due Date</PdfText>
            ) : (
              <PdfText style={{fontSize:'14px',fontWeight:'bold'}}>Due Date</PdfText>
            )}    
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <EditableCalendarInput
                  value={format(invoiceDueDate, dateFormat)}
                  selected={invoiceDueDate}
                  onChange={(date) =>
                    handleChange(
                      'dueDate',
                      date && !Array.isArray(date) ? format(date, dateFormat) : ''
                    )
                  }
                  pdfMode={pdfMode}
                />
              </View>
            </View>
            

            <View className="flex mb-1" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
              {pdfMode ? (
              <PdfText style={{fontSize:'14px',fontWeight:'bold' }}>Advance Payment</PdfText>
            ) : (
              <PdfText style={{fontSize:'14px',fontWeight:'bold'}}>Advance Payment</PdfText>
            )}    
              </View>
              <View className="w-17" pdfMode={pdfMode}>
                <EditableInput
                  value={invoice.advancePercent + '%'}
                  onChange={(value) => handleChange('advancePercent', value.slice(0,-1))}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-60" pdfMode={pdfMode}>
              <Text className="dark w-auto" pdfMode={pdfMode}>
              {'INR ' + (typeof subTotal !== 'undefined' && typeof saleTax !== 'undefined'
                ? (parseFloat(invoice.totalAmount) * (parseFloat(invoice.advancePercent)/100))
                : 0
              ).toFixed(2)}
            </Text>
              </View>
            </View>
            
          </View>
        </View>



        <View className="mt-30 bg-dark flex" pdfMode={pdfMode}>
          <View className="w-48 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold"
              value={"Item Description"}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-17 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={"Qty"}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-17 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={"Rate"}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-18 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={"Amount"}
              pdfMode={pdfMode}
            />
          </View>
        </View>



        {invoice.productLines.map((productLine, i) => {
          return pdfMode && productLine.desc === '' ? (
            <Text key={i}></Text>
          ) : (
            <View key={i} className="row flex ml-0 mr-0" pdfMode={pdfMode}>
              <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableTextarea
                  className="dark"
                  rows={2}
                  placeholder="Enter item name/description"
                  value={productLine.desc}
                  onChange={(value) => handleProductLineChange(i, 'desc', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-17 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableInput
                  className="dark right"
                  value={productLine.qty}
                  onChange={(value) => handleProductLineChange(i, 'qty', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-17 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableInput
                  className="dark right"
                  value={productLine.price}
                  onChange={(value) => handleProductLineChange(i, 'price', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-18 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark right" pdfMode={pdfMode}>
                  {calculateAmount(productLine.qty, productLine.price)}
                </Text>
              </View>
              {!pdfMode && (
                <button
                  className="link row__remove"
                  aria-label="Remove Row"
                  title="Remove Row"
                  onClick={() => handleRemove(i)}
                >
                  <span className="icon icon-remove bg-red"></span>
                </button>
              )}
            </View>
          )
        })}

<View className="flex" pdfMode={pdfMode}>
          <View className="w-50 mt-10" pdfMode={pdfMode}>
            {!pdfMode && (
              <button className="link" onClick={handleAdd}>
                <span className="icon icon-add bg-green mr-10"></span>
                Add Line Item
              </button>
            )}
          </View>
          <View className="w-50 mt-20" pdfMode={pdfMode}>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-1 " pdfMode={pdfMode}>
                  {pdfMode ? (
                  <PdfText style={{fontSize:'12px',fontWeight:'bold'}}>Sub Total</PdfText>
                ) : (
                  <PdfText style={{fontSize:'14px',fontWeight:'bold'}}>Sub Total</PdfText>
                )}    
              </View>
              <View className="w-50 p-1" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {'INR '+subTotal?.toFixed(2)}
                </Text>
              </View>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-1" pdfMode={pdfMode}>
                {pdfMode ? (
                <PdfText style={{fontSize:'12px',fontWeight:'bold' }}>Sale Tax</PdfText>
              ) : (
                <PdfText style={{fontSize:'14px',fontWeight:'bold'}}>Sale Tax</PdfText>
              )}    
                </View>
              <View className="w-25 p-1" pdfMode={pdfMode}>
                <EditableInput
                  value={invoice.tax + '%'}
                  onChange={(value) => handleChange('tax', value.slice(0,-1))}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-1" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {'INR '+ saleTax?.toFixed(2)}
                </Text>
              </View>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-1" pdfMode={pdfMode}>
                {pdfMode ? (
                <PdfText style={{fontSize:'12px',fontWeight:'bold' }}>Discount</PdfText>
              ) : (
                <PdfText style={{fontSize:'14px',fontWeight:'bold'}}>Discount</PdfText>
              )}    
                </View>
              <View className="w-25 p-1" pdfMode={pdfMode}>
                <EditableInput
                  value={invoice.discount +'%'}
                  onChange={(value) => handleChange('discount', value.slice(0,-1))}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-1" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {'INR '+discount?.toFixed(2)}
                </Text>
              </View>
            </View>
            <View className="flex bg-gray" pdfMode={pdfMode}>
            <View className="w-50 p-1" pdfMode={pdfMode}>
                {pdfMode ? (
                <PdfText style={{fontSize:'12px',fontWeight:'bold' }}>Total</PdfText>
              ) : (
                <PdfText style={{fontSize:'14px',fontWeight:'bold'}}>Total</PdfText>
              )}    
                </View>
              <View className="w-50 p-1" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {'INR '+(typeof subTotal !== 'undefined' && typeof saleTax !== 'undefined' && typeof discount !== 'undefined'
                    ? subTotal + saleTax - discount
                    : 0
                  ).toFixed(2)}
                </Text>
              </View>
            </View>
            
            {
              pdfMode && 
              <View className="flex bg-gray" pdfMode={pdfMode}>
              <View className="w-50 p-1" pdfMode={pdfMode}>
                  {pdfMode ? (
                  <PdfText style={{fontSize:'12px',fontWeight:'bold' }}>Total Due</PdfText>
                ) : (
                  <PdfText style={{fontSize:'14px',fontWeight:'bold'}}>Total Due</PdfText>
                )}    
                  </View>
              <View className="w-50 p-1" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {'INR '+ parseFloat(invoice.dueAmount).toFixed(2)}
                </Text>
              </View>
          </View>
            }
          </View>
          
</View>

        <View className="mt-20" pdfMode={pdfMode}>
          <EditableInput
            className="bold w-100"
            value={"Notes"}
            pdfMode={pdfMode}
          />
          <EditableTextarea
            className="w-100"
            rows={2}
            value={invoice.note}
            onChange={(value) => handleChange('note', value)}
            pdfMode={pdfMode}
          />
        </View>
        <View className="mt-20" pdfMode={pdfMode}>
          <EditableInput
            className="bold w-100"
            value={"Terms & Conditions"}
            pdfMode={pdfMode}
          />
          <EditableTextarea
            className="w-100"
            rows={2}
            value={"Please make the payment by the due date."}
            pdfMode={pdfMode}
          />
        </View>
        {!pdfMode && <button className='btn btn-primary'  onClick={(event:any) => {sendInvoice()}}>Send</button>}
        
      </Page>
    </Document>
  )
}

export default InvoicePage
