import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cn, t as Wordmark } from "./brand-Q_2EG5dj.mjs";
import { E as Bookmark, S as Heart, d as Send, g as Pause, h as Play, n as VolumeX, r as Volume2, v as Music2, w as Download, y as MessageCircle } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BUJZhIkX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reel-1gEoaVkP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var REEL_SRC = "/reel/alpha-testers.mp4?v=alpha";
var REEL_POSTER = "/reel/alpha-poster.jpg";
var REEL_FILENAME = "TEMPLE-WIRED-alpha-teaser.mp4";
var REEL_CAPTION = `Die Alpha ist offen.

Vier Agenten. Eine Schleife.
Recon · Exploit · Detect · Harden

TEMPLE // WIRED sucht Alpha-Tester.

#alphatest #cybersecurity #purpleteam #infosec`;
function IconRailButton({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "flex size-11 items-center justify-center rounded-full bg-bg/35 text-fg backdrop-blur-sm",
		children
	});
}
function ReelPlayer({ className }) {
	const videoRef = (0, import_react.useRef)(null);
	const [muted, setMuted] = (0, import_react.useState)(true);
	const [playing, setPlaying] = (0, import_react.useState)(true);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [liked, setLiked] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
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
		el.play().catch(() => setPlaying(false));
		return () => {
			el.removeEventListener("timeupdate", onTime);
			el.removeEventListener("play", onPlay);
			el.removeEventListener("pause", onPause);
		};
	}, []);
	function togglePlay() {
		const el = videoRef.current;
		if (!el) return;
		if (el.paused) el.play();
		else el.pause();
	}
	function toggleMute() {
		const el = videoRef.current;
		if (!el) return;
		el.muted = !el.muted;
		setMuted(el.muted);
		if (!el.muted) el.play();
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex w-full flex-col items-center", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative w-full max-w-[390px]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative aspect-[9/16] overflow-hidden rounded-xl border border-border-strong bg-bg shadow-[0_0_40px_color-mix(in_oklab,var(--color-primary)_18%,transparent)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							ref: videoRef,
							className: "absolute inset-0 size-full object-cover",
							src: REEL_SRC,
							poster: REEL_POSTER,
							playsInline: true,
							loop: true,
							muted,
							autoPlay: true,
							preload: "auto",
							onClick: togglePlay
						}, REEL_SRC),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pointer-events-none absolute inset-x-3 top-3 z-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-0.5 overflow-hidden rounded-full bg-fg/25",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full bg-fg",
									style: { width: `${progress * 100}%` }
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-sans text-[11px] font-semibold tracking-[0.2em] text-fg uppercase",
									children: "Reels"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-[10px] tracking-[0.14em] text-fg/80 uppercase",
									children: "15s · 9:16"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: togglePlay,
							className: "absolute inset-0 z-[5]",
							"aria-label": playing ? "Pause reel" : "Play reel"
						}),
						!playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute inset-0 z-[6] flex items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-16 items-center justify-center rounded-full bg-bg/50 text-fg backdrop-blur-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-7 fill-current" })
							})
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute top-14 right-3 z-10 flex flex-col items-center gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: toggleMute,
									className: "flex size-11 items-center justify-center rounded-full bg-bg/40 text-fg backdrop-blur-sm",
									"aria-label": muted ? "Ton an" : "Ton aus",
									children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setLiked((v) => !v),
									className: "flex flex-col items-center gap-1",
									"aria-label": "Like",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex size-11 items-center justify-center rounded-full bg-bg/35 text-fg backdrop-blur-sm",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-5", liked && "fill-danger text-danger") })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-sans text-[10px] font-semibold tracking-[0.08em] text-fg",
										children: liked ? "1" : "0"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconRailButton, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-5" }) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconRailButton, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-5" }) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconRailButton, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-5" }) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 flex size-11 items-center justify-center rounded-full border border-fg/40 bg-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "size-4 text-bg" })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-bg/80 to-transparent px-4 pt-16 pb-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-8 items-center justify-center rounded-full border border-primary bg-elevated font-sans text-[10px] font-bold tracking-[0.12em] text-primary",
									children: "T"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-sans text-[13px] font-semibold text-fg",
									children: "temple.wired"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-1 font-mono text-[10px] tracking-[0.08em] text-cyan uppercase",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "size-3" }), "Original audio"]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 max-w-[16rem] text-[12px] leading-snug text-fg/90",
								children: "Die Alpha ist offen. Werde Tester."
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex w-full max-w-[390px] flex-col gap-2 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: REEL_SRC,
					download: REEL_FILENAME,
					className: "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-sm border border-primary bg-primary px-4 font-sans text-[11px] font-semibold tracking-[0.12em] text-bg uppercase transition-transform duration-150 ease-out active:scale-[0.98]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), "Download Reel"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "cyan",
					className: "flex-1",
					onClick: copyCaption,
					children: copied ? "Caption copied" : "Copy caption"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-[390px] text-center font-mono text-[10px] tracking-[0.12em] text-muted uppercase",
				children: "1080 × 1920 · 15 seconds · H.264 · ready for Instagram"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 hidden items-center gap-2 text-faint sm:flex",
				children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[10px] tracking-[0.14em] uppercase",
					children: "Tap the frame to pause"
				})]
			})
		]
	});
}
function ReelPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative z-10 min-h-dvh bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between px-5 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "font-sans text-[11px] tracking-[0.14em] text-muted uppercase hover:text-primary",
				children: "Home"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto flex max-w-lg flex-col items-center px-5 pb-16",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 font-sans text-[11px] tracking-[0.28em] text-cyan uppercase",
				children: "Alpha-Teaser"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReelPlayer, {})]
		})]
	});
}
//#endregion
export { ReelPage as component };
