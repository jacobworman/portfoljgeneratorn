var mongoose = require('mongoose');
var url = 'mongodb://localhost:27017/stocks';

var connectDB = function(){
    mongoose.connect(url, {
        keepAlive: 120,
        auto_reconnect: true
        // server: {auto_reconnect: true}
    });
};
connectDB();

var db = mongoose.connection;

db.on('close', function(err){
    connectDB();
});