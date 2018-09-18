import { MapLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.vectorgrid';
import _ from 'lodash';

export default class VectorGrid extends MapLayer {
	createLeafletElement(props) {
		const { map, pane, layerContainer } = props.leaflet || this.context;
		const { data, zIndex, type = 'slicer', style, hoverStyle, activeStyle, onClick, onMouseover, onMouseout, onDblclick, interactive = true, vectorTileLayerStyles, url, maxNativeZoom, maxZoom, minZoom, subdomains, key, token } = props;

		// get feature base styling
		const baseStyle = (properties, zoom) => {
			if (_.isFunction(style)) {
				return style(properties);
			} else if (_.isObject(style)) {
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

		let vectorGrid = L.vectorGrid.slicer(data, {
			interactive,
			zIndex: zIndex || Number(layerContainer._panes[pane].style.zIndex),
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
		if (type === 'protobuf') {
			vectorGrid = L.vectorGrid.protobuf(url, {
				vectorTileLayerStyles,
				interactive,
				url,
				maxNativeZoom,
				subdomains,
				key,
				token,
				zIndex: zIndex || Number(layerContainer._panes[pane].style.zIndex),
				getFeatureId: feature => this._getFeatureId(feature),
				rendererFactory: L.svg.tile,
				maxZoom: maxZoom || map.getMaxZoom(),
				minZoom: minZoom || map.getMinZoom()
			});
		}

		return vectorGrid
			.on('mouseover', (e) => {
				const { properties } = e.layer;
				this._propagateEvent(onMouseover, e);

				// on mouseover styling
				let st;
				const featureId = this._getFeatureId(e.layer);
				if (_.isFunction(hoverStyle)) {
					st = hoverStyle(properties);
				} else if (_.isObject(hoverStyle)) {
					st = _.clone(hoverStyle);
				}
				if (!_.isEmpty(st) && featureId) {
					this.clearHighlight();
					this.highlight = featureId;
					const base = _.clone(baseStyle(properties));
					const hover = _.extend(base, st);
					this.setFeatureStyle(featureId, hover);
				}
			})
			.on('mouseout', (e) => {
				this._propagateEvent(onMouseout, e);
				this.clearHighlight();
			})
			.on('click', (e) => {
				const { properties } = e.layer;
				const featureId = this._getFeatureId(e.layer);

				this._propagateEvent(onClick, e);

				// set active style
				let st;
				if (_.isFunction(activeStyle)) {
					st = activeStyle(properties);
				} else if (_.isObject(activeStyle)) {
					st = _.clone(activeStyle);
				}
				if (!_.isEmpty(st) && featureId) {
					this.clearActive();
					this.active = featureId;
					const base = _.clone(baseStyle(properties));
					const active = _.extend(base, st);
					this.setFeatureStyle(featureId, active);
				}
			})
			.on('dblclick', (e) => {
				this._propagateEvent(onDblclick, e);
				this.clearActive();
			});
	}

	componentDidMount() {
		const { layerContainer } = this.props.leaflet || this.context;
		const { tooltipClassName = '', tooltip = null, popup = null } = this.props;
		this.leafletElement.addTo(layerContainer);
		// bind tooltip
		if (tooltip) {
			this.leafletElement.bindTooltip((layer) => {
				if (_.isFunction(tooltip)) {
					return tooltip(layer);
				} else if (_.isString(tooltip) && _.has(layer.properties, tooltip)) {
					return layer.properties[tooltip];
				} else if (_.isString(tooltip)) {
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
			this.leafletElement.bindPopup((layer) => {
				if (_.isFunction(popup)) {
					return popup(layer);
				} else if (_.isString(popup)) {
					return popup;
				}
				return '';
			});
		}
	}

	_getFeatureId(feature) {
		const { idField } = this.props;
		if (_.isFunction(idField)) {
			return idField(feature);
		} else if (_.isString(idField)) {
			return feature.properties[idField];
		}
	}

	_propagateEvent(eventHandler, e) {
		if (!_.isFunction(eventHandler)) return;
		const featureId = this._getFeatureId(e.layer);
		const feature = this.getFeature(featureId);
		const event = _.cloneDeep(e);
		const mergedEvent = _.merge(event.target, { feature });
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
		const { data, idField } = this.props;
		if (_.isEmpty(data)) return {};
		const feature = _.find(data.features, ({ properties }) => properties[idField] === featureId);
		return _.cloneDeep(feature);
	}
}
