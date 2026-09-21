import { Ban, Wallet } from "lucide-react";

const PAYMENT_POINTS = [
  "40% advance payment is required to confirm the tour booking.",
  "The remaining 60% balance must be paid before the tour starts.",
  "Hotel, transport and special tour bookings may require a higher advance payment.",
  "Bookings are subject to availability until payment is received and confirmation is issued.",
  "Any additional services or personal expenses will be charged separately.",
];

const CANCELLATION_ROWS: [string, string][] = [
  ["60 days or more", "10%"],
  ["45–59 days", "20%"],
  ["30–44 days", "30%"],
  ["15–29 days", "50%"],
  ["7–14 days", "75%"],
  ["3–6 days", "90%"],
  ["Less than 3 days", "100%"],
  ["No-show", "100%"],
];

/** Static payment and cancellation policy shown on the booking screen. */
export function BookingPolicies() {
  return (
    <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border bg-background p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Wallet className="size-5 text-primary" />
          Payment Policy
        </h2>
        <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
          {PAYMENT_POINTS.map((point) => (
            <li key={point} className="flex gap-2.5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border bg-background p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Ban className="size-5 text-primary" />
          Cancellation Charges
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cancellation charges are calculated on the total tour package cost.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Cancellation before departure</th>
                <th className="py-2 text-right font-medium">Cancellation charge</th>
              </tr>
            </thead>
            <tbody>
              {CANCELLATION_ROWS.map(([when, charge]) => (
                <tr key={when} className="border-b last:border-0">
                  <td className="py-2 pr-4 text-foreground">{when}</td>
                  <td className="py-2 text-right font-semibold text-foreground">{charge}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
