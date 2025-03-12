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