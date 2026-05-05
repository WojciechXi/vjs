class Table extends Layout {


    get ElementTag() { return 'table'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'BorderCollapse', data.borderCollapse ?? null, function (property, oldValue, newValue) {
            object.Css('border-collapse', object.Colspan);
        });

        new Property(object, 'BorderSpacing', data.borderSpacing ?? null, function (property, oldValue, newValue) {
            object.Css('border-spacing', object.Colspan);
        });
    }

}