const ACCESS_KEY = "94145170-a02c-430c-afd257165891-d3a1-44cf";
const LIBRARY_ID = 13766;

//http://rokuawgserver.ddns.net/ctv/channels/1/roku.xml

const OPTIONS = {
    method: "GET",
    headers: {
        Accept: "application/json",
        AccessKey: ACCESS_KEY
    }
};

let collections = [];
let channelXml;


function getChannelXML() {
    let promise = new Promise(function(resolve, reject) {
        getXML("http://rokuawgserver.ddns.net/ctv/channels/1/roku.xml", function (error, data) {
            if (error !== null) {
                console.log(error);
                reject(error);
            }
            else {
                console.log(data);
                resolve(data);
            }
        });
    });

    return promise;
}

function getCollectionList() {
    const url = `http://video.bunnycdn.com/library/${LIBRARY_ID}/collections??page=1&itemsPerPage=100&orderBy=date`;

    return new Promise(function (resolve, reject) {
        fetch(url, OPTIONS)
        .then((response) => {
            if (response.status >= 200 && response.status <= 299) {
                return response.json();
            } 
            else {
                throw Error(response.statusText);
            }
        })
        .then(response => {
            //console.log(response);
            collections = response.items;
            if (collections.length > 0) {
                getVideosInCollections();
            }
        })
        .catch(err => console.error(err));
    });
}


function getVideosInCollections() {
    let promises = [];

    collections.forEach(collection => {
        const _guid = collection.guid;
        const _url = `http://video.bunnycdn.com/library/${LIBRARY_ID}/videos?page=1&itemsPerPage=100&collection=${_guid}&orderBy=date`;

        promises.push(tryAtMost(5, function(resolve, reject) {
            fetch(_url, OPTIONS)
            .then((response) => {
                if (response.status >= 200 && response.status <= 299) {
                    return response.json();
                } 
                else {
                    throw Error(response.statusText);
                }
            })
            .then(response => resolve(response))
            .catch(err => {
                console.error(err);
                reject(err);
            });
        }));
    });

    Promise.allSettled(promises).then(function(results) {
        results.forEach((res, index) => {
            if (res.status == "fulfilled") {
                collections[index].videos = res.value.items;
            }
        });
        console.log(collections);

        getChannelXML().then(function(xmlData) {
            console.log(xmlData);

            document.getElementById("splash-screen").classList.add("hidden");
            document.getElementById("collections-screen").classList.remove("hidden");
            buildCollectionsScreen();
        });

        /* document.getElementById("splash-screen").classList.add("hidden");
        document.getElementById("collections-screen").classList.remove("hidden");
        buildCollectionsScreen(); */
    });
}


function tryAtMost(triesLeft, executor) {
    if (triesLeft < 5) {
        console.log("trying, tries left: " + triesLeft);
    }
    --triesLeft;
    return new Promise(executor)
        .catch(err => triesLeft > 0 ? tryAtMost(triesLeft, executor) : Promise.reject(err));
}


// Polyfill for Promise.allSettled
if (!Promise.allSettled) {
	const rejectHandler = reason => ({ status: "rejected", reason });
	const resolveHandler = value => ({ status: "fulfilled", value });

	Promise.allSettled = function(promises) {
		const convertedPromises = promises.map(p => Promise.resolve(p).then(resolveHandler, rejectHandler));
		return Promise.all(convertedPromises);
	};
}


function getXML(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onload = function () {
		if (xhr.status === 200) {
			callback(null, xhr.response);
		}
		else {
			callback(xhr.status, xhr.responseText);
		}
	};
	xhr.send();
}