import React, {Component} from "react";

import {
    StyleSheet,
    View,
    ActivityIndicator,
    AsyncStorage,
    Dimensions,
    AppState,
    WebView
} from "react-native";

import Orientation from "react-native-orientation";

import RNFetchBlob from "rn-fetch-blob"

if (!global.Blob) {
    global.Blob = RNFetchBlob.polyfill.Blob;
}

global.JSZip = global.JSZip || require("jszip");

global.URL = require("epubjs/libs/url/url-polyfill.js");

if (!global.btoa) {
    global.btoa = require("base-64").encode;
}

import ePub from "epubjs";

const Rendition = require("./Rendition");

class Epub extends Component {

    constructor(props) {
        super(props);

        var bounds = Dimensions.get("window");

        this.state = {
            toc: [],
            show: false,
            width: bounds.width,
            height: bounds.height,
            orientation: "PORTRAIT"
        }

    }

    componentDidMount() {
        this.active = true;
        this._isMounted = true;
        AppState.addEventListener('change', this._handleAppStateChange.bind(this));

        Orientation.addSpecificOrientationListener(this._orientationDidChange.bind(this));
        let orientation = Orientation.getInitialOrientation();
        if (orientation && (orientation === "PORTRAITUPSIDEDOWN" || orientation === "UNKNOWN")) {
            orientation = "PORTRAIT";
            this.setState({orientation})
        } else if (orientation) {
            this.setState({orientation})
        } else if (orientation === null) {
            // Android starts as null
            orientation = this.state.width > this.state.height ? "LANDSCAPE" : "PORTRAIT";
            this.setState({orientation})
        }
        // __DEV__ && console.log("inital orientation", orientation, this.state.width, this.state.height)

        if (this.props.src) {
            this._loadBook(this.props.src);
        }
    }

    componentWillUnmount() {
        this._isMounted = false;

        AppState.removeEventListener('change', this._handleAppStateChange);
        Orientation.removeSpecificOrientationListener(this._orientationDidChange);
        clearTimeout(this.orientationTimeout);

        this.destroy();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.show !== this.state.show) {
            return true;
        }

        if ((nextProps.width !== this.props.width) ||
            (nextProps.height !== this.props.height)) {
            return true;
        }

        if ((nextState.width !== this.state.width) ||
            (nextState.height !== this.state.height)) {
            return true;
        }


        if (nextProps.color !== this.props.color) {
            return true;
        }

        if (nextProps.backgroundColor !== this.props.backgroundColor) {
            return true;
        }

        if (nextProps.fontSize !== this.props.fontSize) {
            return true;
        }

        if (nextProps.flow !== this.props.flow) {
            return true;
        }

        if (nextProps.origin !== this.props.origin) {
            return true;
        }

        if (nextProps.orientation !== this.props.orientation) {
            return true;
        }

        if (nextProps.src !== this.props.src) {
            return true;
        }

        if (nextProps.onPress !== this.props.onPress) {
            return true;
        }

        if (nextProps.onLongPress !== this.props.onLongPress) {
            return true;
        }

        if (nextProps.stylesheet !== this.props.stylesheet) {
            return true;
        }

        if (nextProps.javascript !== this.props.javascript) {
            return true;
        }

        return false;
    }

    componentWillUpdate(nextProps) {
        if (nextProps.src !== this.props.src) {
            this.destroy();
        }
    }

    componentDidUpdate(prevProps) {
        console.log('[Epub] componentDidUpdate', prevProps.fontSize, this.props.fontSize);

        if (prevProps.src !== this.props.src) {
            this._loadBook(this.props.src);
        } else if (prevProps.orientation !== this.props.orientation) {
            this._orientationDidChange(this.props.orientation);
        }
    }

    // LANDSCAPE PORTRAIT UNKNOWN PORTRAITUPSIDEDOWN
    _orientationDidChange(orientation) {
        let wait = 10;
        let _orientation = orientation;

        if (!this.active || !this._isMounted) return;

        if (orientation === "PORTRAITUPSIDEDOWN" || orientation === "UNKNOWN") {
            _orientation = "PORTRAIT";
        }

        if (orientation === "LANDSCAPE-RIGHT" || orientation === "LANDSCAPE-LEFT") {
            _orientation = "LANDSCAPE";
        }

        if (this.state.orientation === _orientation) {
            return;
        }


        __DEV__ && console.log("[Epub] orientation", _orientation);

        this.setState({orientation: _orientation});
        this.props.onOrientationChanged && this.props.onOrientationChanged(_orientation);
    }

    _loadBook(bookUrl) {
        __DEV__ && console.log("[Epub] loading book", bookUrl);

        return ePub({
            replacements: this.props.base64 || "none"
        }).then(epub => {
            this.epub = epub;
            this._openBook(bookUrl);
        });
    }

    _openBook(bookUrl, useBase64) {
        if (!this.rendition) {
            this.needsOpen = [bookUrl, useBase64];
            return;
        }

        this.epub.open(bookUrl).catch(console.error);

        this.epub.ready.then(book => {
            this.isReady = true;
            this.props.onReady && this.props.onReady(book);
        });

        this.epub.opened.then(book => {
            if (!this.active || !this._isMounted) return;
            this.book = book;
            this.setState({toc: book.navigation.toc});
            this.props.onNavigationReady && this.props.onNavigationReady(book.navigation.toc);
        });

        if (this.props.generateLocations !== false) {
            this.loadLocations().then(locations => {
                this.rendition.setLocations(locations);
                // this.rendition.reportLocation();
                this.props.onLocationsReady && this.props.onLocationsReady(this.book.locations);
            });
        }
    }

    loadLocations() {
        return this.epub.ready.then(() => this.epub.generateLocations(this.props.locationsCharBreak || 600));
            // Load in stored locations from json or local storage
            // var key = this.book.key() + "-locations";
            //
            // return AsyncStorage.getItem(key).then(stored => {
            //     if (this.props.regenerateLocations != true && stored !== null) {
            //         return this.book.locations = stored;
            //     } else {
            //         return this.book.generateLocations(this.props.locationsCharBreak || 600).then(locations => {
            //             this.book.locations = locations;
            //             // Save out the generated locations to JSON
            //             AsyncStorage.setItem(key, locations);
            //             return locations;
            //         });
            //     }
            // })
        //});
    }

    onRelocated(visibleLocation) {
        this._visibleLocation = visibleLocation;

        if (this.props.onLocationChange) {
            this.props.onLocationChange(visibleLocation);
        }
    }

    visibleLocation() {
        return this._visibleLocation;
    }

    getRange(cfi) {
        return this.book.getRange(cfi);
    }

    _handleAppStateChange(appState) {
        if (appState === "active") {
            this.active = true;
        }

        if (appState === "background") {
            this.active = false;
        }

        if (appState === "inactive") {
            this.active = false;
        }
    }

    destroy() {
        if (this.book) {
            this.book.destroy();
        }
    }

    render() {
        return (
            <Rendition
                ref={r => {
                    this.rendition = r;

                    if (this.needsOpen) {
                        this._openBook.apply(this, this.needsOpen);
                        this.needsOpen = undefined;
                    }
                }}
                url={this.props.src}
                flow={this.props.flow}
                minSpreadWidth={this.props.minSpreadWidth}
                stylesheet={this.props.stylesheet}
                webviewStylesheet={this.props.webviewStylesheet}
                script={this.props.script}
                onSelected={this.props.onSelected}
                onMarkClicked={this.props.onMarkClicked}
                onPress={(this.props.onPress)}
                onLongPress={(this.props.onLongPress)}
                onViewAdded={this.props.onViewAdded}
                beforeViewRemoved={this.props.beforeViewRemoved}
                themes={this.props.themes}
                theme={this.props.theme}
                fontSize={this.props.fontSize}
                font={this.props.font}
                display={this.props.location}
                onRelocated={this.onRelocated.bind(this)}
                orientation={this.state.orientation}
                backgroundColor={this.props.backgroundColor}
                onError={this.props.onError}
                onDisplayed={this.props.onDisplayed}
            />
        );
    }
}

module.exports = Epub;
