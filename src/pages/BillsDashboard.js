import React from 'react';
import {Row, Col, Card, Table} from 'react-bootstrap';
import Aux from "../hoc/_Aux";
import avatar2 from '../assets/images/user/avatar-2.jpg';
import ApiService from '../services/ApiService';
import Dialog from 'react-bootstrap-dialog';

class BillsDashboard extends React.Component {
    constructor (props) {
        super(props);
        this.state = {wallet: '', companyId: window.localStorage.getItem("user_id"), invoices: []};
    }

    async getBills() {
        try{
            let res3 = await ApiService.getAuth("/fetch-bills", window.localStorage.getItem("token"));
            const invoices = res3.data;
            console.log(invoices);
            let res5 = await ApiService.getAuth(`/users/id/${this.state.companyId}/`, window.localStorage.getItem("token"));
            let company = res5.data;
            invoices.forEach(async invoice => {
                if(invoice.client == this.state.companyId){
                const clentId = invoice.client
                let res2 = await ApiService.getAuth(`/users/id/${clentId}/`, window.localStorage.getItem("token"));
                const client = res2.data;
                console.log(client);
                invoice = {...invoice, 'clientName': client.company_name, 'clientEmail': client.email, 'companyName': company.company_name, 'companyEmail': company.email }
                this.setState({
                    invoices:[...this.state.invoices, invoice]
                });
            }
            })
        }
        catch(e) {
            console.log(e);
        }
    }
    componentDidMount() {
        this.getBills();
    }  
    async payInvoice(invoice) {
        const invoiceId = invoice.id;
        const advance =  parseInt(invoice.advancePercent);
        const workCompleted = invoice.workCompleted;
        var amount;
        if(advance === 0 || advance === 100) {
            amount = 0;
        }
        else {
            if(!workCompleted) {
                amount = invoice.totalAmount - invoice.totalAmount * (advance / 100);
            }
            else {
                amount = 0;
            }
        }
        const result = await ApiService.patchAuth(`/bill/${invoiceId}/`, {dueAmount: amount}, window.localStorage.getItem("token"));
        console.log(result)
        if(result) {
            this.dialog.showAlert('Success!');
            window.location.reload();
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
        const invoices = this.state.invoices;
        let settledData  = []
        let pendingData  = []
        let totalMoneySpent = 0
        let totalMoneyDue = 0
        console.log(invoices);
        invoices.forEach(invoice => {
            if(invoice.dueAmount == 0){
                settledData.push(
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
                            <h6 className="text-muted">{invoice.totalAmount} INR</h6>
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
                            <button style={{border: 0}} onClick={() => this.viewDetails(invoice)} className="label theme-bg text-white f-12">View Details</button>
                        </td>
                    </tr>
                )
                totalMoneySpent += invoice.totalAmount;
            }
            else{
            pendingData.push(
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
                        <h6 className="text-muted">{invoice.dueAmount} INR due</h6>
                        <p className="m-0">
                            Advance: {invoice.advancePercent}%
                        </p>
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
                        <button style={{border: 0}} onClick={() => this.viewDetails(invoice)} className="label theme-bg text-white f-12">View Details</button>
                        <button style={{border: 0}} onClick={() => this.payInvoice(invoice)} className="label theme-bg text-white f-12">Pay</button>
                        <Dialog ref={(component) => { this.dialog = component }} />
                    </td>
                </tr>
            )
            totalMoneyDue +=invoice.dueAmount;
            }
        })
        var settledProgressBar = (settledData.length + pendingData.length) ? (settledData.length / (settledData.length + pendingData.length) * 100).toString() : "0";
        var pendingProgressBar = (settledData.length + pendingData.length) ? (pendingData.length / (settledData.length + pendingData.length) * 100).toString() : "0";
        var paymentProgressBar = (totalMoneySpent + totalMoneyDue) ? (totalMoneySpent / (totalMoneySpent + totalMoneyDue) * 100).toString() : "0";
        return (
            <Aux>
                <Row>
                    <Col md={6} xl={4}>
                        <Card>
                            <Card.Body>
                                <h6 className='mb-4'>Total Settled Bills</h6>
                                <div className="row d-flex align-items-center">
                                    <div className="col-9">
                                        <h3 className="f-w-300 d-flex align-items-center m-b-0"><i className="feather icon-arrow-up text-c-green f-30 m-r-5"/>{settledData.length}</h3>
                                    </div>
                                    <div className="col-3 text-right">
                                        <p className="m-b-0">{parseFloat(settledProgressBar).toFixed(2)}%</p>
                                    </div>
                                </div>
                                <div className="progress m-t-30" style={{height: '7px'}}>
                                    <div className="progress-bar progress-c-theme" role="progressbar" 
                                    style={{width: settledProgressBar.concat("%")}} 
                                    aria-valuenow={settledProgressBar} 
                                    aria-valuemin="0" aria-valuemax="100"
                                    />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} xl={4}>
                        <Card>
                            <Card.Body>
                                <h6 className='mb-4'>Total Pending Bills</h6>
                                <div className="row d-flex align-items-center">
                                    <div className="col-9">
                                        <h3 className="f-w-300 d-flex align-items-center m-b-0"><i className="feather icon-arrow-down text-c-red f-30 m-r-5"/>{pendingData.length}</h3>
                                    </div>
                                    <div className="col-3 text-right">
                                        <p className="m-b-0">{parseFloat(pendingProgressBar).toFixed(2)}%</p>
                                    </div>
                                </div>
                                <div className="progress m-t-30" style={{height: '7px'}}>
                                    <div className="progress-bar progress-c-theme2" role="progressbar" 
                                    style={{width: pendingProgressBar.concat("%")}} 
                                    aria-valuenow={pendingProgressBar} 
                                    aria-valuemin="0" aria-valuemax="100"/>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xl={4}>
                        <Card>
                            <Card.Body>
                                <h6 className='mb-4'>Total Money Sent</h6>
                                <div className="row d-flex align-items-center">
                                    <div className="col-9">
                                        <h3 className="f-w-300 d-flex align-items-center m-b-0"><i className="feather icon-arrow-up text-c-green f-30 m-r-5"/> {parseFloat(totalMoneySpent).toFixed(2)} ETH</h3>
                                    </div>

                                    <div className="col-3 text-right">
                                        <p className="m-b-0">{paymentProgressBar.substring(0, 5)}%</p>
                                    </div>
                                </div>
                                <div className="progress m-t-30" style={{height: '7px'}}>
                                    <div className="progress-bar progress-c-theme" role="progressbar" 
                                    style={{width: paymentProgressBar.concat("%")}} 
                                    aria-valuenow={paymentProgressBar} 
                                    aria-valuemin="0" aria-valuemax="100"/>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={12} xl={12}>
                        <Card className='Recent-Users'>
                            <Card.Header>
                                <Card.Title as='h5'>Pending Invoices</Card.Title>
                            </Card.Header>
                            <Card.Body className='px-0 py-2'>
                            <Table responsive hover>
                            <tbody>
                                {pendingData}
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
                                {settledData}
                            </tbody>
                            </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col md={4} xl={4}>
                        <Card className='card-social'>
                            <Card.Body className='border-bottom'>
                                <div className="row align-items-center justify-content-center">
                                    <div className="col-auto justify-content-center text-center">
                                        <i className="fab fa-facebook text-primary f-36"/>
                                        <p className="m-0">Facebook</p>
                                    </div>
                                    <div className="col text-right">
                                        <h4><i class="fab fa-ethereum"></i> 10</h4>
                                        <p className="text-c-green mb-0"><span className="text-muted">Total Amount to Pay</span></p>
                                    </div>
                                </div>
                            </Card.Body>
                            <Card.Body>
                                <div className="row align-items-center justify-content-center card-active">
                                    <div className="col-6">
                                        <h6 className="text-center m-b-10"><span className="text-muted m-r-5">Paid:</span> <i class="fab fa-ethereum"></i> 5</h6>
                                        <div className="progress">
                                            <div className="progress-bar progress-c-theme" role="progressbar" style={{width: '50%', height: '6px'}} aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"/>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <h6 className="text-center  m-b-10"><span className="text-muted m-r-5">Duration:</span>28 days</h6>
                                        <div className="progress">
                                            <div className="progress-bar progress-c-theme2" role="progressbar" style={{width: '10%', height: '6px'}} aria-valuenow="45" aria-valuemin="0" aria-valuemax="100"/>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} xl={4}>
                        <Card className='card-social'>
                            <Card.Body className='border-bottom'>
                                <div className="row align-items-center justify-content-center">
                                    <div className="col-auto justify-content-center text-center">
                                        <i className="fab fa-amazon text-dark f-36"/>
                                        <p className="m-0">Amazon</p>
                                    </div>
                                    <div className="col text-right">
                                        <h4><i class="fab fa-ethereum"></i> 5</h4>
                                        <p className="text-c-green mb-0"><span className="text-muted">Total Amount to Pay</span></p>
                                    </div>
                                </div>
                            </Card.Body>
                            <Card.Body>
                                <div className="row align-items-center justify-content-center card-active">
                                    <div className="col-6">
                                        <h6 className="text-center m-b-10"><span className="text-muted m-r-5">Paid:</span> <i class="fab fa-ethereum"></i> 0</h6>
                                        <div className="progress">
                                            <div className="progress-bar progress-c-theme" role="progressbar" style={{width: '1%', height: '6px'}} aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"/>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <h6 className="text-center  m-b-10"><span className="text-muted m-r-5">Duration:</span>12 days</h6>
                                        <div className="progress">
                                            <div className="progress-bar progress-c-theme2" role="progressbar" style={{width: '40%', height: '6px'}} aria-valuenow="45" aria-valuemin="0" aria-valuemax="100"/>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} xl={4}>
                        <Card className='card-social'>
                            <Card.Body className='border-bottom'>
                                <div className="row align-items-center justify-content-center">
                                    <div className="col-auto justify-content-center text-center">
                                        <i className="fab fa-google text-warning f-36"/>
                                        <p className="m-0">Google</p>
                                    </div>
                                    <div className="col text-right">
                                        <h4><i class="fab fa-ethereum"></i> 3</h4>
                                        <p className="text-c-green mb-0"><span className="text-muted">Total Amount to Pay</span></p>
                                    </div>
                                </div>
                            </Card.Body>
                            <Card.Body>
                                <div className="row align-items-center justify-content-center card-active">
                                    <div className="col-6">
                                        <h6 className="text-center m-b-10"><span className="text-muted m-r-5">Paid:</span> <i class="fab fa-ethereum"></i> 1.2</h6>
                                        <div className="progress">
                                            <div className="progress-bar progress-c-theme" role="progressbar" style={{width: '40%', height: '6px'}} aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"/>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <h6 className="text-center  m-b-10"><span className="text-muted m-r-5">Duration:</span>13 days</h6>
                                        <div className="progress">
                                            <div className="progress-bar progress-c-theme2" role="progressbar" style={{width: '75%', height: '6px'}} aria-valuenow="45" aria-valuemin="0" aria-valuemax="100"/>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                </Row>
            </Aux>
        );
    }
}

export default BillsDashboard;