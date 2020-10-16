import React, { useState, useCallback, useRef, useEffect} from 'react';
import { AsyncTypeahead, Highlighter } from 'react-bootstrap-typeahead';
import Styled from 'styled-components';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { AxiosService, AlertService } from '../../services';
import './style.css';

const Items = Styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ListArtist = ({ onSave }) => {
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef(null);
    const [options, setOptions] = useState([]);

    const [ newArtist, setNewArtist ] = useState([]);

    const [ artistAssociated, setArtistAssociated ] = useState(null);

    const handleSearch = useCallback((query) => {
        setIsLoading(true);

        AxiosService.get(`/artist?search=${query}`)
        .then((response) => {
            setOptions(response);
            setIsLoading(false);
        });
    });

    const checkArtistAssociation = (artistId) => {
        AxiosService.get(`/artist/check-association/${artistId}`).then(res => {
            if(res) {
                AlertService.error(`Artist association exists with artist-manager ${res.firstName || ' '} ${res.lastName || ''}`)
                setArtistAssociated(res);
            } else {
                setArtistAssociated(null);
            }
        }).catch(() => {
            console.error('error while checking artist association')
        })
    }
    return <div className="list-artist" style={{
        minWidth: '400px',
        padding: '0 10px'
    }}>
        <div className="search">
            <AsyncTypeahead
                ref={searchRef}
                id="artist-search"
                isLoading={isLoading}
                minLength={1}
                onSearch={handleSearch}
                highlightOnlyResult
                options={options}
                labelKey={'name'}
                useCache={false}
                onChange={list => {
                    setNewArtist(list);
                    setArtistAssociated(false);
                    if(list && list.length) {
                        checkArtistAssociation(list[0]._id);
                    }
                    searchRef.current.clear();
                }}
                placeholder="Search for a Artist"
                renderMenuItemChildren={(option, props) => {
                    // image, followers, name 
                    return <Items>
                        <span><Highlighter search={props.text}>{option.name}</Highlighter></span>
                        {option.image && <img height="25" width="25" src={option.image} className="img-responsive" />}
                    </Items>
                }}
            />
            {
                newArtist && newArtist.length > 0  && <div>
                    <br /><br />
                    <h5><b>Artist Name: </b>{newArtist[0].name}</h5>
                    <h6><b>Artist Linked: </b>{!!artistAssociated ? 'Yes' : 'No'}</h6>
                    {!!artistAssociated && <h6><b>Manager: </b>{artistAssociated.firstName || ' '} {artistAssociated.lastName}</h6>}
                    <button className={'btn btn-outline-primary my-1 mr-1'} onClick={() => {
                        onSave([newArtist[0]._id], !!artistAssociated)
                        setNewArtist([])
                    }}>{!!artistAssociated ? 'Request to link Artist' : 'Link Artist'}</button>
                </div>
            }
        </div>
    </div>
}

export default ListArtist;