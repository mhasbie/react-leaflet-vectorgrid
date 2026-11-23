import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.vectorgrid';

function isObject(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isFunction(value) {
	return typeof value === 'function';
}

function patchVectorGridLayer(layer) {
	const originalCreateLayer = layer._createLayer;
	layer._createLayer = function (feature, pxPerExtent, layerStyle) {
		const createdLayer = originalCreateLayer.call(this, feature, pxPerExtent, layerStyle);
		if (feature.type === 1) {
			createdLayer.getLatLng = null;
		}
		return createdLayer;
	};
	return layer;
}

const VectorGrid = forwardRef(function VectorGrid(props, ref) {
	const map = useMap();
	const layerRef = useRef(null);
	const highlightRef = useRef(null);
	const activeRef = useRef(null);

	const getFeatureId = (feature) => {
		const { idField } = props;
		if (isFunction(idField)) {
			return idField(feature);
		}
		if (typeof idField === 'string' && feature && feature.properties) {
			return feature.properties[idField];
		}
		return undefined;
	};

	const getFeature = (featureId) => {
		const { data, idField } = props;
		if (!data || !Array.isArray(data.features) || !idField) return {};
		const feature = data.features.find((item) => {
			if (!item) return false;
			if (isFunction(idField)) return getFeatureId(item) === featureId;
			return item.properties && item.properties[idField] === featureId;
		});
		return feature ? JSON.parse(JSON.stringify(feature)) : {};
	};

	const propagateEvent = (eventHandler, event) => {
		if (!isFunction(eventHandler)) return;
		const featureId = getFeatureId(event.layer);
		eventHandler({
			...event,
			feature: getFeature(featureId)
		});
	};

	const clearHighlight = () => {
		if (highlightRef.current && highlightRef.current !== activeRef.current) {
			layerRef.current?.resetFeatureStyle(highlightRef.current);
		}
		highlightRef.current = null;
	};

	const clearActive = () => {
		if (activeRef.current) {
			layerRef.current?.resetFeatureStyle(activeRef.current);
		}
		activeRef.current = null;
	};

	const setFeatureStyle = (id, style) => {
		layerRef.current?.setFeatureStyle(id, style);
	};

	const resetFeatureStyle = (id) => {
		layerRef.current?.resetFeatureStyle(id);
	};

	useImperativeHandle(ref, () => ({
		setFeatureStyle,
		resetFeatureStyle,
		clearHighlight,
		clearActive,
		getFeature,
		get leafletElement() {
			return layerRef.current;
		}
	}), [props]);

	useEffect(() => {
		const {
			data,
			zIndex,
			style,
			hoverStyle,
			activeStyle,
			onClick,
			onMouseover,
			onMouseout,
			onDblclick,
			onContextmenu,
			vectorTileLayerStyles,
			url,
			maxNativeZoom,
			maxZoom,
			minZoom,
			subdomains,
			accessKey,
			accessToken,
			type = 'slicer',
			interactive = true,
			tooltip = null,
			tooltipClassName = '',
			popup = null,
			...rest
		} = props;

		delete rest.leaflet;
		delete rest.idField;

		const baseStyle = (properties) => {
			if (isFunction(style)) {
				return style(properties);
			}
			if (isObject(style)) {
				return { ...style };
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

		const pane = rest.pane;
		const paneElement = pane ? map.getPane(pane) : null;
		const paneZIndex = paneElement ? Number(paneElement.style.zIndex) : undefined;

		let layer;
		if (type === 'protobuf') {
			layer = L.vectorGrid.protobuf(url, {
				vectorTileLayerStyles,
				interactive,
				url,
				maxNativeZoom,
				subdomains,
				key: accessKey,
				token: accessToken,
				zIndex: zIndex ?? paneZIndex,
				getFeatureId,
				rendererFactory: L.svg.tile,
				maxZoom: maxZoom ?? map.getMaxZoom(),
				minZoom: minZoom ?? map.getMinZoom(),
				...rest
			});
		} else {
			layer = L.vectorGrid.slicer(data, {
				interactive,
				zIndex: zIndex ?? paneZIndex,
				getFeatureId,
				rendererFactory: L.svg.tile,
				maxZoom: maxZoom ?? map.getMaxZoom(),
				minZoom: minZoom ?? map.getMinZoom(),
				vectorTileLayerStyles: vectorTileLayerStyles || {
					sliced: (properties, zoom) => {
						const result = baseStyle(properties, zoom);
						result.fill = true;
						result.stroke = true;
						return result;
					}
				},
				...rest
			});
		}

		patchVectorGridLayer(layer);

		layer
			.on('mouseover', (event) => {
				const { properties } = event.layer;
				propagateEvent(onMouseover, event);

				let hover;
				if (isFunction(hoverStyle)) {
					hover = hoverStyle(properties);
				} else if (isObject(hoverStyle)) {
					hover = { ...hoverStyle };
				}
				const featureId = getFeatureId(event.layer);
				if (hover && Object.keys(hover).length && featureId !== undefined && featureId !== null) {
					clearHighlight();
					highlightRef.current = featureId;
					const hoverStyleValue = { ...baseStyle(properties), ...hover };
					setFeatureStyle(featureId, hoverStyleValue);
				}
			})
			.on('mouseout', (event) => {
				propagateEvent(onMouseout, event);
				clearHighlight();
			})
			.on('click', (event) => {
				const { properties } = event.layer;
				const featureId = getFeatureId(event.layer);
				propagateEvent(onClick, event);

				let active;
				if (isFunction(activeStyle)) {
					active = activeStyle(properties);
				} else if (isObject(activeStyle)) {
					active = { ...activeStyle };
				}
				if (active && Object.keys(active).length && featureId !== undefined && featureId !== null) {
					clearActive();
					activeRef.current = featureId;
					const activeStyleValue = { ...baseStyle(properties), ...active };
					setFeatureStyle(featureId, activeStyleValue);
				}
			})
			.on('dblclick', (event) => {
				propagateEvent(onDblclick, event);
				clearActive();
			})
			.on('contextmenu', (event) => {
				propagateEvent(onContextmenu, event);
				clearActive();
			});

		layerRef.current = layer;
		map.addLayer(layer);

		if (tooltip) {
			layer.bindTooltip((feature) => {
				if (isFunction(tooltip)) {
					return tooltip(feature);
				}
				if (typeof tooltip === 'string') {
					if (feature && feature.properties && Object.prototype.hasOwnProperty.call(feature.properties, tooltip)) {
						return String(feature.properties[tooltip]);
					}
					return tooltip;
				}
				return '';
			}, {
				sticky: true,
				direction: 'auto',
				className: tooltipClassName
			});
		}

		if (popup) {
			layer.bindPopup(popup);
		}

		return () => {
			clearHighlight();
			clearActive();
			if (layerRef.current) {
				map.removeLayer(layerRef.current);
				layerRef.current = null;
			}
		};
	}, [props, map]);

	return null;
});

export default VectorGrid;
