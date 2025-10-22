class Img extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'Source', data.source ?? '', object.OnPropertyChanged);
        new Property(object, 'Alt', data.alt ?? '', object.OnPropertyChanged);
        new Property(object, 'ObjectFit', data.objectFit ?? '', object.OnPropertyChanged);
        new Property(object, 'ObjectPosition', data.objectPosition ?? '', object.OnPropertyChanged);
        new Property(object, 'IsLazy', data.isLazy ?? true, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'Source', function (sender, data) {
            if (object.IsLazy && object.Source && object.Source.startsWith('http')) {
                let image = new Image();
                image.onload = function (event) {
                    object.Attr('src', object.Source);
                };
                image.src = object.Source;
                object.Attr('src', '/Assets/loading.gif');
            } else {
                object.Attr('src', object.Source);
            }
        });
        new Binding(object, 'Alt', function (sender, data) {
            object.Prop('alt', data.value);
        });
        new Binding(object, 'ObjectFit', function (sender, data) {
            object.Css('object-fit', data.value);
        });
        new Binding(object, 'ObjectPosition', function (sender, data) {
            object.Css('object-position', data.value);
        });
    }

    get ElementTag() { return 'img'; }

}