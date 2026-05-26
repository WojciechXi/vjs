class Bindable extends Disposable {

    constructor() {
        super();
        const object = this;
        object._bindings = [];
    }

    Dispose() {
        if (this.isDisposed) return;

        for (let binding of this._bindings) binding.Dispose();
        super.Dispose();
    }

}