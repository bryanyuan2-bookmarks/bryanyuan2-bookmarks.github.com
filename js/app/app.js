"use strict";

/* require */
var React = require('react'),
    ReactDOM = require('react-dom'),
    ReactRouter = require('react-router'),
    Router = ReactRouter.Router,
    Route = ReactRouter.Route,
    IndexRoute = require('react-router').IndexRoute,
    browserHistory = require('react-router/lib/browserHistory');

/* section */
var CompBookmarks = require('./section/bookmarks');

var App = React.createClass({
  render: function () {
    return (
      <div className="container">
        <h1 className="set-title">bryanyuan2 bookmarks | 技術書籤</h1>
        <CompBookmarks />
      </div>
    );
  }
});

var routes = (
  <Route path='/'>
    <IndexRoute component={App} />
  </Route>
);

ReactDOM.render(<Router history={browserHistory}>{routes}</Router>, document.getElementById('container'));