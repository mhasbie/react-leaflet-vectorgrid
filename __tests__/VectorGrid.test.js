/* global describe, expect, it, jest, afterEach */

import React, { createRef } from 'react';
import { act, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MapContainer, useMap } from 'react-leaflet';
import L from 'leaflet';
import VectorGrid from '../src';
import data from './data';

const mapOptions = {
	center: [2.935403, 101.448205],
	zoom: 3,
	minZoom: 1,
	maxZoom: 22,
	style: { height: '400px', width: '600px' }
};

function createVectorGridLayer() {
	const handlers = {};
	const layer = new L.Layer();
	Object.assign(layer, {
		_createLayer: jest.fn(),
		onAdd: jest.fn(),
		onRemove: jest.fn(),
		on: jest.fn(function (eventName, handler) {
			handlers[eventName] = handler;
			return this;
		}),
		off: jest.fn(function () {
			return this;
		}),
		remove: jest.fn(),
		setFeatureStyle: jest.fn(),
		resetFeatureStyle: jest.fn(),
		bindTooltip: jest.fn(function () {
			return this;
		}),
		bindPopup: jest.fn(function () {
			return this;
		}),
		handlers
	});
	return layer;
}

describe('VectorGrid', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('renders a sliced VectorGrid and removes it on unmount', () => {
		const layer = createVectorGridLayer();
		const slicer = jest.spyOn(L.vectorGrid, 'slicer').mockReturnValue(layer);
		const addLayer = jest.spyOn(L.Map.prototype, 'addLayer');
		const removeLayer = jest.spyOn(L.Map.prototype, 'removeLayer');

		const ref = createRef();
		const { unmount } = render(
			<MapContainer {...mapOptions}>
				<VectorGrid
					ref={ref}
					data={data}
					type="slicer"
					idField="name"
					tooltip="name"
					zIndex={401}
				/>
			</MapContainer>
		);

		expect(slicer).toHaveBeenCalledWith(data, expect.objectContaining({
			interactive: true,
			zIndex: 401
		}));
		expect(addLayer).toHaveBeenCalledWith(layer);
		expect(ref.current.leafletElement).toBe(layer);

		unmount();

		expect(removeLayer).toHaveBeenCalledWith(layer);
	});

	it('creates a protobuf VectorGrid with tile options', () => {
		const layer = createVectorGridLayer();
		const protobuf = jest.spyOn(L.vectorGrid, 'protobuf').mockReturnValue(layer);

		render(
			<MapContainer {...mapOptions}>
				<VectorGrid
					type="protobuf"
					url="https://{s}.example/{z}/{x}/{y}.pbf"
					subdomains="abcd"
					accessKey="key"
					accessToken="token"
					vectorTileLayerStyles={{ roads: { color: 'red' } }}
				/>
			</MapContainer>
		);

		expect(protobuf).toHaveBeenCalledWith(
			'https://{s}.example/{z}/{x}/{y}.pbf',
			expect.objectContaining({
				subdomains: 'abcd',
				key: 'key',
				token: 'token',
				vectorTileLayerStyles: { roads: { color: 'red' } }
			})
		);
	});

	it('recreates the layer when props change and forwards imperative style calls', () => {
		const firstLayer = createVectorGridLayer();
		const secondLayer = createVectorGridLayer();
		const slicer = jest.spyOn(L.vectorGrid, 'slicer')
			.mockReturnValueOnce(firstLayer)
			.mockReturnValueOnce(secondLayer);
		const ref = createRef();
		const renderMap = (style) => (
			<MapContainer {...mapOptions}>
				<VectorGrid ref={ref} data={data} type="slicer" idField="name" style={style} />
			</MapContainer>
		);

		const { rerender } = render(renderMap({ color: 'blue' }));
		rerender(renderMap({ color: 'red' }));

		expect(slicer).toHaveBeenCalledTimes(2);
		act(() => {
			ref.current.setFeatureStyle('feature-1', { color: 'orange' });
			ref.current.resetFeatureStyle('feature-1');
		});
		expect(secondLayer.setFeatureStyle).toHaveBeenCalledWith('feature-1', { color: 'orange' });
		expect(secondLayer.resetFeatureStyle).toHaveBeenCalledWith('feature-1');
	});

	it('forwards vector events and applies hover and active styles', () => {
		const layer = createVectorGridLayer();
		jest.spyOn(L.vectorGrid, 'slicer').mockReturnValue(layer);
		const onClick = jest.fn();
		const onMouseover = jest.fn();

		render(
			<MapContainer {...mapOptions}>
				<VectorGrid
					data={data}
					type="slicer"
					idField="name"
					onClick={onClick}
					onMouseover={onMouseover}
					hoverStyle={{ fillOpacity: 1 }}
					activeStyle={{ color: 'yellow' }}
				/>
			</MapContainer>
		);

		const event = {
			layer: {
				properties: { name: 'sample' },
				feature: data.features[0]
			}
		};

		act(() => {
			layer.handlers.mouseover(event);
			layer.handlers.click(event);
		});

		expect(onMouseover).toHaveBeenCalledWith(expect.objectContaining({ feature: expect.any(Object) }));
		expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ feature: expect.any(Object) }));
		expect(layer.setFeatureStyle).toHaveBeenCalledWith(
			'sample',
			expect.objectContaining({ fillOpacity: 1 })
		);
		expect(layer.setFeatureStyle).toHaveBeenCalledWith(
			'sample',
			expect.objectContaining({ color: 'yellow' })
		);
	});
});
