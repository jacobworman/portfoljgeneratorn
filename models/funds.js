var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fundsSchema = new Schema({
    name: Schema.Types.Mixed,
    description: Schema.Types.Mixed,
    rating: Schema.Types.Mixed,
    productFee: Schema.Types.Mixed,
    risk: Schema.Types.Mixed,
    data: Schema.Types.Mixed,
    data1: Schema.Types.Mixed
});

var funds = mongoose.model('funds', fundsSchema);

module.exports = funds;