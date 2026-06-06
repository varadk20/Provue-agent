export function normalizeMerchant(
  merchant: string,
  memo?: string
): string {

  let source = merchant;

  if (memo) {

    const match =
      memo.match(
        /\/([A-Z0-9 ]+)\/[a-z0-9._-]+@/i
      );

    if (match) {
      source = match[1];
    }
  }

  return source
    .toLowerCase()

    // convert special chars to spaces
    .replace(/[^a-z0-9]/g, " ")

    // collapse spaces
    .replace(/\s+/g, " ")

    .trim();
}