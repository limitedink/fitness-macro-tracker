import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { ColorModeProvider } from './context/ColorModeContext';
import { ToastProvider } from './context/ToastContext';

const renderApp = () =>
  render(
    <ColorModeProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ColorModeProvider>,
  );

beforeEach(() => localStorage.clear());

describe('App', () => {
  it('starts on today with an empty log', async () => {
    renderApp();

    expect(await screen.findByText('Nothing logged yet')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('logs a meal and shows it in the totals', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText('Nothing logged yet');

    await user.type(screen.getByLabelText(/what did you eat/i), 'Chicken');
    await user.type(screen.getByLabelText(/^Protein \(g\)/), '40');
    await user.type(screen.getByLabelText(/^Carbs \(g\)/), '0');
    await user.type(screen.getByLabelText(/^Fat \(g\)/), '5');

    // 40*4 + 5*9 = 205 cal, and 205 * 4.184 = 858 kJ
    expect(screen.getByText('≈ 205 cal · 858 kJ')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /add meal/i }));

    expect(await screen.findByText('Chicken')).toBeInTheDocument();
    expect(screen.getByText('40g protein')).toBeInTheDocument();

    // 205 shows twice: once on the meal row, once in the ring's running total,
    // and each is accompanied by the same figure in kilojoules.
    await waitFor(() => expect(screen.getAllByText('205')).toHaveLength(2));
    expect(screen.getAllByText('858 kJ')).toHaveLength(2);
  });

  it('persists a target and applies it to the ring', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText('Nothing logged yet');

    await user.click(screen.getByRole('button', { name: /set target/i }));
    const dialog = await screen.findByRole('dialog');

    await user.type(within(dialog).getByLabelText(/^Protein/), '150');
    await user.type(within(dialog).getByLabelText(/^Carbs/), '200');
    await user.type(within(dialog).getByLabelText(/^Fat/), '60');
    await user.click(within(dialog).getByRole('button', { name: /save target/i }));

    // 150*4 + 200*4 + 60*9 = 1940 cal, none eaten yet.
    await waitFor(() => expect(screen.getByText('1940')).toBeInTheDocument());
    expect(screen.getByText('cal left')).toBeInTheDocument();
    // The same headline figure, shown in kilojoules underneath.
    expect(screen.getByText('8,117 kJ')).toBeInTheDocument();
    expect(screen.getByText('0 / 1940 cal')).toBeInTheDocument();
  });

  it('fills the target in from bodyweight', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText('Nothing logged yet');

    await user.click(screen.getByRole('button', { name: /set target/i }));
    const dialog = await screen.findByRole('dialog');

    await user.click(within(dialog).getByRole('button', { name: /calculate from bodyweight/i }));
    await user.type(within(dialog).getByLabelText(/bodyweight/i), '80');

    // 80 kg at the default 2.35 / 3 / 0.75 g/kg.
    expect(await within(dialog).findByText('188 g')).toBeInTheDocument();
    expect(within(dialog).getByText('240 g')).toBeInTheDocument();
    expect(within(dialog).getByText('60 g')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: /use these numbers/i }));

    // The gram fields above are filled in, and stay editable. Queried by role
    // because the sliders carry matching accessible names of their own.
    expect(within(dialog).getByRole('spinbutton', { name: /^Protein/ })).toHaveValue(188);
    expect(within(dialog).getByRole('spinbutton', { name: /^Carbs/ })).toHaveValue(240);
    expect(within(dialog).getByRole('spinbutton', { name: /^Fat/ })).toHaveValue(60);

    await user.click(within(dialog).getByRole('button', { name: /save target/i }));

    // 188*4 + 240*4 + 60*9 = 2252 cal
    await waitFor(() => expect(screen.getByText('2252')).toBeInTheDocument());
  });

  it('moves between days', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText('Nothing logged yet');

    await user.click(screen.getByRole('button', { name: /previous day/i }));
    expect(await screen.findByText('Yesterday')).toBeInTheDocument();

    // There is no data for tomorrow, so stepping forward past today is blocked.
    await user.click(screen.getByRole('button', { name: /next day/i }));
    await screen.findByText('Today');
    expect(screen.getByRole('button', { name: /next day/i })).toBeDisabled();
  });
});
