class ButtonIcon extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'Icon', data.icon ?? '', object.OnPropertyChanged);
        new Property(object, 'IconColor', data.iconColor ?? '#000000', object.OnPropertyChanged);
        new Property(object, 'Content', data.content ?? [], object.OnPropertyChanged);
    }

    Render() {
        let object = this;

        object.Children = [
            object.ElementIconContainer,
            new Layout({
                width: '0%',
                flexGrow: 1,
                callback: function (view) {
                    new Binding(object, 'Content', function (sender, data) {
                        view.Children = object.Content;
                    });
                },
            }),
        ];
    }

    get ElementIconContainer() {
        let object = this;
        return object.elementIconContainer ?? (object.elementIconContainer = new Layout({
            color: 'white',
            borderRadius: 0.5,
            width: '2rem',
            height: '2rem',
            justifyContent: 'center',
            alignItems: 'center',
            children: [
                object.ElementIcon,
            ],
            callback: function (view) {
                new Binding(object, 'Icon', function (sender, property) {
                    view.Display = object.Icon ? null : 'none';
                });
                new Binding(object, 'IconColor', function (sender, property) {
                    view.BackgroundColor = object.IconColor;
                });
            },
        }));
    }

    get ElementIcon() {
        let object = this;
        return object.elementIcon ?? (object.elementIcon = new Icon({
            callback: function (view) {
                new Binding(object, 'Icon', function (sender, property) {
                    view.Text = object.Icon;
                });
            },
        }));
    }

}

class ButtonSetting extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Icon', data.icon ?? '', object.OnPropertyChanged);
        new Property(object, 'IconColor', data.iconColor ?? '#000000', object.OnPropertyChanged);
        new Property(object, 'Header', data.header ?? '', object.OnPropertyChanged);
        new Property(object, 'Text', data.text ?? '', object.OnPropertyChanged);
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                color: 'white',
                borderRadius: 0.5,
                width: '2rem',
                height: '2rem',
                justifyContent: 'center',
                alignItems: 'center',
                children: [
                    new Icon({
                        callback: function (view) {
                            new Binding(object, 'Icon', function (sender, property) {
                                view.Text = object.Icon;
                            });
                        },
                    }),
                ],
                callback: function (view) {
                    new Binding(object, 'Icon', function (sender, property) {
                        view.Display = object.Icon ? null : 'none';
                    });
                    new Binding(object, 'IconColor', function (sender, property) {
                        view.BackgroundColor = object.IconColor;
                    });
                },
            }),
            new Layout({
                width: '0%',
                flexGrow: 1,
                children: [
                    new Text({
                        callback: function (view) {
                            new Binding(object, 'Header', function (sender, property) {
                                view.Text = object.Header;
                            });
                        },
                    }),
                    new Text({
                        fontSize: 0.6,
                        callback: function (view) {
                            new Binding(object, 'Text', function (sender, property) {
                                view.Text = object.Text;
                            });
                        },
                    }),
                ],
            }),
        ];
    }

}

class ConfirmPage extends Page {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.BackgroundColor = 'transparent';
        object.Padding = 1;

        object.In = new Anim(125, function (sender, data) {
            let opacity = data.t;
            let scale = Math.Lerp(0.5, 1, data.t);
            let y = data.i * -100;
            object.Opacity = opacity;
            object.ContentView.Transform = `scale(${scale}) translateY(${y}%)`;
        });

        object.Out = new Anim(125, function (sender, data) {
            let opacity = data.i;
            let scale = Math.Lerp(1, 0.5, data.t);
            let y = data.t * -100;
            object.Opacity = opacity;
            object.ContentView.Transform = `scale(${scale}) translateY(${y}%)`;
        });

        object.ContentView.BoxShadow = '0rem 0.5rem 1rem rgba(0, 0, 0, 0.5)';
        object.ContentView.BackgroundColor = 'var(--pageBackground)';
        object.ContentView.Color = 'var(--pageColor)';
        object.ContentView.MaxWidth = 720;

        new Property(object, 'Icon', data.Icon ?? 'info', object.OnPropertyChanged);
        new Property(object, 'Header', data.header ?? '', object.OnPropertyChanged);
        new Property(object, 'Body', data.body ?? '', object.OnPropertyChanged);
        new Property(object, 'Footer', data.footer ?? '', object.OnPropertyChanged);

        object.OnClick.Listen(function (sender, event) {
            if (event.target != object.Element) return;
            object.Pull();
        });

        if (data.onCancel) object.OnCancel.Listen(data.onCancel);
        if (data.onConfirm) object.OnConfirm.Listen(data.onConfirm);
    }

    Render() {
        let object = this;

        object.Content = [
            new Row({
                padding: 0.5,
                alignItems: 'center',
                width: '100%',
                children: [
                    new Column({
                        padding: 0.5,
                        children: [
                            new Icon({
                                fontSize: 3,
                                callback: function (text) {
                                    new Binding(object, 'Icon', function (sender, data) {
                                        text.Text = object.Icon;
                                    });
                                },
                            }),
                        ],
                    }),
                    new Column({
                        width: '0%',
                        flexGrow: 1,
                        padding: 0.5,
                        children: [
                            new Text({
                                callback: function (text) {
                                    new Binding(object, 'Header', function (sender, data) {
                                        text.Text = object.Header;
                                    });
                                },
                            }),
                            new Text({
                                fontSize: 0.8,
                                callback: function (text) {
                                    new Binding(object, 'Body', function (sender, data) {
                                        text.Text = object.Body;
                                    });
                                },
                            }),
                            new Text({
                                fontSize: 0.6,
                                callback: function (text) {
                                    new Binding(object, 'Footer', function (sender, data) {
                                        text.Text = object.Footer;
                                    });
                                },
                            }),
                            new Row({
                                justifyContent: 'flex-end',
                                children: [
                                    new Button({
                                        children: [
                                            new Text({
                                                text: 'Anuluj',
                                            }),
                                        ],
                                        onClick: function (button, event) {
                                            object.Pull();
                                            object.OnCancel.Invoke(object, event);
                                        },
                                    }),
                                    new Button({
                                        children: [
                                            new Text({
                                                text: 'Potwierdź',
                                            }),
                                        ],
                                        onClick: function (button, event) {
                                            object.Pull();
                                            object.OnConfirm.Invoke(object, event);
                                        },
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ];

        object.Children = [
            object.ContentView,
        ];
    }

    get OnCancel() {
        let object = this;
        return object.onCancel ?? (object.onCancel = new Callback());
    }

    get OnConfirm() {
        let object = this;
        return object.onConfirm ?? (object.onConfirm = new Callback());
    }

}

class ContextMenu extends Page {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.BackgroundColor = 'transparent';
        object.OnClick.Listen(function (sender, event) {
            if (event.target != object.Element) return;
            object.Pull();
        });

        object.OnContextMenu.Listen(function (sender, event) {
            event.preventDefault();
        });

        new Property(object, 'Event', data.event ?? null, object.OnPropertyChanged);
        new Property(object, 'Options', data.options ?? {}, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                backgroundColor: 'var(--pageBackground)',
                color: 'var(--pageColor)',
                boxShadow: '0rem 0.5rem 1rem rgba(0, 0, 0, 0.5)',
                position: 'absolute',
                left: '0px',
                top: '0px',
                callback: function (layout) {
                    new Binding(object, 'Options', function (sender, data) {
                        let children = [];
                        Object.keys(object.Options).forEach(function (key) {
                            children.push(new Button({
                                children: [
                                    new Text({
                                        text: key,
                                    }),
                                ],
                                onClick: function (sender, event) {
                                    object.Pull();
                                    object.Options[key](object, event);
                                },
                            }));
                        });
                        layout.Children = children;
                    });

                    new Binding(object, 'Event', function (sender, data) {
                        if (object.Event) {
                            layout.Left = object.Event.clientX;
                            layout.Top = object.Event.clientY;
                        } else {

                        }
                    });
                },
            }),
        ];
    }

}

class HalfPage extends Page {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'HalfChildren', data.halfChildren ?? [], object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'HalfChildren', function (sender, data) {
            object.HalfView.Children = object.HalfChildren;
        });
    }

    Render() {
        let object = this;
        object.Children = [
            object.ContentView,
            object.HalfView,
        ];
    }

    Open(page) {
        let object = this;
        object.HalfView.AddChild(page);
        page.Push();
    }

    Close() {
        let object = this;
        if (object.HalfChildren.length) object.HalfChildren[0].Pull();
    }

    get ElementTag() { return 'half-page'; }

    get HalfView() {
        let object = this;
        return object.halfView ?? (object.halfView = new Layout({
            display: 'none',
            onLayoutChange: function (sender, data) {
                sender.Display = sender.Children.length ? null : 'none';
            },
        }));
    }

}

class ModalPage extends Page {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'center';

        object.Padding = 1;
        object.ZIndex = 1000;

        object.BackgroundColor = 'rgba(0, 0, 0, 0.5)';
        object.ContentView.BackgroundColor = 'var(--pageBackground)';
        object.ContentView.Color = 'var(--pageColor)';
        object.ContentView.Width = '100%';
        object.ContentView.MaxWidth = 1080;

        new Property(object, 'Title', data.title ?? 'Tytuł', object.OnPropertyChanged);
        new Property(object, 'ActionButtons', data.actionButtons ?? [], object.OnPropertyChanged);
    }

    Render() {
        let object = this;

        object.Children = [
            object.TitleView,
            object.ContentView,
        ];
    }

    get TitleView() {
        let object = this;
        return object.titleView ?? (object.titleView = new Row({
            backgroundColor: 'var(--pageBackground)',
            color: 'var(--pageColor)',
            alignItems: 'center',
            width: '100%',
            maxWidth: 1080,
            children: [
                new Row({
                    alignItems: 'center',
                    callback: function (view) {
                        new Binding(object, 'ActionButtons', function (sender, data) {
                            view.Children = object.ActionButtons;
                        });
                    },
                }),
                new Label({
                    width: '0%',
                    flexGrow: 1,
                    justifyContent: 'center',
                    children: [
                        new Text({
                            textAlign: 'center',
                            callback: function (view) {
                                new Binding(object, 'Title', function (sender, property) {
                                    view.Text = object.Title;
                                });
                            },
                        }),
                    ],
                }),
                new Button({
                    onClick: function (sender, event) {
                        object.Pull();
                    },
                    children: [
                        new Layout({
                            borderRadius: 0.5,
                            width: '2rem',
                            height: '2rem',
                            justifyContent: 'center',
                            alignItems: 'center',
                            children: [
                                new Icon({ text: 'close' }),
                            ],
                        }),
                    ],
                }),
            ],
        }));
    }

}

class NotifyPage extends Page {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.BackgroundColor = 'transparent';
        object.PointerEvents = 'none';
        object.Padding = 1;

        object.In = new Anim(125, function (sender, data) {
            let opacity = data.t;
            let scale = Math.Lerp(0.5, 1, data.t);
            let y = data.i * -100;
            object.Opacity = opacity;
            object.ContentView.Transform = `scale(${scale}) translateY(${y}%)`;
        });

        object.Out = new Anim(125, function (sender, data) {
            let opacity = data.i;
            let scale = Math.Lerp(1, 0.5, data.t);
            let y = data.t * -100;
            object.Opacity = opacity;
            object.ContentView.Transform = `scale(${scale}) translateY(${y}%)`;
        });

        object.ContentView.BoxShadow = '0rem 0.5rem 1rem rgba(0, 0, 0, 0.5)';
        object.ContentView.BackgroundColor = 'var(--pageBackground)';
        object.ContentView.Color = 'var(--pageColor)';
        object.ContentView.MaxWidth = 720;

        new Property(object, 'Icon', data.icon ?? 'info', object.OnPropertyChanged);
        new Property(object, 'Header', data.header ?? '', object.OnPropertyChanged);
        new Property(object, 'Body', data.body ?? '', object.OnPropertyChanged);
        new Property(object, 'Footer', data.footer ?? '', object.OnPropertyChanged);

        setTimeout(function () {
            object.Pull();
        }, data.timeout ?? 5000);
    }

    Render() {
        let object = this;

        object.Content = [
            new Row({
                padding: 0.5,
                alignItems: 'center',
                width: '100%',
                children: [
                    new Column({
                        padding: 0.5,
                        children: [
                            new Icon({
                                fontSize: 3,
                                callback: function (text) {
                                    new Binding(object, 'Icon', function (sender, data) {
                                        text.Text = object.Icon;
                                    });
                                },
                            }),
                        ],
                    }),
                    new Column({
                        width: '0%',
                        flexGrow: 1,
                        padding: 0.5,
                        children: [
                            new Text({
                                callback: function (text) {
                                    new Binding(object, 'Header', function (sender, data) {
                                        text.Text = object.Header;
                                    });
                                },
                            }),
                            new Text({
                                fontSize: 0.8,
                                callback: function (text) {
                                    new Binding(object, 'Body', function (sender, data) {
                                        text.Text = object.Body;
                                    });
                                },
                            }),
                            new Text({
                                fontSize: 0.6,
                                callback: function (text) {
                                    new Binding(object, 'Footer', function (sender, data) {
                                        text.Text = object.Footer;
                                    });
                                },
                            }),
                        ],
                    }),
                ],
            }),
        ];

        object.Children = [
            object.ContentView,
        ];
    }

}

class TitlePage extends Page {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Title', data.title ?? 'Tytuł', object.OnPropertyChanged);
        new Property(object, 'ActionButtons', data.actionButtons ?? [], object.OnPropertyChanged);
    }

    Render() {
        let object = this;

        object.Children = [
            object.TitleView,
            object.ContentView,
        ];
    }

    get TitleView() {
        let object = this;
        return object.titleView ?? (object.titleView = new Row({
            backgroundColor: 'var(--pageBackground)',
            color: 'var(--pageColor)',
            width: '100%',
            alignItems: 'center',
            children: [
                new Row({
                    alignItems: 'center',
                    callback: function (view) {
                        new Binding(object, 'ActionButtons', function (sender, data) {
                            view.Children = object.ActionButtons;
                        });
                    },
                }),
                new Label({
                    width: '0%',
                    flexGrow: 1,
                    justifyContent: 'center',
                    children: [
                        new Text({
                            textAlign: 'center',
                            callback: function (view) {
                                new Binding(object, 'Title', function (sender, property) {
                                    view.Text = object.Title;
                                });
                            },
                        }),
                    ],
                }),
                new Button({
                    onClick: function (sender, event) {
                        object.Pull();
                    },
                    children: [
                        new Layout({
                            borderRadius: 0.5,
                            width: '2rem',
                            height: '2rem',
                            justifyContent: 'center',
                            alignItems: 'center',
                            children: [
                                new Icon({ text: 'close' }),
                            ],
                        }),
                    ],
                }),
            ],
        }));
    }

}

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

        object.OnClick.Listen(function (sender, event) {
            if (object.Parent.Children[object.Parent.Children.length - 1] != object) {
                event.preventDefault();
                event.stopPropagation();
                object.Parent.AddChild(object);
            }
        });

        App.Instance.OnMouseMove.Listen(function (sender, event) {
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

        App.Instance.OnMouseUp.Listen(function (sender, event) {
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

class BoxView extends Column {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        if (!data.backgroundColor) object.BackgroundColor = 'rgba(15, 15, 15, 0.1)';

        if (!data.magin) object.Margin = 0.5;
        if (!data.borderRadius) object.BorderRadius = 0.5;

        if (!data.overflow) object.Overflow = 'hidden';
    }

}

class FilesInput extends Row {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Width = data.width ?? '100%';
        object.Overflow = data.overflow ?? 'auto';

        new Property(object, 'ShowButton', data.showButton ?? true, object.OnPropertyChanged);
        new Property(object, 'Files', data.files ?? [], object.OnPropertyChanged);

        object.OnDrop.Listen(function (sender, event) {
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

class Icon extends Text {

    get ElementTag() { return 'icon'; }

}

class Loading extends Layout {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'center';
        object.JustifyContent = 'center';

        object.Padding = 1;

        object.Width = '100%';
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                width: '3rem',
                height: '3rem',
                alignItems: 'center',
                justifyContent: 'center',
                children: [
                    new Icon({
                        text: 'motion_photos_on',
                        fontSize: 2,
                    }),
                ],
                callback: function (view) {
                    view.Attr('spin', true);
                },
            }),
        ];
    }

}