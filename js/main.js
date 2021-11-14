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
		let str = collections[collectionIndex].videos[videoIndex].title;
		let _lastIndexOfDot = str.split("|")[0].lastIndexOf(".");
		let title = str.substr(0, _lastIndexOfDot);
		let description = str.split("|")[1];
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
					if (elementToGetFocus.offsetLeft >= (containerElement.scrollLeft + 1751)) {		// 1751 -> document.getElementById("c0-v4").offsetLeft	
						containerElement.scrollLeft += elementToGetFocus.offsetLeft - blurredElement.offsetLeft;																	
					}
				}
				else {
					if (elementToGetFocus.offsetLeft < (containerElement.scrollLeft + 509)) {		// 509 -> document.getElementById("c0-v1").offsetLeft				
						containerElement.scrollLeft -= (blurredElement.offsetLeft - elementToGetFocus.offsetLeft);		
					}
				}
			}
			else {
				let collIndex = Number(elementToGetFocus.id.split("-")[0].split("c")[1]);
				document.getElementById("collections").scrollTop = collIndex * 309;		// 309 = 284 + 25 (.collection-row height + .collection-row margin-bottom)					
			}	
		}
	});

	//setTimeout(() => getCollectionList(), 5000);
	setTimeout(() => getChannelXML(), 5000);
	/* setTimeout(function() {
		getChannelXML().then(strXml => {
			if (window.DOMParser)
			{
				parser = new DOMParser();
				xmlDoc = parser.parseFromString(strXml, "text/xml");

				console.log(xmlDoc);
			}
		});
	}, 5000); */
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