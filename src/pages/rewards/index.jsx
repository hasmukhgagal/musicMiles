import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Carousel from 'react-elastic-carousel';
import InputControl from '../../components/form-control/Input';
import FileInput from '../../components/common/FileInput/FileInput'
import VimeoConnect from '../../components/vimeo';
import { get, save, uploadExcelFile } from '../../services/resource.service';
import BarChart from '../../components/dashboard/BarChart';
import '../dashboard/styles.css';
import alertService from '../../services/alert.service';

// const downloadFileLink = `${process.env.REACT_APP_BASE_URL}/coupons.xlsx`;
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

const Rewards = ({ activeArtist }) => {
  const history = useHistory();
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
  const [editMode, setEditMode] = useState({});
  const [activeTab, setActiveTab] = useState('active');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const benefitList = await get(`/benefit?artist=${activeArtist._id}&period=active`);
      setLoading(false);
      setData({
        benefitList
      });
    }
    fetchData();
  }, [activeArtist])

  const [file, setFile] = useState();


  const getBenefit = async (param) => {
    const benefitList = await get(`/benefit?artist=${activeArtist._id}&period=${param}`);
    setData({
      ...data,
      benefitList,
    });
    setActiveTab(param);
  };

  const handleInput = (e, index) => {
    const { name, value } = e.target;

    if (
      data &&
      data.benefitList &&
      data.benefitList.data &&
      data.benefitList.data.length
    ) {
      data.benefitList.data[index][name] = value;
    }

    setData({
      ...data,
    });
  };

  const handleStatusInput = (itemId, value, index, cIndex) => {
    if (
      data &&
      data.benefitList &&
      data.benefitList.data &&
      data.benefitList.data.length
    ) {
      data.benefitList.data[index]['status'][cIndex].isActive = value;
    }

    updateBenefit(itemId, { status: data.benefitList.data[index]['status'] });

    setData({
      ...data,
    });
  };

  const prepareSaveObj = (data, elem) => {
    if (elem === 'category') {
      const obj = {};

      if ((data.category || '').toLowerCase() === 'merchandise discount') {
        obj.promocode = data.promocode;
        obj.url = data.url;
      } else if (
        (data.category || '').toLowerCase() === 'merchandise exclusives'
      ) {
        obj.url = data.url;
      } else if (
        (data.category || '').toLowerCase() === 'exclusive video content'
      ) {
        obj.url = data.url;
        obj.vimeoVideoUrl = data.vimeoVideoUrl
        // vimeo connect will come here
      } else if (
        (data.category || '').toLowerCase() === 'exclusive audio content'
      ) {
        obj.url = data.url;
        // audio connect will come here
      } else if (
        (data.category || '').toLowerCase() === 'live session' &&
        data.scheduleDate &&
        data.scheduleTime
      ) {
        obj.scheduleDate = new Date(
          `${data.scheduleDate}T${data.scheduleTime}`
        ).toISOString();
        obj.scheduleTimezone = data.scheduleTimezone;
      } else if ((data.category || '').toLowerCase() === 'shout-out video') {
        obj.vimeoUserName = data.vimeoUserName;
        obj.url = data.url;
        obj.vimeoVideoUrl = data.vimeoVideoUrl
      }
      return obj;
    }

    return data;
  };

  const updateBenefit = async (id, data, elem) => {
    const obj = prepareSaveObj(data, elem);
    if (elem === 'category') {
      obj[elem] = data[elem]
      obj['categoryIndex'] = categoryOptions.findIndex(cat => cat.label === data[elem]);
    }
    const res = await save(`/benefit`, id, obj).catch((error) =>
      console.log(error)
    );

    if (
      obj.category === 'Merchandise Discount' &&
      file &&
      data
    ) {
      await uploadExcelFile({
        moduleId: id,
        files: file,
      });
    }

    setFile(null);

    if (res && elem) {
      setEditMode({
        ...editMode,
        [`${id}${elem}`]: false,
      });
    }
  };

  const deleteBenefit = async (id) => {
    const res = await save(`/benefit`, id, { isDeleted: true }).catch((error) =>
      console.log(error)
    );
    if (res) {
      const benefitList = await get(
        `/benefit?artist=${activeArtist._id}&period=${activeTab}`
      ).catch((error) => console.log(error));
      setData({
        ...data,
        benefitList,
      });
    }
  };

  const onFileChange = (files, type) => {
    if (type === 'file') {
      setFile(files)
    }
  };

  function getInput(control, item, index) {
    switch (control) {
      case 'promocode':
        return (
          <div className="col-12">
            <div className="form-group row">
              <div className="col-md-4">
                <span>PROMO CODE</span>
              </div>
              <div className="col-md-8">
                {/* <a href={downloadFileLink} id="downloadfile" className="float-right" target="_blank" rel="noopener noreferrer" download>
                  <i className="fa fa-download"></i> Download Sample File
                </a> */}
                <FileInput
                  id='code'
                  onChange={(files) => onFileChange(files, 'file')}
                  buttonText='Choose code file'
                />
              </div>
            </div>
          </div>
        );

      case 'url':
        return (
          <InputControl
            label="URL"
            type="url"
            id={`${item._id}url`}
            name="url"
            placeholder="Insert website for code"
            value={item.url}
            required
            onChange={(e) => handleInput(e, index)}
          />
        );

      case 'schedule':
        return (
          <div className="col-12">
            <div className="form-group row">
              <div className="col-md-4">
                <span>Schedule</span>
              </div>
              <div className="col-md-8">
                <InputControl
                  label="Date"
                  type="date"
                  id={`${item._id}scheduleDate`}
                  name="scheduleDate"
                  placeholder="01 Jan 20"
                  value={item.scheduleDate}
                  onChange={(e) => handleInput(e, index)}
                />

                <InputControl
                  label="Time"
                  type="time"
                  id={`${item._id}scheduleTime`}
                  name="scheduleTime"
                  placeholder="12:00 PM"
                  value={item.scheduleTime}
                  onChange={(e) => handleInput(e, index)}
                />

                <InputControl
                  label="Timezone"
                  type="timezone"
                  id={`${item._id}timezone`}
                  name="scheduleTimezone"
                  placeholder="BST"
                  value={item.scheduleTimezone}
                  onChange={(e) => handleInput(e, index)}
                />
              </div>
            </div>
          </div>
        );

      case 'audio':
        return (
          <InputControl
            label="Upload audio file"
            type="file"
            id={`${item._id}file`}
            name="file"
            placeholder="Select file"
            value={item.file}
            onChange={(e) => handleInput(e, index)}
          />
        );

      case 'username':
        return (
          <InputControl
            label="User Name"
            type="text"
            id={`${item._id}username`}
            name="vimeoUserName"
            placeholder="Insert username"
            value={item.vimeoUserName}
            onChange={(e) => handleInput(e, index)}
          />
        );

      case 'vimeo':
        return (
          <VimeoConnect
            selectedVideo={item.vimeoVideoUrl}
            onSelect={(videoLink) => {
              data.benefitList.data[index]['vimeoVideoUrl'] = videoLink;
              setData({
                ...data,
              });
            }}
          />
        );

      case 'or':
        return (
          <div className="col-12">
            <div className="form-group row">
              <div className="col-md-4"></div>
              <div className="col-md-8">
                <span>OR</span>
              </div>
            </div>
          </div>
        );

      default:
        return;
    }
  }

  return <div className="content-body">
    <div className="row">
      <div className="col-3">
        <div className="mb-3 text-center">
          <img className="img-thumbnail avatar" style={{
            maxHeight: '300px',
            maxWidth: '300px',
            width: '100%',
            cursor: 'unset'
          }} src={activeArtist.image} alt="artist" />
          <br />
          <h4>Welcome</h4>
          <h3>{activeArtist.name}</h3>
        </div>
      </div>
      <div className="col-9">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Benefits</h4>

            <ul className="nav nav-tabs nav-justified">
              <li
                className="nav-item"
                onClick={() => getBenefit('active')}
              >
                <a
                  className={
                    activeTab === 'active'
                      ? 'nav-link font-size-16 active'
                      : 'nav-link font-size-16'
                  }
                >
                  Active
                      </a>
              </li>
              <li
                className="nav-item"
                onClick={() => getBenefit('future')}
              >
                <a
                  className={
                    activeTab === 'future'
                      ? 'nav-link font-size-16 active'
                      : 'nav-link font-size-16'
                  }
                >
                  Pending
                      </a>
              </li>
              <li className="nav-item" onClick={() => getBenefit('past')}>
                <a
                  className={
                    activeTab === 'past'
                      ? 'nav-link font-size-16 active'
                      : 'nav-link font-size-16'
                  }
                >
                  Expired
                      </a>
              </li>
            </ul>
          </div>

          <div className="card-content">
            <div className="card-body">
              {(data.benefitList.data || []).length > 0 ? (
                <Carousel itemsToShow={2} breakPoints={[
                  { width: 767, itemsToShow: 1 },
                  { width: 1020, itemsToShow: 2 },
                ]}>
                  {(data.benefitList.data || []).map((item, index) => (
                    <div key={item.id} className="margin-left-15">
                      {activeTab !== 'past' && <div
                        onClick={() => deleteBenefit(item._id)}
                        className="link-delete pull-right margin-bottom-5 cursor-pointer"
                      >
                        Delete
                            </div>}
                      <div className="table-responsive">
                        <table className="table border">
                          <tbody>
                            <tr>
                              <th scope="row">Title:</th>
                              {editMode[`${item._id}title`] ? (
                                <td>
                                  <div className="edit-mode-input display-flex">
                                    <div className="col-md-10 padding-right-0">
                                      <InputControl
                                        id={`${item._id}title`}
                                        name="title"
                                        type="text"
                                        placeholder="Title"
                                        value={item.title}
                                        required
                                        onChange={(e) =>
                                          handleInput(e, index)
                                        }
                                      />
                                    </div>
                                    <div className="col-md-2 padding-left-0">
                                      <div className="margin-top-7 display-flex">
                                        <i
                                          onClick={() => {
                                            updateBenefit(
                                              item._id,
                                              { title: item.title },
                                              'title'
                                            );
                                          }}
                                          className="ficon feather icon-check icn-save cursor-pointer"
                                        ></i>{' '}
                                              &nbsp;&nbsp;&nbsp;
                                              <i
                                          onClick={() => {
                                            setEditMode({
                                              ...editMode,
                                              [`${item._id}title`]: false,
                                            });
                                          }}
                                          className="ficon feather icon-x icn-cancel cursor-pointer"
                                        ></i>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              ) : (
                                  <>
                                    <td>{item.title}</td>
                                    {activeTab !== 'past' && <td>
                                      <i
                                        onClick={() => {
                                          setEditMode({
                                            ...editMode,
                                            [`${item._id}title`]: true,
                                          });
                                        }}
                                        className="ficon feather icon-edit icn-edit cursor-pointer"
                                      ></i>
                                    </td>}
                                  </>
                                )}
                            </tr>
                            <tr>
                              <th scope="row">Price:</th>
                              {editMode[`${item._id}price`] ? (
                                <td>
                                  <div className="edit-mode-input display-flex">
                                    <div className="col-md-10 padding-right-0">
                                      <InputControl
                                        id={`${item._id}price`}
                                        name="price"
                                        type="number"
                                        placeholder="MM Points"
                                        value={item.price}
                                        required
                                        onChange={(e) =>
                                          handleInput(e, index)
                                        }
                                      />
                                    </div>
                                    <div className="col-md-2 padding-left-0">
                                      <div className="margin-top-7 display-flex">
                                        <i
                                          onClick={() => {
                                            updateBenefit(
                                              item._id,
                                              { price: item.price },
                                              'price'
                                            );
                                          }}
                                          className="ficon feather icon-check icn-save cursor-pointer"
                                        ></i>{' '}
                                              &nbsp;&nbsp;&nbsp;
                                              <i
                                          onClick={() => {
                                            setEditMode({
                                              ...editMode,
                                              [`${item._id}price`]: false,
                                            });
                                          }}
                                          className="ficon feather icon-x icn-cancel cursor-pointer"
                                        ></i>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              ) : (
                                  <>
                                    <td>{item.price} MM pts</td>
                                    {activeTab !== 'past' && <td>
                                      <i
                                        onClick={() => {
                                          setEditMode({
                                            ...editMode,
                                            [`${item._id}price`]: true,
                                          });
                                        }}
                                        className="ficon feather icon-edit icn-edit cursor-pointer"
                                      ></i>
                                    </td>}
                                  </>
                                )}
                            </tr>
                            <tr>
                              <th scope="row">Status availability:</th>

                              <td>
                                {item.status.map((elem, cIndex) => (
                                  <div
                                    key={elem.key}
                                    className="margin-top-10 display-flex"
                                  >
                                    <input
                                      type="checkbox"
                                      className="form-control custom-checkbox"
                                      id={`${elem.key}status`}
                                      name="status"
                                      disabled={
                                        !editMode[`${item._id}status`]
                                      }
                                      value={elem.isActive}
                                      checked={elem.isActive === true}
                                      required
                                      onChange={() =>
                                        handleStatusInput(
                                          item._id,
                                          !elem.isActive,
                                          index,
                                          cIndex
                                        )
                                      }
                                    />
                                          &nbsp;&nbsp;{elem.key}
                                  </div>
                                ))}
                              </td>

                              {activeTab !== 'past' && <td>
                                {!editMode[`${item._id}status`] ? (
                                  <i
                                    onClick={() => {
                                      setEditMode({
                                        ...editMode,
                                        [`${item._id}status`]: true,
                                      });
                                    }}
                                    className="ficon feather icon-edit icn-edit cursor-pointer"
                                  ></i>
                                ) : (
                                    <i
                                      onClick={() => {
                                        setEditMode({
                                          ...editMode,
                                          [`${item._id}status`]: false,
                                        });
                                      }}
                                      className="ficon feather icon-x icn-cancel cursor-pointer"
                                    ></i>
                                  )}
                              </td>}
                            </tr>
                            <tr>
                              <th scope="row">Benefit Category:</th>
                              {editMode[`${item._id}category`] ? (
                                <>
                                  <td>
                                    <div className="edit-mode-input">
                                      <div className="display-flex">
                                        <InputControl
                                          type="select"
                                          id={`${item._id}category`}
                                          name="category"
                                          placeholder="Choose From Categories"
                                          value={item.category}
                                          options={categoryOptions}
                                          onChange={(e) =>
                                            handleInput(e, index)
                                          }
                                        />
                                        <i
                                          onClick={() => {
                                            updateBenefit(
                                              item._id,
                                              item,
                                              'category'
                                            );
                                          }}
                                          className="ficon feather icon-check icn-save cursor-pointer"
                                        ></i>{' '}
                                              &nbsp;&nbsp;&nbsp;
                                              <i
                                          onClick={() => {
                                            setEditMode({
                                              ...editMode,
                                              [`${item._id}category`]: false,
                                            });
                                          }}
                                          className="ficon feather icon-x icn-cancel cursor-pointer"
                                        ></i>
                                      </div>
                                      <div>
                                        {item.category &&
                                          categoryOptions
                                            .find(
                                              (option) =>
                                                option.label ===
                                                item.category
                                            )
                                            .controls.map((control) =>
                                              getInput(
                                                control,
                                                item,
                                                index
                                              )
                                            )}
                                        <div className="margin-top-7 display-flex"></div>
                                      </div>
                                    </div>
                                  </td>
                                  <td></td>
                                </>
                              ) : (
                                  <>
                                    <td>{item.category}</td>
                                    {activeTab !== 'past' && <td>
                                      <i
                                        onClick={() => {
                                          setEditMode({
                                            ...editMode,
                                            [`${item._id}category`]: true,
                                          });
                                        }}
                                        className="ficon feather icon-edit icn-edit cursor-pointer"
                                      ></i>
                                    </td>}
                                  </>
                                )}
                            </tr>

                            {item.promocode !== undefined && (
                              <tr>
                                <th scope="row">PROMO CODE:</th>
                                {editMode[`${item._id}promocode`] ? (
                                  <td>
                                    <div className="edit-mode-input display-flex">
                                      <div className="col-md-10 padding-right-0">
                                        <InputControl
                                          id={`${item._id}promocode`}
                                          name="promocode"
                                          type="text"
                                          placeholder="DISCOUNT001"
                                          value={item.promocode}
                                          required
                                          onChange={(e) =>
                                            handleInput(e, index)
                                          }
                                        />
                                      </div>
                                      <div className="col-md-2 padding-left-0">
                                        <div className="margin-top-7 display-flex">
                                          <i
                                            onClick={() => {
                                              updateBenefit(
                                                item._id,
                                                {
                                                  promocode:
                                                    item.promocode,
                                                },
                                                'promocode'
                                              );
                                            }}
                                            className="ficon feather icon-check icn-save cursor-pointer"
                                          ></i>{' '}
                                                &nbsp;&nbsp;&nbsp;
                                                <i
                                            onClick={() => {
                                              setEditMode({
                                                ...editMode,
                                                [`${item._id}promocode`]: false,
                                              });
                                            }}
                                            className="ficon feather icon-x icn-cancel cursor-pointer"
                                          ></i>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                ) : (
                                    <>
                                      <td>{item.promocode}</td>
                                      {activeTab !== 'past' && <td>
                                        <i
                                          onClick={() => {
                                            setEditMode({
                                              ...editMode,
                                              [`${item._id}promocode`]: true,
                                            });
                                          }}
                                          className="ficon feather icon-edit icn-edit cursor-pointer"
                                        ></i>
                                      </td>}
                                    </>
                                  )}
                              </tr>
                            )}
                            {item.vimeoUserName !== undefined && (
                              <tr>
                                <th scope="row">User Name:</th>
                                {editMode[`${item._id}vimeoUserName`] ? (
                                  <td>
                                    <div className="edit-mode-input display-flex">
                                      <div className="col-md-10 padding-right-0">
                                        <InputControl
                                          id={`${item._id}vimeoUserName`}
                                          name="vimeoUserName"
                                          type="text"
                                          placeholder="User Name"
                                          value={item.vimeoUserName}
                                          required
                                          onChange={(e) =>
                                            handleInput(e, index)
                                          }
                                        />
                                      </div>
                                      <div className="col-md-2 padding-left-0">
                                        <div className="margin-top-7 display-flex">
                                          <i
                                            onClick={() => {
                                              updateBenefit(
                                                item._id,
                                                {
                                                  vimeoUserName:
                                                    item.vimeoUserName,
                                                },
                                                'vimeoUserName'
                                              );
                                            }}
                                            className="ficon feather icon-check icn-save cursor-pointer"
                                          ></i>{' '}
                                                &nbsp;&nbsp;&nbsp;
                                                <i
                                            onClick={() => {
                                              setEditMode({
                                                ...editMode,
                                                [`${item._id}vimeoUserName`]: false,
                                              });
                                            }}
                                            className="ficon feather icon-x icn-cancel cursor-pointer"
                                          ></i>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                ) : (
                                    <>
                                      <td>{item.vimeoUserName}</td>
                                      {activeTab !== 'past' && <td>
                                        <i
                                          onClick={() => {
                                            setEditMode({
                                              ...editMode,
                                              [`${item._id}vimeoUserName`]: true,
                                            });
                                          }}
                                          className="ficon feather icon-edit icn-edit cursor-pointer"
                                        ></i>
                                      </td>}
                                    </>
                                  )}
                                {/* <td>{item.vimeoUserName}</td>
                                    <td>
                                      <i className="ficon feather icon-edit icn-edit cursor-pointer"></i>
                                    </td> */}
                              </tr>
                            )}
                            {item.url !== undefined && (
                              <tr>
                                <th scope="row">URL:</th>
                                {editMode[`${item._id}url`] ? (
                                  <td>
                                    <div className="edit-mode-input display-flex">
                                      <div className="col-md-10 padding-right-0">
                                        <InputControl
                                          id={`${item._id}url`}
                                          name="url"
                                          type="text"
                                          placeholder="URL"
                                          value={item.url}
                                          required
                                          onChange={(e) =>
                                            handleInput(e, index)
                                          }
                                        />
                                      </div>
                                      <div className="col-md-2 padding-left-0">
                                        <div className="margin-top-7 display-flex">
                                          <i
                                            onClick={() => {
                                              try {
                                                new URL(item.url);
                                                updateBenefit(
                                                  item._id,
                                                  { url: item.url },
                                                  'url'
                                                );
                                              } catch (e) {
                                                alertService.error('Enter valid URL');
                                              }
                                            }}
                                            className="ficon feather icon-check icn-save cursor-pointer"
                                          ></i>{' '}
                                                &nbsp;&nbsp;&nbsp;
                                                <i
                                            onClick={() => {
                                              setEditMode({
                                                ...editMode,
                                                [`${item._id}url`]: false,
                                              });
                                            }}
                                            className="ficon feather icon-x icn-cancel cursor-pointer"
                                          ></i>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                ) : (
                                    <>
                                      <td>{item.url}</td>
                                      {activeTab !== 'past' && <td>
                                        <i
                                          onClick={() => {
                                            setEditMode({
                                              ...editMode,
                                              [`${item._id}url`]: true,
                                            });
                                          }}
                                          className="ficon feather icon-edit icn-edit cursor-pointer"
                                        ></i>
                                      </td>}
                                    </>
                                  )}
                                {/* <td>{item.url}</td>
                                    <td>
                                      <i className="ficon feather icon-edit icn-edit cursor-pointer"></i>
                                    </td> */}
                              </tr>
                            )}
                            {item.scheduleDate && (
                              <tr>
                                <th rowSpan="1" scope="row">
                                  Schedule:
                                      </th>
                                {editMode[`${item._id}title`] ? (
                                  <td>
                                    <div className="edit-mode-input display-flex">
                                      <div className="col-md-10 padding-right-0">
                                        <InputControl
                                          id={`${item._id}title`}
                                          name="title"
                                          type="text"
                                          placeholder="Title"
                                          value={item.title}
                                          required
                                          onChange={(e) =>
                                            handleInput(e, index)
                                          }
                                        />
                                      </div>
                                      <div className="col-md-2 padding-left-0">
                                        <div className="margin-top-7 display-flex">
                                          <i
                                            onClick={() => {
                                              updateBenefit(
                                                item._id,
                                                { title: item.title },
                                                'title'
                                              );
                                            }}
                                            className="ficon feather icon-check icn-save cursor-pointer"
                                          ></i>{' '}
                                                &nbsp;&nbsp;&nbsp;
                                                <i
                                            onClick={() => {
                                              setEditMode({
                                                ...editMode,
                                                [`${item._id}title`]: false,
                                              });
                                            }}
                                            className="ficon feather icon-x icn-cancel cursor-pointer"
                                          ></i>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                ) : (
                                    <>
                                      <td>{item.title}</td>
                                      {activeTab !== 'past' && <td>
                                        <i
                                          onClick={() => {
                                            setEditMode({
                                              ...editMode,
                                              [`${item._id}title`]: true,
                                            });
                                          }}
                                          className="ficon feather icon-edit icn-edit cursor-pointer"
                                        ></i>
                                      </td>}
                                    </>
                                  )}
                                {/* <td rowSpan="1">
                                      <div>
                                        <b className="schedule-label">Date:</b>{' '}
                                        {new Date(
                                          item.scheduleDate
                                        ).toLocaleDateString()}
                                      </div>
                                      <div>
                                        <b className="schedule-label">Time:</b>{' '}
                                        {new Date(
                                          item.scheduleDate
                                        ).toLocaleTimeString()}
                                      </div>
                                      <div>
                                        <b className="schedule-label">
                                          Timezone:
                                        </b>{' '}
                                        {item.scheduleTimezone}
                                      </div>
                                    </td>
                                    <td>
                                      <i className="ficon feather icon-edit icn-edit cursor-pointer"></i>
                                    </td> */}
                              </tr>
                            )}
                            {item.image && item.image.url && <><tr>

                              <th scope="row">Image:</th>
                              <td></td>
                              <td>
                                {activeTab !== 'past' && <i className="ficon feather icon-edit icn-edit cursor-pointer"></i>}
                              </td>
                            </tr>
                              <tr>
                                <td colSpan="3">
                                  <img
                                    src={`${process.env.REACT_APP_BASE_URL}/${item.image.key}`}
                                    className="d-block w-100"
                                    alt="First slide"
                                  />
                                </td>
                              </tr></>}
                            <tr>
                              <th scope="row">Expires:</th>
                              {editMode[`${item._id}expiryDate`] ? (
                                <td>
                                  <div className="edit-mode-input display-flex">
                                    <div className="col-md-10 padding-right-0">
                                      <InputControl
                                        id={`${item._id}expiryDate`}
                                        name="expiryDate"
                                        type="date"
                                        placeholder="31 May 2020"
                                        value={item.expiryDate}
                                        required
                                        onChange={(e) =>
                                          handleInput(e, index)
                                        }
                                      />
                                    </div>
                                    <div className="col-md-2 padding-left-0">
                                      <div className="margin-top-7 display-flex">
                                        <i
                                          onClick={() => {
                                            updateBenefit(
                                              item._id,
                                              {
                                                expiryDate: new Date(
                                                  item.expiryDate
                                                ).toISOString(),
                                                postDate: new Date(
                                                  item.postDate
                                                ).toISOString(),
                                              },
                                              'expiryDate'
                                            );
                                          }}
                                          className="ficon feather icon-check icn-save cursor-pointer"
                                        ></i>{' '}
                                              &nbsp;&nbsp;&nbsp;
                                              <i
                                          onClick={() => {
                                            setEditMode({
                                              ...editMode,
                                              [`${item._id}expiryDate`]: false,
                                            });
                                          }}
                                          className="ficon feather icon-x icn-cancel cursor-pointer"
                                        ></i>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              ) : (
                                  <>
                                    <td>
                                      {new Date(
                                        item.expiryDate
                                      ).toLocaleDateString()}
                                    </td>
                                    {activeTab !== 'past' && <td>
                                      <i
                                        onClick={() => {
                                          setEditMode({
                                            ...editMode,
                                            [`${item._id}expiryDate`]: true,
                                          });
                                        }}
                                        className="ficon feather icon-edit icn-edit cursor-pointer"
                                      ></i>
                                    </td>}
                                  </>
                                )}
                              {/* <td>{item.expiryDate}</td>
                                  <td>
                                    <i className="ficon feather icon-edit icn-edit cursor-pointer"></i>
                                  </td> */}
                            </tr>
                          </tbody>
                        </table>
                        <div className="card border mb-0">
                          <div className="card-header">
                            <h4 className="card-title">Uptake unique by user</h4>
                          </div>
                          <div className="card-content">
                            <div className="card-body">
                              <BarChart id={'qwerty' + index} data={item.chartData || []} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Carousel>
              ) : (
                  <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-10">
                      <div
                        className="alert alert-warning font-size-20"
                        role="alert"
                      >
                        <center>No Data Found</center>
                      </div>
                    </div>
                    <div className="col-md-1"></div>
                  </div>
                )}
            </div>
          </div>

          {/* <div className="card-content">
                  <div className="card-body">
                    <div id="carousel-example-generic" className="carousel slide" data-ride="carousel">
                      <ol className="carousel-indicators">
                        <li data-target="#carousel-example-generic" data-slide-to="0" className="active"></li>
                        <li data-target="#carousel-example-generic" data-slide-to="1"></li>
                      </ol>
                      <div className="carousel-inner" role="listbox">
                        <div className="carousel-item active">
                          <div className="row justify-content-around">
                            {(data.benefitList.data||[]).map((index) => (
                              <div key={index} className={`col-5 ${index % 2 !== 0 ? 'ml-5' : 'mr-5'}`}>
                                <div className="table-responsive">
                                  <table className="table border">
                                    <tbody>
                                      <tr>
                                        <th scope="row">Title:</th>
                                        <td>10% off Merchandise</td>
                                        <td>
                                          <i className="ficon feather icon-edit icn-edit cursor-pointer"></i>
                                        </td>
                                      </tr>
                                      <tr>
                                        <th scope="row">Price:</th>
                                        <td>1,800 MM pts</td>
                                        <td>
                                          <i className="ficon feather icon-edit icn-edit cursor-pointer"></i>
                                        </td>
                                      </tr>
                                      <tr>
                                        <th scope="row">Status availability:</th>
                                        <td></td>
                                        <td>
                                          <i className="ficon feather icon-edit icn-edit cursor-pointer"></i>
                                        </td>
                                      </tr>
                                      <tr>
                                        <th scope="row"></th>
                                        <td>Silver</td>
                                        <td>
                                          <fieldset>
                                            <div className="vs-radio-con">
                                              <input type="radio" name={'silver' + index} checked value="silver" />
                                              <span className="vs-radio">
                                                <span className="vs-radio--border"></span>
                                                <span className="vs-radio--circle"></span>
                                              </span>
                                            </div>
                                          </fieldset>
                                        </td>
                                      </tr>
                                      <tr>
                                        <th scope="row"></th>
                                        <td>Gold</td>
                                        <td>
                                          <fieldset>
                                            <div className="vs-radio-con">
                                              <input type="radio" name={'silver' + index} checked value="gold" />
                                              <span className="vs-radio">
                                                <span className="vs-radio--border"></span>
                                                <span className="vs-radio--circle"></span>
                                              </span>
                                            </div>
                                          </fieldset>
                                        </td>
                                      </tr>
                                      <tr>
                                        <th scope="row"></th>
                                        <td>Platinum</td>
                                        <td>
                                          <fieldset>
                                            <div className="vs-radio-con">
                                              <input type="radio" name={'silver' + index} value="platinum" />
                                              <span className="vs-radio">
                                                <span className="vs-radio--border"></span>
                                                <span className="vs-radio--circle"></span>
                                              </span>
                                            </div>
                                          </fieldset>
                                        </td>
                                      </tr>
                                      <tr>
                                        <th scope="row">PROMO CODE:</th>
                                        <td>DISCOUNT001</td>
                                        <td>
                                          <i className="ficon feather icon-edit icn-edit cursor-pointer"></i>
                                        </td>
                                      </tr>
                                      <tr>
                                        <th scope="row">URL:</th>
                                        <td>www.merchbar.com</td>
                                        <td>
                                          <i className="ficon feather icon-edit icn-edit cursor-pointer"></i>
                                        </td>
                                      </tr>
                                      <tr>
                                        <th scope="row">Image:</th>
                                        <td></td>
                                        <td>
                                          <i className="ficon feather icon-edit icn-edit cursor-pointer"></i>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td colSpan="3">
                                          <img src="../../../app-assets/images/slider/01.jpg" className="d-block w-100" alt="First slide" />
                                        </td>
                                      </tr>
                                      <tr>
                                        <th scope="row">Expires:</th>
                                        <td>5 May, 2020</td>
                                        <td>
                                          <i className="ficon feather icon-edit icn-edit cursor-pointer"></i>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <div className="card border mb-0">
                                    <div className="card-header">
                                      <h4 className="card-title">Uptake</h4>
                                    </div>
                                    <div className="card-content">
                                      <div className="card-body">
                                        <BarChart id={'qwerty' + index} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <a className="carousel-control-prev" href="#carousel-example-generic" role="button" data-slide="prev">
                        <i className="ficon feather icon-chevron-left font-size-100 primary"></i>
                        <span className="sr-only">Previous</span>
                      </a>
                      <a className="carousel-control-next" href="#carousel-example-generic" role="button" data-slide="next">
                        <i className="ficon feather icon-chevron-right font-size-100 primary"></i>
                        <span className="sr-only">Next</span>
                      </a>
                    </div>
                  </div>
                </div> */}
        </div>
      </div>
      <div className="col-12">
        <button
          onClick={() => history.push('/benefit')}
          type="button"
          className="btn btn-primary block mb-3 font-size-25"
        >
          &#9734; Add Rewards &#9734;
              </button>
      </div>
    </div>
  </div>
}

export default Rewards;