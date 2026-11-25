/**
 * Schema.org blocks for search engines and social previews.
 *
 * A plain <script> is the only supported way to emit JSON-LD in the App
 * Router; the payload is built from typed objects, never from user input.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify escapes the content; `</script>` cannot appear in a
      // parsed JSON string without becoming \u003c.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
