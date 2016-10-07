var firebase = require('firebase');

    firebase.initializeApp({
        serviceAccount: "TestChat-424cdc84ec79.json",
        databaseURL:"https://testchat-1beb3.firebaseio.com"
    });

var db = firebase.database();

var rooms = {};
var user_rooms = {}
var recent_rooms = {}
var duplicateRooms = {}


console.info("***Fetching 'Rooms'***");
db.ref('/rooms').on("value", function (snapshot, prevChildKey) {
        validateRooms(snapshot.val());
    });
console.info("***Fetching 'user_rooms'***");
db.ref('/user_rooms').on("value", function (snapshot, prevChildKey) {
    validateUserRooms(snapshot.val());
});
 console.info("***Fetching 'recent_rooms'***");
db.ref('/recent_rooms').on("value", function (snapshot, prevChildKey) {
    recent_rooms[snapshot.key] = snapshot.val();
});


function validateRooms(rooms){
    console.info("*****Validating 'rooms'*******")
    roomKeys = Object.keys(rooms);
    for(roomKey in rooms){
        room = rooms[roomKey];
        if(room.members== null){
            console.error("Room",roomKey,"does not contain any members.");
        }
        if(room.name == null){
            console.error("Room",roomKey,"does not have a name.");
        }
        if(room.type == null){
            console.error("Room",roomKey,"does not have a type.");
        }
        else if(room.type != "one on one" && room.type != "group"){
            console.error("Room",roomKey,"has a type",room.type,". This shouldn't be alowed.");
            if(room.type == "one on one"){
                for(checkRoomKey in rooms){
                    checkRoom = rooms[checkRoomKey];
                    if(checkRoom.type = "one on one"){
                        if(arraysEqual(checkRoom.members, room.members) && duplicateRooms.indexOf(checkRoom) == -1){
                            duplicateRooms.push(checkRoom);
                            console.error("Room", roomKey,"has a duplicate ", checkRoomKey,".");
                        }
                    }
                }
            }
        }
        var keyOccurances = roomKeys.filter(function(val){
            return val === roomKey;
        }).length;
        if(keyOccurances >1){
            console.error("There is more than one room with key", roomKey);
        }
    }
    console.info("***ROOM VALIDATION COMPLETE***")
}

function validateUserRooms(usersUserRooms){
    console.info("*****Validating 'user_rooms'*******")
    for(userKey in usersUserRooms){
        userRooms = usersUserRooms[userKey]

        friendOneOnOnes = {}

        for(userRoomKey in userRooms){
            userRoom = userRooms[userRoomKey];
            if((userRoom.friend_id == null && (userRoom.room_id ==null|| userRoom.room_name == null)) || userRoom.last_read == null || userRoom.type == null){
                console.error("User with ID", userKey," has a user_room with key", userRoomKey," is missing one or more attributes.");
            }
            if(userRoom.type = "one on one" && friendOneOnOnes.indexOf(userRoom.friend_id) > -1){
                console.error("User with ID", userKey, "has a one on one user room with duplicate friend IDs", userRoom.friend_id, "found in user_room",userRoomKey);
            }

        }
    }
console.info("***USER_ROOMS VALIDATION COMPLETE***")

}

function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }
    return true;
}




