import React from 'react';

interface RulerProps {
    orientation: 'vertical' | 'horizontal';
    length: number; // Length of the ruler in inches
    width: number; // Width of the ruler in pixels
}

const Ruler: React.FC<RulerProps> = ({ orientation, length, width }) => {
    const pixelsPerInch = 48; // Standard DPI
    const totalLength = length * pixelsPerInch;
    const rulerWidth = orientation === 'horizontal' ? totalLength : width;
    const rulerHeight = orientation === 'vertical' ? totalLength : width;

    const generateMarkers = () => {
        const markers = [];
        for (let i = 0; i <= length * 16; i++) {
            const position = (i / 16) * pixelsPerInch;
            const markerHeight = i % 16 === 0 ? 20 : i % 8 === 0 ? 15 : i % 4 === 0 ? 10 : 5;

            markers.push(
                <line
                    key={i}
                    x1={orientation === 'horizontal' ? position : 0}
                    y1={orientation === 'horizontal' ? 0 : position}
                    x2={orientation === 'horizontal' ? position : markerHeight}
                    y2={orientation === 'horizontal' ? markerHeight : position}
                    stroke="black"
                    strokeWidth="1"
                />
            );

            if (i % 16 === 0) {
                markers.push(
                    <g key={`text-${i}`}>
                        <rect
                            x={orientation === 'horizontal' ? position - 10 : 25}
                            y={orientation === 'horizontal' ? 25 : position - 10}
                            width="20"
                            height="20"
                            fill="none"
                        />
                        <text
                            x={orientation === 'horizontal' ? position : 35}
                            y={orientation === 'horizontal' ? 40 : position + 5}
                            fontSize="14"
                            fontWeight="bold"
                            textAnchor={orientation === 'horizontal' ? 'middle' : 'start'}
                        >
                            {i / 16}
                        </text>
                    </g>
                );
            }
        }
        return markers;
    };

    return (
        <svg
            width={rulerWidth}
            height={rulerHeight}
            viewBox={`0 0 ${rulerWidth} ${rulerHeight}`}
            role="img"
            aria-label={`${length}-inch ${orientation} ruler`}
            style={
                orientation === 'vertical' ? { marginTop: 0 } : { marginLeft: pixelsPerInch + 11 }
            }
        >
            <rect
                x="0"
                y="0"
                width={rulerWidth}
                height={rulerHeight}
                fill="none"
                stroke="black"
                strokeWidth="1"
            />
            {generateMarkers()}
        </svg>
    );
};

export default Ruler;
