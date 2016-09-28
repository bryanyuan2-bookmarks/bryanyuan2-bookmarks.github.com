"use strict";

var React = require('react'),
    LoadJSON = require('./../utils/mixins').LoadJSON,
    PureRenderMixin = require('react-addons-pure-render-mixin'),
    TimeAgo = require('react-timeago').default;

var config = require('./../config/env.json')[process.env.NODE_ENV || 'development'];

var Bookmark = React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
    item: React.PropTypes.object,
    key: React.PropTypes.number
  },
  getDefaultProps: function() {
    return {
      item: {},
      key: 0
    };
  },
  render: function() {
    console.log("item", this.props.item);
    var date = new Date(this.props.item.time*1000);
    return (
      <div className="search-item">
        <div className="title">{this.props.item.title && this.props.item.title}</div>
        <div className="description">{this.props.item.description && this.props.item.description}</div>
        <TimeAgo date={date} />
      </div>
    );
  }
});

var BookmarksSync = React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
  },
  getInitialState: function() {
    return {
      load: false,
      data: {}
    };
  },
  componentWillMount: function() {
    var that = this,
        api = "http://" + config.INSTAPAPER.DOMAIN + ":" + config.INSTAPAPER.PORT + "/" + config.INSTAPAPER.PATH;

    $.ajax({
      url: api,
      type:'get'
    }).done(function( data ) {
      that.setState({
        load: true,
        data: data
      });
    });
  },
  getDefaultProps: function() {
    return {
    };
  },
  render: function() {
    if (this.state.load === true) {
      var targetData = this.state.data,
          bookmark = [];
      targetData.forEach(function(item, index) {
        bookmark.push(<Bookmark item={item} key={index} />);
      });
      return (
        <div className="bookmarks">
          {bookmark}
        </div>
      );
    } else {
      return (
        <div className="bookmarks">loading</div>
      );
    }
  }
});

var BookmarksContainer = React.createClass({
  mixins: [LoadJSON],
  render: function() {
    return(
      <div>
        <BookmarksSync />
      </div>
    );
  }
});


module.exports = BookmarksContainer;
