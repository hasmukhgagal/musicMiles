import React, { useState } from 'react';
import { AppleService, AlertService } from '../../services';
import './styles.css';

function Apple(props) {
    const [data, setData] = useState({
        isSignupFinish: false,
        appleId: '',
        isValid: false,
    });
    async function appleAuth(event) {
        if(!data.isValid) {
            AlertService.error("Apple ID required, enter your Apple ID")
            return;
        }
        await AppleService.checkAppleAuth({ appleId: data.appleId })
        const params = new URLSearchParams(props.location.search);
        props.musicInstance.authorize().then(async (musicUserToken) => {
            try {
                if (musicUserToken) {
                    console.log("appleAuth -> musicUserToken", musicUserToken)
                    await AppleService.saveAppleAuth({userId: params.get('userId'), token: musicUserToken, appleId: data.appleId })
                    setData({
                        isSignupFinish: true,
                    });
                    localStorage.clear();
                } else {
                    AlertService.error(`AppleMusic subscription does not exists for the user ${params.get('userId') ? params.get('userId') : ''}`)
                }
            } catch (error) {
                console.log(`Authorized, music-user-token: ${error}`);
            }
        });
    }

    const onChange = (e) => {
        const { value } = e.target;
    
        data['appleId'] = value;
        data['isValid'] = true;
        setData({ ...data });
      };

    return (
        <div className="main-apple">
            <div className="wrapper-main-apple">
                <div className="wrapper-inner-apple">
                    <div className="image-box-apple">
                        <img src="../../../app-assets/images/profile-image.png" alt="ddd" />
                    </div>
                    <div className="content-box-apple">
                        <h1>Welcome to Music Miles </h1>
                        <p>If you do not have apple music subscription then the integration of MusicMilesRewards and Apple Music will not work</p>
                        <p>
                            <input type="text" placeholder="Enter Apple ID" class="form-control" onChange={onChange}></input>
                        </p>
                        {data.isSignupFinish ? <p>AppleMusic account associated successfully with MusicMilesRewards.</p> : 
                        <a className="btn-apple" onClick={appleAuth}>Continue with Apple Music</a> }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Apple;
