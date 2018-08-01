module.exports = (val, min, max) => {
  if (val < min) {
    return 0;
  }

  if (val > max) {
    return 100;
  }

  return (val-min) / (max - min) * 100;
};
