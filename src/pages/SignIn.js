import React from 'react';
import {NavLink} from 'react-router-dom';

import '../assets/scss/style.scss';
import Aux from "../hoc/_Aux";
import Breadcrumb from "../App/layout/AdminLayout/Breadcrumb";

import ApiService from '../services/ApiService';
class SignUp extends React.Component {
    constructor (props) {
        super(props);
        this.state = {password: '', username: ''};
    }
    async signinHandler(event) {
        event.preventDefault();
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
            this.setState({ message: 'User logged in successfully.' });
            this.props.history.push('/dashboard');
        }).catch((error) => {
            console.log(error.response)
            if (error.response) {
                this.setState({ errorMessage: error.response.data.message, id: null });
            }
            else if (error.request) console.log(error.request);
            else console.log(error.message);
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
                                <button className="btn btn-primary shadow-2 mb-4" onClick={this.signinHandler.bind(this)}>Sign in</button>
                                <p className="mb-0 text-muted">Don't have an account? <NavLink to="/signup">Sign Up</NavLink></p>
                            </div>
                        </div>
                    </div>
                </div>
            </Aux>
        );
    }
}

export default SignUp;