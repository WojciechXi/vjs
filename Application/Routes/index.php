<?php
$route->Get('/cron', function (Request $request) {
    Hook::Invoke(Cron::class);
}, function (Request $request) {
    return $request->Get('token') == 'X1iD9zIC5MSLRktt';
}, null, 10);

$route->Get('/migration', function (Request $request, Response $response) {
    Migration::Migrate();
}, function (Request $request) {
    return $request->Get('token') == 'X1iD9zIC5MSLRktt';
}, null, 10);

$route->Get('/compile', function (Request $request, Response $response) {
    new ScriptCompiler($this->GetPath('Resources', 'Core/Scripts'), $this->GetPath('Assets', 'Scripts/script.Core.js'), $this);
    new ScriptCompiler($this->GetPath('Resources', 'Utility/Scripts'), $this->GetPath('Assets', 'Scripts/script.Utility.js'), $this);
    new ScriptCompiler($this->GetPath('Resources', 'Theme/Scripts'), $this->GetPath('Assets', 'Scripts/script.Theme.js'), $this);
    new ScriptCompiler($this->GetPath('Resources', 'App/Scripts'), $this->GetPath('Assets', 'Scripts/script.App.js'), $this);

    new ScriptCompiler($this->GetPath('Resources', 'Core/Styles'), $this->GetPath('Assets', 'Styles/style.Core.css'), $this);
    new ScriptCompiler($this->GetPath('Resources', 'Utility/Styles'), $this->GetPath('Assets', 'Styles/style.Utility.css'), $this);
    new ScriptCompiler($this->GetPath('Resources', 'Theme/Styles'), $this->GetPath('Assets', 'Styles/style.Theme.css'), $this);
    new ScriptCompiler($this->GetPath('Resources', 'App/Styles'), $this->GetPath('Assets', 'Styles/style.App.css'), $this);
}, function (Request $request) {
    return $request->Get('token') == 'X1iD9zIC5MSLRktt';
}, null, 10);

$route->Get('*', function (Request $request, Response $response) {
    return $response->Html($this->View('Index', [
        'body' => '<script>new TestApp();</script>'
    ]));
}, null, 10);
