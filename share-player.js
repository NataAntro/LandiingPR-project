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

let streamUrl = params.get("stream") || "";
let downloadUrl = params.get("download") || streamUrl;
let fileName = params.get("fileName") || "hotbox.mp4";
const label = params.get("label") || "Готовая коробка";
const isPending = params.get("pending") === "1";
let shareFilePromise = null;
let shareFile = null;
let pendingRenderAbortController = null;

const isAppleMobileDevice = () => {
  const userAgent = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const maxTouchPoints = Number(navigator.maxTouchPoints || 0);

  return (
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (platform === "MacIntel" && maxTouchPoints > 1)
  );
};

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

const hasLiveOpener = () => Boolean(window.opener && !window.opener.closed);

const applyPendingPresentation = (copy) => {
  setLoaderCopy("Собираем!", "15 секунд");
  setPanelCopy({
    kicker: "Видео-коробка",
    title: "Собираем видео",
    copy,
  });
};

const applyPlaybackLoadingPresentation = () => {
  setLoaderCopy("Собираем!", "Готовим предпросмотр");
  setPanelCopy({
    kicker: "Почти готово",
    title: "Загружаем видео",
    copy: "Рендер завершился. Сейчас подтянем ролик в плеер, и можно будет поделиться им или скачать файл.",
  });
};

const applyReadyPresentation = () => {
  setPanelCopy({
    kicker: "Готово",
    title: "Коробка собрана",
    copy: "Видео уже в плеере. Можно делиться ссылкой или скачать файл на компьютер.",
  });
};

const applyUnavailablePresentation = () => {
  if (isMobileViewport.matches) {
    setLoaderCopy("Видео не найдено", "Попробуйте ещё раз");
    return;
  }

  setLoaderCopy("Не получилось открыть", "Вернитесь назад и попробуйте ещё раз");
  setPanelCopy({
    kicker: "Нужен новый запуск",
    title: "Видео ещё не открыто",
    copy: "Похоже, эта ссылка уже не может подтянуть готовый ролик. Вернитесь назад и запустите сборку коробки ещё раз.",
  });
};

const applyRenderErrorPresentation = () => {
  setLoaderCopy("Не получилось собрать", "Попробуйте ещё раз");
  setPanelCopy({
    kicker: "Рендер остановился",
    title: "Видео не собралось",
    copy: "Сервис не смог закончить подготовку ролика. Вернитесь назад и попробуйте снова.",
  });
};

const setDownloadState = () => {
  if (!downloadLink) {
    return;
  }

  if (isMobileViewport.matches) {
    downloadLink.setAttribute("aria-disabled", "true");
    downloadLink.removeAttribute("href");
    return;
  }

  if (!downloadUrl) {
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

    if (!payload?.rendererBaseUrl || !payload?.label) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error(error);
    return null;
  }
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

const requestServerRenderFromPendingPage = async () => {
  const pendingRequest = readPendingRenderRequest();

  if (!pendingRequest) {
    applyPendingPresentation(
      hasLiveOpener()
        ? "Подождите немного: как только рендер завершится, видео появится здесь автоматически."
        : "Видео всё ещё готовится на сервисе. Если эта вкладка не обновится в течение минуты, вернитесь назад и запустите сборку ещё раз."
    );
    setStatus("");
    return;
  }

  pendingRenderAbortController = new AbortController();

  try {
    const response = await fetch(resolveRendererUrl(pendingRequest.rendererBaseUrl, "/render"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        label: pendingRequest.label,
      }),
      signal: pendingRenderAbortController.signal,
    });

    if (!response.ok) {
      throw new Error(`Renderer request failed: ${response.status}`);
    }

    const payload = await response.json();

    streamUrl = resolveRendererUrl(pendingRequest.rendererBaseUrl, payload.streamUrl);
    downloadUrl = payload.downloadUrl
      ? resolveRendererUrl(pendingRequest.rendererBaseUrl, payload.downloadUrl)
      : streamUrl;
    fileName = payload.fileName || fileName;

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
    applyRenderErrorPresentation();
    setStatus("Рендер не завершился");
  } finally {
    pendingRenderAbortController = null;
  }
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
  if (!downloadUrl) {
    return null;
  }

  if (shareFile) {
    return Promise.resolve(shareFile);
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

const shareCurrentVideo = async () => {
  if (!streamUrl) {
    return;
  }

  if (typeof navigator.share === "function") {
    try {
      const file = await primeShareFile().catch(() => null);

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

setTitle("Ваша коробка");
setDownloadState();

if (!streamUrl) {
  if (isPending) {
    applyPendingPresentation(
      "Подождите немного: как только рендер завершится, видео появится здесь автоматически."
    );
  } else {
    applyUnavailablePresentation();
  }
  setLoaderVisible(true);
  setStatus("");
  shareButton.disabled = true;

  if (isPending) {
    requestServerRenderFromPendingPage();
  }
} else {
  applyPlaybackLoadingPresentation();
  setLoaderVisible(true);
  setStatus("");
  videoNode.src = streamUrl;
  videoNode.load();
  const revealVideo = () => {
    setLoaderVisible(false);
    setStatus("");
    applyReadyPresentation();
    videoNode.play().catch(() => {});
  };
  videoNode.addEventListener("loadeddata", revealVideo, { once: true });
  videoNode.addEventListener("canplay", revealVideo, { once: true });
  shareButton.disabled = true;
  downloadLink.removeAttribute("aria-disabled");
  primeShareFile()
    .catch((error) => {
      console.error(error);
      return null;
    })
    .finally(() => {
      shareButton.disabled = false;
    });
}

shareButton?.addEventListener("click", shareCurrentVideo);

backButton?.addEventListener("click", () => {
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

window.addEventListener("pagehide", abortPendingRender);
window.addEventListener("beforeunload", abortPendingRender);
