let wsfPlayer = {
		
	posValueAsPercentage: undefined,

	videoElement: undefined,

	hls: undefined,

	bandwidthEstimate: undefined,

	isPlaying: false,
	

	setVideoElement: function(element) {
		this.videoElement = element;
		this.addEventListeners();
	},

	play: function(url, startPos) {		
		let videoEl = wsfPlayer.videoElement;
		
		this.posValueAsPercentage = 0;
		
		if (videoEl != undefined) {
			if (Hls.isSupported()) {
				let config = {
					highBufferWatchdogPeriod: 0.1,
					nudgeOffset: 1.1,
				}
				if (startPos != undefined) {
					config.autoStartLoad = true;
					config.startPosition = startPos;					
				}				
				let hls = new Hls(config);
				wsfPlayer.hls = hls;
				wsfPlayer.hls.loadSource(url);
				wsfPlayer.hls.attachMedia(videoEl);
				wsfPlayer.hls.on(Hls.Events.MANIFEST_PARSED, function() {
					videoEl.play();
				});

				wsfPlayer.hls.on(Hls.Events.FRAG_BUFFERED, function(event, data) {
					wsfPlayer.bandwidth = data.stats.bwEstimate;
				});

				/*hls.on(Hls.Events.ERROR, function (event, data) {
					if (data.fatal) {
						switch(data.type) {
							case Hls.ErrorTypes.NETWORK_ERROR:
								// try to recover network error
								log("fatal network error encountered, try to recover");
								hls.startLoad();
								break;
							case Hls.ErrorTypes.MEDIA_ERROR:
								log("fatal media error encountered, try to recover");
								hls.recoverMediaError();
								break;
							default:
								// cannot recover
								hls.destroy();
								break;
						}
					}
				});*/
			}
			else if (video.canPlayType('application/vnd.apple.mpegurl')) {
				videoEl.src = url;
				videoEl.play();
			}
		}
	},

	pause: function() {
		let videoEl = this.videoElement;
		/* if (!isPlayingLiveStream) {
			resumeVideoAtPos = videoEl.currentTime;
		} */
		this.isPlaying = false;
		videoEl.pause();
	},

	stop: function() {
		this.videoElement.pause();
		if (wsfPlayer.hls != undefined) {
			wsfPlayer.hls.stopLoad();
			wsfPlayer.hls.destroy();
			wsfPlayer.bandwidth = undefined;
		}
	},

	seekTo: function(isRewind, seekStepInSeconds) {
		let videoEl = this.videoElement;

		if (seekStepInSeconds == undefined) {
			seekStepInSeconds = REWIND_FAST_FORWARD_DEFAULT_STEP_IN_SECONDS;
		}

		if (isRewind) {
			videoEl.currentTime -= seekStepInSeconds;		
		} 
		else {			
			videoEl.currentTime += seekStepInSeconds;			
		}

		let value = (videoEl.currentTime / videoEl.duration) * 100.0;
		this.posValueAsPercentage = value; 

		seekBar.style.width = (value * 19.00) + "px";
		/* if (seekBarContainer.style.opacity == 1) {
			if (isPlayingLiveStream) {
				wsfPlayer.displayTimePositionsAsSofiaLocalTime();
			}
			else {
				wsfPlayer.displayElapsedTimeAndDurationForRecordings();
			}
			//wsfPlayer.displayTimePositionsAsSofiaLocalTime();
		} */
	},

	/* displayTimePositionsAsSofiaLocalTime: function() {
		currentTimePos.innerHTML = secondsToText(this.videoElement.duration - this.videoElement.currentTime);
		currentTimePos.style.marginLeft = Number((this.posValueAsPercentage * 19.00) - 120) + "px";
		startTimePosition.classList.remove("hidden");
		startTimePosition.innerHTML = secondsToText(this.videoElement.duration);
		liveTimePosition.style.marginLeft = "1660px";
		liveTimePosition.innerHTML = secondsToText(0);
	},
	
	displayElapsedTimeAndDurationForRecordings: function() {
		currentTimePos.innerHTML = secondsToTextAsDuration(this.videoElement.currentTime);
		currentTimePos.style.marginLeft = Number((this.posValueAsPercentage * 19.00)) + "px";
		//startTimePosition.innerHTML = secondsToTextAsDuration(0);
		startTimePosition.classList.add("hidden");
		//liveTimePosition is the actual duration of the recording.
		liveTimePosition.style.marginLeft = "1780px";
		liveTimePosition.innerHTML = secondsToTextAsDuration(this.videoElement.duration);
	}, */

	addEventListeners: function() {
		let videoEl = this.videoElement;
		let _hls = this.hls;
		if (videoEl != undefined) {
			videoEl.addEventListener("loadstart", function() {
				console.log("started loading...");
			});

			videoEl.addEventListener("loadedmetadata", function() {
				console.log("video metadata info was loaded.");
			});

			videoEl.addEventListener("progress", function() {
				//console.log("buffering...");
			});

			videoEl.addEventListener("loadeddata", function() {
				//console.log("video loaded.");
			});

			videoEl.addEventListener("canplay", function() {
				console.log("video can play now...");
				
			});

			videoEl.addEventListener("playing", function() {
				console.log("video is playing now...");

				wsfPlayer.isPlaying = true;
			})

			videoEl.addEventListener("timeupdate", function() {
				let value = (videoEl.currentTime / videoEl.duration) * 100.0;
				wsfPlayer.posValueAsPercentage = value;

				// Update the slider value
				//seekBar.style.width = (value * 19.00) + "px";
				//if (seekBarContainer.style.opacity == 1) {
					/* if (isPlayingLiveStream) {
						wsfPlayer.displayTimePositionsAsSofiaLocalTime();
					}
					else {
						wsfPlayer.displayElapsedTimeAndDurationForRecordings();
					} */
					//wsfPlayer.displayTimePositionsAsSofiaLocalTime();
				//}			
			});

			videoEl.addEventListener("suspend", function() {
				console.log("suspend");
			});

			videoEl.addEventListener("pause", function() {
				console.log("pause");
			});

			videoEl.addEventListener("waiting", function() {
				console.log("waiting");
			});

			videoEl.addEventListener("abort", function() {
				console.log("abort");
			});

			videoEl.addEventListener("resize", function() {

			});

			videoEl.addEventListener("durationchange", function() {

			});

			videoEl.addEventListener("seeked", function() {
				console.log("seek operation completed.");
				// videoEl.play();
			});

			videoEl.addEventListener("stalled", function() {
				//console.log('video stalled.');
			});

			videoEl.addEventListener("ended", function() {
				/* if (!isPlayingLiveStream) {
					playingScreen.classList.add("hidden");
					recordingListScreen.classList.remove("hidden");

					let _itemToGetFocus = undefined;
					_itemToGetFocus = document.querySelectorAll("[data-bid='" + recordingBid + "']")[0];
					if (_itemToGetFocus == undefined) {						
						_itemToGetFocus = document.getElementsByClassName("programme-list-item")[0];
					}
					SpatialNavigation.focus(_itemToGetFocus.id);
					//recordingBid = undefined;
					//playingRecordingTitle = undefined;
				} */
			});

			videoEl.addEventListener("error", function(err) {
				console.log(err);
				switch (videoEl.error.code) {
					case 1: {
						console.log("MEDIA_ERR_ABORTED: 1, Media data download is stopped by the user");

						break;
					}
					case 2: {
						console.log("MEDIA_ERR_NETWORK: 2, Download stopped due to network error");

						break;
					}
					case 3: {
						console.log("MEDIA_ERR_DECODE: 3, Media data decoding failure");

						break;
					}
					case 4: {
						console.log("MEDIA_ERR_SRC_NOT_SUPPORTED: 4, Format not supported");

						break;
					}
				}
			}, false);
		}
	}
};
