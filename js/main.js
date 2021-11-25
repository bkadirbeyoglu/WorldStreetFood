const KEYS_TO_BE_REGISTERED = ["MediaPause", "MediaPlay", "MediaPlayPause", "MediaStop", "MediaFastForward", "MediaRewind"];

const playingScreen = document.getElementById("playing-screen");
const collectionsScreen = document.getElementById("collections-screen");

const divVideoTitle = document.getElementById("video-title");
const divVideoDescription = document.getElementById("video-description");


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

	handleKeyEvents();

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

	document.addEventListener("sn:focused", function(event) {
		//console.log(event);
		let focusedElement = event.target;
		let firstPart = focusedElement.id.split("-")[0];
		let secondPart = focusedElement.id.split("-")[1];
		let collectionIndex = Number(firstPart.split("c")[1]);
		let videoIndex = Number(secondPart.split("v")[1]);
		/*let str = playlists[collectionIndex].items[videoIndex].title;
		let _lastIndexOfDot = str.split("|")[0].lastIndexOf(".");
		let title = str.substr(0, _lastIndexOfDot);
		let description = str.split("|")[1]; */
		let title = playlists[collectionIndex].items[videoIndex].content.title;
		let description = playlists[collectionIndex].items[videoIndex].content.description
		divVideoTitle.innerHTML = title;
		divVideoDescription.innerHTML = description;
	});

	document.addEventListener("sn:willunfocus", function(event) {
		let blurredElement = event.target;
		let elementToGetFocus =  event.detail.nextElement;
		let containerElement = blurredElement.parentElement;
		if (elementToGetFocus != undefined) {	
			if (event.detail.direction == "left" || event.detail.direction == "right") {
				if (elementToGetFocus.offsetLeft > blurredElement.offsetLeft) {
					if (elementToGetFocus.offsetLeft >= (containerElement.scrollLeft + containerElement.offsetWidth * 0.90)) {
						containerElement.scrollLeft += 414;		// 414 = 384 + 15 + 15 (.video-list-item width + .video-list-item margin-left + .video-list-item.margin-right)							
					}
				}
				else {
					if (elementToGetFocus.offsetLeft < (containerElement.scrollLeft + containerElement.offsetWidth * 0.05)) {
						containerElement.scrollLeft -= 414;
					}
				}
			}
			else {
				let collIndex = Number(elementToGetFocus.id.split("-")[0].split("c")[1]);
				document.getElementById("collections").scrollTop = collIndex * 309;		// 309 = 284 + 25 (.collection-row height + .collection-row margin-bottom)					
			}	
		}
	});

	setTimeout(() => getChannelXML(), 2000);
}


function buildCollectionsScreen() {
	let divCollections = document.getElementById("collections");

	let templateCR = document.getElementById("collection-row-template").innerHTML.trim();
	let holderCR = document.createElement("div");
	holderCR.innerHTML = templateCR;
	let collectionRowTemplate = holderCR.childNodes;

	let templateVLI = document.getElementById("video-list-item-template").innerHTML.trim();
	let holderVLI = document.createElement('div');
	holderVLI.innerHTML = templateVLI;
	let videoListItemTemplate = holderVLI.childNodes;


	// playlist = collection
	playlists.forEach((collection, collIndex) => {
		let len = collection.items.length;
		let divCollectionRow = collectionRowTemplate[0].cloneNode(true);
		divCollectionRow.id = "collection-" + collIndex;
		let divCollectionTitle = divCollectionRow.querySelector(".collection-title");
		divCollectionTitle.innerHTML = collection.title;
		let divVideoNumber = divCollectionRow.querySelector(".video-number");
		divVideoNumber.innerHTML = "1 of " + len;

		collection.items.forEach((video, vidIndex) => {
			let divVideo = videoListItemTemplate[0].cloneNode(true);
			divVideo.id = "c" + collIndex + "-v" + vidIndex;
			divVideo.setAttribute("tabindex", "-1");
			if (vidIndex == 0) {
				divVideo.setAttribute("data-sn-left", "");
			}
			if (vidIndex == len - 1) {
				divVideo.setAttribute("data-sn-right", "");
			}
			divVideo.style.backgroundImage = "url(\"" + video.content.thumbnail._url + "\")";
			let divVideoList = divCollectionRow.querySelector(".video-list");
			divVideoList.appendChild(divVideo);
		});
		
		divCollections.appendChild(divCollectionRow);
	});

	var divFirstCollection = document.getElementById("collection-0");
	var divFirstVideo = divFirstCollection.querySelector("#c0-v0");
	SpatialNavigation.focus(divFirstVideo);
}


function handleKeyEvents() {
	window.addEventListener("keydown", function(event) {
		//console.log(event);
		var activeElement = document.activeElement;

		switch (event.key) {
			case "Enter": {
				handleEnterKey();

				break;
			}

			case "XF86Back": {
				

				break;
			}

		};
	});
}


function handleEnterKey() {
	var activeElement = document.activeElement;

	if (activeElement.classList.contains("video-list-item")) {
		collectionsScreen.classList.add("hidden");
		playingScreen.classList.remove("hidden");

		
	}
}