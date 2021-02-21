var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stocksSchema = new Schema({
    company: String,
    symbol: String,
    date: Date,
    data: Schema.Types.Mixed,
    nr:String,
    ok:Boolean,
    etoro:Boolean,
    borsvarde: Number,
    finacial_data : Schema.Types.Mixed,
    utdelning : Schema.Types.Mixed,
    industry : String,
    marketCap: Number,
    finacials: Schema.Types.Mixed,
    frequency: Number,
    marknad: String
});

var stocks = mongoose.model('stocks', stocksSchema);

module.exports = stocks;