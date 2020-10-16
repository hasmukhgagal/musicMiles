import React, { useState } from 'react';
import { Route, Redirect } from 'react-router-dom';

import Header from './Header';
import Footer from './Footer';
import SuperAdminPage from '../pages/dashboard/AdminHome';

import './layout.css';

const Layout = ({ component: Component, ...rest }) => {

  const [activeArtist, setActiveArtist] = useState(null)
  
  return (
    <Route
      {...rest}
      render={(props) =>
        localStorage.getItem('token') ? JSON.parse(localStorage.user).role === 'SUPERADMIN' ? <>
          <div className="horizontal-layout horizontal-menu 2-columns navbar-floating footer-static">
            <Header isSuperAdmin updateSelectedArtist={(artist) => {
              setActiveArtist(artist)
            }} />
            <div className="app-content content user">
              <div className="content-overlay"></div>
              <div className="header-navbar-shadow"></div>

              <div className="content-wrapper">
                <div className="content-header row"></div>
                  <SuperAdminPage {...props} />
              </div>
            </div>
            <Footer />
          </div>
        </> : (
          <div className="horizontal-layout horizontal-menu 2-columns navbar-floating footer-static">
            <Header updateSelectedArtist={(artist) => {
              setActiveArtist(artist)
            }} />
            <div className="app-content content user">
              <div className="content-overlay"></div>
              <div className="header-navbar-shadow"></div>

              <div className="content-wrapper">
                <div className="content-header row"></div>
                  {
                    activeArtist !== null ? 
                    <Component {...props} activeArtist={activeArtist} /> :
                    <div>
                      <div className="content-body" style={{
                        minHeight: '40vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>You have no artist, please get an artist.</div>
                    </div>
                  }
              </div>
            </div>
            <Footer />
          </div>
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )
      }
    />
  );
};

export default Layout;
