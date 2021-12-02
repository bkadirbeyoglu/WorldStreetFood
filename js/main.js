const KEYS_TO_BE_REGISTERED = ["MediaPause", "MediaPlay", "MediaPlayPause", "MediaStop", "MediaFastForward", "MediaRewind"];

const INTERNET_CONNECTION_LOST = "Internet connection lost";
const INTERNET_CONNECTION_RESTORED = "Internet connection restored";
const MESSAGE_DISPLAY_DURATION = 4000;

const playingScreen = document.getElementById("playing-screen");
const collectionsScreen = document.getElementById("collections-screen");
const loadingScreen = document.getElementById("loading-screen");
const exitConfirmationPopup = document.getElementById("exit-confirmation-popup");

const divVideoTitle = document.getElementById("video-title");
const divVideoDescription = document.getElementById("video-description");
const divScreenshotPart = document.getElementById("screenshot-part");

const divMessageBox = document.getElementById("message-box");

const divBottomContainer = document.getElementById("bottom-container");
const progress = document.getElementById("progress");
const elapsedTime = document.getElementById("elapsed-time");
const timeLeft = document.getElementById("time-left");

let isInternetAvailable;

let lastFocusedVideoItem;

let selectedVideoItem;


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

	registerVisibilityChangeHandler();
	registerNetworkStateChangeListener();

	try {
		duid = webapis.productinfo.getDuid();
		console.log("DUID: " + duid);
	}
	catch (error) {
		console.log("An error occured while getting the DUID: " + error.message);
	}

	wsfPlayer.setVideoElement(document.getElementById("wsf-video"));

	SpatialNavigation.init();
	SpatialNavigation.add({
		selector: "input, button, .video-list-item, .exit-confirmation-button"
	});

	document.addEventListener("sn:focused", function(event) {
		//console.log(event);
		if (event.target.classList.contains("video-list-item")) {
			let focusedElement = event.target;
			lastFocusedVideoItem = focusedElement;
			let firstPart = focusedElement.id.split("-")[0];
			let secondPart = focusedElement.id.split("-")[1];
			let collectionIndex = Number(firstPart.split("c")[1]);
			let videoIndex = Number(secondPart.split("v")[1]);
			let divsVideoNumber = document.querySelectorAll(".video-number");
			divsVideoNumber.forEach(div => div.classList.add("hidden"));
			let divVideoNumber = divsVideoNumber[collectionIndex];
			divVideoNumber.classList.remove("hidden");
			divVideoNumber.innerHTML = Number(videoIndex + 1) + " of " + playlists[collectionIndex].items.length;
			let title = playlists[collectionIndex].items[videoIndex].content.title;
			let description = playlists[collectionIndex].items[videoIndex].content.description;
			divVideoTitle.innerHTML = title;
			divVideoDescription.innerHTML = description;
			divScreenshotPart.style.backgroundImage = "url(\'" + playlists[collectionIndex].items[videoIndex].content.thumbnail._url + "\')";
		}
	});

	document.addEventListener("sn:willunfocus", function(event) {
		//console.log(event);
		if (event.target.classList.contains("video-list-item")) {
			let blurredElement = event.target;
			let elementToGetFocus =  event.detail.nextElement;
			let containerElement = blurredElement.parentElement;
			let collections = document.getElementById("collections");
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
					collections.scrollTop = collIndex * 309;		// 309 = 284 + 25 (.collection-row height + .collection-row margin-bottom)
					containerElement.scrollLeft = 0;
				}	
			}
		}
	});

	setTimeout(() => {
		displayLoadingScreen();
		getChannelXML();
	}, 4000);
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
			if (collIndex >= 1) {
				divVideo.setAttribute("data-sn-up", "#c" + Number(collIndex - 1) + "-v0");
			}
			if (collIndex < playlists.length - 1) {
				divVideo.setAttribute("data-sn-down", "#c" + Number(collIndex + 1) + "-v0");
			}
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

	let divFirstCollection = document.getElementById("collection-0");
	let divFirstVideo = divFirstCollection.querySelector("#c0-v0");
	SpatialNavigation.focus(divFirstVideo);
}


function handleKeyEvents() {
	window.addEventListener("keydown", function(event) {
		//console.log(event);
		let activeElement = document.activeElement;

		switch (event.keyCode) {
			// Enter
			case 13: {
				handleEnterKey();

				break;
			}

			// Back
			case 10009: {	
				if (!playingScreen.classList.contains("hidden")) {
					if (wsfPlayer.isPlaying) {
						wsfPlayer.stop();

						document.getElementById("playing-video-title").innerHTML = "";
					}
					//selectedVideoItem = undefined;
					displayCollectionsScreen();

					return;
				}

				if (!collectionsScreen.classList.contains("hidden")) {
					displayExitConfirmationPopup();

					return;
				}

				break;
			}

			// MediaPause
			case 19: {
				if (!playingScreen.classList.contains("hidden")) {
					if (wsfPlayer.isPlaying) {
						wsfPlayer.pause();
					}
				}

				break;
			}

			// MediaStop
			case 413: {
				if (!playingScreen.classList.contains("hidden")) {
					wsfPlayer.stop();

					document.getElementById("playing-video-title").innerHTML = "";
				}
				displayCollectionsScreen();

				break;
			}

			// MediaPlay
			case 415: {
				if (!playingScreen.classList.contains("hidden")) {
					if (!wsfPlayer.isPlaying) {
						// Directly calling the play method of the video element.
						wsfPlayer.videoElement.play();
					}
				}

				break;
			}

			// MediaPlayPause
			case 10252: {
				if (!playingScreen.classList.contains("hidden")) {
					if (wsfPlayer.isPlaying) {
						wsfPlayer.pause();
					}
					else {
						// Directly calling the play method of the video element.
						wsfPlayer.videoElement.play();
					}
				}

				break;
			}

		};
	});
}


function handleEnterKey() {
	let activeElement = document.activeElement;

	if (activeElement.classList.contains("video-list-item")) {
		let id = activeElement.id;
		let dashIndex = id.indexOf("-");
		let collIndex = id.substring(1, dashIndex);
		let videoIndex = id.substr(dashIndex + 2, id.length - 1);
		selectedVideoItem = playlists[collIndex].items[videoIndex];
		//let videoLink = playlists[collIndex].items[videoIndex].link;
		//console.log("videoLink: " + videoLink);

		displayPlayingScreen();

		//wsfPlayer.play(videoLink);
		wsfPlayer.play(selectedVideoItem.link);

		return;
	}

	if (activeElement.id == "exit-confirmation-button-no") {
		hideExitConfirmationPopup();

		return;
	}
	if (activeElement.id == "exit-confirmation-button-yes") {
		tizen.application.getCurrentApplication().exit();
		
		return;
	}
}


function displayCollectionsScreen() {
	hideLoadingScreen();
	playingScreen.classList.add("hidden");
	collectionsScreen.classList.remove("hidden");

	if (lastFocusedVideoItem != undefined) {
		SpatialNavigation.focus(lastFocusedVideoItem);
	}
}


function displayPlayingScreen() {
	collectionsScreen.classList.add("hidden");
	playingScreen.classList.remove("hidden");
	displayLoadingScreen();
}


function displayLoadingScreen() {
	loadingScreen.classList.remove("hidden");
}


function hideLoadingScreen() {
	loadingScreen.classList.add("hidden");
}


function displayExitConfirmationPopup() {
	exitConfirmationPopup.classList.remove("hidden");
	SpatialNavigation.focus(document.getElementById("exit-confirmation-button-no"));

	/* This section is just a hack to prevent the scrolling to the to collection when displaying the exit confirmation popup */
	let firstPart = lastFocusedVideoItem.id.split("-")[0];
	let collectionIndex = Number(firstPart.split("c")[1]);
	collections.scrollTop = collectionIndex * 309;
}


function hideExitConfirmationPopup() {
	exitConfirmationPopup.classList.add("hidden");
	
	/* This section is just a hack to correct the scrolling issues occuring after canceling to exit the app in exit confirmation popup */
	let firstPart = lastFocusedVideoItem.id.split("-")[0];
	let secondPart = lastFocusedVideoItem.id.split("-")[1];
	let collectionIndex = Number(firstPart.split("c")[1]);
	let videoIndex = Number(secondPart.split("v")[1]);
	collections.scrollTop = collectionIndex * 309;		// 309 = 284 + 25 (.collection-row height + .collection-row margin-bottom)
	lastFocusedVideoItem.parentElement.scrollLeft = 0;
	SpatialNavigation.focus("#c" + collectionIndex + "-v0");
	for (let i = 0; i < videoIndex; i++) {
		SpatialNavigation.move("right");
	}
}


function registerVisibilityChangeHandler() {	
	document.addEventListener("visibilitychange", function() {		
		if (document.hidden) {
			//log("document hidden");
			if (!playingScreen.classList.contains("hidden")) {				
				wsfPlayer.pause();
			}						
		} 
		else {
			//log("document visible");
			if (!playingScreen.classList.contains("hidden")) {
				// Directly calling the play method of the video element.
				wsfPlayer.videoElement.play();
			}
		}			
	});
}


function registerNetworkStateChangeListener() {
	webapis.network.addNetworkStateChangeListener(function(value) {
		if (value == webapis.network.NetworkState.GATEWAY_DISCONNECTED) {
			//log("offline");
			
			isInternetAvailable = false;    	    		  	        		
			if (!playingScreen.classList.contains("hidden")) {
				wsfPlayer.pause();
			}
			displayStickyMessage(INTERNET_CONNECTION_LOST);
			
		} 
		else if (value == webapis.network.NetworkState.GATEWAY_CONNECTED) {
			//log("online");
			
			isInternetAvailable = true;
			removeStickyMessage();
			displayMessage(INTERNET_CONNECTION_RESTORED);
			if (!playingScreen.classList.contains("hidden")) {
				wsfPlayer.videoElement.play();
			}  	    			        		
		}
	});
}


function displayMessage(messageText) {
	divMessageBox.innerHTML = messageText;
	divMessageBox.classList.remove("hidden");
	
	setTimeout(() => divMessageBox.classList.add("hidden"), MESSAGE_DISPLAY_DURATION);
}


function displayStickyMessage(messageText) {
	divMessageBox.innerHTML = messageText;
	divMessageBox.classList.remove("hidden");
}


function removeStickyMessage() {
	divMessageBox.innerHTML = "";
	divMessageBox.classList.add("hidden");
}


function secondsToHHMMSS(totalSeconds) {
	//console.log(totalSeconds);
	totalSeconds = Number(totalSeconds);
	var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor(totalSeconds % 3600 / 60);
    var seconds = Math.floor(totalSeconds % 3600 % 60);

  	var result = (hours < 10 ? "0" + hours : hours);
    result += ":" + (minutes < 10 ? "0" + minutes : minutes);
    result += ":" + (seconds  < 10 ? "0" + seconds : seconds);
  	
	return result;
}


function hHMMSSToSeconds(str) {
    var p = str.split(":");
	var s = 0;
	var m = 1;

    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }

    return s;
}
