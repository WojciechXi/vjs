Math.Clamp = function (value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
};

Math.Lerp = function (a, b, t) {
    return a + (b - a) * t;
};

Math.Round = function (value, decimals = 2) {
    let power = Math.pow(10, decimals);
    return Math.round(value * power) / power;
};

Math.ZeroBefore = function (value, count = 1) {
    value = parseInt(value);
    if (value < 10) return `0${value}`;
    return value;
};