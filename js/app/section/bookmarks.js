"use strict";

var React = require('react'),
    _ = require('lodash'),
    LoadJSON = require('./../utils/mixins').LoadJSON,
    PureRenderMixin = require('react-addons-pure-render-mixin'),
    TimeAgo = require('react-timeago').default;

var config = require('./../config/env.json')[process.env.NODE_ENV || 'development'],
    bookmarksCfg = {
      "searchHeader": {
          "Accept" : "application/json; charset=utf-8",
          "Content-Type": "application/javascript; charset=utf-8",
          "Access-Control-Allow-Origin" : "*"
        },
      "searchTimeout": 5000
    };

var Tag = React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
    text: React.PropTypes.string,
    key: React.PropTypes.number
  },
  getDefaultProps: function() {
    return {
      text: '',
      key: 0
    };
  },
  render: function() {
    return (
        <span className="tag">{this.props.text}</span>
    );
  }
});

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
    //console.log("item", this.props.item);
    var item = this.props.item,
        tagsContent = [],
        data = {
          title: _.get(this.props, ['item', 'title'], ''),
          url: _.get(this.props, ['item', 'url'], ''),
          favicon: _.get(this.props, ['item', 'favicon'], ''),
          text: _.get(this.props, ['item', 'text'], ''),
          time: _.get(this.props, ['item', 'time'], ''),
          _description: _.get(this.props, ['item', '_description'], ''),
          _text: _.get(this.props, ['item', '_text'], ''),
          _image: _.get(this.props, ['item', '_image'], ''),
          _tags: _.get(this.props, ['item', '_tags'], []),
        },
        getCurrTime = new Date(data.time*1000);

    if (data._tags.length > 0) {
      data._tags.forEach(function(tag, index) {
        if (index < 3) {
          tagsContent.push(<Tag text={tag} key={index} />);
        }
      });
    }

    var leftCls = data._image ? 'left' : 'left-clean';

    return (
      <div id={this.props.item.bookmark_id} className="search-item">
        <div className={leftCls}>
          <span className="titleCont">
            <a target="_blank" href={data.url}>
              <span className="favicon" >{ data.favicon && <img width="16" height="16" src={data.favicon} /> }</span>
              <span className="title">{data.title && data.title}</span>
            </a>
          </span>
          <div className="description">
            {
              (data._description && data._description) ||
              (data._text && data._text)
            }
          </div>
            {tagsContent}
            <div className="date">added <TimeAgo date={getCurrTime} /></div>
        </div>

        { data._image &&
          <div className="right">
              <div className="img">
                <img width="80" height="80" src={data._image} />
              </div>
          </div> }
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
        api = config.INSTAPAPER.TYPE + "://" + config.INSTAPAPER.DOMAIN + ":" + config.INSTAPAPER.PORT + "/" + config.INSTAPAPER.PATH;

    $.ajax({
      type: 'GET',
      url: api,
      contentType: "application/json",
      headers: bookmarksCfg.searchHeader,
      timeout: bookmarksCfg.searchTimeout
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
