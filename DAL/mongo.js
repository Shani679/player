const mongoose=require('mongoose');
const myModel=require('../model/playlist.model.js');
const Playlist=mongoose.model('Playlist', myModel);
const songSchema = require('../model/song.model');
const Song = mongoose.model('Song', songSchema);
const async = require('async');
const POPULATE_FIELD = 'songs';

const errorHandler = (err,res,cb) => {
	if(err){
		return res.json(err).status(400);
	}
	return cb();
}

const successHandler = (req, data, next) => {
	req.data = data;
	return next();
}

const createSongsCollection = songs => songs.map(({name, url}) => new Song({name, url}));

const queries = {
	getAll: (req, res, next) => Playlist.find({}).populate(POPULATE_FIELD).exec((err, data) => errorHandler(err, res, () => successHandler(req, data, next))),
	getPlaylist: (req, res, next) => Playlist.find({_id: req.params.id}).populate(POPULATE_FIELD).exec((err, data) => successHandler(req, data, next)),
	getSongs: (req, res, next) => Playlist.find({_id: req.params.id}).populate(POPULATE_FIELD).exec((err, data) => successHandler(req, data[0].songs, next)),
    createPlaylist: (req, res, next)=>{
    	const songs = createSongsCollection(JSON.parse(req.body.songs));
          async.eachSeries(songs, (song, next) => song.save(err => errorHandler(err, res, () => next(err))), err => {
            errorHandler(err, res, () => {
              const {name, image} = req.body;
              const newPlaylist = new Playlist({name, image, songs});
              newPlaylist.save((err, data) => errorHandler(err, res, () => successHandler(req, data, next)));
            })
        });
    },
    updatePlaylist: (req, res, next) => {
    	const {name, image} = req.body;
        const _id = req.params.id;
        Playlist.update({_id}, {name, image}, (err, data) => errorHandler(err, res, () => successHandler(req, data, next)));
    },
    updateSongs: (req, res, next) => {
    	const songs = createSongsCollection(JSON.parse(req.body.songs));
        const _id = req.params.id;
        async.eachSeries(songs, (song, next) => song.save(err => errorHandler(err, res, () => next(err))), err => errorHandler(err, res, () => Playlist.update({_id}, {songs}, (err, data) => errorHandler(err, res, () => successHandler(req, data, next)))));
    },
    deletePlaylist: (req, res, next) => {
    	const _id=req.params.id
    	Playlist.remove({_id}, (err, data) => errorHandler(err, res, () => successHandler(req, data, next)))
    }
}
module.exports=queries;
