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

    Query(selector) {
        const object = this;
        const element = object.Element.querySelector(selector);
        return element ? element.view : null;
    }

    QueryAll(selector) {
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
        const object = this;
        if (object._properties) Object.keys(object._properties).forEach(function (key) { object._properties[key].Dispose(); });
        object.Element.remove();
        object.Element.view = null;
        super.Dispose();
    }

}