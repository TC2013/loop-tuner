//  import { options } from '../index';
 import * as basal from './basal';
 import * as misc from './misc';
 import * as GIR from './GIR';
 
 // Return the average Duration of Insulin Activity for each 5 minute period in the day. DIA is equal to the length of the GIR curve.
 export async function getDIA(options) {
  // const profile = JSON.parse(localStorage.getItem('profile'))
  // const bolusJSON = JSON.parse(localStorage.getItem('bolusJSON'));
  // const tempBasals = JSON.parse(localStorage.getItem('tempBasals'))
  const netTempBasals = await basal.getNetTempBasals()
  const avgNetTempBasals = await basal.averageNetTempBasalsByPeriod(netTempBasals, options)
  const avgNetBolusBasals = await basal.avgBolusBasalByPeriod(options)
  const netBasals = misc.addBolusArrays(avgNetBolusBasals, avgNetTempBasals)
  console.log('netBasals', netBasals,'avgNetBolusBasal',avgNetBolusBasals,'avgNetTempBasal',avgNetTempBasals)
  let insulinDeliveredArr = new Array(575)
  for (let i = 0; i < 144; i++) {
      insulinDeliveredArr[i] = netBasals[i + 144];
      insulinDeliveredArr[i + 144] = netBasals[i];
      insulinDeliveredArr[i + 288] = netBasals[i + 144];
      insulinDeliveredArr[i + 432] = netBasals[i];
    }
  
  console.log('insulinDeliveredArr', insulinDeliveredArr)
  let DIA = new Array(576).fill(0)
    for (let i = 144; i < 432; i++) {
      let insulin = 0;
      for (let j = i - options.poolingTime / 5; j < i; j++) {
        insulin += insulinDeliveredArr[j];
      }
      GIRCurveLength = GIR.GIRCurve(insulin/options.weight).length
      DIA[i] += GIRCurveLength * 15.0 / 60.0 / 5.0;
    }
    for (let i = 0; i < 144; i++) {
      DIA[i] = DIA[i + 288];
      DIA[i + 432] = DIA[i + 144];
    }
    console.log('DIA', DIA)
  return DIA
}