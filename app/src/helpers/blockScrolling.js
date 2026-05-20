const keys = { 37: 1, 38: 1, 39: 1, 40: 1, 32: 1 };
let scrollLockCount = 0;
let previousHtmlOverflow = "";
let previousBodyOverflow = "";
let previousHtmlOverscrollBehavior = "";
let previousBodyOverscrollBehavior = "";
let previousBodyPosition = "";
let previousBodyTop = "";
let previousBodyLeft = "";
let previousBodyRight = "";
let previousBodyWidth = "";
let lockedScrollY = 0;

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
    lockedScrollY = window.scrollY || window.pageYOffset || 0;

    previousHtmlOverflow = document.documentElement.style.overflow;
    previousBodyOverflow = document.body.style.overflow;
    previousHtmlOverscrollBehavior = document.documentElement.style.overscrollBehavior;
    previousBodyOverscrollBehavior = document.body.style.overscrollBehavior;
    previousBodyPosition = document.body.style.position;
    previousBodyTop = document.body.style.top;
    previousBodyLeft = document.body.style.left;
    previousBodyRight = document.body.style.right;
    previousBodyWidth = document.body.style.width;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";

    // Chrome mobile can still scroll with overflow hidden alone; fixed-body lock prevents that.
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    // document.body.style.width = "100%";
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
    document.body.style.position = previousBodyPosition;
    document.body.style.top = previousBodyTop;
    document.body.style.left = previousBodyLeft;
    document.body.style.right = previousBodyRight;
    document.body.style.width = previousBodyWidth;
    window.scrollTo(0, lockedScrollY);
  }

  window.removeEventListener("keydown", preventDefaultForScrollKeys, false);
};
