import * as parseJSON from './parseJSON'
import * as charts from './charts'
import * as calculations from './calculations'

export const options: ResponseSettings = {
  url: 'https://canning.herokuapp.com/',
  dateStart: new Date('2022-12-01T00:00'),
  dateEnd: new Date('2022-12-17T00:00'),
  showBasalChart: false,
  showBGChart: true,
  showCOBChart: false,
  COBRate: NaN,
  adjustBasalRates: true,
  ISF: NaN,
  weight: 80,
  minBG: NaN,
  targetBG: 110,
  poolingTime: 120,
}

window.options = options;
window.actionPerformed = actionPerformed;

async function actionPerformed(options: ResponseSettings) {
  await parseJSON.setProfile(options)

  const bgArray = await parseJSON.getBG(
    options.url,
    options.dateStart,
    options.dateEnd
  )
  console.log("bgArray:", bgArray)

  const tempBasals = await parseJSON.getTempBasal(
    options.url,
    options.dateStart,
    options.dateEnd
  )
  console.log("tempBasals",tempBasals)

  const basalProfiles = parseJSON.getBasalProfile(
    options.dateStart,
    options.dateEnd
  )
  console.log("basalProfiles", basalProfiles)

  const netBasals = calculations.getNetBasals(tempBasals, basalProfiles)
  console.log("NetBasals", netBasals)

  const netBasalDailyTotals = calculations.sumAmountPerDay(netBasals)
  console.log("netBasalDailyTotals", netBasalDailyTotals)

  const netBolusDailyTotals = await parseJSON.getDailyBolusTotals(
    options.url,
    options.dateStart,
    options.dateEnd
  )
  console.log("netBolusDailyTotals" , netBolusDailyTotals)

  //returns all 288 values
  const avgBgArray = calculations.averageBGs(bgArray)
    console.log("avgBgArray: ", avgBgArray)

  //returns every fourth value to make mobile views better
  const avgBgArrayMobileView = calculations.averageBGsMobileView(bgArray)
    console.log("avgBgArrayMobileView: ", avgBgArrayMobileView)

  const dailyTotalInsulin = calculations.dailyTotalInsulin(netBolusDailyTotals, netBasalDailyTotals)
   console.log("dailyTotalInsulin", dailyTotalInsulin)

  const isfRecommendations = calculations.isfCalculator(dailyTotalInsulin, netBasalDailyTotals)
    console.log("isfRecommendations: ", isfRecommendations)

  const icrRecommendations = calculations.icrCalculator(options.weight, netBasalDailyTotals, dailyTotalInsulin)
    console.log("icrRecommendations: ", icrRecommendations)
  
  displayTable(icrRecommendations, 'icr-table')
  displayTable(isfRecommendations, 'isf-table')
  
   let basalDivId = 'bg-chart'
  //This is for mobile views  
  charts.renderChartMobileView(avgBgArrayMobileView, basalDivId)

  //This is for desktop views
  // charts.renderChart(avgBgArray, basalDivId)

}actionPerformed(options)

function displayTable(data, divID) {
  console.log('divID',divID)
  const div = document.getElementById(divID);
  div.innerHTML = ''; // Clear the contents of the div

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      div.innerHTML += `<p>${key}: ${value}</p>`;
    }
  }
}
