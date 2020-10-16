import React, { useState, useMemo } from 'react';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';

import FileInput from '../../components/common/FileInput/FileInput';
import InputControl from '../../components/form-control/Input';
import VimeoConnect from '../../components/vimeo';
import { save, upload, uploadExcelFile } from '../../services/resource.service';
import { useHistory, NavLink } from 'react-router-dom';

function Benefit({ activeArtist }) {
  const history = useHistory();
  const downloadFileLink = `${process.env.REACT_APP_BASE_URL}/coupons.xlsx`;
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

  const [isValid, setIsValid] = useState(false);
  const [image, setImage] = useState();
  const [audio, setAudio] = useState();
  const [file, setFile] = useState();

  const [benefit, setBenefit] = useState({
    status: [
      {
        key: 'Silver',
        isActive: false,
      },
      {
        key: 'Gold',
        isActive: false,
      },
      {
        key: 'Platinum',
        isActive: false,
      },
    ],
    isMultipleTime: false,
  });

  const reset = () => {
    setBenefit({
      status: [
        {
          key: 'Silver',
          isActive: false,
        },
        {
          key: 'Gold',
          isActive: false,
        },
        {
          key: 'Platinum',
          isActive: false,
        },
      ],
      isMultipleTime: false,
    })
    setAudio(null);
    setFile(null);
    setImage(null);
    setTimeout(() => {
      setAudio()
      setImage()
      setFile()
    }, 100)
    handleValidation();
  }

  const scheduleTimeParsed = useMemo(() => {
    if (benefit.scheduleTime) {
      let dd = new Date();
      dd.setHours(benefit.scheduleTime.substr(0, 2), benefit.scheduleTime.substr(3, 2))
      return window.moment(dd)
    }
    return null
  }, [benefit])

  const saveBenefit = async () => {
    const obj = buildSaveObject(benefit);
    const data = await save(`/benefit?artist=${activeArtist._id}`, 'new', obj).catch((error) =>
      console.log(error)
    );

    if (image && data) {
      await upload({
        moduleType: 'benefit',
        moduleId: data._id,
        files: image,
      });
    }

    if (
      benefit.category === 'Exclusive Audio Content' &&
      audio &&
      !benefit.url &&
      data
    ) {
      await upload({
        moduleType: 'benefit',
        moduleId: data._id,
        files: audio,
        isMp3File: true,
      });
    }

    if (
      benefit.category === 'Merchandise Discount' &&
      file &&
      data
    ) {
      await uploadExcelFile({
        moduleId: data._id,
        files: file,
      });
    }

    if (data) {
      history.push('/rewards');
    }

  };

  const buildSaveObject = (obj) => {
    obj.postDate = new Date(obj.postDate).toISOString();
    obj.expiryDate = new Date(obj.expiryDate).toISOString();
    if (obj.category === 'Live Session') {
      obj.scheduleDate = new Date(
        `${obj.scheduleDate}T${obj.scheduleTime}`
      ).toISOString();
      delete obj.scheduleTime;
    }

    return obj;
  };

  const onChange = (e) => {
    const { name, value } = e.target;

    benefit[name] = value;
    if (name === 'category') {
      benefit['categoryIndex'] = categoryOptions.findIndex(cat => cat.label === value);
    }

    handleValidation();
    setBenefit({ ...benefit });
  };

  const onStatusChange = (value, index) => {
    if (benefit.status && benefit.status.length) {
      benefit.status[index].isActive = value;
    }

    handleValidation();

    setBenefit({ ...benefit });
  };

  const handleValidation = () => {
    let flag = true;
    if (benefit.url) {
      try {
        new URL(benefit.url);
      } catch (e) {
        flag = false
      }
    }
    if (
      !benefit.price ||
      !benefit.title ||
      !(benefit.status || []).length ||
      !benefit.description ||
      !benefit.postDate ||
      !benefit.expiryDate ||
      !benefit.category
    ) {
      flag = false;
    }

    if (
      benefit.category === 'Merchandise Discount' &&
      (!file || !benefit.url)
    ) {
      flag = false;
    } else if (benefit.category === 'Merchandise Exclusives' && !benefit.url) {
      flag = false;
    }
    else if (benefit.category === 'Exclusive Video Content') {
      flag = flag && (!!benefit.vimeoVideoUrl || !!benefit.url);
    }
    else if (benefit.category === 'Exclusive Audio Content') {
      flag = flag && (!!benefit.url || !!benefit.audio);
    }
    else if (
      benefit.category === 'Live Session' &&
      (!benefit.scheduleDate ||
        !benefit.scheduleTime ||
        !benefit.scheduleTimezone ||
        !benefit.url)
    ) {
      flag = false;
    }
    else if (benefit.category === 'Shout-out Video') {
      flag = flag && !!benefit.vimeoUserName && (!!benefit.vimeoVideoUrl || !!benefit.url);
    }

    setIsValid(flag);
  };

  const onFileChange = (files, type) => {
    if (type === 'image') {
      setImage(files);
    } else if (type === 'file') {
      setFile(files)
    } else {
      setAudio(files);
    }
  };

  function getInput(control) {
    switch (control) {
      case 'promocode':
        return (
          <div className="col-12">
            <div className="form-group row">
              <div className="col-md-4">
                <span>PROMO CODE</span>
              </div>
              <div className="col-md-8">
                <a href={downloadFileLink} id="downloadfile" className="float-right" target="_blank" rel="noopener noreferrer" download>
                  <i className="fa fa-download"></i> Download Sample File
                </a>
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
            id="url"
            name="url"
            placeholder="Insert website for code"
            value={benefit.url}
            required
            onChange={onChange}
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
                  id="date"
                  name="scheduleDate"
                  placeholder="01 Jan 20"
                  value={benefit.scheduleDate}
                  onChange={onChange}
                />

                <div className="col-12">
                  <div className="form-group row">
                    <div className="col-md-4">
                      <span>Time</span>
                    </div>
                    <div className="col-md-8">
                      <TimePicker
                        showSecond={false}
                        placeholder="HH:MM"
                        className="d-block"
                        defaultValue={scheduleTimeParsed}
                        onChange={val => {
                          if (!!val) {
                            benefit['scheduleTime'] = val.format('HH:MM');
                          } else {
                            benefit['scheduleTime'] = "";
                          }
                          handleValidation();
                          setBenefit({ ...benefit });
                        }}
                      />
                    </div>
                  </div>
                </div>


                {/* <InputControl
                  label="Time"
                  type="time"
                  id="time"
                  name="scheduleTime"
                  placeholder="12:00 PM"
                  value={benefit.scheduleTime}
                  onChange={onChange}
                /> */}

                <InputControl
                  label="Timezone"
                  type="timezone"
                  id="timezone"
                  name="scheduleTimezone"
                  placeholder="BST"
                  value={benefit.scheduleTimezone}
                  onChange={onChange}
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
            id="file"
            name="file"
            extension="audio/mp3"
            value={audio}
            placeholder="Upload audio file (max file size: 7MB & MP3 file)"
            onChange={(files) => onFileChange(files, 'audio')}
          />
        );

      case 'username':
        return (
          <InputControl
            label="User Name"
            type="text"
            id="username"
            name="vimeoUserName"
            placeholder="Insert username"
            value={benefit.vimeoUserName}
            onChange={onChange}
          />
        );

      case 'vimeo':
        return <VimeoConnect
          selectedVideo={benefit.vimeoVideoUrl}
          onSelect={(videoLink) => {
            benefit['vimeoVideoUrl'] = videoLink;
            setBenefit({ ...benefit });
            handleValidation()
          }}
        />;

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

  return (
    <div>
      <div className="content-body">
        <section id="basic-horizontal-layouts">
          <div className=" match-height">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Add Benefits</h4>
              </div>
              <div className="card-content">
                <div className="card-body">
                  <form className="form form-horizontal" noValidate>
                    <div className="form-body row">
                      <div className="col-md-6 col-12">
                        <div className="row">
                          <InputControl
                            label="Price"
                            id="price"
                            name="price"
                            type="number"
                            placeholder="MM Points"
                            value={benefit.price}
                            required
                            onChange={onChange}
                          />
                          <InputControl
                            label="Title"
                            id="title"
                            name="title"
                            placeholder="Insert Title Name"
                            value={benefit.title}
                            required
                            onChange={onChange}
                          />

                          <div className="col-12">
                            <div className="form-group row">
                              <div className="col-md-4">
                                <span>*Status Availability</span>
                              </div>
                              <div className="col-md-8">
                                <div className="row">
                                  {benefit.status.map((item, index) => (
                                    <div
                                      className="col-md-4 display-flex"
                                      key={item.key}
                                    >
                                      <input
                                        type="checkbox"
                                        className="form-control custom-checkbox"
                                        id={`${item.key}status`}
                                        name="status"
                                        value={item.isActive}
                                        checked={item.isActive}
                                        required
                                        onChange={() =>
                                          onStatusChange(!item.isActive, index)
                                        }
                                      />
                                      &nbsp;&nbsp;{item.key}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <InputControl
                            label="Description"
                            type="textarea"
                            id="description"
                            name="description"
                            placeholder="Insert description"
                            value={benefit.description}
                            required
                            onChange={onChange}
                          />
                          <InputControl
                            label="Post Date"
                            type="date"
                            id="postDate"
                            name="postDate"
                            placeholder="3 April 2020"
                            value={benefit.postDate}
                            required
                            onChange={onChange}
                          />
                          <InputControl
                            label="Expiry Date"
                            type="date"
                            id="expiryDate"
                            name="expiryDate"
                            placeholder="31 May 2020"
                            min={benefit.postDate}
                            value={benefit.expiryDate}
                            required
                            onChange={onChange}
                          />
                          <InputControl
                            label="Benefit Image"
                            type="file"
                            id="benefitImage"
                            name="benefitImage"
                            extension="image/*"
                            value={image}
                            placeholder="Benefit Image"
                            onChange={(files) => onFileChange(files, 'image')}
                          />
                          <InputControl
                            label="Uptake Limit"
                            type="number"
                            id="limit"
                            name="limit"
                            placeholder="People"
                            value={benefit.limit}
                            onChange={onChange}
                          />
                          <InputControl
                            label="Can user claim multiple times?"
                            type="checkbox"
                            id="isMultipleTime"
                            name="isMultipleTime"
                            value={benefit.isMultipleTime}
                            required
                            onChange={onChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6 col-12">
                        <div className="row">
                          <InputControl
                            label="Benefit Category"
                            type="select"
                            id="category"
                            name="category"
                            placeholder="Choose From Categories"
                            value={benefit.category}
                            options={categoryOptions}
                            onChange={onChange}
                          />

                          {benefit.category &&
                            categoryOptions
                              .find(
                                (option) => option.label === benefit.category
                              )
                              .controls.map(getInput)}
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="float-left">
                          <NavLink
                            to="/"
                            className="btn btn-primary mr-1 "
                          >
                            Dashboard
                          </NavLink>
                        </div>
                        <div className="float-right">
                          <button
                            type="button"
                            disabled={!isValid}
                            onClick={saveBenefit}
                            className="btn btn-primary mr-1 "
                          >
                            Publish
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-warning "
                            onClick={reset}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Benefit;
