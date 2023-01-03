

 function getGIRCurvePercentage(curveY, currentTime)
 {
  // curveY is the yData for the GIR curve for whatever insulin/kg we are using.
  //The currentTime is the time since the insulin was delivered on the GIR curve. The currentTime is in the format of hours.

  //get the x position that the currentTime would fall on the GIR curve. We divide the currentTime(which is in hours) by how many
  // hours 15 seconds is. (15 seconds / 60 seconds in a minute / 60 minutes in an hour)
  const pos = Math.round(currentTime / (15.0 / 3600));

  // Get the total area under the GIR curve
  let totalArea = 0;
  for (const v of curveY) {
      totalArea += v * (15.0 / 3600);
  }

  // Get our partial area under the GIR curve for the currentTime plus the next 5 minutes
  let partialArea = 0;
  for (let i = 0; i < 20 && i + pos < curveY.length; i++) {
      partialArea += curveY[pos + i] * (15.0 / 3600);
  }

  // Return what percentage of the GIR curve our currentTime plus the next 5 minutes would be.
  return partialArea / totalArea;
}

export function GIRCurve(insulinKG) {
  let smallXData = new Array(1920);
  let mediumXData = new Array(1920);
  for (let i = 0; i < 1920; i++) {
    let x = i * (15.0/3600);
    smallXData[i] = x;
    mediumXData[i] = x;
  };
  let smallYData = getSmallYData(smallXData);
  let mediumYData = getMediumYData(mediumXData);

  let smallMedium = new Array(smallYData.length);
    for(let i = 0; i < smallMedium.length; i++) {
      smallMedium[i] = smallYData[i] / mediumYData[i];
    }
 
  let newCurveY = new Array(1920);
    for(let i = 0; i < newCurveY.length; i++) {
      let pow = -1.44269504088897 * Math.log(insulinKG) - 3.32192809488739;
      let yRate = -0.0455826595478078 * smallXData[i] + 0.9205489113464720;
      let yDiff = Math.pow(yRate, pow) * smallMedium[i];
      let yMultiplier = Math.pow(yDiff, pow);
      let value = smallYData[i] * yMultiplier;
      if(i != 0 && Math.abs(newCurveY[i-1] - value) > .05)
          {newCurveY[i] = newCurveY[i-1];}
      else
          {newCurveY[i] = value;}
    }
  
  let peakValue = 0;
    for(let i of newCurveY) {
      if(i > peakValue) {
          peakValue = i;
      }
    }
      // console.log('peakValue', peakValue)
  let stop = peakValue *.01;
  let count = 0; // count keeps track of how many positions we are going to include in the curve (the number of positions before stop)
  for(let i = 0; i < newCurveY.length; i++) {
      //y = -1.4426950408889700ln(x) - 3.3219280948873900
      let pow = -1.44269504088897 * Math.log(insulinKG) - 3.32192809488739;
      //y = -0.0455826595478078x + 0.9205489113464720
      let yRate = -0.0455826595478078 * smallXData[i] + 0.9205489113464720;
      let yDiff = Math.pow(yRate, pow) * smallMedium[i];
      let yMultiplier = Math.pow(yDiff, pow);
      let value = smallYData[i] * yMultiplier;
      if(i != 0 && Math.abs(newCurveY[i-1] - value) > .05)
          {newCurveY[i] = newCurveY[i-1];}
      else
          {newCurveY[i] = value;}

      if (!isNaN((15.0 / 3600) * (smallYData[i] * yMultiplier)) && (15.0) * (smallYData[i] * yMultiplier) > 0)
          {count++;}
      if(i > 50 && newCurveY[i] < stop)
          {i = 9999999;}
  }
  // console.log('newCurveY', newCurveY)
  const newCurveChopY = new Array(count);
  const newCurveChopX = new Array(count);
  let count0 = 0; // Count the number of data points that are below 0 at the beginning of our curve. We use this so that we don't include them
  for(let i = 0; i < newCurveChopY.length+count0; i++) {
      let x = (i-count0) * (15.0/3600);
      // console.log(x)
      if(newCurveY[i] > 0)
      {
          newCurveChopY[i-count0] += newCurveY[i];
          newCurveChopX[i-count0] += x;
      }
      else
      {
          count0++;
      }
  }
  // console.log('newCurveChopY', newCurveChopY)
  return newCurveChopY;
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