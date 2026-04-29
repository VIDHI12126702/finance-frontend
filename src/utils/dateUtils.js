export const formatDateForApi = (value) => {
  if (!value) return null;

  const d = value instanceof Date ? value : parseLocalDate(value);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const parseLocalDate = (value) => {
  if (!value) return new Date();

  if (value instanceof Date) return value;

  const [year, month, day] = String(value).split("-").map(Number);

  if (!year || !month || !day) return new Date();

  return new Date(year, month - 1, day);
};

export const todayOnly = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

export const isFutureDate = (value) => {
  if (!value) return false;
  return parseLocalDate(value) > todayOnly();
};