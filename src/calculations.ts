import * as parseJSON from './parseJSON'
import _ from "underscore"

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

export function getNetBasals(tempBasals: Array<TempBasal>, basalProfiles: Array<BasalProfile>, options: ResponseSettings){
    let netBasals = []

    for(let i = 0; i < tempBasals.length-1; i++){
        netBasals.push(tempBasals[i])
        let tbStart = new Date(tempBasals[i].created_at)
        let tbEnd = new Date(new Date(tbStart).setMinutes(tbStart.getMinutes() + tempBasals[i].duration))
        let nextTbStart = new Date(tempBasals[i+1].created_at)
        if(tbEnd < nextTbStart){
            pushBasalProfiles(basalProfiles, tbEnd, netBasals, nextTbStart)
        } 

    }

    return netBasals

}
//This is tied to the function above. getNetBasals returns the actual basal rates through the time periods 
function pushBasalProfiles(basalProfiles: Array<BasalProfile>, tbEnd: Date, netBasals: Array<TempBasal>, nextTbStart: Date){
    let profile: Array<Basal> = []
    basalProfiles.map((obj) =>{
        if(tbEnd >= obj.startDate && tbEnd <= obj.endDate){
            profile = obj.profile.map((x) => x)
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

//This function average the "amount" values in an array
function averageAmount(array) {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += array[i].amount;
  }
  return sum / array.length;
}

//This is the ISF Calculator 
//Based on https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5478012
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

//This is the Fine Tuning ISF calculator


//This is the ICR Calculator
//Based on https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5478012
export function icrCalculator(weight, netBasalDailyTotals, dailyTotalInsulin) {
  // Calculate the average dailyTotalInsulin amount
  let totalInsulin = 0;
  for (const entry of dailyTotalInsulin) {
    totalInsulin += entry.amount;
  }
  const avgTotalInsulin = totalInsulin / dailyTotalInsulin.length;
  console.log("avgTotalInsulin",avgTotalInsulin)

   // Calculate the average dailyTotalInsulin amount
   let totalBasalInsulin = 0;
   for (const entry of netBasalDailyTotals) {
    totalBasalInsulin += entry.amount;
   }
   const avgBasalInsulin = totalBasalInsulin / netBasalDailyTotals.length;
   console.log("avgBasalInsulin",avgBasalInsulin)
   console.log(weight)
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

