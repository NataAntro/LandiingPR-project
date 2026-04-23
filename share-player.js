const params = new URLSearchParams(window.location.search);

const titleNode = document.querySelector("#share-player-title");
const statusNode = document.querySelector("#share-player-status");
const videoNode = document.querySelector("#share-player-video");
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
const PENDING_LONG_DELAY_MS = 30_000;
const CLIENT_FALLBACK_DELAY_MS = 60_000;

let streamUrl = params.get("stream") || "";
let downloadUrl = params.get("download") || streamUrl;
let fileName = params.get("fileName") || "hotbox.mp4";
const label = params.get("label") || "Коробка отпущения";
const isPending = params.get("pending") === "1";
const pendingRendererBaseUrlParam = params.get("rendererBaseUrl") || "";
let shareFilePromise = null;
let shareFile = null;
let pendingRenderAbortController = null;
let pendingLongWaitTimeoutId = null;
let clientFallbackTimeoutId = null;
let isClientFallbackRunning = false;
let localVideoObjectUrl = "";

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
};

const applyClientFallbackPresentation = () => {
  setLoaderCopy("Почти готово!", "Собираем сами");
  setPanelCopy({
    kicker: "Запасной маршрут",
    title: "Готовим коробку прямо здесь",
    copy: "Сервер задержался, поэтому собираем видео прямо в браузере. Это займёт ещё немного времени, зато коробка останется с вами.",
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

const applyUnavailablePresentation = () => {
  clearPendingTimers();

  setLoaderCopy("Коробка потерялась", "Вернитесь и попробуйте ещё раз");

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

const setDownloadState = () => {
  if (!downloadLink) {
    return;
  }

  if (isMobileViewport.matches || !downloadUrl) {
    downloadLink.setAttribute("aria-disabled", "true");
    downloadLink.removeAttribute("href");
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
  Boolean(window.HotboxVideoRenderer?.canRenderVideoInBrowser?.());

const schedulePendingLongWaitPresentation = () => {
  clearPendingLongWaitTimer();
  pendingLongWaitTimeoutId = window.setTimeout(() => {
    pendingLongWaitTimeoutId = null;

    if (!streamUrl && isPending && !isClientFallbackRunning) {
      applyPendingLongWaitPresentation();
    }
  }, PENDING_LONG_DELAY_MS);
};

const fetchShareFile = async () => {
  if (!downloadUrl) {
    return null;
  }

  const response = await fetch(downloadUrl, {
    mode: "cors",
    credentials: "omit",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch video: ${response.status}`);
  }

  const blob = await response.blob();

  return new File([blob], fileName, {
    type: blob.type || "video/mp4",
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
    shareFilePromise = fetchShareFile()
      .then((file) => {
        shareFile = file;
        return file;
      })
      .catch((error) => {
        shareFilePromise = null;
        throw error;
      });
  }

  return shareFilePromise;
};

const loadVideoIntoPlayer = () => {
  if (!streamUrl) {
    return;
  }

  let didResolve = false;
  const finalizeReady = () => {
    if (didResolve) {
      return;
    }

    didResolve = true;
    clearPendingTimers();
    setLoaderVisible(false);
    setStatus("");
    applyReadyPresentation();
    shareButton.disabled = false;
    videoNode.play().catch(() => {});
  };
  const finalizeError = () => {
    if (didResolve) {
      return;
    }

    didResolve = true;
    applyRenderErrorPresentation();
    setLoaderVisible(true);
    setStatus("Упаковка сорвалась");
    shareButton.disabled = false;
  };

  applyPlaybackLoadingPresentation();
  setLoaderVisible(true);
  setStatus("");
  setDownloadState();
  shareButton.disabled = true;

  videoNode.pause();
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

const startClientFallbackRender = async () => {
  if (isClientFallbackRunning || streamUrl) {
    return;
  }

  if (!canUseClientFallback()) {
    applyRenderErrorPresentation();
    setStatus("Упаковка сорвалась");
    return;
  }

  isClientFallbackRunning = true;
  clearPendingTimers();
  abortPendingRender();
  applyClientFallbackPresentation();
  setLoaderVisible(true);
  setStatus("Сервер задержался, поэтому собираем коробку прямо в браузере.");
  shareButton.disabled = true;

  try {
    const exportPayload = await window.HotboxVideoRenderer.renderVideoFile({ label });

    revokeLocalVideoObjectUrl();
    localVideoObjectUrl = URL.createObjectURL(exportPayload.blob);
    streamUrl = localVideoObjectUrl;
    downloadUrl = localVideoObjectUrl;
    fileName = exportPayload.fileName || fileName;
    shareFile = exportPayload.file || null;
    shareFilePromise = shareFile ? Promise.resolve(shareFile) : null;

    clearPendingRenderRequest();
    loadVideoIntoPlayer();
  } catch (error) {
    console.error(error);
    applyRenderErrorPresentation();
    setStatus("Упаковка сорвалась");
  } finally {
    isClientFallbackRunning = false;
  }
};

const scheduleClientFallbackRender = () => {
  clearClientFallbackTimer();

  if (!isPending || streamUrl || !canUseClientFallback()) {
    return;
  }

  clientFallbackTimeoutId = window.setTimeout(() => {
    clientFallbackTimeoutId = null;

    if (!streamUrl && isPending) {
      startClientFallbackRender();
    }
  }, CLIENT_FALLBACK_DELAY_MS);
};

const requestServerRenderFromPendingPage = async () => {
  const pendingContext = getPendingRenderContext();

  if (!pendingContext.rendererBaseUrl) {
    if (!canUseClientFallback()) {
      applyRenderErrorPresentation();
      setStatus("Упаковка сорвалась");
    }

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
    shareFile = null;
    shareFilePromise = null;

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

    if (!canUseClientFallback()) {
      applyRenderErrorPresentation();
      setStatus("Упаковка сорвалась");
      return;
    }

    setStatus("Сервер задержался. Ждём ещё немного и подключим запасной маршрут.");
  } finally {
    pendingRenderAbortController = null;
  }
};

const shareCurrentVideo = async () => {
  if (!streamUrl) {
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

      await navigator.share({
        title: label,
        text: label,
        url: downloadUrl || streamUrl,
      });
      return;
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
    applyPendingPresentation();
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
  abortPendingRender();
  revokeLocalVideoObjectUrl();
});
window.addEventListener("beforeunload", () => {
  clearPendingTimers();
  abortPendingRender();
  revokeLocalVideoObjectUrl();
});
