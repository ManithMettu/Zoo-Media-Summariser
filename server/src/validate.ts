export function validateText(text: unknown): string | null {
  if (!text || typeof text !== "string" || text.trim() === "") {
    return "Input text is required";
  }
  return null;
}
