'use strict';
/** @module FileService */

/**
 * Create and return a FileService instance
 * @param {Object} app Express app object
 * @param {Object} config Config to create a FileService
 * @return {FileService} A FileService instance
 */
module.exports = function(app, config){
    const fileService = require('./app/services/FileService')(config);
    require('./config/express')(app, fileService);
    return fileService;
};
