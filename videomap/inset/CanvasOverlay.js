L.CanvasOverlay = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		opacity: 1
	},

	initialize: function (topLeft, size, options) { // (String, LatLngBounds, Object)
		// this._canvas = canvas;
		// this._ctx = canvas.getContext('2d');
		// this._bounds = L.latLngBounds(bounds);
		this._inView = true;
		this._topLeft = topLeft;
		this._size = size;
		this._origSize = size;
		L.setOptions(this, options);

	},
	getContext: function(){
		return this._context;
	},
	getCanvas: function(){
		return this._canvas;
	},
	onAdd: function (map) {
		this._map = map;

		if (!this._canvas) {
			this._initImage();
		}

		map._panes.overlayPane.appendChild(this._canvas);

		map.on('viewreset', this._reset, this);

		if (map.options.zoomAnimation && L.Browser.any3d) {
			map.on('zoomanim', this._animateZoom, this);
		}

		this._reset();
	},

	onRemove: function (map) {
		map.getPanes().overlayPane.removeChild(this._canvas);

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
		if (this._canvas) {
			this._map._panes.overlayPane.appendChild(this._canvas);
		}
		return this;
	},

	bringToBack: function () {
		var pane = this._map._panes.overlayPane;
		if (this._canvas) {
			pane.insertBefore(this._canvas, pane.firstChild);
		}
		return this;
	},

	_initImage: function () {
		this._canvas = L.DomUtil.create('canvas', 'leaflet-image-layer');
		this._width = this._canvas.width = this._size.x;
		this._height = this._canvas.height = this._size.y;
		this._context = this._canvas.getContext('2d');

		if (this._map.options.zoomAnimation && L.Browser.any3d) {
			L.DomUtil.addClass(this._canvas, 'leaflet-zoom-animated');
		} else {
			L.DomUtil.addClass(this._canvas, 'leaflet-zoom-hide');
		}

		this._updateOpacity();

		//TODO createImage util method to remove duplication
		L.extend(this._canvas, {
			galleryimg: 'no',
			onselectstart: L.Util.falseFn,
			onmousemove: L.Util.falseFn,
			onload: L.bind(this._onImageLoad, this),
			// src: this._canvas.toDataURL()
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
			console.log(this._oldOpacity)
			this._updateOpacity();
			this._inView = true;
		}
	}, 
	_animateZoom: function (e) {
		var map = this._map,
		    image = this._canvas,
		    scale = map.getZoomScale(e.zoom),
		    topLeft = map._latLngToNewLayerPoint(this._topLeft, e.zoom, e.center);


		var size = {x: scale*this._canvas.width, y: scale*this._canvas.height};

		if (size.x < 10) {this._outOfFocus(); return;}
		if (size.x < 10) {this._outOfFocus(); return;}
		if (!this._inView){
			this._inFocus();
		} else {
			console.log('animate')

			this._size = size;
			origin = topLeft._add({x: this._size.x * (1 / 2) * (1 - 1/scale), y: this._size.y * (1 / 2) * (1 - 1/scale)})

			image.style[L.DomUtil.TRANSFORM] =
			        L.DomUtil.getTranslateString(origin) + ' scale(' + scale + ') ';

			this._width = this._canvas.width = this._size.x;
			this._height = this._canvas.height = this._size.y ;
		}
	},

	_reset: function (size) {
		if(this._inView){
			var image   = this._canvas,
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
		L.DomUtil.setOpacity(this._canvas, this.options.opacity);
	}
});

L.canvasOverlay = function (url, bounds, options) {
	return new L.CanvasOverlay(url, bounds, options);
};