export const getUrlSearchParams = (href, keys) => {
  const res = [];
  const nullIndex = [];

  const fullURL = new URL(href);
  const fullURLSearchParams = fullURL.searchParams;

  keys.forEach((key, index) => {
    if (fullURLSearchParams.has(key)) {
      res.push(fullURLSearchParams.get(key));
    } else {
      nullIndex.push(index);
      res.push("");
    }
  });

  if (nullIndex.length > 0) {
    const hash = fullURL.hash;
    const queryString = hash.split("?")[1];
    if (queryString) {
      const usp2 = new URLSearchParams(queryString);
      nullIndex.forEach((ki) => {
        const key = keys[ki];
        if (usp2.has(key)) {
          res.splice(ki, 1, usp2.get(key));
        }
      });
    }
  }
  return res;
};

const deleteSearchParams = (search, keys) => {
  if (!search) return "";
  const params = new URLSearchParams(search);
  if (Array.isArray(keys) && keys.length === 0) {
    Array.from(params.keys()).forEach((key) => {
      params.delete(key);
    });
  } else {
    keys.forEach((key) => params.delete(key));
  }
  return params.toString();
};

export const deleteParams = (href, keys) => {
  try {
    const url = new URL(href);
    let { origin, pathname, search, hash } = url;
    search = deleteSearchParams(search, keys);

    if (hash) {
      const hashContent = hash.split("#")[1];
      const queryIndex = hashContent.indexOf("?");
      const path =
        queryIndex === -1 ? hashContent : hashContent.slice(0, queryIndex);
      const query = queryIndex === -1 ? "" : hashContent.slice(queryIndex + 1);
      const cleanedQuery = deleteSearchParams(query, keys);
      hash = `${path}${cleanedQuery ? `?${cleanedQuery}` : ""}`;
    }

    return `${origin}${pathname}${search ? `?${search}` : ""}${hash ? `#${hash}` : ""}`;
  } catch (e) {
    console.error(e);
    return href;
  }
};
