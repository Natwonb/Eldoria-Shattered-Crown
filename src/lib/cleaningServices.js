export const SERVICES = [
  {
    value: 'standard',
    label: 'Standard clean',
    blurb: 'Kitchen, bathrooms, floors and surfaces — the weekly reset that keeps a home easy.',
    duration: '2–3 hours',
    from: 150,
  },
  {
    value: 'deep',
    label: 'Deep clean',
    blurb: 'A standard clean plus baseboards, grout, vents and the inside of the appliances.',
    duration: '4–5 hours',
    from: 250,
  },
  {
    value: 'move',
    label: 'Move-out clean',
    blurb: 'An empty-home detail for handovers, deposits and the keys going back.',
    duration: '4–6 hours',
    from: 400,
  },
  {
    value: 'office',
    label: 'Office & studio',
    blurb: 'After-hours cleaning for small teams, studios and shared workspaces.',
    duration: '2–3 hours',
    from: 300,
  },
];

export const TIME_SLOTS = [
  { value: '08:00', label: '8:00 – 10:00 AM' },
  { value: '10:00', label: '10:00 AM – 12:00 PM' },
  { value: '12:00', label: '12:00 – 2:00 PM' },
  { value: '14:00', label: '2:00 – 4:00 PM' },
  { value: '16:00', label: '4:00 – 6:00 PM' },
];

export const getService = (value) => SERVICES.find((service) => service.value === value) || SERVICES[0];

export const getSlot = (value) => TIME_SLOTS.find((slot) => slot.value === value);

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const formatDate = (value) => {
  if (!value) return '';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

export const formatShortDate = (value) => {
  if (!value) return '';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};