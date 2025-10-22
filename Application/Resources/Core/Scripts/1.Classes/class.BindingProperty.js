class BindingProperty {

    constructor(source, sourceProperty, target, targetProperty) {
        let object = this;

        object.sourceProperty = sourceProperty;
        object.targetProperty = targetProperty;

        object.Source = source;
        object.Target = target;
    }

    set Source(newValue) {
        let object = this;
        object.source = newValue;
        if (object.source && object.source.OnPropertyChange) {
            object.source.OnPropertyChange.Listen(function (sender, property) {
                if (property != object.sourceProperty) return;
                object.target[object.targetProperty] = object.source[object.sourceProperty];
            });
        }
    }

    set Target(newValue) {
        let object = this;
        object.target = newValue;
        if (object.target && object.target.OnPropertyChange) {
            object.target.OnPropertyChange.Listen(function (sender, property) {
                if (property != object.targetProperty) return;
                object.target[object.targetProperty] = object.target[object.targetProperty];
            });
        }
    }

}