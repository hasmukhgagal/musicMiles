/**
 * @name util.service.js
 * @description All util function goes here
 * @version 0.0.0
 */


function getUser() {
  return JSON.parse(localStorage.getItem('user') || '{}');
}

export { getUser };
