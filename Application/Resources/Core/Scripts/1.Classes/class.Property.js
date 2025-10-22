class Property {

    constructor(target, property, value = null, onChange = null, parser = null) {
        let object = this;

        object.value = null;

        object.target = target;
        object.property = property;
        object.parser = parser;
        object.onChange = onChange;

        Object.defineProperty(object.target, object.property, {
            get: function () {
                return object.value;
            },
            set: function (newValue) {
                if (object.parser) newValue = object.parser(newValue);

                let oldValue = object.value;
                if (oldValue != newValue) {
                    object.value = newValue;
                    if (object.onChange) object.onChange.call(object.target, object.property, oldValue, newValue);
                }
            }
        });

        object.target[property] = value;
    }

}