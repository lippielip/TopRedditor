import React from 'react';
import './App.css';
import showdown from 'showdown'
let converter = new showdown.Converter();
let randomNum;
let posts;
let comments;
let html;

/**************************/ 
/*****User Variables******/

let subreddit= "dankmemes";
let time = "week";

/**************************/


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      post: '',
      topComment:'',
    };
    this.getNewImage = this.getNewImage.bind(this);
  }

  async getNewImage() {
    document.getElementById("errorDiv").innerHTML=""
    try {
      //fetch todays top memes from dank memes
      await fetch(`https://www.reddit.com/r/${subreddit}/top.json?t=${time}`)
        .then(response => response.json())
        .then(data => posts = data.data.children );
        randomNum = Math.floor(Math.random() * posts.length);
      await fetch(`https://www.reddit.com/${posts[randomNum].data.permalink}.json`)
        .then(response => response.json())
        .then(data => comments = data[1].data.children);
      try{
        html = converter.makeHtml(comments[1].data.body)
      } catch(error){
        html = ""
      }
      this.setState({
        topComment : html,
        post: posts[randomNum].data
      });
      document.getElementById("topComment").innerHTML= html

      setTimeout(() => {
        this.getNewImage();
      }, 30000);
    } catch (error) {
      document.getElementById("errorDiv").innerHTML="Error fetching posts. Retrying..."
      setTimeout(() => {
        this.getNewImage();
      }, 10000);
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