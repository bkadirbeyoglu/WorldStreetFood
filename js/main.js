const KEYS_TO_BE_REGISTERED = ["MediaPause", "MediaPlay", "MediaPlayPause", "MediaStop", "MediaFastForward", "MediaRewind"];

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

	document.addEventListener("sn:focused", function(event) {
		//console.log(event);

		let focusedElement = event.target;
		let firstPart = focusedElement.id.split("-")[0];
		let secondPart = focusedElement.id.split("-")[1];
		let collectionIndex = Number(firstPart.split("c")[1]);
		let videoIndex = Number(secondPart.split("v")[1]);
		//divVideoDescription.innerHTML = collections[collectionIndex].videos[videoIndex].title;

		let str = collections[collectionIndex].videos[videoIndex].title;
		let _lastIndexOfDot = str.split("|")[0].lastIndexOf(".");
		let title = str.substr(0, _lastIndexOfDot);
		//console.log(title);
		let description = str.split("|")[1];
		//console.log(subtitle);
		divVideoTitle.innerHTML = title;
		divVideoDescription.innerHTML = description;
	});

	setTimeout(() => getCollectionList(), 5000);
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

	collections.forEach((collection, collIndex) => {
		let divCollectionRow = collectionRowTemplate[0].cloneNode(true);
		divCollectionRow.id = "collection-" + collIndex;
		let divCollectionTitle = divCollectionRow.querySelector(".collection-title");
		divCollectionTitle.innerHTML = collection.name;
		let divVideoNumber = divCollectionRow.querySelector(".video-number");
		divVideoNumber.innerHTML = "1 of " + collection.videoCount;

		let len = collection.videos.length;
		collection.videos.forEach((video, vidIndex) => {
			let divVideo = videoListItemTemplate[0].cloneNode(true);
			divVideo.id = "c" + collIndex + "-v" + vidIndex;
			divVideo.setAttribute("tabindex", "-1");
			if (vidIndex == len - 1) {
				divVideo.setAttribute("data-sn-right", "");
			}
			divVideo.innerHTML = video.title;
			let divVideoList = divCollectionRow.querySelector(".video-list");
			divVideoList.appendChild(divVideo);
		});
		
		divCollections.appendChild(divCollectionRow);
	});

	var divFirstCollection = document.getElementById("collection-0");
	var divFirstVideo = divFirstCollection.querySelector("#c0-v0");
	SpatialNavigation.focus(divFirstVideo);
}