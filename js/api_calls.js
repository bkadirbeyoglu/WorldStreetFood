const ACCESS_KEY = "94145170-a02c-430c-afd257165891-d3a1-44cf";
const LIBRARY_ID = 13766;

const OPTIONS = {
    method: "GET",
    headers: {
        Accept: "application/json",
        AccessKey: ACCESS_KEY
    }
};

let collections = [];


function getCollectionList() {
    const url = `http://video.bunnycdn.com/library/${LIBRARY_ID}/collections??page=1&itemsPerPage=100&orderBy=date`;

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
        //console.log(collections);

        document.getElementById("splash-screen").classList.add("hidden");
        document.getElementById("collections-screen").classList.remove("hidden");
        buildCollectionsScreen();
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
