'use strict';

const multer = require('multer');
const crypto = require('crypto');
const mime = require('node-mime');

/**
 * Config multer middleware for express
 */
module.exports = function(app, fileService){
    console.log('(simple-fileservice) Config express ...');

    // multer options
    let options = {
        storage: multer.diskStorage({
            destination: function(req, file, cb){ cb(null, fileService.config.uploadDir); },
            filename: function(req, file, cb){
                const toName = Date.now().toString()+'-'+crypto.createHash('md5').update(file.originalname).digest('hex')+'.'+mime.types[file.mimetype];
                cb(null, toName);
            }
        }),
        limits: {
            fileSize: fileService.config.maxFileSize
        }
    };
    app.use(multer(options).array('file', 7));
};
