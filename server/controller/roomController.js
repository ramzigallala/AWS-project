const {roomsModel} = require('../model/roomsModel');
/**
 * Retrieves the initial settings of the room.
 * @param {string} roomId - The ID of the room.
 * @returns {Promise<Object|boolean>} - The room document or false if not found.
 */
exports.startSettings = async (roomId) => {
    const doc = await roomsModel.findOne({_id: roomId});
    if (!doc) {
        return false;
    }
    return doc;

}
/**
 * Checks if a user is in a room.
 * @param {string} roomId - The ID of the room.
 * @param {string} user - The user to check.
 * @returns {Promise<boolean>} - True if user is in the room, false otherwise.
 */
exports.checkUserInRoom = async (roomId, user) => {
    try{
        const doc = await roomsModel.findOne({_id: roomId});
        return doc.listUsers.includes(user);

    } catch (error) {
        console.error('Error during the check:', error);
        return false;
    }

}
/**
 * Adds a user to a room.
 * @param {string} roomId - The ID of the room.
 * @param {string} user - The user to add.
 * @returns {Promise<Object>} - Success status and updated room document.
 */
exports.addUserToRoom = async (roomId, user) => {
    try {
        const updatedDoc = await roomsModel.findByIdAndUpdate(roomId,
            { $addToSet: { listUsers: user } },
            { new: true }
        );

        if (updatedDoc) {
            return { success: true, doc: updatedDoc };
        } else {
            return { success: false };
        }
    } catch (error) {
        console.error('Error during the update:', error);
        return { success: false };
    }
}
/**
 * Changes the type of session for a room (work, shortBreak, longBreak).
 * @param {string} roomId - The ID of the room.
 * @returns {Promise<Object>} - New session state or failure info.
 */
exports.changeTypeSession = async (roomId) => {
    const incrementValue = 1;
    let doc = await roomsModel.findOne({_id: roomId});
    if (doc) {
        if (doc.state.typeSession === 'work') {
            if ((doc.state.numSession + 1) % 4 === 0) {
                await roomsModel.updateOne(
                    {_id: roomId},
                    {$inc: {'state.numSession': incrementValue}, $set: {'state.typeSession': 'longBreak'}}
                )
            } else {
                await roomsModel.updateOne(
                    {_id: roomId},
                    {$inc: {'state.numSession': incrementValue}, $set: {'state.typeSession': 'shortBreak'}}
                )
            }
        } else {
            await roomsModel.updateOne(
                {_id: roomId},
                {$set: {'state.typeSession': 'work'}}
            )
        }

        doc = await roomsModel.findOne({_id: roomId});
        return {state: doc.state.typeSession};

    } else {
        console.log('Document not find.');
        return {success: false};
    }

}
/**
 * Updates the time settings for work, short break, and long break in a room.
 * @param {string} roomId - The ID of the room.
 * @param {Object} timeSetting - Object containing the new time settings.
 * @returns {Promise<Object>} - The updated configuration and actual timer.
 */
exports.changeTimeSetting = async (roomId, timeSetting) => {
    let doc = await roomsModel.findOne({_id: roomId});
    if (doc) {
        await roomsModel.updateOne(
            {_id: roomId},
            {
                $set: {
                    'timeSetting.work': timeSetting.work,
                    'timeSetting.shortBreak': timeSetting.shortBreak,
                    'timeSetting.longBreak': timeSetting.longBreak
                }
            }
        )

        doc = await roomsModel.findOne({_id: roomId});
        const actualTimer = await this.getActualTime(roomId);
        return {success: true, configuration:doc.timeSetting, actualTimer: actualTimer};

    } else {
        console.log('Document not find.');
        return {success: false};
    }


}
/**
 * Initializes a room if it doesn't already exist.
 * @param {string} roomId - The ID of the room to initialize.
 * @returns {Promise<Object>} - Status of the operation.
 */
exports.initializeRoom = async (roomId) => {
    try{
    const room = await roomsModel.findById(roomId);
    if (room) {
        return {status:"La stanza esiste"};
    } else {

        const newRoom = await roomsModel.create({
            _id: roomId,
            state: {
                numSession: 0,
                typeSession: 'work'
            },
            timeSetting: {
                work: 1500,
                shortBreak: 300,
                longBreak: 900
            }

        });
        return {status:"ok"};
    }

    } catch (error) {
        return {status:"errore:", error};
    }
}
/**
 * Checks if a room exists in the database.
 * @param {string} roomId - The ID of the room.
 * @returns {Promise<Object>} - Object indicating if the room is present.
 */
exports.checkRoom = async (roomId) => {
    const doc = await roomsModel.findOne({_id: roomId});
    if (doc) return {present: true}
    else return {present: false}
}

/**
 * Retrieves the time settings of a room.
 * @param {string} roomId - The ID of the room.
 * @returns {Promise<Object>} - Object with the time settings or presence flag.
 */
exports.getTimeSetting = async (roomId) => {
    let doc = await roomsModel.findOne({_id: roomId});
    if (doc) {
        doc = await roomsModel.findOne({_id: roomId});
        return {timeSetting: doc.timeSetting};
    } else return {present: false}
}
/**
 * Retrieves the actual timer duration based on the current session type (work/shortBreak/longBreak).
 * @param {string} roomId - The ID of the room.
 * @returns {Promise<Object>} - Object with current timer duration and session type.
 */
exports.getActualTime = async (roomId) => {

    const doc = await roomsModel.findOne({_id: roomId});
    if (doc) return {actualTime: doc.timeSetting[doc.state.typeSession], typeState: doc.state.typeSession};
    else return {present: false};
}
/**
 * Adds a new task to the room's task list.
 * @param {string} roomId - The ID of the room.
 * @param {Object} newTask - The task object to add.
 * @returns {Promise<Object|boolean>} - The added task or false if an error occurred.
 */
exports.addTask = async (roomId, newTask) => {
    try {
        const updatedRoom = await roomsModel.findByIdAndUpdate(
            roomId,
            {$push: {tasks: newTask}},
            {new: true}
        );

        return updatedRoom.tasks.pop();

    } catch (err) {
        console.error('Errore durante l\'aggiornamento:', err);
        return {success: false};
    }

}
/**
 * Removes a user from a room.
 * @param {string} roomId - The ID of the room.
 * @param {string} user - The username or user ID to remove.
 * @returns {Promise<Object>} - Success status, updated user list, and room ID.
 */
exports.deleteUserFromRoom = async (roomId, user) => {
    try {
        const updatedRoom = await roomsModel.findOneAndUpdate({ _id: roomId }, { $pull: { listUsers: user }}, {new: true});

        if(updatedRoom.listUsers.length === 0){
            return {success: true, users: [], room: roomId};
        }else{
            return {success: true, users: updatedRoom.listUsers, room: roomId};
        }
    } catch (err) {
        console.error('Errore durante l\'aggiornamento:', err);
        return {success: false};
    }
}
/**
 * Deletes a room from the database.
 * @param {string} roomId - The ID of the room to delete.
 * @returns {Promise<Object|boolean>} - The deleted room document or false if failed.
 */
exports.deleteRoom = async (roomId) => {
    try {
        return await roomsModel.findByIdAndDelete(roomId);
    } catch (error) {
        console.error(`Errore durante l'eliminazione della room: ${error}`);
        return false;
    }
}
/**
 * Checks if the room has no users.
 * @param {string} room - The ID of the room.
 * @returns {Promise<boolean|undefined>} - True if empty, undefined if room not found or error.
 */
exports.isRoomEmpty = async (room) => {
    try {
        const doc = await roomsModel.findOne({_id: room});
        if(doc){
            return doc.listUsers.length === 0;
        }
    }catch (error){

    }
}
/**
 * Deletes a task from a room by task ID.
 * @param {string} roomId - The ID of the room.
 * @param {string} taskId - The ID of the task to delete.
 * @returns {Promise<boolean>} - True if deletion succeeded, false otherwise.
 */
exports.deleteTask = async (roomId, taskId) => {
    try {
        const result = await roomsModel.updateOne({ _id: roomId }, { $pull: { tasks: { _id: taskId } } });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}
/**
 * Checks if a user is already in the specified room.
 * @param {string} room - The ID of the room.
 * @param {string} user - The user to check.
 * @returns {Promise<boolean>} - False if user is already in room, true otherwise.
 */
exports.checkRoomAndUser = async (room, user) => {
    const doc = await roomsModel.findOne({_id: room});
    if (doc) {
        if (doc.listUsers.includes(user)) {
            return false;
        }
    }
    return true;

}
/**
 * Deletes the entire collection of rooms.
 * @returns {Promise<void>} - Resolves when collection is dropped or logs an error.
 */
exports.deleteCollection = async () => {
    try {
        await roomsModel.collection.drop();
    } catch (err) {
        if (err.code === 26) {
            console.log("collection doesn't exist");
        } else {
            console.error('Error while deleting the collection:', err);
        }
    }
};

