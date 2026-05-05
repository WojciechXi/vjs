class Img extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'IsLazy', data.isLazy ?? true);
        new Property(object, 'Source', data.source ?? '', function (property, oldValue, newValue) {
            if (object.IsLazy && newValue && newValue.startsWith('http')) {
                let image = new Image();
                image.onload = function (event) {
                    object.Prop('src', newValue);
                };
                image.src = newValue;
                object.Prop('src', '/Assets/loading.gif');
            } else {
                object.Prop('src', newValue);
            }
            object.OnPropertyChanged(property, oldValue, newValue);
        });
        new Property(object, 'Alt', data.alt ?? '', function (property, oldValue, newValue) {
            object.Prop('alt', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
        new Property(object, 'ObjectFit', data.objectFit ?? '', function (property, oldValue, newValue) {
            object.Css('object-fit', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
        new Property(object, 'ObjectPosition', data.objectPosition ?? '', function (property, oldValue, newValue) {
            object.Css('object-position', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

    get ElementTag() { return 'img'; }

}