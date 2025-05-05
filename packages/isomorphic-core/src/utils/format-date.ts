import dayjs from "dayjs";

export function formatDate(
  date?: Date,
  format: string = "DD MMM, YYYY"
): string {
  if (!date) return "";
  return dayjs(date).format(format);
}

export const formatTableDate = (
  dateInput: string | Date,
  addHours: number = 0
): string => {
  const date = new Date(dateInput);

  if (addHours) {
    date.setHours(date.getHours() + addHours);
  }

  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
};
