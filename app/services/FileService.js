"use strict";

const fs = require('fs');
const cn = require('co-nextware');
const FileModel = require('../models/FileModel');

const AWS = require("aws-sdk");
const s3 = new AWS.S3();

/**
 * A simple service class communicated to AWS S3
 */
class FileService {

    /**
     * Construct with several config
     * @param {Object} config
     * @param {String} config.s3Bucket Bucket name in S3 to store files.
     * @param {Number} config.thumbWidth For image files. Thumbnail width when create thumb file.
     * @param {Number} config.maxFileSize Upload size limits, bytes.
     * @param {String} config.uploadDir Where the temporary file stored
     */
    constructor(config){
        this.config = config || {
            s3Bucket: 'file-bucket-01',
            thumbWidth: 300,
            maxFileSize: 20*1024*1024,   // upload limits, bytes
            uploadDir: '/tmp'
        };

        this.FileModel = FileModel;
        if(config.thumbWidth !== undefined) this.FileModel.config.thumbWidth = config.thumbWidth;

    }

    /**
     * Build express middleware to process uploaded files from local to S3.
     * @return {uploadCallback}
     */
    uploadHandler(){
        const self = this;

        /**
         * Express middleware to receive uploading files
         * @callback uploadCallback
         */
        return cn(function*(req, res, next){
            console.log('(simple-fileservice) to create a file: ', req.files);
            if(req.files.length === 0) return next(new Error('empty file'));

            // prepare and upload one file
            let f = req.files[0];
            f.mimeType = f.mimetype;
            delete f.mimetype;
            f.type = f.mimeType.split('/')[0];
            if(['text', 'audio', 'video', 'image'].indexOf(f.type) < 0) f.type = 'file';

            let fileObj = yield self.upload(f);

            // create thumb if image
            if(fileObj.obj.type === 'image'){
                const thumbFile = yield fileObj.createThumb();
                const thumbObj = yield self.upload(thumbFile);
                fileObj.obj.thumbFile = thumbObj.toJSON();
                yield fileObj.buildImageMetadata();
            }

            req.file = fileObj.toJSON();
            req.files = [fileObj.toJSON()];
            next();
        });
    }


    /**
     * Create public S3 file
     * @param {Object} file JSON object
     * @param {String} file.path
     * @param {String} file.filename
     * @param {String} file.mimeType
     * @return {FileModel} FileModel object with public URL.
     */
    *upload(file){
        const fBuffer = yield _p(fs.readFile)(fs, file.path); 

        const params = {
            Bucket: this.config.s3Bucket,
            Key: file.filename,
            ACL: 'public-read',
            ContentType: file.mimeType,
            Metadata: {
                _source: JSON.stringify(file)
            },
            Body: fBuffer
        };

        yield _p(s3.putObject)(s3, params);

        file.url = `${s3.endpoint.protocol}\/\/${this.config.s3Bucket}.${s3.endpoint.hostname}\/${file.filename}`;

        return this.FileModel.create(file);
    }

}

/** Expose FileService instance */
module.exports = function(config){
    return new FileService(config);
};


// tmp
function _p(fn){
    return function(parent){
        let args = Array.prototype.slice.apply(arguments, [1]);
        return new Promise(function(resolve, reject){
            args[args.length] = function(err, data){
                if(err) reject(err);
                resolve(data);
            };
            fn.apply(parent, args);
        });
    };
}
