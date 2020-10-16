/**
 * @name resource.service.js
 * @description All api communication methods are here
 * @version 0.0.0
 */

import axios from './axios.service';
import { forEach } from 'lodash';

function get(route, query) {
  if (query) {
    return axios.get(`${route}${query}`);
  }
  return axios.get(`${route}`);
}

// can't be used directly
function post(route, data) {
  return axios.post(`${route}`, data);
}

// can't be used directly
function patch(route, data) {
  return axios.patch(`${route}`, data);
}

function save(route, id, data) {
  if (id === 'new') {
    return post(route, data);
  } else {
    return patch(`${route}/${id}`, data);
  }
}

function upload({ moduleId, moduleType, files, isMp3File }) {
  let formData = new FormData();

  formData.append('moduleId', moduleId);
  formData.append('moduleType', moduleType);
  
  if(isMp3File) {
    formData.append('isMp3File', true);
  }

  forEach(files, (file) => {
    formData.append('file', file);
  });

  return axios.post("media", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

function uploadExcelFile({ moduleId, files }) {
  let formData = new FormData();

  forEach(files, (file) => {
    formData.append('file', file);
  });

  return axios.patch(`benefit/upload-coupons/${moduleId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export { get, post, patch, save, upload, uploadExcelFile };
