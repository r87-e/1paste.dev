import type { FC, Child } from "hono/jsx";
import { FONT_CSS } from "./fonts";
import { STYLES } from "./styles";

export interface SeoProps {
  title: string;
  description: string;
  canonical: string;
  siteUrl: string;
  robots?: string; // e.g. "noindex, nofollow"
  jsonLd?: object | object[];
  scripts?: string; // inlined client JS
  children?: Child;
}

export const Shell: FC<SeoProps> = (props) => {
  const {
    title,
    description,
    canonical,
    siteUrl,
    robots,
    jsonLd,
    scripts,
    children,
  } = props;
  const ogImage = `${siteUrl}/og.jpg`;
  const ld = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        {robots ? <meta name="robots" content={robots} /> : null}
        <meta name="theme-color" content="#07120F" />
        <meta name="color-scheme" content="dark" />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="1paste" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />

        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <style dangerouslySetInnerHTML={{ __html: FONT_CSS + STYLES }} />
        {ld.map((obj, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
          />
        ))}
      </head>
      <body>
        <div class="backdrop"></div>
        <div class="grid"></div>
        {children}
        <div class="toast" id="toast">copied</div>
        {scripts ? <script dangerouslySetInnerHTML={{ __html: scripts }} /> : null}
      </body>
    </html>
  );
};
