class FilesInput extends Row {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Width = data.width ?? '100%';
        object.Overflow = data.overflow ?? 'auto';

        new Property(object, 'ShowButton', data.showButton ?? true, object.OnPropertyChanged);
        new Property(object, 'Files', data.files ?? [], object.OnPropertyChanged);

        object.Listen('drop', function (sender, event) {
            object.AddFiles(event.dataTransfer.files);
        });
    }

    Bind() {
        super.Bind();
        let object = this;
    }

    Render() {
        let object = this;

        object.Children = [
            new Column({
                flexShrink: 0,
                padding: 1,
                children: [
                    new Button({
                        padding: 0.5,
                        borderRadius: 0.5,
                        justifyContent: 'center',
                        alignItems: 'center',
                        aspectRatio: '1/1',
                        width: '4rem',
                        children: [
                            new Icon({
                                text: 'file_upload',
                                fontSize: 2,
                            }),
                        ],
                        onClick: function (button, event) {
                            let input = new Input({
                                type: 'file',
                                multiple: true,
                                onChange: function (input, event) {
                                    object.AddFiles(input.Element.files);
                                    input.GC();
                                },
                            });

                            input.Click();
                        },
                    }),
                ],
                callback: function (view) {
                    new Binding(object, 'ShowButton', function (sender, data) {
                        view.Display = object.ShowButton ? null : 'none';
                    });
                },
            }),
            new Row({
                flexShrink: 0,
                childrenLoop: function (file, index) {
                    return new Column({
                        flexShrink: 0,
                        padding: 1,
                        tooltip: file.name,
                        children: [
                            new Button({
                                padding: 0.5,
                                borderRadius: 0.5,
                                justifyContent: 'center',
                                alignItems: 'center',
                                aspectRatio: '1/1',
                                width: '4rem',
                                onClick: function (button, event) {
                                    object.Files.splice(index, 1);
                                    object.OnPropertyChanged('Files');
                                },
                                callback: function (button) {
                                    if (file.type.startsWith('image/')) {
                                        button.Padding = 0;
                                        button.Children = [
                                            new Icon({
                                                text: 'image',
                                                fontSize: 2,
                                            }),
                                        ];

                                        let fileReader = new FileReader();
                                        fileReader.addEventListener('load', function (event) {
                                            button.Children = [
                                                new Img({
                                                    source: event.target.result,
                                                    objectFit: 'contain',
                                                    width: '100%',
                                                    height: '100%',
                                                }),
                                            ];
                                        });
                                        fileReader.readAsDataURL(file);
                                    } else {
                                        button.Children = [
                                            new Icon({
                                                text: 'image',
                                                fontSize: 2,
                                            }),
                                        ];
                                    }
                                },
                            }),
                        ],
                    });
                },
                callback: function (row) {
                    new Binding(object, 'Files', function (sender, data) {
                        row.Children = object.Files;
                    });
                },
            }),
        ];
    }

    AddFiles(files) {
        let object = this;
        Array.from(files).forEach(function (file) {
            object.Files.push(file);
        });
        object.OnPropertyChanged('Files');
    }

}