export const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export const getMinEndDate = (startDate: string): string => {
  const start = new Date(startDate);
  const minEnd = new Date(start);
  minEnd.setDate(start.getDate() + 1); // One day after start

  const today = new Date();
  return minEnd >= today ? minEnd.toISOString().split("T")[0] : getTodayDate();
};
