import { accessTripData } from './js/app';
import { addActivity} from './js/app';
import { checkForBlankFields } from './js/app';
import { checkDateInput } from './js/app';
import { deleteActivityData } from './js/app';
import { deleteServerData } from './js/app';
import { displayPlannedActivities } from './js/app';
import { displaySelectedTrip } from './js/app';
import { displayTripData } from './js/app';
import { displayWeatherData } from './js/app';
import { getDaysElapsed } from './js/app';
import { getServerData } from './js/app';
import { loadTripData } from './js/app';
import { processWeatherData } from './js/app';
import { locationFound } from './js/app';
import { generateTripData } from './js/app';
import { findLocationPhotograph } from './js/app';
import regeneratorRuntime from 'regenerator-runtime'; //This module is used to provide a runtime for async functions.

import './styles/base.scss';
import './styles/footer.scss';
import './styles/form.scss';
import './styles/header.scss';
import './styles/main.scss';

import './media/globe-3411506_1920.jpg';
import './media/NoImageFound.png';
import './media/icon_t01d.png';
import './media/icon_t04d.png';
import './media/icon_d01d.png';
import './media/icon_r01d.png';
import './media/icon_r03d.png';
import './media/icon_r05d.png';
import './media/icon_s01d.png';
import './media/icon_s02d.png';
import './media/icon_s05d.png';
import './media/icon_s06d.png';
import './media/icon_a01d.png';
import './media/icon_c01d.png';
import './media/icon_c02d.png';
import './media/icon_c03d.png';
import './media/icon_c04d.png';

function selectRow(rowSelected) {
  const classes = rowSelected.target.parentElement.classList;
  for(let someClass of classes) {
    if(someClass === 'data-row') {
      rowSelected.target.parentElement.classList.toggle('selected-data-row');
    }
  }
}

document.addEventListener('DOMContentLoaded', loadTripData);
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('schedule-trip').addEventListener('click', generateTripData);
  document.getElementById('trip-schedule-table').addEventListener('click', selectRow);
  document.getElementById('planned-activities-table').addEventListener('click', selectRow);
  document.getElementById('trip-info-buttons').addEventListener('click', accessTripData);
  document.getElementById('activity-info-buttons').addEventListener('click', deleteActivityData);
  document.getElementById('add-activity').addEventListener('click', addActivity);
});

export {
  accessTripData,
  addActivity,
  checkForBlankFields,
  checkDateInput,
  deleteActivityData,
  deleteServerData,
  displayPlannedActivities,
  displaySelectedTrip,
  displayTripData,
  displayWeatherData,
  getDaysElapsed,
  getServerData,
  loadTripData,
  processWeatherData,
  locationFound,
  generateTripData,
  findLocationPhotograph,
  regeneratorRuntime
};
