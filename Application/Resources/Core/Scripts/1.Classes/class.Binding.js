class Binding extends Disposable {

    constructor(source, property, onChange = null) {
        super();

        let object = this;

        object.property = property;
        object.onChange = onChange;

        object.Source = source;

        (source._bindings ?? (source._bindings = [])).push(object);
    }

    set Source(newValue) {
        let object = this;

        if (object.source == newValue) return;

        if (object.source && object.source.OnPropertyChange && object.listener) {
            object.source.OnPropertyChange.Remove(object.listener);
            object.listener = null;
        }

        object.source = newValue;
        if (object.source && object.source.OnPropertyChange) {
            object.listener = function (sender, property) {
                if (property != object.property) return;
                if (object.onChange) object.onChange(object.source, {
                    property: object.property,
                    value: object.source[object.property],
                });
            };

            object.source.OnPropertyChange.Listen(object.listener);

            if (object.onChange) object.onChange(object.source, {
                property: object.property,
                value: object.source[object.property],
            });
        }
    }

}