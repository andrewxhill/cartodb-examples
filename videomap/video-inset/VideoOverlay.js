L.VideoOverlay = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		opacity: 1
	},

	initialize: function (topLeft, size, options) { // (String, LatLngBounds, Object)
		// this._video = video;
		// this._ctx = video.getContext('2d');
		// this._bounds = L.latLngBounds(bounds);
		this._inView = true;
		this._topLeft = topLeft;
		this._size = size;
		this._src = options.src;
		this._origSize = size;
		L.setOptions(this, options);

	},
	getContext: function(){
		return this._context;
	},
	getVideo: function(){
		return this._video;
	},
	onAdd: function (map) {
		this._map = map;

		if (!this._video) {
			this._initImage();
		}

		map._panes.overlayPane.appendChild(this._video);

		map.on('viewreset', this._reset, this);

		if (map.options.zoomAnimation && L.Browser.any3d) {
			map.on('zoomanim', this._animateZoom, this);
		}

		this._reset();
	},

	onRemove: function (map) {
		map.getPanes().overlayPane.removeChild(this._video);

		map.off('viewreset', this._reset, this);

		if (map.options.zoomAnimation) {
			map.off('zoomanim', this._animateZoom, this);
		}
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;
		this._updateOpacity();
		return this;
	},

	// TODO remove bringToFront/bringToBack duplication from TileLayer/Path
	bringToFront: function () {
		if (this._video) {
			this._map._panes.overlayPane.appendChild(this._video);
		}
		return this;
	},

	bringToBack: function () {
		var pane = this._map._panes.overlayPane;
		if (this._video) {
			pane.insertBefore(this._video, pane.firstChild);
		}
		return this;
	},

	_initImage: function () {
		this._video = L.DomUtil.create('iframe', 'leaflet-image-layer');
		this._video.src = this._src;
		this._width = this._video.width = this._size.x;
		this._height = this._video.height = this._size.y;

		if (this._map.options.zoomAnimation && L.Browser.any3d) {
			L.DomUtil.addClass(this._video, 'leaflet-zoom-animated');
		} else {
			L.DomUtil.addClass(this._video, 'leaflet-zoom-hide');
		}

		this._updateOpacity();

		//TODO createImage util method to remove duplication
		L.extend(this._video, {
			galleryimg: 'no',
			onselectstart: L.Util.falseFn,
			onmousemove: L.Util.falseFn,
			onload: L.bind(this._onImageLoad, this),
			// src: this._video.toDataURL()
		});
	},
	_outOfFocus: function() {
		if (this._inView){
			this._returnZoom = this._map.getZoom() - 1;
			this._oldOpacity = this.options.opacity;
			this.options.opacity = 0;
			this._updateOpacity();
			this._inView = false;
		}
	}, 
	_inFocus: function() {
		if (this._returnZoom >= this._map.getZoom()) {
			this.options.opacity = this._oldOpacity;
			this._updateOpacity();
			this._inView = true;
		}
	}, 
	_animateZoom: function (e) {
		var map = this._map,
		    image = this._video,
		    scale = map.getZoomScale(e.zoom),
		    topLeft = map._latLngToNewLayerPoint(this._topLeft, e.zoom, e.center);


		var size = {x: scale*this._video.width, y: scale*this._video.height};

		if (size.x < 10) {this._outOfFocus(); return;}
		if (size.x < 10) {this._outOfFocus(); return;}
		if (!this._inView){
			this._inFocus();
		} else {
			this._size = size;
			origin = topLeft._add({x: this._size.x * (1 / 2) * (1 - 1/scale), y: this._size.y * (1 / 2) * (1 - 1/scale)})

			image.style[L.DomUtil.TRANSFORM] =
			        L.DomUtil.getTranslateString(origin) + ' scale(' + scale + ') ';

			this._width = this._video.width = this._size.x;
			this._height = this._video.height = this._size.y ;
		}
	},

	_reset: function (size) {
		if(this._inView){
			var image   = this._video,
			    topLeft = this._map.latLngToLayerPoint(this._topLeft)
			    size = this._size;

			L.DomUtil.setPosition(image, topLeft);

			image.style.width  = size.x + 'px';
			image.style.height = size.y + 'px';
		console.log('reset')
		}
	},

	_onImageLoad: function () {
		this.fire('load');
	},

	_updateOpacity: function () {
		L.DomUtil.setOpacity(this._video, this.options.opacity);
	}
});

L.videoOverlay = function (url, bounds, options) {
	return new L.VideoOverlay(url, bounds, options);
};