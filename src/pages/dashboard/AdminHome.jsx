import React, { useEffect, useState, useMemo } from 'react';
import Pagination from "react-js-pagination";

import { AxiosService, AlertService } from '../../services';

const RequestPageSize = 10;
const ManagerPageSize = 10;

const Request  = ({ update, request }) => {
    const [loading, setLoading] = useState(false);
    const acceptInvite = (requestId) => {
        setLoading(true);
        AxiosService.patch(`/artist-mapping/accept/${requestId}`).then(res => {
            update()
        }).catch(e => {
            AlertService.error(e)
        }).finally(() => setLoading(false))
    }

    const rejectInvite = (requestId) => {
        setLoading(true);
        AxiosService.patch(`/artist-mapping/reject/${requestId}`).then(res => {
            update()
        }).catch(e => {
            AlertService.error(e)
        }).finally(() => setLoading(false))
    }
    return <div>
        <button className="btn btn-primary mr-1"
            disabled={loading}
            onClick={() => {acceptInvite(request._id)}}
        >Accept</button>
        <button
            disabled={loading}
            onClick={() => {rejectInvite(request._id)}}
            className="btn btn-secondary mr-1"
        >Decline</button>
    </div>
}

const AdminPage = () => {
    const [requestData, setRequestData] = useState();
    const [managerData, setManagerData] = useState();
    useEffect(() =>  {
        getDetail();
    }, [])

    const [requestActivePage, setRequestActivePage ] = useState(1);
    const paginatedRequest = useMemo(() => {
        if(requestData) {
            return requestData.slice((requestActivePage - 1) * RequestPageSize, requestActivePage * RequestPageSize)
        }
        return []
    }, [requestData, requestActivePage])

    const [mangerActivePage, setMangerActivePage ] = useState(1);
    const paginatedManager = useMemo(() => {
        if(managerData) {
            return managerData.slice((mangerActivePage - 1) * RequestPageSize, mangerActivePage * RequestPageSize)
        }
        return []
    }, [managerData, mangerActivePage])

    const getDetail = () => {
        const mapping = AxiosService.get('/artist-mapping')
        const managerList = AxiosService.get('/user/managers')
        Promise.all([mapping, managerList]).then(result => {
            setRequestData(result[0])
            setManagerData(result[1])
        })
    }

    const date = (date) => {
        let parsedDate = new Date(date);
        return `${parsedDate.getDate()}/${parsedDate.getMonth()}/${parsedDate.getFullYear()}`
    }

    return <div className="content-body" id="admin-page">
        <div className="container-fluid" style={{
            minHeight: '40vh'
        }}>
            <div className="row">
                <div className="col">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title mb-0">Request list</h5>                        
                        </div>
                        {requestData && requestData.length ? <><div className="list-group list-group-flush">
                            {paginatedRequest.map(request => <div key={request._id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <b>Artist:</b> {request.artist.name} | <b>Requested on</b>: {date(request.createdAt)} <br/>
                                    <b>Change From:</b> {request.toUser.firstName || ''} {request.toUser.lastName || ''} 
                                    <br />
                                    <b>Change To:</b> {request.fromUser.firstName || ''} {request.fromUser.lastName || ''} 
                                </div>
                                <Request update={getDetail} request={request} />
                            </div>)
                            }
                        </div>
                        <div className="card-footer" style={{
                            justifyContent: 'center',
                            display: 'flex'
                        }}>
                            <Pagination                            
                                innerClass="pagination mb-0"
                                activePage={requestActivePage}
                                disabledClass="disabled"
                                itemsCountPerPage={RequestPageSize}
                                totalItemsCount={requestData.length}
                                itemClass="page-item"
                                linkClass="page-link"
                                activeClass="active"
                                onChange={(pageNo) => {
                                    setRequestActivePage(pageNo)
                                }}
                            />
                        </div>
                        </> : <>
                            <div className="card-body pt-0">No Request found!</div>
                        </>}
                    </div>
                </div>
                <div className="col">
                <div className="card">
                        <div className="card-body">
                            <h5 className="card-title mb-0">Manager list</h5>                        
                        </div>
                        {
                            managerData && managerData.length ? <><div className="list-group list-group-flush">
                            {
                                paginatedManager.map(manager => <div key={manager._id} className="list-group-item d-flex flex-column">
                                    <b>{manager.firstName || ''} {manager.lastName || ''} ({manager.email})</b>
                                    <div>
                                        <span>Artist Linked: </span><br/>
                                        {manager.artists && manager.artists.length == 0 && <div>No artist linked.</div>}
                                        <div>{
                                            manager.artists && manager.artists.map(artist => <div key={artist._id} className="badge badge-primary" style={{
                                                marginRight: '5px',
                                                marginBottom: '5px'
                                            }}>{artist.name}</div>)
                                        }</div>
                                    </div>
                                </div>)
                            }
                            </div>
                            <div className="card-footer" style={{
                                justifyContent: 'center',
                                display: 'flex'
                            }}>
                                <Pagination
                                    innerClass="pagination mb-0"
                                    activePage={mangerActivePage}
                                    disabledClass="disabled"
                                    itemsCountPerPage={ManagerPageSize}
                                    totalItemsCount={managerData.length}
                                    itemClass="page-item"
                                    linkClass="page-link"
                                    activeClass="active"
                                    onChange={(pageNo) => {
                                        setMangerActivePage(pageNo)
                                    }}
                                />
                            </div>
                        </>: <>
                            <div className="card-body pt-0">No Manager found!</div>
                        </>
                        }
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default AdminPage;