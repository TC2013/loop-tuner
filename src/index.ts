import * as loadData from './loadData'
import * as cookie from './cookie'
import * as DIA from './calculations/DIA'


export const options: ResponseSettings = {
  url: 'https://canning.herokuapp.com/',
  dateStart: new Date('2022-12-20T00:00'),
  dateEnd: new Date('2022-12-22T00:00'),
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
  period: 30
}
// //this will set options.dateEnd to 12 am local time today
// options.dateEnd = new Date()
// options.dateEnd.setHours(0, 0, 0, 0)
// //this will set options.dateStart to 12 am local time 30 days ago
// options.dateStart = new Date(options.dateEnd.getTime() - 2 * 24 * 60 * 60 * 1000)
window.options = options;
window.actionPerformed = actionPerformed;

async function actionPerformed(options: ResponseSettings) {
  console.log("actionPerformed started")
  cookie.checkCookies()
  loadData.rawData(options)
  DIA.getDIA(options)

}
actionPerformed(options)

// function displayTable(data, divID) {
//   const div = document.getElementById(divID);
//   div.innerHTML = ''; // Clear the contents of the div

//   for (const key in data) {
//     if (data.hasOwnProperty(key)) {
//       const value = data[key];
//       div.innerHTML += `<p>${key}: ${value}</p>`;
//     }
//   }
// }

// //PROCESS BG DATA

//   //returns average BGs all 288 values for the period selected 
//   avgBGArr = misc.averageBGs(bgArr)
//   // console.log("avgBGArray: ", avgBGArr)
//   // Convert the array to a string
//   var avgBGArrString = JSON.stringify(avgBGArr);

// // Save the string to session storage
// sessionStorage.setItem('avgBGArr', avgBGArrString);

//   //returns every fourth value to make mobile views better
//   const avgBGArrayMobileView = misc.averageBGsMobileView(bgArr)
//   // console.log("avgBGArrayMobileView: ", avgBGArrayMobileView)
  


// //PROCESS TEMP BASAL DATA
//   const tempBasalTotalsByDate = misc.getTempBasalTotal(tempBasals)
//   console.log("tempBasalTotalsByDate", tempBasalTotalsByDate)

//   const netProfileBasals = misc.getProfileBasalTotal(tempBasals, profile)
//   // console.log("This returns the array for when default basals ran", netProfileBasals)

//   const defaultBasalTotalsByDate = await misc.sumDefaultBasalDelivery(netProfileBasals)
//   console.log("defaultBasalTotalsByDate", defaultBasalTotalsByDate)

//   //all basals (temp and default chronicling the actual basal insulin delivered down to the second)
//   const netTempBasals = misc.getNetBasals(tempBasals, profile)
//   // console.log("NetBasals", netTempBasals)

//   //netTempBasals (default and temp) divided into 30 minutes periods and averaged
//   const avgBasalRatesByPeriod = await misc.averageNetTempBasalsByPeriod(netTempBasals, options.dateStart, options.dateEnd)
//   console.log('avgBasalRatesByPeriod',avgBasalRatesByPeriod)

//   //This is a sum total by day.
//   const combinedBasalDailyTotals = await misc.sumBasalAmountPerDay(netTempBasals)
//   console.log("combinedBasalDailyTotals", combinedBasalDailyTotals)

//   // const programmedDailyBasalTotal = misc.getBasalProfileTotals(profile, options.dateStart, options.dateEnd)
//   // console.log("programmedDailyBasalTotal", programmedDailyBasalTotal)


// //PROCESS BOLUS DATA

  // const dailyBolusTotals = await misc.sumBolusAmountPerDay(bolusJSON)
  // console.log("dailyBolusTotals", dailyBolusTotals)

//   const [avgBolusBasalByPeriod, preBolusArray] = await misc.avgBolusBasalByPeriod(bolusJSON, profile, options.dateStart, options.dateEnd)
//   console.log('avgBolusBasalByPeriod', avgBolusBasalByPeriod)
//   console.log('preBolusArray', preBolusArray)

//   // const netBolusDailyTotals = await misc.dailyBolusTotals(bolusJSON)

//   //preBolusArray has sutracted Meal Boluses insulin from the Correction Boluses so the remaining insulin should be considered basal insulin.
//   const basalBolusDailyTotals = await misc.dailyBolusTotals(preBolusArray)
//   console.log("basalBolusDailyTotals" , basalBolusDailyTotals)

//   //This is the amount of insulin actually used to cover carb corrections. This insulin is not included in the basal carb correction insulin.
//   const mealBolusTotalsByDate = await misc.mealBolusTotalsByDate(preBolusArray)
//   console.log('mealBolusTotalsByDate', mealBolusTotalsByDate)

// //COMBINED FUNCTIONS AND RECOMMENDATIONS

//   //this is the average total insulin delivered each 30 minutes, includes default basal, temp basal, and correction boluses. It does not include meal boluses.
 
//   const avgTotalInsulinByPeriod = await misc.addBolusArrays(avgCorrectionBolusesByPeriod, avgBasalRatesByPeriod)
//   window.avgTotalInsulinByPeriod = avgTotalInsulinByPeriod
//   console.log('avgTotalInsulinByPeriod', avgTotalInsulinByPeriod)

//   const dailyTotalInsulin = misc.dailyTotalInsulin(dailyBolusTotals, combinedBasalDailyTotals)
//    console.log("dailyTotalInsulin", dailyTotalInsulin)

//   const isfRecommendations = misc.isfCalculator(dailyTotalInsulin, combinedBasalDailyTotals)
//     // console.log("isfRecommendations: ", isfRecommendations)

//   const icrRecommendations = misc.icrCalculator(options.weight, combinedBasalDailyTotals, dailyTotalInsulin)
//     // console.log("icrRecommendations: ", icrRecommendations)



//   // const DIA = misc.getDIA(avgTotalInsulinByPeriod, options.weight, options.poolingTime)
//   // console.log("DIA", DIA)
  
//   const test = basalCalcs.getInfusionPercentage(8, 80, 60)
//   console.log("test", test)

// //DISPLAY DATA

//   //Display the ICR and ISF recommendations
//   displayTable(icrRecommendations, 'icr-table')
//   displayTable(isfRecommendations, 'isf-table')

//   //This is for mobile views  
//   let basalDivId = 'bg-chart'
//   // charts.renderChartMobileView(avgBGArrayMobileView, basalDivId)
  
//   //This is for desktop views
//   // charts.renderChart(avgBgArray, basalDivId)
