import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { AuthService } from '../../services';

function VerifyEmail() {
  const history = useHistory();

  const [code, setCode] = useState('');

  async function verifyEmail(event) {
    event.preventDefault();

    const response = await AuthService.verifyEmail({ code });
    if (response) {
      history.push('/login');
    }
  }

  return (
    <div>
      <div className="content-body">
        <section className="row flexbox-container">
          <div className="col-xl-7 col-md-9 col-10 d-flex justify-content-center px-0">
            <div className="card bg-authentication rounded-0 mb-0">
              <div className="row m-0">
                <div className="col-lg-6 d-lg-block d-none text-center align-self-center">
                  <img src="../../../app-assets/images/pages/forgot-password.png" alt="branding logo" />
                </div>
                <div className="col-lg-6 col-12 p-0">
                  <div className="card rounded-0 mb-0 px-2 py-1">
                    <div className="card-header pb-1">
                      <div className="card-title">
                        <h4 className="mb-0">Verify your account</h4>
                      </div>
                    </div>
                    {/* <p className="px-2 mb-0">Please enter your verification code and we'll send you instructions on how to reset your password.</p> */}
                    <p className="px-2 mb-0">Please enter the verification code we have sent to your registered email address.</p>
                    <div className="card-content">
                      <div className="card-body">
                        <form onSubmit={verifyEmail}>
                          <div className="form-label-group">
                            <input
                              type="code"
                              id="code"
                              className="form-control"
                              placeholder="Verification code"
                              required
                              value={code}
                              onChange={(e) => setCode(e.target.value)}
                            />
                            <label for="code">Verification code</label>
                          </div>
                          {/* <div className="float-md-left d-block mb-1">
                            <Link to="/login">
                              <button className="btn btn-outline-primary btn-block px-75">Back to Login</button>
                            </Link>
                          </div> */}
                          <div className="float-md-right d-block mb-1">
                            <button type="submit" className="btn btn-primary btn-block px-75">
                              Verify
                            </button>
                          </div>
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

export default VerifyEmail;
