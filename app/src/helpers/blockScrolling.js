const keys = { 37: 1, 38: 1, 39: 1, 40: 1, 32: 1 };
let scrollLockCount = 0;
let previousHtmlOverflow = "";
let previousBodyOverflow = "";

const preventDefault = (e) => e.preventDefault();

const preventDefaultForScrollKeys = (e) => {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
};

const supportsPassive = (() => {
  if (typeof window === "undefined") return false;
  let passiveSupported = false;
  try {
    window.addEventListener(
      "test",
      null,
      Object.defineProperty({}, "passive", {
        get() {
          passiveSupported = true;
          return true;
        },
      }),
    );
  } catch (_) {
    // ignore errors
  }
  return passiveSupported;
})();

const options = supportsPassive ? { passive: false } : false;

export const disableScroll = () => {
  if (typeof window === "undefined") return;

  if (scrollLockCount === 0) {
    previousHtmlOverflow = document.documentElement.style.overflow;
    previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }
  scrollLockCount += 1;

  window.addEventListener("DOMMouseScroll", preventDefault, false);
  window.addEventListener("wheel", preventDefault, options);
  window.addEventListener("touchmove", preventDefault, options);
  window.addEventListener("keydown", preventDefaultForScrollKeys, false);
};

export const enableScroll = () => {
  if (typeof window === "undefined") return;

  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.documentElement.style.overflow = previousHtmlOverflow;
    document.body.style.overflow = previousBodyOverflow;
  }

  window.removeEventListener("DOMMouseScroll", preventDefault, false);
  window.removeEventListener("wheel", preventDefault, options);
  window.removeEventListener("touchmove", preventDefault, options);
  window.removeEventListener("keydown", preventDefaultForScrollKeys, false);
};
