class Checkbox extends Input {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Type = 'checkbox';

        new Property(object, 'Checked', data.checked ?? false, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Checked', function (sender, data) {
            object.Prop('checked', object.Checked);
        });
    }

    get ElementEvents() {
        let events = super.ElementEvents;
        let object = this;
        events.change = function (event) {
            object.Checked = this.checked;
            object.OnChange.Invoke(object, event);
        };
        return events;
    }

}