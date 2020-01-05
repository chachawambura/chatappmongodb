const mongo = require('mongodb').MongoClient; 
const client = require('socket.io').listen(4000).sockets; 

//Connection to MongoDB
mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db){
    if(err){
        throw err; 
    }

    console.log('MongoDB is connected....');
    //Connection to Socket.io 
    client.on('connection', function(socket){
        let chat = db.collection('chats'); 

        //Create function to send status 
        sendStatus = function(s){
            socket.emit('status',s); 
        }
        
        //Get Chats from Mongo Collection 
        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err; 
            }

            //Emit messages 
            socket.emit('output', res); 

        }); 

        //Handle input 
        socket.on('input' ,function(data){
            let name = data.name; 
            let message = data.message;

            // Check for name and message 
            if(name == '' || message == ''){
                 // Send Error Status
                 sendStatus('Please enter a name and message'); 
                 }
                 else{
                     //Insert Message
                     chat.insert({name: name, message: message}, function(){
                         client.emit('output', [data]);

                         //Send Status object
                            sendStatus({
                                message: 'Message sent', 
                                clear: true
                            });
                     });
                 }
        });
        // Handle Clear 
        socket.on('clear', function(data){
            // Remove chats from collection 
            chat.remove({}, function(){
                //Emit Cleared 
                socket.emit('cleared');
            });
        });


    });
}); 

//Connection