import React from 'react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import 'src/__mocks__/setupUniqueIdMock';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import theme from 'src/styles/theme';
import { ThemeProvider } from 'styled-components/';
import Radio from './Radio';

describe('Radio', () => {
  it('test radio click', async () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Radio data-testid="radio" kind="radio" />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const radio = getByTestId('radio');

    expect(radio).not.toBeChecked();
    await userEvent.click(radio);
    expect(radio).toBeChecked();
  });

  it('test radio disabled state', async () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Radio data-testid="radio" kind="radio" disabled />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();

    const radio = getByTestId('radio');

    expect(radio).not.toBeChecked();
    await userEvent.click(radio);
    expect(radio).not.toBeChecked();
  });

  it('[NEGATIVE] should render with wrong props', () => {
    const { baseElement, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Radio
          data-testid="radio"
          kind="radio"
          checked={1 as unknown as boolean}
          onChange={() => {}}
        />
      </ThemeProvider>
    );

    expect(baseElement).toMatchSnapshot();
    expect(getByTestId('radio')).toBeChecked();
  });
});