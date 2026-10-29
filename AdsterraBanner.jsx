import React, { useState, useEffect, useRef } from 'react';

const AdsterraBanner = () => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const availableWidth = containerRef.current.offsetWidth;
        if (availableWidth < 468 && availableWidth > 0) {
          // Leave a slight margin (16px) on mobile so it doesn't touch screen edges
          const newScale = Math.min(1, Math.max(0.6, (availableWidth - 16) / 468));
          setScale(newScale);
        } else {
          setScale(1);
        }
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const adHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            background-color: transparent;
          }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : 'df7782dab2b3bf1f4d1769fee2e778a4',
            'format' : 'iframe',
            'height' : 60,
            'width' : 468,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/df7782dab2b3bf1f4d1769fee2e778a4/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div ref={containerRef} className="w-full flex justify-center my-6 overflow-hidden px-2">
      <div
        style={{
          width: scale < 1 ? `${Math.round(468 * scale)}px` : '468px',
          height: `${Math.round(60 * scale)}px`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <iframe
          title="Adsterra Banner Ad"
          srcDoc={adHtml}
          width="468"
          height="60"
          style={{
            border: 'none',
            overflow: 'hidden',
            display: 'block',
            transform: scale < 1 ? `scale(${scale})` : 'none',
            transformOrigin: 'top left'
          }}
          scrolling="no"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
        />
      </div>
    </div>
  );
};

export default AdsterraBanner;
