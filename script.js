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
const featuresSection = document.querySelector("#features");
const firstFeatureCard = document.querySelector("#feature-card-1");
const markers = Array.from(document.querySelectorAll("[data-marker]"));
const adaptiveCopyNodes = document.querySelectorAll("[data-mobile]");
const mobileBreakpoint = window.matchMedia("(max-width: 767px)");
const defaultBoxLabelPreview = ["КОНТЕНТ 2020–2024", "(НЕ КАНТОВАТЬ)"];
const mobileBoxLabelBreakOverrides = {
  "ОХВАТЫ (БЫЛО 10К, СТАЛО 300, НО МЫ ВЕРИМ)": {
    primary: "ОХВАТЫ",
    secondary: "(БЫЛО 10К, СТАЛО 300,\nНО МЫ ВЕРИМ)",
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

let isShareActionPending = false;
let ctaExportImagePromise = null;

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

  if (mobileBreakpoint.matches && mobileBoxLabelBreakOverrides[trimmedValue]) {
    const override = mobileBoxLabelBreakOverrides[trimmedValue];
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
    ? mobileBreakpoint.matches
      ? "Готовим коробку..."
      : "Сохраняем коробку..."
    : getShareButtonLabel();
};

const setShareStatus = (message = "") => {
  if (!ctaShareStatus) return;

  ctaShareStatus.textContent = message;
  ctaShareStatus.classList.toggle("is-visible", Boolean(message));
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
    const nextValue = isMobile ? mobileValue : desktopValue;
    const nextPlaceholder = isMobile ? mobilePlaceholder : desktopPlaceholder;

    input.placeholder = nextPlaceholder;
    input.value = nextValue;
  }

  if (ctaShareButton && !isShareActionPending) {
    ctaShareButton.textContent = getShareButtonLabel();
  }
};

const syncLabelPreview = () => {
  if (!preview || !previewSecondary || !input) return;

  const [primaryText, secondaryText] = splitBoxLabelForPreview(input.value);
  preview.textContent = primaryText;
  previewSecondary.textContent = secondaryText;
};

const closeMarkers = (exceptMarker) => {
  markers.forEach((marker) => {
    if (marker === exceptMarker) return;

    marker.classList.remove("is-active");
    marker.setAttribute("aria-expanded", "false");
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

const getExportFileName = () => {
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

  return `podpisannaya-korobka-${datePart}-${timePart}.jpg`;
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

const tryNativeFileShare = async (file) => {
  if (!mobileBreakpoint.matches || typeof navigator.share !== "function") {
    return false;
  }

  if (typeof navigator.canShare === "function" && !navigator.canShare({ files: [file] })) {
    return false;
  }

  await navigator.share({
    files: [file],
    title: "Подписанная коробка",
    text: input?.value.trim() || "Подписанная коробка",
  });

  return true;
};

const handleShareButtonClick = async () => {
  if (isShareActionPending) return;

  setShareStatus("");
  setShareButtonPending(true);

  try {
    const blob = await exportBoxImageBlob();
    const fileName = getExportFileName();
    const file =
      typeof File === "function"
        ? new File([blob], fileName, { type: "image/jpeg", lastModified: Date.now() })
        : blob;

    try {
      const didShare = await tryNativeFileShare(file);

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

    downloadBlob(blob, fileName);
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
    targetNode.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

markers.forEach((marker) => {
  marker.addEventListener("click", (event) => {
    event.preventDefault();

    const shouldOpen = !marker.classList.contains("is-active");
    closeMarkers(marker);
    marker.classList.toggle("is-active", shouldOpen);
    marker.setAttribute("aria-expanded", String(shouldOpen));
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

if (typeof mobileBreakpoint.addEventListener === "function") {
  mobileBreakpoint.addEventListener("change", () => {
    applyResponsiveCopy();
    syncLabelPreview();
    setShareStatus("");
  });
} else if (typeof mobileBreakpoint.addListener === "function") {
  mobileBreakpoint.addListener(() => {
    applyResponsiveCopy();
    syncLabelPreview();
    setShareStatus("");
  });
}
