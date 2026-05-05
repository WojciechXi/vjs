class Checkbox extends Input {

    get ElementEvents() {
        let events = super.ElementEvents;
        let object = this;
        events.change = function (sender, event) {
            object.Checked = object.Element.checked;
            object.OnChange.Invoke(object, event);
        };
        return events;
    }

    Init(data = {}) {
        data.type = data.type ?? 'checkbox';
        super.Init(data);
        let object = this;

        new Property(object, 'Checked', data.checked ?? false, function (property, oldValue, newValue) {
            object.Prop('checked', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}