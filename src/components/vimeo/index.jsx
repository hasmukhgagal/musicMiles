import React, { useState, useEffect } from 'react';
import { popup } from 'popup-tools';
import Pagination from "react-js-pagination";
import InputControl from '../form-control/Input';
import { AlertService, AxiosService } from '../../services';


const VimeoConnect = ({selectedVideo, onSelect}) => {
    const [vimeoAccessToken, setVimeAccessToken] = useState(localStorage.getItem('vimeoToken') ||  null);
    const [vimeoVideoDetails, setVimeoVideoDetails ] = useState({
      page: 1
    });
    const [searchQuery, setSearchQuery] = useState(null);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      let vimeo = JSON.parse(localStorage.user).vimeo
      if(vimeo && vimeo.accessToken) {
        setVimeAccessToken(vimeo.accessToken);
      }
    }, [])
  
    useEffect(() => {
      if(!!vimeoAccessToken) {
        getVimeoVideosOfUser(1);
      }
    }, [vimeoAccessToken])
  
    useEffect(() => {
      if(!!vimeoAccessToken) {
        const delayDebounceFn = setTimeout(() => {
          getVimeoVideosOfUser(1);
        }, 1000)
        return () => clearTimeout(delayDebounceFn)
      }
    }, [searchQuery])

    const connectToVimeo = () => {
        const client_id = process.env.REACT_APP_VIMEO_CLIENT_ID;
        const redirect_uri = process.env.REACT_APP_VIMEO_CALLBACK_URI;
        const scope = 'public private';
        const loggedInUserId = JSON.parse(localStorage.user)._id;
        const ConnectVimeoLink = `https://api.vimeo.com/oauth/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&state=${loggedInUserId}&scope=${scope}`;
          popup(ConnectVimeoLink, 'Connect To Vimeo', {
            width: window.screen.width,
            height: window.screen.height,
            left: 0,
            top: 0
          }, (err, data) => {
          if(err) {
            AlertService.error('Vimeo connection failed, retry');
          }
          if(!!data && data.vimeoToken) {
            // loggedInUserId === data.state // passing state which is ID of user who requested vimeo access
            // token received in data
            AlertService.success('Vimeo account linked');
            // vimeoToken: vimeoData.access_token,
            // vimeoAuth: `${vimeoData.token_type} ${vimeoData.access_token}`,
            // vimeoUser: vimeoData.user
            localStorage.setItem('vimeoToken', data.vimeoToken)
            setVimeAccessToken(data.vimeoToken);
          } else {
            AlertService.error('Vimeo connection failed, retry');
          }
        });
      }
    
      const getVimeoVideosOfUser = (page) => {
        let query = `page=${page}`
        setLoading(true);
        if(!!searchQuery) {
          query = query+`&query=${searchQuery}`
        }
        AxiosService.get(`https://api.vimeo.com/me/videos?${query}`, {
          headers: {
            'Authorization': `bearer ${vimeoAccessToken}`
          }
        }).then(response => {
          setVimeoVideoDetails(response);
        }).catch(error => {
          setVimeAccessToken(null)
          AlertService.error('Vimeo connect failed, reconnect to Vimeo account!')
        }).finally(() => {
          setLoading(false);
        });
      }

    return <div className="col-12">
        {
        !vimeoAccessToken ? <>
        {/* connect to vimeo if no token */}
        <div className="form-group row">
            <div className="col-md-4">
            <span>Connect Vimeo</span>
            </div>
            <div className="col-md-8">
            <div className="card mb-0 width-100-px cursor-pointer">
                <div className="car d-content">
                <img className="img-fluid" src="vimeo.png" alt="Card cap" onClick={connectToVimeo}/>
                </div>
            </div>
            </div>
        </div>
        </> : <>
        {/* upload a video to vimeo */}
        <div className="form-group row">
            <div className="col-md-4"><span>Upload Video</span></div>
            <div className="col-md-8">
            <a target="_blank" href="https://vimeo.com/upload">Upload A Video to your vimeo account</a>
            </div>
        </div>
        <div className="form-group row">
            {/* select video for benefit */}
            <div className="col-md-4"><span>Select Videos</span></div>
            <div className="col-md-8" style={{
            maxHeight: '300px',
            overflow: 'auto'
            }}>
            <div style={{
                margin: '0 -14px'
            }}>
                <InputControl
                placeholder="search video on vimeo"
                type="text"
                onChange={({target: { value }}) => {
                    setSearchQuery(value);
                }}
                />
            </div>
            {
                vimeoVideoDetails && vimeoVideoDetails.total !== 0 ? <>
                {
                    vimeoVideoDetails && vimeoVideoDetails.data && vimeoVideoDetails.data.map(video => {
                    return <div
                        key={video.link}
                        style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '5px',
                        background: selectedVideo === video.link ? '#7367F0' : 'inherit',
                        color: selectedVideo === video.link ? 'white' : 'inherit',
                        transition: 'all linear 100ms'  
                        }}
                        onClick={() => {
                            onSelect(video.link);
                        }}
                    >
                        <img src={video.pictures.sizes[0].link} />
                        <span style={{ marginLeft: '5px', fontSize: '12px' }}>{video.name}</span>
                    </div>
                    })
                }
                {/* pagination info for video */}
                <div className="d-flex pt-1" style={{
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    position: 'sticky',
                    bottom: 0,
                    background: 'white',
                    paddingTop: '5px',
                }}>                   
                    {!loading && <Pagination
                      activePage={vimeoVideoDetails.page}
                      disabledClass="disabled"
                      itemsCountPerPage={vimeoVideoDetails.per_page}
                      totalItemsCount={vimeoVideoDetails.total}
                      itemClass="page-item"
                      linkClass="page-link"
                      activeClass="active"
                      onChange={(pageNo) => {
                          getVimeoVideosOfUser(pageNo)
                      }}
                    />}
                </div>
                </> : <>
                    <div>No Result Found</div>
                </>
            }
            </div>
        </div>
        </>
        }
    </div>
}

export default VimeoConnect;