class Disposable {

    Dispose() {
        const object = this;
        Object.keys(object).forEach(function (key) {
            if (object[key] instanceof Disposable) object[key].Dispose();
            object[key] = null;
        });
    }

}