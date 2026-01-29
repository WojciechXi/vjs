class Textarea extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Value', data.value ?? '', object.OnPropertyChanged);
        new Property(object, 'Placeholder', data.placeholder ?? '', object.OnPropertyChanged);
        new Property(object, 'Rows', data.rows ?? '5', object.OnPropertyChanged);

        if (data.onInput) object.OnInput.Listen(data.onInput);
        if (data.onChange) object.OnChange.Listen(data.onChange);
        if (data.onPaste) object.OnPaste.Listen(data.onPaste);

        object.OnKeyDown.Listen(function (sender, event) {
            if (event.key == 'Enter' && !(event.ctrlKey || event.shiftKey)) {
                event.preventDefault();
                object.Element.blur();
            } else {
            }
        });
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Value', function (sender, data) {
            object.Prop('value', object.Value);
        });
        new Binding(object, 'Placeholder', function (sender, data) {
            object.Prop('placeholder', object.Placeholder);
        });
        new Binding(object, 'Rows', function (sender, data) {
            object.Prop('rows', object.Rows);
        });
    }

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

    get OnInput() {
        let object = this;
        return object.onInput ?? (object.onInput = new Callback());
    }

    get OnChange() {
        let object = this;
        return object.onChange ?? (object.onChange = new Callback());
    }

    get OnPaste() {
        let object = this;
        return object.onPaste ?? (object.onPaste = new Callback());
    }

}