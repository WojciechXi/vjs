<?php
define('ApplicationPath', realpath(__DIR__));
define('ApplicationUrl', RootUrl . '/Application');

$application = new Application();

$application->Init();
$application->SetPath('Assets', RootPath . '/Assets');

$application->RegisterItem('Styles', 'Core', '/Assets/Styles/style.Core.css');
$application->RegisterItem('Scripts', 'Core', '/Assets/Scripts/script.Core.js');

$application->RegisterItem('Styles', 'Utility', '/Assets/Styles/style.Utility.css');
$application->RegisterItem('Scripts', 'Utility', '/Assets/Scripts/script.Utility.js');

$application->RegisterItem('Scripts', 'App', '/Assets/Scripts/script.App.js');
$application->RegisterItem('Scripts', 'App', '/Assets/Scripts/script.App.js');

$application->RegisterItem('Styles', 'Material', '/Assets/Styles/style.Material.css');
$application->RegisterItem('Scripts', 'Material', '/Assets/Scripts/script.Material.js');

// $application->Connect(data['host'], data['user'], data['password'], data['database']);

$application->Load();

$application->RegisterRoutes($application->GetPath('Routes'));

$application->Loaded();
$application->Process();

$application->Close();
