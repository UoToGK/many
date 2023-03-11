/// <reference path="../../../flow/typings/ElectronWebView.d.ts" />
import app from '../../app';

app.directive('loading', function() {
	return {
		restrict: 'E',
		templateUrl: __dirname + './loading.html',
		scope: false
	};
});