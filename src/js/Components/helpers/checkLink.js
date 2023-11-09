export function checkLink(text) {
  const regex =
    /\b(?:https?:\/\/)(?:www\.)?[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+\S*\b/gi;
  return regex.test(text);
}

export function createStringWithLinkEl(s) {
  const regex =
    /\b(?:https?:\/\/)(?:www\.)?[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+\S*\b/gi;
  const link = s.match(regex).join(" ");
  const splitted = s.split(regex);
  let pEl = document.createElement("p");

  splitted.splice(1, 0, link);

  splitted.forEach((item, i) => {
    if (i === 0) {
      pEl.append(item);
      return;
    }
    if (checkLink(item)) {
      const a = document.createElement("a");
      a.textContent = item;
      a.setAttribute("href", item);
      a.setAttribute("target", "_blank");
      pEl.append(a);
      return;
    }
    pEl.append(item);
  });
  return pEl;
}
