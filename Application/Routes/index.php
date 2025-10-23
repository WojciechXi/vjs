<?php
$route->Get('/cron', function (Request $request) {
    Hook::Invoke(Cron::class);
}, function (Request $request) {
    return $request->Get('token') == 'X1iD9zIC5MSLRktt';
});

$route->Get('/compile', function (Request $request, Response $response) {
    new ScriptCompiler($this->GetPath('Resources', 'Core/Scripts'), $this->GetPath('Assets', 'Scripts/script.Core.js'), $this);
    new ScriptCompiler($this->GetPath('Resources', 'Utility/Scripts'), $this->GetPath('Assets', 'Scripts/script.Utility.js'), $this);
    new ScriptCompiler($this->GetPath('Resources', 'App/Scripts'), $this->GetPath('Assets', 'Scripts/script.App.js'), $this);
    new ScriptCompiler($this->GetPath('Resources', 'Material/Scripts'), $this->GetPath('Assets', 'Scripts/script.Material.js'), $this);

    new ScriptCompiler($this->GetPath('Resources', 'Core/Styles'), $this->GetPath('Assets', 'Styles/style.Core.css'), $this);
    new ScriptCompiler($this->GetPath('Resources', 'Utility/Styles'), $this->GetPath('Assets', 'Styles/style.Utility.css'), $this);
    new ScriptCompiler($this->GetPath('Resources', 'App/Styles'), $this->GetPath('Assets', 'Styles/style.App.css'), $this);
    new ScriptCompiler($this->GetPath('Resources', 'Material/Styles'), $this->GetPath('Assets', 'Styles/style.Material.css'), $this);
}, function (Request $request) {
    return $request->Get('token') == 'X1iD9zIC5MSLRktt';
});

$route->Get('*', function (Request $request, Response $response) {
    return $response->Html($this->View('Index', []));
});
