/**
 * 
 */

var MainPanel = React.createClass({
  getInitialState: function() {
    return { is_logged_in: false };
  },
  render: function() {
    return (
      <div className="MainPanel">
        <TopPanel />
        <MiddlePanel />
        <LeftPanel />
        <RightPanel />
      </div>
    );
  }
});

var TopPanel = React.createClass({
  render: function() {
    return (
        <div className="TopPanel">
          <LoginPanel />
        </div>
    );
  }
});

var LoginPanel = React.createClass({
  render: function() {
    return (
        <div className="LoginPanel">
          <SignIn />
          <SignOut />
        </div>
    );
  }
});

// var SignIn = React.createClass({
//   getInitialState: function() {
//     return {is_logged_in: false, username: undefined};
//   },
//   onSignIn: function (googleUser) {
//     var id_token = googleUser.getAuthResponse().id_token;
//     var profile = googleUser.getBasicProfile();
//     // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
//     // console.log('Name: ' + profile.getName());
//     // console.log('Image URL: ' + profile.getImageUrl());
//     // console.log('Email: ' + profile.getEmail());
//
//     var xhr = new XMLHttpRequest();
//     xhr.open('POST', '/signin');
//     xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//     var username = profile.getName();
//     // this.setState({
//     //   is_logged_in: true,
//     //   username: username
//     // });
//     // console.log("name:" + profile.getName());
//     xhr.onload = function () {
//       // console.log('Signed in as: ' + xhr.responseText);
//       // console.log("id_token:", id_token);
//     };
//     xhr.send('idtoken=' + id_token);
//   },
//   componentDidMount: function() {
//     $.getScript('https://apis.google.com/js/platform.js')
//         .done(() => {
//           gapi.signin2.render('g-signin2', {
//             'scope': 'https://www.googleapis.com/auth/plus.login',
//             'width': 200,
//             'height': 50,
//             'longtitle': true,
//             'theme': 'dark',
//             'onsuccess': this.onSignIn
//           });
//         });
//   },
//   onSignOut: function() {
//     this.setState({
//       is_logged_in: false,
//       username: undefined
//     });
//   },
//   render: function() {
//     return (
//         <div className="g-signin2" data-onsuccess={this.onSignIn}></div>
//     );
//   }
// });

var SignIn = React.createClass({
  getInitialState: function() {
    return {is_logged_in: false, username: undefined};
  },
  onSignIn: function (googleUser) {
    var id_token = googleUser.getAuthResponse().id_token;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/signin');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    var profile = googleUser.getBasicProfile();
    console.log('Given Name 1: ' + profile.getGivenName());
    xhr.onload = function () {
      var profile = googleUser.getBasicProfile();
      console.log('Given Name 2: ' + profile.getGivenName());
    };
    xhr.send('idtoken=' + id_token);
  },
  componentDidMount: function() {
    $.getScript('https://apis.google.com/js/platform.js')
        .done(() => {
          initSigninV2();
          gapi.signin2.render('g-signin2', {
            'scope': 'https://www.googleapis.com/auth/plus.login',
            'width': 200,
            'height': 50,
            'longtitle': true,
            'theme': 'dark',
            'onsuccess': this.onSignIn
          });
        });
  },
  render: function() {
    return (
        <div className="g-signin2" onClick={this.onSignIn}/>
    );
  }
});

var SignOut = React.createClass({
  onSignOut: function() {
    auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
  },
  render: function() {
    return (
        <a onClick={this.onSignOut}>Sign out</a>
    );
  }
});

var LeftPanel = React.createClass({
  getInitialState: function() {
    return {};
  },
  render: function() {
    return (
      <div className="LeftPanel">
      </div>
    );
  }
});

var MiddlePanel = React.createClass({
  getInitialState: function() {
    return {};
  },
  render: function() {
    return (
        <div className="MiddlePanel">
          <CommentBox url="/api/comments" pollInterval={2000} />
        </div>
    );
  }
});

var RightPanel = React.createClass({
  getInitialState: function() {
    return {};
  },
  render: function() {
    return (
        <div className="RightPanel">
        </div>
    );
  }
});

var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    // Optimistically set an id on the new comment. It will be replaced by an
    // id generated by the server. In a production application you would likely
    // not use Date.now() for this and would have a more robust system in place.
    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment) {
      return (
        <Comment author={comment.author} key={comment.id}>
          {comment.text}
        </Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  getInitialState: function() {
    return {author: '', text: ''};
  },
  handleAuthorChange: function(e) {
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text});
    this.setState({author: '', text: ''});
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={this.state.author}
          onChange={this.handleAuthorChange}
        />
        <input
          type="text"
          placeholder="Say something..."
          value={this.state.text}
          onChange={this.handleTextChange}
        />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

var Comment = React.createClass({
  rawMarkup: function() {
    // console.log(this.props);
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return { __html: rawMarkup };
  },

  render: function() {
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
});

ReactDOM.render(
  <MainPanel />,
  document.getElementById('content')
);
