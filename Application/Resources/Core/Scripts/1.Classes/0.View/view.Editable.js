class Editable extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Value', data.value ?? '', object.OnPropertyChanged);
        new Property(object, 'Placeholder', data.placeholder ?? '', object.OnPropertyChanged);

        if (data.onInput) object.OnInput.Listen(data.onInput);
        if (data.onChange) object.OnChange.Listen(data.onChange);

        object.OnBlur.Listen(function (sender, event) {
            object.OnChange.Invoke(sender, event);
        });
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Value', function (sender, data) {
            if (object.Element.innerHTML != object.Value)
                object.Element.innerHTML = object.Value;
        });
        new Binding(object, 'Placeholder', function (sender, data) {
            object.Prop('placeholder', object.Placeholder);
        });
    }

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

    get OnInput() {
        let object = this;
        return object.onInput ?? (object.onInput = new Callback());
    }

    get OnChange() {
        let object = this;
        return object.onChange ?? (object.onChange = new Callback());
    }

}