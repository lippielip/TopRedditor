function fetchSubreddits (query) {
	return new Promise(function (resolve, reject) {
		fetch(`https://www.reddit.com/api/subreddit_autocomplete.json?include_over_18=true&include_profiles=false&query=${query}`)
			.then((response) => response.json())
			.then((data) => {
				resolve(data);
			});
	});
}
module.exports = fetchSubreddits;
