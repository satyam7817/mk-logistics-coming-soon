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
  master.gain.exponentialRampToValueAtTime(0.18, now + 0.004);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  master.connect(audioContext.destination);

  const body = audioContext.createOscillator();
  body.type = "square";
  body.frequency.setValueAtTime(2200, now);
  body.frequency.exponentialRampToValueAtTime(140, now + 0.07);

  const bodyGain = audioContext.createGain();
  bodyGain.gain.setValueAtTime(0.0001, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.22, now + 0.003);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

  const harmonic = audioContext.createOscillator();
  harmonic.type = "triangle";
  harmonic.frequency.setValueAtTime(1100, now);
  harmonic.frequency.exponentialRampToValueAtTime(420, now + 0.12);

  const harmonicGain = audioContext.createGain();
  harmonicGain.gain.setValueAtTime(0.0001, now);
  harmonicGain.gain.exponentialRampToValueAtTime(0.14, now + 0.004);
  harmonicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

  const lowpass = audioContext.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.setValueAtTime(2600, now);
  lowpass.Q.value = 0.8;

  const clickBuffer = audioContext.createBuffer(1, 4096, audioContext.sampleRate);
  const clickData = clickBuffer.getChannelData(0);

  for (let i = 0; i < clickData.length; i += 1) {
    const envelope = Math.exp(-i / (clickData.length * 0.18));
    clickData[i] = (Math.random() * 2 - 1) * envelope * 0.9;
  }

  const noise = audioContext.createBufferSource();
  noise.buffer = clickBuffer;

  const noiseGain = audioContext.createGain();
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.09, now + 0.002);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

  body.connect(bodyGain);
  bodyGain.connect(master);

  harmonic.connect(harmonicGain);
  harmonicGain.connect(master);

  noise.connect(noiseGain);
  noiseGain.connect(lowpass);
  lowpass.connect(master);

  body.start(now);
  harmonic.start(now);
  noise.start(now);

  body.stop(now + 0.09);
  harmonic.stop(now + 0.13);
  noise.stop(now + 0.09);
}

export default function App() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const ensureAudioReady = async () => {
    if (!soundEnabledRef.current) {
      return null;
    }

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

  useEffect(() => {
    const unlock = () => {
      void ensureAudioReady().then((context) => {
        if (context) {
          playClockTick(context);
        }
      });
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const targetLabel = useMemo(
    () => "8 November 2026 · 7:00 PM IST (GMT+05:30)",
    [],
  );

  const toggleSound = async () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);

    if (nextState) {
      const context = await ensureAudioReady();
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
