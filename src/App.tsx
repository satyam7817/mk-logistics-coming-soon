import { useEffect, useMemo, useState } from "react";
import { OceanBackground } from "./backgrounds";

const TARGET_TIME = new Date("2026-11-08T19:00:00+05:30").getTime();

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  complete: boolean;
};

function getTimeLeft(): TimeLeft {
  const difference = Math.max(0, TARGET_TIME - Date.now());

  if (difference === 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, complete: true };
  }

  const totalSeconds = Math.floor(difference / 1000);

  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    complete: false,
  };
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function CountdownUnit({
  value,
  label,
  wide = false,
}: {
  value: number;
  label: string;
  wide?: boolean;
}) {
  return (
    <div className={`countdown-unit${wide ? " countdown-unit-wide" : ""}`}>
      <span className="countdown-value">{pad(value)}</span>
      <span className="countdown-label">{label}</span>
    </div>
  );
}

export default function App() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const targetLabel = useMemo(
    () => "8 November 2026 · 7:00 PM IST (GMT+05:30)",
    [],
  );

  return (
    <main className="coming-soon-shell">
      <OceanBackground className="ocean-background" frameRate={30} />
      <div className="background-overlay" />

      <section className="coming-soon-content" aria-labelledby="coming-soon-title">
        <p className="eyebrow"></p>

        <h1 id="coming-soon-title">Something New Comming Soon</h1>

        <p className="intro">
          We are preparing something new. Stay tuned.
        </p>

        {timeLeft.complete ? (
          <div className="launch-message">We&apos;re live.</div>
        ) : (
          <div className="countdown" aria-label={`Countdown to ${targetLabel}`}>
            <CountdownUnit value={timeLeft.days} label="Days" wide />
            <span className="countdown-separator" aria-hidden="true">:</span>
            <CountdownUnit value={timeLeft.hours} label="Hours" />
            <span className="countdown-separator" aria-hidden="true">:</span>
            <CountdownUnit value={timeLeft.minutes} label="Minutes" />
            <span className="countdown-separator" aria-hidden="true">:</span>
            <CountdownUnit value={timeLeft.seconds} label="Seconds" />
          </div>
        )}

        <p className="launch-date">{targetLabel}</p>
      </section>
    </main>
  );
}
