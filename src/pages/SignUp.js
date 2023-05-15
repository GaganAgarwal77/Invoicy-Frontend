import React from "react";
import { NavLink } from "react-router-dom";

import "../assets/scss/style.scss";
import Aux from "../hoc/_Aux";
import Breadcrumb from "../App/layout/AdminLayout/Breadcrumb";
import Dialog from "react-bootstrap-dialog";
import ApiService from "../services/ApiService";
class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      name: "",
      password: "",
      username: "",
      otp: "",
      isOtpRecieved: false,
    };
    this.signupHandler = this.signupHandler.bind(this);
    this.handleVerifyOTP = this.handleVerifyOTP.bind(this);
  }

  async handleVerifyOTP(e) {
    e.preventDefault();

    const bodyParameters = {
      email: this.state.email,
      otp: this.state.otp,
    };

    ApiService.postAuth("/verify/", bodyParameters, window.localStorage.getItem("token"))
      .then((response) => {
        console.log(response);
        this.dialog.showAlert("Account Verified Successfully!");
        this.props.history.push("/dashboard");
      })
      .catch((error) => {
        console.log(error);
        if (error.response) {
          this.dialog.showAlert(
            Object.values(error.response.data).flat().join("\n")
          );
        } else if (error.request) this.dialog.showAlert(error.request);
        else this.dialog.showAlert(error.message);
      });
  }

  async signupHandler(event) {
    const data = {
      company_name: this.state.name,
      username: this.state.username,
      email: this.state.email,
      password: this.state.password,
    };
    ApiService.post("/register/", data)
      .then((res) => {
        console.log(res);
        window.localStorage.setItem("token", res.data.token);
        window.localStorage.setItem("user_id", res.data.id);
        window.localStorage.setItem("company_name", res.data.company_name);
        window.localStorage.setItem("username", res.data.username);
        this.dialog.showAlert("OTP sent to user email successfully!");
        this.setState({ isOtpRecieved: true });
      })
      .catch((error) => {
        console.log(error);
        if (error.response) {
          this.dialog.showAlert(
            Object.values(error.response.data).flat().join("\n")
          );
        } else if (error.request) this.dialog.showAlert(error.request);
        else this.dialog.showAlert(error.message);
      });
  }

  handleChange(type, data) {
    const stateData = this.state;
    stateData[type] = data;
    console.log(type, data);
    this.setState({ stateData });
  }

  render() {
    return (
      <Aux>
        <Breadcrumb />
        <div className="auth-wrapper">
          <div className="auth-content">
            <div className="auth-bg">
              <span className="r" />
              <span className="r s" />
              <span className="r s" />
              <span className="r" />
            </div>
            <div className="card">
              <div className="card-body text-center">
                <div className="mb-4">
                  <i className="feather icon-user-plus auth-icon" />
                </div>
                <h3 className="mb-4">Sign up</h3>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Company Name"
                    value={this.state.name}
                    onChange={(e) => {
                      this.handleChange("name", e.target.value);
                    }}
                  />
                </div>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Username"
                    value={this.state.username}
                    onChange={(e) => {
                      this.handleChange("username", e.target.value);
                    }}
                  />
                </div>
                <div className="input-group mb-3">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Company Email"
                    value={this.state.email}
                    onChange={(e) => {
                      this.handleChange("email", e.target.value);
                    }}
                  />
                </div>
                <div className="input-group mb-4">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={this.state.password}
                    onChange={(e) => {
                      this.handleChange("password", e.target.value);
                    }}
                  />
                </div>
                {/* <div className="form-group text-left">
                                    <div className="checkbox checkbox-fill d-inline">
                                        <input type="checkbox" name="checkbox-fill-2" id="checkbox-fill-2"/>
                                            <label htmlFor="checkbox-fill-2" className="cr">Checkbox </label>
                                    </div>
                                </div> */}
                {this.state.isOtpRecieved && (
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div className="input-group mb-4">
                    <input
                      id="otp"
                      type="number"
                      name="otp"
                      placeholder="Enter OTP"
                      value={this.state.otp}
                      onChange={(e) => {
                        this.handleChange("otp", e.target.value);
                      }}
                      className="form-control"
                      style={{ marginRight: "20px" }}
                    />
                    </div>
                <button
                  className="btn btn-primary shadow-2 mb-4"
                  onClick={(e) => this.handleVerifyOTP(e)}
                >
                 Verify
                </button>
                  </div>
                )}
                <button
                  className="btn btn-primary shadow-2 mb-4"
                  onClick={(e) => this.signupHandler(e)}
                >
                  Sign up
                </button>
                <p className="mb-0 text-muted">
                  Already have an account? <NavLink to="/signin">Login</NavLink>
                </p>
                <Dialog
                  ref={(component) => {
                    this.dialog = component;
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Aux>
    );
  }
}

export default SignUp;
