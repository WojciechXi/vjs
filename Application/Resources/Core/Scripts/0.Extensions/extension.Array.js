Array.prototype.Add = function (item) {
    let array = this;
    let index = array.push(item);
    return index;
};

Array.prototype.RemoveAt = function (index) {
    let array = this;
    let items = array.splice(index, 1);
    return items;
};

Array.prototype.Remove = function (item) {
    let array = this;
    let index = array.indexOf(item);
    return array.RemoveAt(index);
};