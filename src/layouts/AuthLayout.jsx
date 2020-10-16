import React from 'react';
import { Route } from 'react-router-dom';

function AuthRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) => (
        <div className="horizontal-layout horizontal-menu 1-column navbar-floating footer-static bg-full-screen-image blank-page">
          <div className="app-content content">
            <div className="content-overlay"></div>
            {/* <div className="header-navbar-shadow"></div> */}

            <div className="content-wrapper">
              <div className="content-header row"></div>
              <Component {...props} {...rest}/>
            </div>
          </div>
        </div>
      )}
    />
  );
}

export default AuthRoute;
