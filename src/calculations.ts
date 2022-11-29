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