import React from 'react';
import Options from './options';
import showdown from 'showdown';
// html converter to correctly display comments with markdown formatting
let converter = new showdown.Converter();
// counter for going through posts
let postNumber = 0;
// object for storing 25 posts
let posts;
// object for storing comments of one post
let comments;
// object where top comment gets formatted with html
let html;
// variable for the image timeout function => gets reset when saving options
let imageTimeout;
let errorTimeout;
// list for keeping track of running timeouts
let timeoutList = [];
// DOM element for images/videos/gif.....
let content = document.createElement('img');
// Reddit Api only gives back 25 posts at once and uses after/before strings to access more content
// after starts off empty and gets a new after every 25 posts
let after = null;

class App extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			post: '',
			// current scroll options
			options: {
				subreddit: 'dankmemes',
				time: 'now',
				sort_category: 'new',
				// duration in minutes
				image_duration: 0.2
			},
			// object for caching options before actually committing them
			newOptions: {
				subreddit: '',
				time: '',
				sort_category: '',
				image_duration: ''
			}
		};
		this.getNewImage = this.getNewImage.bind(this);
		this.changeOptionState = this.changeOptionState.bind(this);
		this.toggleCollapse = this.toggleCollapse.bind(this);
	}
	// main function for getting new images / content
	async getNewImage () {
		// clear last timeout so id does not happen again
		clearTimeout(timeoutList[0]);
		// remove timeout from the timeoutList
		timeoutList.pop();
		// assign content element to a variable => used to append content as children
		let contentDiv = document.getElementById('contentDiv');
		//reset Error message in case it exists
		try {
			//fetch todays top memes from dank memes when the postNumber is 0 i.e get a new page every 25 posts
			if (postNumber === 0) {
				await fetch(`https://www.reddit.com/r/${this.state.options.subreddit}/${this.state.options.sort_category}.json?t=${this.state.options.time}&after=${after}`)
					.then((response) => response.json())
					// overwrite posts object with new content
					.then((data) => (posts = data.data));
			}
			// fetch the commments from the current post
			await fetch(`https://www.reddit.com/${posts.children[postNumber].data.permalink}.json`)
				.then((response) => response.json())
				//save comments in comments
				.then((data) => (comments = data[1].data.children));
			try {
				html = converter.makeHtml(comments[1].data.body);
			} catch (error) {
				html = '';
			}
			this.setState({
				post: posts.children[postNumber].data
			});
			// remove old element to allow other types of content WIP => videos and text not working yet
			content.remove();
			// decide what kind of element to append to the contentDiv
			if (this.state.post.post_hint === 'image') {
				content = document.createElement('img');
				content.className = 'App-content';
				content.src = await this.state.post.url;
			}

			if (this.state.post.post_hint.includes('video')) {
				content = document.createElement('h1');
				content.className = 'App-content';
				content.innerText = '*Videos are currently not supported.*';
			} else {
				if (this.state.post.post_hint !== 'image') {
					content = document.createElement('h1');
					content.className = 'App-content';
					content.innerHTML = await this.state.post.url;
				}
			}
			contentDiv.appendChild(content);
			document.getElementById('topComment').innerHTML = html;

			if (postNumber >= 24) {
				after = posts.after;
				postNumber = 0;
			} else {
				postNumber++;
			}
			document.getElementById('errorDiv').innerHTML = '';
			timeoutList.push((imageTimeout = setTimeout(this.getNewImage, this.state.options.image_duration * 60000)));
		} catch (error) {
			//reset posts on error
			postNumber = 0;
			after = null;
			document.getElementById('errorDiv').innerHTML = 'Error fetching posts (Check Connection and Subreddit input). Retrying...';
			// 10 second timeout in case an error occured
			timeoutList.push((errorTimeout = setTimeout(this.getNewImage, 10000)));
		}
	}

	//get values from options file and insert them in state
	changeOptionState (options) {
		this.setState({ newOptions: options });
	}

	async toggleCollapse (e) {
		//when collapse is closed and settings have changed =>  save changes
		if (e.target.attributes[4].nodeValue === 'false' && JSON.stringify(this.state.options) !== JSON.stringify(this.state.newOptions)) {
			// create deep copy of state
			// this is required because directly assigning newOptions would just make options point to newOptions instead of copying the attributes
			let newOptionCopy = JSON.parse(JSON.stringify(this.state.newOptions));
			// set new options
			this.setState({ options: await newOptionCopy });
			// reset currently running slideshow timer ..... seems to not clear correctly every time => added await for testing... seems to work for now
			clearTimeout(imageTimeout);
			clearTimeout(errorTimeout);
			// reset postnumber
			postNumber = 0;
			// reset pagination
			after = null;
			// run page getter loop again
			await this.getNewImage();
		}
	}

	async componentDidMount () {
		// start fetching images
		await this.getNewImage();
	}

	render () {
		return (
			<div className="App">
				<header className="App-header">
					<button
						className="btn btn-primary"
						type="button"
						data-toggle="collapse"
						data-target="#optionCollapse"
						aria-expanded="false"
						aria-controls="optionCollapse"
						onClick={this.toggleCollapse}>
						Options
					</button>
					<Options changeOptionState={this.changeOptionState} submittedOptions={this.state.options} />
					<h2 className="App-spacer">{this.state.post.title}</h2>
				</header>
				<div className="App-body">
					<div id="contentDiv" className="App-body" />
					<div id="topComment" className="App-spacer" />
					<div id="errorDiv" className="App-spacer" />
				</div>
			</div>
		);
	}
}

export default App;
