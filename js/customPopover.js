angular.module('app').directive('customPopover', function () {
    return {
        restrict: 'A',
        template: '<span>{{label}}</span>',
        link: function (scope, el, attrs) {
            scope.label = attrs.popoverLabel;
            $(el).popover({
                trigger: 'hover',
                html: true,
                container: 'body',
                content: attrs.popoverImagesHtml,
                placement: attrs.popoverPlacement
            })
        }
    };
});


$("#kerberos-slideshow > div:gt(0)").hide();
setInterval(function() {
    $('#kerberos-slideshow > div:first')
        .fadeOut(0)
        .next()
        .fadeIn(0)
        .end()
        .appendTo('#kerberos-slideshow');
},  200);

