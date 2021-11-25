var wsfPlayer = {
		
	posValueAsPercentage: undefined,

	videoElement: undefined,

	hls: undefined,

	//intervalIdSendUserStatistics: undefined,

	bandwidthEstimate: undefined,
	


	setVideoElement: function(element) {
		this.videoElement = element;
		this.addEventListeners();
	},

	play: function(url, startPos) {		
		var _vidEl = wsfPlayer.videoElement;
		
		this.posValueAsPercentage = 0;
		
		if (_vidEl != undefined) {
			if (Hls.isSupported()) {
				var config = {
					highBufferWatchdogPeriod: 0.1,
					nudgeOffset: 1.1,
				}
				if (startPos != undefined) {
					config.autoStartLoad = true;
					config.startPosition = startPos;					
				}				
				var hls = new Hls(config);
				wsfPlayer.hls = hls;
				wsfPlayer.hls.loadSource(url);
				wsfPlayer.hls.attachMedia(_vidEl);
				wsfPlayer.hls.on(Hls.Events.MANIFEST_PARSED, function() {
					_vidEl.play();
					/* if (wsfPlayer.intervalIdSendUserStatistics == undefined) {
						wsfPlayer.intervalIdSendUserStatistics = setInterval(function() {
							var cid = focusedChannel.cid;
							var host = getHostPartOfUrl(urlToPlay);
							sendUserStatistics(Math.round((wsfPlayer.bandwidth / (1000 * 8))), cid, isPlayingLiveStream, host);
						}, SEND_USER_STATISTICS_PERIOD);
					} */	
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
				_vidEl.src = url;
				_vidEl.play();
			}
		}
	},

	pause: function() {
		var _vidEl = this.videoElement;
		/* if (!isPlayingLiveStream) {
			resumeVideoAtPos = _vidEl.currentTime;
		} */
		_vidEl.pause();
	},

	stop: function() {
		this.videoElement.pause();
		if (wsfPlayer.hls != undefined) {
			wsfPlayer.hls.stopLoad();
			wsfPlayer.hls.destroy();
			//clearInterval(wsfPlayer.intervalIdSendUserStatistics);
			wsfPlayer.bandwidth = undefined;
			//wsfPlayer.intervalIdSendUserStatistics = undefined;
		}
	},

	seekTo: function(isRewind, seekStepInSeconds) {
		var _vidEl = this.videoElement;

		if (seekStepInSeconds == undefined) {
			seekStepInSeconds = REWIND_FAST_FORWARD_DEFAULT_STEP_IN_SECONDS;
		}

		//("_vidEl.currentTime: " + _vidEl.currentTime);

		if (isRewind) {
			_vidEl.currentTime -= seekStepInSeconds;		
		} 
		else {			
			_vidEl.currentTime += seekStepInSeconds;			
		}

		var value = (_vidEl.currentTime / _vidEl.duration) * 100.0;
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
		var _vidEl = this.videoElement;
		var _hls = this.hls;
		if (_vidEl != undefined) {
			_vidEl.addEventListener("loadstart", function() {
				log("started loading...");
				displayLoadingScreen();
			});

			_vidEl.addEventListener("loadedmetadata", function() {
				log("video metadata info was loaded.");
			});

			_vidEl.addEventListener("progress", function() {
				//log("buffering...");
			});

			_vidEl.addEventListener("loadeddata", function() {
				//log("video loaded.");
			});

			_vidEl.addEventListener("canplay", function() {
				//log("video can play now...");
				console.log("video can play now...");
				hideLoadingScreen();				
				playingScreen.classList.remove("hidden");
				/* if (isPlayingLiveStream) {
					wsfPlayer.displayTimePositionsAsSofiaLocalTime();
				}
				else {
					wsfPlayer.displayElapsedTimeAndDurationForRecordings();
				} */			
			});

			_vidEl.addEventListener("timeupdate", function() {
				var value = (_vidEl.currentTime / _vidEl.duration) * 100.0;
				wsfPlayer.posValueAsPercentage = value;

				// Update the slider value
				seekBar.style.width = (value * 19.00) + "px";
				if (seekBarContainer.style.opacity == 1) {
					/* if (isPlayingLiveStream) {
						wsfPlayer.displayTimePositionsAsSofiaLocalTime();
					}
					else {
						wsfPlayer.displayElapsedTimeAndDurationForRecordings();
					} */
					//wsfPlayer.displayTimePositionsAsSofiaLocalTime();
				}			
			});

			_vidEl.addEventListener("suspend", function() {
				console.log("suspend");
			});

			_vidEl.addEventListener("pause", function() {
				console.log("pause");
			});

			_vidEl.addEventListener("waiting", function() {
				console.log("waiting");
			});

			_vidEl.addEventListener("abort", function() {
				console.log("abort");
			});

			_vidEl.addEventListener("resize", function() {

			});

			_vidEl.addEventListener("durationchange", function() {

			});

			_vidEl.addEventListener("seeked", function() {
				console.log("seek operation completed.");
				// _vidEl.play();
			});

			_vidEl.addEventListener("stalled", function() {
				//log('video stalled.');
			});

			_vidEl.addEventListener("ended", function() {
				/* if (!isPlayingLiveStream) {
					playingScreen.classList.add("hidden");
					recordingListScreen.classList.remove("hidden");

					var _itemToGetFocus = undefined;
					_itemToGetFocus = document.querySelectorAll("[data-bid='" + recordingBid + "']")[0];
					if (_itemToGetFocus == undefined) {						
						_itemToGetFocus = document.getElementsByClassName("programme-list-item")[0];
					}
					SpatialNavigation.focus(_itemToGetFocus.id);
					//recordingBid = undefined;
					//playingRecordingTitle = undefined;
				} */
			});

			_vidEl.addEventListener("error", function(err) {
				console.log(err);
				switch (_vidEl.error.code) {
					case 1:
						// 'MEDIA_ERR_ABORTED : 1, Media data download is stopped by the user'
						console.log("MEDIA_ERR_ABORTED: 1, Media data download is stopped by the user");
						break;

					case 2:
						// 'MEDIA_ERR_NETWORK : 2, Download stopped due to network error'
						console.log("MEDIA_ERR_NETWORK: 2, Download stopped due to network error");
						break;

					case 3:
						// 'MEDIA_ERR_DECODE : 3, Media data decoding failure'
						console.log("MEDIA_ERR_DECODE: 3, Media data decoding failure");
						break;

					case 4:
						// 'MEDIA_ERR_SRC_NOT_SUPPORTED : 4, Format not supported'
						console.log("MEDIA_ERR_SRC_NOT_SUPPORTED: 4, Format not supported");
						break;
				}
			}, false);
		}
	}
};
