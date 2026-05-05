class Editable extends View {

    get ElementTag() { return 'editable'; }

    get ElementAttrs() {
        let attrs = super.ElementAttrs;
        let object = this;
        attrs.contenteditable = true;
        return attrs;
    }

    get ElementEvents() {
        let events = super.ElementEvents;
        let object = this;
        events.input = function (sender, event) {
            object.Value = object.Element.innerHTML;
            object.OnInput.Invoke(object, event);
        };
        events.blur = function (sender, event) {
            object.Value = object.Element.innerHTML;
            object.OnBlur.Invoke(object, event);
        };
        return events;
    }

    get OnInput() { return this.onInput ?? (this.onInput = new Callback()); }
    get OnChange() { return this.onChange ?? (this.onChange = new Callback()); }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Value', data.value ?? '', function (property, oldValue, newValue) {
            if (object.Element.innerHTML != newValue) object.Element.innerHTML = newValue;
            object.OnPropertyChanged(property);
        });

        new Property(object, 'Placeholder', data.placeholder ?? '', function (property, oldValue, newValue) {
            object.Prop('placeholder', newValue);
            object.OnPropertyChanged(property);
        });

        if (data.onInput) object.OnInput.Listen(data.onInput);
        if (data.onChange) object.OnChange.Listen(data.onChange);

        object.Listen('blur', function (sender, event) {
            object.OnChange.Invoke(sender, event);
        });
    }

}