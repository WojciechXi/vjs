class Ajax {

    static get OnResponse() {
        return Ajax.onResponse ? Ajax.onResponse : (Ajax.onResponse = new Callback());
    }

    static Get(url, data = {}) {
        let ajax = new Ajax('GET', url);
        ajax.Send(data);
        return ajax;
    }

    static Post(url, data = {}) {
        let ajax = new Ajax('POST', url);
        ajax.Send(data);
        return ajax;
    }

    static Put(url, data = {}) {
        let ajax = new Ajax('PUT', url);
        ajax.Send(data);
        return ajax;
    }

    static Delete(url, data = {}) {
        let ajax = new Ajax('DELETE', url);
        ajax.Send(data);
        return ajax;
    }

    constructor(method, url, async = true) {
        let object = this;
        object.method = method;
        object.url = url;
        object.async = async;
    }

    Send(data) {
        let object = this;

        object.xhr = new XMLHttpRequest();
        object.xhr.open(object.method == 'GET' ? 'GET' : 'POST', object.url, object.async);

        if (data.load) object.xhr.addEventListener('load', function (event) {
            if (object.xhr.responseType == 'json' || object.xhr.getResponseHeader('Content-type') == 'application/json') {
                try {
                    let response = JSON.parse(object.xhr.responseText);
                    Ajax.OnResponse.Invoke(object, {
                        response: response,
                        responseText: object.xhr.responseText,
                        responseType: object.xhr.responseType,
                    });
                    data.load(response, object.xhr.responseType);
                } catch (exception) {
                    console.log(exception);
                    console.log(object.xhr.responseText);
                }
            } else {
                Ajax.OnResponse.Invoke(object, {
                    responseText: object.xhr.responseText,
                    responseType: object.xhr.responseType,
                });
                data.load(object.xhr.responseText, object.xhr.responseType);
            }
        });

        if (data.error) object.xhr.addEventListener('error', function (event) {
            data.error(object.xhr.error);
        });

        let formData = data.form ? new FormData(data.form) : new FormData();

        formData.append('REQUEST_METHOD', object.method);

        if (data.data) {
            Object.keys(data.data).forEach(function (key) {
                formData.append(key, data.data[key]);
            });
        }

        if (data.files) {
            Object.keys(data.files).forEach(function (index) {
                formData.append(`file-${index}`, data.files[index]);
            });
        }

        object.xhr.send(formData);
    }

}

class Anim {

    constructor(duration, onStep, onEnd = null, onStart = null, onStop = null) {
        let object = this;
        object.duration = duration;

        object.play = false;

        object.OnStart.Listen(onStart);
        object.OnStep.Listen(onStep);
        object.OnEnd.Listen(onEnd);
        object.OnStop.Listen(onStop);
    }

    get OnStart() {
        let object = this;
        return object.onStart ?? (object.onStart = new Callback());
    }
    get OnStep() {
        let object = this;
        return object.onStep ?? (object.onStep = new Callback());
    }
    get OnEnd() {
        let object = this;
        return object.onEnd ?? (object.onEnd = new Callback());
    }
    get OnStop() {
        let object = this;
        return object.onStop ?? (object.onStop = new Callback());
    }

    Start() {
        let object = this;

        if (object.play) return;

        object.play = true;
        object.begin = Date.now();

        object.OnStart.Invoke(object);

        object.Step(0);
    }

    Step() {
        let object = this;

        if (!object.play) return;

        object.current = Date.now() - object.begin;
        object.transition = Math.Clamp(object.current / object.duration, 0, 1);

        if (object.transition >= 1) {
            return object.End(true);
        } else {
            object.OnStep.Invoke(object, {
                t: object.transition,
                i: 1 - object.transition,
            });

            requestAnimationFrame(function () {
                object.Step();
            });
        }
    }

    End(success = false) {
        let object = this;

        if (!object.play) return;

        object.play = false;
        object.end = Date.now();

        object.OnStep.Invoke(object, {
            t: 1,
            i: 0,
        });
        object.OnEnd.Invoke(object, success);
    }

    Stop() {
        let object = this;

        if (!object.play) return;

        object.play = false;
        object.end = Date.now();

        object.OnStop.Invoke(object, false);
    }

}

class Binding {

    constructor(source, property, onChange = null) {
        let object = this;

        object.property = property;
        object.onChange = onChange;

        object.Source = source;
    }

    set Source(newValue) {
        let object = this;
        object.source = newValue;
        if (object.source && object.source.OnPropertyChange) {
            object.source.OnPropertyChange.Listen(function (sender, property) {
                if (property != object.property) return;
                if (object.onChange) object.onChange(object.source, {
                    property: object.property,
                    value: object.source[object.property],
                });
            });

            if (object.onChange) object.onChange(object.source, {
                property: object.property,
                value: object.source[object.property],
            });
        }
    }

}

class BindingProperty {

    constructor(source, sourceProperty, target, targetProperty) {
        let object = this;

        object.sourceProperty = sourceProperty;
        object.targetProperty = targetProperty;

        object.Source = source;
        object.Target = target;
    }

    set Source(newValue) {
        let object = this;
        object.source = newValue;
        if (object.source && object.source.OnPropertyChange) {
            object.source.OnPropertyChange.Listen(function (sender, property) {
                if (property != object.sourceProperty) return;
                object.target[object.targetProperty] = object.source[object.sourceProperty];
            });
        }
    }

    set Target(newValue) {
        let object = this;
        object.target = newValue;
        if (object.target && object.target.OnPropertyChange) {
            object.target.OnPropertyChange.Listen(function (sender, property) {
                if (property != object.targetProperty) return;
                object.target[object.targetProperty] = object.target[object.targetProperty];
            });
        }
    }

}

class Callback {

    constructor() {
        let object = this;
        object.listeners = [];
    }

    Listen(listener) {
        let object = this;
        object.listeners.push(listener);
    }

    Invoke(sender, data) {
        let object = this;
        object.listeners.forEach(function (listener) {
            if (listener) listener(sender, data);
        });
    }

}

class Property {

    constructor(target, property, value = null, onChange = null, parser = null) {
        let object = this;

        object.value = null;

        object.target = target;
        object.property = property;
        object.parser = parser;
        object.onChange = onChange;

        Object.defineProperty(object.target, object.property, {
            get: function () {
                return object.value;
            },
            set: function (newValue) {
                if (object.parser) newValue = object.parser(newValue);

                let oldValue = object.value;
                if (oldValue != newValue) {
                    object.value = newValue;
                    if (object.onChange) object.onChange.call(object.target, object.property, oldValue, newValue);
                }
            }
        });

        object.target[property] = value;
    }

}

class Storage {

    static Get(key, defaultValue = null) {
        let value = localStorage.getItem(key);
        return value ?? defaultValue;
    }

    static Set(key, value) {
        return localStorage.setItem(key, value);
    }

    static Is(key, value) {
        return Storage.Get(key) == value;
    }

}

class View {

    constructor(data = {}) {
        let object = this;

        object.Init(data);
        object.Bind();
        object.Render();

        if (data.callback) {
            requestAnimationFrame(function () {
                data.callback(object);
            });
        }
    }

    Init(data = {}) {
        let object = this;
        new Property(object, 'Parent', data.parent ?? null, object.OnPropertyChanged);
        new Property(object, 'Classes', data.classes ?? [], object.OnPropertyChanged);
        new Property(object, 'Name', data.name ?? null, object.OnPropertyChanged);
        new Property(object, 'Tooltip', data.tooltip ?? null, object.OnPropertyChanged);
        new Property(object, 'Disabled', data.disabled ?? null, object.OnPropertyChanged);
        new Property(object, 'Multiple', data.multiple ?? null, object.OnPropertyChanged);

        new Property(object, 'BackgroundColor', data.backgroundColor ?? null, object.OnPropertyChanged);
        new Property(object, 'BackgroundImage', data.backgroundImage ?? null, object.OnPropertyChanged);
        new Property(object, 'BackgroundSize', data.backgroundSize ?? null, object.OnPropertyChanged);
        new Property(object, 'BackgroundRepeat', data.backgroundRepeat ?? null, object.OnPropertyChanged);
        new Property(object, 'BackgroundPosition', data.backgroundPosition ?? null, object.OnPropertyChanged);
        new Property(object, 'BackgroundAttachment', data.backgroundAttachment ?? null, object.OnPropertyChanged);

        new Property(object, 'Border', data.border ?? null, object.OnPropertyChanged);
        new Property(object, 'BorderWidth', data.borderWidth ?? null, object.OnPropertyChanged);
        new Property(object, 'BorderStyle', data.borderStyle ?? null, object.OnPropertyChanged);
        new Property(object, 'BorderColor', data.borderColor ?? null, object.OnPropertyChanged);
        new Property(object, 'BorderLeft', data.borderLeft ?? null, object.OnPropertyChanged);
        new Property(object, 'BorderTop', data.borderTop ?? null, object.OnPropertyChanged);
        new Property(object, 'BorderRight', data.bordeRight ?? null, object.OnPropertyChanged);
        new Property(object, 'BorderBottom', data.borderBottom ?? null, object.OnPropertyChanged);
        new Property(object, 'BorderRadius', data.borderRadius ?? null, object.OnPropertyChanged);

        new Property(object, 'PointerEvents', data.pointerEvents ?? null, object.OnPropertyChanged);
        new Property(object, 'Cursor', data.cursor ?? null, object.OnPropertyChanged);
        new Property(object, 'Display', data.display ?? null, object.OnPropertyChanged);
        new Property(object, 'BoxShadow', data.boxShadow ?? null, object.OnPropertyChanged);
        new Property(object, 'Opacity', data.opacity ?? null, object.OnPropertyChanged);
        new Property(object, 'TextOverflow', data.textOverflow ?? null, object.OnPropertyChanged);
        new Property(object, 'Overflow', data.overflow ?? null, object.OnPropertyChanged);
        new Property(object, 'AlignSelf', data.alignSelf ?? null, object.OnPropertyChanged);
        new Property(object, 'AlignItems', data.alignItems ?? null, object.OnPropertyChanged);
        new Property(object, 'JustifyContent', data.justifyContent ?? null, object.OnPropertyChanged);
        new Property(object, 'FlexGrow', data.flexGrow ?? null, object.OnPropertyChanged);
        new Property(object, 'FlexShrink', data.flexShrink ?? null, object.OnPropertyChanged);
        new Property(object, 'FlexWrap', data.flexWrap ?? null, object.OnPropertyChanged);
        new Property(object, 'FlexOrder', data.flexOrder ?? null, object.OnPropertyChanged);
        new Property(object, 'Gap', data.gap ?? null, object.OnPropertyChanged);
        new Property(object, 'Resize', data.resize ?? null, object.OnPropertyChanged);
        new Property(object, 'Position', data.position ?? null, object.OnPropertyChanged);
        new Property(object, 'ZIndex', data.zIndex ?? null, object.OnPropertyChanged);
        new Property(object, 'Left', data.left ?? null, object.OnPropertyChanged);
        new Property(object, 'Top', data.top ?? null, object.OnPropertyChanged);
        new Property(object, 'Right', data.right ?? null, object.OnPropertyChanged);
        new Property(object, 'Bottom', data.bottom ?? null, object.OnPropertyChanged);
        new Property(object, 'Outline', data.outline ?? null, object.OnPropertyChanged);
        new Property(object, 'Margin', data.margin ?? null, object.OnPropertyChanged);
        new Property(object, 'Padding', data.padding ?? null, object.OnPropertyChanged);
        new Property(object, 'MinWidth', data.minWidth ?? null, object.OnPropertyChanged);
        new Property(object, 'Width', data.width ?? null, object.OnPropertyChanged);
        new Property(object, 'MaxWidth', data.maxWidth ?? null, object.OnPropertyChanged);
        new Property(object, 'MinHeight', data.minHeight ?? null, object.OnPropertyChanged);
        new Property(object, 'Height', data.height ?? null, object.OnPropertyChanged);
        new Property(object, 'MaxHeight', data.maxHeight ?? null, object.OnPropertyChanged);
        new Property(object, 'AspectRatio', data.aspectRatio ?? null, object.OnPropertyChanged);
        new Property(object, 'Color', data.color ?? null, object.OnPropertyChanged);
        new Property(object, 'LineHeight', data.lineHeight ?? null, object.OnPropertyChanged);
        new Property(object, 'VerticalAlign', data.verticalAlign ?? null, object.OnPropertyChanged);
        new Property(object, 'TextAlign', data.textAlign ?? null, object.OnPropertyChanged);
        new Property(object, 'TextTransform', data.textTransform ?? null, object.OnPropertyChanged);
        new Property(object, 'TextIdent', data.textIdent ?? null, object.OnPropertyChanged);
        new Property(object, 'LetterSpacing', data.letterSpacing ?? null, object.OnPropertyChanged);
        new Property(object, 'WordSpacing', data.wordSpacing ?? null, object.OnPropertyChanged);
        new Property(object, 'WhiteSpace', data.whiteSpace ?? null, object.OnPropertyChanged);
        new Property(object, 'TextAlignLast', data.textAlignLast ?? null, object.OnPropertyChanged);
        new Property(object, 'TextDecoration', data.textDecoration ?? null, object.OnPropertyChanged);
        new Property(object, 'TextShadow', data.textShadow ?? null, object.OnPropertyChanged);
        new Property(object, 'FontSize', data.fontSize ?? null, object.OnPropertyChanged);
        new Property(object, 'FontFamily', data.fontFamily ?? null, object.OnPropertyChanged);
        new Property(object, 'FontStyle', data.fontStyle ?? null, object.OnPropertyChanged);
        new Property(object, 'FontWeight', data.fontWeight ?? null, object.OnPropertyChanged);
        new Property(object, 'FontVariant', data.fontVariant ?? null, object.OnPropertyChanged);
        new Property(object, 'WritingMode', data.writingMode ?? null, object.OnPropertyChanged);
        new Property(object, 'Transition', data.transition ?? null, object.OnPropertyChanged);
        new Property(object, 'Transform', data.transform ?? null, object.OnPropertyChanged);

        if (data.onPropertyChange) object.OnPropertyChange.Listen(data.onPropertyChange);
        if (data.onLayoutChange) object.OnLayoutChange.Listen(data.onLayoutChange);

        if (data.onClick) object.OnClick.Listen(data.onClick);
        if (data.onDblClick) object.OnDblClick.Listen(data.onDblClick);
        if (data.onContextMenu) object.OnContextMenu.Listen(data.onContextMenu);

        if (data.onFocus) object.OnFocus.Listen(data.onFocus);
        if (data.onBlur) object.OnBlur.Listen(data.onBlur);

        if (data.onMouseDown) object.OnMouseDown.Listen(data.onMouseDown);
        if (data.onMouseUp) object.OnMouseUp.Listen(data.onMouseUp);
        if (data.onMouseEnter) object.OnMouseEnter.Listen(data.onMouseEnter);
        if (data.onMouseMove) object.OnMouseMove.Listen(data.onMouseMove);
        if (data.onMouseOver) object.OnMouseOver.Listen(data.onMouseOver);
        if (data.onMouseLeave) object.OnMouseLeave.Listen(data.onMouseLeave);

        if (data.onTouchStart) object.OnTouchStart.Listen(data.onTouchStart);
        if (data.onTouchMove) object.OnTouchMove.Listen(data.onTouchMove);
        if (data.onTouchEnd) object.OnTouchEnd.Listen(data.onTouchEnd);
        if (data.onTouchCancel) object.OnTouchCancel.Listen(data.onTouchCancel);

        if (data.onDragStart) object.OnDragStart.Listen(data.onDragStart);
        if (data.onDragEnter) object.OnDragEnter.Listen(data.onDragEnter);
        if (data.onDragOver) object.OnDragOver.Listen(data.onDragOver);
        if (data.onDragLeave) object.OnDragLeave.Listen(data.onDragLeave);
        if (data.onDrop) object.OnDrop.Listen(data.onDrop);

        if (data.onKeyDown) object.OnKeyDown.Listen(data.onKeyDown);
        if (data.onKeyUp) object.OnKeyUp.Listen(data.onKeyUp);

        if (data.onRemove) object.OnRemove.Listen(data.onRemove);
    }

    Bind() {
        let object = this;
        new Binding(object, 'Parent', function (sender, data) {
            if (object.Parent) {
                object.Parent.Element.appendChild(object.Element);
            } else {
                object.Element.remove();
                object.Removed();
            }
        });
        new Binding(object, 'Classes', function (sender, data) {
            if (data.value && data.value.length) object.Attr('class', data.value.join(' '));
            else object.Attr('class', null);
        });
        new Binding(object, 'Name', function (sender, data) {
            object.Attr('name', object.Name);
        });
        new Binding(object, 'Tooltip', function (sender, data) {
            object.Attr('title', object.Tooltip);
        });
        new Binding(object, 'Disabled', function (sender, data) {
            object.Attr('disabled', object.Disabled);
        });
        new Binding(object, 'Multiple', function (sender, data) {
            object.Attr('multiple', object.Multiple);
        });

        new Binding(object, 'BackgroundColor', function (sender, data) {
            object.Css('background-color', object.BackgroundColor);
        });
        new Binding(object, 'BackgroundImage', function (sender, data) {
            object.Css('background-image', object.BackgroundImage);
        });
        new Binding(object, 'BackgroundSize', function (sender, data) {
            object.Css('background-size', object.BackgroundSize);
        });
        new Binding(object, 'BackgroundRepeat', function (sender, data) {
            object.Css('background-repeat', object.BackgroundRepeat);
        });
        new Binding(object, 'BackgroundPosition', function (sender, data) {
            object.Css('background-position', object.BackgroundPosition);
        });
        new Binding(object, 'BackgroundAttachment', function (sender, data) {
            object.Css('background-attachment', object.BackgroundAttachment);
        });

        new Binding(object, 'BorderLeft', function (sender, data) {
            object.Css('border-left', object.BorderLeft);
        });
        new Binding(object, 'BorderTop', function (sender, data) {
            object.Css('border-top', object.BorderTop);
        });
        new Binding(object, 'BorderRight', function (sender, data) {
            object.Css('border-right', object.BorderRight);
        });
        new Binding(object, 'BorderBottom', function (sender, data) {
            object.Css('border-bottom', object.BorderBottom);
        });
        new Binding(object, 'Border', function (sender, data) {
            object.Css('border', object.Border);
        });
        new Binding(object, 'BorderWidth', function (sender, data) {
            object.Css('border-width', object.BorderWidth);
        });
        new Binding(object, 'BorderStyle', function (sender, data) {
            object.Css('border-style', object.BorderStyle);
        });
        new Binding(object, 'BorderColor', function (sender, data) {
            object.Css('border-color', object.BorderColor);
        });
        new Binding(object, 'BorderWidth', function (sender, data) {
            object.Css('border-width', object.BorderWidth);
        });
        new Binding(object, 'BorderRadius', function (sender, data) {
            object.Css('border-radius', object.BorderRadius, 'rem');
        });

        new Binding(object, 'Display', function (sender, data) {
            object.Css('display', data.value);
        });
        new Binding(object, 'BoxShadow', function (sender, data) {
            object.Css('box-shadow', object.BoxShadow);
        });
        new Binding(object, 'PointerEvents', function (sender, data) {
            object.Css('pointer-events', object.PointerEvents);
        });
        new Binding(object, 'Cursor', function (sender, data) {
            object.Css('cursor', data.value);
        });
        new Binding(object, 'Opacity', function (sender, data) {
            object.Css('opacity', data.value);
        });
        new Binding(object, 'TextOverflow', function (sender, data) {
            object.Css('text-overflow', object.TextOverflow);
        });
        new Binding(object, 'Overflow', function (sender, data) {
            object.Css('overflow', object.Overflow);
        });
        new Binding(object, 'AlignSelf', function (sender, data) {
            object.Css('align-self', object.AlignSelf);
        });
        new Binding(object, 'AlignItems', function (sender, data) {
            object.Css('align-items', object.AlignItems);
        });
        new Binding(object, 'JustifyContent', function (sender, data) {
            object.Css('justify-content', data.value);
        });
        new Binding(object, 'FlexGrow', function (sender, data) {
            object.Css('flex-grow', data.value);
        });
        new Binding(object, 'FlexShrink', function (sender, data) {
            object.Css('flex-shrink', data.value);
        });
        new Binding(object, 'FlexWrap', function (sender, data) {
            object.Css('flex-wrap', data.value);
        });
        new Binding(object, 'FlexOrder', function (sender, data) {
            object.Css('order', object.FlexOrder);
        });
        new Binding(object, 'Gap', function (sender, data) {
            object.Css('gap', data.value, 'rem');
        });
        new Binding(object, 'Resize', function (sender, data) {
            object.Css('resize', object.Resize);
        });
        new Binding(object, 'Position', function (sender, data) {
            object.Css('position', data.value);
        });
        new Binding(object, 'ZIndex', function (sender, data) {
            object.Css('z-index', data.value);
        });
        new Binding(object, 'Left', function (sender, data) {
            object.Css('left', data.value, 'px');
        });
        new Binding(object, 'Top', function (sender, data) {
            object.Css('top', data.value, 'px');
        });
        new Binding(object, 'Right', function (sender, data) {
            object.Css('right', data.value, 'px');
        });
        new Binding(object, 'Bottom', function (sender, data) {
            object.Css('bottom', data.value, 'px');
        });
        new Binding(object, 'Outline', function (sender, data) {
            object.Css('outline', data.value);
        });
        new Binding(object, 'Margin', function (sender, data) {
            object.Css('margin', data.value, 'rem');
        });
        new Binding(object, 'Padding', function (sender, data) {
            object.Css('padding', data.value, 'rem');
        });
        new Binding(object, 'MinWidth', function (sender, data) {
            object.Css('min-width', data.value, 'px');
        });
        new Binding(object, 'Width', function (sender, data) {
            object.Css('width', data.value, 'px');
        });
        new Binding(object, 'MaxWidth', function (sender, data) {
            object.Css('max-width', data.value, 'px');
        });
        new Binding(object, 'MinHeight', function (sender, data) {
            object.Css('min-height', data.value, 'px');
        });
        new Binding(object, 'Height', function (sender, data) {
            object.Css('height', data.value, 'px');
        });
        new Binding(object, 'MaxHeight', function (sender, data) {
            object.Css('max-height', data.value, 'px');
        });
        new Binding(object, 'AspectRatio', function (sender, data) {
            object.Css('aspect-ratio', data.value);
        });
        new Binding(object, 'Color', function (sender, data) {
            object.Css('color', data.value);
        });
        new Binding(object, 'LineHeight', function (sender, data) {
            object.Css('line-height', data.value);
        });
        new Binding(object, 'VerticalAlign', function (sender, data) {
            object.Css('vertical-align', data.value);
        });
        new Binding(object, 'TextAlign', function (sender, data) {
            object.Css('text-align', data.value);
        });
        new Binding(object, 'TextTransform', function (sender, data) {
            object.Css('text-transform', data.value);
        });
        new Binding(object, 'TextIdent', function (sender, data) {
            object.Css('text-ident', data.value);
        });
        new Binding(object, 'LetterSpacing', function (sender, data) {
            object.Css('letter-spacing', data.value);
        });
        new Binding(object, 'WordSpacing', function (sender, data) {
            object.Css('word-spacing', data.value);
        });
        new Binding(object, 'WhiteSpace', function (sender, data) {
            object.Css('white-space', data.value);
        });
        new Binding(object, 'TextAlignLast', function (sender, data) {
            object.Css('text-align-last', data.value);
        });
        new Binding(object, 'TextDecoration', function (sender, data) {
            object.Css('text-decoration', data.value);
        });
        new Binding(object, 'TextShadow', function (sender, data) {
            object.Css('text-shadow', data.value);
        });
        new Binding(object, 'FontSize', function (sender, data) {
            object.Css('font-size', data.value, 'rem');
        });
        new Binding(object, 'FontFamily', function (sender, data) {
            object.Css('font-family', data.value);
        });
        new Binding(object, 'FontStyle', function (sender, data) {
            object.Css('font-style', data.value);
        });
        new Binding(object, 'FontWeight', function (sender, data) {
            object.Css('font-weight', data.value);
        });
        new Binding(object, 'FontVariant', function (sender, data) {
            object.Css('font-variant', data.value);
        });
        new Binding(object, 'WritingMode', function (sender, data) {
            object.Css('writing-mode', data.value);
        });
        new Binding(object, 'Transition', function (sender, data) {
            object.Css('transition', object.Transition);
        });
        new Binding(object, 'Transform', function (sender, data) {
            object.Css('transform', object.Transform);
        });
    }

    Render() {
        let object = this;
    }

    SetParent(parent) {
        let object = this;
        if (object.Parent) object.Parent.RemoveChild(object);
        object.Parent = parent;
    }

    get ElementTag() { return 'view'; }
    get ElementAttrs() {
        let object = this;
        return {

        };
    }
    get ElementEvents() {
        let object = this;
        return {
            // Click
            click: function (event) {
                object.OnClick.Invoke(object, event);
            },
            dblclick: function (event) {
                object.OnDblClick.Invoke(object, event);
            },
            // ContextMenu
            contextmenu: function (event) {
                object.OnContextMenu.Invoke(object, event);
            },
            // Focus
            focus: function (event) {
                object.OnFocus.Invoke(object, event);
            },
            blur: function (event) {
                object.OnBlur.Invoke(object, event);
            },
            // Mouse
            mousedown: function (event) {
                object.OnMouseDown.Invoke(object, event);
            },
            mouseup: function (event) {
                object.OnMouseUp.Invoke(object, event);
            },
            mouseenter: function (event) {
                object.OnMouseEnter.Invoke(object, event);
            },
            mousemove: function (event) {
                object.OnMouseMove.Invoke(object, event);
            },
            mouseover: function (event) {
                object.OnMouseOver.Invoke(object, event);
            },
            mouseleave: function (event) {
                object.OnMouseLeave.Invoke(object, event);
            },
            // Touch
            touchstart: function (event) {
                object.OnTouchStart.Invoke(object, event);
            },
            touchmove: function (event) {
                object.OnTouchMove.Invoke(object, event);
            },
            touchend: function (event) {
                object.onTouchEnd.Invoke(object, event);
            },
            touchcancel: function (event) {
                object.OnTouchCancel.Invoke(object, event);
            },
            // Drag
            dragstart: function (event) {
                window.dragItem = event.target.view;
                object.OnDragStart.Invoke(object, event);
            },
            dragenter: function (event) {
                event.preventDefault();
                object.OnDragEnter.Invoke(object, event);
            },
            dragover: function (event) {
                event.preventDefault();
                object.OnDragOver.Invoke(object, event);
            },
            dragleave: function (event) {
                event.preventDefault();
                object.OnDragLeave.Invoke(object, event);
            },
            // Drop
            drop: function (event) {
                event.preventDefault();
                object.OnDrop.Invoke(object, event);
            },
            // Key
            keydown: function (event) {
                object.OnKeyDown.Invoke(object, event);
            },
            keyup: function (event) {
                object.OnKeyUp.Invoke(object, event);
            },
        };
    }

    get Element() {
        let object = this;
        if (!object.element) {
            object.element = document.createElement(object.ElementTag);
            object.element.view = object;

            let attrs = object.ElementAttrs;
            Object.keys(attrs).forEach(function (attr) {
                object.Attr(attr, attrs[attr]);
            });

            let events = object.ElementEvents;
            Object.keys(events).forEach(function (event) {
                object.element.addEventListener(event, events[event]);
            });
        }
        return object.element;
    }

    GC() {
        delete this;
    }

    Trigger(event) {
        let object = this;
        let customEvent = new CustomEvent(event, {
            bubbles: true,
        });
        object.Element.dispatchEvent(customEvent);
    }

    Click() {
        let object = this;
        object.Element.click();
    }

    Input() {
        let object = this;
        object.Trigger('input');
    }

    Change() {
        let object = this;
        object.Trigger('change');
    }

    Find(name) {
        let object = this;
        let element = object.Element.querySelector(`[name="${name}"]`);
        return element ? element.view : null;
    }

    Css(property, value, defaultUnit = null) {
        let object = this;
        if (value !== null) {
            if (defaultUnit) {
                if (typeof value == 'number') object.Element.style.setProperty(property, `${value}${defaultUnit}`);
                else object.Element.style.setProperty(property, value);
            } else {
                object.Element.style.setProperty(property, value);
            }
        }
        else object.Element.style.removeProperty(property);
    }

    Attr(attribute, value) {
        let object = this;
        if (value !== null) object.Element.setAttribute(attribute, value);
        else object.Element.removeAttribute(attribute);
    }

    Prop(property, value) {
        let object = this;
        object.Element[property] = value;
    }

    OnPropertyChanged(propertyName) {
        let object = this;
        object.OnPropertyChange.Invoke(object, propertyName);
    }

    OnLayoutChanged() {
        let object = this;
        object.OnLayoutChange.Invoke(object, {});
    }

    Remove() {
        let object = this;
        object.SetParent(null);
    }

    Removed() {
        let object = this;
        object.OnRemove.Invoke(object, {});
    }

    //Layout Change

    get OnLayoutChange() {
        let object = this;
        return object.onLayoutChange ?? (object.onLayoutChange = new Callback());
    }

    //Property Change

    get OnPropertyChange() {
        let object = this;
        return object.onPropertyChange ?? (object.onPropertyChange = new Callback());
    }

    //Click

    get OnClick() {
        let object = this;
        return object.onClick ?? (object.onClick = new Callback());
    }

    get OnDblClick() {
        let object = this;
        return object.onDblClick ?? (object.onDblClick = new Callback());
    }

    //ContextMenu

    get OnContextMenu() {
        let object = this;
        return object.onContextMenu ?? (object.onContextMenu = new Callback());
    }

    // Focus

    get OnFocus() {
        let object = this;
        return object.onFocus ?? (object.onFocus = new Callback());
    }

    get OnBlur() {
        let object = this;
        return object.onBlur ?? (object.onBlur = new Callback());
    }

    //Mouse

    get OnMouseDown() {
        let object = this;
        return object.onMouseDown ?? (object.onMouseDown = new Callback());
    }

    get OnMouseUp() {
        let object = this;
        return object.onMouseUp ?? (object.onMouseUp = new Callback());
    }

    get OnMouseEnter() {
        let object = this;
        return object.onMouseEnter ?? (object.onMouseEnter = new Callback());
    }

    get OnMouseMove() {
        let object = this;
        return object.onMouseMove ?? (object.onMouseMove = new Callback());
    }

    get OnMouseOver() {
        let object = this;
        return object.onMouseOver ?? (object.onMouseOver = new Callback());
    }

    get OnMouseLeave() {
        let object = this;
        return object.onMouseLeave ?? (object.onMouseLeave = new Callback());
    }

    //Touch

    get OnTouchStart() {
        let object = this;
        return object.onTouchStart ?? (object.onTouchStart = new Callback());
    }

    get OnTouchMove() {
        let object = this;
        return object.onTouchMove ?? (object.onTouchMove = new Callback());
    }

    get OnTouchEnd() {
        let object = this;
        return object.onTouchEnd ?? (object.onTouchEnd = new Callback());
    }

    get OnTouchCancel() {
        let object = this;
        return object.onTouchCancel ?? (object.onTouchCancel = new Callback());
    }

    //Drag

    get OnDragStart() {
        let object = this;
        return object.onDragStart ?? (object.onDragStart = new Callback());
    }

    get OnDragEnter() {
        let object = this;
        return object.onDragEnter ?? (object.onDragEnter = new Callback());
    }

    get OnDragOver() {
        let object = this;
        return object.onDragOver ?? (object.onDragOver = new Callback());
    }

    get OnDragLeave() {
        let object = this;
        return object.onDragLeave ?? (object.onDragLeave = new Callback());
    }

    get OnDrop() {
        let object = this;
        return object.onDrop ?? (object.onDrop = new Callback());
    }

    //Key

    get OnKeyDown() {
        let object = this;
        return object.onKeyDown ?? (object.onKeyDown = new Callback());
    }

    get OnKeyUp() {
        let object = this;
        return object.onKeyUp ?? (object.onKeyUp = new Callback());
    }

    //Remove

    get OnRemove() {
        let object = this;
        return object.onRemove ?? (object.onRemove = new Callback());
    }

}

class Audio extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'Source', data.source ?? '', object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'Source', function (sender, data) {
            object.Attr('src', data.value);
        });
    }

    get ElementTag() { return 'audio'; }

}

class Canvas extends View {

    get ElementTag() { return 'canvas'; }

}

class Editable extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Value', data.value ?? '', object.OnPropertyChanged);
        new Property(object, 'Placeholder', data.placeholder ?? '', object.OnPropertyChanged);

        if (data.onInput) object.OnInput.Listen(data.onInput);
        if (data.onChange) object.OnChange.Listen(data.onChange);

        object.OnBlur.Listen(function (sender, event) {
            object.OnChange.Invoke(sender, event);
        });
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Value', function (sender, data) {
            if (object.Element.innerHTML != object.Value)
                object.Element.innerHTML = object.Value;
        });
        new Binding(object, 'Placeholder', function (sender, data) {
            object.Prop('placeholder', object.Placeholder);
        });
    }

    get ElementTag() { return 'editable'; }
    get ElementAttrs() {
        let attrs = super.ElementAttrs;
        let object = this;
        attrs.contenteditable = true;
        return attrs;
    }
    get ElementEvents() {
        let events = super.ElementEvents;
        let object = this;
        events.input = function (event) {
            object.Value = object.Element.innerHTML;
            object.OnInput.Invoke(object, event);
        };
        events.blur = function (event) {
            object.Value = object.Element.innerHTML;
            object.OnBlur.Invoke(object, event);
        };
        return events;
    }

    get OnInput() {
        let object = this;
        return object.onInput ?? (object.onInput = new Callback());
    }

    get OnChange() {
        let object = this;
        return object.onChange ?? (object.onChange = new Callback());
    }

}

class Hr extends View {

    get ElementTag() { return 'hr'; }

}

class IFrame extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'Source', data.source ?? '', object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'Source', function (sender, data) {
            object.Attr('src', data.value);
        });
    }

    get ElementTag() { return 'iframe'; }

}

class Img extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'Source', data.source ?? '', object.OnPropertyChanged);
        new Property(object, 'Alt', data.alt ?? '', object.OnPropertyChanged);
        new Property(object, 'ObjectFit', data.objectFit ?? '', object.OnPropertyChanged);
        new Property(object, 'ObjectPosition', data.objectPosition ?? '', object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'Source', function (sender, data) {
            if (object.Source.startsWith('http')) {
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

class Input extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Autocomplete', data.autocomplete ?? 'bday', object.OnPropertyChanged);
        new Property(object, 'Value', data.value ?? '', object.OnPropertyChanged);
        new Property(object, 'Placeholder', data.placeholder ?? '', object.OnPropertyChanged);
        new Property(object, 'Type', data.type ?? 'text', object.OnPropertyChanged);

        if (data.onInput) object.OnInput.Listen(data.onInput);
        if (data.onChange) object.OnChange.Listen(data.onChange);
        if (data.onPaste) object.OnPaste.Listen(data.onPaste);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Autocomplete', function (sender, data) {
            object.Attr('autocomplete', object.Autocomplete);
        });
        new Binding(object, 'Placeholder', function (sender, data) {
            object.Attr('placeholder', object.Placeholder);
        });
        new Binding(object, 'Type', function (sender, data) {
            object.Attr('type', object.Type);
        });
        new Binding(object, 'Value', function (sender, data) {
            object.Prop('value', object.Value);
        });
    }

    get ElementTag() { return 'input'; }
    get ElementEvents() {
        let events = super.ElementEvents;
        let object = this;
        events.input = function (event) {
            object.Value = this.value;
            object.OnInput.Invoke(object, event);
        };
        events.change = function (event) {
            object.Value = this.value;
            object.OnChange.Invoke(object, event);
        };
        events.paste = function (event) {
            object.Value = this.value;
            object.OnPaste.Invoke(object, event);
        };
        return events;
    }

    get OnInput() {
        let object = this;
        return object.onInput ?? (object.onInput = new Callback());
    }

    get OnChange() {
        let object = this;
        return object.onChange ?? (object.onChange = new Callback());
    }

    get OnPaste() {
        let object = this;
        return object.onPaste ?? (object.onPaste = new Callback());
    }

}

class Layout extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Direction', data.direction ?? null, object.OnPropertyChanged);
        new Property(object, 'ChildrenLoop', data.childrenLoop ?? null, object.OnPropertyChanged);
        new Property(object, 'Children', data.children ?? [], object.OnPropertyChanged, function (children) {
            if (!children) return [];

            if (object.ChildrenLoop) {
                let newChildren = [];
                children.forEach(function (child, index) {
                    newChildren[index] = object.ChildrenLoop(child);
                });
                return newChildren;
            }
            return children;
        });
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Direction', function (sender, data) {
            object.Css('flex-direction', data.value);
        });
        new Binding(object, 'Children', function (sender, data) {
            object.RenderChildren();
        });
    }

    RenderChildren() {
        let object = this;
        object.Element.innerHTML = null;
        object.Children.forEach(function (child) {
            if (child) child.Parent = object;
        });
    }

    Clear() {
        let object = this;
        object.Children.forEach(function (child) {
            if (child) child.Parent = null;
        });
    }

    AddChild(child) {
        let object = this;
        object.Children.Add(child);
        object.Element.appendChild(child.Element);
        child.Parent = object;
        object.OnLayoutChange.Invoke(object, {});
    }

    RemoveChild(child) {
        let object = this;
        object.Children.Remove(child);
        child.Parent = null;
        object.OnLayoutChange.Invoke(object, {});
    }

    get ElementTag() { return 'layout'; }

}

class List extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'ListStyleType', data.listStyleType ?? null, object.OnPropertyChanged);
        new Property(object, 'ListStyleImage', data.listStyleImage ?? null, object.OnPropertyChanged);
        new Property(object, 'ListStylePosition', data.listStylePosition ?? null, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'ListStyleType', function (sender, data) {
            object.Css('list-style-type', data.value);
        });
        new Binding(object, 'ListStyleImage', function (sender, data) {
            object.Css('list-style-image', data.value);
        });
        new Binding(object, 'ListStylePosition', function (sender, data) {
            object.Css('list-style-position', data.value);
        });
    }

    get ElementTag() { return 'ul'; }

}

class ListItem extends View {

    get ElementTag() { return 'li'; }

}

class Output extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Value', data.value ?? '', object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Value', function (sender, data) {
            object.Prop('value', object.Value);
        });
    }

    get ElementTag() { return 'output'; }

}

class Progress extends View {

    get ElementTag() { return 'progress'; }

}

class SelectOption extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Text', data.text ?? '', object.OnPropertyChanged);
        new Property(object, 'Value', data.value ?? '', object.OnPropertyChanged);
        new Property(object, 'Selected', data.selected ?? false, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Text', function (sender, data) {
            object.Prop('text', object.Text);
        });
        new Binding(object, 'Value', function (sender, data) {
            object.Prop('value', object.Value);
        });
        new Binding(object, 'Selected', function (sender, data) {
            object.Prop('selected', object.Selected);
        });
    }

    get ElementTag() { return 'option'; }

}

class Text extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'Text', data.text ?? '', object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'Text', function (sender, data) {
            object.Element.innerHTML = object.Text;
        });
    }

    get ElementTag() { return 'text'; }

}

class Textarea extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Value', data.value ?? '', object.OnPropertyChanged);
        new Property(object, 'Placeholder', data.placeholder ?? '', object.OnPropertyChanged);
        new Property(object, 'Rows', data.rows ?? '', object.OnPropertyChanged);

        if (data.onInput) object.OnInput.Listen(data.onInput);
        if (data.onChange) object.OnChange.Listen(data.onChange);
        if (data.onPaste) object.OnPaste.Listen(data.onPaste);

        object.OnKeyDown.Listen(function (sender, event) {
            if (event.key == 'Enter' && !(event.ctrlKey || event.shiftKey)) {
                event.preventDefault();
                object.Element.blur();
            } else {
            }
        });
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Value', function (sender, data) {
            object.Prop('value', object.Value);
        });
        new Binding(object, 'Placeholder', function (sender, data) {
            object.Prop('placeholder', object.Placeholder);
        });
        new Binding(object, 'Rows', function (sender, data) {
            object.Prop('rows', object.Rows);
        });
    }

    get ElementTag() { return 'textarea'; }
    get ElementEvents() {
        let events = super.ElementEvents;
        let object = this;
        events.input = function (event) {
            object.Value = this.value;
            object.OnInput.Invoke(object, event);
        };
        events.change = function (event) {
            object.Value = this.value;
            object.OnChange.Invoke(object, event);
        };
        events.paste = function (event) {
            object.Value = this.value;
            object.OnPaste.Invoke(object, event);
        };
        return events;
    }

    get OnInput() {
        let object = this;
        return object.onInput ?? (object.onInput = new Callback());
    }

    get OnChange() {
        let object = this;
        return object.onChange ?? (object.onChange = new Callback());
    }

    get OnPaste() {
        let object = this;
        return object.onPaste ?? (object.onPaste = new Callback());
    }

}

class Video extends View {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'Source', data.source ?? '', object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'Source', function (sender, data) {
            object.Attr('src', data.value);
        });
    }

    get ElementTag() { return 'video'; }

}

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

class InputNumber extends Input {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Type = 'number';

        new Property(object, 'Min', data.min ?? null, object.OnPropertyChanged);
        new Property(object, 'Max', data.max ?? null, object.OnPropertyChanged);
        new Property(object, 'Step', data.step ?? 1, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Min', function (sender, data) {
            object.Prop('min', object.Min);
        });
        new Binding(object, 'Max', function (sender, data) {
            object.Prop('max', object.Max);
        });
        new Binding(object, 'Step', function (sender, data) {
            object.Prop('step', object.Step);
        });
    }

}

class Slider extends Input {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Type = 'slider';

        new Property(object, 'Min', data.min ?? null, object.OnPropertyChanged);
        new Property(object, 'Max', data.max ?? null, object.OnPropertyChanged);
        new Property(object, 'Step', data.step ?? 1, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Min', function (sender, data) {
            object.Prop('min', object.Min);
        });
        new Binding(object, 'Max', function (sender, data) {
            object.Prop('max', object.Max);
        });
        new Binding(object, 'Step', function (sender, data) {
            object.Prop('step', object.Step);
        });
    }

}

class Button extends Layout {

    get ElementTag() { return 'button'; }

}

class Caption extends Layout {

    get ElementTag() { return 'caption'; }

}

class Column extends Layout {

    get ElementTag() { return 'column'; }

}

class Form extends Layout {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Action', data.action ?? '', object.OnPropertyChanged);
        new Property(object, 'Method', data.method ?? 'GET', object.OnPropertyChanged);
        new Property(object, 'Enctype', data.enctype ?? 'multipart/form-data', object.OnPropertyChanged);

        if (data.onSubmit) object.OnSubmit.Listen(data.onSubmit);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Action', function (sender, data) {
            object.Prop('action', data.value);
        });
        new Binding(object, 'Method', function (sender, data) {
            object.Prop('method', data.value);
        });
        new Binding(object, 'Enctype', function (sender, data) {
            object.Prop('enctype', data.value);
        });
    }

    get ElementTag() { return 'form'; }
    get ElementEvents() {
        let events = super.ElementEvents;
        let object = this;
        events.submit = function (event) {
            event.preventDefault();
            event.stopPropagation();
            object.OnSubmit.Invoke(object, event);
        };
        return events;
    }

    get OnSubmit() {
        let object = this;
        return object.onSubmit ?? (object.onSubmit = new Callback());
    }

    Submit() {
        let object = this;
        object.OnSubmit.Invoke(object, {});
    }

    Reset() {
        let object = this;
        object.Element.reset();
    }

}

class Grid extends Layout {

    get ElementTag() { return 'grid'; }

}

class Label extends Layout {

    get ElementTag() { return 'label'; }

}

class Link extends Layout {

    get ElementTag() { return 'a'; }

}

class Main extends Layout {

    get ElementTag() { return 'main'; }

}

class Page extends Layout {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'Content', data.content ?? [], object.OnPropertyChanged);

        new Property(object, 'In', data.in ?? new Anim(125, function (sender, data) {
            let opacity = data.t;

            object.Opacity = opacity;
        }, function (sender, data) {
            object.Opacity = null;
        }), object.OnPropertyChanged);

        new Property(object, 'Out', data.out ?? new Anim(125, function (sender, data) {
            let opacity = data.i;

            object.Opacity = opacity;
        }), object.OnPropertyChanged);
        new Binding(object, 'Out', function (sender, data) {
            if (data.value) data.value.OnEnd.Listen(function (sender, success) {
                if (success) object.Remove();
            });
        });

        if (data.onPush) object.OnPush.Listen(data.onPush);
        if (data.onPull) object.OnPull.Listen(data.onPull);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Parent', function (sender, data) {
            if (object.Parent) {
                object.Push();
            }
        });

        new Binding(object, 'Content', function (sender, data) {
            data.value.forEach(function (child) {
                child.Parent = object.ContentView;
            });
        });
    }

    Render() {
        let object = this;

        object.Children = [
            object.ContentView,
        ];
    }

    get ElementTag() { return 'page'; }
    get ContentView() {
        let object = this;
        return object.contentView ?? (object.contentView = new Main());
    }

    get OnPush() {
        let object = this;
        return object.onPush ?? (object.onPush = new Callback());
    }
    get OnPull() {
        let object = this;
        return object.onPull ?? (object.onPull = new Callback());
    }

    Push() {
        let object = this;

        object.OnPush.Invoke(object, {});

        if (object.Out) object.Out.Stop();
        if (object.In) object.In.Start();
    }

    Pull() {
        let object = this;

        object.OnPull.Invoke(object, {});

        if (object.In) object.In.Stop();
        if (object.Out) object.Out.Start();
        else object.Remove();
    }

}

class Row extends Layout {

    get ElementTag() { return 'row'; }

}

class Select extends Layout {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Value', data.value ?? '', object.OnPropertyChanged);

        if (data.onChange) object.OnChange.Listen(data.onChange);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Value', function (sender, data) {
            object.Prop('value', object.Value);
        });
    }

    get ElementTag() { return 'select'; }
    get ElementEvents() {
        let events = super.ElementEvents;
        let object = this;
        events.change = function (event) {
            object.Value = this.value;
            object.OnChange.Invoke(object, event);
        };
        return events;
    }

    get OnChange() {
        let object = this;
        return object.onChange ?? (object.onChange = new Callback());
    }

}

class SelectOptionGroup extends Layout {

    get ElementTag() { return 'optgroup'; }

}

class TBody extends Layout {

    get ElementTag() { return 'tbody'; }

}

class TFoot extends Layout {

    get ElementTag() { return 'tfoot'; }

}

class THead extends Layout {

    get ElementTag() { return 'thead'; }

}

class Table extends Layout {

    get ElementTag() { return 'table'; }

}

class Td extends Layout {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'Colspan', data.colspan ?? null, object.OnPropertyChanged);
        new Property(object, 'Rowspan', data.rowspan ?? null, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'Colspan', function (sender, data) {
            object.Attr('colspan', object.Colspan);
        });
        new Binding(object, 'Rowspan', function (sender, data) {
            object.Attr('rowspan', object.Rowspan);
        });
    }

    get ElementTag() { return 'td'; }

}

class Tr extends Layout {

    get ElementTag() { return 'tr'; }

}

class Th extends Td {

    get ElementTag() { return 'th'; }

}

class App extends Layout {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        App.Instance = object;

        new Property(object, 'Title', data.title ?? 'App', object.OnPropertyChanged);
        new Property(object, 'Description', data.description ?? '', object.OnPropertyChanged);

        window.addEventListener('load', function (event) {
            document.body.appendChild(object.Element);

            object.Loaded();
            object.OnLoad.Invoke(object, event);
        });

        window.addEventListener('resize', function (event) {
            object.OnResize.Invoke(object, event);
        });

        window.addEventListener('dragenter', function () {

        });
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Title', function (sender, data) {
            document.title = data.value;
        });
    }

    Loaded() {
        let object = this;
    }

    get ElementTag() {
        return 'app';
    }

    get OnLoad() {
        let object = this;
        return object.onLoad ?? (object.onLoad = new Callback());
    }

    get OnResize() {
        let object = this;
        return object.onResize ?? (object.onResize = new Callback());
    }

}

Array.prototype.__defineGetter__('Changed', function () {
    let array = this;
    return array.changed ?? (array.changed = new Callback());
});

Array.prototype.Add = function (item) {
    let array = this;
    let index = array.push(item);
    array.Changed.Invoke(array, {
        index: index,
        item: item,
    });
    return index;
};

Array.prototype.RemoveAt = function (index) {
    let array = this;
    let items = array.splice(index, 1);
    array.Changed.Invoke(array, {
        index: index,
        items: items,
    });
    return items;
};

Array.prototype.Remove = function (item) {
    let array = this;
    let index = array.indexOf(item);
    return array.RemoveAt(index);
};

Math.Clamp = function (value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
};

Math.Lerp = function (a, b, t) {
    return a + (b - a) * t;
};

Math.Round = function (value, decimals = 2) {
    let power = Math.pow(10, decimals);
    return Math.round(value * power) / power;
};