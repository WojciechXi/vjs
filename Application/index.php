<?php
define('ApplicationPath', realpath(__DIR__));
define('ApplicationUrl', RootUrl . '/Application');

$application = new Application();

$application->Init();

$application->RegisterItem('Styles', 'Core', '/Assets/Styles/style.Core.css');
$application->RegisterItem('Styles', 'Utility', '/Assets/Styles/style.Utility.css');
$application->RegisterItem('Styles', 'Theme', '/Assets/Styles/style.Theme.css');
$application->RegisterItem('Styles', 'App', '/Assets/Styles/style.App.css');

$application->RegisterItem('Scripts', 'Core', '/Assets/Scripts/script.Core.js');
$application->RegisterItem('Scripts', 'Utility', '/Assets/Scripts/script.Utility.js');
$application->RegisterItem('Scripts', 'Theme', '/Assets/Scripts/script.Theme.js');
$application->RegisterItem('Scripts', 'App', '/Assets/Scripts/script.App.js');

// $application->Connect(data['host'], data['user'], data['password'], data['database']);

$application->Load();

$application->RegisterRoutes($application->GetPath('Routes'));

$application->Loaded();
$application->Process();

// $application->Close();