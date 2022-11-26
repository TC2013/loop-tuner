
let profile: any = undefined

export async function setProfile(options: ResponseSettings){
    if(!profile){
        const response = await fetch(options.url + "api/v1/profile.json?count=10000000")
        profile = (await response.json()).reverse()
    }
}

export async function getBG(url: String, dateStart: Date, dateEnd: Date): Promise<Array<BG>>{
    const bgUrl = url.concat(
        "api/v1/entries/sgv.json?find[dateString][$gte]=",
        dateStart.toISOString(),
        "&find[dateString][$lte]=",
        dateEnd.toISOString(),
        "&count=1000000"
    )

    console.log("Grabbing BGs JSON from Nightscout...")
    
    const response = await fetch(bgUrl)
    const bgJSON = await response.json()

    console.log("Success(" + getSize(bgJSON) + " KB)")
    
    let bgArray:Array<BG> =[]
    bgJSON.map((i: any)=>{
        bgArray.push({
            bg: i.sgv,
            time: new Date(i.dateString)
        })
    })

    return bgArray.reverse()
}

export function getBasalProfile(dateStart: Date, dateEnd: Date): Array<BasalProfile>{
    const basalProfiles: Array<any> = []
    
    let start = false
    for(let i = 0; i < profile.length; i++){
        let obj = profile[i]
        let startDate = new Date(obj.startDate)
        let endDate = new Date(i+1 < profile.length ? profile[i+1].startDate : new Date())
        let basalProfile = {
            profile: obj.store.Default.basal,
            startDate: startDate,
            endDate: endDate
        }
        if (dateStart > startDate && dateStart < endDate){
            basalProfiles.push(basalProfile)
            start = true
        }

        else if (dateEnd > startDate && dateEnd < endDate){
            basalProfiles.push(basalProfile)
            break;
        }
        else if(start){
            basalProfiles.push(basalProfile)
        }
    }

    return basalProfiles
}

export async function getTempBasal(url: String, dateStart: Date, dateEnd:Date): Promise<Array<TempBasal>>{
    const tempBasalUrl = url.concat(
        "api/v1/treatments.json?find[created_at][$gte]=",
        dateStart.toISOString(),
        "&find[created_at][$lte]=",
        dateEnd.toISOString(),
        "&find[eventType]=Temp+Basal"
    )

    console.log("Grabbing Temp Basals from Nightscout...")
    const response = await fetch(tempBasalUrl)
    const tempBasalJSON = await response.json()

    console.log("Success(" + getSize(tempBasalJSON) + " KB)")

    let tempBasals:Array<TempBasal> = []
    tempBasalJSON.map((i:any)=>{
        tempBasals.push({
            rate: i.rate,
            duration: i.duration,
            created_at: new Date(i.created_at)
        })
    })

    return tempBasals.reverse()
    
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

function getSize(obj: JSON): number{
    return new TextEncoder().encode(JSON.stringify(obj)).length/1024
}