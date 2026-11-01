import { useEffect, useMemo, useRef, useState } from "react";
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

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioCtor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioCtor) {
    return null;
  }

  return new AudioCtor();
}

function playClockTick(audioContext: AudioContext) {
  const now = audioContext.currentTime;
  const master = audioContext.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  master.connect(audioContext.destination);

  const primaryOsc = audioContext.createOscillator();
  primaryOsc.type = "square";
  primaryOsc.frequency.setValueAtTime(2200, now);
  primaryOsc.frequency.exponentialRampToValueAtTime(680, now + 0.09);

  const primaryGain = audioContext.createGain();
  primaryGain.gain.setValueAtTime(0.0001, now);
  primaryGain.gain.exponentialRampToValueAtTime(0.18, now + 0.006);
  primaryGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

  const harmonicOsc = audioContext.createOscillator();
  harmonicOsc.type = "triangle";
  harmonicOsc.frequency.setValueAtTime(1250, now);
  harmonicOsc.frequency.exponentialRampToValueAtTime(540, now + 0.11);

  const harmonicGain = audioContext.createGain();
  harmonicGain.gain.setValueAtTime(0.0001, now);
  harmonicGain.gain.exponentialRampToValueAtTime(0.1, now + 0.008);
  harmonicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

  primaryOsc.connect(primaryGain);
  primaryGain.connect(master);

  harmonicOsc.connect(harmonicGain);
  harmonicGain.connect(master);

  primaryOsc.start(now);
  harmonicOsc.start(now);
  primaryOsc.stop(now + 0.10);
  harmonicOsc.stop(now + 0.14);
}

export default function App() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft());
  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundEnabledRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const ensureAudioReady = async () => {
    if (!audioContextRef.current) {
      const context = getAudioContext();
      if (!context) {
        return null;
      }
      audioContextRef.current = context;
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    return audioContextRef.current;
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((previous) => {
        const next = getTimeLeft();

        if (
          soundEnabledRef.current &&
          !previous.complete &&
          !next.complete &&
          next.seconds !== previous.seconds
        ) {
          void ensureAudioReady().then((context) => {
            if (context) {
              playClockTick(context);
            }
          });
        }

        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const targetLabel = useMemo(
    () => "8 November 2026 · 7:00 PM IST (GMT+05:30)",
    [],
  );

  const toggleSound = async () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);

    if (nextState) {
      await ensureAudioReady();
      const context = audioContextRef.current;
      if (context) {
        playClockTick(context);
      }
    }
  };

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

        <button
          type="button"
          className={`sound-toggle${soundEnabled ? " sound-toggle-enabled" : ""}`}
          onClick={toggleSound}
          aria-pressed={soundEnabled}
        >
          {soundEnabled ? "Sound: On" : "Sound: Off"}
        </button>

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
