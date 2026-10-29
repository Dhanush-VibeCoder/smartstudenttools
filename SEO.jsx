import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const DEFAULT_DOMAIN = "https://smartstudenttools.xyz";

const SEO = ({ title, description, url, image, type = "website", children, jsonLd }) => {
  // Reliably update browser document.title and history on route transitions
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  const cleanUrl = url
    ? url.replace(/https?:\/\/(?:www\.)?(?:yourdomain\.com|smartstudenttools\.com)/g, DEFAULT_DOMAIN)
    : DEFAULT_DOMAIN;

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={cleanUrl} />
      {/* Open Graph */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={cleanUrl} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:type" content={type} />
      {/* Twitter Card */}
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
      {children}
    </Helmet>
  );
};

export default SEO;
