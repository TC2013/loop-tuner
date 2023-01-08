import * as parseJSON from '../parseJSON'
import _ from "underscore"
import * as misc from './misc'

//<-------------------BEGIN TEMP BASAL FUNCTIONS------------------->

//This divides the basal insulin into 5 minute periods and includes default basal and temp basal insulin. It does not include bolus basal inuslin.

export function averageNetTempBasalsByPeriod(netTempBasals, options) {
  const sumNetTempBasals = netTempBasals.reduce((acc, obj) => {
    return acc + obj.rate / 60 * obj.duration
  }, 0)

  let days = (options.dateEnd - options.dateStart) / (1000 * 60 * 60 * 24);

  let averageNetTempBasals = new Array(288).fill(null);  // Array to hold the average basal rate for each 5-minute period
  // let dayCounter = 0 
  // let currentDay = new Date(netTempBasals[0].created_at)
  netTempBasals.forEach((obj, index) => {
    let tbStart = new Date(obj.created_at);
    let tbEnd = new Date(new Date(tbStart.getTime() + obj.duration * 1000 * 60));
    // let date1 = new Date(currentDay).toLocaleDateString().split('T')[0] + "T" + "00:00"
    // let date2 = new Date(tbEnd).toLocaleDateString().split('T')[0] + "T" + "00:00"
    // if( date1 < date2) { currentDay = new Date(tbEnd), dayCounter++}
    let duration = obj.duration
    let numPeriods = Math.ceil(duration / 5);// Calculate the number of periods in the basal period
    
    let avgAmount = (obj.duration * obj.rate / 60) / numPeriods
    if(numPeriods == 0) {avgAmount = 0}
    let currentPosition = tbEnd.getHours() * 12 + Math.floor(tbEnd.getMinutes() / 5)
    let closestPeriodToTbstart = new Date(tbStart).setSeconds(0)
    let minutes = Math.ceil(tbStart.getMinutes() / 5) * 5
    if(tbStart.getMinutes() == 0){closestPeriodToTbstart = new Date(closestPeriodToTbstart).setMinutes(minutes + 5);}
    else{closestPeriodToTbstart = new Date(closestPeriodToTbstart).setMinutes(minutes);}     
    let loopCounter = Math.ceil(duration / 5)
    // if(duration < new Date(closestPeriodToTbstart).getTime() - tbStart.getTime()) 
    // {loopCounter = Math.ceil(duration / 5)} else {loopCounter = Math.floor(duration / 5) + 1;}
    // Add the basal rate for each period to the averageNetTempBasals array
    while (loopCounter > 0) {
      if (averageNetTempBasals[currentPosition] === null){averageNetTempBasals[currentPosition] = avgAmount;} 
      else {averageNetTempBasals[currentPosition] += avgAmount;}
      
      if(currentPosition < 0 || currentPosition > averageNetTempBasals.length) {console.log('currentPosition',currentPosition,'netTempBasals WHILE LOOP:', index, 'tbEnd', tbEnd)}
      currentPosition--
      loopCounter--
    }
  });
 
 (function (arr) {
    let sum = 0;for (let i = 0; i < arr.length; i++) {
      let currentValue = arr[i];
      sum += currentValue;}
    console.log('AverageNetTempBasal Sum:', sum)  
    return sum;
  })(averageNetTempBasals);
  
  // console.log('sum of averageNetTempBasals: I SHOULD EQUAL THE VALUE ABOVE:',averageNetTempBasals.reduce((a, b) => a + b, 0))
  for(let i = 0; i < averageNetTempBasals.length; i++){

    averageNetTempBasals[i] = averageNetTempBasals[i] / days

}
  console.log('averageNetTempBasalsByPeriod',averageNetTempBasals)
  console.log('days',days)
   console.log('sum of averageNetTempBasalsByPeriodI SHOULD EQUAL THE VALUE ABOVE divided by # of days:',averageNetTempBasals.reduce((a, b) => a + b, 0))

  return averageNetTempBasals;
}

export function getNetTempBasals(){
  const basalProfiles = JSON.parse(localStorage.getItem('profile'))
  const tempBasals = JSON.parse(localStorage.getItem('tempBasals'))
  let netTempBasals = []
  let createdDate = new Date(tempBasals[0].created_at)
  createdDate.setHours(0,0,0,0)
  createdDate.setDate(createdDate.getDate() - 1)

  for (let i = 0; i < tempBasals.length; i++) { 
    let currentDate = new Date(tempBasals[i].created_at)
    currentDate.setHours(0,0,0,0)
      if(currentDate > createdDate && i == tempBasals.length - 1) 
        {tempBasals[i].duration = 0}
      if(i == 0 || currentDate > createdDate) {
        createdDate = currentDate
        tempBasals.splice(i, 0,{
          rate: 0,
          duration: 0,
          created_at: createdDate
        })
      }
  }
  console.log('TempBasals',tempBasals)
  for(let i = 0; i < tempBasals.length-1; i++){
    const currentBasal = {
      rate: tempBasals[i].rate,
      duration: tempBasals[i].duration,
      created_at: new Date(tempBasals[i].created_at)
    }
    netTempBasals.push(currentBasal)
    let tbStart = new Date(tempBasals[i].created_at)
    let tbEnd = new Date(new Date(tbStart).setMinutes(tbStart.getMinutes() + tempBasals[i].duration))
    let nextTbStart = new Date(tempBasals[i+1].created_at)
    if(tbEnd < nextTbStart){
        pushBasalProfiles(basalProfiles, tbEnd, netTempBasals, nextTbStart)
    } 
  }

  console.log('netTempBasals',netTempBasals)
  return netTempBasals
}
//This is tied to the getNetBasals function. getNetBasals returns the actual basal rates through the time periods 
function pushBasalProfiles(basalProfiles: Array<BasalProfile>, tbEnd: Date, netTempBasals: Array<TempBasal>, nextTbStart: Date){
  // console.log('tbEnd',tbEnd)
  let profile: Array<Basal> = []
  basalProfiles.map((obj) =>{
    if(tbEnd >= new Date(obj.startDate) && tbEnd <= new Date(obj.endDate)){
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
      let bFinal = new Date(new Date(tbEnd).setHours(0,0,60 * 60 * 24,0))
      if (tbEnd >= bStart && tbEnd <= bEnd){
          let newBEnd = (bEnd < nextTbStart) ? new Date(bEnd) : new Date(nextTbStart)
          if(newBEnd = bFinal){newBEnd = new Date(nextTbStart)}
          let created_at = new Date(tbEnd)
          let duration = (newBEnd.getTime() - created_at.getTime()) / (1000 * 60)
          let rate = profile[i].value
          netTempBasals.push({
                  rate: rate,
                  duration: duration,
                  created_at: created_at,
          })
          tbEnd = new Date(tbEnd.getTime() + duration * 1000 * 60)
      } else ('No basal rate found for this time period.')
  }
}


//<-------------------BEGIN BOLUS BASAL FUNCTIONS------------------->
export async function avgBolusBasalByPeriod(options) {
  const bolusJSON = JSON.parse(localStorage.getItem('bolusJSON'));
  const profile = JSON.parse(localStorage.getItem('profile'))
  const dailyBolusTotals = await misc.sumBolusAmountPerDay()
  console.log("dailyBolusTotals in avgBolusBasalByPeriod()", dailyBolusTotals)

  let updatedProfile = profile.map(obj => Object.assign({}, obj));
  let days = (options.dateEnd - options.dateStart) / (1000 * 60 * 60 * 24);
  //Add end (in seconds) to each object in updatedProfile.
  for (var i = 0, j = 0; i < updatedProfile.length; j++) {
    if (j == updatedProfile[i].carbRatio.length - 1) {
      updatedProfile[i].carbRatio[j].end = 86400;
      i++
      j=0
    } else {
      updatedProfile[i].carbRatio[j].end  = updatedProfile[i].carbRatio[j+1].timeAsSeconds;
    }
  }
  
  //Add carbratio, calculatedInsulin and remainingInsulin properties to each object in bolusJSON.
  let allBolusArray = bolusJSON.map(obj => Object.assign({}, obj));
  console.log('bolusJSON0000000000000',bolusJSON)
  console.log('allBolusArray0000000000',allBolusArray)
  for (var i = 0; i < allBolusArray.length; i++) {
    if (allBolusArray[i].eventType == "Carb Correction") {
      // console.log('Meal Bolus at index',i, 'found:',allBolusArray[i])
      allBolusArray[i].endTimestamp = new Date(new Date(allBolusArray[i].timestamp).getTime() + allBolusArray[i].absorptionTime * 1000 * 60).toISOString()
        for (var j = 0, k = 0; j < updatedProfile.length;) {
        let allBolusArrayTimestamp = new Date(allBolusArray[i].timestamp)
        let updatedProfileTimeAsSeconds = updatedProfile[j].carbRatio[k].timeAsSeconds
  
        if (updatedProfileTimeAsSeconds <= allBolusArrayTimestamp.getTime() / 1000 
            && updatedProfile[j].carbRatio[k].end > getSecondsSinceMidnight(allBolusArrayTimestamp.getTime() / 1000)) {
          allBolusArray[i].carbratio = updatedProfile[j].carbRatio[k].value;
          allBolusArray[i].calculatedInsulin = allBolusArray[i].carbs/allBolusArray[i].carbratio;
          allBolusArray[i].remainingInsulin = allBolusArray[i].carbs/allBolusArray[i].carbratio;
          j++
        } else {k++}
      }
    } 
  }
  //used to calculate the seconds since midnight local time for function above
  function getSecondsSinceMidnight(timestamp) {
    const localTime = new Date(timestamp * 1000);
    const hours = localTime.getHours();
    const minutes = localTime.getMinutes();
    const seconds = localTime.getSeconds();
    return hours * 3600 + minutes * 60 + seconds;
  }

    //sum calculatedInsulin and remainingInsulin for each day
    let mealBolusTotals = sumMealBolusInsulinByDate(allBolusArray)
    console.log("mealBolusTotals in avgBolusBasalByPeriod()", mealBolusTotals)
    console.log("allBolusArray1",allBolusArray)

  for (var i = 0; i < allBolusArray.length; i++) {
    // Find any "Carb Correction" objects with a positive remainingInsulin value
    if (allBolusArray[i].eventType === "Carb Correction" && allBolusArray[i].remainingInsulin > 0) {
      var MB = allBolusArray[i]; // MB = current carbCorrection (MealBolus) index
  
      for (var j = 0; j < allBolusArray.length; j++) {
        var CB = allBolusArray[j]; // CB = current bolusCorrection index
        // Find any "Correction Bolus" objects with a positive insulin value and a timestamp within the range of the "Carb Correction" object's timestamp and endTimestamp
        if (CB.eventType === "Correction Bolus" && CB.insulin > 0 && (CB.timestamp >= MB.created_at) && CB.timestamp <= MB.endTimestamp) {
          // console.log("Correction Bolus match",j,CB.timestamp, "\nfor Meal Bolus ",i,MB.created_at,"    remainingInsulin(MB) = ",MB.remainingInsulin," - ",CB.insulin)
          // Subtract the "Correction Bolus" object's insulin value from the "Carb Correction" object's remainingInsulin value and set the "Correction Bolus" object's insulin value to whatever is left over.
          MB.remainingInsulin -= CB.insulin;
          CB.insulin -= CB.insulin;
          if(MB.remainingInsulin < 0){CB.insulin -= MB.remainingInsulin; MB.remainingInsulin = 0;} else {CB.insulin = 0}
          // console.log("CB.insulin now = ",CB.insulin);
        }
        
      }
    }
  }
  let mealBolusTotalsAfterProcessing = (allBolusArray)
  console.log("mealBolusTotalsAfterProcessing in avgBolusBasalByPeriod()", mealBolusTotalsAfterProcessing)

  // Loop through allBolusArray and if eventType="Correction Bolus", add the insulin value to the corresponding bolusArray position. The corresponding position is the hour * 2 + Math.floor(minute / 5). If the eventType = "Carb Correction", add the remainingInsulin to the corresponding bolusArray position.
  var bolusArray = new Array(288).fill(0);
  // Initialize counters for each period to keep track of the number of events
  let counters = new Array(288).fill(0);

  // Iterate through allBolusArray and calculate the average insulin value for each 5 minute period
  for (let i = 0; i < allBolusArray.length; i++) {
    // Check if the event type is "Correction Bolus" and the insulin value is positive
    if (allBolusArray[i].eventType === "Correction Bolus" && allBolusArray[i].insulin > 0) {
      // Get the local date for the timestamp
      let localDate = new Date(allBolusArray[i].timestamp);
      // Calculate the 5 minute period for this bolus event
      let period = Math.floor(localDate.getHours() * 12 + localDate.getMinutes() / 5);
      // Add the insulin value to the corresponding period in the bolusArray
      bolusArray[period] += allBolusArray[i].insulin;
      // Increment the counter for this period
      counters[period]++;
    }
  }

  // Divide each value in the bolusArray by the number of events in that period to get the average
  for (let i = 0; i < bolusArray.length; i++) {
    if (counters[i] > 0) {
      bolusArray[i] = bolusArray[i] / counters[i];
    }
  }
  //sum the values in bolusArray
  let sumBolusArray = bolusArray.reduce((a, b) => a + b, 0);
  console.log('sumBolusArray (if the total matches, and it does, the mealBolusTotalsAfterProcessing... allBolusInsulin, then avgBolusBasalByPeriod() is working: ',sumBolusArray)
  console.log('bolusArray = average insulin delivered each 5 minute period',bolusArray)

  return bolusArray;
  }

  //This function is used to sum the Meal Bolus calculatedInsulin and remainingInsulin for each day
  function sumMealBolusInsulinByDate(data) {
    // Create an empty object to store the results
    const result = {};

    // Loop through the array of objects
    for (const entry of data) {
      // Check if the eventType is "CarbCorrection" or "CorrectionBolus"
      if (entry.eventType === 'Carb Correction' || entry.eventType === 'Correction Bolus') {
        // Get the date in local time and format it as MM-DD-YYYY
        const date = new Date(entry.timestamp).toLocaleDateString('en-US');

        // If the date is not yet in the results object, add it and set the calculatedInsulin, remainingInsulin, and allBolusInsulin totals to 0
        if (!result[date]) {
          result[date] = {
            date: date,
            calculatedInsulin: 0,
            remainingInsulin: 0,
            allBolusInsulin: 0
          };
        }

        // Add the calculatedInsulin and remainingInsulin values to the totals for the date
        result[date].calculatedInsulin += entry.calculatedInsulin || 0;
        result[date].remainingInsulin += entry.remainingInsulin || 0;

        // If the eventType is "CorrectionBolus", add the insulin value to the allBolusInsulin total for the date
        if (entry.eventType === 'Correction Bolus') {
          result[date].allBolusInsulin += entry.insulin || 0;
        }
      }
    }

    // Return the results object
    return result;
  }
  
//<-------------------BEGIN BASAL CALCULATOR------------------->
 
// export function predictBGs(insulinKG, isf, dose, minutes) {
//   // Get the string from session storage
//   var avgBGArrString = sessionStorage.getItem('avgBGArr');
//   var predictedBGArrString = sessionStorage.getItem('predictedBGArr');

//   // Convert the string back leto an array
//   var avgBGArr = JSON.parse(avgBGArrString);
//   var predictedBGArr = JSON.parse(predictedBGArrString);
//   console.log('predictedBGArr',predictedBGArr)

//   // Calculate the Glucose Infusion Rate (GIR) curve for the given insulin/kg
//   let girCurve = GIR(insulinKG);
  
//   // Loop through the bgArr
//   for (let i = 0; i < avgBGArr.length; i++) {
//     // Find the index in the GIR curve corresponding to the given number of minutes
//     let minIndex = Math.floor(minutes / 5);
    
//     // Check if we have already calculated the predicted blood glucose levels up to this polet
 
//     if (predictedBGArr!== null) {
//       // If we have, use the predicted value from the previous calculation as the starting polet
//       predictedBGArr[i] = predictedBGArr[i - 1] - dose * isf / girCurve[minIndex];
//     } else {
//       // If we haven't, use the current blood glucose level as the starting polet
//       predictedBGArr[i] = avgBGArr[i] - dose * isf / girCurve[minIndex];
//     }
//   }
//   predictedBGArrString = JSON.stringify(predictedBGArr);

//   // Save the string to session storage
//   sessionStorage.setItem('predictedBGArr', predictedBGArrString);
//   return {avgBGArr, predictedBGArr};
// }

 // Return the percentage of the GIR curve that the currentTime is plus the next 5 minutes.



// function plotBGs(avgBgArray, predictedBGArr) {
//   Chart.getChart('bg-chart')?.destroy()
//   // Extract the BG values and timestamps from the avgBgArray and predictedBGArr
//   let avgBgValues = avgBgArray.map(polet => polet.bg);
//   let predictedBgValues = predictedBGArr.map(bg => bg);
//   let timestamps = avgBgArray.map(polet => polet.time);

//   // Create the chart
//   let ctx = document.getElementById('bg-chart').getContext('2d');
//   let chart = new Chart(ctx, {
//       // The type of chart we want to create
//       type: 'line',

//       // The data for our dataset
//       data: {
//           labels: timestamps,
//           datasets: [{
//               label: 'Actual BG',
//               backgroundColor: 'rgb(255, 99, 132)',
//               borderColor: 'rgb(255, 99, 132)',
//               data: avgBgValues,
//           },
//           {
//               label: 'Predicted BG',
//               backgroundColor: 'rgb(54, 162, 235)',
//               borderColor: 'rgb(54, 162, 235)',
//               data: predictedBgValues,
//           }]
//       },

//       // Configuration options go here
//       options: {}
//   });
// }

function adjustAverageBGs(options, min, DIA, basalAverages) {
  const df = new DecimalFormat("#.##");

  let averageDIA = 0;
  for (let i = 144; i < 432; i++) {
      averageDIA += DIA[i];
  }
  averageDIA = averageDIA / 288;

  const averagedBGs = averageBGs(url, options.dateStart, options.dateEnd, false);
  const adjustedBGs = new Array(576);
  for (let i = 0; i < averagedBGs.length; i++) {
      const hour = Math.floor(i * 5 / 60);
      const minute = i * 5 - 60 * hour;
      adjustedBGs[i + 144] = new BG(averagedBGs[i], new Date(0, 0, 0, hour, minute));

  }
  //I'm pretty sure this doesn't work right...
  adjustedBGs.splice(0, 288, ...adjustedBGs.slice(288));
  adjustedBGs.splice(432, 144, ...adjustedBGs.slice(144));
  const tempBGs = adjustedBGs.map((bg) => new BG(bg.getBG(), bg.getTime()));
  //This is line 348 of Chart.java
  const xData = new Array(averagedBGs.length).fill().map((_, i) => i * 5);

  let totalInsulin = 0;

  const extraInsulin = new Array(1440 / period);

  const insulinDelivered = new Array(basalAverages.length);
  for (let b = 0; b < insulinDelivered.length; b++) {
    insulinDelivered[b] = basalAverages[b] / (60.0 / period);
  }
  
  console.log("Adjusting BGs... ");
  let totalRaise = 0;
  let previousTotalRaise = -1;
  let count = 0;
  while (totalRaise - previousTotalRaise > 0) {
    count++;
    console.log(df.format(totalInsulin) + " units applied(subtract insulin)");
    previousTotalRaise = totalRaise;
    for (let i = 144; i < adjustedBGs.length - 144; i += period / 5) {
      let insulin = 0.01;
      let canRun = false;
      while (!canRun) {
        const raise = insulin * isf;
        const curveY = GIRCurve(insulin / weight);
        for (let j = i; j < i + period / 5; j++) {
          const length = DIA[j];
          for (let k = j; k < length + j; k++) {
            const currentTime = (k - j) * 5.0 / 60;
            const percentage = getGIRCurvePercentage(curveY, currentTime);
            for (let l = k; l < length + j; l++) {
              tempBGs[l].setBg(tempBGs[l].getBG() + (raise * percentage));
            }
            for (let l = k; l < length + j; l++) {
              const currentInsulin = insulinDelivered[(i - 144) / (period / 5)];
              if (tempBGs[k].getBG() < min) canRun = true;
              if (currentInsulin - insulin * 6 <= 0) canRun = false;
            }
          }
        }
        if (canRun) {
          canRun = false;
          insulin += 0.01;
          for (let a = 0; a < adjustedBGs.length; a++) {
            tempBGs[a] = new BG(adjustedBGs[a].getBG(), adjustedBGs[a].getTime());
          }
        } else {
          canRun = true;
          insulin -= 0.01;
        }
      }
      insulin *= 0.005;
      if (insulin > 0) {
        insulinDelivered[(i - 144) / (period / 5)] -= insulin * 6;
        for (let j = i; j < i + period / 5; j++) {
          const raise = insulin * isf;
          totalInsulin -= insulin;
          const curveY = GIRCurve(insulin / weight);
          const length = DIA[j];
          for (let k = j; k < length + j; k++) {
            const currentTime = (k - j) * 5.0 / 60;
            const percentage = getGIRCurvePercentage(curveY, currentTime);
            totalRaise += raise * percentage;
            extraInsulin[(i - 144) / (period / 5)] -= insulin * percentage;
            for (let l = k; l < length + j; l++) {
              adjustedBGs[l].setBg(adjustedBGs[l].getBG() + raise * percentage);
            }
          }
        }
      }
      for(let a = 0; a < adjustedBGs.length; a++)
        {
          tempBGs[a] = new BG(adjustedBGs[a].getBG(), adjustedBGs[a].getTime());
        }
      }
    }
 

    let totalDrop = 0;
    let previousTotalDrop = -4;

    while(totalDrop - previousTotalDrop > 0)
    {
      count++;
      console.log(df.format(totalInsulin) + " units applied(add insulin)");
      previousTotalDrop = totalDrop;
      for(let i = 144; i < adjustedBGs.length-144; i+=period/5)
      {
        let insulin = .01;
        let canRun = false;
        while(!canRun)
        {
          canRun = true;
          let drop = insulin * isf;
          const curveY = new Array(GIRCurve(insulin / weight));
          for(let j = i; j < i + period/5; j++)
          {
            let length = DIA[j];
            for(let a = j - 1; length <= 0; a--)
            {
                length = DIA[a];
            }
              for(let k = j; k < length + j; k++)
              {
                let currentTime = (k -j) * 5.0 / 60;
                let percentage = getGIRCurvePercentage(curveY, currentTime);
                for(let l = k; l < length + j; l++)
                {
                    if(tempBGs[l].getBG() - (drop * percentage) < min)
                        canRun = false;
                    tempBGs[l].setBg(tempBGs[l].getBG() - (drop * percentage));
                }
              }
          }
          if(canRun)
          {
              insulin += .01;
              canRun = false;
              for(let a = 0; a < adjustedBGs.length; a++)
              {
                  tempBGs[a] = new BG(adjustedBGs[a].getBG(), adjustedBGs[a].getTime());
              }
          }
          else
          {
              insulin -= .01;
              canRun = true;
          }
      }
      insulin *= .01;
      if(insulin > 0)
      {
          for(let j = i; j < i + period/5; j++)
          {
              let drop = insulin * isf;
              totalDrop += drop;
              let curveY = new Array(GIRCurve(insulin/weight));
              let length = DIA[j];
              for(let k = j; k < length + j; k++)
              {
                  let currentTime = (k -j) * 5.0 / 60;
                  let percentage = getGIRCurvePercentage(curveY, currentTime);
                  totalInsulin += insulin * percentage;
                  extraInsulin[(i-144)/(period/5)] += insulin * percentage;
                  for(let l = k; l < length + j; l++)
                  {
                      adjustedBGs[l].setBg(adjustedBGs[l].getBG() - (drop * percentage));
                  }
              }
          }
      }
      for(let a = 0; a < adjustedBGs.length; a++)
      {
          tempBGs[a] = new BG(adjustedBGs[a].getBG(), adjustedBGs[a].getTime());
      }
  }
}



    let averagedSum = 0;
    let countAverageBGs = 0;
    for(let i of averagedBGs)
    {
        if(!isNaN(i))
        {
            averagedSum += i;
            countAverageBGs++;
        }
    }

    let adjustedSum = 0;
    let countAdjustedBGs = 0;
    for(let i = 144; i < 432; i++)
    {
        if(!isNaN(adjustedBGs[i].getBG()))
        {
            adjustedSum += adjustedBGs[i].getBG();
            countAdjustedBGs++;
        }
    }

    console.log("AVG BG before: " + averagedSum/countAverageBGs);
    console.log("AVG BG after: " + adjustedSum/countAdjustedBGs);
    console.log("System Recommends: " + totalInsulin + " total units");
    let actualInsulin = (averagedSum/countAverageBGs - adjustedSum/countAdjustedBGs) / isf * (288/averageDIA);
    console.log("Insulin we can deliver is: " + actualInsulin + " total units");


    const extraInsulinCorrected = new Array(1440 / period + 1).fill(null).map(() => new Array(4).fill(null));


    extraInsulinCorrected[0][1] = "Basals";
    extraInsulinCorrected[0][2] = "Basal w/ Temp";
    extraInsulinCorrected[0][3] = "Recommended";
    //point this to the right area
    const basalProfiles = new Array(parseJSON.getBasalProfile(options.dateStart, options.dateEnd));
    const basals = new Array(basalProfiles[basalProfiles.length - 1].getProfile());
    for (const basal of basals) {
      const pos = (basal.getTime().getHour() * 60 + basal.getTime().getMinute()) / options.period;
      extraInsulinCorrected[pos + 1][1] = basal.getValue() + "";
    }
    for (let i = 1; i < extraInsulinCorrected.length; i++) {
      const value = extraInsulinCorrected[i][1];
      for (let j = i + 1; j < extraInsulin.length && extraInsulinCorrected[j][1] == null; j++) {
        if (extraInsulinCorrected[j][1] == null) {
          extraInsulinCorrected[j][1] = value;
        }
      }
    }
    
    if(extraInsulinCorrected[extraInsulinCorrected.length-1][1] == null)
        extraInsulinCorrected[extraInsulinCorrected.length-1][1] = extraInsulinCorrected[extraInsulinCorrected.length-2][1];
    for(let i = 0; i < extraInsulin.length; i++)
    {
      extraInsulinCorrected[i + 1][0] = new Date(0, 0, 0, 0, 0).setMinutes(i * period).toString();
      extraInsulinCorrected[i + 1][2] = extraInsulinCorrected[i + 1][1];
      extraInsulinCorrected[i+1][2] = df.format(basalAverages[i]);
      extraInsulinCorrected[i+1][3] = df.format(extraInsulin[i] * (actualInsulin/totalInsulin) * (60.0/period) + basalAverages[i]);
    }

    let adjustedBGsDouble = new Array(288);
    for(let i = 144; i < 432; i++)
    {
        adjustedBGsDouble[i-144] = adjustedBGs[i].getBG();
    }


    return extraInsulinCorrected;

}




