import React, { useEffect, useRef } from 'react';

const AdsterraBanner = () => {
  const bannerRef = useRef(null);

  useEffect(() => {
    // Prevent double injection if React StrictMode runs useEffect twice in dev
    if (bannerRef.current && bannerRef.current.children.length === 0) {
      const atOptionsScript = document.createElement('script');
      atOptionsScript.innerHTML = `
        atOptions = {
          'key' : 'df7782dab2b3bf1f4d1769fee2e778a4',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      `;

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = 'https://www.highperformanceformat.com/df7782dab2b3bf1f4d1769fee2e778a4/invoke.js';

      bannerRef.current.appendChild(atOptionsScript);
      bannerRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className="w-full flex justify-center my-6">
      <div 
        ref={bannerRef} 
        style={{ width: '468px', height: '60px', overflow: 'hidden', textAlign: 'center' }} 
      />
    </div>
  );
};

export default AdsterraBanner;
