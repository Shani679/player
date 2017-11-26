const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const PlaylistSchema=new Schema({
	name:String,
	image: String,
	songs:[{type: Schema.Types.ObjectId, ref: 'Song'}]
})
module.exports=PlaylistSchema;