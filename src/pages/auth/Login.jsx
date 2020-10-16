import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { AuthService, AxiosService, FirebaseService } from '../../services';
import './styles.css';

function Login() {
  const history = useHistory();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function login(event) {
    event.preventDefault();

    const response = await AuthService.login({ email, password });
    if (response) {
      if (response.user.isVerified) {
        history.push('/');
      } else {
        history.push('/verify-email');
      }
    }
  }

  return (
    <div>
      <div className="content-body">
        <section className="row flexbox-container">
          <div className="d-flex justify-content-center" style={{margin: '0 auto'}}>
            <div className="card bg-authentication rounded-0">
              <div className="row m-0">
                <div className="col-lg-6 d-lg-block d-none text-center align-self-center px-1 py-0">
                  <img src="../../../app-assets/images/pages/login.png" alt="branding logo" />
                </div>
                <div className="col-lg-6 col-12 p-0">
                  <div className="card rounded-0 mb-0 px-2">
                    <div className="card-header pb-1">
                      <div className="card-title">
                        <h4 className="mb-0">Login</h4>
                      </div>
                    </div>
                    <p className="px-2">Welcome back, please login to your account.</p>
                    <div className="card-content">
                      <div className="card-body pt-1">
                        <form onSubmit={login}>
                          <fieldset className="form-label-group form-group position-relative has-icon-left">
                            <input
                              type="text"
                              className="form-control"
                              id="email"
                              placeholder="Email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                            <div className="form-control-position">
                              <i className="feather icon-user"></i>
                            </div>
                            <label htmlFor="email">Email</label>
                          </fieldset>

                          <fieldset className="form-label-group position-relative has-icon-left">
                            <input
                              type="password"
                              className="form-control"
                              id="password"
                              placeholder="Password"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="form-control-position">
                              <i className="feather icon-lock"></i>
                            </div>
                            <label htmlFor="password">Password</label>
                          </fieldset>
                          <div className="form-group d-flex justify-content-between align-items-center">
                            <div className="text-left">
                              <fieldset className="checkbox">
                                <div className="vs-checkbox-con vs-checkbox-primary">
                                  <input type="checkbox" />
                                  <span className="vs-checkbox">
                                    <span className="vs-checkbox--check">
                                      <i className="vs-icon feather icon-check"></i>
                                    </span>
                                  </span>
                                  <span className="">Remember me</span>
                                </div>
                              </fieldset>
                            </div>
                            <div className="text-right">
                              <Link to="/forgot-password">
                                <a className="card-link">Forgot Password?</a>
                              </Link>
                            </div>
                          </div>
                          <Link to="/register">
                            <button type="button" className="btn btn-outline-primary float-left btn-inline">
                              Register
                            </button>
                          </Link>
                          <button type="submit" className="btn btn-primary float-right btn-inline">
                            Login
                          </button>
                        </form>
                      </div>
                    </div>
                    <div className="login-footer">
                      <div className="divider">
                        <div className="divider-text">OR</div>
                      </div>
                      <div className="footer-btn d-inline">
                        <button onClick={FirebaseService.signInWithFacebook} className="btn btn-facebook">
                          <span className="fa fa-facebook"></span>
                        </button>
                        <button onClick={FirebaseService.signInWithTwitter} className="btn btn-twitter white">
                          <span className="fa fa-twitter"></span>
                        </button>
                        <button onClick={FirebaseService.signInWithGoogle} className="btn btn-google">
                          <span className="fa fa-google"></span>
                        </button>
                        {/* <button onClick={FirebaseService.signInWithGoogle} className="btn btn-github">
                          <span className="fa fa-github-alt"></span>
                        </button> */}
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

export default Login;
