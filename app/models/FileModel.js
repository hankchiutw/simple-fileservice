"use strict";

const fs = require('fs');
const lwip = require('lwip');
const fileType = require('file-type');

const CONFIG_FIELDS = ['thumbWidth'];

/**
 * File class with few image processing functions
 */
class FileModel {

    /**
     * Construct from basic file information
     * @param {Object} file JSON object
     * @param {String} file.path
     * @param {String} file.filename
     * @param {String} file.url
     *
     * @param {String} file.mimeType
     * @param {String} file.type One of 'text', 'audio', 'video', 'image'
     * @param {String} file.destination
     * @param {Number} file.width For image file.
     * @param {Number} file.height For image file.
     * @param {Number} file.size
     */
    constructor(file){
        if(!file) throw new Error('Empty params');
        if(!file.path) throw new Error('Empty path');
        if(!file.filename) throw new Error('Empty filename');

        // dismiss trailing slash
        if(file.path.endsWith('/')) file.path = file.path.slice(0, -1);

        this.path = file.path;
        this.filename = file.filename;
        this.mimeType = this.constructor.mimeType(`${file.path}/${file.filename}`);
        this.type = this.mimeType.split('/')[0];
        if(['text', 'audio', 'video', 'image'].indexOf(this.type) < 0) this.type = 'file';

        this.url = file.url;

        /** inherit from static config if not set */
        Object.defineProperty(this, '_config', {
            value: Object.assign( {}, this.constructor.config)
        });

    }

    /**
     * Get config value of internal _config object
     * @param attr
     */
    getConfig(attr){
        return this._config[attr];
    }

    /**
     * Set config value of internal _config object
     * @param attr
     * @param val
     */
    setConfig(attr, val){
        if(CONFIG_FIELDS.indexOf(attr) >= 0) this._config[attr] = val;
        return this._config[attr];
    }

    /**
     * @return {Object} JSON object represent the file
     */
    toJSON(){
        return this;
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
        const thumbName = 'thumb-'+this.filename.slice(0, this.filename.lastIndexOf('.')+1)+'jpg';
        const thumbPath = this.destination+'/'+thumbName;

        // scale
        let image = yield _p(lwip.open)(lwip, this.path);
        const width = image.width() > this.getConfig('thumbWidth') ? this.getConfig('thumbWidth') : image.width();
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
     * @param {String} params.path
     * @param {String} params.filename
     * @return {FileModel} A FileModel instance
     */
    static create(params){
        return new this(params);
    }

    /**
     * Read file mime type from its buffer
     * @param {String} fullpath Full path of the file
     * @return {String} The [MIME](https://en.wikipedia.org/wiki/Media_type) type. ex. text/plain
     */
    static mimeType(fullpath){
        let buf = new Buffer(262);
        const bytes = fs.readSync( fs.openSync(fullpath, 'r'), buf, 0, 262, 0);
        return fileType(buf).mime;
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
