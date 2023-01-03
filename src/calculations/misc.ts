import * as parseJSON from '../parseJSON'
import _ from "underscore"
import { options } from '../index'
// import { Chart } from 'chart.js/auto'


//<-------------------BEGIN BG FUNCTIONS------------------->


  //This returns the just the totals for when the profile basal rate is active.
  export function getProfileBasalTotal(tempBasals: Array<TempBasal>, basalProfiles: Array<BasalProfile>, options: ResponseSettings){
    let profileBasals = []

    for(let i = 0; i < tempBasals.length-1; i++){
        // netTempBasals.push(tempBasals[i])
        let tbStart = new Date(tempBasals[i].created_at)
        let tbEnd = new Date(new Date(tbStart).setTime(tbStart.getTime() + tempBasals[i].duration * (1000 * 60)))
        let nextTbStart = new Date(tempBasals[i+1].created_at)
        if(tbEnd < nextTbStart){
            pushDefaultProfiles(basalProfiles, tbEnd, profileBasals, nextTbStart)
        } 

    }

    return profileBasals
}

  //This is tied to the getProfileBasalTotal function. getProfileBasalTotal returns the values for only when the default profile was active.
  function pushDefaultProfiles(basalProfiles: Array<BasalProfile>, tbEnd: Date, profileBasals: Array<TempBasal>, nextTbStart: Date){
    let profile: Array<Basal> = []
    basalProfiles.map((obj) =>{
        if(tbEnd >= obj.startDate && tbEnd <= obj.endDate){
            profile = obj.basal.map((x) => x)
            profile.push({
                    value: profile![0].value,
                    time: profile![0].time,
                    timeAsSeconds: 60 * 60 * 24
                })
        }
    })

    for(let i = 0; i < profile.length -1; i++){
        let bStart = new Date(new Date(tbEnd).setHours(0,0,profile[i].timeAsSeconds,0))
        let bEnd = new Date(new Date(tbEnd).setHours(0,0,profile[i+1].timeAsSeconds,0))
        
        if (tbEnd >= bStart && tbEnd <= bEnd){
            let newBEnd = (bEnd < nextTbStart) ? new Date(bEnd) : new Date(nextTbStart)
            let created_at = tbEnd
            let duration = (newBEnd.getTime() - created_at.getTime()) / (1000 * 60)
            let rate = profile[i].value

            profileBasals.push({
                    rate: rate,
                    duration: duration,
                    created_at: created_at
            })

            tbEnd = new Date(tbEnd.getTime() + duration * 1000 * 60)

        }

    }
    
  }

  //From netProfileBasals, this take the amount (amount = obj.rate * obj.duration / 60) and returns the total amount for each day.
  export function sumDefaultBasalDelivery(netProfileBasals: Array<TempBasal>) {
    let profileBasalTotals = []
    let amount = 0
    let date = new Date(netProfileBasals[0].created_at)
    date.setHours(0, 0, 0, 0) // set the time to midnight for the current date
    netProfileBasals.map((obj) => {
      let currentDate = new Date(obj.created_at)
      currentDate.setHours(0, 0, 0, 0) // set the time to midnight for the current date
  
      if (currentDate.getTime() === date.getTime()) {
        // current date is the same as the date we are tracking, so add to the amount
        amount += obj.rate * obj.duration / 60
      } else {
        // current date is different, so add the current amount to the results and reset the date and amount
        profileBasalTotals.push({
          date: date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
          amount: amount,
        })
        date = currentDate
        amount = obj.rate * obj.duration / 60
      }
    })
    // add the final amount to the results
    profileBasalTotals.push({
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      amount: amount,
    })
    return profileBasalTotals
  }
  
  




  //This returns the basal profile daily totals if temp basals/boluses were not used. It lookes at the basal profiles and returns the total daily delivery.
  export function getBasalProfileTotals(basalProfiles: Array<BasalProfile>, options){
    let basalProfilesTotal = basalProfiles.reduce((acc, obj) => {
      let profile = obj.basal.concat({
        value: obj.basal[0].value,
        time: obj.basal[0].time,
        timeAsSeconds: 60 * 60 * 24
      });
      let total = 0;
      for (let i = 0; i < profile.length - 1; i++) {
        let bStart = new Date(new Date(obj.startDate).setHours(0, 0, profile[i].timeAsSeconds, 0));
        let bEnd = new Date(new Date(obj.startDate).setHours(0, 0, profile[i + 1].timeAsSeconds, 0));
        let duration = (bEnd.getTime() - bStart.getTime()) / (1000 * 60 * 60);
        let rate = profile[i].value;
        total += duration * rate;
      }
      return acc + total;
    }, 0);
    let days = (options.dateEnd - options.dateStart) / (1000 * 60 * 60 * 24);
    return basalProfilesTotal/days;
  }

  //Get Total Daily Delivery for TempBasalInsulin
  function netBasalAmount(netTempBasals) {
    var netBasalAmount = {};
    for (var i = 0; i < netTempBasals.length; i++) {
      var netBasal = netTempBasals[i];
      var amount = netBasal.rate / 60 * netBasal.duration;
      var date = netBasal.created_at;
      if (netBasalAmount[date]) {
        netBasalAmount[date] += amount;
      } else {
        netBasalAmount[date] = amount;
      }
    }
    return netBasalAmount;
  }

  //This provides the total basal insulin given each day with the format { date: '2022-10-10', amount: 10.4333333 }.
  export async function sumBasalAmountPerDay(netTempBasals) {
    await netTempBasals 
    netTempBasals.forEach(basal => {
      basal.amount = basal.rate / 60 * basal.duration;
    });
    const amountsPerDay = {};
    netTempBasals.forEach(basal => {
      const date = (basal.created_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

      if (date in amountsPerDay) {
        amountsPerDay[date] += basal.amount;
      } else {
        amountsPerDay[date] = basal.amount;
      }
    });

    // Finally, we will convert the amountsPerDay object into an array of objects
    // with the format { date: '2022-10-10', amount: 10.4333333 }
    const result = [];
    for (const date in amountsPerDay) {
      if (amountsPerDay.hasOwnProperty(date)) {
        result.push({
          date: date,
          amount: amountsPerDay[date],
        });
      }
    }

    return result;
  }

  //From tempBasals, return the sum of tempBasals.amount by date in local time. 
  export function getTempBasalTotal(tempBasals: Array<TempBasal>) {
    let netTempBasals = {};
    for (let i = 0; i < tempBasals.length; i++) {
      const tempBasalDate = new Date(tempBasals[i].created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const tempBasalAmount = tempBasals[i].rate/60*tempBasals[i].duration;
      if (tempBasalAmount === 0 || tempBasalAmount === undefined) continue;  // skip adding to netTempBasals if amount is 0
      if (netTempBasals[tempBasalDate]) {
        netTempBasals[tempBasalDate].amount += tempBasalAmount;
      } else {
        netTempBasals[tempBasalDate] = {
          date: tempBasalDate,
          amount: tempBasalAmount,
        };
      }
    }
    return netTempBasals;
  }


//<-------------------BEGIN BOLUS FUNCTIONS------------------->

//This function returns the total bolus insulin delivered each day with the format { date: '2022-10-10', amount: 10.4333333 }. date = bolusJSON.timestamp returned in local time for the date. amount = bolusJSON.insulin
export async function sumBolusAmountPerDay() {
  let bolusJSON = await JSON.parse(localStorage.getItem('bolusJSON'))
  const amountsPerDay = [];
  bolusJSON.forEach(bolus => {
    if(bolus.insulin == null){return}
    const date = new Date(bolus.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
    const existingAmount = amountsPerDay.find(amount => amount.date === date);
    if (existingAmount) {
      existingAmount.amount += bolus.insulin;
    } else {
      amountsPerDay.push({ date, amount: bolus.insulin });
    }
  });

  return amountsPerDay;
}

//This function returns the total bolus insulin delivered each day with the format { date: '2022-10-10', amount: 10.4333333 }. date = bolusJSON.timestamp returned in local time for the date. amount = bolusJSON.insulin
  export async function dailyBolusTotals(bolusJSON: Promise<Array<any>>) {
    // Wait for the bolusJSON promise to resolve
    const bolusData = await bolusJSON;

    let boluses: Array<Boluses> = []
    bolusData.map((i: any) => {
      boluses.push({
        bolus: i.insulin,
        timestamp: new Date(i.timestamp),
      })
    })  

    let bolusTotals = boluses.reduce(function (acc, curr) {
      let date = new Date(curr.timestamp);
      let dateString = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
      let existing = acc.find(function (item) {
        return item.date === dateString;
      });
      if (existing) {
        existing.amount += curr.bolus;
      } else {
        acc.push({
          date: dateString,
          amount: curr.bolus
        });
      }
      return acc;
    }, []);
     return bolusTotals;
  }

  
  //This function returns the total Carb Correction insulin amount (preBolusArray[i].calculatedInsulin- preBolusArray[i].remainingInsulin) by date
export function mealBolusTotalsByDate(preBolusArray) {
  const totals = []
  for (let i = 0; i < preBolusArray.length; i++) {
    if (preBolusArray[i].eventType === 'Carb Correction') {
      const mealBolusDate = new Date(preBolusArray[i].timestamp)
      const formattedDate = mealBolusDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
      const bolusAmount = preBolusArray[i].calculatedInsulin - preBolusArray[i].remainingInsulin

      let found = false
      for (let j = 0; j < totals.length; j++) {
        if (totals[j].date === formattedDate) {
          totals[j].amount += bolusAmount
          found = true
          break
        }
      }
      if (!found) {
        totals.push({
          date: formattedDate,
          amount: bolusAmount,
        })
      }
    }
  }
  return totals
}

  
//<-------------------BEGIN MISC FUNCTIONS------------------->

  //This function takes in 2 arrays with the same lenth outputs a new array with each index summed.
  export function addBolusArrays(array1, array2) {
    var combinedArray = [];
    for (var i = 0; i < array1.length; i++) {
      combinedArray.push(array1[i] + array2[i]);
    }
    return combinedArray;
  }

  //This function sums an array of numbers and returns the result.
  export function sumArray(array) {
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
      sum += array[i];
    }
    return sum;
  }

  export function dailyTotalInsulin(netBolusDailyTotals, netBasalDailyTotals) {
    const combinedInsulinDailyTotal = [];
    netBolusDailyTotals.forEach((bolus) => {
      const basal = netBasalDailyTotals.find((b) => b.date === bolus.date);
      if (basal) {
        combinedInsulinDailyTotal.push({
          date: bolus.date,
          amount: bolus.amount + basal.amount
        });
      } else {
        combinedInsulinDailyTotal.push({
          date: bolus.date,
          amount: bolus.amount
        });
      }
    });
    return combinedInsulinDailyTotal;
  }
  
//<-------------------BEGIN ISF CALCULATOR------------------->
  //This function averages the "amount" values in an array
  function averageAmount(array) {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i].amount;
    }
    return sum / array.length;
  }

  //This is the ISF Calculator Based on https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5478012
  export function isfCalculator(dailyTotalInsulin, netBasalDailyTotals) {
    let totalInsulin = 0;
    let totalNetBasal = 0;

    // Calculate the average dailyTotalInsulin amount
    for (const entry of dailyTotalInsulin) {
      totalInsulin += entry.amount;
    }
    const avgInsulin = totalInsulin / dailyTotalInsulin.length;
    let aggressiveISF = 1800 / avgInsulin;

    // Calculate the average netBasalDailyTotals amount
    for (const entry of netBasalDailyTotals) {
      totalNetBasal += entry.amount;
    }
    const avgNetBasal = totalNetBasal / netBasalDailyTotals.length;
    let conservativeISF = 1800 / avgNetBasal;
    let ISF = (conservativeISF + aggressiveISF) / 2
    aggressiveISF = Math.round(aggressiveISF * 10) / 10
    conservativeISF = Math.round(conservativeISF * 10) / 10
    ISF = Math.round(ISF * 10) / 10

    // Return ISF Recommendations
    return {
      'Conservative ISF': conservativeISF,
      'Less aggressive':ISF,
      'ISF 1800 Rule': aggressiveISF,
      'Reference': "<a href='https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5478012' target='_blank' title='Open in a new window'>Link</a>"
    };
  }

  //This is the place holder for Fine Tuning ISF calculator

//<-------------------BEGIN ICR CALCULATOR------------------->
  //Based on https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5478012
  export function icrCalculator(weight, netBasalDailyTotals, dailyTotalInsulin) {
    // Calculate the average dailyTotalInsulin amount
    let totalInsulin = 0;
    for (const entry of dailyTotalInsulin) {
      totalInsulin += entry.amount;
    }
    const avgTotalInsulin = totalInsulin / dailyTotalInsulin.length;
    // console.log("avgDailyTotalInsulin",avgTotalInsulin)

    // Calculate the average dailyTotalBasalInsulin amount
    let totalBasalInsulin = 0;
    for (const entry of netBasalDailyTotals) {
      totalBasalInsulin += entry.amount;
    }
    const avgBasalInsulin = totalBasalInsulin / netBasalDailyTotals.length;
    // console.log("avgDailyBasalInsulin",avgBasalInsulin)

    let morning = (6.2 * weight) / avgTotalInsulin; 
    let night = (6.2 * weight) / avgBasalInsulin;
    let midDay = (morning + night) / 2;
    let icr500Rule = 500 / avgTotalInsulin
    morning = Math.round(morning * 10) / 10;
    night = Math.round(night * 10) / 10;
    midDay = Math.round(midDay * 10) / 10;
    icr500Rule = Math.round(icr500Rule * 10) / 10;

    const icrRecommendations = {
      'Morning': morning,
      'Mid-day': midDay,
      'Night': night,
      'ICR 500 Rule': icr500Rule,
      'Reference': "<a href='https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5478012' target='_blank' title='Open in a new window'>Link</a>"
    };

    return icrRecommendations;
  }

 //<-------------------BEGIN BASAL CALCULATOR------------------->


export function predictBGs(insulinKG, isf, dose) {
  // Get the string from session storage
  var avgBGArrString = sessionStorage.getItem('avgBGArr');
  var predictedBGArrString = sessionStorage.getItem('predictedBGArr');

  // Convert the string back into an array
  var avgBGArr = JSON.parse(avgBGArrString);
  var predictedBGArr = JSON.parse(predictedBGArrString);

  // Calculate the Glucose Infusion Rate (GIR) curve for the given insulin/kg
  let girCurve = basalCalcs.GIR(insulinKG);
  
  // Loop through the bgArr
  for (let i = 0; i < bgArr.length; i++) {
    // Find the index in the GIR curve corresponding to the given number of minutes
    let minIndex = Math.floor(minutes / 5);
    
    // Check if we have already calculated the predicted blood glucose levels up to this point
    if (predictedBG.length > i) {
      // If we have, use the predicted value from the previous calculation as the starting point
      predictedBG[i] = predictedBG[i - 1] - dose * isf / girCurve[minIndex];
    } else {
      // If we haven't, use the current blood glucose level as the starting point
      predictedBG[i] = bgArr[i] - dose * isf / girCurve[minIndex];
    }
  }
  predictedBGArrString = JSON.stringify(predictedBGArr);

  // Save the string to session storage
  sessionStorage.setItem('predictedBGArr', predictedBGArrString);
  return {bgArr, predictedBGArr};
}


// Returns the percentage of the area under the curve for the specified insulin/kg and time.
function GIR(insulinKG, minutes) {
  // Generate x-values for the curve with a 60 second update interval over an 8 hour duration
  let xData = new Array(480);
  for (let i = 0; i < xData.length; i++) {
    xData[i] = i * (60.0/3600);
  }

  // Get the y-values of the .1, .2, and .4 U/kg curves
  let smallYData = getSmallYData(xData);
  let mediumYData = getMediumYData(xData);
  let largeYData = getLargeYData(xData);

  let yData;
  if (insulinKG <= 0.1) {
    yData = smallYData;
  } else if (insulinKG <= 0.2) {
    // Interpolate between the .1 and .2 U/kg curves
    yData = new Array(480);
    for (let i = 0; i < yData.length; i++) {
      yData[i] = smallYData[i] + (insulinKG - 0.1) * (mediumYData[i] - smallYData[i]) / 0.1;
    }
  } else if (insulinKG <= 0.4) {
    // Interpolate between the .2 and .4 U/kg curves
    yData = new Array(480);
    for (let i = 0; i < yData.length; i++) {
      yData[i] = mediumYData[i] + (insulinKG - 0.2) * (largeYData[i] - mediumYData[i]) / 0.2;
    }
  } else {
    yData = largeYData;
  }

  // Find the peak value of the curve
  let peakValue = Math.max(...yData);

  // Find the index where the curve drops below the peak value * 0.01
  let cutoffIndex;
  for (let i = 0; i < yData.length; i++) {
    if (yData[i] < peakValue * 0.01) {
      cutoffIndex = i;
      break;
    }
  }

  // Return the percentage of the area under the curve for the specified time
  return yData.slice(Math.max(0, minutes - 300), Math.min(yData.length, minutes)).reduce((sum, y) => sum + y, 0) / (peakValue * 300) * 100;
}


  
  function getSmallYData(smallXData) {
    //using the .1 U/kg curve
    let smallYData = new Array(1920);
    for (let i = 0; i < smallYData.length; i++) {
      let x = smallXData[i];
      let y = 0.0033820425120803 * Math.pow(x, 5) - 0.0962642502970792 * Math.pow(x, 4) + 1.0161233494860400 * Math.pow(x, 3) -
        4.7280409167367000 * Math.pow(x, 2) + 8.2811624637053000 * x - 0.4658832073238300;
      smallYData[i] = y;
    }
    return smallYData;
  }

  function getMediumYData(mediumXData) {
    //Using the .2 U/kg curve
    let mediumYData = new Array(1920);
    for (let i = 0; i < mediumXData.length; i++) {
      let x = mediumXData[i];
      let y = 0.0004449113905105 * Math.pow(x, 6) - 0.0097881251143144 * Math.pow(x, 5) + 0.0487062677027909 * Math.pow(x, 4) +
        0.3395509285035820 * Math.pow(x, 3) - 3.8635372657493500 * Math.pow(x, 2) + 9.8215306047782600 * x - 0.5016675029655920;
      mediumYData[i] = y;
    }
    return mediumYData;
  }

  function getLargeYData(largeXData) {
    //Using the .4 U/kg curve
    let largeYData = new Array(1920);
    for (let i = 0; i < largeXData.length; i++) {
      let x = largeXData[i];
      let y = -0.0224550824431891 * Math.pow(x, 4) + 0.5324819868175370 * Math.pow(x, 3) - 4.2740977490209200 * Math.pow(x, 2) +
        11.6354217632198000 * x - 0.0653457810255797;
      largeYData[i] = y;
    }
    return largeYData;
  }


function plotBGs(avgBgArray, predictedBGArr) {
  Chart.getChart('bg-chart')?.destroy()
  // Extract the BG values and timestamps from the avgBgArray and predictedBGArr
  let avgBgValues = avgBgArray.map(point => point.bg);
  let predictedBgValues = predictedBGArr.map(bg => bg);
  let timestamps = avgBgArray.map(point => point.time);

  // Create the chart
  let ctx = document.getElementById('bg-chart').getContext('2d');
  let chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',

      // The data for our dataset
      data: {
          labels: timestamps,
          datasets: [{
              label: 'Actual BG',
              backgroundColor: 'rgb(255, 99, 132)',
              borderColor: 'rgb(255, 99, 132)',
              data: avgBgValues,
          },
          {
              label: 'Predicted BG',
              backgroundColor: 'rgb(54, 162, 235)',
              borderColor: 'rgb(54, 162, 235)',
              data: predictedBgValues,
          }]
      },

      // Configuration options go here
      options: {}
  });
}


 
 

  //TODO: This function is currently all done and working in parseJSON. Break it up and put calculations here.
  // export function netBolusDailyTotals() {
  //   bolusJSON = await _parseJSON.getBoluses(
  //     options.url,
  //     options.dateStart,
  //     options.dateEnd
  //   )
  //   let boluses: Array<Boluses> = []
  //     bolusJSON.map((i: any) => {
  //       boluses.push({
  //         bolus: i.insulin,
  //         created_at: new Date(i.created_at),
  //       })
  //     })  
      
  //     let bolusTotals = boluses.reduce(function (acc, curr) {
  //       let date = new Date(curr.created_at);
  //       let dateString = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
  //       let existing = acc.find(function (item) {
  //         return item.date === dateString;
  //       });
  //       if (existing) {
  //         existing.amount += curr.bolus;
  //       } else {
  //         acc.push({
  //           date: dateString,
  //           amount: curr.bolus
  //         });
  //       }
  //       return bolusTotals;
  //     }, []);
  //     console.log("Boluses: ", bolusTotals)
  //   }
   /////////////Begin Duration of Insulin Action (DIA) Calculations////////////////
  


  /////////////Begin Glucose Infusion Rate (GIR) Calculations////////////////
  // function GIRCurve(insulinKG) {
  //   const smallXData = new Array(1920);
  //   const mediumXData = new Array(1920);
  
  //   for (let i = 0; i < 1920; i++) {
  //     const x = i * (15.0 / 3600);
  //     smallXData[i] = x;
  //     mediumXData[i] = x;
  //   }
  
  //   const smallYData = getSmallYData(smallXData);
  //   const mediumYData = getMediumYData(mediumXData);
  
  //   const smallMedium = new Array(smallYData.length);
  //   for (let i = 0; i < smallMedium.length; i++) {
  //     smallMedium[i] = smallYData[i] / mediumYData[i];
  //   }
  
  //   const newCurveY = new Array(1920);
  //   for (let i = 0; i < newCurveY.length; i++) {
  //     const pow = -1.44269504088897 * Math.log(insulinKG) - 3.32192809488739;
  //     const yRate = -0.0455826595478078 * smallXData[i] + 0.9205489113464720;
  //     const yDiff = Math.pow(yRate, pow) * smallMedium[i];
  //     const yMultiplier = Math.pow(yDiff, pow);
  //     const value = smallYData[i] * yMultiplier;
  
  //     if (i !== 0 && Math.abs(newCurveY[i - 1] - value) > 0.05) {
  //       newCurveY[i] = newCurveY[i - 1];
  //     } else {
  //       newCurveY[i] = value;
  //     }
  //   }
  
  //   let peakValue = 0;
  //   for (const i of newCurveY) {
  //     if (i > peakValue) {
  //       peakValue = i;
  //     }
  //   }
  
  //   const stop = peakValue * 0.01;
  //   let newCurveX = [];
  //   let newCurveYTrimmed = [];
  
  //   for (let i = 0; i < newCurveY.length; i++) {
  //     if (newCurveY[i] > stop) {
  //       newCurveX.push(smallXData[i]);
  //       newCurveYTrimmed.push(newCurveY[i]);
  //     }
  //   }
  
  //   return newCurveYTrimmed;
  // }