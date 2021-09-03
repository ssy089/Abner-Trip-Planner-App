import { checkForBlankFields } from './js/app';
import { checkDateInput } from './js/app';
import { displayPlannedActivities } from './js/app';
import { displayTripData } from './js/app';
import { displayWeatherData } from './js/app';
import { getDaysElapsed } from './js/app';
import { getServerData } from './js/app';
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

document.getElementById('schedule-trip').addEventListener('click', generateTripData);

export {
  checkForBlankFields,
  checkDateInput,
  displayPlannedActivities,
  displayTripData,
  displayWeatherData,
  getDaysElapsed,
  getServerData,
  processWeatherData,
  locationFound,
  generateTripData,
  findLocationPhotograph,
  regeneratorRuntime
};
