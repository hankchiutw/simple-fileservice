'use strict';

const express = require('express');
const app = express();

/**
 * Setup
 */
const config = {
    s3Bucket: 'api-bucket-01',
    thumbWidth: 300,
    maxFileSize: 20*1024*1024,   // upload limits, bytes
    uploadDir: '/tmp'
};
const fileService = require('../index.js')(app, config);

/**
 * Define API
 */
const apiPath = '/uploadFile';
app.post(apiPath, fileService.uploadHandler(), function(req, res, next){
    res.send(req.files);
});

/**
 * Bootstrap
 */
const port = 3300;
app.listen(port, function(){
    console.log('simple-fileservice express app started as: http://localhost:'+port+apiPath);
}).on('error', function(err){
    console.log('something wrong:', err);
});
