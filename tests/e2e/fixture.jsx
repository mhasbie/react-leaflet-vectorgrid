import React from 'react';
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
	return (
		<main>
			<h1>VectorGrid fixture</h1>
			<MapContainer center={[0, 0]} zoom={3} minZoom={1} maxZoom={8}>
				<VectorGrid
					data={data}
					idField="name"
					style={{ color: '#222222', fillColor: '#336699', fillOpacity: 0.6 }}
					onClick={(event) => {
						document.getElementById('selected-feature').textContent =
							`Selected: ${event.feature.properties.name}`;
					}}
				/>
			</MapContainer>
			<p id="selected-feature" data-testid="selected-feature" aria-live="polite">
				No feature selected
			</p>
		</main>
	);
}

createRoot(document.getElementById('root')).render(<Fixture />);
