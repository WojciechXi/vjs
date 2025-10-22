class Input extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Autocomplete', data.autocomplete ?? 'bday', object.OnPropertyChanged);
        new Property(object, 'Value', data.value ?? '', object.OnPropertyChanged);
        new Property(object, 'Placeholder', data.placeholder ?? '', object.OnPropertyChanged);
        new Property(object, 'Type', data.type ?? 'text', object.OnPropertyChanged);

        if (data.onInput) object.OnInput.Listen(data.onInput);
        if (data.onChange) object.OnChange.Listen(data.onChange);
        if (data.onPaste) object.OnPaste.Listen(data.onPaste);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Autocomplete', function (sender, data) {
            object.Attr('autocomplete', object.Autocomplete);
        });
        new Binding(object, 'Placeholder', function (sender, data) {
            object.Attr('placeholder', object.Placeholder);
        });
        new Binding(object, 'Type', function (sender, data) {
            object.Attr('type', object.Type);
        });
        new Binding(object, 'Value', function (sender, data) {
            object.Prop('value', object.Value);
        });
    }

    get ElementTag() { return 'input'; }
    get ElementEvents() {
        let events = super.ElementEvents;
        let object = this;
        events.input = function (event) {
            object.Value = this.value;
            object.OnInput.Invoke(object, event);
        };
        events.change = function (event) {
            object.Value = this.value;
            object.OnChange.Invoke(object, event);
        };
        events.paste = function (event) {
            object.Value = this.value;
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