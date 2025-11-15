import { useState, useRef, useEffect, useCallback } from "react";
import "./App.css";

interface TextPosition {
  x: number;
  y: number;
}

interface EditorState {
  backgroundColor: string;
  logoUrl: string;
  brandingText: string;
  brandingColor: string;
  brandingFont: string;
  brandingFontSize: number;
  brandingPosition: TextPosition;
  sloganText: string;
  sloganColor: string;
  sloganFont: string;
  sloganFontSize: number;
  sloganPosition: TextPosition;
}

function App() {
  const [state, setState] = useState<EditorState>({
    backgroundColor: "#998675",
    logoUrl: "https://pub-0fb0d577adfe4917a76fe1d7f5297aab.r2.dev/LOGO.png",
    brandingText: "TEN THUONG HIEU",
    brandingColor: "#ebebeb",
    brandingFont: "Arial",
    brandingFontSize: 100,
    brandingPosition: { x: 177.53, y: 946.87 },
    sloganText: "SLOGAN CUA BAN",
    sloganColor: "#ebebeb",
    sloganFont: "Arial",
    sloganFontSize: 60,
    sloganPosition: { x: 375.44, y: 1054.87 },
  });

  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<TextPosition>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const fonts = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Georgia",
    "Comic Sans MS",
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setState((prev) => ({
          ...prev,
          logoUrl: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getPointFromEvent = (
    clientX: number,
    clientY: number
  ): { x: number; y: number } | null => {
    if (!svgRef.current) return null;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const point = svg.createSVGPoint();
    point.x = clientX - rect.left;
    point.y = clientY - rect.top;
    return { x: point.x, y: point.y };
  };

  const handleMouseDown = (
    e: React.MouseEvent,
    textId: "branding" | "slogan"
  ) => {
    e.preventDefault();
    const point = getPointFromEvent(e.clientX, e.clientY);
    if (!point) return;

    const currentPosition =
      textId === "branding" ? state.brandingPosition : state.sloganPosition;
    setDragOffset({
      x: point.x - currentPosition.x,
      y: point.y - currentPosition.y,
    });
    setDragging(textId);
  };

  const handleTouchStart = (
    e: React.TouchEvent,
    textId: "branding" | "slogan"
  ) => {
    e.preventDefault();
    const touch = e.touches[0];
    const point = getPointFromEvent(touch.clientX, touch.clientY);
    if (!point) return;

    const currentPosition =
      textId === "branding" ? state.brandingPosition : state.sloganPosition;
    setDragOffset({
      x: point.x - currentPosition.x,
      y: point.y - currentPosition.y,
    });
    setDragging(textId);
  };

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragging) return;
      const point = getPointFromEvent(clientX, clientY);
      if (!point) return;

      const newPosition = {
        x: point.x - dragOffset.x,
        y: point.y - dragOffset.y,
      };

      if (dragging === "branding") {
        setState((prev) => ({ ...prev, brandingPosition: newPosition }));
      } else {
        setState((prev) => ({ ...prev, sloganPosition: newPosition }));
      }
    },
    [dragging, dragOffset]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY);
    },
    [updatePosition]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePosition(touch.clientX, touch.clientY);
      }
    },
    [updatePosition]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [
    dragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  return (
    <div className="app-container">
      <h1>SVG Editor</h1>
      <div className="editor-wrapper">
        <div className="controls-panel">
          <div className="control-section">
            <h3>Background</h3>
            <label>
              Màu nền:
              <input
                type="color"
                value={state.backgroundColor}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    backgroundColor: e.target.value,
                  }))
                }
              />
            </label>
          </div>

          <div className="control-section">
            <h3>Logo</h3>
            <label>
              Upload logo:
              <input type="file" accept="image/*" onChange={handleLogoUpload} />
            </label>
            {state.logoUrl && (
              <div className="logo-preview">
                <img
                  src={state.logoUrl}
                  alt="Logo preview"
                  style={{ maxWidth: "100px", maxHeight: "100px" }}
                />
              </div>
            )}
          </div>

          <div className="control-section">
            <h3>Header (Branding)</h3>
            <label>
              Text:
              <input
                type="text"
                value={state.brandingText}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    brandingText: e.target.value,
                  }))
                }
              />
            </label>
            <label>
              Màu chữ:
              <input
                type="color"
                value={state.brandingColor}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    brandingColor: e.target.value,
                  }))
                }
              />
            </label>
            <label>
              Font:
              <select
                value={state.brandingFont}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    brandingFont: e.target.value,
                  }))
                }
              >
                {fonts.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Kích thước:
              <input
                type="number"
                value={state.brandingFontSize}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    brandingFontSize: parseInt(e.target.value) || 100,
                  }))
                }
                min="10"
                max="200"
              />
            </label>
          </div>

          <div className="control-section">
            <h3>Subhead (Slogan)</h3>
            <label>
              Text:
              <input
                type="text"
                value={state.sloganText}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, sloganText: e.target.value }))
                }
              />
            </label>
            <label>
              Màu chữ:
              <input
                type="color"
                value={state.sloganColor}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, sloganColor: e.target.value }))
                }
              />
            </label>
            <label>
              Font:
              <select
                value={state.sloganFont}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, sloganFont: e.target.value }))
                }
              >
                {fonts.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Kích thước:
              <input
                type="number"
                value={state.sloganFontSize}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    sloganFontSize: parseInt(e.target.value) || 60,
                  }))
                }
                min="10"
                max="200"
              />
            </label>
          </div>
        </div>

        <div className="svg-preview">
          <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1281 1281"
            width="600"
            height="600"
            style={{
              border: "1px solid #ccc",
              background: "#f5f5f5",
              maxWidth: "100%",
              height: "auto",
            }}
          >
            <path
              id="background"
              style={{ fill: state.backgroundColor }}
              d="M.5.5h1280v1280H.5z"
            />
            <image
              width="601"
              height="600"
              transform="translate(340 211.13)"
              href={state.logoUrl}
            />
            <text
              id="branding"
              x={state.brandingPosition.x}
              y={state.brandingPosition.y}
              style={{
                fontSize: `${state.brandingFontSize}px`,
                fontFamily: state.brandingFont,
                fill: state.brandingColor,
                cursor: "move",
                touchAction: "none",
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
              onMouseDown={(e) => handleMouseDown(e, "branding")}
              onTouchStart={(e) => handleTouchStart(e, "branding")}
            >
              {state.brandingText}
            </text>
            <text
              id="slogan"
              x={state.sloganPosition.x}
              y={state.sloganPosition.y}
              style={{
                fontSize: `${state.sloganFontSize}px`,
                fontFamily: state.sloganFont,
                fill: state.sloganColor,
                cursor: "move",
                touchAction: "none",
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
              onMouseDown={(e) => handleMouseDown(e, "slogan")}
              onTouchStart={(e) => handleTouchStart(e, "slogan")}
            >
              {state.sloganText}
            </text>
          </svg>
          <p className="hint">💡 Kéo thả text để di chuyển vị trí</p>
        </div>
      </div>
    </div>
  );
}

export default App;
