class MainPage extends Page {

    Init(data = {}) {
        super.Init(data);
        let object = this;
    }

    Render() {
        let object = this;
        object.Children = [
            new Row({
                padding: 1,
                gap: 1,
                children: [
                    new Label({
                        children: [
                            new Text({ text: 'Przycisk' }),
                            new Link({
                                classes: ['button'],
                                children: [
                                    new Icon({ text: 'settings' }),
                                    new Text({ text: 'Przycisk' }),
                                ],
                            })
                        ],
                    }),
                    new Label({
                        children: [
                            new Text({ text: 'Przycisk kolor' }),
                            new Link({
                                classes: ['button', 'color'],
                                children: [
                                    new Icon({ text: 'settings' }),
                                    new Text({ text: 'Przycisk' }),
                                ],
                            })
                        ],
                    }),
                    new Label({
                        children: [
                            new Text({ text: 'Przycisk przełącznik' }),
                            new Row({
                                gap: 0.25,
                                children: [
                                    new Link({
                                        classes: ['button', 'toggle'],
                                        children: [
                                            new Icon({ text: 'settings' }),
                                            new Text({ text: 'Przycisk' }),
                                        ],
                                        callback: function (view) {
                                            view.Attr('selected', true);
                                        },
                                    }),
                                    new Link({
                                        classes: ['button', 'toggle'],
                                        children: [
                                            new Icon({ text: 'settings' }),
                                            new Text({ text: 'Przycisk' }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new Label({
                        children: [
                            new Text({ text: 'Przycisk ikona' }),
                            new Link({
                                classes: ['button', 'icon'],
                                children: [
                                    new Icon({ text: 'settings' }),
                                ],
                            })
                        ],
                    }),
                    new Label({
                        children: [
                            new Text({ text: 'Przycisk ikona kolor' }),
                            new Link({
                                classes: ['button', 'icon', 'color'],
                                children: [
                                    new Icon({ text: 'settings' }),
                                ],
                            })
                        ],
                    }),
                    new Label({
                        children: [
                            new Text({ text: 'Przycisk ikona przełącznik' }),
                            new Row({
                                gap: 0.25,
                                children: [
                                    new Link({
                                        classes: ['button', 'icon', 'toggle'],
                                        children: [
                                            new Icon({ text: 'settings' }),
                                        ],
                                        callback: function (view) {
                                            view.Attr('selected', true);
                                        },
                                    }),
                                    new Link({
                                        classes: ['button', 'icon', 'toggle'],
                                        children: [
                                            new Icon({ text: 'settings' }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new Label({
                        children: [
                            new TextFieldMaterial({
                                icon: 'settings',
                                placeholder: 'Phone',
                            }),
                        ],
                    }),
                    new Label({
                        children: [
                            new TextFieldMaterial({
                                placeholder: 'Phone',
                            }),
                        ],
                    }),
                    new Label({
                        children: [
                            new DateFieldMaterial({
                            }),
                        ],
                    }),
                    new Label({
                        children: [
                            new TextAreaMaterial({
                                placeholder: 'Phone',
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }

}