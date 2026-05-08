const keys = { 37: 1, 38: 1, 39: 1, 40: 1, 32: 1 };
let scrollLockCount = 0;
let previousHtmlOverflow = "";
let previousBodyOverflow = "";
let previousHtmlOverscrollBehavior = "";
let previousBodyOverscrollBehavior = "";

const preventDefault = (e) => e.preventDefault();

const preventDefaultForScrollKeys = (e) => {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
};

export const disableScroll = () => {
  if (typeof window === "undefined") return;

  if (scrollLockCount === 0) {
    previousHtmlOverflow = document.documentElement.style.overflow;
    previousBodyOverflow = document.body.style.overflow;
    previousHtmlOverscrollBehavior = document.documentElement.style.overscrollBehavior;
    previousBodyOverscrollBehavior = document.body.style.overscrollBehavior;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";
  }
  scrollLockCount += 1;

  window.addEventListener("keydown", preventDefaultForScrollKeys, false);
};

export const enableScroll = () => {
  if (typeof window === "undefined") return;

  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.documentElement.style.overflow = previousHtmlOverflow;
    document.body.style.overflow = previousBodyOverflow;
    document.documentElement.style.overscrollBehavior = previousHtmlOverscrollBehavior;
    document.body.style.overscrollBehavior = previousBodyOverscrollBehavior;
  }

  window.removeEventListener("keydown", preventDefaultForScrollKeys, false);
};
