import {getServerData} from './js/app';
import {locationFound} from './js/app';
import {generateTripData} from './js/app';
import regeneratorRuntime from 'regenerator-runtime'; //This module is used to provide a runtime for async functions.

import './styles/base.scss';
import './styles/footer.scss';
import './styles/form.scss';
import './styles/header.scss';
import './styles/main.scss';

import './media/globe-3411506_1920.jpg';

document.getElementById('schedule-trip').addEventListener('click', generateTripData);

export {
  getServerData,
  locationFound,
  generateTripData,
  regeneratorRuntime
}
