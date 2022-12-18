import _, { map } from 'underscore'

let profile: any = undefined

export async function setProfile(options: ResponseSettings) {
  if (!profile) {
    const response = await fetch(
      options.url + 'api/v1/profile.json?count=10000000'
    )
    console.log("Profile: ",options.url, 'api/v1/profile.json?count=10000000'  )
    profile = (await response.json()).reverse()
  }
}
export async function getBG(
  url: String,
  dateStart: Date,
  dateEnd: Date
): Promise<Array<Array<BG>>> {
  const bgUrl = url.concat(
    'api/v1/entries/sgv.json?find[dateString][$gte]=',
    dateStart.toISOString(),
    // new Date(dateStart+"T00:00").toISOString(),
    '&find[dateString][$lte]=',
    dateEnd.toISOString(),
    // new Date(dateEnd+"T00:00").toISOString(),
    '&count=1000000'
  )

  console.log('Grabbing BGs JSON from Nightscout...', [{ bgUrl }])
  const response = await fetch(bgUrl)
  const bgJSON = await response.json()
  console.log('Success(' + getSize(bgJSON) + ' KB)')

  let bgArray: Array<BG> = []
  bgJSON.map((i: any) => {
    bgArray.push({
      bg: i.sgv,
      time: new Date(i.dateString),
    })
  })

  //Split the BGs array into multiple arrays that each contain only a single day's worth of BGs
  let bgsArray: Array<Array<BG>> = _.chain(bgArray.reverse())
    .flatten(true)
    .groupBy(function (obj) {
      return obj.time.getDate()
    })
    .sortBy(function (v) {
      return v
    })
    .value()

  return bgsArray.reverse()
}

export function getBasalProfile(
  dateStart: Date,
  dateEnd: Date
): Array<BasalProfile> {
  const basalProfiles: Array<any> = []
  let start = false
  for (let i = 0; i < profile.length; i++) {
    let obj = profile[i]
    let startDate = new Date(obj.startDate)
    let endDate = new Date(
      i + 1 < profile.length ? profile[i + 1].startDate : new Date()
    )
    let basalProfile = {
      profile: obj.store.Default.basal,
      startDate: startDate,
      endDate: endDate,
    }
    if (dateStart > startDate && dateStart < endDate) {
      basalProfiles.push(basalProfile)
      start = true
    } else if (dateEnd > startDate && dateEnd < endDate) {
      basalProfiles.push(basalProfile)
      break
    } else if (start) {
      basalProfiles.push(basalProfile)
    }
  }
  return basalProfiles
}

export async function getTempBasal(
  url: String,
  dateStart: Date,
  dateEnd: Date
): Promise<Array<TempBasal>> {
  const tempBasalUrl = url.concat(
    'api/v1/treatments.json?find[created_at][$gte]=',
    dateStart.toISOString(),
    // new Date(dateStart+"T00:00").toISOString(),
    '&find[created_at][$lte]=',
    // new Date(dateEnd+"T00:00").toISOString(),
    dateEnd.toISOString(),
    '&find[eventType]=Temp+Basal',
    '&count=1000000'
  )
  console.log('Grabbing Temp Basals from Nightscout...', [{ tempBasalUrl }])
  const response = await fetch(tempBasalUrl)
  const tempBasalJSON = await response.json()

  console.log('Success(' + getSize(tempBasalJSON) + ' KB)')

  let tempBasals: Array<TempBasal> = []
  tempBasalJSON.map((i: any) => {
    tempBasals.push({
      rate: i.rate,
      duration: i.duration,
      created_at: new Date(i.created_at),
    })
  })

  tempBasals = tempBasals.reverse()

  //Fixup temp basal durations to account for rounding discrepancies and errors in the logging
  for (let i = 1; i < tempBasals.length; i++) {
    let previousEnd: Date = new Date(
      tempBasals[i - 1].created_at.getTime() +
        tempBasals[i - 1].duration * 60 * 1000
    )
    const currentStart: Date = tempBasals[i].created_at
    if (previousEnd > currentStart) {
      const diff: number =
        (currentStart.getTime() - tempBasals[i - 1].created_at.getTime()) /
        (60 * 1000)
      tempBasals[i - 1].duration = diff
    }
  }

  return tempBasals
}

//This runs perfectly to get boluses and return the total bolus amount for each day.
export async function getDailyBolusTotals(
  url: String,
  dateStart: Date,
  dateEnd: Date
): Promise<Array<TempBasal>> {
  const bolusUrl = url.concat(
    'api/v1/treatments.json?find[created_at][$gte]=',
    dateStart.toISOString(),
    // new Date(dateStart+"T00:00").toISOString(),
    '&find[created_at][$lte]=',
    // new Date(dateEnd+"T00:00").toISOString(),
    dateEnd.toISOString(),
    '&find[eventType]=Correction+Bolus'
  )
  console.log('Grabbing Bolus Data from Nightscout...', [{ bolusUrl }],bolusUrl)
  const response = await fetch(bolusUrl)
  const bolusJSON = await response.json()

  console.log('Success(' + getSize(bolusJSON) + ' KB)')

  let boluses: Array<Boluses> = []
  bolusJSON.map((i: any) => {
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
//TODO: Possibly get the ISF from loop instead of having the user input it
// function getIsfProfile(dateStart: Date, dateEnd: Date){
//     const isfProfiles: Array<any> = []

//     let start = false
//     for(let i = 0; i < profile.length; i++){
//         let obj = profile[i]
//         let startDate = new Date(obj.startDate)
//         let endDate = new Date(i+1 < profile.length ? profile[i+1].startDate : new Date())
//         obj.store.Default.sens.map((sensObj: any)=>{
//             sensObj.time = new Date(startDate.toISOString().split("T")[0] + "T" + sensObj.time)
//         })

//         let isfProfile = {
//             profile: obj.store.Default.sens,
//             startDate: startDate,
//             endDate: endDate
//         }
//         if (dateStart > startDate && dateStart < endDate){
//             isfProfiles.push(isfProfile)
//             start = true
//         }

//         else if (dateEnd > startDate && dateEnd < endDate){
//             isfProfiles.push(isfProfile)
//             break;
//         }
//         else if(start){
//             isfProfiles.push(isfProfile)
//         }
//     }

//     console.log(isfProfiles)

//     return isfProfiles
// }


function getSize(obj: JSON): number {
  return Math.round((new TextEncoder().encode(JSON.stringify(obj)).length / 1024) * 10) / 10
}

