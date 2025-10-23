Array.prototype.__defineGetter__('Changed', function () {
    let array = this;
    return array.changed ?? (array.changed = new Callback());
});

Array.prototype.Add = function (item) {
    let array = this;
    let index = array.push(item);
    array.Changed.Invoke(array, {
        index: index,
        item: item,
    });
    return index;
};

Array.prototype.RemoveAt = function (index) {
    let array = this;
    let items = array.splice(index, 1);
    array.Changed.Invoke(array, {
        index: index,
        items: items,
    });
    return items;
};

Array.prototype.Remove = function (item) {
    let array = this;
    let index = array.indexOf(item);
    return array.RemoveAt(index);
};