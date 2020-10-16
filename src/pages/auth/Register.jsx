import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { AuthService } from '../../services';

function Register() {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  async function register(event) {
    event.preventDefault();

    const response = await AuthService.register({
      email,
      password,
      firstName,
      lastName,
      source: 'custom',
      role: 'MANAGERS',
    });

    if (response) {
      history.push('/verify-email');
    }
  }

  return (
    <div>
      <div className="content-body">
        <section className="row flexbox-container">
          <div className="d-flex justify-content-center" style={{margin: '0 auto'}}>
            <div className="card bg-authentication rounded-0">
              <div className="row m-0">
                <div className="col-lg-6 d-lg-block d-none text-center align-self-center pl-0 pr-3 py-0">
                  <img src="../../../app-assets/images/pages/register.jpg" alt="branding logo" />
                </div>
                <div className="col-lg-6 col-12 p-0">
                  <div className="card rounded-0 mb-0 p-2">
                    <div className="card-header pt-50 pb-1">
                      <div className="card-title">
                        <h4 className="mb-0">Create Account</h4>
                      </div>
                    </div>
                    <p className="px-2">Fill the below form to create a new account.</p>
                    <div className="card-content">
                      <div className="card-body pt-0">
                        <form onSubmit={register}>
                          <div className="form-label-group">
                            <input
                              type="text"
                              id="firstName"
                              className="form-control"
                              placeholder="First Name"
                              required
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                            />
                            <label for="firstName">First Name</label>
                          </div>
                          <div className="form-label-group">
                            <input
                              type="text"
                              id="lastName"
                              className="form-control"
                              placeholder="Last Name"
                              required
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                            />
                            <label for="lastName">Last Name</label>
                          </div>
                          <div className="form-label-group">
                            <input
                              type="email"
                              id="inputEmail"
                              className="form-control"
                              placeholder="Email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                            <label for="inputEmail">Email</label>
                          </div>
                          <div className="form-label-group">
                            <input
                              type="password"
                              id="password"
                              className="form-control"
                              placeholder="Password"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                            <label for="password">Password</label>
                          </div>
                          {/* <div className="form-label-group">
                            <input
                              type="password"
                              id="inputConfPassword"
                              className="form-control"
                              placeholder="Confirm Password"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                            <label for="inputConfPassword">Confirm Password</label>
                          </div> */}
                          <div className="form-group row">
                            <div className="col-12">
                              <fieldset className="checkbox">
                                <div className="vs-checkbox-con vs-checkbox-primary">
                                  <input type="checkbox" checked />
                                  <span className="vs-checkbox">
                                    <span className="vs-checkbox--check">
                                      <i className="vs-icon feather icon-check"></i>
                                    </span>
                                  </span>
                                  <span className=""> I accept the terms & conditions.</span>
                                </div>
                              </fieldset>
                            </div>
                          </div>
                          <Link to="/login">
                            <button type="button" className="btn btn-outline-primary float-left btn-inline mb-50">
                              Login
                            </button>
                          </Link>
                          <button type="submit" className="btn btn-primary float-right btn-inline mb-50">
                            Register
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;
