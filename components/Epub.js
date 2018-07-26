var _jsxFileName="/Users/johanpoirier/workspace/tea/epubjs-rn/src/Epub.js";var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _react=require("react");var _react2=_interopRequireDefault(_react);var _reactNative=require("react-native");var _reactNativeOrientation=require("react-native-orientation");var _reactNativeOrientation2=_interopRequireDefault(_reactNativeOrientation);var _rnFetchBlob=require("rn-fetch-blob");var _rnFetchBlob2=_interopRequireDefault(_rnFetchBlob);var _epubjs=require("epubjs");var _epubjs2=_interopRequireDefault(_epubjs);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}if(!global.Blob){global.Blob=_rnFetchBlob2.default.polyfill.Blob;}global.JSZip=global.JSZip||require("jszip");global.URL=require("epubjs/libs/url/url-polyfill.js");if(!global.btoa){global.btoa=require("base-64").encode;}var Rendition=require("./Rendition");var Epub=function(_Component){_inherits(Epub,_Component);function Epub(props){_classCallCheck(this,Epub);var _this=_possibleConstructorReturn(this,(Epub.__proto__||Object.getPrototypeOf(Epub)).call(this,props));var bounds=_reactNative.Dimensions.get("window");_this.state={toc:[],show:false,width:bounds.width,height:bounds.height,orientation:"PORTRAIT"};return _this;}_createClass(Epub,[{key:"componentDidMount",value:function componentDidMount(){this.active=true;this._isMounted=true;_reactNative.AppState.addEventListener('change',this._handleAppStateChange.bind(this));_reactNativeOrientation2.default.addSpecificOrientationListener(this._orientationDidChange.bind(this));var orientation=_reactNativeOrientation2.default.getInitialOrientation();if(orientation&&(orientation==="PORTRAITUPSIDEDOWN"||orientation==="UNKNOWN")){orientation="PORTRAIT";this.setState({orientation:orientation});}else if(orientation){this.setState({orientation:orientation});}else if(orientation===null){orientation=this.state.width>this.state.height?"LANDSCAPE":"PORTRAIT";this.setState({orientation:orientation});}if(this.props.src){this._loadBook(this.props.src);}}},{key:"componentWillUnmount",value:function componentWillUnmount(){this._isMounted=false;_reactNative.AppState.removeEventListener('change',this._handleAppStateChange);_reactNativeOrientation2.default.removeSpecificOrientationListener(this._orientationDidChange);clearTimeout(this.orientationTimeout);this.destroy();}},{key:"shouldComponentUpdate",value:function shouldComponentUpdate(nextProps,nextState){if(nextState.show!==this.state.show){return true;}if(nextProps.width!==this.props.width||nextProps.height!==this.props.height){return true;}if(nextState.width!==this.state.width||nextState.height!==this.state.height){return true;}if(nextProps.color!=this.props.color){return true;}if(nextProps.backgroundColor!=this.props.backgroundColor){return true;}if(nextProps.size!=this.props.size){return true;}if(nextProps.flow!=this.props.flow){return true;}if(nextProps.origin!=this.props.origin){return true;}if(nextProps.orientation!=this.props.orientation){return true;}if(nextProps.src!=this.props.src){return true;}if(nextProps.onPress!=this.props.onPress){return true;}if(nextProps.onLongPress!=this.props.onLongPress){return true;}if(nextProps.stylesheet!=this.props.stylesheet){return true;}if(nextProps.javascript!=this.props.javascript){return true;}return false;}},{key:"componentWillUpdate",value:function componentWillUpdate(nextProps){if(nextProps.src!==this.props.src){this.destroy();}}},{key:"componentDidUpdate",value:function componentDidUpdate(prevProps){if(prevProps.src!==this.props.src){this._loadBook(this.props.src);}else if(prevProps.orientation!==this.props.orientation){_orientationDidChange(this.props.orientation);}}},{key:"_orientationDidChange",value:function _orientationDidChange(orientation){var wait=10;var _orientation=orientation;if(!this.active||!this._isMounted)return;if(orientation==="PORTRAITUPSIDEDOWN"||orientation==="UNKNOWN"){_orientation="PORTRAIT";}if(orientation==="LANDSCAPE-RIGHT"||orientation==="LANDSCAPE-LEFT"){_orientation="LANDSCAPE";}if(this.state.orientation===_orientation){return;}__DEV__&&console.log("[Epub] orientation",_orientation);this.setState({orientation:_orientation});this.props.onOrientationChanged&&this.props.onOrientationChanged(_orientation);}},{key:"_loadBook",value:function _loadBook(bookUrl){__DEV__&&console.log("[Epub] loading book: ",bookUrl);return this._openBook(bookUrl);}},{key:"_openBook",value:function _openBook(bookUrl,useBase64){var _this2=this;if(!this.rendition){this.needsOpen=[bookUrl,useBase64];return;}(0,_epubjs2.default)(bookUrl).then(function(book){_this2.book=book;_this2.ePub=window.Epub;}).then(function(){_this2.ePub.ready.then(function(){_this2.isReady=true;_this2.props.onReady&&_this2.props.onReady(_this2.book);});_this2.ePub.opened.then(function(book){if(!_this2.active||!_this2._isMounted)return;_this2.setState({toc:book.navigation.toc});_this2.props.onNavigationReady&&_this2.props.onNavigationReady(book.navigation.toc);});});}},{key:"loadLocations",value:function loadLocations(){var _this3=this;return this.ePub.ready.then(function(){var key=_this3.book.key()+"-locations";return _reactNative.AsyncStorage.getItem(key).then(function(stored){if(_this3.props.regenerateLocations!=true&&stored!==null){return _this3.book.locations=stored;}else{return _this3.book.generateLocations(_this3.props.locationsCharBreak||600).then(function(locations){_this3.book.locations=locations;_reactNative.AsyncStorage.setItem(key,locations);return locations;});}});});}},{key:"onRelocated",value:function onRelocated(visibleLocation){this._visibleLocation=visibleLocation;if(this.props.onLocationChange){this.props.onLocationChange(visibleLocation);}}},{key:"visibleLocation",value:function visibleLocation(){return this._visibleLocation;}},{key:"getRange",value:function getRange(cfi){return this.book.getRange(cfi);}},{key:"_handleAppStateChange",value:function _handleAppStateChange(appState){if(appState==="active"){this.active=true;}if(appState==="background"){this.active=false;}if(appState==="inactive"){this.active=false;}}},{key:"destroy",value:function destroy(){if(this.book){this.book.destroy();}}},{key:"render",value:function render(){var _this4=this;return _react2.default.createElement(Rendition,{ref:function ref(r){_this4.rendition=r;if(_this4.needsOpen){_this4._openBook.apply(_this4,_this4.needsOpen);_this4.needsOpen=undefined;}},url:this.props.src,flow:this.props.flow,minSpreadWidth:this.props.minSpreadWidth,stylesheet:this.props.stylesheet,webviewStylesheet:this.props.webviewStylesheet,script:this.props.script,onSelected:this.props.onSelected,onMarkClicked:this.props.onMarkClicked,onPress:this.props.onPress,onLongPress:this.props.onLongPress,onViewAdded:this.props.onViewAdded,beforeViewRemoved:this.props.beforeViewRemoved,themes:this.props.themes,theme:this.props.theme,fontSize:this.props.fontSize,font:this.props.font,display:this.props.location,onRelocated:this.onRelocated.bind(this),orientation:this.state.orientation,backgroundColor:this.props.backgroundColor,onError:this.props.onError,onDisplayed:this.props.onDisplayed,__source:{fileName:_jsxFileName,lineNumber:287}});}}]);return Epub;}(_react.Component);module.exports=Epub;