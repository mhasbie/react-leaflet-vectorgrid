import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MapContainer } from 'react-leaflet';
import VectorGrid from '../../src';

const data = {
	type: 'FeatureCollection',
	features: [
		{
			type: 'Feature',
			properties: { name: 'Browser test polygon' },
			geometry: {
				type: 'Polygon',
				coordinates: [[
					[-20, -10],
					[20, -10],
					[20, 10],
					[-20, 10],
					[-20, -10]
				]]
			}
		}
	]
};

function Fixture() {
	const [selectedFeature, setSelectedFeature] = useState('No feature selected');
	const interactive = new URLSearchParams(window.location.search).get('interactive') !== 'false';

	return (
		<main>
			<h1>VectorGrid fixture</h1>
			<MapContainer
				center={[0, 0]}
				zoom={3}
				minZoom={1}
				maxZoom={8}
				ref={(map) => {
					if (map) window.fixtureMap = map;
				}}
			>
				<VectorGrid
					data={data}
					idField="name"
					interactive={interactive}
					style={{ color: '#222222', fillColor: '#336699', fillOpacity: 0.6 }}
					onClick={(event) => {
						setSelectedFeature(`Selected: ${event.feature.properties.name}`);
					}}
				/>
			</MapContainer>
			<p id="selected-feature" data-testid="selected-feature" aria-live="polite">
				{selectedFeature}
			</p>
			<p data-testid="map-center">0.00,0.00</p>
		</main>
	);
}

createRoot(document.getElementById('root')).render(<Fixture />);
