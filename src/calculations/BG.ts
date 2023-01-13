export function averageBGs(bgsArray: Array<Array<BG>>): Array<BG> {
  let allBGs: Array<any> = []

  for (let k = 0; k < bgsArray.length; k++) {
    let newBGs: Array<any> = []
    for (let i = 0; i < bgsArray[k].length; i++) {
      let bg = bgsArray[k][i]
      if ((new Date(bg.time).getMinutes() + new Date(bg.time).getHours() * 60) - i * 5 > 5) {
        newBGs.push({})
      } else {
        newBGs.push(bg)
      }
    }
    while (newBGs.length < 288) {
      if (newBGs.length < 288) {
        newBGs.push({})
      }
    }
    allBGs.push(newBGs)
  }
  console.log('allBGs', allBGs)
  if(allBGs.length > 1){
    let averageBGs: Array<BG> = []
    for (let j = 0; j < 288; j++) {
      let sum = []
      for (let i = 0; i < allBGs.length; i++) {
        sum.push(allBGs[i][j].bg)
      }

      sum = sum.filter(Number)

      const average = sum.reduce((a, b) => a + b) / sum.length;
      averageBGs.push({
        bg: average,
        time: new Date(new Date("1985-10-21T00:00").setMinutes(j * 5))
      })
    }
    // for (let i = 0; i < averageBGs.length; i++) {
    //   averageBGs[i].bg = Math.round(averageBGs[i].bg);
    // }
    return averageBGs
  } else if (allBGs.length === 1){
    let averageBGs = []
    for(let i = 0; i < 288; i++){
      let bg = allBGs[0][i].bg;
      let time = new Date(allBGs[0][i].time);
      averageBGs.push({
        bg: bg,
        time: time
      })
    }
    return averageBGs;
}

//This return every fourth value to help with mobile views...
// export function averageBGsMobileView(bgsArray: Array<Array<BG>>): Array<BG>{
// let allBGs: Array<any> = []

// bgsArray.map((obj)=>{
//     let newBGs:Array<any> = []
//     let i:number = 0
//     obj.map((BG) =>{

//         while((BG.time.getMinutes() + BG.time.getHours()*60) - i*5 > 5){
//             newBGs.push({})
//             i++
//         }
//         newBGs.push(BG)
//         i++
//     })

//     while(newBGs.length < 288){
//         newBGs.push({})
//     }
//     allBGs.push(newBGs)
// })

// let averageBGs: Array<BG> = []
// for(let j = 0; j < allBGs[0].length; j += 4){  // only iterate through every fourth element
//     let sum = []
//     for(let i = 0; i < allBGs.length; i++){
//         sum.push(allBGs[i][j].bg)
//     }

//     sum = sum.filter(Number)
    
//     const average = sum.reduce((a, b) => a + b) / sum.length;
//     averageBGs.push({
//         bg: average,
//         time: new Date(new Date("1970-01-01T00:00").setMinutes(j*5))
//     })
// }

// return averageBGs
// }