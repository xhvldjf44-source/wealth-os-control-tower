import React, { useRef, useState } from "react";

export default function CreativeRoom() {
    const canvasRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [color, setColor] = useState("#000000");
    const [lineWidth, setLineWidth] = useState(3);

    const startDrawing = (e) => {
        const ctx = canvasRef.current.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setDrawing(true);
    };

    const draw = (e) => {
        if (!drawing) return;

        const ctx = canvasRef.current.getContext("2d");
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.stroke();
    };

    const stopDrawing = () => {
        setDrawing(false);
    };

    const clearCanvas = () => {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>창작실 브러시</h2>

            <div style={{ marginBottom: "12px" }}>
                <label>색상: </label>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />

                <label style={{ marginLeft: "12px" }}>굵기: </label>
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                />

                <button onClick={clearCanvas} style={{ marginLeft: "12px" }}>
                    전체 지우기
                </button>
            </div>

            <canvas
                ref={canvasRef}
                width={800}
                height={400}
                style={{
                    border: "1px solid red",
                    background: "white", cursor: "crosshair",
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
            />
        </div>
    );
}