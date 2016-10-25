"use strict";

var React = require('react'),
    _ = require('lodash'),
    LoadJSON = require('./../utils/mixins').LoadJSON,
    PureRenderMixin = require('react-addons-pure-render-mixin'),
    TimeAgo = require('react-timeago').default,
    Debounce = require('react-throttle').Debounce;

var config = require('./../config/env.json')[process.env.NODE_ENV || 'development'],
    bookmarksCfg = {
      "searchHeader": {
          "Accept" : "application/json; charset=utf-8",
          "Content-Type": "application/javascript; charset=utf-8",
          "Access-Control-Allow-Origin" : "*"
        },
      "searchTimeout": 5000
    },
    INSTAPAPER_LIST_API = config.INSTAPAPER.TYPE + "://" +
              config.INSTAPAPER.DOMAIN + ":" +
              config.INSTAPAPER.PORT + "/" +
              config.INSTAPAPER.PATH,
    INSTAPAPER_QUERY_API = config.INSTAPAPER.TYPE + "://" +
              config.INSTAPAPER.DOMAIN + ":" +
              config.INSTAPAPER.PORT + "/" +
              config.INSTAPAPER.SEARCH + "/",
    INSTAPAPER_COUNT_API = config.INSTAPAPER.TYPE + "://" +
              config.INSTAPAPER.DOMAIN + ":" +
              config.INSTAPAPER.PORT + "/" +
              config.INSTAPAPER.COUNT + "/",
    INSTAPAPER_LATEST_API = config.INSTAPAPER.TYPE + "://" +
              config.INSTAPAPER.DOMAIN + ":" +
              config.INSTAPAPER.PORT + "/" +
              config.INSTAPAPER.LATEST + "/",
    trans = {
      zrp: "No bookmarks found ! please try other query",
      loading: "Loading bookmarks ...",
      searchBoxPlaceHolder: "Search bookmarks here ...",
      backToGithub: "Back to bryanyuan2 Github Page"
    };

var SearchBox = React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
  },
  getDefaultProps: function() {
    return {
    };
  },
  getInitialState: function() {
    return {
      input: ''
    };
  },
  updateShared: function(query){
    this.props.updateShared(query);
  },
  componentWillUpdate: function(nextProps, nextState) {
    // console.log("componentWillUpdate nextState.input", nextState.input);
    this.updateShared(nextState.input);
  },
  handleChange: function(e) {
    var query = e.target.value ? e.target.value : '';
    this.setState({
      input: query
    });
  },
  render: function() {

     return (
        <div>
          <Debounce time="400" handler="onChange">
            <input className="search-box" type="text" name="search" onChange={this.handleChange} placeholder={trans.searchBoxPlaceHolder} />
          </Debounce>        
        </div>
    );
  }
});


var ZRP = React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
  },
  getDefaultProps: function() {
    return {
    };
  },
  render: function() {
    return (
        <span className="search-item zrp">
          {trans.zrp}
        </span>
    );
  }
});

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
    // console.log("item", this.props.item);
    var tagsContent = [],
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
        getCurrTime = new Date(data.time*1000),
        leftCls = data._image ? 'left' : 'left-clean';

    if (data._tags.length > 0) {
      data._tags.forEach(function(tag, index) {
        if (index < 3) {
          tagsContent.push(<Tag text={tag} key={index} />);
        }
      });
    }

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


var BookmarkStatusCount = React.createClass({
  mixins: [PureRenderMixin],
  getInitialState: function() {
    return {
      count: 0
    };
  },
  componentWillMount: function() {
    var that = this;
    $.ajax({
      type: 'GET',
      url: INSTAPAPER_COUNT_API,
      contentType: "application/json",
      headers: bookmarksCfg.searchHeader,
      timeout: bookmarksCfg.searchTimeout
    }).done(function( data ) {
      var output = $.parseJSON(data);
      that.setState({
        count: output[0].count
      });
    });
  },
  render: function() {
    var count = this.state.count;
    return (
        <div className="bookmarksInfo">
          <div>
            <span className="hint-count">Total bookmarks: </span>
            <span className="count">{count}</span>
          </div>
        </div>
    );
  }
});


var BookmarkStatusUpdate = React.createClass({
  mixins: [PureRenderMixin],
  getInitialState: function() {
    return {
      time: 0
    };
  },
  componentWillMount: function() {
    var that = this;
    $.ajax({
      type: 'GET',
      url: INSTAPAPER_LATEST_API,
      contentType: "application/json",
      headers: bookmarksCfg.searchHeader,
      timeout: bookmarksCfg.searchTimeout
    }).done(function( data ) {
      that.setState({
        time: data[0].time
      });
    });
  },
  render: function() {
    var time = this.state.time,
        getCurrTime = new Date(time*1000);

    return (
        <div className="bookmarksInfo">
          <div>
            <span className="hint-count">Latest update: </span>
            <span className="count"><TimeAgo date={getCurrTime} /></span>
          </div>
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
  getDefaultProps: function() {
      return {
          sharedQuery: ''  
      };
  },
  updateShared: function(){
    // this.props.updateShared();
  },
  componentWillMount: function() {
    // console.log("this.props.sharedQuery", this.props.sharedQuery);
    var that = this;

    $.ajax({
      type: 'GET',
      url: INSTAPAPER_LIST_API,
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
  componentWillReceiveProps: function(nextProps) {
    // console.log("componentWillUpdate sharedQuery", nextProps.sharedQuery);
    var that = this,
        api;

    if (nextProps.sharedQuery) {
      api = INSTAPAPER_QUERY_API + nextProps.sharedQuery;
    } else {
      api = INSTAPAPER_LIST_API;
    }

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
  render: function() {
    var targetData = this.state.data,
        bookmark,
        bookmarksCls;

    if (this.state.load === true) {
      bookmark = [];
      bookmarksCls = "bookmarks";

      if (targetData.result !== "0" && targetData.result !== "error") {
        targetData.forEach(function(item, index) {
          bookmark.push(<Bookmark item={item} key={index} />);
        });
      } else {
        bookmark.push(<ZRP />);
      }
    } else {
      bookmark = trans.loading;
      bookmarksCls = "bookmarks loading";
    }

    return (
        <div>
          <div className="bookmarks-hint">This is my bookmarks index which is powered by Instapaper API, MondgoDB, Expressjs and ReactJS. Please feel free and grab some articles if you like it.</div>
          <div className={bookmarksCls}>
            {bookmark}
          </div>
        </div>
      );

  }
});

var BookmarksContainer = React.createClass({
  mixins: [LoadJSON],
  updateShared: function(sharedQuery){
    this.setState({
      sharedQuery: sharedQuery
    });
  },
  render: function() {
    return(
      <div>
        <div className="bookmarkHeaderCont">
          <SearchBox updateShared={this.updateShared} />
          <div className="bookmarksAlert alert alert-success" role="alert">
            <BookmarkStatusCount />
            <BookmarkStatusUpdate />
          </div>
        </div>
        <BookmarksSync sharedQuery={this.state.sharedQuery} />
        <div id="back-to-nav">
          <a target="_blank" href="http://bryanyuan2.github.io">
            <img className="github-img" src="asserts/images/tech/github.png" alt={trans.backToGithub} />
            <div className="github-text">{trans.backToGithub}</div>
          </a>
        </div>
      </div>
    );
  }
});


module.exports = BookmarksContainer;
