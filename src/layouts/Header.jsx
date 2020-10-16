/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-globals */
import React, { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useHistory } from 'react-router-dom';
import { AuthService, AxiosService } from '../services';
import ListArtist from '../components/listArtist';


function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function Header({ updateSelectedArtist, isSuperAdmin }) {
  const wrapperRef = useRef(null);
  const myArtistDropDownRef = useRef(null);

  const history = useHistory();
  const [showList, setShowList] = useState(false);
  const [myArtistDropDown, toggleMyArtistDropDown ] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const [ myArtists, setMyArtists] = useState([]);
  const [ activeArtist, setActiveArtist] = useState(null);
  const prevArtist = usePrevious(activeArtist)

  useEffect(() => {
    if(myArtists.length) {
      if(prevArtist && prevArtist._id !== activeArtist) {
        console.info('same ar previous...')
      } else {
        setActiveArtist(myArtists[0]);
      }
    }
  }, [myArtists])
  
  useEffect(() => {
    updateSelectedArtist(activeArtist)
  }, [activeArtist])

  async function logout() {
    const response = await AuthService.logout();
    if (response) {
      history.push('/login');
    }
  }

  useEffect(() => {
    // add when mounted
    // get me artist
    if(!isSuperAdmin) {
      getArtistAssociation();
    }
    document.addEventListener("mousedown", handleOutSideClick);
    // return function to be called when unmounted
    return () => {
      document.removeEventListener("mousedown", handleOutSideClick);
    };
  }, []);

  const handleOutSideClick = (e) => {
    if (wrapperRef.current && wrapperRef.current.contains(e.target)) {
      // inside click
      return;
    } else {
      setShowList(false)
    }
    if(myArtistDropDownRef.current && myArtistDropDownRef.current.contains(e.target)) {
      return;
    } else {
      toggleMyArtistDropDown(false)
    }
  }

  useEffect(() => {
    spotifyAuth();
  });

  const spotifyAuth = async () => {
    if(window.location.search) {
      const token = window.location.search
        .substring(1)
        .split('&')
        .reduce(function (initial, item) {
          if (item) {
            var parts = item.split("=");
            if(parts && parts.length > 1)
            initial[parts[0]] = decodeURIComponent(parts[1]);
          }
          return initial;
        }, {});
        try {
          await AuthService.spotifyAuth({ code : token.code });
          window.open('', '_self').close();
        } catch (error) {
          console.log("Header -> error", error)
          // window.open('', '_self').close();
        }
    }
  }

  async function spotifyConnect() {
    console.log("spotifyConnect -> process.env", process.env)
    const url = `${process.env.REACT_APP_SPOTIFY_AUTH_ENDPOINT}?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&scope=user-top-read&response_type=code&show_dialog=true`
    const myWidth = 400;
      const myHeight = 400;
      const left = (screen.width - myWidth) / 2;
      const top = (screen.height - myHeight) / 4;
      window.open(
        `${url}`,
        '',
        `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${myWidth}, height=${myHeight}, top=${top}, left=${left}`,
      );
  }

  const saveArtistAssociation = (artists, artistAssociated) => {
    console.info(artists)
    if(artistAssociated) {
      AxiosService.patch(`/artist/remove-association/${artists[0]}`).then(() => {
        getArtistAssociation();
      }).catch(e => {
        console.error(e)
      })
    } else {
      AxiosService.post('/user/me/save-association', {
        artists
      }).then(() => {
        getArtistAssociation();
      }).catch(e => {
        console.error(e)
      })
    }
  }

  const getArtistAssociation= () => {
    AxiosService.get('/user/me/get-association').then(res => {
      setMyArtists(res.artists);
    }).catch(e => {
      console.error(e)
    })
  }

  return (
    <div>
      <nav className="header-navbar navbar-expand-lg navbar navbar-with-menu navbar-fixed navbar-shadow navbar-brand-center">
        <div className="navbar-header d-xl-block d-none">
          <ul className="nav navbar-nav flex-row">
            <li className="nav-item">
              <Link to="/">
                <div className="navbar-brand">
                  <div className="brand-logo"></div>
                </div>
              </Link>
            </li>
            {
                !isSuperAdmin && activeArtist && <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '10px'
                }} className={`dropdown${myArtistDropDown ? ' show' : ''}`}>
                  <span className="btn btn-sm btn-outline-primary active dropdown-toggle" onClick={() => toggleMyArtistDropDown(!myArtistDropDown)}>
                  {activeArtist.name}
                  </span>
                  {
                    <div className="dropdown-menu" ref={myArtistDropDownRef} style={{
                      minWidth: '250px',
                      padding: '10px'
                    }}>
                      <select
                        placeholder="select Artist"
                        className="form-control"
                        onChange={({ target: { value }}) => {
                          setActiveArtist(myArtists.find(ar => ar._id === value));
                          toggleMyArtistDropDown(false);
                        }}
                      >
                        {
                          myArtists.map(item => {
                            return <option value={item._id} key={item._id}>{item.name}</option> 
                          })
                        }
                      </select>
                    </div>
                  }
                </li>
              }
          </ul>
        </div>
        <div className="navbar-wrapper">
          <div className="navbar-container content">
            <div className="navbar-collapse" id="navbar-mobile">
              <div className="mr-auto float-left bookmark-wrapper d-flex align-items-center"></div>
              <ul className="nav navbar-nav float-right">
                {!isSuperAdmin && <li className={`dropdown${ showList ? ' show' : ''}`}>
                  <button type="button" className="btn btn-outline-primary my-1 mr-1" onClick={() => {
                    setShowList(!showList);
                  }}>View Artist</button>
                  <div className="dropdown-menu" ref={wrapperRef}>
                    <ListArtist onSave={saveArtistAssociation} />
                  </div>
                </li>}
                {!isSuperAdmin &&  <li>
                  <NavLink to="/" exact activeClassName="active" className="btn btn-outline-primary my-1 mr-1">
                    Dashboard
                  </NavLink>
                </li>}
                {/* <li>
                  {
                   !user.spotify && (<button type="button" className="btn btn-outline-primary my-1 mr-1" onClick={() => { spotifyConnect();}}>
                   Claim Your Profile
                    </button>) 
                  }
                </li> */}
                <NavLink to="/rewards" exact activeClassName="active" className="btn btn-outline-primary my-1 mr-1">
                    Manage Rewards
                  </NavLink>
                {/* {!isSuperAdmin && <li>
                  <NavLink to="/benefit" activeClassName="active" className="btn btn-outline-primary my-1 mr-1">
                    + Add Benefit
                  </NavLink>
                </li>} */}
                <li>
                  <button type="button" className="btn btn-outline-primary my-1 mr-1">
                    Help
                  </button>
                </li>
                <li>
                  <button type="button" className="btn btn-outline-primary my-1 mr-1">
                    Contact Us
                  </button>
                </li>
                <li className="dropdown dropdown-user nav-item m-auto">
                  <a className="dropdown-toggle nav-link dropdown-user-link" href="#" data-toggle="dropdown">
                    <div className="user-nav d-sm-flex d-none">
                      <span className="user-name text-bold-600">{user.firstName}</span>
                      <span className="user-status">{user.email}</span>
                    </div>
                    <span>
                      <i className="feather icon-user" style={{
                        color: 'white',
                        background: 'var(--primary)',
                        borderRadius: '50%',
                        padding: '15px'
                      }} />
                    </span>
                  </a>
                  <div className="dropdown-menu dropdown-menu-right">
                    {/* <a className="dropdown-item" href="page-user-profile.html">
                      <i className="feather icon-user"></i> Edit Profile
                    </a>
                    <a className="dropdown-item" href="app-email.html">
                      <i className="feather icon-mail"></i> My Inbox
                    </a>
                    <a className="dropdown-item" href="app-todo.html">
                      <i className="feather icon-check-square"></i> Task
                    </a>
                    <a className="dropdown-item" href="app-chat.html">
                      <i className="feather icon-message-square"></i> Chats
                    </a>
                    <div className="dropdown-divider"></div> */}
                    <a className="dropdown-item" onClick={logout}>
                      <i className="feather icon-power"></i> Logout
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Header;
