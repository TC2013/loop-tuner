//  import { options } from '../index';
 import * as GIR from './GIR';
 
 // Return the average Duration of Insulin Activity for each 5 minute period in the day. DIA is equal to the length of the GIR curve.
//  export async function getDIA(options, netBasals) {
//   let insulinDeliveredArr = new Array(576)
//   for (let i = 0; i < 144; i++) {
//       insulinDeliveredArr[i] = netBasals[i + 144];
//       insulinDeliveredArr[i + 144] = netBasals[i];
//       insulinDeliveredArr[i + 288] = netBasals[i + 144];
//       insulinDeliveredArr[i + 432] = netBasals[i];
//   }
  
//   let DIA = new Array(576).fill(0)
//   for (let i = 144; i < 432; i++) {
//     let insulin = 0;
//     for (let j = i - options.poolingTime / 5; j < i; j++) {
//       insulin += insulinDeliveredArr[j];
//     }
//     let GIRCurve = GIR.GIRCurve(insulin/options.weight);
//     let GIRCurveLength = GIRCurve.length;
//     DIA[i] += GIRCurveLength * 15.0 / 60.0 / 5.0;
//     let roundedDIA = Math.round(DIA[i]);
//     let percentageInsulinUsedArr = new Array(roundedDIA).fill(0);
//     let areaUnderCurve = 0;
//     for (let j = 0; j < GIRCurve.length; j++) {
//         areaUnderCurve += GIRCurve[j];
//     }
//     let percentageInsulinUsed = 0;
//     for (let j = 0; j < roundedDIA; j++) {
//         percentageInsulinUsed += GIRCurve[j] / areaUnderCurve;
//         percentageInsulinUsedArr[j] = percentageInsulinUsed;
//     }
//     DIA[i] = {DIA: roundedDIA, percentageInsulinUsedArr};
//   }
//   for (let i = 0; i < 144; i++) {
//     DIA[i] = DIA[i + 288];
//     DIA[i + 432] = DIA[i + 144];
//   }
//   console.log('DIA', DIA)
//   return DIA;
// };



 export async function getDIA(options, netBasals) {
  console.log('DIA started')
  let insulinDeliveredArr = new Array(576)
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

