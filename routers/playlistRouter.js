const express=require('express');
const playlistRouter=express.Router();
const mongoMiddlewares=require('../DAL/mongo.js')
/*const SUCCESS_STATUS = 200;
const CREATED_STATUS = 201;
const NO_CONTENT_STATUS = 204;

const successResponse = (res, data) => res.status(SUCCESS_STATUS).json(data);
const createdResponse = (res, data) => res.status(CREATED_STATUS).json(data);
const noContentResponse = (res, data) => res.status(NO_CONTENT_STATUS).json(data);*/

const createSuccessResponse = data => ({data, success: true})
const getResponseMiddleware = (req, res) => res.status(200).json(createSuccessResponse(req.data));
const putAndPatchResponseMiddleware = (req, res) => res.status(201).json(createSuccessResponse(req.data));
const deleteResponseMiddleware = (req, res) => res.status(204).json(createSuccessResponse(req.data));

//get all playlists
playlistRouter.get('/', mongoMiddlewares.getAll, getResponseMiddleware);

//get existing playlist
playlistRouter.get('/:id', mongoMiddlewares.getPlaylist, getResponseMiddleware);

//get playlist songs
playlistRouter.get('/:id/songs', mongoMiddlewares.getSongs, getResponseMiddleware);
	
//create new playlist
playlistRouter.put('/', mongoMiddlewares.createPlaylist, putAndPatchResponseMiddleware);

//update existing playlist
playlistRouter.patch('/:id', mongoMiddlewares.updatePlaylist, putAndPatchResponseMiddleware);

//update playlist songs
playlistRouter.patch('/:id/songs', mongoMiddlewares.updateSongs, putAndPatchResponseMiddleware);

//delete playlist
playlistRouter.delete('/:id', mongoMiddlewares.deletePlaylist, deleteResponseMiddleware);

module.exports=playlistRouter;
