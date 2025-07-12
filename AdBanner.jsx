import React, { useEffect } from 'react';

const AdBanner = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, []);
  return (
    <ins className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-3940256099942544"  // Google official test client ID
      data-ad-slot="1234567890"                // Google official test slot ID
      data-ad-format="auto"
      data-full-width-responsive="true"></ins>
  );
};

export default AdBanner; 