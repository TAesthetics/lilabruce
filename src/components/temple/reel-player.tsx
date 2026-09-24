import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bookmark,
  Download,
  Heart,
  MessageCircle,
  Music2,
  Pause,
  Play,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const REEL_SRC = "/reel/alpha-testers.mp4?v=alpha";
export const REEL_POSTER = "/reel/alpha-poster.jpg";
export const REEL_FILENAME = "TEMPLE-WIRED-alpha-teaser.mp4";

export const REEL_CAPTION = `Die Alpha ist offen.

Vier Agenten. Eine Schleife.
Recon · Exploit · Detect · Harden

TEMPLE // WIRED sucht Alpha-Tester.

#alphatest #cybersecurity #purpleteam #infosec`;

function IconRailButton({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-11 items-center justify-center rounded-full bg-bg/35 text-fg backdrop-blur-sm">
      {children}
    </span>
  );
}

export function ReelPlayer({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onTime = () => {
      if (el.duration) setProgress(el.currentTime / el.duration);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    void el.play().catch(() => setPlaying(false));
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, []);

  function togglePlay() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  }

  function toggleMute() {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
    if (!el.muted) void el.play();
  }

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(REEL_CAPTION);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      <div className="relative w-full max-w-[390px]">
        <div className="relative aspect-[9/16] overflow-hidden rounded-xl border border-border-strong bg-bg shadow-[0_0_40px_color-mix(in_oklab,var(--color-primary)_18%,transparent)]">
          <video
            ref={videoRef}
            className="absolute inset-0 size-full object-cover"
            src={REEL_SRC}
            poster={REEL_POSTER}
            key={REEL_SRC}
            playsInline
            loop
            muted={muted}
            autoPlay
            preload="auto"
            onClick={togglePlay}
          />

          <div className="pointer-events-none absolute inset-x-3 top-3 z-10">
            <div className="h-0.5 overflow-hidden rounded-full bg-fg/25">
              <div
                className="h-full bg-fg"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="font-sans text-[11px] font-semibold tracking-[0.2em] text-fg uppercase">
                Reels
              </p>
              <p className="font-mono text-[10px] tracking-[0.14em] text-fg/80 uppercase">
                15s · 9:16
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 z-[5]"
            aria-label={playing ? "Pause reel" : "Play reel"}
          />

          {!playing ? (
            <div className="pointer-events-none absolute inset-0 z-[6] flex items-center justify-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-bg/50 text-fg backdrop-blur-sm">
                <Play className="size-7 fill-current" />
              </span>
            </div>
          ) : null}

          <div className="absolute top-14 right-3 z-10 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={toggleMute}
              className="flex size-11 items-center justify-center rounded-full bg-bg/40 text-fg backdrop-blur-sm"
              aria-label={muted ? "Ton an" : "Ton aus"}
            >
              {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </button>
            <button
              type="button"
              onClick={() => setLiked((v) => !v)}
              className="flex flex-col items-center gap-1"
              aria-label="Like"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-bg/35 text-fg backdrop-blur-sm">
                <Heart
                  className={cn("size-5", liked && "fill-danger text-danger")}
                />
              </span>
              <span className="font-sans text-[10px] font-semibold tracking-[0.08em] text-fg">
                {liked ? "1" : "0"}
              </span>
            </button>
            <IconRailButton>
              <MessageCircle className="size-5" />
            </IconRailButton>
            <IconRailButton>
              <Send className="size-5" />
            </IconRailButton>
            <IconRailButton>
              <Bookmark className="size-5" />
            </IconRailButton>
            <div className="mt-1 flex size-11 items-center justify-center rounded-full border border-fg/40 bg-primary">
              <Music2 className="size-4 text-bg" />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-bg/80 to-transparent px-4 pt-16 pb-5">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full border border-primary bg-elevated font-sans text-[10px] font-bold tracking-[0.12em] text-primary">
                T
              </span>
              <div>
                <p className="font-sans text-[13px] font-semibold text-fg">
                  temple.wired
                </p>
                <p className="flex items-center gap-1 font-mono text-[10px] tracking-[0.08em] text-cyan uppercase">
                  <Music2 className="size-3" />
                  Original audio
                </p>
              </div>
            </div>
            <p className="mt-2 max-w-[16rem] text-[12px] leading-snug text-fg/90">
              Die Alpha ist offen. Werde Tester.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex w-full max-w-[390px] flex-col gap-2 sm:flex-row">
        <a
          href={REEL_SRC}
          download={REEL_FILENAME}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-sm border border-primary bg-primary px-4 font-sans text-[11px] font-semibold tracking-[0.12em] text-bg uppercase transition-transform duration-150 ease-out active:scale-[0.98]"
        >
          <Download className="size-3.5" />
          Download Reel
        </a>
        <Button type="button" variant="cyan" className="flex-1" onClick={copyCaption}>
          {copied ? "Caption copied" : "Copy caption"}
        </Button>
      </div>
      <p className="mt-3 max-w-[390px] text-center font-mono text-[10px] tracking-[0.12em] text-muted uppercase">
        1080 × 1920 · 15 seconds · H.264 · ready for Instagram
      </p>
      <div className="mt-2 hidden items-center gap-2 text-faint sm:flex">
        {playing ? <Pause className="size-3" /> : <Play className="size-3" />}
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase">
          Tap the frame to pause
        </span>
      </div>
    </div>
  );
}
