import React, { useEffect } from 'react';

const AdBanner = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, []);
  return (
    <div style={{ width: '100%', minWidth: 320, display: 'block' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minWidth: 320, height: 100 }}
        data-ad-client="ca-app-pub-2490991830256147/1477987136"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdBanner; 
