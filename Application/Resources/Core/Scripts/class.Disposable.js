class Disposable {

    Dispose() {
        if (this.isDisposed) return;

        const object = this;
        object.isDisposed = true;
        Object.keys(object).forEach(function (key) {
            if (key != 'isDisposed') object[key] = null;
        });
    }

}