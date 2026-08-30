"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  poster: string;
  posterBlur: string;
  width: number;
  height: number;
  caption: string;
  accent: string;
  /** Offer a sound toggle — only when the clip actually carries an audio track. */
  sound?: boolean;
};

/**
 * A clip inside the reader. Plays muted and loops while it is on screen and
 * pauses when it leaves, so a page of films stays quiet and cheap. A viewer's
 * own pause always wins over the scroll behaviour, and reduced-motion readers
 * get a still until they press play.
 */
export default function ArticleFilm({
  src,
  poster,
  posterBlur,
  width,
  height,
  caption,
  accent,
  sound = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pausedByViewer = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [started, setStarted] = useState(false);
  const [viewerPaused, setViewerPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // The ref drives the observer (no stale closure); the state drives the cue.
  const rememberViewerPause = (paused: boolean) => {
    pausedByViewer.current = paused;
    setViewerPaused(paused);
  };

  // Scrolling away pauses the clip, so the standing play cue is only for a film
  // that hasn't begun or that the viewer stopped themselves.
  const showCue = !playing && (!started || viewerPaused);

  // Autoplay while in view — unless the viewer paused it, or asked for less motion.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!pausedByViewer.current) video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      rememberViewerPause(false);
      video.play().catch(() => {});
    } else {
      rememberViewerPause(true);
      video.pause();
    }
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  return (
    <div
      className="film relative overflow-hidden rounded-[2px] bg-ph"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <video
        ref={videoRef}
        src={src}
        width={width}
        height={height}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={caption}
        onClick={toggle}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
        }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration) setProgress(v.currentTime / v.duration);
        }}
        className="block w-full h-full object-cover cursor-pointer"
      />

      {/* Still frame, held until the clip actually starts — no black flash. */}
      <Image
        src={poster}
        alt={caption}
        width={width}
        height={height}
        placeholder="blur"
        blurDataURL={posterBlur}
        sizes="(max-width: 780px) 100vw, 620px"
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none ${
          started ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Resting state: a quiet play cue for readers whose clip hasn't begun. */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause film" : "Play film"}
        className={`filmcue absolute inset-0 grid place-items-center cursor-pointer ${
          showCue ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <span className="filmcue-dot grid place-items-center w-[54px] h-[54px] rounded-full">
          <svg viewBox="0 0 12 14" width="12" height="14" aria-hidden="true" fill="currentColor">
            <path d="M0 0l12 7-12 7z" />
          </svg>
        </span>
      </button>

      <div className="absolute right-[10px] bottom-[10px] flex items-center gap-[6px]">
        {sound && (
          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? "Unmute film" : "Mute film"}
            className="filmbtn"
          >
            <svg
              viewBox="0 0 16 16"
              width="13"
              height="13"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            >
              <path d="M7 2.6 4 5.2H1.7v5.6H4L7 13.4z" fill="currentColor" stroke="none" />
              {muted ? (
                <path d="m10.6 6.2 3.4 3.6M14 6.2l-3.4 3.6" />
              ) : (
                <path d="M10.2 6a2.9 2.9 0 0 1 0 4M12.5 4a6 6 0 0 1 0 8" />
              )}
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause film" : "Play film"}
          className="filmbtn"
        >
          {playing ? (
            <svg viewBox="0 0 12 14" width="11" height="12" aria-hidden="true" fill="currentColor">
              <path d="M0 0h4v14H0zM8 0h4v14H8z" />
            </svg>
          ) : (
            <svg viewBox="0 0 12 14" width="11" height="12" aria-hidden="true" fill="currentColor">
              <path d="M0 0l12 7-12 7z" />
            </svg>
          )}
        </button>
      </div>

      <span
        aria-hidden="true"
        className="absolute left-0 bottom-0 h-[2px] origin-left transition-[width] duration-200 ease-linear"
        style={{ width: `${progress * 100}%`, background: accent }}
      />
    </div>
  );
}
