// Parse @mentions from text - returns array of mentioned names
export function parseMentions(text: string): string[] {
  const regex = /@(\w+(?:\s\w+)?)/g;
  const mentions: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
}

// Check if text contains any mentions
export function hasMentions(text: string): boolean {
  return /@\w+/.test(text);
}
