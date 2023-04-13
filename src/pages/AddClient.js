import React from 'react';
import {Row, Col, Card, Form, Table, Button, InputGroup, FormControl} from 'react-bootstrap';

import Aux from "../hoc/_Aux";


import avatar2 from '../assets/images/user/avatar-2.jpg';

import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import RangeSlider from 'react-bootstrap-range-slider';
import Dialog from 'react-bootstrap-dialog';
import ApiService from '../services/ApiService';

class BillsDashboard extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
          companyId: window.localStorage.getItem("user_id"),
          discount: 20,
          clients: [],
          clientID: 0,
          client: {},
        };
    }

    // async fetchAccount(){
    //     const companyId = window.localStorage.getItem("user_id");
    //     if(companyId > 0) {
    //         this.setState({companyId: companyId});
    //     }
    //     else{
    //         this.props.history.push('/');
    //     }
    // }
    async addClient(){
        const clientID = this.state.clientID;
        const discount = this.state.discount;
        if(clientID === '') {
            this.dialog.showAlert(`Client '${clientID}' is an invalid clientID`);
            return;
        }
        const result = await ApiService.postAuth('/add-client/', {client: clientID, discount: discount, blocked: false}, window.localStorage.getItem("token"));
        console.log(result);
        if (result) {
            this.dialog.showAlert(`Client '${clientID}' added successfully!`);
            this.props.history.push('/dashboard');
        }
        else {
            this.addClient.showAlert(`Something went wrong!`);
        }
    }

    async getClients(){
        try{
            const res = await ApiService.get('/fetch-users/');
            const companies = res.data;
            console.log(companies);
            companies.forEach(company => {
                const client = {'id': company.id, 'data': company}
                this.setState({
                    clients: [...this.state.clients, client]
                });
            })

        } catch(e){
            console.log(e);
        }
    }

    componentDidMount() {
        this.getClients();
    }  

    render() {
        let suggestedClients = [];
        this.state.clients.forEach(client => {
            suggestedClients.push(
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
                </tr>
            );
        });

        return (
          <Aux>
            <Row>
              <Col md={3}></Col>
              <Col md={6}>
                {this.state.companyId && (
                  <div>
                    <Form.Group>
                      <Form.Control
                        as="select"
                        defaultValue="1"
                        onChange={(e) =>{
                            console.log(e.target.value);
                            this.setState({ clientID: e.target.value })
                         } }
                      >
                        {this.state.clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.data.company_name}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                    <Form.Label htmlFor="customRange1">
                      Discount for the client
                    </Form.Label>
                    <RangeSlider
                      value={this.state.discount}
                      onChange={(e) =>
                        this.setState({ discount: e.target.value })
                      }
                    />

                    <InputGroup.Append>
                      <Button onClick={() => this.addClient()}>Add</Button>
                      <Dialog
                        ref={(component) => {
                          this.dialog = component;
                        }}
                      />
                    </InputGroup.Append>
                  </div>
                )}
              </Col>

              <Col md={12} xl={12} className="mt-5">
                <Card className="Recent-Users">
                  <Card.Header>
                    <Card.Title as="h5">Suggested Clients</Card.Title>
                  </Card.Header>
                  <Card.Body className="px-0 py-2">
                    <Table responsive hover>
                      <tbody>{suggestedClients}</tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Aux>
        );
    }
}

export default BillsDashboard;