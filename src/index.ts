import * as parseJSON from './parseJSON'
import * as charts from './charts'
import * as calculations from './calculations'

export const options: ResponseSettings = {
  url: 'https://canning.herokuapp.com/',
  dateStart: new Date('2022-12-15T00:00'),
  dateEnd: new Date('2022-12-17T00:00'),
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
  await parseJSON.setProfile(options)

  const bgArray = await parseJSON.getBG(options.url, options.dateStart, options.dateEnd)
  // console.log("bgArray:", bgArray)

  const tempBasals = await parseJSON.getTempBasal(options.url, options.dateStart, options.dateEnd)
  console.log("tempBasals",tempBasals)

  const profile = parseJSON.getBasalProfile(options.dateStart, options.dateEnd)
  console.log("profile", profile)

  const netBasals = calculations.getNetBasals(tempBasals, profile)
  console.log("NetBasals", netBasals)

  const averageBasalRatesByPeriod = await calculations.averageNetBasals(netBasals)
  console.log('averageBasalRatesByPeriod',averageBasalRatesByPeriod)

  const netBasalDailyTotals = calculations.sumAmountPerDay(netBasals)
  console.log("netBasalDailyTotals", netBasalDailyTotals)

  const bolusJSON = await parseJSON.getCorrectionBoluses(options.url, options.dateStart, options.dateEnd)
  console.log('bolusJSON',bolusJSON)

  const netBolusDailyTotals = await calculations.dailyBolusTotals(bolusJSON)
  // console.log("netBolusDailyTotals" , netBolusDailyTotals)

  //returns average BGs all 288 values for the period selected 
  const avgBgArray = calculations.averageBGs(bgArray)
    // console.log("avgBgArray: ", avgBgArray)

  //returns every fourth value to make mobile views better
  const avgBgArrayMobileView = calculations.averageBGsMobileView(bgArray)
    // console.log("avgBgArrayMobileView: ", avgBgArrayMobileView)

  const dailyTotalInsulin = calculations.dailyTotalInsulin(netBolusDailyTotals, netBasalDailyTotals)
  //  console.log("dailyTotalInsulin", dailyTotalInsulin)

  const isfRecommendations = calculations.isfCalculator(dailyTotalInsulin, netBasalDailyTotals)
    // console.log("isfRecommendations: ", isfRecommendations)

  const icrRecommendations = calculations.icrCalculator(options.weight, netBasalDailyTotals, dailyTotalInsulin)
    // console.log("icrRecommendations: ", icrRecommendations)
  
  displayTable(icrRecommendations, 'icr-table')
  displayTable(isfRecommendations, 'isf-table')

  // const averageBasals = await calculations.averageBasals(options.url, options.dateStart, options.dateEnd, options.period, netBasals, tempBasals, profile)
  // console.log('averageBasals',averageBasals)

  // const DIA = await calculations.getDIA(
  //   bolusJSON,    
  //   options.url,
  //   options.dateStart,
  //   options.dateEnd,
  //   options.weight, 
  //   options.poolingTime
  // ) 
  // console.log('DIA',DIA)


  //This is for mobile views  
  let basalDivId = 'bg-chart'
  charts.renderChartMobileView(avgBgArrayMobileView, basalDivId)

  //This is for desktop views
  // charts.renderChart(avgBgArray, basalDivId)

}
// actionPerformed(options)

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
