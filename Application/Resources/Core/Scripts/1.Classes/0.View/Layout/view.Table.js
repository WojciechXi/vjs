class Table extends Layout {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'BorderCollapse', data.borderCollapse ?? null, object.OnPropertyChanged);
        new Property(object, 'BorderSpacing', data.borderSpacing ?? null, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'BorderCollapse', function (sender, data) {
            object.Css('border-collapse', object.BorderCollapse);
        });
        new Binding(object, 'BorderSpacing', function (sender, data) {
            object.Css('border-spacing', object.BorderSpacing);
        });
    }

    get ElementTag() { return 'table'; }

}