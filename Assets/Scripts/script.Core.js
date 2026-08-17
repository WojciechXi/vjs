class Disposable {

    Dispose() {
        if (this.isDisposed) return;

        const object = this;
        object.isDisposed = true;
        Object.keys(object).forEach(function (key) {
            if (key != 'isDisposed') object[key] = null;
        });
    }

}

function String4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function GUID() {
    return (String4() + String4() + "-" + String4() + "-" + String4() + "-" + String4() + "-" + String4() + String4() + String4());
}

class Bindable extends Disposable {

    constructor() {
        super();
        const object = this;
        object._bindings = [];
    }

    Dispose() {
        if (this.isDisposed) return;

        for (let binding of this._bindings) binding.Dispose();
        super.Dispose();
    }

}

Array.prototype.Add = function (item) {
    let array = this;
    let index = array.push(item);
    return index;
};

Array.prototype.RemoveAt = function (index) {
    let array = this;
    let items = array.splice(index, 1);
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

Math.ZeroBefore = function (value, count = 1) {
    value = parseInt(value);
    if (value < 10) return `0${value}`;
    return value;
};

class Ajax {

    static get OnResponse() {
        return Ajax.onResponse ? Ajax.onResponse : (Ajax.onResponse = new Callback());
    }

    static Get(url, data = {}) {
        const params = new URLSearchParams(data.data ?? {});
        const ajax = new Ajax('GET', `${url}?${params.toString()}`);
        ajax.Send(data);
        return ajax;
    }

    static Post(url, data = {}) {
        const ajax = new Ajax('POST', url);
        ajax.Send(data);
        return ajax;
    }

    static Put(url, data = {}) {
        const ajax = new Ajax('PUT', url);
        ajax.Send(data);
        return ajax;
    }

    static Delete(url, data = {}) {
        const ajax = new Ajax('DELETE', url);
        ajax.Send(data);
        return ajax;
    }

    constructor(method, url, async = true) {
        const object = this;
        object.loading = false;
        object.progress = false;

        object.method = method;
        object.url = url;
        object.async = async;
    }

    Send(data) {
        const object = this;

        if (data.update) data.update(object, object.loading = true);

        object.xhr = new XMLHttpRequest();
        object.xhr.open(object.method == 'GET' ? 'GET' : 'POST', object.url, object.async);

        if (data.load) object.xhr.addEventListener('load', function (event) {
            if (data.update) data.update(object, object.loading = false);
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
            if (data.update) data.update(object, object.loading = false);
            data.error(object.xhr.error);
        });

        const formData = data.form ? new FormData(data.form) : new FormData();
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

        if (data.before) data.before(object);

        object.xhr.send(formData);
    }

    Abort() {
        const object = this;
        object.xhr.abort();
    }

}

class Anim {

    constructor(duration, onStep, onEnd = null, onStart = null, onStop = null) {
        const object = this;
        object.duration = duration;
        object.play = false;
        object.timingFunction = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        object.OnStart.Listen(onStart);
        object.OnStep.Listen(onStep);
        object.OnEnd.Listen(onEnd);
        object.OnStop.Listen(onStop);
    }

    get OnStart() {
        const object = this;
        return object.onStart ?? (object.onStart = new Callback());
    }

    get OnStep() {
        const object = this;
        return object.onStep ?? (object.onStep = new Callback());
    }

    get OnEnd() {
        const object = this;
        return object.onEnd ?? (object.onEnd = new Callback());
    }

    get OnStop() {
        const object = this;
        return object.onStop ?? (object.onStop = new Callback());
    }

    Start() {
        const object = this;
        if (object.play) return;
        object.play = true;
        object.begin = Date.now();
        object.OnStart.Invoke(object);
        object.Step(0);
    }

    Step() {
        const object = this;
        if (!object.play) return;
        object.current = Date.now() - object.begin;
        object.transition = Math.Clamp(object.current / object.duration, 0, 1);
        if (object.transition >= 1) {
            return object.End(true);
        } else {
            const t = object.timingFunction(object.transition);

            object.OnStep.Invoke(object, {
                t: t,
                i: 1 - t,
            });
            requestAnimationFrame(function () {
                object.Step();
            });
        }
    }

    End(success = false) {
        const object = this;
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
        const object = this;
        if (!object.play) return;
        object.play = false;
        object.end = Date.now();
        object.OnStop.Invoke(object, false);
    }

}

class Binding extends Disposable {

    constructor(source, property, onChange = null) {
        super();

        let object = this;

        object.property = property;
        object.onChange = onChange;

        object.Source = source;

        (source._bindings ?? (source._bindings = [])).push(object);
    }

    set Source(newValue) {
        let object = this;

        if (object.source == newValue) return;

        if (object.source && object.source.OnPropertyChange && object.listener) {
            object.source.OnPropertyChange.Remove(object.listener);
            object.listener = null;
        }

        object.source = newValue;
        if (object.source && object.source.OnPropertyChange) {
            object.listener = function (sender, property) {
                if (property != object.property) return;
                if (object.onChange) object.onChange(object.source, {
                    property: object.property,
                    value: object.source[object.property],
                });
            };

            object.source.OnPropertyChange.Listen(object.listener);

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

class Callback extends Disposable {

    constructor() {
        super();

        const object = this;
        object.listeners = [];
    }

    Listen(listener) {
        const object = this;
        object.listeners.push(listener);
    }

    Remove(listener) {
        const object = this;
        const index = object.listeners.indexOf(listener);
        if (index >= 0) return object.listeners.splice(index, 1);
        return null;
    }

    Clear() {
        const object = this;
        return object.listeners = [];
    }

    Invoke(sender, data) {
        const object = this;
        for (let listener of object.listeners) {
            try {
                if (listener) listener(sender, data);
            } catch (exception) {
                console.error(exception);
            }
        }
    }

}

class Model {

    static get Endpoints() {
        return {
            insert: null,
            update: null,
            delete: null,
        };
    }

    static get ResponseKeyModels() {
        return {};
    }

    static get KeyModels() {
        return {};
    }

    static Parse(object) {
        let c = this;
        return object ? new c(object) : null;
    }

    static ParseArray(objects) {
        let c = this;

        let models = [];
        objects.forEach(function (object) {
            if (!object) return;
            models.push(new c(object));
        });
        return models;
    }

    static ParseResponse(key, value) {
        if (this.ResponseKeyModels[key]) return this.ResponseKeyModels[key].Parse(value);
        return value;
    }

    static Insert(data, response) {
        let c = this;

        if (c.Endpoints.insert) {
            Ajax.Post(c.Endpoints.insert, {
                data: data,
                load: function (data) {
                    Object.keys(data).forEach(function (key) {
                        data[key] = c.ParseResponse(key, data[key]);
                    });

                    response(data);
                },
            });
        } else {

        }
    }

    constructor(data) {
        let object = this;

        Object.keys(data).forEach(function (key) {
            object.Set(key, data[key]);
        });
    }

    Get(key) {
        let object = this;
        return object[key];
    }

    Parse(key, value) {
        if (this.constructor.KeyModels[key]) return this.constructor.KeyModels[key].Parse(value);
        return value;
    }

    Set(key, value) {
        let object = this;
        object[key] = object.Parse(key, value);
    }

    Update(data, response) {
        let object = this;

        if (object.constructor.Endpoints.update) {
            let endpoint = object.constructor.Endpoints.update.replace('{id}', object.id);

            Ajax.Put(endpoint, {
                data: data,
                load: function (data) {
                    Object.keys(data).forEach(function (key) {
                        data[key] = c.ParseResponse(key, data[key]);
                    });

                    response(data);
                },
            });
        } else {

        }
    }

    Delete(response) {
        let object = this;

        if (object.constructor.Endpoints.delete) {
            let endpoint = object.constructor.Endpoints.delete.replace('{id}', object.id);

            Ajax.Delete(endpoint, {
                data: data,
                load: function (data) {
                    Object.keys(data).forEach(function (key) {
                        data[key] = c.ParseResponse(key, data[key]);
                    });

                    response(data);
                },
            });
        } else {

        }
    }

}

class Property extends Disposable {

    constructor(target, property, value = null, onChange = null, parser = null, disposable = false) {
        super();

        let object = this;

        object.value = null;

        object.target = target;
        object.property = property;
        object.onChange = onChange;
        object.parser = parser;
        object.disposable = disposable;

        Object.defineProperty(object.target, object.property, {
            get: function () {
                return object.value;
            },
            set: function (newValue) {
                if (object.parser) newValue = object.parser(newValue);

                let oldValue = object.value;
                if (oldValue != newValue && object.disposable && oldValue instanceof Disposable) oldValue.Dispose();

                object.value = newValue;
                if (object.onChange) object.onChange.call(object.target, object.property, oldValue, newValue);
            }
        });

        if (value !== null && value !== undefined) object.target[property] = value;

        (target._properties ?? (target._properties = {}))[property] = object;
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

class View extends Bindable {

    get Index() {
        const object = this;
        return object.Parent ? object.Parent.Children.indexOf(object) : -1;
    }

    get ElementTag() { return 'view'; }
    get ElementAttrs() {
        const object = this;
        return {};
    }
    get ElementEvents() {
        const object = this;
        return App.v2 ? {} : {
            // Click
            click: function (sender, event) { object.OnClick.Invoke(object, event); },
            dblclick: function (sender, event) { object.OnDblClick.Invoke(object, event); },
            // ContextMenu
            contextmenu: function (sender, event) { object.OnContextMenu.Invoke(object, event); },
            // Focus
            focus: function (sender, event) { object.OnFocus.Invoke(object, event); },
            blur: function (sender, event) { object.OnBlur.Invoke(object, event); },
            // Mouse
            wheel: function (sender, event) { object.OnMouseWheel.Invoke(object, event); },
            mousedown: function (sender, event) { object.OnMouseDown.Invoke(object, event); },
            mouseup: function (sender, event) { object.OnMouseUp.Invoke(object, event); },
            mouseenter: function (sender, event) { object.OnMouseEnter.Invoke(object, event); },
            mousemove: function (sender, event) { object.OnMouseMove.Invoke(object, event); },
            mouseover: function (sender, event) { object.OnMouseOver.Invoke(object, event); },
            mouseleave: function (sender, event) { object.OnMouseLeave.Invoke(object, event); },
            // Touch
            touchstart: function (sender, event) { object.OnTouchStart.Invoke(object, event); },
            touchmove: function (sender, event) { object.OnTouchMove.Invoke(object, event); },
            touchend: function (sender, event) { object.onTouchEnd.Invoke(object, event); },
            touchcancel: function (sender, event) { object.OnTouchCancel.Invoke(object, event); },
            // Drag
            dragstart: function (sender, event) { window.dragItem = event.target.view; object.OnDragStart.Invoke(object, event); },
            dragenter: function (sender, event) { event.preventDefault(); object.OnDragEnter.Invoke(object, event); },
            dragover: function (sender, event) { event.preventDefault(); object.OnDragOver.Invoke(object, event); },
            dragleave: function (sender, event) { event.preventDefault(); object.OnDragLeave.Invoke(object, event); },
            // Drop
            drop: function (sender, event) { event.preventDefault(); object.OnDrop.Invoke(object, event); },
            // Key
            keydown: function (sender, event) { object.OnKeyDown.Invoke(object, event); },
            keyup: function (sender, event) { object.OnKeyUp.Invoke(object, event); },
        };
    }
    get Element() {
        const object = this;
        if (!object.element) {
            object.element = document.createElement(object.ElementTag);
            object.element.view = object;
            let attrs = object.ElementAttrs;
            Object.keys(attrs).forEach(function (attr) {
                object.Attr(attr, attrs[attr]);
            });
            let events = object.ElementEvents;
            Object.keys(events).forEach(function (event) {
                object.Listen(event, events[event]);
            });
        }
        return object.element;
    }

    get InnerHTML() { return this.Element.innerHTML; }
    set InnerHTML(html) { return this.Element.innerHTML = html; }

    get InnerText() { return this.Element.innerText; }
    set InnerText(text) { return this.Element.innerText = text; }

    get Rect() { return this.Element.getBoundingClientRect(); }

    constructor(data = {}) {
        super();

        const object = this;

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
        const object = this;

        if (data.onPropertyChange) {
            object.Listen('propertyChange', data.onPropertyChange);
            object.OnPropertyChange.Listen(data.onPropertyChange);
        }

        if (data.onLayoutChange) {
            object.Listen('layoutChange', data.onLayoutChange);
            object.OnLayoutChange.Listen(data.onLayoutChange);
        }

        new Property(object, 'Parent', data.parent ?? null, function (property, oldValue, newValue) {
            object.OnPropertyChanged(property, oldValue, newValue);
        });
        new Property(object, 'Classes', data.classes ?? [], function (property, oldValue, newValue) {
            object.Attr('class', newValue && newValue.length ? (Array.isArray(newValue) ? newValue.join(' ') : newValue) : null);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
        new Property(object, 'Id', data.id ?? null, function (property, oldValue, newValue) {
            object.Attr('id', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
        new Property(object, 'Name', data.name ?? null, function (property, oldValue, newValue) {
            object.Attr('name', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
        new Property(object, 'Tooltip', data.tooltip ?? null, function (property, oldValue, newValue) {
            object.Attr('title', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Selected', data.selected ?? null, function (property, oldValue, newValue) {
            object.Attr('selected', newValue ? true : null);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
        new Property(object, 'Disabled', data.disabled ?? null, function (property, oldValue, newValue) {
            object.Attr('disabled', newValue ? true : null);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
        new Property(object, 'Draggable', data.draggable ?? null, function (property, oldValue, newValue) {
            object.Attr('draggable', newValue ? true : null);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
        new Property(object, 'Multiple', data.multiple ?? null, function (property, oldValue, newValue) {
            object.Attr('multiple', newValue ? true : null);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'BackgroundColor', data.backgroundColor ?? null, function (property, oldValue, newValue) { object.Css('background-color', newValue); });
        new Property(object, 'BackgroundImage', data.backgroundImage ?? null, function (property, oldValue, newValue) { object.Css('background-image', newValue); });
        new Property(object, 'BackgroundSize', data.backgroundSize ?? null, function (property, oldValue, newValue) { object.Css('background-size', newValue); });
        new Property(object, 'BackgroundRepeat', data.backgroundRepeat ?? null, function (property, oldValue, newValue) { object.Css('background-repeat', newValue); });
        new Property(object, 'BackgroundPosition', data.backgroundPosition ?? null, function (property, oldValue, newValue) { object.Css('background-position', newValue); });
        new Property(object, 'BackgroundAttachment', data.backgroundAttachment ?? null, function (property, oldValue, newValue) { object.Css('background-attachment', newValue); });

        new Property(object, 'Border', data.border ?? null, function (property, oldValue, newValue) { object.Css('border', newValue); });
        new Property(object, 'BorderWidth', data.borderWidth ?? null, function (property, oldValue, newValue) { object.Css('border-width', newValue); });
        new Property(object, 'BorderStyle', data.borderStyle ?? null, function (property, oldValue, newValue) { object.Css('border-style', newValue); });
        new Property(object, 'BorderColor', data.borderColor ?? null, function (property, oldValue, newValue) { object.Css('border-color', newValue); });
        new Property(object, 'BorderRadius', data.borderRadius ?? null, function (property, oldValue, newValue) { object.Css('border-radius', newValue, 'rem'); });

        new Property(object, 'BorderLeft', data.borderLeft ?? null, function (property, oldValue, newValue) { object.Css('border-left', newValue); });
        new Property(object, 'BorderTop', data.borderTop ?? null, function (property, oldValue, newValue) { object.Css('border-top', newValue); });
        new Property(object, 'BorderRight', data.borderRight ?? null, function (property, oldValue, newValue) { object.Css('border-right', newValue); });
        new Property(object, 'BorderBottom', data.borderBottom ?? null, function (property, oldValue, newValue) { object.Css('border-bottom', newValue); });

        new Property(object, 'PointerEvents', data.pointerEvents ?? null, function (property, oldValue, newValue) { object.Css('pointer-events', newValue); });
        new Property(object, 'Cursor', data.cursor ?? null, function (property, oldValue, newValue) { object.Css('cursor', newValue); });
        new Property(object, 'Display', data.display ?? null, function (property, oldValue, newValue) { object.Css('display', newValue); });
        new Property(object, 'BoxShadow', data.boxShadow ?? null, function (property, oldValue, newValue) { object.Css('box-shadow', newValue); });
        new Property(object, 'Opacity', data.opacity ?? null, function (property, oldValue, newValue) { object.Css('opacity', newValue); });
        new Property(object, 'TextOverflow', data.textOverflow ?? null, function (property, oldValue, newValue) { object.Css('text-overflow', newValue); });
        new Property(object, 'Overflow', data.overflow ?? null, function (property, oldValue, newValue) { object.Css('overflow', newValue); });
        new Property(object, 'AlignSelf', data.alignSelf ?? null, function (property, oldValue, newValue) { object.Css('align-self', newValue); });
        new Property(object, 'AlignItems', data.alignItems ?? null, function (property, oldValue, newValue) { object.Css('align-items', newValue); });
        new Property(object, 'JustifyContent', data.justifyContent ?? null, function (property, oldValue, newValue) { object.Css('justify-content', newValue); });
        new Property(object, 'FlexGrow', data.flexGrow ?? null, function (property, oldValue, newValue) { object.Css('flex-grow', newValue); });
        new Property(object, 'FlexShrink', data.flexShrink ?? null, function (property, oldValue, newValue) { object.Css('flex-shrink', newValue); });
        new Property(object, 'FlexWrap', data.flexWrap ?? null, function (property, oldValue, newValue) { object.Css('flex-wrap', newValue); });
        new Property(object, 'FlexOrder', data.flexOrder ?? null, function (property, oldValue, newValue) { object.Css('flex-order', newValue); });
        new Property(object, 'Gap', data.gap ?? null, function (property, oldValue, newValue) { object.Css('gap', newValue, 'rem'); });
        new Property(object, 'Resize', data.resize ?? null, function (property, oldValue, newValue) { object.Css('resize', newValue); });
        new Property(object, 'Position', data.position ?? null, function (property, oldValue, newValue) { object.Css('position', newValue); });
        new Property(object, 'ZIndex', data.zIndex ?? null, function (property, oldValue, newValue) { object.Css('z-index', newValue); });
        new Property(object, 'Left', data.left ?? null, function (property, oldValue, newValue) { object.Css('left', newValue, 'px'); });
        new Property(object, 'Top', data.top ?? null, function (property, oldValue, newValue) { object.Css('top', newValue, 'px'); });
        new Property(object, 'Right', data.right ?? null, function (property, oldValue, newValue) { object.Css('right', newValue, 'px'); });
        new Property(object, 'Bottom', data.bottom ?? null, function (property, oldValue, newValue) { object.Css('bottom', newValue, 'px'); });
        new Property(object, 'Outline', data.outline ?? null, function (property, oldValue, newValue) { object.Css('outline', newValue); });
        new Property(object, 'Margin', data.margin ?? null, function (property, oldValue, newValue) { object.Css('margin', newValue, 'rem'); });
        new Property(object, 'Padding', data.padding ?? null, function (property, oldValue, newValue) { object.Css('padding', newValue, 'rem'); });
        new Property(object, 'MinWidth', data.minWidth ?? null, function (property, oldValue, newValue) { object.Css('min-width', newValue, 'px'); });
        new Property(object, 'Width', data.width ?? null, function (property, oldValue, newValue) { object.Css('width', newValue, 'px'); });
        new Property(object, 'MaxWidth', data.maxWidth ?? null, function (property, oldValue, newValue) { object.Css('max-width', newValue, 'px'); });
        new Property(object, 'MinHeight', data.minHeight ?? null, function (property, oldValue, newValue) { object.Css('min-height', newValue, 'px'); });
        new Property(object, 'Height', data.height ?? null, function (property, oldValue, newValue) { object.Css('height', newValue, 'px'); });
        new Property(object, 'MaxHeight', data.maxHeight ?? null, function (property, oldValue, newValue) { object.Css('max-height', newValue, 'px'); });
        new Property(object, 'AspectRatio', data.aspectRatio ?? null, function (property, oldValue, newValue) { object.Css('aspect-ratio', newValue); });
        new Property(object, 'Color', data.color ?? null, function (property, oldValue, newValue) { object.Css('color', newValue); });
        new Property(object, 'LineHeight', data.lineHeight ?? null, function (property, oldValue, newValue) { object.Css('line-height', newValue); });
        new Property(object, 'VerticalAlign', data.verticalAlign ?? null, function (property, oldValue, newValue) { object.Css('vertical-align', newValue); });
        new Property(object, 'TextAlign', data.textAlign ?? null, function (property, oldValue, newValue) { object.Css('text-align', newValue); });
        new Property(object, 'TextTransform', data.textTransform ?? null, function (property, oldValue, newValue) { object.Css('text-transform', newValue); });
        new Property(object, 'TextIdent', data.textIdent ?? null, function (property, oldValue, newValue) { object.Css('text-ident', newValue, 'rem'); });
        new Property(object, 'LetterSpacing', data.letterSpacing ?? null, function (property, oldValue, newValue) { object.Css('letter-spacing', newValue, 'px'); });
        new Property(object, 'WordSpacing', data.wordSpacing ?? null, function (property, oldValue, newValue) { object.Css('word-spacing', newValue, 'px'); });
        new Property(object, 'WhiteSpace', data.whiteSpace ?? null, function (property, oldValue, newValue) { object.Css('white-space', newValue); });
        new Property(object, 'TextAlignLast', data.textAlignLast ?? null, function (property, oldValue, newValue) { object.Css('text-align-last', newValue); });
        new Property(object, 'TextDecoration', data.textDecoration ?? null, function (property, oldValue, newValue) { object.Css('text-decoration', newValue); });
        new Property(object, 'TextShadow', data.textShadow ?? null, function (property, oldValue, newValue) { object.Css('text-shadow', newValue); });
        new Property(object, 'FontSize', data.fontSize ?? null, function (property, oldValue, newValue) { object.Css('font-size', newValue, 'rem'); });
        new Property(object, 'FontFamily', data.fontFamily ?? null, function (property, oldValue, newValue) { object.Css('font-family', newValue); });
        new Property(object, 'FontStyle', data.fontStyle ?? null, function (property, oldValue, newValue) { object.Css('font-style', newValue); });
        new Property(object, 'FontWeight', data.fontWeight ?? null, function (property, oldValue, newValue) { object.Css('font-weight', newValue); });
        new Property(object, 'FontVariant', data.fontVariant ?? null, function (property, oldValue, newValue) { object.Css('font-variant', newValue); });
        new Property(object, 'WritingMode', data.writingMode ?? null, function (property, oldValue, newValue) { object.Css('writing-mode', newValue); });
        new Property(object, 'Transition', data.transition ?? null, function (property, oldValue, newValue) { object.Css('transition', newValue, 'ms'); });
        new Property(object, 'Transform', data.transform ?? null, function (property, oldValue, newValue) { object.Css('transform', newValue); });

        if (data.css && data.css instanceof Object) {
            Object.keys(data.css).forEach(function (key) {
                const value = data.css[key];
                key = key.split(/(?=[A-Z])/).map(word => word.toLowerCase()).join('-');

                if (value !== null) object.Element.style.setProperty(key, value);
                else object.Element.style.removeProperty(key);
            });
        }

        new Property(object, 'CanSelect', data.canSelect ?? false, function (property, oldValue, newValue) {
            object.Attr('selectable', newValue ? true : null);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'IsSelected', data.isSelected ?? false, function (property, oldValue, newValue) {
            object.Attr('is-selected', newValue ? true : null);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        if (data.onClick) object.Listen('click', data.onClick);
        if (data.onDblClick) object.Listen('dblclick', data.onDblClick);
        if (data.onContextMenu) object.Listen('contextmenu', data.onContextMenu);
        if (data.onFocus) object.Listen('focus', data.onFocus);
        if (data.onBlur) object.Listen('blur', data.onBlur);
        if (data.onMouseWheel) object.Listen('mousewheel', data.onMouseWheel);
        if (data.onMouseDown) object.Listen('mousedown', data.onMouseDown);
        if (data.onMouseUp) object.Listen('mouseup', data.onMouseUp);
        if (data.onMouseEnter) object.Listen('mouseenter', data.onMouseEnter);
        if (data.onMouseMove) object.Listen('mousemove', data.onMouseMove);
        if (data.onMouseOver) object.Listen('mouseover', data.onMouseOver);
        if (data.onMouseLeave) object.Listen('mouseleave', data.onMouseLeave);
        if (data.onTouchStart) object.Listen('touchstart', data.onTouchStart);
        if (data.onTouchMove) object.Listen('touchmove', data.onTouchMove);
        if (data.onTouchEnd) object.Listen('touchend', data.onTouchEnd);
        if (data.onTouchCancel) object.Listen('touchcancel', data.onTouchCancel);
        if (data.onDragStart) object.Listen('dragstart', data.onDragStart);
        if (data.onDragEnter) object.Listen('dragenter', data.onDragEnter);
        if (data.onDragOver) object.Listen('dragover', data.onDragOver);
        if (data.onDragLeave) object.Listen('dragleave', data.onDragLeave);
        if (data.onDrop) object.Listen('drop', data.onDrop);
        if (data.onKeyDown) object.Listen('keydown', data.onKeyDown);
        if (data.onKeyUp) object.Listen('keyup', data.onKeyUp);
        if (data.onRemove) object.Listen('remove', data.onRemove);
        if (data.onRemove) object.OnRemove.Listen(data.onRemove);
    }

    Bind() {
        const object = this;
    }

    Render() {
        const object = this;
    }

    SetParent(parent, index = -1) {
        const object = this;
        if (parent && parent.AddChild) {
            parent.AddChild(object, index);
        } else object.Remove();
    }

    AppendBefore(element) {
        const object = this;
        if (!object.Parent) return false;
        object.Parent.AddChild(element, object.Index);
    }

    AppendAfter(element) {
        const object = this;
        if (!object.Parent) return false;
        object.Parent.AddChild(element, object.Index + 1);
    }

    Property(propertyName, defaultValue, callback) {
        const object = this;
        return new Property(object, propertyName, defaultValue ?? null, callback ?? object.OnPropertyChanged);
    }
    GC() {
        delete this;
    }
    Listen(eventName, callback) {
        if (!eventName) return null;
        if (!callback) return null;
        const object = this;
        const eventListener = function (event) { callback(object, event); };
        this.Element.addEventListener(eventName, eventListener);
        return eventListener;
    }
    Unlisten(eventName, callback) {
        if (!eventName) return null;
        if (!callback) return null;
        this.Element.removeEventListener(eventName, callback);
    }
    Trigger(event, data = {}) {
        const object = this;
        let customEvent = new CustomEvent(event, {
            bubbles: true,
        });
        object.Element.dispatchEvent(customEvent);
    }
    Click(data = {}) {
        const object = this;
        object.Trigger('click', data);
    }
    Input() {
        const object = this;
        object.Trigger('input');
    }
    Change() {
        const object = this;
        object.Trigger('change');
    }

    ParentUntil(filter) {
        const object = this;
        if (!object.Parent) return null;
        if (filter(object.Parent)) return object.Parent;
        return object.Parent.ParentUntil(filter);
    }

    FindChild(filter) {
        const object = this;

        for (let child of object.Children) if (filter(child)) return child;

        for (let child of object.Children) {
            const subChild = child.FindChild(filter);
            if (subChild) return subChild;
        }

        return null;
    }

    Find(name) {
        const object = this;
        let element = object.Element.querySelector(`[name="${name}"]`);
        return element ? element.view : null;
    }

    QuerySelector(selector) {
        const object = this;
        const element = object.Element.querySelector(selector);
        return element ? element.view : null;
    }

    QuerySelectorAll(selector) {
        const object = this;
        const elements = object.Element.querySelectorAll(selector);
        return elements.filter(e => e.view).map(e => e.view);
    }

    Attr(attribute, value) {
        const object = this;
        if (value !== null) object.Element.setAttribute(attribute, value);
        else object.Element.removeAttribute(attribute);
    }

    Attrs(attributes) {
        const object = this;
        Object.keys(attributes).forEach(function (key) {
            object.Attr(key, attributes[key]);
        });
    }

    Prop(property, value) {
        const object = this;
        object.Element[property] = value;
    }

    Props(properties) {
        const object = this;
        Object.keys(properties).forEach(function (key) {
            object.Prop(key, properties[key]);
        });
    }

    Css(property, value, unit = null) {
        if (!property) return false;
        property = property.split(/(?=[A-Z])/).join('-').toLowerCase();
        const object = this;
        if (value !== null) {
            if (unit) {
                if (typeof value == 'number') object.Element.style.setProperty(property, `${value}${unit}`);
                else object.Element.style.setProperty(property, value);
            } else {
                object.Element.style.setProperty(property, value);
            }
        } else object.Element.style.removeProperty(property);
    }

    Style(property, value, unit = null) {
        if (!property) return false;
        property = property.split(/(?=[A-Z])/).join('-').toLowerCase();
        const object = this;
        if (value !== null) {
            if (unit) {
                if (typeof value == 'number') object.Element.style.setProperty(property, `${value}${unit}`);
                else object.Element.style.setProperty(property, value);
            } else {
                object.Element.style.setProperty(property, value);
            }
        } else object.Element.style.removeProperty(property);
    }

    Styles(style) {
        const object = this;
        Object.keys(style).forEach(function (key) {
            if (style[key] instanceof Object) object.Css(key, style[key].value ?? null, style[key].unit ?? null);
            else object.Css(key, style[key]);
        });
    }

    OnPropertyChanged(propertyName, oldValue = null, newValue = null) {
        const object = this;
        object.OnPropertyChange.Invoke(object, propertyName, {
            oldValue: oldValue,
            newValue: newValue
        });
    }

    OnLayoutChanged() {
        const object = this;
        object.OnLayoutChange.Invoke(object, {});
    }

    Remove() {
        const object = this;
        if (object.Parent) object.Parent.RemoveChild(object);
        object.Element.remove();
        object.Removed();
    }

    Removed() {
        const object = this;
        object.OnRemove.Invoke(object, {});
        object.Trigger('remove');
    }

    //Layout Change
    get OnLayoutChange() { return this.onLayoutChange ?? (this.onLayoutChange = new Callback()); }
    //Property Change
    get OnPropertyChange() { return this.onPropertyChange ?? (this.onPropertyChange = new Callback()); }
    //Click
    get OnClick() { return this.onClick ?? (this.onClick = new Callback()); }
    get OnDblClick() { return this.onDblClick ?? (this.onDblClick = new Callback()); }
    //ContextMenu
    get OnContextMenu() { return this.onContextMenu ?? (this.onContextMenu = new Callback()); }
    // Focus
    get OnFocus() { return this.onFocus ?? (this.onFocus = new Callback()); }
    get OnBlur() { return this.onBlur ?? (this.onBlur = new Callback()); }
    //Mouse
    get OnMouseWheel() { return this.onMouseWheel ?? (this.onMouseWheel = new Callback()); }
    get OnMouseDown() { return this.onMouseDown ?? (this.onMouseDown = new Callback()); }
    get OnMouseUp() { return this.onMouseUp ?? (this.onMouseUp = new Callback()); }
    get OnMouseEnter() { return this.onMouseEnter ?? (this.onMouseEnter = new Callback()); }
    get OnMouseMove() { return this.onMouseMove ?? (this.onMouseMove = new Callback()); }
    get OnMouseOver() { return this.onMouseOver ?? (this.onMouseOver = new Callback()); }
    get OnMouseLeave() { return this.onMouseLeave ?? (this.onMouseLeave = new Callback()); }
    //Touch
    get OnTouchStart() { return this.onTouchStart ?? (this.onTouchStart = new Callback()); }
    get OnTouchMove() { return this.onTouchMove ?? (this.onTouchMove = new Callback()); }
    get OnTouchEnd() { return this.onTouchEnd ?? (this.onTouchEnd = new Callback()); }
    get OnTouchCancel() { return this.onTouchCancel ?? (this.onTouchCancel = new Callback()); }
    //Drag
    get OnDragStart() { return this.onDragStart ?? (this.onDragStart = new Callback()); }
    get OnDragEnter() { return this.onDragEnter ?? (this.onDragEnter = new Callback()); }
    get OnDragOver() { return this.onDragOver ?? (this.onDragOver = new Callback()); }
    get OnDragLeave() { return this.onDragLeave ?? (this.onDragLeave = new Callback()); }
    get OnDrop() { return this.onDrop ?? (this.onDrop = new Callback()); }
    //Key
    get OnKeyDown() { return this.onKeyDown ?? (this.onKeyDown = new Callback()); }
    get OnKeyUp() { return this.onKeyUp ?? (this.onKeyUp = new Callback()); }
    //Remove
    get OnRemove() { return this.onRemove ?? (this.onRemove = new Callback()); }

    Dispose() {
        if (this.isDisposed) return;

        const object = this;
        if (object._properties) Object.keys(object._properties).forEach(function (key) { object._properties[key].Dispose(); });
        object.Element.remove();
        object.Element.view = null;
        super.Dispose();
    }

}

class Audio extends View {

    get ElementTag() { return 'audio'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Source', data.source ?? null, function (property, oldValue, newValue) {
            object.Attr('src', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}

class Canvas extends View {

    get ElementTag() { return 'canvas'; }

    get OnDraw() { return this.onDraw ?? (this.onDraw = new Callback()); }
    get Context() { return this.context ?? (this.context = this.Element.getContext('2d')); }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        if (data.onDraw) object.OnDraw.Listen(data.onDraw);
    }

    Draw() {
        let object = this;
        object.ClearRect(0, 0, object.Element.width, object.Element.height);
        object.OnDraw.Invoke(object, object.Context);
    }

    ClearRect(x, y, w, h) {
        let object = this;
        object.Context.clearRect(x, y, w, h);
    }

    DrawImage(image, x, y, width, height) {
        let object = this;
        object.Context.drawImage(image, x, y, width, height);
    }

}

class Editable extends View {

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
        events.input = function (sender, event) {
            object.Value = object.Element.innerHTML;
            object.OnInput.Invoke(object, event);
        };
        events.blur = function (sender, event) {
            object.Value = object.Element.innerHTML;
            object.OnBlur.Invoke(object, event);
        };
        return events;
    }

    get OnInput() { return this.onInput ?? (this.onInput = new Callback()); }
    get OnChange() { return this.onChange ?? (this.onChange = new Callback()); }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Value', data.value ?? '', function (property, oldValue, newValue) {
            if (object.Element.innerHTML != newValue) object.Element.innerHTML = newValue;
            object.OnPropertyChanged(property);
        });

        new Property(object, 'Placeholder', data.placeholder ?? '', function (property, oldValue, newValue) {
            object.Prop('placeholder', newValue);
            object.OnPropertyChanged(property);
        });

        if (data.onInput) object.OnInput.Listen(data.onInput);
        if (data.onChange) object.OnChange.Listen(data.onChange);

        object.Listen('blur', function (sender, event) {
            object.OnChange.Invoke(sender, event);
        });
    }

}

class Hr extends View {

    get ElementTag() { return 'hr'; }

}

class IFrame extends View {

    get ElementTag() { return 'iframe'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'Source', data.source ?? '', function (property, oldValue, newValue) {
            object.Attr('src', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}

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

class Input extends View {

    get ElementTag() { return 'input'; }
    get ElementEvents() {
        let events = super.ElementEvents;
        let object = this;
        events.input = function (sender, event) {
            object.Value = object.Element.value;
            object.OnInput.Invoke(object, event);
        };
        events.change = function (sender, event) {
            object.Value = object.Element.value;
            object.OnChange.Invoke(object, event);
        };
        events.paste = function (sender, event) {
            object.Value = object.Element.value;
            object.OnPaste.Invoke(object, event);
        };
        return events;
    }

    get OnInput() { return this.onInput ?? (this.onInput = new Callback()); }
    get OnChange() { return this.onChange ?? (this.onChange = new Callback()); }
    get OnPaste() { return this.onPaste ?? (this.onPaste = new Callback()); }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Autocomplete', data.autocomplete ?? 'bday', function (property, oldValue, newValue) {
            object.Attr('autocomplete', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Value', data.value ?? null, function (property, oldValue, newValue) {
            object.Prop('value', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Placeholder', data.placeholder ?? null, function (property, oldValue, newValue) {
            object.Prop('placeholder', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Type', data.type ?? null, function (property, oldValue, newValue) {
            object.Prop('type', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        if (data.onInput) object.OnInput.Listen(data.onInput);
        if (data.onChange) object.OnChange.Listen(data.onChange);
        if (data.onPaste) object.OnPaste.Listen(data.onPaste);
    }

}

class Layout extends View {

    get ElementTag() { return 'layout'; }

    Init(data = {}) {
        super.Init(data);

        const object = this;
        object.childrenLoop = data.childrenLoop ?? null;
        object.children = [];
        object.Children = data.children;

        new Property(object, 'Direction', data.direction ?? null, function (property, oldValue, newValue) {
            object.Css('flex-direction', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

    get Children() {
        const object = this;
        return object.children ?? (object.children = []);
    }

    set Children(newChildren) {
        const object = this;
        object.SetChildren(newChildren);
    }

    SetChildren(newChildren, useChildrenLoop = true, dispose = false) {
        const object = this;
        object.Clear(dispose);
        if (newChildren instanceof View) {
            object.AttachChild(newChildren);
        } else if (Array.isArray(newChildren)) {
            newChildren.forEach(function (newChild, index) {
                if (useChildrenLoop && object.childrenLoop) newChild = object.childrenLoop(newChild, index);
                if (newChild) object.AttachChild(newChild);
            });
        } else if (newChildren instanceof Object) {
            Object.keys(newChildren).forEach(function (key, index) {
                let newChild = newChildren[key];
                if (useChildrenLoop && object.childrenLoop) newChild = object.childrenLoop(newChild, key, index);
                if (newChild) object.AttachChild(newChild);
            });
        }
    }

    Clear(dispose = false) {
        const object = this;
        object.Element.innerHTML = null;
        object.Children.forEach(function (child) {
            if (!child) return;
            if (dispose && child.Dispose) child.Dispose();
            else if (child.Remove) child.Remove();
        });
        object.children = [];
    }

    AddChild(child, index = -1) {
        const object = this;
        return object.AttachChild(child, index);
    }

    RemoveChild(child) {
        const object = this;
        return object.DetachChild(child);
    }

    AttachChild(child, index = -1) {
        const object = this;

        if (!object.Element || !object.Element.appendChild) return false;
        if (!child || !child.Element) return false;

        if (child.Parent) child.Parent.RemoveChild(child);

        if (index == 0) object.Children.unshift(child);
        else if (index > 0) object.Children.splice(index, 0, child);
        else object.Children.push(child);

        if (index == 0) object.Element.prepend(child.Element);
        else if (index > 0 && object.Children[index - 1]) object.Children[index - 1].Element.after(child.Element);
        else object.Element.appendChild(child.Element);

        object.OnLayoutChange.Invoke(object, {});
        child.Parent = object;
        return true;

    }

    DetachChild(child) {
        const object = this;
        const index = object.Children.indexOf(child);
        object.Children.splice(index, 1);
        object.OnLayoutChange.Invoke(object, {});
        child.Element.remove();
        child.Parent = object;
        return true;
    }

    Dispose() {
        if (this.isDisposed) return;

        const object = this;
        for (let child of object.children) child.Dispose();
        super.Dispose();
    }

}

class List extends Layout {

    get ElementTag() { return 'ul'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'ListStyleType', data.listStyleType ?? null, function (property, oldValue, newValue) {
            object.Css('list-style-type', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'ListStyleImage', data.listStyleImage ?? null, function (property, oldValue, newValue) {
            object.Css('list-style-image', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'ListStylePosition', data.listStylePosition ?? null, function (property, oldValue, newValue) {
            object.Css('list-style-position', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}

class ListItem extends Layout {

    get ElementTag() { return 'li'; }

}

class Loading extends View {

    get ElementTag() { return 'loading'; }

    Init(data = {}) {
        data.aspectRatio = 1;
        super.Init(data);
        let object = this;
    }

}

class Output extends View {

    get ElementTag() { return 'output'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Value', data.value ?? '', function (property, oldValue, newValue) {
            object.Prop('value', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}

class Progress extends View {

    get ElementTag() { return 'progress'; }

}

class SelectOption extends View {

    get ElementTag() { return 'option'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Text', data.text ?? '', function (property, oldValue, newValue) {
            object.Prop('text', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Value', data.value ?? '', function (property, oldValue, newValue) {
            object.Prop('value', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}

class Text extends View {

    get ElementTag() { return 'text'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Text', data.text ?? '', function (property, oldValue, newValue) {
            object.InnerHTML = newValue;
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}

class Textarea extends View {

    get ElementTag() { return 'textarea'; }
    get ElementEvents() {
        let events = super.ElementEvents;
        let object = this;
        events.input = function (sender, event) {
            object.Value = object.Element.value;
            object.OnInput.Invoke(object, event);
        };
        events.change = function (sender, event) {
            object.Value = object.Element.value;
            object.OnChange.Invoke(object, event);
        };
        events.paste = function (sender, event) {
            object.Value = object.Element.value;
            object.OnPaste.Invoke(object, event);
        };
        return events;
    }

    get OnInput() { return this.onInput ?? (this.onInput = new Callback()); }
    get OnChange() { return this.onChange ?? (this.onChange = new Callback()); }
    get OnPaste() { return this.onPaste ?? (this.onPaste = new Callback()); }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Value', data.value ?? '', function (property, oldValue, newValue) {
            object.Prop('value', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Placeholder', data.placeholder ?? '', function (property, oldValue, newValue) {
            object.Prop('placeholder', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Rows', data.rows ?? '5', function (property, oldValue, newValue) {
            object.Prop('rows', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        if (data.onInput) object.OnInput.Listen(data.onInput);
        if (data.onChange) object.OnChange.Listen(data.onChange);
        if (data.onPaste) object.OnPaste.Listen(data.onPaste);

        object.Listen('keydown', function (sender, event) {
            if (event.key == 'Enter' && !(event.ctrlKey || event.shiftKey)) {
                event.preventDefault();
                object.Element.blur();
            } else {
            }
        });
    }

}

class Video extends View {

    get ElementTag() { return 'video'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'Source', data.source ?? '', function (property, oldValue, newValue) {
            object.Attr('src', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}

class Checkbox extends Input {

    get ElementEvents() {
        let events = super.ElementEvents;
        let object = this;
        events.change = function (sender, event) {
            object.Checked = object.Element.checked;
            object.OnChange.Invoke(object, event);
        };
        return events;
    }

    Init(data = {}) {
        data.type = data.type ?? 'checkbox';
        super.Init(data);
        let object = this;

        new Property(object, 'Checked', data.checked ?? false, function (property, oldValue, newValue) {
            object.Prop('checked', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}

class InputNumber extends Input {

    Init(data = {}) {
        data.type = data.type ?? 'number';
        super.Init(data);
        let object = this;

        new Property(object, 'Min', data.min ?? null, function (property, oldValue, newValue) {
            object.Prop('min', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Max', data.max ?? null, function (property, oldValue, newValue) {
            object.Prop('max', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Step', data.step ?? 1, function (property, oldValue, newValue) {
            object.Prop('step', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}

class Slider extends Input {

    Init(data = {}) {
        data.type = data.type ?? 'slider';
        super.Init(data);
        let object = this;

        new Property(object, 'Min', data.min ?? null, function (property, oldValue, newValue) {
            object.Prop('min', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Max', data.max ?? null, function (property, oldValue, newValue) {
            object.Prop('max', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Step', data.step ?? 1, function (property, oldValue, newValue) {
            object.Prop('step', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
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

class DataList extends Layout {

    get ElementTag() { return 'datalist'; }

}

class Form extends Layout {

    get ElementTag() { return 'form'; }
    get ElementEvents() {
        let events = super.ElementEvents;
        let object = this;
        events.submit = function (sender, event) {
            event.preventDefault();
            event.stopPropagation();
            object.OnSubmit.Invoke(object, event);
        };
        return events;
    }

    get OnSubmit() { return this.onSubmit ?? (this.onSubmit = new Callback()); }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Action', data.action ?? null, function (property, oldValue, newValue) {
            object.Prop('action', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
        new Property(object, 'Method', data.method ?? null, function (property, oldValue, newValue) {
            object.Prop('method', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
        new Property(object, 'Enctype', data.enctype ?? 'multipart/form-data', function (property, oldValue, newValue) {
            object.Prop('enctype', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        if (data.onSubmit) object.OnSubmit.Listen(data.onSubmit);
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

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Target', data.target ?? null, function (property, oldValue, newValue) {
            object.Attr('target', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Href', data.href ?? null, function (property, oldValue, newValue) {
            object.Attr('href', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Download', data.download ?? null, function (property, oldValue, newValue) {
            object.Attr('download', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}

class Main extends Layout {

    get ElementTag() { return 'main'; }

}

class Page extends Layout {

    get ElementTag() { return 'page'; }
    get ContentView() {
        return this.contentView ?? (this.contentView = new Main({
            classes: ['page-main'],
        }));
    }
    get OnPush() { return this.onPush ?? (this.onPush = new Callback()); }
    get OnPull() { return this.onPull ?? (this.onPull = new Callback()); }

    Init(data = {}) {
        data.classes = ['page', ...data.classes ?? []];
        super.Init(data);
        const object = this;

        new Property(object, 'Content', data.content ?? [], function (property, oldValue, newValue) {
            object.ContentView.Children = Array.isArray(newValue) ? newValue : [];
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'InAnimation', data.inAnimation ?? new Anim(data.inDuration ?? 250, function (sender, data) {
            if (object.InStep) object.InStep(object, data);
        }, function (sender, data) {
            if (object.InEnd) object.InEnd(object, data);
        }));
        new Property(object, 'OutAnimation', data.outAnimation ?? new Anim(data.outDuration ?? 250, function (sender, data) {
            if (object.OutStep) object.OutStep(object, data);
        }, function (sender, data) {
            if (object.OutEnd) object.OutEnd(object, data);
        }));

        new Property(object, 'InStep', data.inStep ?? function (sender, data) {
            let opacity = data.t;
            let scale = Math.Lerp(0.9, 1, data.t);
            sender.Opacity = opacity;
            sender.ContentView.Transform = `scale(${scale})`;
        });
        new Property(object, 'InEnd', data.inEnd ?? function (sender, data) {
            sender.Opacity = null;
        });

        new Property(object, 'OutStep', data.outStep ?? function (sender, data) {
            let opacity = data.i;
            let scale = Math.Lerp(1, 0.9, data.t);
            sender.Opacity = opacity;
            sender.ContentView.Transform = `scale(${scale})`;
        });
        new Property(object, 'OutEnd', data.outEnd ?? function (sender, data) {
            sender.Remove();
        });

        if (data.onPush) object.OnPush.Listen(data.onPush);
        if (data.onPull) object.OnPull.Listen(data.onPull);
    }

    Bind() {
        super.Bind();
        const object = this;

        new Binding(object, 'Parent', function (sender, data) {
            if (object.Parent) object.Push();
        });
    }

    Render() {
        const object = this;
        object.Children = [
            object.ContentView,
        ];
    }

    GetHistory() {
        const object = this;
        return {
            class: object.constructor.name,
        };
    }

    Push() {
        const object = this;
        object.OnPush.Invoke(object, {});
        if (object.OutAnimation) object.OutAnimation.Stop();
        if (object.InAnimation) object.InAnimation.Start();
    }

    Pull(dispose = false) {
        const object = this;

        if (object.InAnimation) object.InAnimation.Stop();
        if (object.OutAnimation) object.OutAnimation.Start();
        else object.Remove();

        object.OnPull.Invoke(object, {
            dispose: dispose,
        });

        if (dispose) setTimeout(function () {
            object.Dispose();
        }, 5000);
    }

}

class Row extends Layout {

    get ElementTag() { return 'row'; }

}

class Select extends Layout {

    get ElementTag() { return 'select'; }
    get ElementEvents() {
        let events = super.ElementEvents;
        let object = this;
        events.change = function (sender, event) {
            object.Value = object.Element.value;
            object.OnChange.Invoke(object, event);
        };
        return events;
    }

    get OnChange() { return this.onChange ?? (this.onChange = new Callback()); }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Value', data.value ?? '', function (property, oldValue, newValue) {
            object.Prop('value', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        if (data.onChange) object.OnChange.Listen(data.onChange);
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

class Td extends Layout {

    get ElementTag() { return 'td'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Colspan', data.colspan ?? null, function (property, oldValue, newValue) {
            object.Attr('colspan', object.Colspan);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Rowspan', data.rowspan ?? null, function (property, oldValue, newValue) {
            object.Attr('rowspan', object.Rowspan);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}

class Tr extends Layout {

    get ElementTag() { return 'tr'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Listen('mousedown', function (sender, event) {
            if (event.ctrlKey && sender.CanSelect) {
                event.preventDefault();
                event.stopPropagation();
                sender.IsSelected = !sender.IsSelected;
            }
        });
    }

}

class Th extends Td {

    get ElementTag() { return 'th'; }

}

class App extends Layout {

    static {
        App.v2 = false;
        App.v2Prevent = [
            'submit',
            // 'click', 'mousedown', 'mouseup',
            // 'dragmove', 'dragenter', 'dragover', 'dragstart', 'dragleave',
            'drop',
        ];
    }

    get ElementTag() { return 'app'; }

    get OnLoad() { return this.onLoad ?? (this.onLoad = new Callback()); }
    get OnResize() { return this.onResize ?? (this.onResize = new Callback()); }

    Init(data = {}) {
        super.Init(data);
        const object = this;
        App.Instance = object;

        new Property(object, 'Title', data.title ?? 'App', function (property, oldValue, newValue) {
            document.title = newValue;
            object.OnPropertyChanged(property, oldValue, newValue);
        });
        new Property(object, 'Description', data.description ?? '', object.OnPropertyChanged);

        if (App.v2) {
            console.log('App.v2');
            for (let event of App.v2Prevent) window.addEventListener(event, function (event) { event.preventDefault(); event.stopPropagation(); });
        } else console.log('App.v1');

        if (data.body) {
            data.body.appendChild(object.Element);
            object.Loaded();
            object.OnLoad.Invoke(object, data.event ?? null);
        } else {
            window.addEventListener('DOMContentLoaded', function (event) {
                document.body.appendChild(object.Element);
                object.Loaded();
                object.OnLoad.Invoke(object, event);
            });
        }

        window.addEventListener('resize', function (event) {
            object.OnResize.Invoke(object, event);
        });
    }

    Loaded() {
        const object = this;
    }
}

class LoadingPage extends Page {

    Init(data = {}) {
        data.alignItems = 'center';
        data.justifyContent = 'center';
        super.Init(data);
    }

    Render() {
        const object = this;
        object.Children = new Loading({
            width: '4rem', maxWidth: '100%',
        });
    }

}

class Navigator extends Layout {

    static {
        const object = this;
        window.addEventListener('popstate', function (event) {
            event.preventDefault();
            if (object.Instance.Children.length <= 1) return;
            object.Pop();
        });
    }

    static get Instance() {
        const object = this;
        return object.instance ?? (object.instance = new Navigator());
    }

    static Push(page) {
        const object = this;
        object.Instance.AddChild(page);
        if (page.GetHistory) window.history.pushState(page.GetHistory(), '');
    }

    static PushAfter(page, after) {
        const object = this;
        object.Instance.AddChild(page);
    }

    static Pop(page = null, dispose = false) {
        const object = this;
        let index = page ? object.Instance.Children.indexOf(page) : object.Instance.Children.length - 1;
        if (index >= 0) object.Instance.Children[index].Pull(dispose);
    }

    static PopTo(index = 1, dispose = false) {
        const object = this;
        for (let page of object.Instance.Children) object.Pop(page, dispose);
    }

    static Clear(dispose = false) {
        const object = this;
        for (let page of object.Instance.Children) object.Pop(page, dispose);
    }

    get ElementTag() {
        return 'navigator';
    }

    Render() {
        let object = this;
        if (App.Instance) App.Instance.AddChild(object);
        else document.body.appendChild(object.Element);
    }

}
