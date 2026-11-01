import React from 'react';

const AdsterraRectangle = ({ adKey = 'df7782dab2b3bf1f4d1769fee2e778a4' }) => {
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
            'key' : '${adKey}',
            'format' : 'iframe',
            'height' : 250,
            'width' : 300,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className="w-full flex flex-col items-center justify-center my-6 overflow-hidden px-2">
      <span className="text-[10px] tracking-wider uppercase text-gray-400 dark:text-gray-500 font-semibold mb-1.5">
        Sponsored
      </span>
      <div
        style={{
          width: '300px',
          height: '250px',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-white/50 dark:bg-gray-800/50 shadow-sm flex items-center justify-center"
      >
        <iframe
          title="Sponsored Advertisement"
          srcDoc={adHtml}
          width="300"
          height="250"
          style={{
            border: 'none',
            overflow: 'hidden',
            display: 'block'
          }}
          scrolling="no"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
        />
      </div>
    </div>
  );
};

export default AdsterraRectangle;

