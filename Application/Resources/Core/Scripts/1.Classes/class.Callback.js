class Callback {

    constructor() {
        const object = this;
        object.listeners = [];
    }

    Listen(listener) {
        const object = this;
        object.listeners.push(listener);
    }

    Remove(listener) {
        const object = this;
        const index = object.listeners.indexOf(listener);
        if (index >= 0) return object.listeners.splice(index, 1);
        return null;
    }

    Clear() {
        const object = this;
        return object.listeners = [];
    }

    Invoke(sender, data) {
        const object = this;
        for (let listener of object.listeners) {
            try {
                if (listener) listener(sender, data);
            } catch (exception) {
                console.error(exception);
            }
        }
    }

}