export function extractType(type){
    const regexp = /(\w+)$/gi;
    const res = type.match(regexp);
    return res[0];
}

export function extractFileName(url) {
    const regexp = /([^/]+)$/;
    const res = url.match(regexp);
    return res[0];
  }