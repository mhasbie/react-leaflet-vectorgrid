import {
	MapLayer
} from 'react-leaflet';
import L, { Popup } from 'leaflet';
import 'leaflet.vectorgrid';

import DebugFactory from 'debug';

const debug = DebugFactory('react-leaflet-vectorgrid');

function patchVectorGridLayer(obj) {
	// Fix error for point data.
	// eg. mouseover does not work without this.
	debug('patch before', { obj });
	obj._createLayer_orig = obj._createLayer;
	obj._createLayer = function (feat, pxPerExtent, layerStyle) {
		let layer = this._createLayer_orig(feat, pxPerExtent, layerStyle);
		if (feat.type === 1) {
			layer.getLatLng = null;
		}
		return layer;
	};

	// do this for chaining
	debug('patch after', { obj });
	return obj;
}

function isObject(x) {
	return x === Object(x);
}

function isFunction(x) {
	return typeof x === 'function';
}

function isString(x) {
	return typeof x === 'string' || x instanceof String;
}

function isEmpty(x) {
	return x && x.length === 0;
}

function cloneDeep(x) {
	return JSON.parse(JSON.stringify(obj));
}

function extend(a, b) {
	return Object.assign(a, b);
}

function clone(x) {
	return Object.assign({}, x);
}

function has(obj, path) {
	// guard.
	debug('has', { obj, path });
	if (!isString(path)) return false;

	var keys = path.split('.');

	for (var i = 0; i < keys.length; i++) {
		if (!obj || !obj.hasOwnProperty(keys[i])) {
			return false;
		}
		obj = obj[keys[i]];
	}
	return true;
}

export default class VectorGrid extends MapLayer {
	createLeafletElement(props) {
		const {
			map,
			pane,
			layerContainer
		} = props.leaflet || this.context;
		const {
			data,
			zIndex,
			type = 'slicer',
			style,
			hoverStyle,
			activeStyle,
			onClick,
			onMouseover,
			onMouseout,
			onDblclick,
			interactive = true,
			vectorTileLayerStyles,
			url,
			maxNativeZoom,
			maxZoom,
			minZoom,
			subdomains,
			key,
			token
		} = props;

		// get feature base styling
		const baseStyle = (properties, zoom) => {
			if (isFunction(style)) {
				return style(properties);
			} else if (isObject(style)) {
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

		let vectorGrid;

		if (type === 'protobuf') {
			vectorGrid = L.vectorGrid.protobuf(url, {
				vectorTileLayerStyles,
				interactive,
				url,
				maxNativeZoom,
				subdomains,
				key,
				token,
				zIndex: zIndex || Number(layerContainer._panes[pane] && layerContainer._panes[pane].style.zIndex),
				getFeatureId: feature => this._getFeatureId(feature),
				rendererFactory: L.svg.tile,
				maxZoom: maxZoom || map.getMaxZoom(),
				minZoom: minZoom || map.getMinZoom()
			});
		} else {
			vectorGrid = L.vectorGrid.slicer(data, {
				interactive,
				zIndex: zIndex || Number(layerContainer._panes[pane] && layerContainer._panes[pane].style.zIndex),
				getFeatureId: feature => this._getFeatureId(feature),
				rendererFactory: L.svg.tile,
				maxZoom: maxZoom || map.getMaxZoom(),
				minZoom: minZoom || map.getMinZoom(),
				vectorTileLayerStyles: vectorTileLayerStyles || {
					sliced: (properties, zoom) => {
						const bs = baseStyle(properties, zoom);
						bs.fill = true;
						bs.stroke = true;
						return bs;
					}
				}
			});
		}

		return patchVectorGridLayer(vectorGrid)
			.on('mouseover', (e) => {
				const {
					properties
				} = e.layer;
				this._propagateEvent(onMouseover, e);

				// on mouseover styling
				let st;
				const featureId = this._getFeatureId(e.layer);
				if (isFunction(hoverStyle)) {
					st = hoverStyle(properties);
				} else if (isObject(hoverStyle)) {
					st = clone(hoverStyle);
				}
				if (!isEmpty(st) && featureId) {
					this.clearHighlight();
					this.highlight = featureId;
					const base = clone(baseStyle(properties));
					const hover = extend(base, st);
					this.setFeatureStyle(featureId, hover);
				}
			})
			.on('mouseout', (e) => {
				this._propagateEvent(onMouseout, e);
				this.clearHighlight();
			})
			.on('click', (e) => {
				const {
					properties
				} = e.layer;
				const featureId = this._getFeatureId(e.layer);

				this._propagateEvent(onClick, e);

				// set active style
				let st;
				if (isFunction(activeStyle)) {
					st = activeStyle(properties);
				} else if (isObject(activeStyle)) {
					st = clone(activeStyle);
				}
				if (!isEmpty(st) && featureId) {
					this.clearActive();
					this.active = featureId;
					const base = clone(baseStyle(properties));
					const active = extend(base, st);
					this.setFeatureStyle(featureId, active);
				}
			})
			.on('dblclick', (e) => {
				this._propagateEvent(onDblclick, e);
				this.clearActive();
			});
	}

	componentDidMount() {
		const {
			layerContainer
		} = this.props.leaflet || this.context;
		const {
			tooltipClassName = '', tooltip = null, popup = null
		} = this.props;
		this.leafletElement.addTo(layerContainer);
		// bind tooltip
		if (tooltip) {
			this.leafletElement.bindTooltip((layer) => {
				if (isFunction(tooltip)) {
					return tooltip(layer);
				} else if (isString(tooltip) && has(layer.properties, tooltip)) {
					return layer.properties[tooltip];
				} else if (isString(tooltip)) {
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
		// don't need all that extra logic, just make popup match the vector grid options.
		// TODO add the ability to pass through popup options
		if (popup) {
			// create a popup and bind it?
			// const newPopup = L.popup().setContent(popup);
			// debug('type of popup', newPopup instanceof Popup);
			debug('popup', { popup });
			this.leafletElement.bindPopup(popup);
		}
	}

	_getFeatureId(feature) {
		const {
			idField
		} = this.props;
		if (isFunction(idField)) {
			return idField(feature);
		} else if (isString(idField)) {
			return feature.properties[idField];
		}
	}

	_propagateEvent(eventHandler, e) {
		if (!isFunction(eventHandler)) return;
		const featureId = this._getFeatureId(e.layer);
		const feature = this.getFeature(featureId);
		const event = cloneDeep(e);
		const mergedEvent = merge(event.target, {
			feature
		});
		eventHandler(event);
	}

	setFeatureStyle(id, style) {
		this.leafletElement.setFeatureStyle(id, style);
	}

	resetFeatureStyle(id) {
		this.leafletElement.resetFeatureStyle(id);
	}

	clearHighlight() {
		if (this.highlight && this.highlight !== this.active) {
			this.resetFeatureStyle(this.highlight);
		}
		this.highlight = null;
	}

	clearActive() {
		if (this.active) {
			this.resetFeatureStyle(this.active);
		}
		this.active = null;
	}

	getFeature(featureId) {
		const {
			data,
			idField
		} = this.props;
		if (isEmpty(data)) return {};
		const feature = find(data.features, ({
			properties
		}) => properties[idField] === featureId);
		return cloneDeep(feature);
	}
}