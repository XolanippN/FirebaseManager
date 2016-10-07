    var firebase = require("firebase")
    var prompt = require('prompt')
    var whiteList = ["qEUc0sJIa9fScFgcKUVtMkSbIP52","lUPBKlLPKSVO3k0wN8CpBfZa1Fd2","EXo2tzm4KbQrpumZ1Bubbqni0oE3","MoTDa2ovsYNF4s1ACRc5qmcDpeY2"];
         // Initialize Firebase
         console.info("***Initializing Firebase'***");
    firebase.initializeApp({
        serviceAccount: "TestChat-424cdc84ec79.json",
        databaseURL:"https://testchat-1beb3.firebaseio.com"
    });
   
    db = firebase.database(); 
     var rooms = {};
     var room_messages = {};
     var oneOnOneRooms = [];
     var groupRooms = [];
     var totalGMessages = 0;
     var totalOMessages = 0;
     


db.ref('/rooms').once("value", function (snapshot, prevChildKey) {
     console.info("***Fetching 'Rooms'***");
       rooms = snapshot.val();
       for(room in rooms){
           if(oneOnOneOrGroup(rooms[room]) == "one on one"){
                if((WhitelistTester(whiteList,rooms[room],room)) == false){
                     oneOnOneRooms.push(room);
                 }

           }
           if(oneOnOneOrGroup(rooms[room]) == "group"){
                if((WhitelistTester(whiteList,rooms[room],room)) == false){
                  groupRooms.push(room);
                 }
           }
              if(oneOnOneOrGroup(rooms[room]) == "none")
              {
               console.log("****Error: room "+room+" has no type of room discription****");
              }
       }
 
        db.ref('/room_messages').once("value", function (snapshot, prevChildKey) {
            console.info("***Fetching 'room_messages'***");
            room_messages = snapshot.val();
            console.info("***analyzing 'ONE ON ONE' rooms***");
            console.info("*********Total number of one on one rooms is: "+oneOnOneRooms.length+" ***");
              for(room in room_messages){
                      for(roomone in oneOnOneRooms){
                         if(room == oneOnOneRooms[roomone]){
                             oneOnOneRoomsAnalysis(room,room_messages[room]);
                         }
                      }

              }
              console.info("*********Total number of one on one messages is: "+totalOMessages+" ***");
              console.info("***analyzing 'GROUP' rooms***");
               console.info("*********Total number of group rooms is: "+groupRooms.length+" ***");
              for(room in room_messages){
                      for(roomone in groupRooms){
                         if(room == groupRooms[roomone]){
                             groupRoomsAnalysis(room,room_messages[room]);
                         }
                      }

              }
              console.info("*********Total number of group messages is: "+totalGMessages+" ***");
             
        });

 });
 
function numberOfMessages(){
 console.info("***called number of messages***");
    var num_messages = 0;

    return num_messages;
}

function oneOnOneRoomsAnalysis(room,messages){
    var i = 0;
    for(messageid in messages){
      i++;
    }
    console.info("*********In room "+room+" there are: "+i+" messages ***"); 
     totalOMessages = totalOMessages + i;
   
}

function groupRoomsAnalysis(room,messages){
     var i = 0;
    for(messageid in messages){
      i++;
    }
    console.info("*********In room "+room+" there are: "+i+" messages ***"); 
    totalGMessages = totalGMessages + i;
}

function oneOnOneOrGroup(room){
    //console.info("***called one or group***");
    var type = "";
            if( room.type == "one on one"){
                type = "one on one";
            return type;
            }
            else if( room.type == "group")
            {
                type = "group";
            return type;
            }
            else{
                type = "none";
                }
       return type;
}   

function WhitelistTester(whitelist,InRoom,room){
//console.info("***called whitelist user***");
 var hasWatchlistMembersOnly = false;
 var temp = 0;
 var tester = 0;
 var i = 0;
  for(whitelister in whitelist){
      tester = 0;
         i = 0;
        for(member in InRoom.members){
            if(InRoom.members[member] == whitelist[whitelister]){
                temp++;  
            }
           i++;    
        }
        tester = tester + temp;  
     }
    if(i == 0 ){

    console.log("******Error :room"+ room +" has no member table********");
    }
    if(tester == temp && tester == i){
        hasWatchlistMembersOnly = true;
     }
     else{ 
         hasWatchlistMembersOnly = false
        } 

    return hasWatchlistMembersOnly;
}




