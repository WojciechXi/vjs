class Disposable {

    Dispose() {
        const object = this;
        Object.keys(object).forEach(function (key) { object[key] = null; });
    }

}