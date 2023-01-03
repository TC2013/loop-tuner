import * as parseJSON from './parseJSON'
import * as options from './index'

//<--------- GET BG, PROFILE, TEMP BASAL, AND BOLUS DATA --------->

// TODO: Add function that if url changes, it will clear local storage
// TODO: Add function that if date range falls outside of local storage, then it will clear local storage
export async function rawData(options: ResponseSettings) {
  // check if profile and profileDateEnd exist in local storage
  if (localStorage.getItem('profile') && localStorage.getItem('profileDateEnd') === options.dateEnd.toString()) {
    // if they do, retrieve the profile and parse it into a JSON object
    let profile = JSON.parse(localStorage.getItem('profile'));
    console.log("Retrieved profile from local storage")
  } else {
    // if they don't, generate the profile and save it to local storage
    await parseJSON.setProfile(options)
    let profile = parseJSON.setProfile(options.dateStart, options.dateEnd);
    localStorage.setItem('profile', JSON.stringify(profile));
    let profileDateEnd = options.dateEnd;
    profileDateEnd.setHours(0, 0, 0, 0);
    localStorage.setItem('profileDateEnd', profileDateEnd);
  }

  if (localStorage.getItem('bgArr') && localStorage.getItem('bgArrDateEnd') === options.dateEnd.toString()) {
    // if they do, retrieve the profile and parse it into a JSON object
    let bgArr = JSON.parse(localStorage.getItem('bgArr'));
    console.log("Retrieved BGs from local storage")
  } else {
    // if they don't, generate the profile and save it to local storage
    const bgArr = await parseJSON.getBG(options.url, options.dateStart, options.dateEnd)
      // set BG time to nearest 5 minute increment
      bgArr.forEach((item) => {
        item.forEach((bg) => {
          bg.time = new Date(bg.time);
          bg.time.setMinutes(bg.time.getMinutes() - bg.time.getMinutes() % 5);
          bg.time.setSeconds(0);
        });
      });
    localStorage.setItem('bgArr', JSON.stringify(bgArr));
    let bgArrDateEnd = options.dateEnd;
    bgArrDateEnd.setHours(0, 0, 0, 0);
    localStorage.setItem('bgArrDateEnd', bgArrDateEnd);
  }

  if (localStorage.getItem('tempBasals') && localStorage.getItem('tempBasalsDateEnd') === options.dateEnd.toString()) {
    // if they do, retrieve the profile and parse it into a JSON object
    let tempBasals = JSON.parse(localStorage.getItem('tempBasals'));
    
    console.log("Retrieved tempBasals from local storage", tempBasals)
  } else {
    // if they don't, generate the profile and save it to local storage
    const tempBasals = await parseJSON.getTempBasal(options.url, options.dateStart, options.dateEnd)
    localStorage.setItem('tempBasals', JSON.stringify(tempBasals));
    let tempBasalsDateEnd = options.dateEnd;
    tempBasalsDateEnd.setHours(0, 0, 0, 0);
    localStorage.setItem('tempBasalsDateEnd', tempBasalsDateEnd);
  }

  if (localStorage.getItem('bolusJSON') && localStorage.getItem('bolusJSONDateEnd') === options.dateEnd.toString()) {
    // if they do, retrieve the profile and parse it into a JSON object
    let bolusJSON = JSON.parse(localStorage.getItem('bolusJSON'));
    console.log("Retrieved bolusJSON from local storage")
  } else {
    // if they don't, generate the profile and save it to local storage
    const bolusJSON = await parseJSON.getAllBoluses(options.url, options.dateStart, options.dateEnd)
    localStorage.setItem('bolusJSON', JSON.stringify(bolusJSON));
    let bolusJSONDateEnd = options.dateEnd;
    bolusJSONDateEnd.setHours(0, 0, 0, 0);
    localStorage.setItem('bolusJSONDateEnd', bolusJSONDateEnd);
  }
}