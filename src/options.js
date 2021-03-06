import React from 'react';
import fetchSubreddits from './fetchSubreddits';
import autocomplete from './autocomplete';

let subreddits = [];

class Options extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			option : {
				subreddit      : this.props.submittedOptions.subreddit,
				time           : this.props.submittedOptions.time,
				sort_category  : this.props.submittedOptions.sort_category,
				image_duration : this.props.submittedOptions.image_duration
			}
		};
		this.changeOptions = this.changeOptions.bind(this);
	}

	changeOptions = async (e) => {
		subreddits = [];
		let optionCopy = this.state.option;
		if (e.target.type === 'submit') {
			optionCopy[e.target.parentNode.attributes.category.nodeValue] = e.target.value;
			this.setState({ option: optionCopy });
		} else {
			optionCopy[e.target.attributes.category.nodeValue] = e.target.value;
			this.setState({ option: optionCopy });
		}
		this.props.changeOptionState(this.state.option);

		if (e.target.type === 'submit') {
			document.getElementById(e.target.parentNode.attributes.category.nodeValue).innerText = e.target.value;
		}

		if (e.target.type === 'range') {
			if (e.target.value < 1) {
				document.getElementById('sliderValue').innerText = 'Interval: ' + e.target.value * 60 + 'sec';
			} else {
				document.getElementById('sliderValue').innerText = 'Interval: ' + e.target.value + 'min';
			}
		}
		if (e.target.type === 'text') {
			let subreddit = e.target.value;
			let subredditObject = await fetchSubreddits(subreddit);
			let keys = Object.keys(subredditObject.subreddits);
			for (const key of keys) {
				subreddits.push(subredditObject.subreddits[key].name);
			}
		}
		autocomplete(document.getElementById('autofillInput'), subreddits);
	};

	componentDidMount() {
		this.props.changeOptionState(this.state.option);
		document.getElementById('time').innerHTML = this.props.submittedOptions.time;
		document.getElementById('sort_category').innerHTML = this.props.submittedOptions.sort_category;
		if (this.props.submittedOptions.image_duration < 1) {
			document.getElementById('sliderValue').innerText = 'Interval: ' + this.props.submittedOptions.image_duration * 60 + 'sec';
		} else {
			document.getElementById('sliderValue').innerText = 'Interval: ' + this.props.submittedOptions.image_duration + 'min';
		}
	}

	render() {
		return (
			<div className="collapse" id="optionCollapse">
				<div className="card card-body bg-dark">
					<div className="App-options">
						<div className="autocomplete">
							<input
								type="text"
								className="form-control App-spacer"
								id="autofillInput"
								category="subreddit"
								placeholder={this.props.submittedOptions.subreddit}
								aria-label="Subreddit"
								onChange={this.changeOptions}
							/>
						</div>
						<div className="row justifyEvenly">
							<div className="dropdown App-spacer row">
								<div className="rightMargin20">Time: </div>
								<button className="btn btn-secondary dropdown-toggle" type="button" id="time" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
									Sort posts by time
								</button>
								<div className="dropdown-menu" category="time" aria-labelledby="time">
									<button className="dropdown-item" onClick={this.changeOptions} value="now">
										now
									</button>
									<button className="dropdown-item" onClick={this.changeOptions} value="day">
										day
									</button>
									<button className="dropdown-item" onClick={this.changeOptions} value="week">
										week
									</button>
									<button className="dropdown-item" onClick={this.changeOptions} value="month">
										month
									</button>
									<button className="dropdown-item" onClick={this.changeOptions} value="year">
										year
									</button>
									<button className="dropdown-item" onClick={this.changeOptions} value="all">
										all
									</button>
								</div>
							</div>
							<div className="dropdown App-spacer row">
								<div className="rightMargin20">Category: </div>
								<button
									className="btn btn-secondary dropdown-toggle"
									type="button"
									id="sort_category"
									data-toggle="dropdown"
									aria-haspopup="true"
									aria-expanded="false"
								>
									Sort posts by category
								</button>
								<div className="dropdown-menu" category="sort_category" aria-labelledby="sort_category">
									<button className="dropdown-item" onClick={this.changeOptions} value="new">
										new
									</button>
									<button className="dropdown-item" onClick={this.changeOptions} value="top">
										top
									</button>
									<button className="dropdown-item" onClick={this.changeOptions} value="rising">
										rising
									</button>
									<button className="dropdown-item" onClick={this.changeOptions} value="hot">
										hot
									</button>
								</div>
							</div>
						</div>
						<div className="slidecontainer col">
							<input
								type="range"
								min="0.05"
								step="0.05"
								max="60"
								defaultValue={this.props.submittedOptions.image_duration}
								className="slider"
								id="duration"
								category="image_duration"
								onChange={this.changeOptions}
							/>
							<div className="col">
								<label id="sliderValue" />
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Options;
