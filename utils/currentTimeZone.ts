export const getCurrentTimeZone = (): string => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const hours = Math.floor(offset / 60);
  return hours < 10 ? `0${Math.abs(hours)}` : `${Math.abs(hours)}`;
};
