import React from 'react';
import {Row, Col, Card, Table, Button} from 'react-bootstrap';

import Aux from "../hoc/_Aux";

import avatar2 from '../assets/images/user/avatar-2.jpg';

import Dialog from 'react-bootstrap-dialog';
import RangeSlider from 'react-bootstrap-range-slider';
import ApiService from '../services/ApiService';


class ClientDashboard extends React.Component {

    constructor (props) {
        super(props);      
        this.clientId = this.props.match.params.id;
        this.state = {
          clientId: this.props.match.params.id,
          companyId: window.localStorage.getItem("user_id"),
          client: {},
          invoices: [],
          discount: 0,
        };
    }

    async getInvoices(){
        try{
            let res2 = await ApiService.getAuth(`/users/id/${this.state.clientId}/`, window.localStorage.getItem("token"));
            const client = res2.data;
            let res3 = await ApiService.getAuth(`/client-invoice/${this.state.clientId}/`, window.localStorage.getItem("token"));
            const invoices = res3.data;
            let res4 = await ApiService.getAuth(`/client/${this.state.clientId}/`, window.localStorage.getItem("token"));
            const clientData = res4.data;
            console.log(client);
            console.log(invoices);
            console.log(clientData);
            let clientInvoices = []
            invoices.forEach(invoice => {
                invoice = {...invoice, 'clientName': client.company_name, 'clientEmail': client.email }
                clientInvoices = [...clientInvoices, invoice]
            })
            this.setState({
                client: {...client, 'discount': clientData.discount, 'blocked': clientData.blocked},
                invoices: clientInvoices,
                discount: clientData.discount,
            });
        }catch(e){
                console.log(e);
            }
    }

    componentDidMount() {
        this.getInvoices();
    }  

    async updateDiscount(discount) {
        let result = await ApiService.patchAuth(`/client/${this.state.clientId}/`,{discount: discount} , window.localStorage.getItem("token"));
        console.log(result);
        if(result) {
            this.setState({
                client: {...this.state.client, 
                    discount: discount
                }
            });
            this.dialog.showAlert('Success');
        }
        else {
            this.dialog.showAlert('Something went wrong!');
        }
    }

    async blockClient() {
        let result = await ApiService.patchAuth(`/client/${this.state.clientId}/`,{blocked: !this.state.client.blocked} , window.localStorage.getItem("token"));
        console.log(result);
        if(result) {
            this.setState({
                client: {...this.state.client, 
                    blocked: !this.state.client.blocked
                }
            });
            this.dialog.showAlert('Success');
        }
        else {
            this.dialog.showAlert('Something went wrong!');
        }
    }

    async updateWorkStatus(invoiceId) {
        const result = await ApiService.patchAuth(`/invoice/${invoiceId}/`, {workCompleted: "true"}, window.localStorage.getItem("token"));
        console.log(result)
        if(result) {
            this.dialog.showAlert('Success!');
            window.location.reload();
        }
        else {
            this.dialog.showAlert('Something went wrong!');
        }
    }

    async remindClient(invoiceId) { 
        const result = await ApiService.postAuth(`/reminder/invoice/`, {id:invoiceId}, window.localStorage.getItem("token"));
        console.log(result)
        if(result) {
            this.dialog.showAlert('Reminder Sent Successfully!');
        }
        else {
            this.dialog.showAlert('Something went wrong!');
        }
    }

    viewDetails(invoice) {
        this.props.history.push({
            pathname: '/view-invoice/',
            state: { invoice: invoice }
        })
    }

    render() {       
        let invoices = [];
        let completedInvoices = [];

        this.state.invoices.forEach(invoice => {
            if(invoice.dueAmount == 0){
                completedInvoices.push(
                    <tr className="unread" key = {invoice.id}>
                    <td><img className="rounded-circle" style={{width: '40px'}} src={avatar2} alt="activity-user"/></td>
                    <td>
                        <h6 className="mb-1">{invoice.clientName}</h6>
                        <p className="m-0">{invoice.clientEmail}</p>
                    </td>
                    <td>
                        <h6 className="text-muted"><i className="fa fa-circle text-c-green f-10 m-r-15"/>{invoice.invoiceDate}</h6>
                    </td>
                    <td>
                        <h6 className="text-muted"><i className="fa fa-circle text-c-red f-10 m-r-15"/>{invoice.dueDate}</h6>
                    </td>
                    <td>
                        <h6 className="text-muted">Work Status: &nbsp; 
                        {
                            invoice.workCompleted &&
                            <span className="text-success">Completed</span>
                        }
                        {
                            !invoice.workCompleted &&
                            <span className="text-danger">Not Completed</span>
                        }
                        </h6>
                    </td>
                    <td>
                        <h6 className="text-muted">{invoice.totalAmount} INR</h6>
                    </td>
                    <td>
                        <button style={{border: 0}} onClick={() => this.viewDetails(invoice)} className="label theme-bg2 text-white f-12">View Details</button>
                        <button style={{border: 0}} onClick={() => this.updateWorkStatus(invoice.id)} className="label theme-bg text-white f-12">
                            {
                                !invoice.workCompleted &&
                                "Update Progress"
                            }
                            {
                                invoice.workCompleted &&
                                "Delete Progress"
                            }                            
                        </button>
                    </td>
                </tr>
                )
            }
            else{
                invoices.push(
                    <tr className="unread" key = {invoice.id}>
                    <td><img className="rounded-circle" style={{width: '40px'}} src={avatar2} alt="activity-user"/></td>
                    <td>
                        <h6 className="mb-1">{invoice.clientName}</h6>
                        <p className="m-0">{invoice.clientEmail}</p>
                    </td>
                    <td>
                        <h6 className="text-muted"><i className="fa fa-circle text-c-green f-10 m-r-15"/>{invoice.invoiceDate}</h6>
                    </td>
                    <td>
                        <h6 className="text-muted"><i className="fa fa-circle text-c-red f-10 m-r-15"/>{invoice.dueDate}</h6>
                    </td>
                    <td>
                        <h6 className="text-muted">Work Status: &nbsp; 
                        {
                            invoice.workCompleted &&
                            <span className="text-success">Completed</span>
                        }
                        {
                            !invoice.workCompleted &&
                            <span className="text-danger">Not Completed</span>
                        }
                        </h6>
                    </td>
                    <td>
                        <h6 className="text-muted">{invoice.dueAmount} INR due</h6>
                    </td>
                    <td>
                        <button style={{border: 0}} onClick={() => this.viewDetails(invoice)} className="label theme-bg2 text-white f-12">View Details</button>
                        <button style={{border: 0}} onClick={() => this.updateWorkStatus(invoice.id)} className="label theme-bg text-white f-12">
                            {
                                !invoice.workCompleted &&
                                "Update Progress"
                            }
                            {
                                invoice.workCompleted &&
                                "Delete Progress"
                            }                            
                        </button>
                        <button style={{border: 0}} onClick={() => this.remindClient(invoice.id)} className="label theme-bg text-white f-12">Remind</button>
                        <Dialog ref={(component) => { this.dialog = component }} />
                    </td>
                </tr>
                )
            }
        })


        return (
            <Aux>
                <Row>
                    <Col md={12} xl={12}>
                        <div className="justify-content-center text-center"><img className="rounded-circle" style={{width: '140px'}} src={avatar2} alt="user"/></div>
                        <div className="mt-3 text-center">
                            <h4 className="mb-0">{this.state.client.company_name}</h4> 
                            <span className="text-muted d-block ">{this.state.client.email}</span>
                            <span className="text-muted d-block mb-2">{this.state.client.username}</span> 
                            <h5 className="mb-3">Discount: {this.state.client.discount} %</h5> 
                            <span><RangeSlider value={this.state.discount} onChange={e=>this.setState({discount: e.target.value})}/></span>
                            <Button size='sm' onClick={() => {this.updateDiscount(this.state.discount)}}>Update Discount</Button>
                        </div>  
                    </Col>

                    <Col md={12} xl={12}>
                        <Card className='Recent-Users mt-5'>
                            <Card.Header>
                                <Card.Title as='h5'>Pending Invoices</Card.Title>
                            </Card.Header>
                            
                            <Card.Body className='px-0 py-2'>
                            <Table responsive hover>
                            <tbody>
                                {invoices}
                            </tbody>
                            </Table>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={12} xl={12}>
                        <Card className='Recent-Users'>
                            <Card.Header>
                                <Card.Title as='h5'>Settled Invoices</Card.Title>
                            </Card.Header>
                            <Card.Body className='px-0 py-2'>
                            <Table responsive hover>
                            <tbody>
                                {completedInvoices}
                            </tbody>
                            </Table>
                            </Card.Body>
                        </Card>
                    </Col>

                    {
                        !this.state.client.blocked &&
                        <Col md={12} xl={12}>
                        <div className="justify-content-center text-center">
                            <Button variant='danger' onClick={() => this.blockClient()}>Block Client</Button>
                            <Dialog ref={(component) => { this.dialog = component }} />
                        </div>
                        </Col>
                    }
                    {
                        this.state.client.blocked &&
                        <Col md={12} xl={12}>
                        <div className="justify-content-center text-center">
                            <Button variant='primary' onClick={() => this.blockClient()}>Unblock Client</Button>
                            <Dialog ref={(component) => { this.dialog = component }} />
                        </div>
                        </Col>
                    }
                </Row>
            </Aux>
        );
    }
}

export default ClientDashboard;