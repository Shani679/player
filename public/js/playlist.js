let albums=[];
let songs=[];
const pattern={
	name: /^.{0,15}$/, 
	image: /\.(gif|jpg|jpeg|png)$/i,
	song: /\.(mp3)$/i
}
const errMessages={
	name: "Please enter a name - maximum 15 chars.",
	image: "Please enter image url.",
	song: "Please enter mp3 url.",
	requiredFields: 'Something is wrong. Please make sure that you add at least one song to your playlist.'
}
$(document).ready(()=>{

	const ajaxCallService=(url,type,data) => $.ajax({url,type,data});

	const fetchAllAlbums=()=>{
		ajaxCallService('/playlist', 'get').then(response=>{
			albums=response.data;
			buildAlbumsContainer(albums);
		})
	}

	fetchAllAlbums();

	const buildAlbumsContainer=(albums)=>{
		$('.album').remove();
		albums.forEach(current=>{
			const album=$("<div class='album col-xs-12 col-sm-6 col-md-4 col-lg-3' id='" + current._id + "'></div>");
			const albumCover=$("<div class='disc-cover'><div class='hole'></div></div>").css("background-image", 'url(' + current.image + ')').append("<div class='overlay'><i class='fa fa-play play'></i><i class='fa fa-info'></i><i class='fa fa-trash-o trash1'></i><i class='fa fa-pencil pencil1'></i><ol class='list-box'></ol></div>");
			album.append("<div class='album-name'>" + current.name + "</div>").append(albumCover).append('<div class="top-shelf"></div><div class="top-shelf-edge"></div>');
			$('.albums-wrapper .row').append(album);
			$('.album-name').arctext({radius: 130});
		})
	}

	$('.arrow-up').click(() => document.querySelector('.albums-wrapper').scrollTop -= 50);
	$('.arrow-down').click(() => document.querySelector('.albums-wrapper').scrollTop += 50);

	$('.fa-window-close, #cancel').click(() => {
		$('#popup1, #popup2, #popup3, #popup4').fadeOut();
		$('.songs').empty();
	})

	$('#search').keyup(()=>{
		if($('#search').val().length >= 2){
			return buildDropdown(albums.filter(current => current.name.toLowerCase().indexOf($('#search').val())!=-1));
		}
		return $('.dropdown-content').slideUp("slow");
	})

	const buildDropdown=(albums)=>{
		$('.dropdown-content').empty();
		albums.forEach(current => $('.dropdown-content').append("<li class='" + current._id + "'><img src='" + current.image + "'>" + current.name + " <span class='glyphicon glyphicon-play'></span></li><hr>"));
		$('.dropdown-content').slideDown("slow");
	}

	$(window).click(() => $('.dropdown-content').slideUp("slow"))

	$('.add-new-playlist').click(() => initFirstPopup("Add new playlist <span class='glyphicon glyphicon-headphones'></span>", $('#update-playlist'), $('#next'), ""));

	$(document).on('click', '.pencil1, .pencil2', function(){
		const id = ($(this).attr('class').split(' ')[2] === 'pencil1') ? $(this).closest('.album').attr('id') : $('.player-disc-cover').siblings(".albumId").text();
		const currentAlbum=albums.filter(current => current._id === id)[0];
		initFirstPopup("Edit " + currentAlbum.name + " " + " playlist <span class='glyphicon glyphicon-headphones'></span>", $('#next'), $('#update-playlist'), currentAlbum)
	})

	const initFirstPopup=(title, buttonToHide, buttonToShow, album)=>{
		$('.first-popup-title').html(title).siblings('.albumId').text(album._id);
		buttonToHide.hide();
		buttonToShow.show();
		$('#popup1').fadeIn(1000);
		$('#playlist-name').val(album.name);
		$('#cover-url').val(album.image);
		$('.image-cover').attr("src", '').attr('src', album.image).slideDown("slow");
		$('.field-warning').empty();
	}

	$('#reset-step1, #reset-step2').click(function(){
		$(this).parent().siblings('.panel-body').find('input').val("");
		$(this).parent().siblings('.panel-body').find('.field-warning').slideUp("slow");
	})

	$('#next').click(()=>{
		const validPlName = inputValidation($('#playlist-name'));
        const validPlImage = inputValidation($('#cover-url'));
        if(validPlName && validPlImage){
            switchPopup($('.update-songs'), $('.finish'), "Add");
            if($('.song-component').length === 0){
            	for (var i = 0; i < 3; i++) {
	            	buildSongsFields("", "");
	            }
            }
        }
	})

	$('#update-playlist').click(()=>{
		const validPlName = inputValidation($('#playlist-name'));
        const validPlImage = inputValidation($('#cover-url'));
        if(validPlName && validPlImage){
        	const obj={name:$('#playlist-name').val(), image:$('#cover-url').val()}
        	const id=$('.first-popup-title').siblings('.albumId').text();
        	ajaxCallService("/playlist/" + id, "patch", obj).then(response=>{
				fetchAllAlbums();
				updatePlayer(id);
				switchPopup($('.finish'), $('.update-songs'), "Edit");
				ajaxCallService('/playlist/' + id + '/songs', 'get').then(response=>{
					console.log(response)
					mySongs=response.data
					if($('.song-component').length === 0){
						mySongs.forEach(current => buildSongsFields(current.url, current.name));
					}	
				 })
			})
        }
	})

	const updatePlayer=(id)=>{
		if(id === $('.player-disc-cover').siblings('.albumId').text()){
			$('.player-disc-cover').css("background-image", 'url(' + $('#cover-url').val() + ')').css("background-size", "cover");
			$('#current-album').text($('#playlist-name').val());
			const title=$('#playlist-name').val() + "-" + document.title.split("-")[1];
			document.title=title;
		}
	}

	const switchPopup=(buttonToHide, buttonToShow, action)=>{
		$('#popup1, #popup2').toggle();
		$('.second-popup-title').html(action + " playlist songs <i class='fa fa-music'></i>");
		$('#warning').empty();
		buttonToHide.hide();
		buttonToShow.show();
	}

	const buildSongsFields=(url, name)=>{
		$('.songs').append("<div class='col-xs-12 song-component'><div class='col-xs-12 col-sm-6 col-md-6 col-lg-6'><input type='url' class='song song-url url' placeholder='Song Url' value='" + url +"'><p class='field-warning'></p></div><div class='col-xs-12 col-sm-6 col-md-6 col-lg-6'><input type='text' class='name song-name' placeholder='Song Name' value='" + name + "'><p class='field-warning'></p></div><span class='glyphicon glyphicon-trash'></span></div>")
	}

	$(document).on('click', '.glyphicon-trash', function(){
		$(this).parent('.song-component').slideUp("slow", "swing", () => $(this).parent('.song-component').remove());
	})

	$('.new-song').click(() => buildSongsFields("", ""));

	$('.back').click(() => $('#popup1, #popup2').toggle());

	$('.finish').click(()=>{
		if(!checkForPairs()){
			return $('#warning').text(errMessages.requiredFields).slideDown("slow");
		}
		const obj={name: $('#playlist-name').val(), image: $('#cover-url').val(), songs: JSON.stringify(createSongsArr())}
		console.log(obj.songs)
		ajaxCallService("/playlist", "put", obj).then(response=>{
			if(response.success){
				$('#popup2').hide();
				$('.songs').empty();
				fetchAllAlbums();
			}
		}).catch(err=>console.log(err))
	})

	$('.update-songs').click(()=>{
		if(!checkForPairs()){
			return $('#warning').text(errMessages.requiredFields).slideDown("slow");
		}
		const obj={songs: JSON.stringify(createSongsArr())};
		console.log(obj.songs)
		const id=$('.first-popup-title').siblings('.albumId').text();
		ajaxCallService("/playlist/" + id + "/songs", "patch", obj).then(response=>{
			/*if(response.success){*/
				updatePlayerSongs(id, obj);
				$('#popup2').hide();
				$('.songs').empty();
				fetchAllAlbums();
			/*}*/
		})
	})

	const updatePlayerSongs=(id, obj)=>{
		if(id === $('.player-disc-cover').siblings('.albumId').text()){
			songs=JSON.parse(obj.songs);
			$('.song-item').remove();
			JSON.parse(obj.songs).forEach(item => $('.songs-list').append("<li class='song-item transparent'>" + item.name + "</li>"));
		}
	}

    const checkForPairs=()=>{
        const status = [];
        const urlArr = $('.song-url');
        const nameArr = $('.song-name');
        for (let i = 0; i < urlArr.length; i++) {
            if ($(urlArr[i]).val() != '' && $(nameArr[i]).val() != '') {
                let url = inputValidation($(urlArr[i]));
                let name = inputValidation($(nameArr[i]));
                status.push(url && name);
            }else if($(urlArr[i]).val() != '' && $(nameArr[i]).val() === '' || $(urlArr[i]).val() === '' && $(nameArr[i]).val() != '') {
                let url = inputValidation($(urlArr[i]));
                let name = inputValidation($(nameArr[i]));
                status.push(url && name);
            }else{
                $(urlArr[i]).siblings('p').slideUp("slow");
                $(nameArr[i]).siblings('p').slideUp("slow");
            }
        }
        return status.length > 0 ? status.every(x => x === true) : false;
    }

	const initSuccessPopup=(obj, id)=>{
		$('#popup4').slideDown(3000);
		$('#album-title').text(obj.name);
		$('#image-album').css('background-image', 'url(' + obj.image + ')')
		JSON.parse(obj.songs).forEach(current => $('#album-songs').append("<li>" + current.name + "</li>"));
		$('#image-album .glyphicon-play').click(() => {
			songs=JSON.parse(obj.songs);
			initPlayer({id: id, name: obj.name, image: obj.image});
			$('#popup4').fadeOut();
		})
	}

	const createSongsArr=()=>{
		const songsArr=[];
		$('.song-component').each(function(){
			if($(this).find('.song-url').val() != ""){
				songsArr.push({name: $(this).find('.song-name').val(), url: $(this).find('.song-url').val()})
			}
		})
		return songsArr;
	}

	$(document).on('keyup', '.image, .song, .name', function(){
		if($(this).attr('id') === 'cover-url'){
			if(inputValidation($(this))){
				return $('.image-cover').attr('src', $(this).val());
			}
			return $('.image-cover').attr('src', '');
		}
		return inputValidation($(this))
	})

	const inputValidation=(element)=>{
		const key=element.attr('class').split(' ')[0];
		if(!pattern[key].test(element.val()) || element.val() === ''){
			element.siblings('p').text(errMessages[key]).slideDown("slow");
			return false;
		}
		element.siblings('p').slideUp("slow");
		return true;
	}

	$(document).on('click', '.trash1, .trash2', function(){
		const id = ($(this).attr('class').split(' ')[2] === 'trash1') ? $(this).closest('.album').attr('id') : $('.player-disc-cover').siblings(".albumId").text();
		initDeletePopUp(id);
	})

	const initDeletePopUp=(id)=>{
		const currentAlbum=albums.filter(current => current._id === id)[0];
		$('#popup3').fadeIn(1000);
		if(document.title.split('-')[0] === currentAlbum.name){
			return $(".delete-message").text("You are about to delete a playlist that is currently playing. Are you sure you want to continue?").append('<img id="img-preview-delete" src="' + currentAlbum.image + '">').siblings(".albumId").text(id);
		}
		return $(".delete-message").text("Are you sure you want to delete " + currentAlbum.name + " playlist?").append('<img id="img-preview-delete" src="' + currentAlbum.image + '">').siblings(".albumId").text(id);
	}

	$('#delete').click(()=>{
		const id=$(".delete-message").siblings('.albumId').text();
		ajaxCallService('/playlist/' + id, 'delete').then(response=>{
			/*if(response.success){*/
				$('#popup3').hide();
				if(id === $('.player-disc-cover').siblings(".albumId").text()){
					closePlayer();
				}
				fetchAllAlbums();
			/*}*/	
		})
	})

	$('#player-icons .fa-times').click(() => closePlayer());

	const closePlayer=()=>{
		document.querySelector('audio').pause();
		$('.player-container').slideUp(3000).siblings('.up').addClass('mt-responsive').removeClass('mt-50');
		$('footer').fadeOut(3000);
		document.title="Sounds Good";
	}

	$(document).on('click', '.play, .dropdown-content li', function(){
		const id = $(this).attr("class").split(" ")[2] === 'play' ? $(this).closest('.album').attr('id') : $(this).attr("class");
		const currentAlbum=albums.filter(current => current._id === id)[0];
		ajaxCallService('/playlist/' + id + '/songs', 'get').then(response=>{
			console.log(response)
			songs=response.data;
			initPlayer(currentAlbum);
		})
	})

	const initPlayer=(album)=>{
		$('.player-container').slideDown(3000).siblings('.up').removeClass('mt-responsive').addClass('mt-50');
		$('.player-disc-cover').css("background-image", 'url(' + album.image + ')').css("background-size", "cover").siblings('.albumId').text(album._id)
		$('#current-album').text(album.name);
		$('.song-item').remove();
		songs.forEach(item => $('.songs-list').append("<li class='song-item transparent'>" + item.name + "</li>"))
		let current=0;
		playNextSong(album.name, current, $('.song-item')[current]);
	}

	const playNextSong=(albumName, index, songItem)=>{
		$('audio').attr("src", songs[index].url);
		document.querySelector('audio').play();
		document.title=albumName + "-" + songs[index].name;
		$('footer').fadeIn(3000).children('.current-song').html("<i class='fa fa-backward'></i><span>Now playing: " + songs[index].name + '</span><i class="fa fa-forward"></i>');
		$(songItem).addClass('active').removeClass("transparent").siblings('.song-item').addClass('transparent').removeClass('active');
		document.querySelector('audio').onended=()=>{
			index++;
			if(index < songs.length){
				return playNextSong(document.title.split('-')[0], index, $('.song-item')[index]);
			}
			return closePlayer();
		}
	}

	$(document).on("click", '.transparent', function(){
		playNextSong(document.title.split('-')[0], $(this).index(), $(this))
	})
	$(document).on("click", '.active', () => {
		const myAudio=document.querySelector('audio');
		myAudio.paused ? myAudio.play() : myAudio.pause();
	})
	$(document).on('click', '.fa-forward', ()=>{
		const index=$('.active').index() + 1;
		if(index < songs.length){
			playNextSong(document.title.split('-')[0], index, $('.song-item')[index]);
		}
	})
	$(document).on('click', '.fa-backward', ()=>{
		const index=$('.active').index() - 1;
		if(index != -1){
			playNextSong(document.title.split('-')[0], index, $('.song-item')[index]);
		}
	})
	document.querySelector('audio').onplay=()=>{
		$('.player-disc-cover').addClass('animated-disc').siblings('#player-hole').html('<span class="glyphicon glyphicon-pause"></span>');
		$('#player').css("background-image", "url('https://www.shaa.com/wp-content/uploads/2014/02/Equalizer_03.gif')").css("background-size", "cover");
		$('.glyphicon-pause').click(()=>document.querySelector('audio').pause());
		$('.active').removeClass('paused');
	}
	document.querySelector('audio').onpause=()=>{
		$('.player-disc-cover').removeClass('animated-disc').siblings('#player-hole').html('<i class="fa fa-play replay"></i>');
		$('#player').css("background-image", "")
		$('.replay').click(()=>document.querySelector('audio').play());
		$('.active').addClass('paused');
	}
	$(document).on('click', '.overlay .fa-info', function(){
		ajaxCallService('/playlist/' + $(this).closest('.album').attr('id') + '/songs', 'get').then(response=>{
			response.data.forEach(current => $(this).siblings('ol').append('<li>' + current.name + '</li>'));
			$(this).siblings('ol').css('transform', 'translateX(0px)').css('opacity', '1').prepend('<span class="glyphicon glyphicon-remove"></span>');
		})
	})
	$(document).on('mouseleave', '.overlay', function(){
		setTimeout(() => $(this).children('ol').css('transform', 'translateX(-200px)').css('opacity', '0').empty(), 0);
	})
	$(document).on('click', '.glyphicon-remove', function(){
		$(this).parent('ol').css('transform', 'translateX(-200px)').css('opacity', '0').empty();
	})
})
