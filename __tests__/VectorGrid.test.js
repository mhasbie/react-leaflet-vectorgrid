/* global describe, expect, it, jest */

import React from 'react';
import { mount } from './enzyme';
import 'jest-enzyme';
import './stubs';
import data from './data';

import { Map, TileLayer, withLeaflet } from 'react-leaflet';
import VectorGridDefault from '../dist/react-leaflet-vectorgrid.min.js';
const VectorGrid = withLeaflet(VectorGridDefault);

describe('VectorGrid', () => {

	it('Should instantiate a sliced vectorgrid layer when rendered inside a map', () => {

		const mapOptions = {
			center: [2.935403, 101.448205],
			zoom: 3,
			minZoom: 1,
			maxZoom: 22,
		};
		const vectorGridOptions = {
			data,
			type: 'slicer',
			idField: 'name',
			tooltip: 'name',
			// popup: (layer) => `<div>${layer.properties.name}</div>`,
			style: {
				weight: 0.5,
				opacity: 1,
				color: '#ccc',
				fillColor: '#390870',
				fillOpacity: 0.6,
				fill: true,
				stroke: true
			},
			hoverStyle: {
				fillColor: '#390870',
				fillOpacity: 1
			},
			activeStyle: {
				fillColor: '#390870',
				fillOpacity: 1
			},
			zIndex: 401
		};
		const wrapper = mount(
			<Map {...mapOptions}>
				<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
				<VectorGrid {...vectorGridOptions} />
			</Map>
		);
		
		expect(wrapper).not.toBeEmptyRender();
	})
})