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

const measureRenderedCharacters = (container, stageRect) => {
  const result = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

  let node = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    const text = node.textContent || "";

    if (parent && !parent.closest("[data-no-fall='true']") && text.trim().length > 0) {
      const computed = window.getComputedStyle(parent);

      for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        if (/\s/.test(char)) continue;

        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + 1);

        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          result.push({
            char,
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
  const letterRefs = useRef([]);

  const [letters, setLetters] = useState([]);
  const [circleModel, setCircleModel] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [dropStarted, setDropStarted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [layoutVersion, setLayoutVersion] = useState(0);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code !== "Space" || dropStarted) return;
      event.preventDefault();
      setShowOverlay(true);
      setDropStarted(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dropStarted]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return undefined;

    let raf = 0;
    const resizeObserver = new ResizeObserver(() => {
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
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const content = contentRef.current;
    const circleSource = circleSourceRef.current;
    if (!stage || !content || !circleSource) return;

    const stageRect = stage.getBoundingClientRect();
    const measured = measureRenderedCharacters(content, stageRect);
    const circleRect = circleSource.getBoundingClientRect();

    setLetters(measured);
    setCircleModel({
      x: circleRect.left - stageRect.left,
      y: circleRect.top - stageRect.top,
      width: circleRect.width,
      height: circleRect.height,
    });
    setIsReady(measured.length > 0);
  }, [layoutVersion]);

  useEffect(() => {
    if (!dropStarted || letters.length === 0) return undefined;

    const stage = stageRef.current;
    if (!stage) return undefined;

    const { Engine, World, Bodies, Runner, Events } = Matter;
    const engine = Engine.create();
    engine.gravity.y = 0.9;

    const stageRect = stage.getBoundingClientRect();
    const width = stageRect.width;
    const height = stageRect.height;
    const wallThickness = 120;

    const walls = [
      Bodies.rectangle(width / 2, height + wallThickness / 2, width + wallThickness * 2, wallThickness, { isStatic: true }),
      Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height + wallThickness * 2, { isStatic: true }),
      Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height + wallThickness * 2, { isStatic: true }),
    ];

    const letterBodies = letters.map((letter) =>
      Bodies.rectangle(letter.x + letter.width / 2, letter.y + letter.height / 2, letter.width, letter.height, {
        restitution: 0.25,
        friction: 0.08,
        frictionAir: 0.02,
      }),
    );

    const circleBody =
      circleModel && circleModel.width > 0 && circleModel.height > 0
        ? Bodies.circle(
            circleModel.x + circleModel.width / 2,
            circleModel.y + circleModel.height / 2,
            Math.min(circleModel.width, circleModel.height) / 2,
            {
              isStatic: true,
              restitution: 0.6,
            },
          )
        : null;

    World.add(engine.world, [...walls, ...letterBodies, ...(circleBody ? [circleBody] : [])]);

    const syncPositions = () => {
      letterBodies.forEach((body, index) => {
        const node = letterRefs.current[index];
        const letter = letters[index];
        if (!node) return;

        node.style.transform = `translate(${body.position.x - letter.width / 2}px, ${
          body.position.y - letter.height / 2
        }px) rotate(${body.angle}rad)`;
      });
    };

    const runner = Runner.create();
    Events.on(engine, "afterUpdate", syncPositions);
    Runner.run(runner, engine);
    syncPositions();

    return () => {
      Runner.stop(runner);
      Events.off(engine, "afterUpdate", syncPositions);
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [circleModel, dropStarted, letters]);

  return (
    <main className={styles.main}>
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
              className={styles.circleOverlay}
              style={{
                transform: `translate(${circleModel.x}px, ${circleModel.y}px)`,
              }}
            />
          ) : null}
          {letters.map((letter, index) => (
            <span
              key={`physics-${letter.char}-${index}`}
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
                color: letter.color,
              }}
            >
              {letter.char}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
