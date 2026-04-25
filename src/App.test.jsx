import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders Paseando Ando title', () => {
  const { getByText } = render(<App />);
  const titleElement = getByText(/Paseando Ando/i);
  expect(titleElement).toBeInTheDocument();
});
