var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var portfoliosSchema = new Schema({
    company: Array,
    allocation: Array,
    alt: Schema.Types.Mixed
});

var portfolios = mongoose.model('portfolios', portfoliosSchema);

module.exports = portfolios;