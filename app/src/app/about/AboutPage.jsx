"use client";

import Matter from "matter-js";
import { useEffect, useMemo, useRef, useState } from "react";

import AnimationLink from "@/components/Animation/AnimationLink";
import styles from "./AboutPage.module.css";

const portableTextToPlainText = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";

  return value
    .map((block) => {
      if (typeof block === "string") return block;
      if (block?._type === "block" && Array.isArray(block.children)) {
        return block.children.map((child) => child?.text || "").join("");
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
};

const measureRenderedWords = (container, stageRect) => {
  const result = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

  let node = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    const text = node.textContent || "";

    if (parent && !parent.closest("[data-no-fall='true']") && text.trim().length > 0) {
      const computed = window.getComputedStyle(parent);

      const wordMatcher = /\S+/g;
      let match;
      while ((match = wordMatcher.exec(text)) !== null) {
        const token = match[0];
        const start = match.index;
        const end = start + token.length;
        const range = document.createRange();
        range.setStart(node, start);
        range.setEnd(node, end);

        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          result.push({
            text: token,
            x: rect.left - stageRect.left,
            y: rect.top - stageRect.top,
            width: rect.width,
            height: rect.height,
            fontFamily: computed.fontFamily,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
            fontStyle: computed.fontStyle,
            lineHeight: computed.lineHeight,
            letterSpacing: computed.letterSpacing,
            color: computed.color,
          });
        }
      }
    }

    node = walker.nextNode();
  }

  return result;
};

const AboutPage = ({ about }) => {
  const descriptionText = useMemo(() => portableTextToPlainText(about?.description), [about?.description]);
  const selectedClientsText = useMemo(() => portableTextToPlainText(about?.selectedClients), [about?.selectedClients]);
  const selectedClients = useMemo(
    () =>
      selectedClientsText
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean),
    [selectedClientsText],
  );
  const contacts = Array.isArray(about?.contact) ? about.contact : [];

  const stageRef = useRef(null);
  const contentRef = useRef(null);
  const circleSourceRef = useRef(null);
  const circleOverlayRef = useRef(null);
  const letterRefs = useRef([]);

  const [letters, setLetters] = useState([]);
  const [circleModel, setCircleModel] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [dropStarted, setDropStarted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [layoutVersion, setLayoutVersion] = useState(0);

  const triggerDrop = () => {
    if (dropStarted) return;
    setShowOverlay(true);
    setDropStarted(true);
  };

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return undefined;

    let raf = 0;
    const resizeObserver = new ResizeObserver(() => {
      if (dropStarted) return;
      cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        setLayoutVersion((value) => value + 1);
      });
    });

    resizeObserver.observe(content);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
    };
  }, [dropStarted]);

  useEffect(() => {
    if (dropStarted) return;

    const stage = stageRef.current;
    const content = contentRef.current;
    const circleSource = circleSourceRef.current;
    if (!stage || !content || !circleSource) return;

    const stageRect = stage.getBoundingClientRect();
    const measured = measureRenderedWords(content, stageRect);
    const circleRect = circleSource.getBoundingClientRect();

    setLetters(measured);
    setCircleModel({
      x: circleRect.left - stageRect.left,
      y: circleRect.top - stageRect.top,
      width: circleRect.width,
      height: circleRect.height,
    });
    setIsReady(measured.length > 0);
  }, [dropStarted, layoutVersion]);

  useEffect(() => {
    if (!dropStarted || letters.length === 0) return undefined;

    const stage = stageRef.current;
    if (!stage) return undefined;

    const { Engine, World, Bodies, Body, Runner, Events } = Matter;
    const engine = Engine.create({ enableSleeping: true });
    engine.gravity.y = 1.35;
    engine.positionIterations = 12;
    engine.velocityIterations = 10;
    engine.constraintIterations = 4;

    const wallThickness = 120;
    let walls = [];

    const buildWalls = () => {
      const rect = stage.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      return [
        Bodies.rectangle(width / 2, height + wallThickness / 2, width + wallThickness * 2, wallThickness, { isStatic: true }),
        Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height + wallThickness * 2, { isStatic: true }),
        Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height + wallThickness * 2, { isStatic: true }),
      ];
    };

    const isMobileViewport = typeof window !== "undefined" && window.innerWidth < 768;
    const WORD_HITBOX_SCALE_X = isMobileViewport ? 1 : 0.9;
    const WORD_HITBOX_SCALE_Y = isMobileViewport ? 1 : 0.82;
    const WORD_SLOP = isMobileViewport ? 0.001 : 0.02;
    const allowWordRotation = !isMobileViewport;
    const letterBodies = letters.map((letter) => {
      const bodyWidth = Math.max(1, letter.width * WORD_HITBOX_SCALE_X);
      const bodyHeight = Math.max(1, letter.height * WORD_HITBOX_SCALE_Y);

      return Bodies.rectangle(letter.x + letter.width / 2, letter.y + letter.height / 2, bodyWidth, bodyHeight, {
        restitution: 0,
        friction: 0.22,
        frictionStatic: 0.9,
        frictionAir: 0.02,
        sleepThreshold: 40,
        slop: WORD_SLOP,
        inertia: allowWordRotation ? undefined : Infinity,
      });
    });

    const circleBody =
      circleModel && circleModel.width > 0 && circleModel.height > 0
        ? Bodies.circle(
            circleModel.x + circleModel.width / 2,
            circleModel.y + circleModel.height / 2,
            Math.min(circleModel.width, circleModel.height) / 2,
            {
              restitution: 0.08,
              friction: 0.12,
              frictionStatic: 0.8,
              frictionAir: 0.015,
              density: 0.0005,
              sleepThreshold: 40,
              slop: WORD_SLOP,
            },
          )
        : null;

    walls = buildWalls();
    World.add(engine.world, [...walls, ...letterBodies, ...(circleBody ? [circleBody] : [])]);

    const MOVEMENT_EPSILON = 0.02;
    const ANGLE_EPSILON = 0.001;
    const SETTLE_FRAMES_REQUIRED = 20;
    const lastWordTransforms = letterBodies.map(() => ({ x: Number.NaN, y: Number.NaN, angle: Number.NaN }));
    let lastCircleTransform = { x: Number.NaN, y: Number.NaN, angle: Number.NaN };
    let settledFrames = 0;
    let runnerActive = true;

    const syncPositions = (force = false) => {
      letterBodies.forEach((body, index) => {
        const node = letterRefs.current[index];
        const letter = letters[index];
        if (!node) return;

        const nextX = body.position.x - letter.width / 2;
        const nextY = body.position.y - letter.height / 2;
        const nextAngle = body.angle;
        const prev = lastWordTransforms[index];
        const movedEnough =
          force ||
          Math.abs(nextX - prev.x) > MOVEMENT_EPSILON ||
          Math.abs(nextY - prev.y) > MOVEMENT_EPSILON ||
          Math.abs(nextAngle - prev.angle) > ANGLE_EPSILON;
        if (!movedEnough) return;

        node.style.transform = allowWordRotation
          ? `translate(${nextX}px, ${nextY}px) rotate(${nextAngle}rad)`
          : `translate(${nextX}px, ${nextY}px)`;
        prev.x = nextX;
        prev.y = nextY;
        prev.angle = nextAngle;
      });

      if (circleBody && circleOverlayRef.current) {
        const radius = Math.min(circleModel.width, circleModel.height) / 2;
        const nextX = circleBody.position.x - radius;
        const nextY = circleBody.position.y - radius;
        const nextAngle = circleBody.angle;
        const movedEnough =
          force ||
          Math.abs(nextX - lastCircleTransform.x) > MOVEMENT_EPSILON ||
          Math.abs(nextY - lastCircleTransform.y) > MOVEMENT_EPSILON ||
          Math.abs(nextAngle - lastCircleTransform.angle) > ANGLE_EPSILON;

        if (movedEnough) {
          circleOverlayRef.current.style.transform = `translate(${nextX}px, ${nextY}px) rotate(${nextAngle}rad)`;
          lastCircleTransform = { x: nextX, y: nextY, angle: nextAngle };
        }
      }

      const dynamicBodies = [...letterBodies, ...(circleBody ? [circleBody] : [])];
      const allSleeping = dynamicBodies.every((body) => body.isSleeping);
      settledFrames = allSleeping ? settledFrames + 1 : 0;
      if (runnerActive && settledFrames >= SETTLE_FRAMES_REQUIRED) {
        Runner.stop(runner);
        runnerActive = false;
      }
    };

    const handleResize = () => {
      World.remove(engine.world, walls);
      walls = buildWalls();
      World.add(engine.world, walls);

      // Keep bodies within the new horizontal bounds so they continue naturally after resize.
      const rect = stage.getBoundingClientRect();
      const minX = 0;
      const maxX = rect.width;
      [...letterBodies, ...(circleBody ? [circleBody] : [])].forEach((body) => {
        const clampedX = Math.min(Math.max(body.position.x, minX), maxX);
        if (clampedX !== body.position.x) {
          Body.setPosition(body, { x: clampedX, y: body.position.y });
        }
      });
      syncPositions(true);
    };

    const runner = Runner.create();
    Events.on(engine, "afterUpdate", syncPositions);
    Runner.run(runner, engine);
    syncPositions(true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      Runner.stop(runner);
      Events.off(engine, "afterUpdate", syncPositions);
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [circleModel, dropStarted, letters]);

  return (
    <main
      className={styles.main}
      onClick={(event) => {
        if (event.target.closest("a, button")) return;
        triggerDrop();
      }}
    >
      <div ref={contentRef} className={showOverlay ? styles.staticHidden : ""}>
        <div ref={circleSourceRef} className={styles.circleStatic} aria-hidden />

        <section className={styles.block}>
          <h2 className={styles.label}>Description</h2>
          {descriptionText.trim() ? <p className={styles.paragraph}>{descriptionText}</p> : <p>No description available.</p>}
        </section>

        <section className={styles.block}>
          <h2 className={styles.label}>Clients</h2>
          {selectedClients.length > 0 ? (
            <ul className={styles.list}>
              {selectedClients.map((client, index) => (
                <li key={`${client}-${index}`}>{client}</li>
              ))}
            </ul>
          ) : (
            <p>No clients listed.</p>
          )}
        </section>

        <section className={styles.block}>
          <h2 className={styles.label}>Contact</h2>
          {contacts.length > 0 ? (
            <ul className={styles.list}>
              {contacts.map((item, index) => {
                const linkLabel =
                  typeof item?.link === "string"
                    ? item.link.replace(/^https?:\/\//, "").replace(/^mailto:/, "")
                    : item?.platform;

                return (
                  <li key={`${item?.platform || "contact"}-${index}`}>
                    {item?.platform ? `${item.platform}: ` : ""}
                    {item?.link ? <AnimationLink link={item.link}>{linkLabel || "Link"}</AnimationLink> : "No link"}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No contact info listed.</p>
          )}
        </section>
      </div>

      <div ref={stageRef} className={styles.physicsStage}>
        <div className={`${styles.letterLayer} ${showOverlay && isReady ? styles.letterLayerReady : ""}`} aria-hidden>
          {circleModel ? (
            <div
              ref={circleOverlayRef}
              className={styles.circleOverlay}
              style={{
                transform: `translate(${circleModel.x}px, ${circleModel.y}px)`,
              }}
            />
          ) : null}
          {letters.map((letter, index) => (
              <span
                key={`physics-${letter.text}-${index}`}
                ref={(node) => {
                  letterRefs.current[index] = node;
                }}
                className={styles.letter}
                style={{
                  transform: `translate(${letter.x}px, ${letter.y}px)`,
                  fontFamily: letter.fontFamily,
                  fontSize: letter.fontSize,
                  fontWeight: letter.fontWeight,
                  fontStyle: letter.fontStyle,
                  lineHeight: letter.lineHeight,
                  letterSpacing: letter.letterSpacing,
                  color: "var(--foreground)",
                }}
              >
              {letter.text}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
