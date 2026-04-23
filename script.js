const input = document.querySelector("#box-label-input");
const preview = document.querySelector("#box-label-preview");
const previewSecondary = document.querySelector("#box-label-preview-secondary");
const form = document.querySelector(".cta__search");
const heroCtaButton = document.querySelector("#hero-cta-button");
const ctaShareButton = document.querySelector("#cta-share-button");
const ctaShareStatus = document.querySelector("#cta-share-status");
const ctaVisual = document.querySelector(".cta__visual");
const ctaVisualImage = document.querySelector(".cta__visual-image");
const ctaLabelNote = document.querySelector(".cta__label-note");
const hotboxRendererMeta = document.querySelector('meta[name="hotbox-renderer-url"]');
const featuresSection = document.querySelector("#features");
const firstFeatureCard = document.querySelector("#feature-card-1");
const markers = Array.from(document.querySelectorAll("[data-marker]"));
const adaptiveCopyNodes = document.querySelectorAll("[data-mobile]");
const mobileBreakpoint = window.matchMedia("(max-width: 767px)");
const popupViewportGap = 12;
const FAST_SCROLL_EVENT_NAME = "landing:fast-scroll";
const FAST_SCROLL_WARNING_IMAGE_SOURCE = "./assets/warning.webp";
const FAST_SCROLL_WARNING_VISIBLE_MS = 950;
const FAST_SCROLL_COOLDOWN_MS = 1200;
const FAST_SCROLL_IGNORE_PROGRAMMATIC_MS = 1400;
const FAST_SCROLL_MIN_DISTANCE_PX = 80;
const FAST_SCROLL_DESKTOP_THRESHOLD_PX_PER_SEC = 2600;
const FAST_SCROLL_MOBILE_THRESHOLD_PX_PER_SEC = 1600;
const FAST_SCROLL_TOUCH_THRESHOLD_PX_PER_SEC = 1100;
const FAST_SCROLL_TOUCH_MIN_DISTANCE_PX = 72;
const defaultBoxLabelValue = "КОНТЕНТ 2020–2024 (НЕ КАНТОВАТЬ)";
const defaultBoxLabelPreview = ["КОНТЕНТ 2020–2024", "(НЕ КАНТОВАТЬ)"];
const CTA_EXPORT_VIDEO_SOURCE = "./assets/box.mp4";
const HOTBOX_RENDERER_BASE_URL = hotboxRendererMeta?.content.trim().replace(/\/$/, "") ?? "";
const boxLabelBreakOverrides = {
  "КОНТЕНТ 2020–2024 (НЕ КАНТОВАТЬ)": {
    primary: "КОНТЕНТ\n2020–2024",
    secondary: "(НЕ КАНТОВАТЬ)",
  },
  "ОХВАТЫ (БЫЛО 10К, СТАЛО 300, НО МЫ ВЕРИМ)": {
    primary: "ОХВАТЫ",
    secondary: "(БЫЛО 10К, СТАЛО 300,\nНО МЫ ВЕРИМ)",
  },
  "НЕРВЫ (ЗАКОНЧИЛИСЬ ЕЩЁ В 2022)": {
    primary: "НЕРВЫ",
    secondary: "(ЗАКОНЧИЛИСЬ\nЕЩЁ В 2022)",
  },
};
const CTA_EXPORT_SOURCES = {
  mobile: "./assets/cta-box-mobile.png",
  desktop: "./assets/cta-box-desktop.png",
};
const boxLabelOptions = [
  "КОНТЕНТ 2020–2024 (НЕ КАНТОВАТЬ)",
  "ПОДПИСЧИКИ (ЧАСТЬ ПРИБУДЕТ ПОЗЖЕ)",
  "ВОВЛЕЧЁННОСТЬ (ЕСЛИ НАЙДУ)",
  "КОММЕНТАРИИ (ОБРАЩАТЬСЯ БЕРЕЖНО)",
  "ОХВАТЫ (БЫЛО 10К, СТАЛО 300, НО МЫ ВЕРИМ)",
  "НЕРВЫ (ЗАКОНЧИЛИСЬ ЕЩЁ В 2022)",
];
const videoExportMimeTypes = [
  { mimeType: "video/mp4", extension: "mp4" },
  { mimeType: 'video/mp4;codecs="avc1.42E01E,mp4a.40.2"', extension: "mp4" },
  { mimeType: "video/webm", extension: "webm" },
  { mimeType: 'video/webm;codecs="vp9,opus"', extension: "webm" },
  { mimeType: 'video/webm;codecs="vp8,opus"', extension: "webm" },
];
const CTA_EXPORT_VIDEO_BOX_LAYOUT = {
  frameWidth: 941,
  frameHeight: 1672,
  x: 292,
  y: 1039,
  width: 362,
  height: 356,
  hideAfterSeconds: 6,
};

let isShareActionPending = false;
let ctaExportImagePromise = null;
let fastScrollCooldownUntil = 0;
let ignoreFastScrollUntil = 0;
let lastScrollY = window.scrollY;
let lastScrollTs = performance.now();
let fastScrollWarningNode = null;
let fastScrollWarningHideTimer = 0;
let lastTouchY = 0;
let lastTouchX = 0;
let lastTouchTs = 0;
let touchFastScrollHandled = false;
const previewTextMeasureCanvas = document.createElement("canvas");
const previewTextMeasureContext = previewTextMeasureCanvas.getContext("2d");

const getRandomBoxLabel = (currentValue) => {
  const currentLabel = currentValue.trim();
  const candidates = boxLabelOptions.filter((option) => option !== currentLabel);
  const pool = candidates.length > 0 ? candidates : boxLabelOptions;

  return pool[Math.floor(Math.random() * pool.length)];
};

const splitBoxLabelForPreview = (value) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return defaultBoxLabelPreview;
  }

  if (boxLabelBreakOverrides[trimmedValue]) {
    const override = boxLabelBreakOverrides[trimmedValue];
    return [override.primary, override.secondary];
  }

  const bracketIndex = trimmedValue.indexOf(" (");

  if (bracketIndex === -1) {
    return [trimmedValue, ""];
  }

  return [
    trimmedValue.slice(0, bracketIndex).trim(),
    trimmedValue.slice(bracketIndex + 1).trim(),
  ];
};

const getShareButtonLabel = () => {
  if (!ctaShareButton) return "";

  return mobileBreakpoint.matches
    ? ctaShareButton.dataset.mobile ?? ctaShareButton.textContent
    : ctaShareButton.dataset.desktop ?? ctaShareButton.textContent;
};

const setShareButtonPending = (isPending) => {
  isShareActionPending = isPending;

  if (!ctaShareButton) return;

  ctaShareButton.disabled = isPending;
  ctaShareButton.textContent = isPending
    ? "Готовим коробку..."
    : getShareButtonLabel();
};

const setShareStatus = (message = "") => {
  if (!ctaShareStatus) return;

  ctaShareStatus.textContent = message;
  ctaShareStatus.classList.toggle("is-visible", Boolean(message));
};

const createFastScrollWarningNode = () => {
  if (fastScrollWarningNode || !document.body) {
    return fastScrollWarningNode;
  }

  const node = document.createElement("div");
  const image = document.createElement("img");

  node.className = "fast-scroll-warning";
  node.setAttribute("aria-hidden", "true");

  image.className = "fast-scroll-warning__image";
  image.src = FAST_SCROLL_WARNING_IMAGE_SOURCE;
  image.alt = "";
  image.decoding = "async";
  image.loading = "eager";
  image.width = 860;
  image.height = 228;

  node.append(image);
  document.body.append(node);

  fastScrollWarningNode = node;
  return fastScrollWarningNode;
};

const showFastScrollWarning = () => {
  const node = createFastScrollWarningNode();

  if (!node) return;

  const image = node.querySelector(".fast-scroll-warning__image");

  if (image) {
    image.classList.remove("is-animating");
    void image.offsetWidth;
    image.classList.add("is-animating");
  }

  node.classList.add("is-visible");
  window.clearTimeout(fastScrollWarningHideTimer);
  fastScrollWarningHideTimer = window.setTimeout(() => {
    node.classList.remove("is-visible");
  }, FAST_SCROLL_WARNING_VISIBLE_MS);
};

const getFastScrollThreshold = () => (
  mobileBreakpoint.matches
    ? FAST_SCROLL_MOBILE_THRESHOLD_PX_PER_SEC
    : FAST_SCROLL_DESKTOP_THRESHOLD_PX_PER_SEC
);

const ignoreFastScrollForProgrammaticScroll = (
  durationMs = FAST_SCROLL_IGNORE_PROGRAMMATIC_MS
) => {
  ignoreFastScrollUntil = Math.max(ignoreFastScrollUntil, performance.now() + durationMs);
};

const emitFastScrollEvent = (detail) => {
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "fast_scroll",
      ...detail,
    });
  }

  document.dispatchEvent(new CustomEvent(FAST_SCROLL_EVENT_NAME, { detail }));
};

const triggerFastScroll = (detail) => {
  const now = performance.now();

  if (now < ignoreFastScrollUntil || now < fastScrollCooldownUntil) {
    return false;
  }

  fastScrollCooldownUntil = now + FAST_SCROLL_COOLDOWN_MS;
  emitFastScrollEvent(detail);
  return true;
};

const handleFastScrollDetection = () => {
  const now = performance.now();
  const currentY = window.scrollY;
  const previousY = lastScrollY;
  const deltaY = Math.abs(currentY - previousY);
  const deltaT = now - lastScrollTs;

  lastScrollY = currentY;
  lastScrollTs = now;

  if (deltaT <= 0 || now < ignoreFastScrollUntil || deltaY < FAST_SCROLL_MIN_DISTANCE_PX) {
    return;
  }

  const threshold = getFastScrollThreshold();
  const speedPxPerSec = (deltaY / deltaT) * 1000;

  if (speedPxPerSec < threshold) {
    return;
  }

  triggerFastScroll({
    speedPxPerSec: Math.round(speedPxPerSec),
    scrollY: Math.round(currentY),
    deltaY: Math.round(deltaY),
    direction: currentY >= previousY ? "down" : "up",
    viewport: mobileBreakpoint.matches ? "mobile" : "desktop",
    thresholdPxPerSec: threshold,
    input: "scroll",
  });
};

const handleTouchStart = (event) => {
  const touch = event.touches[0];

  if (!touch) return;

  lastTouchX = touch.clientX;
  lastTouchY = touch.clientY;
  lastTouchTs = performance.now();
  touchFastScrollHandled = false;
};

const handleTouchMove = (event) => {
  if (!mobileBreakpoint.matches || touchFastScrollHandled) {
    return;
  }

  const touch = event.touches[0];

  if (!touch) return;

  const now = performance.now();
  const deltaT = now - lastTouchTs;
  const deltaY = lastTouchY - touch.clientY;
  const deltaX = Math.abs(touch.clientX - lastTouchX);
  const absDeltaY = Math.abs(deltaY);

  if (deltaT <= 0) {
    lastTouchX = touch.clientX;
    lastTouchY = touch.clientY;
    lastTouchTs = now;
    return;
  }

  const speedPxPerSec = (absDeltaY / deltaT) * 1000;
  const isMostlyVertical = absDeltaY > deltaX * 1.2;

  if (
    isMostlyVertical &&
    absDeltaY >= FAST_SCROLL_TOUCH_MIN_DISTANCE_PX &&
    speedPxPerSec >= FAST_SCROLL_TOUCH_THRESHOLD_PX_PER_SEC
  ) {
    touchFastScrollHandled = triggerFastScroll({
      speedPxPerSec: Math.round(speedPxPerSec),
      scrollY: Math.round(window.scrollY),
      deltaY: Math.round(absDeltaY),
      direction: deltaY >= 0 ? "down" : "up",
      viewport: "mobile",
      thresholdPxPerSec: FAST_SCROLL_TOUCH_THRESHOLD_PX_PER_SEC,
      input: "touch",
    });
  }

  lastTouchX = touch.clientX;
  lastTouchY = touch.clientY;
  lastTouchTs = now;
};

const handleTouchEnd = () => {
  touchFastScrollHandled = false;
};

const applyResponsiveCopy = () => {
  const isMobile = mobileBreakpoint.matches;

  adaptiveCopyNodes.forEach((node) => {
    const nextText = isMobile ? node.dataset.mobile : node.dataset.desktop;

    if (typeof nextText === "string" && nextText.length > 0) {
      node.textContent = nextText;
    }
  });

  if (input) {
    const desktopValue = input.dataset.desktopValue ?? "";
    const mobileValue = input.dataset.mobileValue ?? "";
    const desktopPlaceholder = input.dataset.desktopPlaceholder ?? "";
    const mobilePlaceholder = input.dataset.mobilePlaceholder ?? "";
    const nextValue = (isMobile ? mobileValue : desktopValue) || defaultBoxLabelValue;
    const nextPlaceholder = isMobile ? mobilePlaceholder : desktopPlaceholder;

    input.placeholder = nextPlaceholder;
    input.value = nextValue;
  }

  if (ctaShareButton && !isShareActionPending) {
    ctaShareButton.textContent = getShareButtonLabel();
  }
};

const syncLabelPreview = () => {
  if (!preview || !previewSecondary || !input || !ctaLabelNote || !previewTextMeasureContext) {
    return;
  }

  const [primaryText, secondaryText] = splitBoxLabelForPreview(input.value);
  const labelStyles = window.getComputedStyle(preview);
  const secondaryStyles = window.getComputedStyle(previewSecondary);
  const textWidth = ctaLabelNote.clientWidth;

  previewTextMeasureContext.font = buildCanvasFont(
    labelStyles,
    parseFloat(labelStyles.fontSize)
  );
  const primaryLines = wrapTextLine(previewTextMeasureContext, primaryText, textWidth);

  previewTextMeasureContext.font = buildCanvasFont(
    secondaryStyles,
    parseFloat(secondaryStyles.fontSize)
  );
  const secondaryLines = wrapTextLine(previewTextMeasureContext, secondaryText, textWidth);

  preview.textContent = primaryLines.join("\n");
  previewSecondary.textContent = secondaryLines.join("\n");
};

const resetMarkerPopupFit = (marker) => {
  const popup = marker?.querySelector(".marker__popup");

  if (!popup) return;

  popup.style.setProperty("--popup-shift-x", "0px");
};

const fitMarkerPopup = (marker) => {
  const popup = marker?.querySelector(".marker__popup");

  if (!popup) return;

  resetMarkerPopupFit(marker);

  const popupRect = popup.getBoundingClientRect();
  const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
  const viewportOffsetLeft = window.visualViewport?.offsetLeft ?? 0;
  const minLeft = viewportOffsetLeft + popupViewportGap;
  const maxRight = viewportOffsetLeft + viewportWidth - popupViewportGap;
  let shiftX = 0;

  if (popupRect.left < minLeft) {
    shiftX = minLeft - popupRect.left;
  } else if (popupRect.right > maxRight) {
    shiftX = maxRight - popupRect.right;
  }

  popup.style.setProperty("--popup-shift-x", `${shiftX.toFixed(2)}px`);
};

const fitOpenMarkerPopups = () => {
  markers.forEach((marker) => {
    if (marker.classList.contains("is-active")) {
      fitMarkerPopup(marker);
      return;
    }

    resetMarkerPopupFit(marker);
  });
};

const closeMarkers = (exceptMarker) => {
  markers.forEach((marker) => {
    if (marker === exceptMarker) return;

    marker.classList.remove("is-active");
    marker.setAttribute("aria-expanded", "false");
    resetMarkerPopupFit(marker);
  });
};

const waitForImageReady = async (image) => {
  if (!image) {
    throw new Error("CTA image node is missing.");
  }

  if (typeof image.decode === "function") {
    try {
      await image.decode();
      return;
    } catch (error) {
      if (image.complete && image.naturalWidth > 0) {
        return;
      }
    }
  }

  if (image.complete && image.naturalWidth > 0) {
    return;
  }

  await new Promise((resolve, reject) => {
    const handleLoad = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error("CTA image failed to load."));
    };
    const cleanup = () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
    };

    image.addEventListener("load", handleLoad, { once: true });
    image.addEventListener("error", handleError, { once: true });
  });
};

const getCtaExportSource = () =>
  mobileBreakpoint.matches ? CTA_EXPORT_SOURCES.mobile : CTA_EXPORT_SOURCES.desktop;

const loadCtaExportImage = async () => {
  const source = getCtaExportSource();

  if (ctaExportImagePromise?.source === source) {
    return ctaExportImagePromise.promise;
  }

  const promise = new Promise((resolve, reject) => {
    const image = new Image();

    image.decoding = "async";
    image.src = source;

    const finalize = () => {
      cleanup();
      resolve(image);
    };
    const fail = () => {
      cleanup();
      reject(new Error(`CTA export image failed to load: ${source}`));
    };
    const cleanup = () => {
      image.removeEventListener("load", finalize);
      image.removeEventListener("error", fail);
    };

    if (typeof image.decode === "function") {
      image
        .decode()
        .then(finalize)
        .catch(() => {
          if (image.complete && image.naturalWidth > 0) {
            finalize();
            return;
          }

          image.addEventListener("load", finalize, { once: true });
          image.addEventListener("error", fail, { once: true });
        });
      return;
    }

    image.addEventListener("load", finalize, { once: true });
    image.addEventListener("error", fail, { once: true });
  });

  ctaExportImagePromise = { source, promise };

  try {
    return await promise;
  } catch (error) {
    ctaExportImagePromise = null;
    throw error;
  }
};

const buildCanvasFont = (styles, fontSize) => {
  const fontStyle = styles.fontStyle || "normal";
  const fontWeight = styles.fontWeight || "400";
  const fontFamily = styles.fontFamily || "sans-serif";

  return `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
};

const wrapTextLine = (ctx, text, maxWidth) => {
  const normalizedParagraphs = text
    .split("\n")
    .map((paragraph) => paragraph.trim().replace(/\s+/g, " "))
    .filter(Boolean);

  if (normalizedParagraphs.length === 0) {
    return [];
  }

  return normalizedParagraphs.flatMap((paragraph) => {
    const words = paragraph.split(" ");
    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
      const candidateLine = currentLine ? `${currentLine} ${word}` : word;

      if (ctx.measureText(candidateLine).width <= maxWidth) {
        currentLine = candidateLine;
        return;
      }

      if (currentLine) {
        lines.push(currentLine);
        currentLine = "";
      }

      if (ctx.measureText(word).width <= maxWidth) {
        currentLine = word;
        return;
      }

      let fragment = "";

      Array.from(word).forEach((character) => {
        const candidateFragment = `${fragment}${character}`;

        if (fragment && ctx.measureText(candidateFragment).width > maxWidth) {
          lines.push(fragment);
          fragment = character;
          return;
        }

        fragment = candidateFragment;
      });

      currentLine = fragment;
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  });
};

const getTimestampedExportFileName = (extension) => {
  const date = new Date();
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const timePart = [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0"),
  ].join("");

  return `hotbox-${datePart}-${timePart}.${extension}`;
};

const getImageExportFileName = () => getTimestampedExportFileName("jpg");

const getVideoExportConfig = () => {
  if (typeof MediaRecorder !== "function") {
    return null;
  }

  if (typeof MediaRecorder.isTypeSupported !== "function") {
    return { options: {}, extension: "webm" };
  }

  const matchedType = videoExportMimeTypes.find(({ mimeType }) =>
    MediaRecorder.isTypeSupported(mimeType)
  );

  if (!matchedType) {
    return null;
  }

  return {
    options: { mimeType: matchedType.mimeType },
    extension: matchedType.extension,
  };
};

const waitForVideoReady = async (video) => {
  if (!video) {
    throw new Error("CTA export video node is missing.");
  }

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return;
  }

  await new Promise((resolve, reject) => {
    const handleLoadedData = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error("CTA export video failed to load."));
    };
    const cleanup = () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
    };

    video.addEventListener("loadeddata", handleLoadedData, { once: true });
    video.addEventListener("error", handleError, { once: true });
  });
};

const createExportVideoNode = async () => {
  const video = document.createElement("video");

  video.preload = "auto";
  video.playsInline = true;
  video.muted = true;
  video.src = CTA_EXPORT_VIDEO_SOURCE;

  await new Promise((resolve, reject) => {
    const handleLoadedMetadata = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error(`CTA export video failed to load: ${CTA_EXPORT_VIDEO_SOURCE}`));
    };
    const cleanup = () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("error", handleError);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });
    video.addEventListener("error", handleError, { once: true });
  });

  await waitForVideoReady(video);

  return video;
};

const getVideoBoxRect = (canvasWidth, canvasHeight) => {
  const scaleX = canvasWidth / CTA_EXPORT_VIDEO_BOX_LAYOUT.frameWidth;
  const scaleY = canvasHeight / CTA_EXPORT_VIDEO_BOX_LAYOUT.frameHeight;

  return {
    x: CTA_EXPORT_VIDEO_BOX_LAYOUT.x * scaleX,
    y: CTA_EXPORT_VIDEO_BOX_LAYOUT.y * scaleY,
    width: CTA_EXPORT_VIDEO_BOX_LAYOUT.width * scaleX,
    height: CTA_EXPORT_VIDEO_BOX_LAYOUT.height * scaleY,
  };
};

const drawVideoOverlayLabel = (ctx, video, canvasWidth, canvasHeight) => {
  if (!ctaLabelNote || !previewSecondary) {
    throw new Error("CTA label nodes are missing.");
  }

  if (video.currentTime >= CTA_EXPORT_VIDEO_BOX_LAYOUT.hideAfterSeconds) {
    return;
  }

  const labelStyles = window.getComputedStyle(ctaLabelNote);
  const secondaryStyles = window.getComputedStyle(previewSecondary);
  const [primaryText, secondaryText] = splitBoxLabelForPreview(input?.value ?? "");
  const boxRect = getVideoBoxRect(canvasWidth, canvasHeight);
  const contentWidth = boxRect.width;
  const horizontalPadding = contentWidth * 0.02;
  const verticalPadding = boxRect.height * 0.12;
  const textWidth = contentWidth - horizontalPadding * 2;
  const primaryFontSize = boxRect.height * 0.112;
  const secondaryFontSize = boxRect.height * 0.081;
  const primaryLineHeight = primaryFontSize * 1.08;
  const secondaryLineHeight = secondaryFontSize * 1.12;
  const gap = secondaryText ? boxRect.height * 0.02 : 0;

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = buildCanvasFont(labelStyles, primaryFontSize);
  const primaryLines = wrapTextLine(ctx, primaryText, textWidth);
  ctx.font = buildCanvasFont(secondaryStyles, secondaryFontSize);
  const secondaryLines = wrapTextLine(ctx, secondaryText, textWidth);

  const totalTextHeight =
    primaryLines.length * primaryLineHeight +
    secondaryLines.length * secondaryLineHeight +
    gap;
  const centerX = boxRect.x + boxRect.width / 2;
  let lineY =
    boxRect.y +
    Math.max((boxRect.height - totalTextHeight) / 2, verticalPadding) +
    boxRect.height * 0.045;

  ctx.fillStyle = labelStyles.color;
  ctx.font = buildCanvasFont(labelStyles, primaryFontSize);
  primaryLines.forEach((line) => {
    ctx.fillText(line, centerX, lineY);
    lineY += primaryLineHeight;
  });

  if (secondaryLines.length > 0) {
    lineY += gap;
    ctx.fillStyle = secondaryStyles.color;
    ctx.font = buildCanvasFont(secondaryStyles, secondaryFontSize);

    secondaryLines.forEach((line) => {
      ctx.fillText(line, centerX, lineY);
      lineY += secondaryLineHeight;
    });
  }
};

const renderVideoFrame = (ctx, video, canvasWidth, canvasHeight) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
  drawVideoOverlayLabel(ctx, video, canvasWidth, canvasHeight);
};

const renderVideoToCanvas = async (video, ctx, canvasWidth, canvasHeight) => {
  renderVideoFrame(ctx, video, canvasWidth, canvasHeight);

  await new Promise((resolve, reject) => {
    let rafId = 0;
    let frameCallbackId = 0;
    let isFinished = false;

    const cleanup = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }

      if (frameCallbackId && typeof video.cancelVideoFrameCallback === "function") {
        video.cancelVideoFrameCallback(frameCallbackId);
      }

      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };

    const finish = (error) => {
      if (isFinished) return;
      isFinished = true;
      cleanup();

      if (error) {
        reject(error);
        return;
      }

      resolve();
    };

    const step = () => {
      renderVideoFrame(ctx, video, canvasWidth, canvasHeight);

      if (video.ended) {
        finish();
        return;
      }

      if (typeof video.requestVideoFrameCallback === "function") {
        frameCallbackId = video.requestVideoFrameCallback(() => {
          step();
        });
        return;
      }

      rafId = window.requestAnimationFrame(step);
    };

    const handleEnded = () => {
      renderVideoFrame(ctx, video, canvasWidth, canvasHeight);
      finish();
    };
    const handleError = () => {
      finish(new Error("CTA export video playback failed."));
    };

    video.addEventListener("ended", handleEnded, { once: true });
    video.addEventListener("error", handleError, { once: true });
    step();
  });
};

const stopMediaRecorder = (recorder) =>
  new Promise((resolve) => {
    if (recorder.state === "inactive") {
      resolve();
      return;
    }

    recorder.addEventListener("stop", () => resolve(), { once: true });
    recorder.stop();
  });

const getMediaElementCaptureStream = (mediaElement) => {
  try {
    if (typeof mediaElement.captureStream === "function") {
      return mediaElement.captureStream();
    }

    if (typeof mediaElement.mozCaptureStream === "function") {
      return mediaElement.mozCaptureStream();
    }
  } catch (error) {
    console.error(error);
  }

  return null;
};

const exportBoxVideoFile = async () => {
  const exportConfig = getVideoExportConfig();

  if (!exportConfig) {
    throw new Error("Video export is unsupported in this browser.");
  }

  if (typeof HTMLCanvasElement.prototype.captureStream !== "function") {
    throw new Error("Canvas captureStream is unavailable.");
  }

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const video = await createExportVideoNode();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  canvas.width = video.videoWidth || 720;
  canvas.height = video.videoHeight || 1280;

  const fps = 30;
  const canvasStream = canvas.captureStream(fps);
  const sourceStream = getMediaElementCaptureStream(video);
  const composedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...(sourceStream?.getAudioTracks() ?? []),
  ]);
  const chunks = [];
  const recorder = new MediaRecorder(composedStream, exportConfig.options);

  recorder.addEventListener("dataavailable", (event) => {
    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
    }
  });

  recorder.start(250);
  video.currentTime = 0;

  try {
    await video.play();
    await renderVideoToCanvas(video, ctx, canvas.width, canvas.height);
  } finally {
    video.pause();
    await stopMediaRecorder(recorder);
    composedStream.getTracks().forEach((track) => track.stop());
    canvasStream.getTracks().forEach((track) => track.stop());
    sourceStream?.getTracks().forEach((track) => track.stop());
    video.removeAttribute("src");
    video.load();
  }

  const blob = new Blob(chunks, {
    type: recorder.mimeType || exportConfig.options.mimeType || "video/webm",
  });

  if (blob.size === 0) {
    throw new Error("Video export failed.");
  }

  const fileName = getTimestampedExportFileName(exportConfig.extension);

  return {
    blob,
    fileName,
    file:
      typeof File === "function"
        ? new File([blob], fileName, {
            type: blob.type || exportConfig.options.mimeType || "video/webm",
            lastModified: Date.now(),
          })
        : blob,
  };
};

const exportBoxImageBlob = async () => {
  if (!ctaVisual || !ctaVisualImage || !ctaLabelNote || !preview || !previewSecondary) {
    throw new Error("CTA export nodes are missing.");
  }

  await waitForImageReady(ctaVisualImage);
  const exportImage = await loadCtaExportImage();

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const visualRect = ctaVisual.getBoundingClientRect();
  const labelRect = ctaLabelNote.getBoundingClientRect();
  const labelStyles = window.getComputedStyle(ctaLabelNote);
  const secondaryStyles = window.getComputedStyle(previewSecondary);
  const exportWidth = exportImage.naturalWidth || 1372;
  const exportHeight = exportImage.naturalHeight || 1372;
  const scaleX = exportWidth / visualRect.width;
  const scaleY = exportHeight / visualRect.height;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  canvas.width = exportWidth;
  canvas.height = exportHeight;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, exportWidth, exportHeight);
  ctx.drawImage(exportImage, 0, 0, exportWidth, exportHeight);

  const labelArea = {
    x: (labelRect.left - visualRect.left) * scaleX,
    y: (labelRect.top - visualRect.top) * scaleY,
    width: labelRect.width * scaleX,
    height: labelRect.height * scaleY,
  };
  const primaryFontSize = parseFloat(labelStyles.fontSize) * scaleY;
  const secondaryFontSize = parseFloat(secondaryStyles.fontSize) * scaleY;
  const primaryLineHeight = parseFloat(labelStyles.lineHeight) * scaleY;
  const secondaryLineHeight = parseFloat(secondaryStyles.lineHeight) * scaleY;
  const [primaryText, secondaryText] = splitBoxLabelForPreview(input?.value ?? "");

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = labelStyles.color;
  ctx.font = buildCanvasFont(labelStyles, primaryFontSize);

  const primaryLines = wrapTextLine(ctx, primaryText, labelArea.width);

  ctx.font = buildCanvasFont(secondaryStyles, secondaryFontSize);

  const secondaryLines = wrapTextLine(ctx, secondaryText, labelArea.width);
  const gap = secondaryLines.length > 0 ? 2 * scaleY : 0;
  const totalTextHeight =
    primaryLines.length * primaryLineHeight +
    secondaryLines.length * secondaryLineHeight +
    gap;
  let lineY = labelArea.y + Math.max((labelArea.height - totalTextHeight) / 2, 0);
  const centerX = labelArea.x + labelArea.width / 2;

  ctx.fillStyle = labelStyles.color;
  ctx.font = buildCanvasFont(labelStyles, primaryFontSize);

  primaryLines.forEach((line) => {
    ctx.fillText(line, centerX, lineY);
    lineY += primaryLineHeight;
  });

  if (secondaryLines.length > 0) {
    lineY += gap;
    ctx.fillStyle = secondaryStyles.color;
    ctx.font = buildCanvasFont(secondaryStyles, secondaryFontSize);

    secondaryLines.forEach((line) => {
      ctx.fillText(line, centerX, lineY);
      lineY += secondaryLineHeight;
    });
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("JPEG export failed."));
        return;
      }

      resolve(blob);
    }, "image/jpeg", 0.92);
  });
};

const exportBoxImageFile = async () => {
  const blob = await exportBoxImageBlob();
  const fileName = getImageExportFileName();

  return {
    blob,
    fileName,
    file:
      typeof File === "function"
        ? new File([blob], fileName, { type: "image/jpeg", lastModified: Date.now() })
        : blob,
  };
};

const downloadBlob = (blob, fileName) => {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = blobUrl;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 1000);
};

const getHotboxLabelValue = () => input?.value.trim() || boxLabelOptions[0];

const buildHotboxRendererUrl = (pathname) => {
  if (!HOTBOX_RENDERER_BASE_URL) {
    throw new Error("Hotbox renderer base URL is not configured.");
  }

  return new URL(pathname, `${HOTBOX_RENDERER_BASE_URL}/`).toString();
};

const resolveHotboxRendererAssetUrl = (assetUrl) => {
  if (!assetUrl) {
    return "";
  }

  return new URL(assetUrl, `${HOTBOX_RENDERER_BASE_URL}/`).toString();
};

const fetchBlobAsFile = async (fileUrl, fileName) => {
  const response = await fetch(fileUrl, {
    mode: "cors",
    credentials: "omit",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch render: ${response.status}`);
  }

  const blob = await response.blob();

  return {
    blob,
    file:
      typeof File === "function"
        ? new File([blob], fileName, {
            type: blob.type || "video/mp4",
            lastModified: Date.now(),
          })
        : blob,
  };
};

const exportBoxVideoFromServer = async () => {
  if (!HOTBOX_RENDERER_BASE_URL) {
    throw new Error("Hotbox renderer is unavailable.");
  }

  const response = await fetch(buildHotboxRendererUrl("/render"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      label: getHotboxLabelValue(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Renderer request failed: ${response.status}`);
  }

  const payload = await response.json();

  if (!payload?.downloadUrl || !payload?.fileName) {
    throw new Error("Renderer response is incomplete.");
  }

  const downloadUrl = resolveHotboxRendererAssetUrl(payload.downloadUrl);
  const streamUrl = payload.streamUrl
    ? resolveHotboxRendererAssetUrl(payload.streamUrl)
    : downloadUrl;
  const { blob, file } = await fetchBlobAsFile(downloadUrl, payload.fileName);

  return {
    blob,
    file,
    fileName: payload.fileName,
    downloadUrl,
    streamUrl,
  };
};

const tryNativeShare = async (exportPayload) => {
  if (!mobileBreakpoint.matches || typeof navigator.share !== "function") {
    return false;
  }

  const shareTitle = "Подписанная коробка";
  const shareText = input?.value.trim() || shareTitle;
  const { file, downloadUrl } = exportPayload ?? {};

  if (file) {
    const fileSharePayload = {
      files: [file],
      title: shareTitle,
      text: shareText,
    };

    if (
      typeof navigator.canShare !== "function" ||
      navigator.canShare(fileSharePayload)
    ) {
      await navigator.share(fileSharePayload);
      return true;
    }
  }

  if (downloadUrl) {
    await navigator.share({
      title: shareTitle,
      text: shareText,
      url: downloadUrl,
    });
    return true;
  }

  return false;
};

const handleShareButtonClick = async () => {
  if (isShareActionPending) return;

  setShareStatus("");
  setShareButtonPending(true);

  try {
    let exportPayload = null;

    try {
      setShareStatus("...это займет около 15 секунд.");
      exportPayload = await exportBoxVideoFromServer();
    } catch (error) {
      console.error(error);
      if (mobileBreakpoint.matches) {
        setShareStatus("Видео не получилось, сохраняем картинку.");
        exportPayload = await exportBoxImageFile();
      } else {
        try {
          setShareStatus("Картон не по ГОСТу, пробуем ещё раз.");
          exportPayload = await exportBoxVideoFile();
        } catch (clientVideoError) {
          console.error(clientVideoError);
          setShareStatus("Видео не получилось, сохраняем картинку.");
          exportPayload = await exportBoxImageFile();
        }
      }
    }

    try {
      const didShare = await tryNativeShare(exportPayload);

      if (didShare) {
        setShareStatus("");
        return;
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        setShareStatus("");
        return;
      }

      console.error(error);
    }

    downloadBlob(exportPayload.blob, exportPayload.fileName);
    setShareStatus("");
  } catch (error) {
    console.error(error);
    setShareStatus("Не получилось подготовить коробку. Попробуйте еще раз.");
  } finally {
    setShareButtonPending(false);
  }
};

if (input && preview && previewSecondary) {
  input.addEventListener("input", syncLabelPreview);
}

if (form && input) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    input.value = getRandomBoxLabel(input.value);
    syncLabelPreview();
    input.blur();
  });
}

if (ctaShareButton) {
  ctaShareButton.addEventListener("click", handleShareButtonClick);
}

if (heroCtaButton && featuresSection && firstFeatureCard) {
  heroCtaButton.addEventListener("click", (event) => {
    event.preventDefault();
    const targetNode = mobileBreakpoint.matches ? firstFeatureCard : featuresSection;
    ignoreFastScrollForProgrammaticScroll();
    targetNode.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

markers.forEach((marker) => {
  marker.addEventListener("mouseenter", () => {
    fitMarkerPopup(marker);
  });

  marker.addEventListener("focusin", () => {
    fitMarkerPopup(marker);
  });

  marker.addEventListener("click", (event) => {
    event.preventDefault();

    const shouldOpen = !marker.classList.contains("is-active");
    closeMarkers(marker);
    marker.classList.toggle("is-active", shouldOpen);
    marker.setAttribute("aria-expanded", String(shouldOpen));

    if (shouldOpen) {
      window.requestAnimationFrame(() => {
        fitMarkerPopup(marker);
      });
      return;
    }

    resetMarkerPopupFit(marker);
  });
});

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-marker]")) return;
  closeMarkers();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeMarkers();
});

applyResponsiveCopy();
syncLabelPreview();
fitOpenMarkerPopups();
createFastScrollWarningNode();

window.addEventListener("scroll", handleFastScrollDetection, { passive: true });
window.addEventListener("touchstart", handleTouchStart, { passive: true });
window.addEventListener("touchmove", handleTouchMove, { passive: true });
window.addEventListener("touchend", handleTouchEnd, { passive: true });
window.addEventListener("touchcancel", handleTouchEnd, { passive: true });
window.addEventListener("resize", fitOpenMarkerPopups, { passive: true });
document.addEventListener(FAST_SCROLL_EVENT_NAME, showFastScrollWarning);

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", fitOpenMarkerPopups, { passive: true });
  window.visualViewport.addEventListener("scroll", fitOpenMarkerPopups, { passive: true });
}

if (typeof mobileBreakpoint.addEventListener === "function") {
  mobileBreakpoint.addEventListener("change", () => {
    applyResponsiveCopy();
    syncLabelPreview();
    setShareStatus("");
    fitOpenMarkerPopups();
  });
} else if (typeof mobileBreakpoint.addListener === "function") {
  mobileBreakpoint.addListener(() => {
    applyResponsiveCopy();
    syncLabelPreview();
    setShareStatus("");
    fitOpenMarkerPopups();
  });
}
