export function extractFormat(url) {
  const regexp = /\.(\w+)$/;
  const match = url.match(regexp);

  if (match) {
    const fileExtension = match[1];
    return fileExtension;
  } else {
    return false;
  }
}
