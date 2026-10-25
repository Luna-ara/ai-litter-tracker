const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** 2500 -> "$25.00" */
export function formatCents(cents: number): string {
  return currency.format(cents / 100);
}

/** -> "Oct 25, 9:02 AM" */
export function formatDate(d: Date | number): string {
  return dateTime.format(d);
}
