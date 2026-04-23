import { Helmet } from "react-helmet-async";

const SITE_URL = "https://celeweevent.com";
const SITE_NAME = "Céléwé Events";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.jpg`;
const DEFAULT_DESCRIPTION =
  "Céléwé Events is Manila's premier VIP nightlife and experience agency — curating exclusive events, private soirées, and unforgettable moments for the discerning few.";

interface SEOProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  canonicalPath?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
}

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  canonicalPath,
  noIndex = false,
  jsonLd,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Manila's Elite Nightlife`;
  const canonical = canonicalPath ? `${SITE_URL}${canonicalPath}` : SITE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_PH" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
