import React from 'react';
import {NavLink} from 'react-router-dom';

import '../assets/scss/style.scss';
import Aux from "../hoc/_Aux";
import Breadcrumb from "../App/layout/AdminLayout/Breadcrumb";
import Dialog from 'react-bootstrap-dialog';
import ApiService from '../services/ApiService';
class SignIn extends React.Component {
    constructor (props) {
        super(props);
        this.state = {password: '', username: ''};
        this.signinHandler = this.signinHandler.bind(this);
    }
    async signinHandler(event) {
        const data = {
            "username": this.state.username,
            "password": this.state.password
        }
        ApiService.post('/login/', data)
        .then(res => {
            console.log(res);
            window.localStorage.setItem('token', res.data.token);
            window.localStorage.setItem('user_id', res.data.user_id);
            window.localStorage.setItem('username', res.data.username);
            window.localStorage.setItem('company_name', res.data.company_name);
            this.dialog.showAlert('User logged in successfully.!');
            this.props.history.push('/dashboard');
        }).catch((error) => {
            console.log(error)
            if (error.response) {
                this.dialog.showAlert(error.response.data.non_field_errors);
            }
            else if (error.request) this.dialog.showAlert(error.request);
            else this.dialog.showAlert(error.message);
        });
    }

    handleChange(type, data)   {
        const stateData = this.state;
        stateData[type] = data;
        console.log(type, data);
        this.setState({ stateData });
    }

    render () {
        return(
            <Aux>
                <Breadcrumb/>
                <div className="auth-wrapper">
                    <div className="auth-content">
                        <div className="auth-bg">
                            <span className="r"/>
                            <span className="r s"/>
                            <span className="r s"/>
                            <span className="r"/>
                        </div>
                        <div className="card">
                            <div className="card-body text-center">
                                <div className="mb-4">
                                    <i className="feather icon-user-plus auth-icon"/>
                                </div>
                                <h3 className="mb-4">Sign in</h3>

                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" placeholder="Username"  value={this.state.username} onChange={e => {this.handleChange("username", e.target.value)}}/>
                                </div>
                                <div className="input-group mb-4">
                                    <input type="password" className="form-control" placeholder="Password"  value={this.state.password} onChange={e => {this.handleChange("password", e.target.value)}}/>
                                </div>
                                <button className="btn btn-primary shadow-2 mb-4" onClick={(e) => this.signinHandler(e)}>Sign in</button>
                                <p className="mb-0 text-muted">Don't have an account? <NavLink to="/signup">Sign Up</NavLink></p>
                                <Dialog ref={(component) => { this.dialog = component }} />
                            </div>
                        </div>
                    </div>
                </div>
            </Aux>
        );
    }
}

export default SignIn;