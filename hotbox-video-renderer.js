(function () {
  const DEFAULT_BOX_LABEL_VALUE = "ВСЕ ЭТИ БЛОКИРОВКИ";
  const CTA_EXPORT_VIDEO_SOURCE = "./assets/box.mp4";
  const POSTCARD_IMAGE_SOURCE = "./assets/postcard.jpeg";
  const VIDEO_EXPORT_MIME_TYPES = [
    { mimeType: "video/mp4", extension: "mp4" },
    { mimeType: 'video/mp4;codecs="avc1.42E01E,mp4a.40.2"', extension: "mp4" },
    { mimeType: "video/webm", extension: "webm" },
    { mimeType: 'video/webm;codecs="vp9,opus"', extension: "webm" },
    { mimeType: 'video/webm;codecs="vp8,opus"', extension: "webm" },
  ];
  const VIDEO_BOX_LAYOUT = {
    frameWidth: 941,
    frameHeight: 1672,
    x: 292,
    y: 1039,
    width: 362,
    height: 356,
    hideAfterSeconds: 6,
  };
  const BOX_LABEL_BREAK_OVERRIDES = {
    "ОХВАТЫ (БЫЛО 10К, СТАЛО 300, НО МЫ ВЕРИМ)": {
      primary: "ОХВАТЫ",
      secondary: "(БЫЛО 10К, СТАЛО 300,\nНО МЫ ВЕРИМ)",
    },
    "НЕРВЫ (ЗАКОНЧИЛИСЬ ЕЩЁ В 2022)": {
      primary: "НЕРВЫ",
      secondary: "(ЗАКОНЧИЛИСЬ\nЕЩЁ В 2022)",
    },
  };
  const PRIMARY_LABEL_STYLE = {
    color: "#243888",
    fontFamily: '"Caveat", cursive',
    fontStyle: "normal",
    fontWeight: "700",
  };
  const SECONDARY_LABEL_STYLE = {
    color: "#243888",
    fontFamily: '"Caveat", cursive',
    fontStyle: "normal",
    fontWeight: "700",
  };
  const POSTCARD_LABEL_LAYOUT = {
    frameWidth: 768,
    frameHeight: 1376,
    x: 228,
    y: 742,
    width: 326,
    height: 292,
  };
  const POSTCARD_LABEL_VERTICAL_SHIFT = -0.06;
  const IMAGE_EXPORT_MIME_TYPE = "image/png";
  const IMAGE_EXPORT_EXTENSION = "png";

  const splitBoxLabelForPreview = (value) => {
    const trimmedValue = String(value || "").trim();

    if (!trimmedValue) {
      return ["ВСЕ ЭТИ\nБЛОКИРОВКИ", ""];
    }

    if (trimmedValue === DEFAULT_BOX_LABEL_VALUE) {
      return ["ВСЕ ЭТИ\nБЛОКИРОВКИ", ""];
    }

    if (BOX_LABEL_BREAK_OVERRIDES[trimmedValue]) {
      const override = BOX_LABEL_BREAK_OVERRIDES[trimmedValue];
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

  const buildCanvasFont = (styles, fontSize) => {
    const fontStyle = styles.fontStyle || "normal";
    const fontWeight = styles.fontWeight || "400";
    const fontFamily = styles.fontFamily || "sans-serif";

    return `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  };

  const wrapTextLine = (ctx, text, maxWidth) => {
    const normalizedParagraphs = String(text || "")
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

  const getVideoExportConfig = () => {
    if (typeof MediaRecorder !== "function") {
      return null;
    }

    if (typeof MediaRecorder.isTypeSupported !== "function") {
      return { options: {}, extension: "webm" };
    }

    const matchedType = VIDEO_EXPORT_MIME_TYPES.find(({ mimeType }) =>
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

  const canRenderVideoInBrowser = () => {
    if (typeof HTMLCanvasElement === "undefined") {
      return false;
    }

    if (typeof HTMLCanvasElement.prototype.captureStream !== "function") {
      return false;
    }

    return Boolean(getVideoExportConfig());
  };

  const canRenderImageInBrowser = () => typeof HTMLCanvasElement !== "undefined";

  const ensureCanvasFontsLoaded = async () => {
    if (!document.fonts) {
      return;
    }

    const fontLoads = [
      document.fonts.load(buildCanvasFont(PRIMARY_LABEL_STYLE, 36), DEFAULT_BOX_LABEL_VALUE),
    ];

    await Promise.all(fontLoads);
    await document.fonts.ready;
  };

  const loadExportImage = async () => {
    const source = POSTCARD_IMAGE_SOURCE;
    const image = new Image();

    image.decoding = "async";
    image.src = source;

    if (typeof image.decode === "function") {
      try {
        await image.decode();
      } catch (error) {
        if (!image.complete || image.naturalWidth === 0) {
          throw error;
        }
      }
    } else {
      await new Promise((resolve, reject) => {
        const handleLoad = () => {
          cleanup();
          resolve();
        };
        const handleError = () => {
          cleanup();
          reject(new Error(`CTA export image failed to load: ${source}`));
        };
        const cleanup = () => {
          image.removeEventListener("load", handleLoad);
          image.removeEventListener("error", handleError);
        };

        image.addEventListener("load", handleLoad, { once: true });
        image.addEventListener("error", handleError, { once: true });
      });
    }

    if (!image.complete || image.naturalWidth === 0) {
      throw new Error(`CTA export image failed to load: ${source}`);
    }

    return image;
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

  const getVideoBoxRect = (canvasWidth, canvasHeight) => {
    const scaleX = canvasWidth / VIDEO_BOX_LAYOUT.frameWidth;
    const scaleY = canvasHeight / VIDEO_BOX_LAYOUT.frameHeight;

    return {
      x: VIDEO_BOX_LAYOUT.x * scaleX,
      y: VIDEO_BOX_LAYOUT.y * scaleY,
      width: VIDEO_BOX_LAYOUT.width * scaleX,
      height: VIDEO_BOX_LAYOUT.height * scaleY,
    };
  };

  const drawVideoOverlayLabel = (ctx, video, canvasWidth, canvasHeight, labelValue) => {
    if (video.currentTime >= VIDEO_BOX_LAYOUT.hideAfterSeconds) {
      return;
    }

    const [primaryText, secondaryText] = splitBoxLabelForPreview(
      labelValue || DEFAULT_BOX_LABEL_VALUE
    );
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
    ctx.font = buildCanvasFont(PRIMARY_LABEL_STYLE, primaryFontSize);
    const primaryLines = wrapTextLine(ctx, primaryText, textWidth);
    ctx.font = buildCanvasFont(SECONDARY_LABEL_STYLE, secondaryFontSize);
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

    ctx.fillStyle = PRIMARY_LABEL_STYLE.color;
    ctx.font = buildCanvasFont(PRIMARY_LABEL_STYLE, primaryFontSize);
    primaryLines.forEach((line) => {
      ctx.fillText(line, centerX, lineY);
      lineY += primaryLineHeight;
    });

    if (secondaryLines.length > 0) {
      lineY += gap;
      ctx.fillStyle = SECONDARY_LABEL_STYLE.color;
      ctx.font = buildCanvasFont(SECONDARY_LABEL_STYLE, secondaryFontSize);

      secondaryLines.forEach((line) => {
        ctx.fillText(line, centerX, lineY);
        lineY += secondaryLineHeight;
      });
    }
  };

  const renderVideoFrame = (ctx, video, canvasWidth, canvasHeight, labelValue) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
    drawVideoOverlayLabel(ctx, video, canvasWidth, canvasHeight, labelValue);
  };

  const renderVideoToCanvas = async (video, ctx, canvasWidth, canvasHeight, labelValue) => {
    renderVideoFrame(ctx, video, canvasWidth, canvasHeight, labelValue);

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
        if (isFinished) {
          return;
        }

        isFinished = true;
        cleanup();

        if (error) {
          reject(error);
          return;
        }

        resolve();
      };

      const step = () => {
        renderVideoFrame(ctx, video, canvasWidth, canvasHeight, labelValue);

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
        renderVideoFrame(ctx, video, canvasWidth, canvasHeight, labelValue);
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

  const renderImageFile = async ({ label } = {}) => {
    if (!canRenderImageInBrowser()) {
      throw new Error("Image export is unsupported in this browser.");
    }

    await ensureCanvasFontsLoaded();

    const exportImage = await loadExportImage();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas 2D context is unavailable.");
    }

    const exportWidth = exportImage.naturalWidth || 1372;
    const exportHeight = exportImage.naturalHeight || 1372;
    const scaleX = exportWidth / POSTCARD_LABEL_LAYOUT.frameWidth;
    const scaleY = exportHeight / POSTCARD_LABEL_LAYOUT.frameHeight;
    const labelBox = {
      x: POSTCARD_LABEL_LAYOUT.x * scaleX,
      y: POSTCARD_LABEL_LAYOUT.y * scaleY,
      width: POSTCARD_LABEL_LAYOUT.width * scaleX,
      height: POSTCARD_LABEL_LAYOUT.height * scaleY,
    };
    const contentWidth = labelBox.width * 0.94;
    const centerX = labelBox.x + labelBox.width / 2;
    const primaryFontSize = labelBox.height * 0.15;
    const secondaryFontSize = labelBox.height * 0.112;
    const primaryLineHeight = primaryFontSize * 1.04;
    const secondaryLineHeight = secondaryFontSize * 1.08;
    const [primaryText, secondaryText] = splitBoxLabelForPreview(
      label || DEFAULT_BOX_LABEL_VALUE
    );

    canvas.width = exportWidth;
    canvas.height = exportHeight;

    ctx.clearRect(0, 0, exportWidth, exportHeight);
    ctx.drawImage(exportImage, 0, 0, exportWidth, exportHeight);

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = buildCanvasFont(PRIMARY_LABEL_STYLE, primaryFontSize);
    const primaryLines = wrapTextLine(ctx, primaryText, contentWidth);
    ctx.font = buildCanvasFont(SECONDARY_LABEL_STYLE, secondaryFontSize);
    const secondaryLines = wrapTextLine(ctx, secondaryText, contentWidth);
    const gap = secondaryLines.length > 0 ? labelBox.height * 0.028 : 0;
    const totalTextHeight =
      primaryLines.length * primaryLineHeight +
      secondaryLines.length * secondaryLineHeight +
      gap;
    let lineY =
      labelBox.y +
      Math.max((labelBox.height - totalTextHeight) / 2, labelBox.height * 0.04) +
      labelBox.height * (0.01 + POSTCARD_LABEL_VERTICAL_SHIFT);

    ctx.fillStyle = PRIMARY_LABEL_STYLE.color;
    ctx.font = buildCanvasFont(PRIMARY_LABEL_STYLE, primaryFontSize);
    primaryLines.forEach((line) => {
      ctx.fillText(line, centerX, lineY);
      lineY += primaryLineHeight;
    });

    if (secondaryLines.length > 0) {
      lineY += gap;
      ctx.fillStyle = SECONDARY_LABEL_STYLE.color;
      ctx.font = buildCanvasFont(SECONDARY_LABEL_STYLE, secondaryFontSize);
      secondaryLines.forEach((line) => {
        ctx.fillText(line, centerX, lineY);
        lineY += secondaryLineHeight;
      });
    }

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((nextBlob) => {
        if (!nextBlob) {
          reject(new Error("PNG export failed."));
          return;
        }

        resolve(nextBlob);
      }, IMAGE_EXPORT_MIME_TYPE);
    });

    const fileName = getTimestampedExportFileName(IMAGE_EXPORT_EXTENSION);

    return {
      blob,
      fileName,
      file:
        typeof File === "function"
          ? new File([blob], fileName, { type: IMAGE_EXPORT_MIME_TYPE, lastModified: Date.now() })
          : blob,
    };
  };

  const renderVideoFile = async ({ label } = {}) => {
    const exportConfig = getVideoExportConfig();

    if (!exportConfig) {
      throw new Error("Video export is unsupported in this browser.");
    }

    if (typeof HTMLCanvasElement.prototype.captureStream !== "function") {
      throw new Error("Canvas captureStream is unavailable.");
    }

    await ensureCanvasFontsLoaded();

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
      await renderVideoToCanvas(
        video,
        ctx,
        canvas.width,
        canvas.height,
        label || DEFAULT_BOX_LABEL_VALUE
      );
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

  window.HotboxVideoRenderer = {
    canRenderImageInBrowser,
    canRenderVideoInBrowser,
    renderImageFile,
    renderVideoFile,
  };
})();
