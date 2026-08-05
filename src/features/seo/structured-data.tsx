
/**
 * Renders a JSON-LD block.
 *
 * <p>`dangerouslySetInnerHTML` is unavoidable — the content of a
 * `application/ld+json` script must be raw JSON, and React would escape it into
 * invalid markup otherwise. The value is always `JSON.stringify` of an object
 * this module built, never a string from anywhere else, and {@link sanitize}
 * neutralises the one sequence that could still break out of the tag.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitize(JSON.stringify(data)) }}
    />
  );
}

/**
 * A `<` inside a JSON string value would otherwise be able to close the script
 * tag early — `</script>` in a hotel description is enough. JSON.stringify does
 * not escape it, because it is valid JSON; it just isn't safe inside HTML.
 */
function sanitize(json: string): string {
  return json.replace(/</g, "\\u003c");
}


// Re-exported so call sites can import the component and the builders together.
export * from "./schemas";
