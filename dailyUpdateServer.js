/*
 * Daily Update Server
 *
 * runned only by the server. It is called daily at 5:00am GMT-4
 * calls serverUpdate() function from updateServer.js daily.
 */

// include the updateServer.js file
const daily = require('./updateServer.js');

//call the function to update all On Going crops
daily.serverUpdate();

