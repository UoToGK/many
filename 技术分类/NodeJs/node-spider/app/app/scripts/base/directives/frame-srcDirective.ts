// Created by uoto on 16/3/30.
import app from "../app";

/**
 * @examples
 *  <iframe frame-src="{{T.src}}"></iframe>
 *
 *  class TestCtrl{
 *    public src:string = '';
 *
 *    constructor(){
 *      this.src = 'http://host/to/path/to/file'
 *    }
 *  }
 */
app.directive('frameSrc', function () {
    return {
        link: function (scope, iframe, attr) {
            if (iframe.is('iframe')) {
                attr.$observe('iframeSrc', function (val) {
                    iframe.attr('src', val || '');
                });
            } else {
                console.warn('not iframe tag');
            }
        }
    }
});