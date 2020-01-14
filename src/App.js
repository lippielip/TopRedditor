import React from 'react';
import './App.css';
import showdown from 'showdown'
let converter = new showdown.Converter();
let randomNum;
let posts;
let comments;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      post: '',
      topComment:'',
      isLoading:false,
    };
    this.getNewImage = this.getNewImage.bind(this);
  }
  async getNewImage() {
    try {
      document.getElementById("errorDiv").innerHTML=""
      randomNum = Math.floor(Math.random() * 25);
      //fetch todays top memes from dank memes
      await fetch(`https://www.reddit.com/r/dankmemes/top.json?t=day`)
        .then(response => response.json())
        .then(data => posts = data.data.children );

      await fetch(`https://www.reddit.com/${posts[randomNum].data.permalink}.json`)
        .then(response => response.json())
        .then(data => comments = data[1].data.children);
        let html = converter.makeHtml(comments[randomNum].data.body)
        this.setState({
          topComment : html,
          post: posts[randomNum].data});
          document.getElementById("topComment").innerHTML= html
      setTimeout(() => {
        this.getNewImage();
      }, 9000);
    } catch (error) {
      console.dir(error)
      document.getElementById("errorDiv").innerHTML="No connection. Retrying..."
      setTimeout(() => {
        this.getNewImage();
      }, 60000);
    }
  }

  async componentDidMount() {
    await this.getNewImage();
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>{this.state.post.title}</h2>
        </div>
        <div className="App-body">
        <img src={this.state.post.url} className="App-content" alt="" />
        <div id="topComment" />
        <div id="errorDiv" />
        </div>

      </div>
    );
  }
}

export default App;