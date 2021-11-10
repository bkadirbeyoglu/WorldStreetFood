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
            getCollections();
        }
    })
    .catch(err => console.error(err));
}


function getCollections() {
    let promises = [];

    collections.forEach(collection => {

    })
}


