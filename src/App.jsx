import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch } from 'react-router-dom';

import './App.css';

import Layout from './layouts/Layout';
import AuthLayout from './layouts/AuthLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import Apple from './pages/auth/apple';
import Home from './pages/dashboard/Home';
import Benefit from './pages/benefit/Benefit';
import Rewards from './pages/rewards';
import Test from './pages/auth/test';
import MusicProvider from './core/appleMusicProvide';
import { AppleService } from './services';

function App() {
  const [data, setData] = useState({
    musicInstance: [],
  });

  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = async () =>  {
    const { token } = await AppleService.getAppleToken();
    let musicProvider = MusicProvider.sharedProvider();
    musicProvider.configure(token);
    let musicInstance = musicProvider.getMusicInstance();
    setData({
      musicInstance
    });
  }
  return (
    <div>
      <Router>
        <Switch>
          <Layout exact path="/" component={Home} />
          <Layout path="/benefit" component={Benefit} />
          <Layout path="/rewards" component={Rewards} />

          <AuthLayout path="/login" component={Login} />
          <AuthLayout path="/register" component={Register} />
          <AuthLayout path="/verify-email" component={VerifyEmail} />
          <AuthLayout path="/forgot-password" component={ForgotPassword} />
          <AuthLayout path="/apple-auth" component={Apple} musicInstance={data.musicInstance}/>
          <AuthLayout path="/download" component={Test} musicInstance={data.musicInstance}/>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
