import React from 'react';
import {Link} from 'react-router-dom';

import '../assets/scss/style.scss';
import Aux from "../hoc/_Aux";
import Breadcrumb from "../App/layout/AdminLayout/Breadcrumb";
import Dialog from 'react-bootstrap-dialog';

class Landing extends React.Component {

    constructor (props) {
        super(props);
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
                                    <i className="feather icon-clipboard auth-icon"/>
                                </div>
                                <h3 className="mb-4">Welcome to Invoicy</h3>
                                <p className="mb-4">Invoice management systemized!</p>
                                <Link to="/signup" className="btn btn-primary shadow-2 mb-4" 
                                    style={{color: 'white', fontWeight: 'normal'}}>
                                    Sign up
                                </Link>
                                <Link to="/signin" className="btn btn-primary shadow-2 mb-4" 
                                    style={{color: 'white', fontWeight: 'normal'}}>
                                    Sign in
                                </Link>
                                <Dialog ref={(component) => { this.dialog = component }} />
                            </div>
                        </div>
                    </div>
                </div>
            </Aux>
        );
    }
}

export default Landing;