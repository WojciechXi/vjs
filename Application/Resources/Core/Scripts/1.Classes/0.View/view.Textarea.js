class Textarea extends View {

    get ElementTag() { return 'textarea'; }
    get ElementEvents() {
        let events = super.ElementEvents;
        let object = this;
        events.input = function (sender, event) {
            object.Value = object.Element.value;
            object.OnInput.Invoke(object, event);
        };
        events.change = function (sender, event) {
            object.Value = object.Element.value;
            object.OnChange.Invoke(object, event);
        };
        events.paste = function (sender, event) {
            object.Value = object.Element.value;
            object.OnPaste.Invoke(object, event);
        };
        return events;
    }

    get OnInput() { return this.onInput ?? (this.onInput = new Callback()); }
    get OnChange() { return this.onChange ?? (this.onChange = new Callback()); }
    get OnPaste() { return this.onPaste ?? (this.onPaste = new Callback()); }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Value', data.value ?? '', function (property, oldValue, newValue) {
            object.Prop('value', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Placeholder', data.placeholder ?? '', function (property, oldValue, newValue) {
            object.Prop('placeholder', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Rows', data.rows ?? '5', function (property, oldValue, newValue) {
            object.Prop('rows', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        if (data.onInput) object.OnInput.Listen(data.onInput);
        if (data.onChange) object.OnChange.Listen(data.onChange);
        if (data.onPaste) object.OnPaste.Listen(data.onPaste);

        object.Listen('keydown', function (sender, event) {
            if (event.key == 'Enter' && !(event.ctrlKey || event.shiftKey)) {
                event.preventDefault();
                object.Element.blur();
            } else {
            }
        });
    }

}