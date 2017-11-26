const middlewaresObj={
	validateNameAndImage: (req, res, next) => {
		const {name, image} = req.body;
        const imgRegex = /\.(gif|jpg|jpeg|png)$/i;
        const playlistKeys = Object.keys(req.body);
        if(playlistKeys.includes("image")  && name != "" && imgRegex.test(image) && playlistKeys.includes("name")) {
            return next();
        }
        res.sendStatus(400);
    },
	validateSongs: (req, res, next) => {
        console.log(req.body)
        var songs = req.body.songs,
            songRegex = /\.(mp3)$/i;
        songs.forEach(song => {
            let songkeys = Object.keys(song);
            if (!songkeys.includes("name") || !songkeys.includes("url") || !songRegex.test(song.url) || song.name === "") {
                return res.sendStatus(400);
            }
        })
        return next();
    }
}
module.exports=middlewaresObj;