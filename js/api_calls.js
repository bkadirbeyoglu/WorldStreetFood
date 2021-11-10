const accessKey = "94145170-a02c-430c-afd257165891-d3a1-44cf";
const libraryId = 13766;

const options = {
    method: 'GET',
    headers: {
        Accept: 'application/json',
        AccessKey: '94145170-a02c-430c-afd257165891-d3a1-44cf'
    }
};

// Get collections
function getCollections() {
    const url = `http://video.bunnycdn.com/library/${libraryId}/collections`;

    fetch(url, options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));
}


