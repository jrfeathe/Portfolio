import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Book a meeting | Jack Featherstone",
  description: "Placeholder route for scheduling a future intro conversation."
};

export default function MeetingsPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col gap-6 px-4 py-16 text-lg">
      <h1 className="text-3xl font-semibold">Calendars open soon.</h1>
      <p>
        I am still finalizing logistics for booking short intro meetings. If you want to connect
        before the scheduling flow is live, please email{" "}
        <a href="mailto:jfstone2000@proton.me" className="text-accent underline underline-offset-4">
          jfstone2000@proton.me
        </a>{" "}
        and I will reply directly.
      </p>
      <p>
        You can also{" "}
        <Link href="/en" className="text-accent underline underline-offset-4">
          jump back to the home page
        </Link>{" "}
        for the latest updates.
      </p>
    </main>
  );
}
