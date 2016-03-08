"use strict";

const fs = require('fs');
const lwip = require('lwip');

/**
 * File class with few image processing functions
 */
class FileModel {

    /**
     * Construct from basic file information
     * @param {Object} file JSON object
     * @param {String} file.path
     * @param {String} file.filename
     * @param {String} file.mimeType
     * @param {String} file.type One of 'text', 'audio', 'video', 'image'
     * @param {String} file.destination
     * @param {Number} file.width For image file.
     * @param {Number} file.height For image file.
     * @param {Number} file.size
     * @param {String} file.url
     */
    constructor(file){
        /** inherit from static config if not set */
        this.config = Object.assign( {}, this.constructor.config);

        this.obj = file;

    }

    /**
     * @return {Object} JSON object represent the file
     */
    toJSON(){
        return this.obj;
    }

    /**
     * For image files, fetch and set image width, height, size in bytes.
     */
    *buildImageMetadata(){
        if(this.type !== 'image') return;

        const image = yield _p(lwip.open)(lwip, this.path);
        this.width = image.width();
        this.height = image.height();
        this.size = fs.lstatSync(this.path).size;
    }

    /**
     * For image files. Scale down image file.
     * @return {Object} Thumb image file JSON object
     */
    *createThumb(){
        const thumbName = 'thumb-'+this.obj.filename.slice(0, this.obj.filename.lastIndexOf('.')+1)+'jpg';
        const thumbPath = this.obj.destination+'/'+thumbName;

        // scale
        let image = yield _p(lwip.open)(lwip, this.obj.path);
        const width = image.width() > this.config.thumbWidth ? this.config.thumbWidth : image.width();
        const scale = width / image.width();
        const height = parseInt(image.height()*scale);

        let aProcess = image.batch().scale(scale);
        yield _p(aProcess.writeFile)(aProcess, thumbPath, 'jpg', {quality: 60});

        // build thumbFile JSON
        let thumbFile = {
            type: 'image',
            width,
            height,
            size: fs.lstatSync(thumbPath).size,
            mimeType: 'image/jpeg',
            filename: thumbName,
            path: thumbPath
        };

        return thumbFile;
    }

    /**
     * Create a file instance
     * @param {Object} params
     * @return {FileModel} A FileModel instance
     */
    static create(params){
        let file = {};
        [
            "path",
            "filename",
            "mimeType",
            "type",
            "destination",
            "width",
            "height",
            "size",
            "url"
        ].forEach(attr => file[attr] = params[attr]);
        return new this(file);
    }


}

FileModel.config = {
    thumbWidth: 400
};


module.exports = FileModel;


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
