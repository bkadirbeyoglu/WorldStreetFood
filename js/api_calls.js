const ACCESS_KEY = "94145170-a02c-430c-afd257165891-d3a1-44cf";
const LIBRARY_ID = 13766;

const options = {
    method: "GET",
    headers: {
        Accept: "application/json",
        AccessKey: ACCESS_KEY
    }
};

// Get collections
function getCollections() {
    const url = `http://video.bunnycdn.com/library/${LIBRARY_ID}/collections`;

    fetch(url, options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));
}


