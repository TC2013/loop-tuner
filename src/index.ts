import * as parseJSON from './parseJSON'
import * as charts from './charts'
import * as calculations from './calculations'

export const options: ResponseSettings = {
  url: 'https://canning.herokuapp.com/',
  dateStart: new Date('2022-12-19T00:00'),
  dateEnd: new Date('2022-12-21T00:00'),
  showBasalChart: false,
  showBGChart: true,
  showCOBChart: false,
  COBRate: 30,
  adjustBasalRates: true,
  ISF: NaN,
  weight: 80,
  minBG: NaN,
  targetBG: 110,
  poolingTime: 120,
  period: 30,
}

window.options = options;
window.actionPerformed = actionPerformed;

async function actionPerformed(options: ResponseSettings) {

//GET BG, PROFILE, TEMP BASAL, AND BOLUS DATA

  await parseJSON.setProfile(options)
  const profile = parseJSON.getBasalProfile(options.dateStart, options.dateEnd)
  console.log("profile", profile)

  const bgArray = await parseJSON.getBG(options.url, options.dateStart, options.dateEnd)
  // console.log("bgArray:", bgArray)

  const tempBasals = await parseJSON.getTempBasal(options.url, options.dateStart, options.dateEnd)
  // console.log("tempBasals",tempBasals)

  const bolusJSON = await parseJSON.getAllBoluses(options.url, options.dateStart, options.dateEnd)
  // console.log('bolusJSON',bolusJSON)


//PROCESS BG DATA

  //returns average BGs all 288 values for the period selected 
  const avgBgArray = calculations.averageBGs(bgArray)
  // console.log("avgBgArray: ", avgBgArray)

  //returns every fourth value to make mobile views better
  const avgBgArrayMobileView = calculations.averageBGsMobileView(bgArray)
  // console.log("avgBgArrayMobileView: ", avgBgArrayMobileView)


//PROCESS TEMP BASAL DATA
  const totalTempBasalAmount = calculations.getTempBasalTotal(tempBasals)
  console.log("totalTempBasalAmount", totalTempBasalAmount)

  const netBasals = calculations.getNetBasals(tempBasals, profile)
  console.log("NetBasals", netBasals)

  const avgNetBasalsByPeriod = await calculations.averageNetBasals(netBasals)
  console.log("avgNetBasalsByPeriod", avgNetBasalsByPeriod)

  const avgBasalRatesByPeriod = await calculations.averageNetBasals(netBasals)
  // console.log('avgBasalRatesByPeriod',avgBasalRatesByPeriod)

  const netBasalDailyTotals = calculations.sumAmountPerDay(netBasals)
  console.log("netBasalDailyTotals", netBasalDailyTotals)

  const programmedDailyBasalTotal = calculations.getBasalProfileTotals(profile)
  console.log("programmedDailyBasalTotal", programmedDailyBasalTotal)


//PROCESS BOLUS DATA

  const avgCorrectionBolusesByPeriod = await calculations.avgCorrectionBoluses(bolusJSON, profile, options.dateStart, options.dateEnd)
  // console.log('avgCorrectionBolusesByPeriod', avgCorrectionBolusesByPeriod)

  const netBolusDailyTotals = await calculations.dailyBolusTotals(bolusJSON)
  console.log("netBolusDailyTotals" , netBolusDailyTotals)


//COMBINED FUNCTIONS AND RECOMMENDATIONS

  const dailyTotalInsulin = calculations.dailyTotalInsulin(netBolusDailyTotals, netBasalDailyTotals)
   console.log("dailyTotalInsulin", dailyTotalInsulin)

  const isfRecommendations = calculations.isfCalculator(dailyTotalInsulin, netBasalDailyTotals)
    // console.log("isfRecommendations: ", isfRecommendations)

  const icrRecommendations = calculations.icrCalculator(options.weight, netBasalDailyTotals, dailyTotalInsulin)
    // console.log("icrRecommendations: ", icrRecommendations)

  //this is the average total insulin delivered each 30 minutes only use with the Correction Bolus dosing strategy.
  const avgTotalInsulinByPeriod = await calculations.addBolusArrays(avgCorrectionBolusesByPeriod, avgBasalRatesByPeriod)
  console.log('avgTotalInsulinByPeriod2', avgTotalInsulinByPeriod)
  
  //this is summed amount of avgTotalInsulinByPeriod
  const avgTotalInsulinByDay = await calculations.sumArray(avgTotalInsulinByPeriod)
  console.log('avgTotalInsulinByDayNoMB', avgTotalInsulinByDay)
  

//DISPLAY DATA

  //Display the ICR and ISF recommendations
  displayTable(icrRecommendations, 'icr-table')
  displayTable(isfRecommendations, 'isf-table')

  //This is for mobile views  
  let basalDivId = 'bg-chart'
  charts.renderChartMobileView(avgBgArrayMobileView, basalDivId)
  
  //This is for desktop views
  // charts.renderChart(avgBgArray, basalDivId)
}
actionPerformed(options)

function displayTable(data, divID) {
  const div = document.getElementById(divID);
  div.innerHTML = ''; // Clear the contents of the div

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      div.innerHTML += `<p>${key}: ${value}</p>`;
    }
  }
}
