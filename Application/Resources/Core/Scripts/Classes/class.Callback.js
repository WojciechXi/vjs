class Callback {

    constructor() {
        let object = this;
        object.listeners = [];
    }

    Listen(listener) {
        let object = this;
        object.listeners.push(listener);
    }

    Invoke(sender, data) {
        let object = this;
        object.listeners.forEach(function (listener) {
            if (listener) listener(sender, data);
        });
    }

}