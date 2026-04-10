import { useEffect, useRef } from "react";

let mathJaxPromise = null;

const loadMathJax = () => {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  if (window.MathJax?.typesetPromise) {
    return Promise.resolve(window.MathJax);
  }

  if (!mathJaxPromise) {
    mathJaxPromise = new Promise((resolve) => {
      window.MathJax = window.MathJax || {
        tex: {
          inlineMath: [
            ["\\(", "\\)"],
            ["$", "$"],
          ],
          displayMath: [
            ["\\[", "\\]"],
            ["$$", "$$"],
          ],
        },
        options: {
          skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"],
        },
        startup: {
          typeset: false,
          ready: () => {
            window.MathJax.startup.defaultReady();
            resolve(window.MathJax);
          },
        },
      };

      const existingScript = document.getElementById("mathjax-script");

      if (existingScript) {
        if (window.MathJax?.typesetPromise) {
          resolve(window.MathJax);
          return;
        }

        existingScript.addEventListener(
          "load",
          () => {
            resolve(window.MathJax || null);
          },
          { once: true },
        );

        existingScript.addEventListener(
          "error",
          () => {
            resolve(null);
          },
          { once: true },
        );

        return;
      }

      const script = document.createElement("script");
      script.id = "mathjax-script";
      script.async = true;
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js";
      script.addEventListener(
        "error",
        () => {
          resolve(null);
        },
        { once: true },
      );

      document.head.appendChild(script);
    });
  }

  return mathJaxPromise;
};

const MathText = ({ text = "", inline = false, className = "" }) => {
  const ref = useRef(null);
  const content = String(text ?? "");
  const Tag = inline ? "span" : "div";

  useEffect(() => {
    let isActive = true;

    loadMathJax().then((MathJax) => {
      if (!isActive || !ref.current || !MathJax?.typesetPromise) {
        return;
      }

      MathJax.typesetClear?.([ref.current]);
      MathJax.typesetPromise([ref.current]).catch(() => {});
    });

    return () => {
      isActive = false;
    };
  }, [content]);

  return (
    <Tag className={`math-text ${inline ? "math-text-inline" : "math-text-block"} ${className}`.trim()} ref={ref}>
      {content}
    </Tag>
  );
};

export default MathText;
