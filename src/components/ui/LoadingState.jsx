import { useEffect, useState } from "react"

/* ─────────────────────────────────────────────────────────
 * LoadingState — 픽셀 그리드 로더 + 샤이머 레이블 + 경과 타이머
 *
 * 사용법:
 *   <LoadingState />                        // 기본 (Drive, "로딩 중")
 *   <LoadingState label="차량 검색 중" />
 *   <LoadingState variant="Dots" />
 *   <LoadingState variant="Orbit" />
 *   <LoadingState variant="Surfer" />       // 밈 비디오 포함
 *
 * variant: "Drive" | "Dots" | "Orbit" | "Surfer"
 *
 * 필요 CSS (@keyframes): src/index.css 에 loading-state-keyframes 주석 블록 참조
 * ───────────────────────────────────────────────────────── */

const chevron = Array.from({ length: 9 }, (_, i) => {
  const r = Math.floor(i / 3), c = i % 3
  return (c + Math.abs(r - 1)) * 90
})

const ORBIT_ORDER = [0, 1, 2, 5, 8, 7, 6, 3]
const orbit = Array.from({ length: 9 }, (_, i) => {
  const k = ORBIT_ORDER.indexOf(i)
  return k === -1 ? null : k * 110
})

const PATTERNS = {
  Drive: { delays: chevron, dur: 650, round: false },
  Dots:  { delays: chevron, dur: 650, round: true  },
  Orbit: { delays: orbit,   dur: 950, round: false },
}

function LoaderGrid({ delays, dur, round }) {
  return (
    <span aria-hidden className="grid shrink-0 grid-cols-[repeat(3,4px)] gap-[1.5px]">
      {delays.map((delay, index) => (
        <span
          key={index}
          className={`size-[4px] ${round ? "rounded-full" : "rounded-[1px]"}`}
          style={{
            backgroundColor: "#171A20",
            opacity: delay === null ? 0.07 : 0.15,
            animation:
              delay === null
                ? "none"
                : `ls-pixel-on ${dur}ms ease-in-out ${delay}ms infinite`,
          }}
        />
      ))}
    </span>
  )
}

function useElapsed() {
  const [ds, setDs] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setDs((d) => d + 1), 100)
    return () => clearInterval(t)
  }, [])
  const total = ds / 10
  if (total < 60) return `${total.toFixed(1)}s`
  return `${Math.floor(total / 60)}m ${(total % 60).toFixed(1)}s`
}

export default function LoadingState({
  label,
  variant = "Drive",
  videoSrc = "/subway-surfers.mp4",
}) {
  const elapsed = useElapsed()
  const surfer = variant === "Surfer"
  const resolvedLabel = label ?? (surfer ? "Subway surfing" : "로딩 중")
  const [videoOk, setVideoOk] = useState(true)
  const { delays, dur, round } = PATTERNS[variant] ?? PATTERNS.Drive

  const labelEl = (
    <span
      className="bg-clip-text text-[13px] font-medium text-transparent"
      style={{
        backgroundImage:
          "linear-gradient(90deg, #8E8E8E 35%, #171A20 50%, #8E8E8E 65%)",
        backgroundSize: "200% 100%",
        animation: "ls-shimmer 1.4s linear infinite",
      }}
    >
      {resolvedLabel}
    </span>
  )

  const elapsedEl = (
    <span
      className="font-mono text-[12px] tabular-nums"
      style={{ color: "#8E8E8E" }}
    >
      {elapsed}
    </span>
  )

  if (surfer) {
    return (
      <div role="status" className="flex w-fit flex-col items-start">
        <div className="flex items-center gap-2.5">
          <LoaderGrid {...PATTERNS.Drive} />
          {labelEl}
          {elapsedEl}
        </div>
        <div
          className="mt-2 w-56 overflow-hidden rounded-[10px]"
          style={{
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            animation: "ls-pop-in 200ms cubic-bezier(0.16,1,0.3,1) both",
            transformOrigin: "top left",
          }}
        >
          <div
            className="relative aspect-video w-full"
            style={{ backgroundColor: "#F4F4F4" }}
          >
            {videoOk ? (
              <video
                src={videoSrc}
                autoPlay
                muted
                loop
                playsInline
                onError={() => setVideoOk(false)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1.5">
                <LoaderGrid {...PATTERNS.Drive} />
                <span
                  className="px-3 text-center font-mono text-[10px]"
                  style={{ color: "#8E8E8E" }}
                >
                  Video unavailable
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div role="status" className="flex w-fit items-center gap-2.5">
      <LoaderGrid delays={delays} dur={dur} round={round} />
      {labelEl}
      {elapsedEl}
    </div>
  )
}
