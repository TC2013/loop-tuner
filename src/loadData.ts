import * as parseJSON from './parseJSON'

//<--------- GET BG, PROFILE, TEMP BASAL, AND BOLUS DATA --------->

// TODO: Add function that if url changes, it will clear local storage
// TODO: Add function that if date range falls outside of local storage, then it will clear local storage
export async function rawData(options: ResponseSettings) {
  // check if profileDateStart and profileDateEnd exist in local storage
  if (
      localStorage.getItem('profileDateStart') === options.dateStart.toString()
      && localStorage.getItem('profileDateEnd') === options.dateEnd.toString()
  ) {
    console.log("Profile stored in local storage")
  } else {
    // if they don't, generate the profile and save it to local storage
    let profile = await parseJSON.getAllProfiles(options);
    localStorage.setItem('profile', JSON.stringify(profile));
    let profileDateStart = options.dateStart;
    let profileDateEnd = options.dateEnd;
    profileDateStart.setHours(0, 0, 0, 0);
    profileDateEnd.setHours(0, 0, 0, 0);
    localStorage.setItem('profileDateStart', profileDateStart);
    localStorage.setItem('profileDateEnd', profileDateEnd);
  }

  if (
    localStorage.getItem('bgArrDateStart') === options.dateStart.toString()
    && localStorage.getItem('bgArrDateEnd') === options.dateEnd.toString()
  ) {
    console.log("BGs stored in local storage")
  } else {
    // if they don't, generate the BGs and save it to local storage
    const bgArr = await parseJSON.getBG(options)
      // set BG time to nearest 5 minute increment
      bgArr.forEach((item) => {
        item.forEach((bg) => {
          bg.time = new Date(bg.time);
          bg.time.setMinutes(bg.time.getMinutes() - bg.time.getMinutes() % 5);
          bg.time.setSeconds(0);
        });
      });
    localStorage.setItem('bgArr', JSON.stringify(bgArr));
    let bgArrDateStart = options.dateStart;
    let bgArrDateEnd = options.dateEnd;
    bgArrDateStart.setHours(0, 0, 0, 0);
    bgArrDateEnd.setHours(0, 0, 0, 0);
    localStorage.setItem('bgArrDateStart', bgArrDateStart);
    localStorage.setItem('bgArrDateEnd', bgArrDateEnd);
  }

  if (
    localStorage.getItem('tempBasalsDateStart') === options.dateStart.toString()
    && localStorage.getItem('tempBasalsDateEnd') === options.dateEnd.toString()
  ) {
    console.log("TempBasals stored in local storage")
  } else {
    // if they don't, generate the tempBasal and save it to local storage
    const tempBasals = await parseJSON.getTempBasal(options.url, options.dateStart, options.dateEnd)
    localStorage.setItem('tempBasals', JSON.stringify(tempBasals));
    let tempBasalsDateStart = options.dateStart;
    let tempBasalsDateEnd = options.dateEnd;
    tempBasalsDateStart.setHours(0, 0, 0, 0);
    tempBasalsDateEnd.setHours(0, 0, 0, 0);
    localStorage.setItem('tempBasalsDateStart', tempBasalsDateStart);
    localStorage.setItem('tempBasalsDateEnd', tempBasalsDateEnd);
  }

  if (
    localStorage.getItem('bolusJSONDateStart') === options.dateStart.toString()
    && localStorage.getItem('bolusJSONDateEnd') === options.dateEnd.toString()
  ) {
    console.log("BolusJSON store in local storage")
  } else {
    // if they don't, generate the bolusJSON and save it to local storage
    const bolusJSON = await parseJSON.getAllBoluses(options)
    localStorage.setItem('bolusJSON', JSON.stringify(bolusJSON));
    let bolusJSONDateStart = options.dateStart;
    let bolusJSONDateEnd = options.dateEnd;
    bolusJSONDateStart.setHours(0, 0, 0, 0);
    bolusJSONDateEnd.setHours(0, 0, 0, 0);
    localStorage.setItem('bolusJSONDateStart', bolusJSONDateStart);
    localStorage.setItem('bolusJSONDateEnd', bolusJSONDateEnd);
  }
}

export function save(item, storageType = "session") {
  if (typeof item === 'object') {
      item = JSON.stringify(item);
  }
  if (storageType === "local") {
      localStorage.setItem('item', item);
  } else {
      sessionStorage.setItem('item', item);
  }
}

export function get(name, storageType = "session") {
  let item;
  if (storageType === "local") {
      item = localStorage.getItem(name);
  } else {
      item = sessionStorage.getItem(name);
  }
  try {
      item = JSON.parse(item);
  } catch (e) {
      // item is not a json string
  }
  return item;
}

export function clear(name, storageType = null) {
  if (storageType === "local" || (storageType === null && localStorage.getItem(name))) {
      localStorage.removeItem(name);
  } else {
      sessionStorage.removeItem(name);
  }
}
