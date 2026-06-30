import React from 'react';

const AdsterraBanner = () => {
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
    <div className="w-full flex justify-center my-6">
      <iframe
        title="Adsterra Banner Ad"
        srcDoc={adHtml}
        width="468"
        height="60"
        style={{ border: 'none', overflow: 'hidden', display: 'block' }}
        scrolling="no"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
      />
    </div>
  );
};

export default AdsterraBanner;
