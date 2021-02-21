require('./db')
var Stocks = require('./models/stocks.js');


async function run(){
    console.log("yes?")
let stocks = await Stocks.find({frequency: { $gt: 0}, marknad: {$in: ["NYSE", "NASDAQ"] }}).exec();
console.log("gello")
stocks = stocks.sort((a, b) => (a.frequency < b.frequency) ? 1 : -1);
//console.log(stocks)
for(let i =0; i < 20; i++){
    console.log('"'+stocks[i].company+'"');
    console.log(stocks[i].frequency)
}

}

setTimeout(()=>{
run()
}, 2000)


//Stocks.updateMany({}, {frequency: 0, marknad: ''}).exec()