var express = require('express');
var router = express.Router();
var dbModel = require('../models/portfolios');
var Funds = require('../models/funds');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/test', async function(req, res, next) {

    res.send({ok:true});

});

router.post('/add-portfolio', async function(req, res, next) {

    let portfolio = new dbModel();
    portfolio.company = req.body.portfolio.company;
    portfolio.allocation = req.body.portfolio.allocation;
    portfolio.alt = req.body.portfolio.alt;
    portfolio.save();

    res.send({ok:true});

});

router.post('/add-fund', async function(req, res, next) {

    let funds = new Funds();
    funds.name = req.body.funds.name;
    funds.description = req.body.funds.description;
    funds.rating = req.body.funds.rating;
    funds.productFee = req.body.funds.productFee;
    funds.risk = req.body.funds.risk;
    funds.data = req.body.funds.data;
    funds.data1 = req.body.funds.data1;
    funds.save();

    res.send({ok:true});

});

router.post('/get', async function(req, res, next) {
    console.log("Reciving..");
    let alt = req.body.alt;
    console.log(alt)
    alt = alt.replace("undefined", "")
    if(typeof alt !== "undefined"){
        const obj = await dbModel.findOne({alt: alt}).exec();
        if(obj){
            const company_info = [];
            for(var i = 0; i < obj.company.length; i++){
                let obj_1 = await Funds.findOne({name: obj.company[i]}).exec();
                company_info.push(obj_1);
            }
            res.send({
                company: company_info,
                allocation: obj
            });
        }
    }else{
        res.send({err: true});
    }
});

router.post('/add', function(req, res, next) {
  const company_array = req.body.company_array;
  const allocation_array = req.body.allocation_array;
  const alt = req.body.alt;

  if(typeof company_array !== "undefined" && typeof allocation_array !== "undefined" && typeof alt !== "undefined"){
    const portfolio_object = new dbModel();
    portfolio_object.company = company_array;
    portfolio_object.allocation = allocation_array;
    portfolio_object.alt = alt;
    portfolio_object.save(() => {
        res.send({ok: true});
    });
  }else{
      res.send({err: true});
  }
});

/*
var request = require('request');
function removeDups(names) {
    let unique = {};
    names.forEach(function(i) {
      if(!unique[i]) {
        unique[i] = true;
      }
    });
    return Object.keys(unique);
  }
funds_array = [];
add_portfolio = function(objects, callback){
    callback();
    if(objects.length > 0){
        console.log(objects[0])
    request.post({
        url: '',
        body: {portfolio: objects[0] },
        json: true
    }, function(err, http, body){
        console.log(body);
        objects.shift();
        add_portfolio(objects, callback);
    });
    }else{
        callback();
    }
}

add_fund = function(funds, callback){
    
    if(typeof funds[0] !== "undefined"){
        request.post({
            url: '',
            body: {funds: funds[0] },
            json: true
        }, function(err, http, body){
            console.log(body);
            funds.shift();
            add_fund(funds, callback);
        });
        }else{
            callback();
        }
};
dbModel.find({}).exec(function(err, obj){
    for(var i = 0; i < obj.length; i++){
        for(var k = 0; k < obj[i].company.length; k++){
            funds_array.push(
                obj[i].company[k]
            );
        }
    }
    funds_array = removeDups(funds_array);
    add_portfolio(obj, function(){
        Funds.find({name: {"$in": funds_array} }).exec(function(e, funds){
            add_fund(funds, function(){
                console.log("done");
            })
        });
    });
});

*/
module.exports = router;
