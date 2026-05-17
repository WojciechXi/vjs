class Property extends Disposable {

    constructor(target, property, value = null, onChange = null, parser = null, disposable = false) {
        super();

        let object = this;

        object.value = null;

        object.target = target;
        object.property = property;
        object.onChange = onChange;
        object.parser = parser;
        object.disposable = disposable;

        Object.defineProperty(object.target, object.property, {
            get: function () {
                return object.value;
            },
            set: function (newValue) {
                if (object.parser) newValue = object.parser(newValue);

                let oldValue = object.value;
                if (oldValue != newValue) {
                    if (object.disposable && oldValue instanceof Disposable) oldValue.Dispose();
                }

                object.value = newValue;
                if (object.onChange) object.onChange.call(object.target, object.property, oldValue, newValue);
            }
        });

        if (value !== null && value !== undefined) object.target[property] = value;

        (target._properties ?? (target._properties = {}))[property] = object;
    }

}