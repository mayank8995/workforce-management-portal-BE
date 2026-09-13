function extract(current, remainingKeys) {
  // Whatever we're standing on is the value to collect. Last item in the path.
  if (remainingKeys.length === 0) {
    if (current == null) return [];

    if (Array.isArray(current)) {
      return current.flatMap((item) => extract(item, []));
    }

    if (typeof current === 'object') {
      return [];
    }

    return [String(current)];
  }

  if (current == null) {
    return [];
  }

  if (Array.isArray(current)) {
    return current.flatMap((item) => extract(item, remainingKeys));
  }

  if (typeof current !== 'object') {
    return [];
  }

  const [key, ...rest] = remainingKeys;

  return extract(current[key], rest);
}

module.exports = {
  extract,
};
