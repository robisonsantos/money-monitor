function sanitizeText(input) {
  if (typeof input !== "string") return "";
  return input.replace(/[\x00-\x1F\x7F]/g, "").replace(/\s+/g, " ").trim();
}
function sanitizeEmail(email) {
  if (typeof email !== "string") return "";
  return email.toLowerCase().trim().replace(/[^\w\-@.]/g, "");
}
function sanitizeCSVValue(value) {
  if (typeof value !== "string") return "";
  if (value.startsWith("=") || value.startsWith("+") || value.startsWith("-") || value.startsWith("@")) {
    return `'${value}`;
  }
  return value;
}
function sanitizeName(name) {
  if (typeof name !== "string") return "";
  return name.replace(/[<>\"'&]/g, "").replace(/\s+/g, " ").trim().substring(0, 100);
}
export {
  sanitizeText as a,
  sanitizeName as b,
  sanitizeCSVValue as c,
  sanitizeEmail as s
};
