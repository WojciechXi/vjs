class View extends Bindable {

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

        new Property(object, 'Parent', data.parent ?? null, object.OnPropertyChanged);
        new Property(object, 'Classes', data.classes ?? [], object.OnPropertyChanged);
        new Property(object, 'Id', data.id ?? null, object.OnPropertyChanged);
        new Property(object, 'Name', data.name ?? null, object.OnPropertyChanged);
        new Property(object, 'Tooltip', data.tooltip ?? null, object.OnPropertyChanged);
        new Property(object, 'CanSelect', data.canSelect ?? false, object.OnPropertyChanged);
        new Property(object, 'IsSelected', data.isSelected ?? false, object.OnPropertyChanged);
        new Property(object, 'Disabled', data.disabled ?? null, object.OnPropertyChanged);
        new Property(object, 'Draggable', data.draggable ?? null, object.OnPropertyChanged);
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
        new Binding(object, 'Parent', function (sender, data) {
            if (object.Parent) {
                object.Parent.Element.appendChild(object.Element);
            } else {
                object.Element.remove();
                object.Removed();
            }
        });
        new Binding(object, 'Classes', function (sender, data) { object.Attr('class', data.value ? (Array.isArray(data.value) ? data.value.join(' ') : data.value) : null); });
        new Binding(object, 'Id', function (sender, data) { object.Attr('id', object.Id); });
        new Binding(object, 'Name', function (sender, data) { object.Attr('name', object.Name); });
        new Binding(object, 'Tooltip', function (sender, data) { object.Attr('title', object.Tooltip); });
        new Binding(object, 'Disabled', function (sender, data) { object.Attr('disabled', object.Disabled); });
        new Binding(object, 'Draggable', function (sender, data) { object.Attr('draggable', object.Draggable); });
        new Binding(object, 'Multiple', function (sender, data) { object.Attr('multiple', object.Multiple); });
        new Binding(object, 'CanSelect', function (sender, data) { object.Attr('selectable', object.CanSelect ? true : null); });
        new Binding(object, 'IsSelected', function (sender, data) { object.Attr('is-selected', object.IsSelected ? true : null); });
        new Binding(object, 'BackgroundColor', function (sender, data) { object.Css('background-color', object.BackgroundColor); });
        new Binding(object, 'BackgroundImage', function (sender, data) { object.Css('background-image', object.BackgroundImage); });
        new Binding(object, 'BackgroundSize', function (sender, data) { object.Css('background-size', object.BackgroundSize); });
        new Binding(object, 'BackgroundRepeat', function (sender, data) { object.Css('background-repeat', object.BackgroundRepeat); });
        new Binding(object, 'BackgroundPosition', function (sender, data) { object.Css('background-position', object.BackgroundPosition); });
        new Binding(object, 'BackgroundAttachment', function (sender, data) { object.Css('background-attachment', object.BackgroundAttachment); });
        new Binding(object, 'BorderLeft', function (sender, data) { object.Css('border-left', object.BorderLeft); });
        new Binding(object, 'BorderTop', function (sender, data) { object.Css('border-top', object.BorderTop); });
        new Binding(object, 'BorderRight', function (sender, data) { object.Css('border-right', object.BorderRight); });
        new Binding(object, 'BorderBottom', function (sender, data) { object.Css('border-bottom', object.BorderBottom); });
        new Binding(object, 'Border', function (sender, data) { object.Css('border', object.Border); });
        new Binding(object, 'BorderWidth', function (sender, data) { object.Css('border-width', object.BorderWidth); });
        new Binding(object, 'BorderStyle', function (sender, data) { object.Css('border-style', object.BorderStyle); });
        new Binding(object, 'BorderColor', function (sender, data) { object.Css('border-color', object.BorderColor); });
        new Binding(object, 'BorderWidth', function (sender, data) { object.Css('border-width', object.BorderWidth); });
        new Binding(object, 'BorderRadius', function (sender, data) { object.Css('border-radius', object.BorderRadius, 'rem'); });
        new Binding(object, 'Display', function (sender, data) { object.Css('display', data.value); });
        new Binding(object, 'BoxShadow', function (sender, data) { object.Css('box-shadow', object.BoxShadow); });
        new Binding(object, 'PointerEvents', function (sender, data) { object.Css('pointer-events', object.PointerEvents); });
        new Binding(object, 'Cursor', function (sender, data) { object.Css('cursor', data.value); });
        new Binding(object, 'Opacity', function (sender, data) { object.Css('opacity', data.value); });
        new Binding(object, 'TextOverflow', function (sender, data) { object.Css('text-overflow', object.TextOverflow); });
        new Binding(object, 'Overflow', function (sender, data) { object.Css('overflow', object.Overflow); });
        new Binding(object, 'AlignSelf', function (sender, data) { object.Css('align-self', object.AlignSelf); });
        new Binding(object, 'AlignItems', function (sender, data) { object.Css('align-items', object.AlignItems); });
        new Binding(object, 'JustifyContent', function (sender, data) { object.Css('justify-content', data.value); });
        new Binding(object, 'FlexGrow', function (sender, data) { object.Css('flex-grow', data.value); });
        new Binding(object, 'FlexShrink', function (sender, data) { object.Css('flex-shrink', data.value); });
        new Binding(object, 'FlexWrap', function (sender, data) { object.Css('flex-wrap', data.value); });
        new Binding(object, 'FlexOrder', function (sender, data) { object.Css('order', object.FlexOrder); });
        new Binding(object, 'Gap', function (sender, data) { object.Css('gap', data.value, 'rem'); });
        new Binding(object, 'Resize', function (sender, data) { object.Css('resize', object.Resize); });
        new Binding(object, 'Position', function (sender, data) { object.Css('position', data.value); });
        new Binding(object, 'ZIndex', function (sender, data) { object.Css('z-index', data.value); });
        new Binding(object, 'Left', function (sender, data) { object.Css('left', data.value, 'px'); });
        new Binding(object, 'Top', function (sender, data) { object.Css('top', data.value, 'px'); });
        new Binding(object, 'Right', function (sender, data) { object.Css('right', data.value, 'px'); });
        new Binding(object, 'Bottom', function (sender, data) { object.Css('bottom', data.value, 'px'); });
        new Binding(object, 'Outline', function (sender, data) { object.Css('outline', data.value); });
        new Binding(object, 'Margin', function (sender, data) { object.Css('margin', data.value, 'rem'); });
        new Binding(object, 'Padding', function (sender, data) { object.Css('padding', data.value, 'rem'); });
        new Binding(object, 'MinWidth', function (sender, data) { object.Css('min-width', data.value, 'px'); });
        new Binding(object, 'Width', function (sender, data) { object.Css('width', data.value, 'px'); });
        new Binding(object, 'MaxWidth', function (sender, data) { object.Css('max-width', data.value, 'px'); });
        new Binding(object, 'MinHeight', function (sender, data) { object.Css('min-height', data.value, 'px'); });
        new Binding(object, 'Height', function (sender, data) { object.Css('height', data.value, 'px'); });
        new Binding(object, 'MaxHeight', function (sender, data) { object.Css('max-height', data.value, 'px'); });
        new Binding(object, 'AspectRatio', function (sender, data) { object.Css('aspect-ratio', data.value); });
        new Binding(object, 'Color', function (sender, data) { object.Css('color', data.value); });
        new Binding(object, 'LineHeight', function (sender, data) { object.Css('line-height', data.value); });
        new Binding(object, 'VerticalAlign', function (sender, data) { object.Css('vertical-align', data.value); });
        new Binding(object, 'TextAlign', function (sender, data) { object.Css('text-align', data.value); });
        new Binding(object, 'TextTransform', function (sender, data) { object.Css('text-transform', data.value); });
        new Binding(object, 'TextIdent', function (sender, data) { object.Css('text-ident', data.value); });
        new Binding(object, 'LetterSpacing', function (sender, data) { object.Css('letter-spacing', data.value); });
        new Binding(object, 'WordSpacing', function (sender, data) { object.Css('word-spacing', data.value); });
        new Binding(object, 'WhiteSpace', function (sender, data) { object.Css('white-space', data.value); });
        new Binding(object, 'TextAlignLast', function (sender, data) { object.Css('text-align-last', data.value); });
        new Binding(object, 'TextDecoration', function (sender, data) { object.Css('text-decoration', data.value); });
        new Binding(object, 'TextShadow', function (sender, data) { object.Css('text-shadow', data.value); });
        new Binding(object, 'FontSize', function (sender, data) { object.Css('font-size', data.value, 'rem'); });
        new Binding(object, 'FontFamily', function (sender, data) { object.Css('font-family', data.value); });
        new Binding(object, 'FontStyle', function (sender, data) { object.Css('font-style', data.value); });
        new Binding(object, 'FontWeight', function (sender, data) { object.Css('font-weight', data.value); });
        new Binding(object, 'FontVariant', function (sender, data) { object.Css('font-variant', data.value); });
        new Binding(object, 'WritingMode', function (sender, data) { object.Css('writing-mode', data.value); });
        new Binding(object, 'Transition', function (sender, data) { object.Css('transition', object.Transition); });
        new Binding(object, 'Transform', function (sender, data) { object.Css('transform', object.Transform); });
    }
    Render() {
        const object = this;
    }
    SetParent(parent) {
        const object = this;
        if (object.Parent) object.Parent.RemoveChild(object);
        object.Parent = parent;
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
    get InnerHTML() { return this.element.innerHTML; }
    set InnerHTML(html) { return this.element.innerHTML = html; }
    get InnerText() { return this.element.innerText; }
    set InnerText(text) { return this.element.innerText = text; }
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
    Find(name) {
        const object = this;
        let element = object.Element.querySelector(`[name="${name}"]`);
        return element ? element.view : null;
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
    OnPropertyChanged(propertyName) {
        const object = this;
        object.OnPropertyChange.Invoke(object, propertyName);
    }
    OnLayoutChanged() {
        const object = this;
        object.OnLayoutChange.Invoke(object, {});
    }
    Remove() {
        const object = this;
        object.SetParent(null);
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