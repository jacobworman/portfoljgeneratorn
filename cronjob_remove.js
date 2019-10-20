var stats = require('./statistics.js');
var db = require('./db_mongodb.js');
var html_base = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /></head>';
var cron = require('node-cron');

const fs = require('fs');

var rawdata = fs.readFileSync(__dirname+'/passwords.json');
var json = JSON.parse(rawdata);
var nr = json.nr;

var log_it = function(string, type, company){
    var new_log = {};
    new_log.type =  typeof type !== "undefined" ? type : "";
    new_log.company = typeof company !== "undefined" ? company : "";
    new_log.string = typeof string !== "undefined" ? string : "";
    new_log.nr = nr;
    new_log.date = new Date();
    db.save('/logs', new_log);
}


cron.schedule('00 00 00 1 * *', () => {
    console.log("job 1 running. List b.");
    log_it("Job 1 running. List b.", "CronJob");
    stats.global_n = 0;

    db.findMutualFund('', function(obj){
        db.save('/stocks', obj);
    });

    db.findOne('/key', {nr: nr}, function(key){
        db.findOne('/list_raw', {nr:json.list_x}, function(list){
                   var list_array = list.list;
                    var len_1 = list_array.length;
                    var stocks_in_each_group = Math.ceil(len_1/2)
                    for(var i = 0; i < 2; i++){
                        loop(key, list_array.slice(i*stocks_in_each_group, (i+1)*stocks_in_each_group), 0, 50000,undefined, false)
                    }
        });
    });
  
  }, function(){},
     true,
     "Europe/Stockholm"
   );


   var year_mix_open_sma_ema = function(years, opt, callback){
	var datan = JSON.parse(opt.val);
		// console.log(datan["Time Series (Daily)"])

		var series = datan["Monthly Time Series"];

		var remove = [];
		var n = false;
		for(var key in series){
			for(var i = 0; i < years.length; i++){
				if(key.indexOf(years[i]) > -1
					){
					// add ema and sma
					//if(typeof sma[key] !== "undefined" && typeof ema[key] !== "undefined"){
						opt.data.push({
							open: series[key]["1. open"],
                            high: series[key]["2. high"],
                            low: series[key]["3. low"],
							close: series[key]["4. close"],
							volume: series[key]["5. volume"],
							date: key
						});
						n = true;
					//}
					break;
				}
			}
			if(n === false){
				remove.push(key);
			}else{
				n = false;
			}
		}

		for(var i = 0; i < remove.length; i++){
			delete series[remove[i]];
		}

		//console.log("ok", series);
		console.log("OK!");

		// calculate

		callback(opt.data);
}

var year_mix_open_sma_ema_1 = function(years, opt, callback){
	var datan = JSON.parse(opt.val);
	var clone = null;
		// console.log(datan["Time Series (Daily)"])

		var series = datan["Time Series (5min)"];
		var remove = [];
		var n = false;
		for(var key in series){
			console.log(key)
			opt.data.push({
				open: series[key]["1. open"],
				high: series[key]["2. high"],
				close: series[key]["4. close"],
				volume: series[key]["5. volume"],
				date: today
			});
			break;
		}

		callback(opt.data);
}

var loop = function(key, list_array, global_n, timer, opt, etoro){
    var stockname = list_array[global_n].replace(/\s/g, '');
    console.log(stockname)
    if(stockname == ""){
        global_n++;
        if(global_n < list_array.length){
            setTimeout(function(){
                loop(key, list_array, global_n, timer, opt, etoro);
            }, timer)
        }else{
            console.log("Done job 1");
            log_it('Cronjob 1 done.', 2);
        }
    }else{
    stats.get('function=TIME_SERIES_MONTHLY&symbol='+stockname+'&outputsize=full', function(val){
        if(val !== false){
        console.log("Data by Alpha Vantage")
        setTimeout(function(){
    var years = ['2020','2019','2018','2017','2016'];
    
        year_mix_open_sma_ema(years, {
                val: val,
                data : []
            }, function(data1){
                if(data1.length > 0){
                    console.log("Preparing push to database.")

                db.findOne('/etoro', {company:stockname}, function(etoro_obj){
                    console.log("1")
                    var datastock = {
                        company: stockname,
                        data: data1,
                        nr: nr,
                        ok:false,
                        etoro: typeof etoro_obj !== "undefined" ? true : false
                    };
                    db.findOne('/stocks', {company:stockname}, function(stock_obj){
                        console.log("2")
                        if(stock_obj){
                        db.remove('/stocks', stock_obj);
                        }

                        db.save('/stocks', datastock);

                        console.log("yes1")
                        global_n++;
                        if(global_n < list_array.length){
                            setTimeout(function(){
                                loop(key, list_array, global_n, timer, opt, etoro);
                            }, timer)
                        }else{
                            console.log("Done job 1");
                            log_it('Cronjob 1 done.', 2);
                        }
                    });
                });    
    
                }else{
                    
                    console.log("No data");
                    console.log(data1);
                    log_it('No data', 3, stockname);
                    console.log(stockname)
                    global_n++;
                    if(global_n < list_array.length){
                        setTimeout(function(){
                            loop(key, list_array, global_n, timer, opt,etoro);
                        }, timer)
                    }else{
                        console.log("Done job 1");
                        log_it('Cronjob 1 done.', 2);
                    }
                }
            });
    
    }, 6000);
        }else{
            log_it("Alpha vantage error: " + val + ', Global_n: ' + global_n, 3, stockname)
            setTimeout(function(){
                loop(key, list_array, global_n, timer, opt, etoro);
            }, timer)
        }
    },key, opt);
    }
    }

