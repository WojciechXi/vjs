class WindowPage extends Page {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.BackgroundColor = 'transparent';
        object.Classes = [
            'window-page',
        ];

        object.AlignItems = 'stretch';
        object.JustifyContent = 'stretch';

        object.Position = 'absolute';

        object.Overflow = 'visible';

        object.MinWidth = 360;
        object.MinHeight = 360;

        new Property(object, 'Dragging', false, object.OnPropertyChanged);
        new Property(object, 'Resizing', false, object.OnPropertyChanged);
        new Property(object, 'DragOrigin', data.dragOrigin ?? null, object.OnPropertyChanged);
        new Property(object, 'MouseOrigin', data.mouseOrigin ?? null, object.OnPropertyChanged);

        new Property(object, 'RegularRect', data.regularRect ?? {
            x: 0.2,
            y: 0.2,
            w: 0.6,
            h: 0.6,
        }, object.OnPropertyChanged);
        new Property(object, 'State', data.state ?? 'Regular', object.OnPropertyChanged);

        new Property(object, 'Title', data.title ?? 'Okno', object.OnPropertyChanged);
        new Property(object, 'Theme', data.theme ?? 'gray', object.OnPropertyChanged);
        new Property(object, 'HeaderChildren', data.headerChildren ?? [], object.OnPropertyChanged);
        new Property(object, 'BodyChildren', data.bodyChildren ?? [], object.OnPropertyChanged);
        new Property(object, 'FooterChildren', data.footerChildren ?? [], object.OnPropertyChanged);

        object.Listen('click', function (sender, event) {
            if (object.Parent.Children[object.Parent.Children.length - 1] != object) {
                event.preventDefault();
                event.stopPropagation();
                object.Parent.AddChild(object);
            }
        });

        App.Instance.Listen('mousemove', function (sender, event) {
            if (object.Dragging) {
                let mousePosition = {
                    left: event.clientX,
                    top: event.clientY,
                };

                let move = {
                    left: mousePosition.left - object.MouseOrigin.left,
                    top: mousePosition.top - object.MouseOrigin.top,
                };

                object.RegularRect.x = (object.DragOrigin.left + move.left) / window.innerWidth;
                object.RegularRect.y = (object.DragOrigin.top + move.top) / window.innerHeight;

                if (object.RegularRect.x + object.RegularRect.w < 0.05) object.RegularRect.x = 0.05 - object.RegularRect.w;
                else if (object.RegularRect.x > 0.95) object.RegularRect.x = 0.95;

                if (object.RegularRect.y < 0) object.RegularRect.y = 0;
                else if (object.RegularRect.y > 0.95) object.RegularRect.y = 0.95;

                object.OnPropertyChanged('RegularRect');
            } else if (object.Resizing) {
                let mousePosition = {
                    left: event.clientX,
                    top: event.clientY,
                };

                let move = {
                    left: mousePosition.left - object.MouseOrigin.left,
                    top: mousePosition.top - object.MouseOrigin.top,
                };

                if (object.ResizeRight) {
                    object.RegularRect.w = (object.DragOrigin.width + move.left) / window.innerWidth;

                } else if (object.ResizeLeft) {
                    object.RegularRect.x = (object.DragOrigin.left + move.left) / window.innerWidth;
                    object.RegularRect.w = (object.DragOrigin.width - move.left) / window.innerWidth;
                }

                if (object.ResizeBottom) {
                    object.RegularRect.h = (object.DragOrigin.height + move.top) / window.innerHeight;
                } else if (object.ResizeTop) {
                    object.RegularRect.y = (object.DragOrigin.top + move.top) / window.innerHeight;
                    object.RegularRect.h = (object.DragOrigin.height - move.top) / window.innerHeight;
                }

                if (object.RegularRect.x + object.RegularRect.w < 0.05) object.RegularRect.x = 0.05 - object.RegularRect.w;
                else if (object.RegularRect.x > 0.95) object.RegularRect.x = 0.95;

                if (object.RegularRect.y < 0) object.RegularRect.y = 0;
                else if (object.RegularRect.y > 0.95) object.RegularRect.y = 0.95;

                if (object.RegularRect.w > 1) object.RegularRect.w = 1;
                if (object.RegularRect.h > 1) object.RegularRect.h = 1;

                object.OnPropertyChanged('RegularRect');
            }
        });

        App.Instance.Listen('mouseup', function (sender, event) {
            if (!object.Dragging && !object.Resizing) return;

            object.Dragging = false;
            object.Resizing = false;
        });
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'RegularRect', function (sender, value) {
            if (object.State == 'Regular') {
                object.Left = `${object.RegularRect.x * 100}%`;
                object.Top = `${object.RegularRect.y * 100}%`;
                object.Width = `${object.RegularRect.w * 100}%`;
                object.Height = `${object.RegularRect.h * 100}%`;
            }
        });

        new Binding(object, 'State', function (sender, value) {
            if (object.State == 'Maximized') {
                object.Display = null;
                object.Left = 0;
                object.Top = 0;
                object.Width = `100%`;
                object.Height = `100%`;
                object.Overflow = 'hidden';
            } else if (object.State == 'Regular') {
                object.Display = null;
                object.Left = `${object.RegularRect.x * 100}%`;
                object.Top = `${object.RegularRect.y * 100}%`;
                object.Width = `${object.RegularRect.w * 100}%`;
                object.Height = `${object.RegularRect.h * 100}%`;
                object.Overflow = 'visible';
            } else if (object.State == 'Minimized') {
                object.Display = 'none';
            }
        });
    }

    Render() {
        let object = this;

        object.HeaderChildren = [
            new Text({
                width: '0%',
                flexGrow: 1,
                padding: '0.5rem 1rem',
                callback: function (title) {
                    new Binding(object, 'Title', function (sender, data) {
                        title.Text = object.Title ?? '';
                    });
                },
            }),
            new Row({
                children: [
                    (false ? new Button({
                        children: [
                            new Icon({
                                text: 'minimize'
                            }),
                        ],
                        onClick: function () {
                            if (object.State != 'Minimized') object.State = 'Minimized';
                            else object.State = 'Regular';
                        },
                    }) : null),
                    new Button({
                        children: [
                            new Icon({
                                callback: function (icon) {
                                    new Binding(object, 'State', function (sender, data) {
                                        icon.Text = object.State == 'Maximized' ? 'unfold_less' : 'unfold_more';
                                    });
                                },
                            }),
                        ],
                        onClick: function () {
                            if (object.State != 'Maximized') object.State = 'Maximized';
                            else object.State = 'Regular';
                        },
                    }),
                    new Button({
                        children: [
                            new Icon({
                                text: 'close'
                            }),
                        ],
                        onClick: function () {
                            object.Pull();
                        },
                    }),
                ],
            }),
        ];

        object.Children = [
            object.ContentView,
            new Layout({
                position: 'absolute',
                cursor: 'nw-resize',
                left: -4,
                top: -4,
                width: 8,
                height: 8,
                onMouseDown: function (sender, event) {
                    event.preventDefault();
                    object.Resizing = true;
                    object.ResizeLeft = true;
                    object.ResizeTop = true;
                    object.ResizeRight = false;
                    object.ResizeBottom = false;

                    object.SetDragOrigin();
                    object.SetMouseOrigin(event);
                },
            }),
            new Layout({
                position: 'absolute',
                cursor: 'ne-resize',
                right: -4,
                top: -4,
                width: 8,
                height: 8,
                onMouseDown: function (sender, event) {
                    event.preventDefault();
                    object.Resizing = true;
                    object.ResizeLeft = false;
                    object.ResizeTop = true;
                    object.ResizeRight = true;
                    object.ResizeBottom = false;

                    object.SetDragOrigin();
                    object.SetMouseOrigin(event);
                },
            }),
            new Layout({
                position: 'absolute',
                cursor: 'se-resize',
                right: -4,
                bottom: -4,
                width: 8,
                height: 8,
                onMouseDown: function (sender, event) {
                    event.preventDefault();
                    object.Resizing = true;
                    object.ResizeLeft = false;
                    object.ResizeTop = false;
                    object.ResizeRight = true;
                    object.ResizeBottom = true;

                    object.SetDragOrigin();
                    object.SetMouseOrigin(event);
                },
            }),
            new Layout({
                position: 'absolute',
                cursor: 'sw-resize',
                left: -4,
                bottom: -4,
                width: 8,
                height: 8,
                onMouseDown: function (sender, event) {
                    event.preventDefault();
                    object.Resizing = true;
                    object.ResizeLeft = true;
                    object.ResizeTop = false;
                    object.ResizeRight = false;
                    object.ResizeBottom = true;

                    object.SetDragOrigin();
                    object.SetMouseOrigin(event);
                },
            }),
            new Layout({
                position: 'absolute',
                cursor: 'w-resize',
                left: -4,
                top: 4,
                bottom: 4,
                width: 8,
                onMouseDown: function (sender, event) {
                    event.preventDefault();
                    object.Resizing = true;
                    object.ResizeLeft = true;
                    object.ResizeTop = false;
                    object.ResizeRight = false;
                    object.ResizeBottom = false;

                    object.SetDragOrigin();
                    object.SetMouseOrigin(event);
                },
            }),
            new Layout({
                position: 'absolute',
                cursor: 'n-resize',
                left: 4,
                top: -4,
                right: 4,
                height: 8,
                onMouseDown: function (sender, event) {
                    event.preventDefault();
                    object.Resizing = true;
                    object.ResizeLeft = false;
                    object.ResizeTop = true;
                    object.ResizeRight = false;
                    object.ResizeBottom = false;

                    object.SetDragOrigin();
                    object.SetMouseOrigin(event);
                },
            }),
            new Layout({
                position: 'absolute',
                cursor: 'e-resize',
                top: 4,
                right: -4,
                bottom: 4,
                width: 8,
                onMouseDown: function (sender, event) {
                    event.preventDefault();
                    object.Resizing = true;
                    object.ResizeLeft = false;
                    object.ResizeTop = false;
                    object.ResizeRight = true;
                    object.ResizeBottom = false;

                    object.SetDragOrigin();
                    object.SetMouseOrigin(event);
                },
            }),
            new Layout({
                position: 'absolute',
                cursor: 's-resize',
                left: 4,
                bottom: -4,
                right: 4,
                height: 8,
                onMouseDown: function (sender, event) {
                    event.preventDefault();
                    object.Resizing = true;
                    object.ResizeLeft = false;
                    object.ResizeTop = false;
                    object.ResizeRight = false;
                    object.ResizeBottom = true;

                    object.SetDragOrigin();
                    object.SetMouseOrigin(event);
                },
            }),
        ];
    }

    get ContentView() {
        let object = this;
        return object.contentView ?? (object.contentView = new Column({
            classes: ['window-page-content'],
            backgroundColor: 'var(--pageBackground)',
            color: 'var(--pageColor)',
            boxShadow: '0rem 0.5rem 1rem rgba(127, 127, 127, 0.5)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'black',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            children: [
                object.Header,
                object.Footer,
                object.Body,
            ],
            callback: function (contentView) {
                new Binding(object, 'Theme', function (sender, data) {
                    contentView.BorderColor = object.Theme;
                });

                new Binding(object, 'State', function (sender, data) {
                    contentView.BorderRadius = object.State == 'Maximized' ? 0 : 0.5;
                });
            },
        }));
    }

    get Header() {
        let object = this;
        return object.header ?? (object.header = new Row({
            color: 'white',
            callback: function (header) {
                new Binding(object, 'Theme', function (sender, data) {
                    header.BackgroundColor = object.Theme;
                });

                new Binding(object, 'HeaderChildren', function (sender, data) {
                    header.Children = object.HeaderChildren ?? [];
                });
            },
            onDblClick: function (sender, event) {
                if (object.State == 'Regular') object.State = 'Maximized';
                else object.State = 'Regular';
            },
            onMouseDown: function (sender, event) {
                if (event.target.closest('button')) return;
                event.preventDefault();
                object.Dragging = true;

                object.SetDragOrigin();
                object.SetMouseOrigin(event);
            },
        }));
    }

    get Body() {
        let object = this;
        return object.body ?? (object.body = new Column({
            flexGrow: 1,
            position: 'relative',
            overflow: 'auto',
            callback: function (body) {
                new Binding(object, 'BodyChildren', function (sender, data) {
                    body.Children = object.BodyChildren ?? [];
                });
            },
        }));
    }

    get Footer() {
        let object = this;
        return object.footer ?? (object.footer = new Row({
            color: 'white',
            callback: function (footer) {
                new Binding(object, 'Theme', function (sender, data) {
                    footer.BackgroundColor = object.Theme;
                });

                new Binding(object, 'FooterChildren', function (sender, data) {
                    footer.Children = object.FooterChildren ?? [];
                });
            },
        }));
    }

    SetDragOrigin() {
        let object = this;
        let rect = object.Element.getBoundingClientRect();
        object.DragOrigin = {
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
        };
    }

    SetMouseOrigin(event) {
        let object = this;
        object.MouseOrigin = {
            left: event.clientX,
            top: event.clientY,
        };
    }

}