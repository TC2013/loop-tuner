import * as parseJSON from './parseJSON'
import _ from "underscore"


//BEGIN BG FUNCTIONS

  export function averageBGs(bgsArray: Array<Array<BG>>): Array<BG>{
      let allBGs: Array<any> = []

      bgsArray.map((obj)=>{
          let newBGs:Array<any> = []
          let i:number = 0
          obj.map((BG) =>{

              while((BG.time.getMinutes() + BG.time.getHours()*60) - i*5 > 5){
                  newBGs.push({})
                  i++
              }
              newBGs.push(BG)
              i++
          })

          while(newBGs.length < 288){
              newBGs.push({})
          }
          allBGs.push(newBGs)
      })

      let averageBGs: Array<BG> = []
      for(let j = 0; j < allBGs[0].length; j++){
          let sum = []
          for(let i = 0; i < allBGs.length; i++){
              sum.push(allBGs[i][j].bg)
          }

          sum = sum.filter(Number)
          
          const average = sum.reduce((a, b) => a + b) / sum.length;
          averageBGs.push({
              bg: average,
              time: new Date(new Date("1970-01-01T00:00").setMinutes(j*5))
          })
      }
      
      return averageBGs


  }
  //This return every fourth value to help with mobile views...
  export function averageBGsMobileView(bgsArray: Array<Array<BG>>): Array<BG>{
    let allBGs: Array<any> = []

    bgsArray.map((obj)=>{
        let newBGs:Array<any> = []
        let i:number = 0
        obj.map((BG) =>{

            while((BG.time.getMinutes() + BG.time.getHours()*60) - i*5 > 5){
                newBGs.push({})
                i++
            }
            newBGs.push(BG)
            i++
        })

        while(newBGs.length < 288){
            newBGs.push({})
        }
        allBGs.push(newBGs)
    })

    let averageBGs: Array<BG> = []
    for(let j = 0; j < allBGs[0].length; j += 4){  // only iterate through every fourth element
        let sum = []
        for(let i = 0; i < allBGs.length; i++){
            sum.push(allBGs[i][j].bg)
        }

        sum = sum.filter(Number)
        
        const average = sum.reduce((a, b) => a + b) / sum.length;
        averageBGs.push({
            bg: average,
            time: new Date(new Date("1970-01-01T00:00").setMinutes(j*5))
        })
    }
    
    return averageBGs
  }

//BEGIN TEMP BASAL FUNCTIONS

  //This returns the total amount of insuling deliverd through temp basals
  export function getTempBasalTotal(tempBasals: Array<TempBasal>){
    let tempBasalTotal = tempBasals.reduce((acc, obj) => {
      return acc + obj.rate * obj.duration / 60;
    }, 0);
    return tempBasalTotal;
  }

  //This returns the net basal amount for each day. It includes both the temp basals and the regular basal rates.
  export function getNetBasals(tempBasals: Array<TempBasal>, basalProfiles: Array<BasalProfile>, options: ResponseSettings){
    let netBasals = []

    for(let i = 0; i < tempBasals.length-1; i++){
        netBasals.push(tempBasals[i])
        let tbStart = new Date(tempBasals[i].created_at)
        let tbEnd = new Date(new Date(tbStart).setTime(tbStart.getTime() + tempBasals[i].duration * (1000 * 60)))
        let nextTbStart = new Date(tempBasals[i+1].created_at)
        if(tbEnd < nextTbStart){
            pushBasalProfiles(basalProfiles, tbEnd, netBasals, nextTbStart)
        } 

    }

    return netBasals
}
  //This returns the basal profile daily totals if temp basals were not used. It lookes at the basal profiles and returns the total daily delivery.
  export function getBasalProfileTotals(basalProfiles: Array<BasalProfile>){
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
    return basalProfilesTotal;
  }

  //This is tied to the getNetBasals function. getNetBasals returns the actual basal rates through the time periods 
  function pushBasalProfiles(basalProfiles: Array<BasalProfile>, tbEnd: Date, netBasals: Array<TempBasal>, nextTbStart: Date){
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

              netBasals.push({
                      rate: rate,
                      duration: duration,
                      created_at: created_at
              })

              tbEnd = new Date(tbEnd.getTime() + duration * 1000 * 60)

          }

      }
      
  }

  //Get Total Daily Delivery for TempBasalInsulin
  function netBasalAmount(netBasals) {
    var netBasalAmount = {};
    for (var i = 0; i < netBasals.length; i++) {
      var netBasal = netBasals[i];
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
  export function sumAmountPerDay(netBasals) {
    // First, we need to iterate over the array of objects and calculate the amount for each object
    netBasals.forEach(basal => {
      basal.amount = basal.rate / 60 * basal.duration;
    });
    //sum all amounts in netBasals
    var total = 0;
    for (var i = 0; i < netBasals.length; i++) {
      total += netBasals[i].amount;
    }
    console.log('total for all netBasals',total);

    // Next, we will create an object that maps dates to the total amount for that date
    const amountsPerDay = {};
    netBasals.forEach(basal => {
      // We need to remove the time portion of the date string in order to group by day
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

  export function averageNetBasals(netBasals: TempBasal[]){
    let averageNetBasals = new Array(48).fill(0)
    netBasals.map((obj) =>{
        let tbStart = obj.created_at
        let tbEnd = new Date(tbStart.getTime() + obj.duration * 1000 * 60)
        let i = tbStart.getHours() * 2 + Math.floor(tbStart.getMinutes()/30)
        
        for(let j = tbEnd.getHours() * 2 + Math.floor(tbEnd.getMinutes()/30);j > i; j--){
            let duration = (j%2 == 0) ? tbEnd.getMinutes() : tbEnd.getMinutes() - 30
            averageNetBasals[j] += duration * (obj.rate/60)
            tbEnd.setMinutes(tbEnd.getMinutes() - duration)
        }
        
        let duration = (tbEnd.getTime() - tbStart.getTime()) / (1000 * 60)
        averageNetBasals[i] += duration * (obj.rate/60)
    })
    return averageNetBasals
  }

//BEGIN BOLUS FUNCTIONS

  export async function dailyBolusTotals(bolusJSON: Promise<Array<any>>) {
    // Wait for the bolusJSON promise to resolve
    const bolusData = await bolusJSON;

    let boluses: Array<Boluses> = []
    bolusData.map((i: any) => {
      boluses.push({
        bolus: i.insulin,
        created_at: new Date(i.created_at),
      })
    })  

    let bolusTotals = boluses.reduce(function (acc, curr) {
      let date = new Date(curr.created_at);
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
    // console.log("Boluses: ", bolusTotals)
    return bolusTotals;
  }

  export async function avgCorrectionBoluses(bolusJSON, profile, dateStart, dateEnd) {
    await bolusJSON
    await profile
    let preBolusArray = {...bolusJSON }
    let updatedProfile = {...profile}
    let days = (dateEnd - dateStart) / (1000 * 60 * 60 * 24);
    //working
    //Loop through bolusJSON and sum all of the insulin values for each object with eventType = "Correction Bolus". Console.log the result.
    let totalInsulin = 0;
    for (var i = 0; i < bolusJSON.length; i++) {
      if (bolusJSON[i].eventType == "Correction Bolus") {
        totalInsulin += bolusJSON[i].insulin;
      }
    }
    console.log("Total boluses [Meal + Correction Boluses](This value is taken straight from bolusJSON): ", totalInsulin);
    console.log('This average of the Total Boluses taken from bolusJSON: ', totalInsulin / days);

    

    //working
    //loop through updatedProfile. Each object contains a timeAsSeconds. carbRatioStartTime =  timeAsSeconds. timeAsSeconds is the number of seconds since midnight. For updatedProfile[i], add a property called carbRatioEndTime = updatedProfile[i+1].timeAsSeconds. The carbRatioEndTime for the last object in updatedProfile will be 86400 (24 hours in seconds).
    for (var i = 0, j = 0; i < updatedProfile.length; j++) {
      if (j == updatedProfile[i].carbRatio.length - 1) {
        updatedProfile[i].carbRatio[j].end = 86400;
        i++
        j=0
      } else {
        updatedProfile[i].carbRatio[j].end  = updatedProfile[i].carbRatio[j+1].timeAsSeconds;
      }
    }
    console.log('updatedProfile',updatedProfile)//verified that the carbRatioEndTime is correct


    
    //loop through the preBolusArray and for every object with eventType = "Correction Bolus", update the current object with the following properties: endTimestamp, carbratio, calculatedInsulin, and remainingInsulin. The endTimestamp is the timestamp + the duration of the correction bolus. Set remainingInsuling equal to the insulin value. Set carbratio equal to the carbratio value located in updatedProfile at the time of the correction bolus. To find the carbratio value, loop through updatedProfile and find the object with a carbRatioStartTime <= the timestamp of the correction bolus and a carbRatioEndTime > the timestamp of the correction bolus. Calculate the calculatedInsulin by multiplying the insulin value by the carbratio value.
    //working
    for (var i = 0; i < preBolusArray.length; i++) {
      if (preBolusArray[i].eventType == "Carb Correction") {
        preBolusArray[i].endTimestamp = new Date(new Date(preBolusArray[i].timestamp).getTime() + preBolusArray[i].absorptionTime * 1000 * 60).toISOString()
          for (var j = 0, k = 0; j < updatedProfile.length;) {
          let preBolusArrayTimestamp = new Date(preBolusArray[i].timestamp)
          let updatedProfileTimeAsSeconds = updatedProfile[j].carbRatio[k].timeAsSeconds
    
          if (updatedProfileTimeAsSeconds <= preBolusArrayTimestamp.getTime() / 1000 
              && updatedProfile[j].carbRatio[k].end > getSecondsSinceMidnight(preBolusArrayTimestamp.getTime() / 1000)) {
            preBolusArray[i].carbratio = updatedProfile[j].carbRatio[k].value;
            preBolusArray[i].calculatedInsulin = preBolusArray[i].carbs/preBolusArray[i].carbratio;
            preBolusArray[i].remainingInsulin = preBolusArray[i].carbs/preBolusArray[i].carbratio;
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
    //liekly working
    console.log('preBolusArray',preBolusArray)
    let totalCalculatedInsulin = 0;
    for (var i = 0; i < preBolusArray.length; i++) {
      if (preBolusArray[i].eventType == "Carb Correction") {
        totalCalculatedInsulin += preBolusArray[i].calculatedInsulin;
      } 
    }
    console.log("Total Meal Bolus Insulin: ", totalCalculatedInsulin);

    //create an array with 48 positions named bolusArray. Fill the array with 0s. bolusArray will be used to store only the Correction Bolus insulin values that do not have a corresponding Carb Correction.
    var bolusArray = new Array(48).fill(0);
    //Loop through preBolusArray and if eventType="Carb Correction", this event will be called the currentCarbCorrection. Look for an exactMatch in the preBolusArray. An exactMatch is a corresponding eventType="Correction Bolus" with created_at = to currentCarbCorrection.created_at. If there is an exactMatch, then subtract the exactMatch.insulin from the currentCarbCorrection.remainingInsulin and set this as the value for currentCarbCorrection.remainingInsulin. If carbCorrection.remainingInsulin is <= 0, then set exactMatch.insulin to (exactMatch.insulin - currentCarbCorrection.remainingInsulin).  If carbCorrection.remainingInsulin > 0, loop through preBolusArray again and look for a nearMatch. A nearMatch is an eventType="Correction Bolus" with a timestamp that is > currentCarbCorrection.timestamp && < currentCarbCorrection.endTimestamp. If there is a nearMatch, then subtract the nearMatch.insulin from the currentCarbCorrection.remainingInsulin and set this as the value for currentCarbCorrection.remainingInsulin. If carbCorrection.remainingInsulin is <= 0, then set nearMatch.insulin to (nearMatch.insulin - currentCarbCorrection.remainingInsulin). If carbCorrection.remainingInsulin > 0, then repeat this loop until currentCarbCorrection.remainingInsulin = 0 or no nearMatches are found.

  //working
    for (var i = 0; i < preBolusArray.length; i++) {
      if (preBolusArray[i].eventType == "Carb Correction") {
        var currentCarbCorrection = preBolusArray[i];
        for (var j = 0; j < preBolusArray.length; j++) {
          if (preBolusArray[j].eventType == "Correction Bolus" && preBolusArray[j].created_at == currentCarbCorrection.created_at) {
            var exactMatch = preBolusArray[j];
            currentCarbCorrection.remainingInsulin -= exactMatch.insulin;
            exactMatch.insulin = 0;
            if (currentCarbCorrection.remainingInsulin <= 0) {
              exactMatch.insulin -= currentCarbCorrection.remainingInsulin;
              break;
            }
          }
        }
        while (currentCarbCorrection.remainingInsulin > 0) {
          for (var j = 0; j < preBolusArray.length; j++) {
            if (preBolusArray[j].eventType == "Correction Bolus" && preBolusArray[j].timestamp > currentCarbCorrection.timestamp && preBolusArray[j].timestamp < currentCarbCorrection.endTimestamp) {
              var nearMatch = preBolusArray[j];
              currentCarbCorrection.remainingInsulin -= nearMatch.insulin;
              nearMatch.insulin = 0;
              if (currentCarbCorrection.remainingInsulin <= 0) {
                nearMatch.insulin -= currentCarbCorrection.remainingInsulin;
                break;
              }
            }
          }
          if (currentCarbCorrection.remainingInsulin > 0) {
            break;
          }
        }
      }
    } console.log('Processed preBolusArray where meal insulin has been subtracted from Bolus Corrections that applied to meals',preBolusArray)

    //Loop through preBolusArray and if eventType="Correction Bolus", add the insulin value to the corresponding bolusArray position. The corresponding position is the hour * 2 + Math.floor(minute / 30). If the eventType = "Carb Correction", add the remainingInsulin to the corresponding bolusArray position.
    for (var i = 0; i < preBolusArray.length; i++) {
      //This is the bolusArray in 30 minute windows, but not averaged by day
      if (preBolusArray[i].eventType == "Correction Bolus") {
        var bolusTime = new Date(preBolusArray[i].timestamp);
        var bolusHour = bolusTime.getHours();
        var bolusMinute = bolusTime.getMinutes();
        var bolusIndex = bolusHour * 2 + Math.floor(bolusMinute / 30);
        bolusArray[bolusIndex] += preBolusArray[i].insulin;
      } 
    
    }
    console.log("Correction Bolus Array(no Meal Boluses): ", bolusArray);
    //Loop through the bolusArray and sum the values. Console.log the result.
    var totalBolusInsulin = 0;
    for (var i = 0; i < bolusArray.length; i++) {
      totalBolusInsulin += bolusArray[i];
    }
    console.log("Total Correction Boluses (no Meal Boluses): ", totalBolusInsulin);

    //Loop through the bolusArray and divide each value by the difference in days beteen the dateStart and dateEnd. Update each position with the new value.

    for (var i = 0; i < bolusArray.length; i++) {
      bolusArray[i] /= days;
    }
    //sum the values in the bolusArray and console.log the result.
    var totalBolusInsulin = 0;
    for (var i = 0; i < bolusArray.length; i++) {
      totalBolusInsulin += bolusArray[i];
    }
    console.log("Total Average Correction Boluses (no Meal Boluses) per day: ", totalBolusInsulin);

  return bolusArray;
  }


//MISC FUNCTIONS

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
    var combinedInsulinDailyTotal = [];
    for (var i = 0; i < netBolusDailyTotals.length; i++) {
      var bolus = netBolusDailyTotals[i];
      var basal = netBasalDailyTotals[i];
      var combined = {
        date: bolus.date,
        amount: bolus.amount + basal.amount
      };
      combinedInsulinDailyTotal.push(combined);
    }
    return combinedInsulinDailyTotal;
  }

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

  //This is the ICR Calculator
  //Based on https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5478012
  export function icrCalculator(weight, netBasalDailyTotals, dailyTotalInsulin) {
    // Calculate the average dailyTotalInsulin amount
    let totalInsulin = 0;
    for (const entry of dailyTotalInsulin) {
      totalInsulin += entry.amount;
    }
    const avgTotalInsulin = totalInsulin / dailyTotalInsulin.length;
    console.log("avgDailyTotalInsulin",avgTotalInsulin)

    // Calculate the average dailyTotalBasalInsulin amount
    let totalBasalInsulin = 0;
    for (const entry of netBasalDailyTotals) {
      totalBasalInsulin += entry.amount;
    }
    const avgBasalInsulin = totalBasalInsulin / netBasalDailyTotals.length;
    console.log("avgDailyBasalInsulin",avgBasalInsulin)

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

  /////////////Begin Glucose Infusion Rate (GIR) Calculations////////////////

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

  // export async function getDIA(correctionBoluses, url, dateStart, dateEnd, weight, poolingTime) {
  //   const basalAverage = await averageBasals(url, dateStart, dateEnd, 5, false);
  //   console.log('basalAverage',basalAverage)
  //   const insulinDeliveredArr = new Array(576);
  //   console.log('correctionBoluses',correctionBoluses)
  //   const correctionBolusesFilled = await correctionBoluses
  //   console.log('correctionBolusesFilled',correctionBolusesFilled)

    // for (let i = 0; i < basalAverage.length; i++) {
    //   const hour = Math.floor(i * 5 / 60);
    //   const minute = i * 5 - (60 * hour);
    //   insulinDeliveredArr[i + 144] = new CorrectionBolus(basalAverage[i] / 12, { hour, minute });
    // }

    // insulinDeliveredArr.splice(0, 0, ...insulinDeliveredArr.slice(288, 432));
    // insulinDeliveredArr.splice(432, 0, ...insulinDeliveredArr.slice(144, 288));

    // for (const correctionBolus of correctionBolusesFilled) {
    //   // const pos = (correctionBolus.getTimestamp().hour * 60 + correctionBolus.getTimestamp().minute) / 5;
    //   const pos = (correctionBolus.getTimestamp().getHours() * 60 + correctionBolus.getTimestamp().getMinutes()) / 5;
    //   insulinDeliveredArr[pos + 144].insulin += correctionBolus.insulin;
    // }

    // const DIA = new Array(576);
    // for (let i = 144; i < 432; i++) {
    //   let insulin = 0;
    //   for (let j = i - poolingTime / 5; j < i; j++) {
    //     insulin += insulinDeliveredArr[j].insulin;
    //   }
    //   DIA[i] += GIRCurve(insulin / weight, false).length * 15.0 / 60.0 / 5.0;
    // }

    // DIA.splice(0, 0, ...DIA.slice(288, 432));
    // DIA.splice(432, 0, ...DIA.slice(144, 288));
    // return DIA;
  // }

  // Calculates the average basal over every period specified. The period is in minutes. So using a period of 30 would return an array consisting of the average basal every 30 minutes.




 

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