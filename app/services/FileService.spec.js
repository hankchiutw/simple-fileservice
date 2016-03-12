"use strict";

const assert = require('chai').assert;

const mockConfig = {
    s3Bucket: 'mock-bucket-01',
    thumbWidth: 99,
    maxFileSize: 1*1024*1024,   // upload limits, bytes
    uploadDir: '/dir'
};

describe('FileService', function(){
    describe('#construct', function(){
        it('shoule create correct config', function(){
            let fileService = require('./FileService')(mockConfig);
            for(const attr in mockConfig){
                assert.equal( mockConfig[attr], fileService.getConfig(attr));
            }
        });

        it('shoule not create arbitrary config', function(){
            let fileService = require('./FileService')({x:1});
            assert.isNotOk( fileService.getConfig('x'));
        });


    });

    describe('#instance methods', function(){
        let fileService = require('./FileService')();

        it('uploadHandler shoule a Function', function(){
            assert.instanceOf(fileService.uploadHandler(), Function);
        });
    });

    describe('#static methods', function(){

    });

});
