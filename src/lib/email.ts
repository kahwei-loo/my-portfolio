/**
 * Obfuscate email from static HTML crawlers.
 * The email is split into parts and assembled at runtime,
 * so bots scanning raw HTML won't find a valid address.
 */
const EMAIL_PARTS = ["kahwei.loo.dev", "gmail.com"] as const;

export function getEmail(): string {
  return `${EMAIL_PARTS[0]}@${EMAIL_PARTS[1]}`;
}

export function getMailtoHref(): string {
  return `mailto:${getEmail()}`;
}
