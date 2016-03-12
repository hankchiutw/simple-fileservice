"use strict";

const assert = require('chai').assert;
const FileModel = require('./FileModel');

const mockFile = {
    path: '/tmp',
    filename: 'z.jpg'
};

describe('FileModel', function(){
    describe('#construct', function(){
        it('shoule assert when either filename and path undefined', function(){
            function try1(){ FileModel.create(); }
            function try2(){ FileModel.create({path: '/tmp'}); }
            function try3(){ FileModel.create({filename: 'z.jpg'}); }
            assert.throws(try1);
            assert.throws(try2);
            assert.throws(try3);
        });

        it('shoule be instance of FileModel', function(){
            assert.instanceOf(FileModel.create(mockFile), FileModel);
        });

        it('shoule create mimeType text/plain and type text', function(){

        });

        it('shoule create mimeType image/jpeg and type image', function(){

        });

        it('shoule create mimeType image/png and type image', function(){

        });

        it('shoule create mimeType of normal file and type file', function(){

        });

        it('shoule ignore input mimeType', function(){

        });

        it('shoule return valid attributes only', function(){
            const file = FileModel.create(mockFile).toJSON();
            assert.isObject(file);

            assert.notProperty('_config');
        });

    });

    describe('#instance methods', function(){

    });

    describe('#static methods', function(){
        it('shoule read correct mime type', function(){
            assert.equal(FileModel.mimeType(`${__dirname}/../../assets/file.jpg`), 'image/jpeg');
            assert.equal(FileModel.mimeType(`${__dirname}/../../assets/file.png`), 'image/png');
            assert.equal(FileModel.mimeType(`${__dirname}/../../assets/file.txt`), 'text/plain');
        });

    });

});
