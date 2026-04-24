const params = new URLSearchParams(window.location.search);

const titleNode = document.querySelector("#share-player-title");
const statusNode = document.querySelector("#share-player-status");
const videoNode = document.querySelector("#share-player-video");
const imageNode = document.querySelector("#share-player-image");
const loaderNode = document.querySelector("#share-player-loader");
const loaderTitleNode = document.querySelector("#share-player-loader-title");
const loaderCopyNode = document.querySelector("#share-player-loader-copy");
const panelKickerNode = document.querySelector("#share-player-panel-kicker");
const panelTitleNode = document.querySelector("#share-player-panel-title");
const panelCopyNode = document.querySelector("#share-player-panel-copy");
const shareButton = document.querySelector("#share-player-share");
const downloadLink = document.querySelector("#share-player-download");
const backButton = document.querySelector("#share-player-back");
const isMobileViewport = window.matchMedia("(max-width: 767px)");
const RETURN_SCROLL_STORAGE_KEY = "hotbox:return-scroll-target";
const LANDING_RETURN_TARGET_SELECTOR = "#cta-title";
const LANDING_RETURN_URL = `/${LANDING_RETURN_TARGET_SELECTOR}`;
const PENDING_RENDER_STORAGE_KEY = "hotbox:pending-render-request";
const SHARE_PLAYER_STARTED_AT_PARAM = "startedAt";
const PENDING_LONG_DELAY_MS = 30_000;
const CLIENT_FALLBACK_DELAY_MS = 60_000;
const PLAYBACK_LOADING_MIN_VISIBLE_MS = 320;
const DISABLE_BACKEND_RENDER_REQUEST = false;

let streamUrl = params.get("stream") || "";
let downloadUrl = params.get("download") || streamUrl;
let fileName = params.get("fileName") || "hotbox.mp4";
const label = params.get("label") || "Коробка отпущения";
const isPending = params.get("pending") === "1";
const pendingRendererBaseUrlParam = params.get("rendererBaseUrl") || "";
const startedAtParam = Number(params.get(SHARE_PLAYER_STARTED_AT_PARAM) || 0);
const isTimedShareFlow = isPending || startedAtParam > 0;
let shareFilePromise = null;
let shareFile = null;
let shareFileGeneration = 0;
let pendingRenderAbortController = null;
let pendingLongWaitTimeoutId = null;
let clientFallbackTimeoutId = null;
let playbackLoadingFinalizeTimeoutId = null;
let isClientFallbackRunning = false;
let localVideoObjectUrl = "";
let isVideoReady = false;
let currentMediaKind = streamUrl ? "video" : "";
let isPlaybackLoadingActive = false;
let playbackLoadingStartedAt = 0;

const setStatus = (message) => {
  if (!statusNode) return;

  statusNode.textContent = message;
  statusNode.hidden = !message;
};

const setTitle = (message) => {
  if (titleNode) {
    titleNode.textContent = message;
  }
};

const setLoaderCopy = (title, copy = "") => {
  if (loaderTitleNode) {
    loaderTitleNode.textContent = title;
  }

  if (loaderCopyNode) {
    loaderCopyNode.textContent = copy;
  }
};

const setLoaderVisible = (isVisible) => {
  if (!loaderNode) {
    return;
  }

  loaderNode.hidden = !isVisible;
};

const setVideoVisible = (isVisible) => {
  if (!videoNode) {
    return;
  }

  videoNode.hidden = !isVisible;
};

const setImageVisible = (isVisible) => {
  if (!imageNode) {
    return;
  }

  imageNode.hidden = !isVisible;
};

const setPanelCopy = ({ kicker = "", title = "", copy = "" } = {}) => {
  if (panelKickerNode) {
    panelKickerNode.textContent = kicker;
  }

  if (panelTitleNode) {
    panelTitleNode.textContent = title;
  }

  if (panelCopyNode) {
    panelCopyNode.textContent = copy;
  }
};

const clearPendingLongWaitTimer = () => {
  if (!pendingLongWaitTimeoutId) {
    return;
  }

  window.clearTimeout(pendingLongWaitTimeoutId);
  pendingLongWaitTimeoutId = null;
};

const clearClientFallbackTimer = () => {
  if (!clientFallbackTimeoutId) {
    return;
  }

  window.clearTimeout(clientFallbackTimeoutId);
  clientFallbackTimeoutId = null;
};

const clearPendingTimers = () => {
  clearPendingLongWaitTimer();
  clearClientFallbackTimer();
};

const clearPlaybackLoadingFinalizeTimer = () => {
  if (!playbackLoadingFinalizeTimeoutId) {
    return;
  }

  window.clearTimeout(playbackLoadingFinalizeTimeoutId);
  playbackLoadingFinalizeTimeoutId = null;
};

const revokeLocalVideoObjectUrl = () => {
  if (!localVideoObjectUrl) {
    return;
  }

  URL.revokeObjectURL(localVideoObjectUrl);
  localVideoObjectUrl = "";
};

const applyPendingPresentation = ({
  title = "Заклеиваем коробку",
  copy = "Утрамбовываем эмоции и щедро обматываем скотчем. Ещё пара секунд — и коробка появится на экране.",
} = {}) => {
  setLoaderCopy("Пакуем наболевшее!", "15 секунд");
  setPanelCopy({
    kicker: "Подготовка к отправке",
    title,
    copy,
  });
};

const applyPendingLongWaitPresentation = () => {
  applyPendingPresentation({
    title: "Эмоций оказалось многовато",
    copy: "Коробка сопротивляется! Если за минуту не закроем крышку — вернитесь на шаг назад, попробуем заново.",
  });
  setLoaderCopy("Пакуем наболевшее!", "Ещё немного");
};

const applyClientFallbackPresentation = () => {
  setLoaderCopy("Почти готово!", "Сохраняем картинкой");
  setPanelCopy({
    kicker: "Запасной маршрут",
    title: "Готовим картинку",
    copy: "Видео задержалось, поэтому бережно собираем коробку в картинку. Её можно будет скачать или отправить дальше.",
  });
};

const applyPlaybackLoadingPresentation = () => {
  setLoaderCopy("Почти готово!", "Достаём маркер");
  setPanelCopy({
    kicker: "Финишная прямая",
    title: "Ставим на полку",
    copy: "Коробка надёжно запечатана. Сейчас покажем её вам, и посылку можно будет смело отправлять.",
  });
};

const applyReadyPresentation = () => {
  setPanelCopy({
    kicker: "Готово!",
    title: "Можно отправлять",
    copy: "Ваша коробка отпущения собрана. Отправьте её тем, кто вас понимает, или скачайте на память об этом переезде.",
  });
};

const applyImageReadyPresentation = () => {
  setPanelCopy({
    kicker: "Готово!",
    title: "Фото на память",
    copy: "Снять блокбастер про вашу коробку не вышло — камера не выдержала накала страстей. Зато получилась отличная открытка! Отправьте её тем, кто в теме, или сохраните себе на память.",
  });
};

const applyUnavailablePresentation = () => {
  clearPendingTimers();
  disableDownloadLink();

  const pageNode = document.querySelector(".share-player-page");
  if (pageNode) pageNode.classList.add("is-unavailable");

  setLoaderCopy("Коробка потерялась", "Вернитесь и попробуйте\nещё раз");

  if (isMobileViewport.matches) {
    return;
  }

  setPanelCopy({
    kicker: "Ой-ой",
    title: "Посылка не найдена",
    copy: "Коробка затерялась на складе, достать её уже не выйдет. Вернитесь на шаг назад, чтобы собрать новую!",
  });
};

const applyRenderErrorPresentation = () => {
  clearPendingTimers();
  setLoaderCopy("Скотч отклеился", "Попробуйте ещё раз");
  setPanelCopy({
    kicker: "Что-то пошло не так",
    title: "Коробка порвалась",
    copy: "Картон не выдержал накала страстей. Вернитесь назад — возьмём коробку поплотнее и попробуем ещё раз.",
  });
};

const disableDownloadLink = () => {
  if (!downloadLink) {
    return;
  }

  downloadLink.setAttribute("aria-disabled", "true");
  downloadLink.removeAttribute("href");
  downloadLink.removeAttribute("download");
};

const setDownloadState = () => {
  if (!downloadLink) {
    return;
  }

  if (isMobileViewport.matches || !downloadUrl) {
    disableDownloadLink();
    return;
  }

  downloadLink.setAttribute("href", downloadUrl);
  downloadLink.setAttribute("download", fileName);
  downloadLink.removeAttribute("aria-disabled");
};

const resolveRendererUrl = (rendererBaseUrl, pathname) =>
  new URL(
    String(pathname || "").replace(/^\//, ""),
    String(rendererBaseUrl || "")
  ).toString();

const buildResolvedSharePlayerUrl = (payload) => {
  const sharePageUrl = new URL("/share-player.html", `${window.location.origin}/`);

  if (payload?.streamUrl) {
    sharePageUrl.searchParams.set("stream", payload.streamUrl);
  }

  if (payload?.downloadUrl) {
    sharePageUrl.searchParams.set("download", payload.downloadUrl);
  }

  if (payload?.fileName) {
    sharePageUrl.searchParams.set("fileName", payload.fileName);
  }

  if (label) {
    sharePageUrl.searchParams.set("label", label);
  }

  if (startedAtParam > 0) {
    sharePageUrl.searchParams.set(SHARE_PLAYER_STARTED_AT_PARAM, String(startedAtParam));
  }

  return sharePageUrl.toString();
};

const readPendingRenderRequest = () => {
  try {
    const rawPayload = sessionStorage.getItem(PENDING_RENDER_STORAGE_KEY);

    if (!rawPayload) {
      return null;
    }

    const payload = JSON.parse(rawPayload);

    if (!payload || typeof payload !== "object") {
      return null;
    }

    return payload;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getPendingRenderContext = () => {
  const pendingRequest = readPendingRenderRequest();

  return {
    label: pendingRequest?.label || label,
    rendererBaseUrl: pendingRequest?.rendererBaseUrl || pendingRendererBaseUrlParam,
    createdAt: Number(pendingRequest?.createdAt || 0),
  };
};

const clearPendingRenderRequest = () => {
  try {
    sessionStorage.removeItem(PENDING_RENDER_STORAGE_KEY);
  } catch (error) {
    console.error(error);
  }
};

const abortPendingRender = () => {
  if (!pendingRenderAbortController) {
    return;
  }

  pendingRenderAbortController.abort();
  pendingRenderAbortController = null;
};

const canUseClientFallback = () =>
  Boolean(window.HotboxVideoRenderer?.canRenderImageInBrowser?.());

const getShareFlowStartedAt = () => {
  const pendingContext = getPendingRenderContext();

  if (startedAtParam > 0) {
    return startedAtParam;
  }

  if (pendingContext.createdAt > 0) {
    return pendingContext.createdAt;
  }

  return Date.now();
};

const getRemainingDelay = (targetDelayMs) =>
  Math.max(0, targetDelayMs - (Date.now() - getShareFlowStartedAt()));

const hasLongWaitElapsed = () => getRemainingDelay(PENDING_LONG_DELAY_MS) === 0;

const applyWaitingPresentationForCurrentProgress = () => {
  if (isPlaybackLoadingActive || isVideoReady || isClientFallbackRunning) {
    return;
  }

  if (isTimedShareFlow && hasLongWaitElapsed()) {
    applyPendingLongWaitPresentation();
    return;
  }

  applyPendingPresentation();
};

const getShareFileFallbackType = () => {
  const normalizedFileName = String(fileName || "").toLowerCase();

  if (normalizedFileName.endsWith(".png")) {
    return "image/png";
  }

  if (normalizedFileName.endsWith(".jpg") || normalizedFileName.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (normalizedFileName.endsWith(".webp")) {
    return "image/webp";
  }

  if (normalizedFileName.endsWith(".gif")) {
    return "image/gif";
  }

  if (currentMediaKind === "image") {
    return "image/png";
  }

  return "video/mp4";
};

const resetShareFileCache = () => {
  shareFileGeneration += 1;
  shareFile = null;
  shareFilePromise = null;
};

const schedulePendingLongWaitPresentation = () => {
  clearPendingLongWaitTimer();
  pendingLongWaitTimeoutId = window.setTimeout(() => {
    pendingLongWaitTimeoutId = null;

    if (
      isTimedShareFlow &&
      !isVideoReady &&
      !isClientFallbackRunning &&
      !isPlaybackLoadingActive
    ) {
      applyPendingLongWaitPresentation();
    }
  }, getRemainingDelay(PENDING_LONG_DELAY_MS));
};

const fetchShareFile = async ({
  targetDownloadUrl = downloadUrl,
  targetFileName = fileName,
  fallbackType = getShareFileFallbackType(),
} = {}) => {
  if (!targetDownloadUrl) {
    return null;
  }

  const response = await fetch(targetDownloadUrl, {
    mode: "cors",
    credentials: "omit",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch media: ${response.status}`);
  }

  const blob = await response.blob();

  return new File([blob], targetFileName, {
    type: blob.type || fallbackType,
    lastModified: Date.now(),
  });
};

const primeShareFile = () => {
  if (shareFile) {
    return Promise.resolve(shareFile);
  }

  if (!downloadUrl) {
    return null;
  }

  if (!shareFilePromise) {
    const requestGeneration = shareFileGeneration;
    const targetDownloadUrl = downloadUrl;
    const targetFileName = fileName;
    const fallbackType = getShareFileFallbackType();

    shareFilePromise = fetchShareFile({
      targetDownloadUrl,
      targetFileName,
      fallbackType,
    })
      .then((file) => {
        if (requestGeneration !== shareFileGeneration) {
          return shareFile;
        }

        shareFile = file;
        return file;
      })
      .catch((error) => {
        if (requestGeneration === shareFileGeneration) {
          shareFilePromise = null;
        }

        throw error;
      });
  }

  return shareFilePromise;
};

const loadVideoIntoPlayer = ({ skipPendingTimers = false } = {}) => {
  if (!streamUrl) {
    return;
  }

  isVideoReady = false;
  currentMediaKind = "video";
  isPlaybackLoadingActive = false;
  playbackLoadingStartedAt = 0;
  clearPlaybackLoadingFinalizeTimer();
  let didResolve = false;
  const finishReady = () => {
    if (didResolve) {
      return;
    }

    didResolve = true;
    isVideoReady = true;
    clearPendingTimers();
    setImageVisible(false);
    setVideoVisible(true);
    setLoaderVisible(false);
    setStatus("");
    applyReadyPresentation();
    shareButton.disabled = false;
    videoNode.play().catch(() => {});
  };
  const enterPlaybackLoading = () => {
    if (isPlaybackLoadingActive || didResolve) {
      return;
    }

    isPlaybackLoadingActive = true;
    playbackLoadingStartedAt = Date.now();
    clearPendingLongWaitTimer();
    applyPlaybackLoadingPresentation();
    setLoaderVisible(true);
    setStatus("");
  };
  const finalizeReady = () => {
    enterPlaybackLoading();

    const elapsedMs = playbackLoadingStartedAt > 0
      ? Date.now() - playbackLoadingStartedAt
      : PLAYBACK_LOADING_MIN_VISIBLE_MS;
    const remainingMs = Math.max(0, PLAYBACK_LOADING_MIN_VISIBLE_MS - elapsedMs);

    clearPlaybackLoadingFinalizeTimer();
    playbackLoadingFinalizeTimeoutId = window.setTimeout(() => {
      playbackLoadingFinalizeTimeoutId = null;
      finishReady();
    }, remainingMs);
  };
  const finalizeError = () => {
    if (didResolve) {
      return;
    }

    didResolve = true;
    clearPlaybackLoadingFinalizeTimer();

    if (isTimedShareFlow && canUseClientFallback() && !isClientFallbackRunning) {
      startClientFallbackRender("Не удалось открыть видео, поэтому готовим картинку.");
      return;
    }

    applyRenderErrorPresentation();
    setLoaderVisible(true);
    setStatus("Упаковка сорвалась");
    shareButton.disabled = false;
  };

  applyWaitingPresentationForCurrentProgress();
  if (!skipPendingTimers) {
    schedulePendingLongWaitPresentation();
    scheduleClientFallbackRender();
  }
  setLoaderVisible(true);
  setStatus("");
  setDownloadState();
  shareButton.disabled = true;

  videoNode.pause();
  setImageVisible(false);
  setVideoVisible(true);
  videoNode.removeAttribute("src");
  videoNode.load();
  videoNode.addEventListener("loadeddata", finalizeReady, { once: true });
  videoNode.addEventListener("canplay", finalizeReady, { once: true });
  videoNode.addEventListener("error", finalizeError, { once: true });
  videoNode.src = streamUrl;
  videoNode.load();

  primeShareFile()?.catch((error) => {
    console.error(error);
    return null;
  });
};

const loadImageIntoPlayer = () => {
  if (!downloadUrl || !imageNode) {
    return;
  }

  currentMediaKind = "image";
  isVideoReady = false;
  isPlaybackLoadingActive = false;
  playbackLoadingStartedAt = 0;
  clearPlaybackLoadingFinalizeTimer();
  let didResolve = false;
  const finalizeReady = () => {
    if (didResolve) {
      return;
    }

    didResolve = true;
    isVideoReady = true;
    clearPendingTimers();
    setVideoVisible(false);
    setImageVisible(true);
    setLoaderVisible(false);
    setStatus("");
    setDownloadState();
    applyImageReadyPresentation();
    shareButton.disabled = false;
  };
  const finalizeError = () => {
    if (didResolve) {
      return;
    }

    didResolve = true;
    applyRenderErrorPresentation();
    setStatus("Не получилось подготовить картинку.");
    shareButton.disabled = false;
  };

  setLoaderVisible(true);
  setStatus("");
  setDownloadState();
  shareButton.disabled = true;
  setVideoVisible(false);
  setImageVisible(false);
  imageNode.src = "";
  imageNode.addEventListener("load", finalizeReady, { once: true });
  imageNode.addEventListener("error", finalizeError, { once: true });
  imageNode.src = downloadUrl;
};

const startClientFallbackRender = async (
  statusMessage = "Видео не появилось вовремя, поэтому готовим картинку."
) => {
  if (isClientFallbackRunning || isVideoReady) {
    return;
  }

  if (!canUseClientFallback()) {
    applyRenderErrorPresentation();
    setStatus("Не получилось подготовить картинку.");
    return;
  }

  isClientFallbackRunning = true;
  clearPendingTimers();
  clearPlaybackLoadingFinalizeTimer();
  isPlaybackLoadingActive = false;
  playbackLoadingStartedAt = 0;
  abortPendingRender();
  videoNode.pause();
  videoNode.removeAttribute("src");
  videoNode.load();
  setVideoVisible(false);
  setImageVisible(false);
  applyClientFallbackPresentation();
  setLoaderVisible(true);
  setStatus(statusMessage);
  shareButton.disabled = true;

  try {
    const exportPayload = await window.HotboxVideoRenderer.renderImageFile({
      label,
    });

    revokeLocalVideoObjectUrl();
    localVideoObjectUrl = URL.createObjectURL(exportPayload.blob);
    streamUrl = "";
    downloadUrl = localVideoObjectUrl;
    fileName = exportPayload.fileName || fileName;
    resetShareFileCache();
    shareFile = exportPayload.file || null;
    shareFilePromise = shareFile ? Promise.resolve(shareFile) : null;
    currentMediaKind = "image";

    clearPendingRenderRequest();
    loadImageIntoPlayer();
  } catch (error) {
    console.error(error);
    applyRenderErrorPresentation();
    setStatus("Не получилось подготовить картинку.");
  } finally {
    isClientFallbackRunning = false;
  }
};

const scheduleClientFallbackRender = () => {
  clearClientFallbackTimer();

  if (!isTimedShareFlow || isVideoReady || !canUseClientFallback()) {
    return;
  }

  clientFallbackTimeoutId = window.setTimeout(() => {
    clientFallbackTimeoutId = null;

    if (isTimedShareFlow && !isVideoReady) {
      startClientFallbackRender();
    }
  }, getRemainingDelay(CLIENT_FALLBACK_DELAY_MS));
};

const requestServerRenderFromPendingPage = async () => {
  const pendingContext = getPendingRenderContext();

  if (DISABLE_BACKEND_RENDER_REQUEST) {
    return;
  }

  if (!pendingContext.rendererBaseUrl) {
    if (canUseClientFallback()) {
      startClientFallbackRender("Бэкенд недоступен, поэтому готовим картинку.");
      return;
    }

    applyRenderErrorPresentation();
    setStatus("Упаковка сорвалась");
    return;
  }

  pendingRenderAbortController = new AbortController();

  try {
    const response = await fetch(resolveRendererUrl(pendingContext.rendererBaseUrl, "/render"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        label: pendingContext.label,
      }),
      signal: pendingRenderAbortController.signal,
    });

    if (!response.ok) {
      throw new Error(`Renderer request failed: ${response.status}`);
    }

    const payload = await response.json();

    if (!payload?.streamUrl && !payload?.downloadUrl) {
      throw new Error("Renderer response is incomplete.");
    }

    streamUrl = payload.streamUrl
      ? resolveRendererUrl(pendingContext.rendererBaseUrl, payload.streamUrl)
      : resolveRendererUrl(pendingContext.rendererBaseUrl, payload.downloadUrl);
    downloadUrl = payload.downloadUrl
      ? resolveRendererUrl(pendingContext.rendererBaseUrl, payload.downloadUrl)
      : streamUrl;
    fileName = payload.fileName || fileName;
    resetShareFileCache();

    clearPendingTimers();
    clearPendingRenderRequest();
    pendingRenderAbortController = null;
    window.location.replace(
      buildResolvedSharePlayerUrl({
        streamUrl,
        downloadUrl,
        fileName,
      })
    );
  } catch (error) {
    if (error?.name === "AbortError") {
      return;
    }

    console.error(error);

    if (canUseClientFallback()) {
      startClientFallbackRender("Видео на бэкенде не собралось, поэтому готовим картинку.");
      return;
    }

    applyRenderErrorPresentation();
    setStatus("Упаковка сорвалась");
  } finally {
    pendingRenderAbortController = null;
  }
};

const shareCurrentVideo = async () => {
  if (!streamUrl && !downloadUrl) {
    return;
  }

  if (typeof navigator.share === "function") {
    try {
      const file = await primeShareFile()?.catch(() => null);

      if (file) {
        const filePayload = {
          files: [file],
          title: label,
          text: label,
        };

        if (
          typeof navigator.canShare !== "function" ||
          navigator.canShare(filePayload)
        ) {
          await navigator.share(filePayload);
          return;
        }
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      console.error(error);
    }
  }

  window.location.href = downloadUrl || streamUrl;
};

const rememberReturnTarget = () => {
  try {
    sessionStorage.setItem(RETURN_SCROLL_STORAGE_KEY, LANDING_RETURN_TARGET_SELECTOR);
  } catch (error) {
    console.error(error);
  }

  if (!window.opener || window.opener.closed) {
    return;
  }

  try {
    window.opener.sessionStorage.setItem(
      RETURN_SCROLL_STORAGE_KEY,
      LANDING_RETURN_TARGET_SELECTOR
    );
  } catch (error) {
    console.error(error);
  }
};

const scrollOpenerToLandingTarget = () => {
  if (!window.opener || window.opener.closed) {
    return false;
  }

  const targetNode = window.opener.document.querySelector(LANDING_RETURN_TARGET_SELECTOR);

  if (!targetNode) {
    return false;
  }

  targetNode.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  try {
    window.opener.history.replaceState(null, "", LANDING_RETURN_TARGET_SELECTOR);
  } catch (error) {
    console.error(error);
  }

  return true;
};

setTitle("Вот она, родимая");
setDownloadState();

if (!streamUrl) {
  if (isPending) {
    applyWaitingPresentationForCurrentProgress();
    schedulePendingLongWaitPresentation();
    scheduleClientFallbackRender();
    requestServerRenderFromPendingPage();
  } else {
    applyUnavailablePresentation();
  }

  setLoaderVisible(true);
  setStatus("");
  shareButton.disabled = true;
} else {
  loadVideoIntoPlayer();
}

shareButton?.addEventListener("click", shareCurrentVideo);

backButton?.addEventListener("click", () => {
  clearPendingTimers();
  abortPendingRender();
  clearPendingRenderRequest();
  rememberReturnTarget();

  if (scrollOpenerToLandingTarget()) {
    try {
      window.opener.focus();
      window.close();
      return;
    } catch (error) {
      console.error(error);
    }
  }

  window.location.replace(LANDING_RETURN_URL);
});

window.addEventListener("pagehide", () => {
  clearPendingTimers();
  clearPlaybackLoadingFinalizeTimer();
  abortPendingRender();
  revokeLocalVideoObjectUrl();
});
window.addEventListener("beforeunload", () => {
  clearPendingTimers();
  clearPlaybackLoadingFinalizeTimer();
  abortPendingRender();
  revokeLocalVideoObjectUrl();
});
