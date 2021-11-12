const KEYS_TO_BE_REGISTERED = ["MediaPause", "MediaPlay", "MediaPlayPause", "MediaStop", "MediaFastForward", "MediaRewind"];


window.onload = function () {
	initialize();
};


function initialize() {
	tizen.tvinputdevice.registerKeyBatch(KEYS_TO_BE_REGISTERED,
		function successCallback() { },
		function errorCallback(error) {
			console.log("An error occured while registering the keys: " + error.message);
		}
	);

	//handleKeyEvents();

	//registerVisibilityChangeHandler();

	try {
		duid = webapis.productinfo.getDuid();
		console.log("DUID: " + duid);
	}
	catch (error) {
		console.log("An error occured while getting the DUID: " + error.message);
	}

	SpatialNavigation.init();
	SpatialNavigation.add({
		selector: "input, button, .video-list-item"
	});

	setTimeout(() => getCollectionList(), 5000);
}


function build() {
	let collectionsScreen = document.getElementById("collections-screen");

	let template = document.getElementById("collection-row-template").innerHTML.trim();
	let holder = document.createElement("div");
	holder.innerHTML = template;
	let collectionRowTemplate = holder.childNodes;
	collections.forEach((collection, index) => {
		let divCollectionRow = collectionRowTemplate[0].cloneNode(true);
		divCollectionRow.id = "collection-" + index;
		let divCollectionTitle = divCollectionRow.querySelector(".collection-title");
		divCollectionTitle.innerHTML = collection.name;
		let divVideoNumber = divCollectionRow.querySelector(".video-number");
		divVideoNumber.innerHTML = Number(index + 1) + " of " + collection.videoCount;

		collectionsScreen.children[1].appendChild(divCollectionRow);
	});




	/* let template = document.getElementById("video-list-item-template").innerHTML.trim();
	let holder = document.createElement('div');
	holder.innerHTML = template;
	let videoListItemTemplate = holder.childNodes;

	collections[0].videos.forEach((video, index) => {
		let divVideo = videoListItemTemplate[0].cloneNode(true);
		divVideo.id = "video" + index;
		divVideo.setAttribute("tabindex", "-1");
		divVideo.innerHTML = video.title;
		
		collectionsScreen.appendChild(divVideo);
	}); */
}