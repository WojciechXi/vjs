class Binding {

    constructor(source, property, onChange = null) {
        let object = this;

        object.property = property;
        object.onChange = onChange;

        object.Source = source;
    }

    set Source(newValue) {
        let object = this;
        object.source = newValue;
        if (object.source && object.source.OnPropertyChange) {
            object.source.OnPropertyChange.Listen(function (sender, property) {
                if (property != object.property) return;
                if (object.onChange) object.onChange(object.source, {
                    property: object.property,
                    value: object.source[object.property],
                });
            });

            if (object.onChange) object.onChange(object.source, {
                property: object.property,
                value: object.source[object.property],
            });
        }
    }

}