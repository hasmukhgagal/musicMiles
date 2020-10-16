import React, { useState, useEffect } from 'react';
import { sumBy } from 'lodash';
import { useHistory } from 'react-router-dom';
import Carousel from 'react-elastic-carousel';
import InputControl from '../../components/form-control/Input';
import VimeoConnect from '../../components/vimeo';
import { DashboardService } from '../../services';
import { get, save } from '../../services/resource.service';
import GeoChart from '../../components/dashboard/GeoChart';
import BarChart from '../../components/dashboard/BarChart';
import './styles.css';
import alertService from '../../services/alert.service';

const categoryOptions = [
  {
    label: 'Merchandise Discount',
    controls: ['promocode', 'url'],
  },
  {
    label: 'Merchandise Exclusives',
    controls: ['url'],
  },
  {
    label: 'Exclusive Video Content',
    controls: ['vimeo', 'or', 'url'],
  },
  {
    label: 'Exclusive Audio Content',
    controls: ['audio', 'or', 'url'],
  },
  {
    label: 'Live Session',
    controls: ['url', 'schedule'],
  },
  {
    label: 'Shout-out Video',
    controls: ['username', 'vimeo', 'or', 'url'],
  },
];

function Home({ activeArtist }) {
  const [data, setData] = useState({
    fanSummeryData: [],
    citySummeryData: [],
    cityList: [],
    fanSummery: [],
    benefitList: {},
    city: '',
    geoChartData: [],
    topfanList: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // console.info(activeArtist._id, 'artist updated...')
    setLoading(true);
    fetchData();
  }, [activeArtist])


  const fetchData = async () =>  {
    const result = await DashboardService.getFanSummery(activeArtist._id);
    const citySummery = await DashboardService.getCitySummery(activeArtist._id);
    const cityList = await DashboardService.getCityList(activeArtist._id);
    const benefitList = await get(`/benefit?artist=${activeArtist._id}&period=active`);
    const topfanList = await DashboardService.getTopFanAtist(activeArtist._id);
    const topSongList = await DashboardService.getTopSongArtist(activeArtist._id);
    setLoading(false);
    setData({
      fanSummeryData: result,
      citySummeryData: citySummery,
      cityList,
      fanSummery: result,
      benefitList,
      topfanList,
      topSongList
    });
  }

  const calculateFans = (statusGroup) => sumBy(statusGroup, 'fans');

  const calculatePoints = (statusGroup) => sumBy(statusGroup, 'points');

  const onChange = async (event) => {
    event.persist();

    const { value } = event.target;
    const result = await DashboardService.getFanSummery(activeArtist._id, value);
    setData({ ...data, fanSummery: result, city: value });
  };

  return loading ? <div className="content-body"  style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh'
 }}>
   <div className="spinner-border" role="status">
    <span className="sr-only">Loading...</span>
  </div>
  </div> : (
    <div>
      <div className="content-body">
        <section id="dashboard-analytics">
          <div className="row">
          
            <div className="col-3">
              <div className="mb-3 text-center">
                <img className="img-thumbnail avatar" style={{
                  maxHeight: '300px',
                  maxWidth: '300px',
                  width: '100%',
                  cursor: 'unset'
                }} src={activeArtist.image} alt="artist"/>
                <br />
                <h4>Welcome</h4>
                <h3>{activeArtist.name}</h3>
              </div>
              <div className="card">
                <div className="card-content">
                  <div className="table-responsive ">
                    <table className="table table-hover-animation ">
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Fans</th>
                          <th>Aggregate points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!!data.fanSummeryData && data.fanSummeryData.map((fan, index) => fan._id && (
                          <tr>
                            <td>
                              <i className="fa fa-circle font-small-3 text-success mr-50"></i>
                              {fan._id}
                            </td>
                            <td>{fan.fans}</td>
                            <td>{fan.points}</td>
                          </tr>
                        ))}
                        {
                          !!data.fanSummeryData && data.fanSummeryData.length === 0 && <tr style={{
                            pointerEvents:'none'
                          }}>
                            <td colspan="3">
                              No Data Found.
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-content">
                  <div className="table-responsive ">
                    <table className="table table-hover-animation pricing-table">
                      <thead>
                        <tr>
                          <th>Top Cities</th>
                          <th>Fans</th>
                          <th>Aggregate points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!!data.citySummeryData && data.citySummeryData.map((city, index) => city._id && (
                          <React.Fragment>
                            <tr className="main-row">
                              <td>{city._id}</td>
                              <td>{calculateFans(city.status_group)}</td>
                              <td>{calculatePoints(city.status_group)}</td>
                            </tr>
                            {city.status_group.map((status_group, index) => (
                              <tr className="sub-row">
                                <td>{status_group.status}</td>
                                <td>{status_group.fans}</td>
                                <td>{status_group.points}</td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                        {
                          !!data.citySummeryData && data.citySummeryData.length === 0 && <tr style={{
                            pointerEvents:'none'
                          }}>
                            <td colspan="3">
                              No Data Found.
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-content">
                  <div className="table-responsive ">
                    <table className="table table-hover-animation pricing-table">
                      <thead>
                        <tr className="main-row">
                          <th>Fan Name</th>
                          <th>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!!data.topfanList && data.topfanList.map((fan) => fan._id && (
                          <React.Fragment>
                            <tr className="sub-row">
                              <td>{fan.user ? fan.user.firstName + ' ' + fan.user.lastName : ' '}</td>
                              <td>{fan.totalPoints}</td>
                            </tr>
                          </React.Fragment>
                        ))}
                        {
                          !!data.topfanList && data.topfanList.length === 0 && <tr style={{
                            pointerEvents:'none'
                          }}>
                            <td colspan="3">
                              No Data Found.
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-8">
              <div className="card">
                <div className="card-header d-flex justify-content-between pb-0">
                  <h4 className="card-title">Heat Map</h4>
                </div>
                <div className="card-content">
                  <div className="card-body pt-0">
                    <GeoChart artistId={activeArtist._id} data={data.geoChartData} />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-content">
                  <div className="table-responsive">
                    <div className="pt-10">
                      <InputControl
                        type="select"
                        id="category"
                        name="category"
                        placeholder="Choose City"
                        value={data.city}
                        options={data.cityList}
                        onChange={onChange}
                      />
                    </div>
                    <table className="table table-hover-animation ">
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Fans</th>
                          <th>Aggregate points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!!data.fanSummery && data.fanSummery.map((fan, index) => fan._id && (
                          <tr>
                            <td>
                              <i className="fa fa-circle font-small-3 text-success mr-50"></i>
                              {fan._id}
                            </td>
                            <td>{fan.fans}</td>
                            <td>{fan.points}</td>
                          </tr>
                        ))}
                        {
                          !!data.fanSummery && data.fanSummery.length === 0 && <tr style={{
                            pointerEvents:'none'
                          }}>
                            <td colspan="3">
                            No fans with status silver, gold or platinum found, Select another option from dropdown.
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-content">
                  <div className="table-responsive ">
                    <table className="table table-hover-animation pricing-table">
                      <thead>
                        <tr className="main-row">
                          <th>Song Name</th>
                          <th>Count</th>
                          <th>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!!data.topSongList && data.topSongList.map((song) => song._id && (
                          <React.Fragment>
                            <tr className="sub-row">
                              <td>{song.name}</td>
                              <td>{song.count}</td>
                              <td>{song.points}</td>
                            </tr>
                          </React.Fragment>
                        ))}
                        {
                          !!data.topSongList && data.topSongList.length === 0 && <tr style={{
                            pointerEvents:'none'
                          }}>
                            <td colspan="3">
                              No Songs Found.
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
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

export default Home;
