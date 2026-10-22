import sanitizeHtml from "sanitize-html";

const defaultOptions = {
  allowedTags: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "p",
    "a",
    "ul",
    "ol",
    "li",
    "b",
    "i",
    "strong",
    "em",
    "strike",
    "code",
    "hr",
    "br",
    "div",
    "table",
    "thead",
    "caption",
    "tbody",
    "tr",
    "th",
    "td",
    "pre",
    "img",
    "figure",
    "figcaption",
    "span",
    "sub",
    "sup",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel", "title", "class"],
    img: ["src", "srcset", "alt", "title", "width", "height", "loading", "class"],
    div: ["class", "id"],
    span: ["class", "style"],
    p: ["class", "style"],
    table: ["class", "border", "cellpadding", "cellspacing"],
    td: ["colspan", "rowspan", "class"],
    th: ["colspan", "rowspan", "class"],
    code: ["class"],
    pre: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.target === "_blank") {
        attribs.rel = "noopener noreferrer";
      }
      return { tagName, attribs };
    },
  },
};

/**
 * Sanitizes rich text HTML content to prevent XSS.
 * @param {string} html - Raw HTML input from editor
 * @returns {string} Clean, safe HTML string
 */
export function sanitizeRichText(html) {
  if (!html || typeof html !== "string") return "";
  return sanitizeHtml(html, defaultOptions);
}

/**
 * Strips all HTML tags and trims whitespace.
 * @param {string} text - Raw string
 * @returns {string} Plain text
 */
export function sanitizePlainText(text) {
  if (!text || typeof text !== "string") return "";
  return sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} }).trim();
}

export default sanitizeRichText;
