import React from 'react';
import {Row, Col, Card, Table, Button, Collapse} from 'react-bootstrap';
import {Link} from 'react-router-dom';

import Aux from "../hoc/_Aux";


import avatar2 from '../assets/images/user/avatar-2.jpg';

import NVD3Chart from 'react-nvd3';
import Dialog from 'react-bootstrap-dialog';
import ApiService from '../services/ApiService';


const pieChartData = [
    {key: "50% Advance", y: 40, color: "#1ddec5"},
    {key: "100% Advance", y: 30, color: "#1dcfda"},
    {key: "100% Postwork", y: 30, color: "#20c997"},
];

function lineChart() {
    var raised = [],
        pending = [];
    for (var i = 0; i < 10; i++) {
        raised.push({
            'x': i,
            'y': parseInt(15*(Math.sin(i/1.5) * 0.25 + 0.5))
        });
        pending.push({
            'x': i,
            'y': parseInt(3/Math.abs((Math.sin(i/20))+0.5))
        });
    }
    return [
        {
            values: raised,
            key: 'Invoices Raised',
            color: '#239f1c',
            area: true
        },
        {
            values: pending,
            key: 'Pending Invoices',
            color: '#F45d55',
            area: true
        }
    ];
}


class Dashboard extends React.Component {

    constructor (props) {
        super(props);        
        this.state = {
          companyId: window.localStorage.getItem("user_id"),
          clients: [],
          topInvoices: [],
          isBlockedClientsCollapsed: false,
        };
    }

    /*Set both clients and topInvoices state vars*/
    async getClients(){
        const currentCompanyId = this.state.companyId;
        try{
            let res1 = await ApiService.getAuth('/fetch-clients/', window.localStorage.getItem("token"));
            const clients = res1.data;
            console.log(clients);
            clients.forEach(async client => {
                const companyId = client.client
                let res2 = await ApiService.getAuth(`/users/id/${companyId}/`, window.localStorage.getItem("token"));
                const company = res2.data;
                console.log(company);
                let res3 = await ApiService.getAuth(`/client-invoice/${companyId}/`, window.localStorage.getItem("token"));
                const invoices = res3.data;
                console.log(invoices);
                invoices.forEach(invoice => {
                    invoice = {...invoice, 'clientName': company.company_name, 'clientEmail': company.email }
                    this.setState({
                        topInvoices:[...this.state.topInvoices, invoice]
                    });
                })

                const data = {
                    "clientId" : client.client,
                    "blocked" : client.blocked,
                    "discount" : client.discount,
                    "name" : company.company_name,
                    "numInvoices": invoices.length,
                    "email": company.email,
                    "username" : company.username,
                }
                const newClient = {'id': client.client, 'data': data}
                this.setState({
                    clients: [...this.state.clients, newClient]
                });
    
            })
            

        } catch(e){
            console.log(e);
        }
    }

    componentDidMount() {
        this.getClients();
    }  

    compareFilterTopInvoices(a, b){
        if(a.dueAmount < b.dueAmount) return 1;
        if(a.dueAmount > b.dueAmount) return -1;
        return 0;
    }

    // Sorts in desc order based on dueAmount. Returns only top 5 results
    filterTopInvoices(){
        let invoices = this.state.topInvoices;
        invoices.sort(this.compareFilterTopInvoices);
        return invoices.slice(0,5);
    }

    viewDetails(invoice) {
        this.props.history.push({
            pathname: '/view-invoice/',
            state: { invoice: invoice }
        })
    }
    async updateWorkStatus(invoiceId) {
        const result = await ApiService.patchAuth(`/invoice/${invoiceId}/`, {workCompleted: "true", note: "some note"}, window.localStorage.getItem("token"));
        console.log(result)
        if(result) {
            this.dialog.showAlert('Success!');
            window.location.reload();
        }
        else {
            this.dialog.showAlert('Something went wrong!');
        }
    }
    render() {       
        let topPendingInvoices = [];
        let clients = [];
        let blockedClients = [];


        let invoices = this.filterTopInvoices();
        // let pendingInvoices = 
        invoices.forEach(invoice => {
            topPendingInvoices.push(
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
                        <button style={{border: 0}} onClick={() => {this.dialog.showAlert("Reminder sent!")}} className="label theme-bg text-white f-12">Remind</button>
                        <Dialog ref={(component) => { this.dialog = component }} />
                    </td>
                </tr>
            );
        })

        this.state.clients.forEach(client => {
            if(!client.data.blocked) {
                clients.push(
                <tr className="unread" key = {client.id}>
                    <td><img className="rounded-circle" style={{width: '40px'}} src={avatar2} alt="activity-user"/></td>
                    <td>
                        <p className="m-0">{client.data.username}</p>
                    </td>
                    <td>
                        <p className="m-0">{client.data.company_name}</p>
                    </td>
                    <td>
                        <p className="m-0">{client.data.email}</p>
                    </td>
                    <td>
                        <p className="m-0">Discount: {client.data.discount}%</p>
                    </td>
                    <td>
                        <h6 className="text-muted">{client.data.numInvoices} Invoices</h6>
                    </td>
                    <td>
                        <Link to={'/clients/'+client.data.clientId} className="label theme-bg text-white f-12">View Details</Link>
                    </td>
                </tr>
                );
            }
            else {
                blockedClients.push(
                <tr className="unread" key = {client.id}>
                    <td><img className="rounded-circle" style={{width: '40px'}} src={avatar2} alt="activity-user"/></td>
                    <td>
                        <p className="m-0">{client.data.username}</p>
                    </td>
                    <td>
                        <p className="m-0">{client.data.company_name}</p>
                    </td>
                    <td>
                        <p className="m-0">{client.data.email}</p>
                    </td>
                    <td>
                        <p className="m-0">{client.data.discount}</p>
                    </td>
                    <td>
                        <h6 className="text-muted">{client.data.numInvoices} Invoices</h6>
                    </td>
                    <td>
                        <Link to={'/clients/'+client.data.clientId} className="label theme-bg text-white f-12">View Details</Link>
                    </td>
                </tr>
                );
            }
        });

        return (
            <Aux>
                <Row>
                    {/* Row 1 */}
                    <Col md={6} xl={4}>
                        <Card>
                            <Card.Body>
                                <h6 className='mb-4'>Total Invoices Generated</h6>
                                <div className="row d-flex align-items-center">
                                    <div className="col-9">
                                        <h3 className="f-w-300 d-flex align-items-center m-b-0"><i className="feather icon-file-text f-30 m-r-5"/>{this.state.topInvoices.length}</h3>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} xl={4}>
                        <Card>
                            <Card.Body>
                                <h6 className='mb-4'>Total Pending Invoices</h6>
                                <div className="row d-flex align-items-center">
                                    <div className="col-9">
                                        <h3 className="f-w-300 d-flex align-items-center m-b-0"><i className="feather icon-file-text text-c-red f-30 m-r-5"/>{topPendingInvoices.length}</h3>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xl={4}>
                        <Card>
                            <Card.Body>
                                <h6 className='mb-4'>Total Clients</h6>
                                <div className="row d-flex align-items-center">
                                    <div className="col-9">
                                        <h3 className="f-w-300 d-flex align-items-center m-b-0"><i className="feather icon-users f-30 m-r-5"/> {this.state.clients.length}</h3>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Row 2 */}
                    <Col md={6} xl={6}>
                        <Card>
                            <Card.Header>
                                <Card.Title as="h5">Types of Invoices Raised <small>Distribution</small></Card.Title>
                            </Card.Header>
                            <Card.Body className="text-center">
                            <NVD3Chart id="chart" height={300} type="pieChart" datum={pieChartData} x="key" y="y"  />
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} xl={6}>
                        <Card className='Recent-Users'>
                            <Card.Header>
                                <Card.Title as='h5'>Invoices Raised<small> [In last 10 days]</small></Card.Title>
                            </Card.Header>
                            <Card.Body className="text-center">
                                <div>
                                    {
                                        React.createElement(NVD3Chart, {
                                            xAxis: {
                                                tickFormat: function(d){ return d; },
                                                axisLabel: 'Time (days)'
                                            },
                                            yAxis: {
                                                axisLabel: 'Invoices Count',
                                                tickFormat: function(d) {return parseFloat(d).toFixed(2); }
                                            },
                                            type:'lineChart',
                                            datum: lineChart(),
                                            x: 'x',
                                            y: 'y',
                                            height: 300,
                                            renderEnd: function(){
                                                console.log('renderEnd');
                                            }
                                        })
                                    }
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    {/* Row 3 */}
                    <Col md={12} xl={12}>
                        <Card className='Recent-Users'>
                            <Card.Header>
                                <Card.Title as='h5'>Most Important Invoices</Card.Title>
                            </Card.Header>
                            <Card.Body className='px-0 py-2'>
                            <Table responsive hover>
                            <tbody>
                                {topPendingInvoices}
                            </tbody>
                            </Table>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Row 4 */}
                    <Col md={12} xl={12}>
                        <Card className='Recent-Users'>
                            <Card.Header>
                                <Card.Title as='h5'>Clients <Link to="/add-client/"><i className="feather icon-plus-circle f-15 m-r-5"/></Link></Card.Title>
                            </Card.Header>
                            <Card.Body className='px-0 py-2'>
                            <Table responsive hover>
                            <tbody>
                                {clients}
                            </tbody>
                            </Table>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Row 5 */}
                    <Col md={12} xl={12}>
                        <Card className='Recent-Users justify-content-center text-center'>
                            <Card.Header>
                                <Button onClick={() => this.setState({ isBlockedClientsCollapsed: !this.state.isBlockedClientsCollapsed })}>
                                {
                                    !this.state.isBlockedClientsCollapsed &&
                                    "View Blocked clients"
                                }
                                {
                                    this.state.isBlockedClientsCollapsed &&
                                    "Close Blocked clients"
                                }
                                </Button>
                            </Card.Header>
                            <Collapse in={this.state.isBlockedClientsCollapsed}>
                                <div id="basic-collapse">
                                    <Card.Body className='px-0 py-2'>
                                        <Table responsive hover>
                                            <tbody>
                                                {blockedClients}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </div>
                            </Collapse>
                        </Card>
                    </Col>

                </Row>
            </Aux>
        );
    }
}

export default Dashboard;