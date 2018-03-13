'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactLeaflet = require('react-leaflet');

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

require('leaflet.vectorgrid');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VectorGrid = function (_MapLayer) {
	_inherits(VectorGrid, _MapLayer);

	function VectorGrid() {
		_classCallCheck(this, VectorGrid);

		return _possibleConstructorReturn(this, (VectorGrid.__proto__ || Object.getPrototypeOf(VectorGrid)).apply(this, arguments));
	}

	_createClass(VectorGrid, [{
		key: 'createLeafletElement',
		value: function createLeafletElement(props) {
			var _this2 = this;

			var _context = this.context,
			    map = _context.map,
			    pane = _context.pane,
			    layerContainer = _context.layerContainer;
			var data = props.data,
			    zIndex = props.zIndex,
			    _props$type = props.type,
			    type = _props$type === undefined ? 'slicer' : _props$type,
			    style = props.style,
			    hoverStyle = props.hoverStyle,
			    activeStyle = props.activeStyle,
			    onClick = props.onClick,
			    onMouseover = props.onMouseover,
			    onMouseout = props.onMouseout,
			    onDblclick = props.onDblclick,
			    _props$interactive = props.interactive,
			    interactive = _props$interactive === undefined ? true : _props$interactive,
			    vectorTileLayerStyles = props.vectorTileLayerStyles,
			    url = props.url,
			    maxNativeZoom = props.maxNativeZoom,
			    subdomains = props.subdomains,
			    key = props.key,
			    token = props.token;

			// get feature base styling

			var baseStyle = function baseStyle(properties, zoom) {
				if (_lodash2.default.isFunction(style)) {
					return style(properties);
				} else if (_lodash2.default.isObject(style)) {
					return style;
				}
				return {
					weight: 0.5,
					opacity: 1,
					color: '#ccc',
					fillColor: '#390870',
					fillOpacity: 0.6,
					fill: true,
					stroke: true
				};
			};
			this.highlight = null;
			this.active = null;

			var vectorGrid = _leaflet2.default.vectorGrid.slicer(data, {
				interactive: interactive,
				zIndex: zIndex || Number(layerContainer._panes[pane].style.zIndex),
				getFeatureId: function getFeatureId(feature) {
					return _this2._getFeatureId(feature);
				},
				rendererFactory: _leaflet2.default.svg.tile,
				maxZoom: map.options.maxZoom || null,
				vectorTileLayerStyles: vectorTileLayerStyles || {
					sliced: function sliced(properties, zoom) {
						var bs = baseStyle(properties, zoom);
						bs.fill = true;
						bs.stroke = true;
						return bs;
					}
				}
			});
			if (type === 'protobuf') {
				vectorGrid = _leaflet2.default.vectorGrid.protobuf(url, {
					vectorTileLayerStyles: vectorTileLayerStyles,
					interactive: interactive,
					url: url,
					maxNativeZoom: maxNativeZoom,
					subdomains: subdomains,
					key: key,
					token: token,
					zIndex: zIndex || Number(layerContainer._panes[pane].style.zIndex),
					getFeatureId: function getFeatureId(feature) {
						return _this2._getFeatureId(feature);
					},
					rendererFactory: _leaflet2.default.svg.tile,
					maxZoom: map.options.maxZoom || null
				});
			}

			return vectorGrid.on('mouseover', function (e) {
				var properties = e.layer.properties;

				_this2._propagateEvent(onMouseover, e);

				// on mouseover styling
				var st = void 0;
				var featureId = _this2._getFeatureId(e.layer);
				if (_lodash2.default.isFunction(hoverStyle)) {
					st = hoverStyle(properties);
				} else if (_lodash2.default.isObject(hoverStyle)) {
					st = _lodash2.default.clone(hoverStyle);
				}
				if (!_lodash2.default.isEmpty(st) && featureId) {
					_this2.clearHighlight();
					_this2.highlight = featureId;
					var base = _lodash2.default.clone(baseStyle(properties));
					var hover = _lodash2.default.extend(base, st);
					_this2.setFeatureStyle(featureId, hover);
				}
			}).on('mouseout', function (e) {
				_this2._propagateEvent(onMouseout, e);
				_this2.clearHighlight();
			}).on('click', function (e) {
				var properties = e.layer.properties;

				var featureId = _this2._getFeatureId(e.layer);

				_this2._propagateEvent(onClick, e);

				// set active style
				var st = void 0;
				if (_lodash2.default.isFunction(activeStyle)) {
					st = activeStyle(properties);
				} else if (_lodash2.default.isObject(activeStyle)) {
					st = _lodash2.default.clone(activeStyle);
				}
				if (!_lodash2.default.isEmpty(st) && featureId) {
					_this2.clearActive();
					_this2.active = featureId;
					var base = _lodash2.default.clone(baseStyle(properties));
					var active = _lodash2.default.extend(base, st);
					_this2.setFeatureStyle(featureId, active);
				}
			}).on('dblclick', function (e) {
				_this2._propagateEvent(onDblclick, e);
				_this2.clearActive();
			});
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			var layerContainer = this.context.layerContainer;
			var _props = this.props,
			    _props$tooltipClassNa = _props.tooltipClassName,
			    tooltipClassName = _props$tooltipClassNa === undefined ? '' : _props$tooltipClassNa,
			    _props$tooltip = _props.tooltip,
			    tooltip = _props$tooltip === undefined ? null : _props$tooltip,
			    _props$popup = _props.popup,
			    popup = _props$popup === undefined ? null : _props$popup;

			this.leafletElement.addTo(layerContainer);
			// bind tooltip
			if (tooltip) {
				this.leafletElement.bindTooltip(function (layer) {
					if (_lodash2.default.isFunction(tooltip)) {
						return tooltip(layer);
					} else if (_lodash2.default.isString(tooltip) && _lodash2.default.has(layer.properties, tooltip)) {
						return layer.properties[tooltip];
					} else if (_lodash2.default.isString(tooltip)) {
						return tooltip;
					}
					return '';
				}, {
					sticky: true,
					direction: 'auto',
					className: tooltipClassName
				});
			}
			// bind popup
			if (popup) {
				this.leafletElement.bindPopup(function (layer) {
					if (_lodash2.default.isFunction(popup)) {
						return popup(layer);
					} else if (_lodash2.default.isString(popup)) {
						return popup;
					}
					return '';
				});
			}
		}
	}, {
		key: '_getFeatureId',
		value: function _getFeatureId(feature) {
			var idField = this.props.idField;

			if (_lodash2.default.isFunction(idField)) {
				return idField(feature);
			} else if (_lodash2.default.isString(idField)) {
				return feature.properties[idField];
			}
		}
	}, {
		key: '_propagateEvent',
		value: function _propagateEvent(eventHandler, e) {
			if (!_lodash2.default.isFunction(eventHandler)) return;
			var featureId = this._getFeatureId(e.layer);
			var feature = this.getFeature(featureId);
			var event = _lodash2.default.clone(e);
			var mergedEvent = _lodash2.default.merge(event.target, { feature: feature });
			eventHandler(event);
		}
	}, {
		key: 'setFeatureStyle',
		value: function setFeatureStyle(id, style) {
			this.leafletElement.setFeatureStyle(id, style);
		}
	}, {
		key: 'resetFeatureStyle',
		value: function resetFeatureStyle(id) {
			this.leafletElement.resetFeatureStyle(id);
		}
	}, {
		key: 'clearHighlight',
		value: function clearHighlight() {
			if (this.highlight && this.highlight !== this.active) {
				this.resetFeatureStyle(this.highlight);
			}
			this.highlight = null;
		}
	}, {
		key: 'clearActive',
		value: function clearActive() {
			if (this.active) {
				this.resetFeatureStyle(this.active);
			}
			this.active = null;
		}
	}, {
		key: 'getFeature',
		value: function getFeature(featureId) {
			var _props2 = this.props,
			    data = _props2.data,
			    idField = _props2.idField;

			if (_lodash2.default.isEmpty(data)) return {};
			var feature = _lodash2.default.find(data.features, function (_ref) {
				var properties = _ref.properties;
				return properties[idField] === featureId;
			});
			return feature;
		}
	}]);

	return VectorGrid;
}(_reactLeaflet.MapLayer);

exports.default = VectorGrid;