var cron = require('node-cron');
var Crawler = require("crawler");
var request = require('request');
var DBModels = require('./models/funds.js');
var cheerio = require('cheerio');

let today = '';

var date_function = function(){
    today = new Date();
    dd = String(today.getDate()).padStart(2, '0');
    mm = String(today.getMonth() + 1).padStart(2, '0'); 
    yyyy = today.getFullYear();
    
    today = yyyy + '-' + mm + '-' + dd;
}


/*cron.schedule('00 00 00 1 * *', () => {

    console.log("[cronjob_1.js] Cronjob started...");

    global_i = 1;
    
    //fondListaHandelsbanken.queue('https://secure.msse.se/shb/sv.se/history');

    //fondListaAvanza.queue('https://www.avanza.se/fonder/lista.html?disableSelection=false&name=&page='+global_i+'&sortField=CHANGE_IN_SEK_SINCE_ONE_YEAR&sortOrder=DESCENDING&activeTab=overview');


}, function(){},
true,
"Europe/Stockholm"
);*/


const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

const fonder = [];
let global_i = 1;


const fond_id_handelsbanken = [];
const fond_name_handelsbanken = [];

var fondListaHandelsbanken = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : async function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            var i  = 0;
            $('#FundId option').each((index, html) => {
                if(i > 0){
                fond_id_handelsbanken.push($(html).val());
                fond_name_handelsbanken.push($(html).text())
                }else{
                    i++;
                }
            });
        }
        date_function();
        fond_data_handelsbanken(fond_id_handelsbanken);
        done();
    }
});

const reset_func = () => {
    fond_id_handelsbanken.shift();
    fond_name_handelsbanken.shift();
}

const fond_data_handelsbanken = (fondIds) => {
    if(typeof fondIds[0] !== "undefined"){
        request.post({
            url: 'https://secure.msse.se/shb/sv.se/history',
            form: {
                FundId: fondIds[0],
                StartDate: '2014-09-14 00:00:00',
                EndDate : today + ' 00:00:00'
            }
        },
        function(e, response, body){
            var obj = {
                data: [],
                name : ''
              };
              var $ = cheerio.load(body);
              var element = $('.funds-data').find('.positive');
              element.each(function(index, html){
                obj.data.push({close: Number( $(html).text().replace(',','.') ) });
              });
              obj.name = fond_name_handelsbanken[0];
              console.log(obj.data)
              console.log(obj.name);
              request.post({
                  url : 'https://www.avanza.se/_cqbe/search/global-search/global-search-template?query='+obj.name,
                  json: true
              }, async function(err, response, body){
                //var body = JSON.parse(body);
                reset_func();
                if(typeof body !== "undefined" && typeof body['resultGroups'] !== "undefined" && body['resultGroups'].length > 0 && body['resultGroups'][0]['hits'][0]['link']['type'] == 'FUND'){
                    console.log("Fund found!");
                    obj.id = body['resultGroups'][0]['hits'][0]['link']['orderbookId'];
                    await sleep(200);
                    fondInfo(obj, fond_data_handelsbanken);
                }else{
                    console.log("No fund matched");
                    await sleep(200);
                    fond_data_handelsbanken(fond_id_handelsbanken);
                }

              });
        });
    }else{
        console.log("Done");
    }
};


var fondListaAvanza = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : async function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            if($('.link.ellipsis').length > 0){
                $('.link.ellipsis').each((index, html) => {
                    const href = $(html).attr('href');
                    const id = href.match(new RegExp('om-fonden.html/' + "(.*)" + '/'))[1];
                    fonder.push(id);
                });
            
            global_i++;
            console.log("Sleeping...");
            await sleep(2000);
            console.log(fonder);
            fondListaAvanza.queue('https://www.avanza.se/fonder/lista.html?disableSelection=false&name=&page='+global_i+'&sortField=CHANGE_IN_SEK_SINCE_ONE_YEAR&sortOrder=DESCENDING&activeTab=overview');
            done();
            
            }else{
                console.log("Done");
                fondInfo(fonder);
                done();
            }
        }
    }
});

const fondInfo = async (obj, callback) => {
    let id = obj.id;
    if(typeof id !== "undefined"){
   request.get('https://www.avanza.se/_cqbe/fund/guide/' + id, function(e, response, body){
       var body = JSON.parse(body);

       console.log("Found fund on avanza", body.name);
       

        request.get('https://www.avanza.se/_cqbe/fund/chart/'+id+'/infinity', function(e, response, body1){
        var body1 = JSON.parse(body1);

        console.log("The chart body");

        const data = body1.dataSerie;
        const values = [];

        for(var i = 0; i < data.length; i++){
            if(data[i]['y'] !== null){
            values.push(data[i]['y']);
            }
        }

        DBModels.find({name: body.name}).exec(function(e, obj1){
            if(obj1.length > 0){
                obj1[0].remove();
            }
        var fund_obj = new DBModels();

        fund_obj.name= body.name;
        fund_obj.description= body.description;
        fund_obj.rating= body.rating;
        fund_obj.productFee= body.productFee;
        fund_obj.risk= body.risk;
        fund_obj.data1 = values;
        fund_obj.data = obj.data;

        fund_obj.developmentThisYear = body.developmentThisYear;
        fund_obj.developmentThreeYears = body.developmentThreeYears;
        fund_obj.developmentFiveYears = body.developmentFiveYears;
        

        fund_obj.save(async function(e){
            fonder.shift();
            await sleep(2000);
            console.log("New loop")
            callback(fond_id_handelsbanken);
        });

        }); 

        });

   });
}else{
    console.log("Done");
}
};
