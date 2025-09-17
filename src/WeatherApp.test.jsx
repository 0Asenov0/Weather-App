import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WeatherApp from './WeatherApp';
import { vi } from 'vitest';


global.fetch = vi.fn((url) => {
  console.log('Fetch called with URL:', url);
  
 
  if (url.includes('nominatim.openstreetmap.org')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ 
        lat: "52.52", 
        lon: "13.41",
        display_name: "Berlin, Germany"
      }])
    });
  }
  
 
  if (url.includes('api.open-meteo.com')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        current_weather: { 
          temperature: 22, 
          windspeed: 10, 
          weathercode: 1,
          time: "2023-07-15T12:00"
        },
        hourly: {
          time: ["2023-07-15T12:00"],
          temperature_2m: [22],
          apparent_temperature: [21],
          relativehumidity_2m: [60],
          weathercode: [1]
        }
      })
    });
  }
  
 
  return Promise.reject(new Error("Unknown URL"));
});


beforeEach(() => {
  fetch.mockClear();
});

test('renders Weather App heading', () => {
  render(<WeatherApp />);
  expect(screen.getByText(/Weather App/i)).toBeInTheDocument();
});

test('allows user to type city name', async () => {
  render(<WeatherApp />);
  const input = screen.getByPlaceholderText(/Enter city/i);
  await userEvent.type(input, 'Berlin');
  expect(input.value).toBe('Berlin');
});

test('renders search button', () => {
  render(<WeatherApp />);
  const button = screen.getByRole('button', { name: /search/i });
  expect(button).toBeInTheDocument();
});

test('displays weather info after search', async () => {
  render(<WeatherApp />);
  const input = screen.getByPlaceholderText(/Enter city/i);
  const button = screen.getByRole('button', { name: /search/i });

  await userEvent.type(input, 'Berlin');
  await userEvent.click(button);


  await waitFor(() => {
    expect(screen.getByText(/Current Weather/i)).toBeInTheDocument();
  });
  
  expect(screen.getByText(/22°C/i)).toBeInTheDocument();
  expect(screen.getByText(/60%/i)).toBeInTheDocument();
  expect(screen.getByText(/10 km\/h/i)).toBeInTheDocument();
});