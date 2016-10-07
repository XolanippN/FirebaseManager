
    var firebase = require("firebase")
    var prompt = require('prompt')
    var DeleteMembersId = [];
    var  DeleteLastRead = [];
    var newMembersId = [];
    var newLastReadMembers = {};
    var userId = "";
    var roomId = "";
    var tableName = ['/user_rooms','/recent_rooms','/rooms','room_messages','/users'];
 
   
      // Initialize Firebase
    firebase.initializeApp({
        serviceAccount: "TestChat-424cdc84ec79.json",
        databaseURL:"https://testchat-1beb3.firebaseio.com"
    });
   
    db = firebase.database();

// call this method to delete a user in VAR userId
  Delete_user(userId,tableName);

function Delete_user(userId,tableName){
 // delete user:
                     // in rooms,room_messages
       DeleteUserOneOrGroup(tableName[0],tableName,userId);
                    //in recent rooms
        Delete_from_table(userId,tableName[1]);
                    //in user room
        Delete_from_table(userId,tableName[0]);
                    //in user
        Delete_from_table(userId,tableName[4]);
        //Delete_user
        console.log("done");         
}

function DeleteUserOneOrGroup(tableName,tableName2,userId){
    db.ref(tableName).child(userId).once("value", function (returnUser_rooms_of_user){
    user_rooms_of_user = returnUser_rooms_of_user.val();
            for (User_user_room in  user_rooms_of_user){
                  for (user_room in user_rooms_of_user[User_user_room]){
                      if(user_rooms_of_user[User_user_room].type == 'one on one'){
                          Delete_room_oneOnone(user_rooms_of_user[User_user_room].room_id,tableName2);        
                        }  
                      else{
                          Delete_room_group(user_rooms_of_user[User_user_room].room_id,tableName2,userId);
                          }
                     }
            }
       
  });
}

function Delete_room_oneOnone( room_Id,tableName){
 // delete room:
                   // in room                     
    db.ref(tableName[2]).once("value", function (returnRooms){
    rooms = returnRooms.val();
    for(room in rooms){
      if( room_Id == room){
           DeleteMembersId = rooms[room].members;
            db.ref(tableName[2]).child(room).remove()
      }
    }
              // in user rooms
        findRoomID_user_recent(DeleteMembersId,tableName[0],room_Id);
                        //in recent rooms
        findRoomID_user_recent(DeleteMembersId,tableName[1],room_Id);
                        //in room messages
        Delete_from_table( room_Id,tableName[3]);
    
 });
}
 
function Delete_room_group( room_Id,tableName,userId){
 // delete room:
                   // in room                
    db.ref(tableName[2]).once("value", function (returnRooms){
    rooms = returnRooms.val();
    for(room in rooms){
      if( room_Id == room){
            DeleteMembersId = rooms[room].members;
            DeleteLastRead =  rooms[room].member_last_read;
            if(rooms[room].created_by == userId){
               db.ref(tableName[2]).child(room).remove()
            } 
            else{// its not created by the to be deleted member
                 i=0;
                 for(MembersId in DeleteMembersId){
                        if(DeleteMembersId[MembersId] != userId){
                           newMembersId[i] = DeleteMembersId[MembersId];
                           i++;
                         }
                   }

                   db.ref(tableName[2]).child(room).update({
                       members: newMembersId
                   })         
                   for(users in DeleteLastRead){
                     if(userId  != users){
                     newLastReadMembers[users] = DeleteLastRead[users]
                     }
                   }                  
                   db.ref(tableName[2]).child(room).update({
                         member_last_read: newLastReadMembers
                    })
                      var  sentBy = rooms[room].sent_by;
                      var  lastMessageId = rooms[room].last_message_id;
                      var  roomholder = room;
                     // change last message
                     db.ref(tableName[3]).once("value", function (returnUser_room_messages){
                       room_messages = returnUser_room_messages.val();
                        for (room_in_messages in room_messages){
                               for (messages in room_messages[room_in_messages]){
                                    if(sentBy == userId){
                                        if(room_in_messages == room_Id){                                           
                                            if(messages != lastMessageId){
                                                 db.ref(tableName[2]).child(roomholder).update({
                                                 last_message_id: messages, 
                                                 sent_by: room_messages[room_in_messages][messages].user_id,
                                                 last_message: room_messages[room_in_messages][messages].message
                                                 })
                                            }
                                        }
                                          
                                    }
                               }
                        }
                    });

            } 
      }
    }
    if(rooms[room].created_by == userId){
                         // in user rooms
         findRoomID_user_recent(DeleteMembersId,tableName[0],room_Id);
                        //in recent rooms
         findRoomID_user_recent(DeleteMembersId,tableName[1],room_Id);
                        //in room messages
         Delete_from_table( room_Id,tableName[3]);
    }
    else{
         //in room messages
       findUserID_delete_messages(tableName[3],userId);
        } 

 });

}

//function to delete users under recent rooms, user room, and user itself.
function Delete_from_table( deleteId,tableName){
    db.ref(tableName).once("value", function (returnId){
                Id = returnId.val();
                for(id in Id){
                    if(deleteId == id){
                        db.ref(tableName).child(id).remove()
                    }
                }
    
     });
}

// function to delete rooms in user rooms and recent rooms
function findRoomID_user_recent( DeleteMembersId,tableName,deleteID){
    db.ref(tableName).once("value", function (returnUser_rooms_of_user){
    user_rooms_of_user = returnUser_rooms_of_user.val();
      for(member in DeleteMembersId){ 
          for (User_user_room in  user_rooms_of_user){
              if (DeleteMembersId[member] ==  User_user_room){
                 for (user_room in user_rooms_of_user[User_user_room]){
                      if(deleteID == user_rooms_of_user[User_user_room][user_room].room_id){
                       db.ref(tableName).child(User_user_room).child(user_room).remove();
                       }
                 }   
              }  
          }
      }

    });
  } 
// function to delete room messages for group
//findUserID_delete_messages(tableName,userId)
function findUserID_delete_messages(tableName,user_id){
    db.ref(tableName).once("value", function (returnUser_room_messages){
    room_messages = returnUser_room_messages.val();
          for (rooms in room_messages){
                 for (messages in room_messages[rooms]){
                     if( room_messages[rooms][messages].user_id == user_id){
                         db.ref(tableName).child(rooms).child(messages).remove()
                     }
                 }        
          }
                     
    });
}      
// DeleteEmptyMessageRoom(tableName);
// delete one on one rooms with empty messages
 function DeleteEmptyMessageRoom(tableName){
      console.log("called");  
     db.ref(tableName[2]).once("value", function (returnUser_rooms_of_user){
       user_rooms_of_user = returnUser_rooms_of_user.val();
            for (User_user_room in  user_rooms_of_user){
                  for (user_room in user_rooms_of_user[User_user_room]){
                      if(user_rooms_of_user[User_user_room].type == 'one on one' && user_rooms_of_user[User_user_room].last_message == ""){
                        Delete_room_oneOnone( User_user_room,tableName)
                        
                      }
                  }
// console.log( User_user_room);
             }
      console.log("done");  
     }); 
     
}



  
  


    