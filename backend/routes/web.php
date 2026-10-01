<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// API bridge: ensure all routes match whether accessed with or without /api prefix
require __DIR__.'/api.php';
